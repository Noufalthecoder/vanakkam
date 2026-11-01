import { uploadImage, YouCamError } from '@/lib/youcam'

const MAX_BYTES = 10 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png']

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) return Response.json({ error: 'No image received.' }, { status: 400 })
    if (!TYPES.includes(file.type)) return Response.json({ error: 'Please use a JPG or PNG photo.' }, { status: 400 })
    if (file.size > MAX_BYTES) return Response.json({ error: 'Photo must be under 10 MB.' }, { status: 400 })

    const fileId = await uploadImage(await file.arrayBuffer(), file.type, file.name || 'selfie.jpg')
    return Response.json({ fileId })
  } catch (err) {
    const e = err instanceof YouCamError ? err : new YouCamError('Upload failed.')
    return Response.json({ error: e.message, code: e.code }, { status: e.status })
  }
}
