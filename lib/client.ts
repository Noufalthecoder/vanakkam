'use client'

type Feature = 'skin-analysis' | 'skin-tone-analysis' | 'makeup-vto'

const FRIENDLY: Record<string, string> = {
  error_src_face_too_small: 'Your face is too small in the frame — zoom in so it fills the oval.',
  error_src_face_out_of_bound: 'Part of your face is outside the frame — re-centre it in the oval.',
  error_lighting_dark: 'The photo is too dark — try facing a window.',
  error_below_min_image_size: 'That photo is too small — use one at least 480px wide.',
  error_no_face: 'We couldn’t find a face — use a clear, front-facing selfie.',
  error_face_not_found: 'We couldn’t find a face — use a clear, front-facing selfie.',
}

export class TaskError extends Error {
  constructor(public code: string, message?: string) {
    super(FRIENDLY[code] ?? message ?? 'Something went wrong. Please try again.')
  }
}

async function json<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new TaskError(body.code ?? 'http_error', body.error)
  return body as T
}

export async function uploadPhoto(blob: Blob) {
  const form = new FormData()
  form.append('file', blob, 'selfie.jpg')
  const { fileId } = await json<{ fileId: string }>(await fetch('/api/youcam/upload', { method: 'POST', body: form }))
  return fileId
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function runTask<T = unknown>(feature: Feature, fileId: string, payload: Record<string, unknown> = {}, timeoutMs = 120_000): Promise<T> {
  const { taskId } = await json<{ taskId: string }>(
    await fetch('/api/youcam/task', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feature, fileId, payload }) }),
  )
  const started = Date.now()
  let delay = 1200
  while (Date.now() - started < timeoutMs) {
    await wait(delay)
    delay = Math.min(delay + 400, 3000)
    const state = await json<{ status: string; results?: T; error?: string; message?: string }>(
      await fetch(`/api/youcam/task?feature=${feature}&id=${encodeURIComponent(taskId)}`, { cache: 'no-store' }),
    )
    if (state.status === 'success') return state.results as T
    if (state.status === 'error') throw new TaskError(state.error ?? 'task_error', state.message)
  }
  throw new TaskError('timeout', 'YouCam is taking too long — please try again.')
}

export async function renderLook(fileId: string, effects: Record<string, unknown>[]) {
  const res = await runTask<{ url?: string } | { download_url?: string }[]>('makeup-vto', fileId, { version: '1.0', effects })
  const url = Array.isArray(res) ? res[0]?.download_url : res?.url
  if (!url) throw new TaskError('no_output', 'Try-on finished without an image.')
  return url
}
