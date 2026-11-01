import { createTask, FEATURES, getTask, YouCamError, type Feature } from '@/lib/youcam'

function isFeature(value: unknown): value is Feature {
  return typeof value === 'string' && (FEATURES as readonly string[]).includes(value)
}

function fail(err: unknown) {
  const e = err instanceof YouCamError ? err : new YouCamError('Something went wrong talking to YouCam.')
  return Response.json({ error: e.message, code: e.code }, { status: e.status })
}

/** Start a task. Body: { feature, fileId, payload } — payload is merged with src_file_id. */
export async function POST(request: Request) {
  try {
    const { feature, fileId, payload } = await request.json()
    if (!isFeature(feature)) return Response.json({ error: 'Unknown feature.' }, { status: 400 })
    if (typeof fileId !== 'string' || !fileId) return Response.json({ error: 'Missing fileId.' }, { status: 400 })
    const taskId = await createTask(feature, { ...(payload ?? {}), src_file_id: fileId })
    return Response.json({ taskId })
  } catch (err) {
    return fail(err)
  }
}

/** Poll a task: /api/youcam/task?feature=…&id=… */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const feature = url.searchParams.get('feature')
    const id = url.searchParams.get('id')
    if (!isFeature(feature) || !id) return Response.json({ error: 'Missing feature or id.' }, { status: 400 })
    return Response.json(await getTask(feature, id))
  } catch (err) {
    return fail(err)
  }
}
