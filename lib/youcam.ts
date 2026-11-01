// Server-side only: imported exclusively from route handlers so the API key never reaches the browser.

const BASE = process.env.YOUCAM_API_BASE ?? 'https://yce-api-01.makeupar.com/s2s/v2.0'

export const FEATURES = ['skin-analysis', 'skin-tone-analysis', 'makeup-vto'] as const
export type Feature = (typeof FEATURES)[number]

export class YouCamError extends Error {
  constructor(message: string, public status = 502, public code?: string) {
    super(message)
  }
}

function apiKey() {
  const key = process.env.YOUCAM_API_KEY
  if (!key) throw new YouCamError('YOUCAM_API_KEY is not set on the server.', 500, 'missing_key')
  return key
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
    cache: 'no-store',
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json || json.status !== 200) {
    throw new YouCamError(json?.error ?? `YouCam request failed (${res.status})`, res.status >= 400 ? res.status : 502, json?.error_code)
  }
  return json.data as T
}

/** Registers a file with YouCam, uploads the bytes to the signed URL, returns its file_id. */
export async function uploadImage(bytes: ArrayBuffer, contentType: string, fileName: string) {
  const data = await call<{ files: { file_id: string; requests: { url: string; method: string; headers: Record<string, string> }[] }[] }>('/file', {
    method: 'POST',
    body: JSON.stringify({ files: [{ content_type: contentType, file_name: fileName, file_size: bytes.byteLength }] }),
  })
  const file = data.files[0]
  const req = file.requests[0]
  const put = await fetch(req.url, { method: req.method ?? 'PUT', headers: req.headers, body: bytes })
  if (!put.ok) throw new YouCamError(`Image upload failed (${put.status})`)
  return file.file_id
}

export async function createTask(feature: Feature, body: Record<string, unknown>) {
  const data = await call<{ task_id: string }>(`/task/${feature}`, { method: 'POST', body: JSON.stringify(body) })
  return data.task_id
}

export type TaskState = { status: 'running' } | { status: 'success'; results: unknown } | { status: 'error'; error: string; message?: string }

export async function getTask(feature: Feature, taskId: string): Promise<TaskState> {
  const data = await call<{ task_status: string; results: unknown; error: string | null; error_message?: string }>(
    `/task/${feature}/${encodeURIComponent(taskId)}`,
  )
  if (data.task_status === 'success') return { status: 'success', results: data.results }
  if (data.task_status === 'error') return { status: 'error', error: data.error ?? 'unknown_error', message: data.error_message }
  return { status: 'running' }
}
