'use client'

import { Camera, ImagePlus, Lightbulb, RotateCcw, Sparkles, X, ZoomIn } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

const OUT_W = 900
const OUT_H = 1200
const SAMPLE = {
  url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&q=85&fm=jpg',
  focus: { x: 0.49, y: 0.34, zoom: 2.3 },
}

type Focus = { x: number; y: number; zoom: number }
type Source = { img: HTMLImageElement; focus?: Focus }

function loadImage(src: string, cors = false) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    if (cors) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load that image.'))
    img.src = src
  })
}

export function PhotoStep({ onDone, onBack }: { onDone: (blob: Blob, url: string) => void; onBack: () => void }) {
  const [source, setSource] = useState<Source | null>(null)
  const [camera, setCamera] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file?: File | null) => {
    setError(null)
    if (!file) return
    if (!/^image\/(jpeg|png|webp|heic)/.test(file.type)) return setError('Please choose a JPG or PNG photo.')
    const url = URL.createObjectURL(file)
    try {
      setSource({ img: await loadImage(url) })
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const useSample = async () => {
    setError(null)
    try {
      setSource({ img: await loadImage(SAMPLE.url, true), focus: SAMPLE.focus })
    } catch {
      setError('Could not load the sample photo — check your connection.')
    }
  }

  if (camera) return <CameraCapture onCancel={() => setCamera(false)} onCapture={async (url) => { setCamera(false); setSource({ img: await loadImage(url) }) }} />
  if (source) return <Framer source={source} onReset={() => setSource(null)} onDone={onDone} />

  return (
    <div>
      <StepHeading title="Let’s see you." body="A clear, front-facing selfie in natural light. Bare skin gives the most accurate scan." />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]) }}
        className={`mt-6 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-12 text-center transition ${dragOver ? 'border-accent bg-accent/5' : 'border-line bg-surface-2/50'}`}
      >
        <span className="grid size-14 place-items-center rounded-full bg-accent/10 text-accent"><ImagePlus size={24} /></span>
        <p className="mt-4 font-semibold">Drop a photo here</p>
        <p className="mt-1 text-sm text-muted">JPG or PNG, up to 10 MB</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn btn-primary" onClick={() => fileRef.current?.click()}><ImagePlus size={16} /> Choose photo</button>
          <button type="button" className="btn btn-ghost" onClick={() => setCamera(true)}><Camera size={16} /> Use camera</button>
        </div>
        <button type="button" onClick={useSample} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline">
          <Sparkles size={14} /> No selfie handy? Try a sample model
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>
      {error && <p role="alert" className="mt-3 text-sm font-semibold text-accent">{error}</p>}
      <ul className="mt-5 grid gap-2 text-sm text-muted sm:grid-cols-3">
        {['Face the light — a window is perfect', 'Hair off the forehead, no glasses', 'Neutral face, mouth closed'].map((t) => (
          <li key={t} className="flex items-start gap-2"><Lightbulb size={15} className="mt-0.5 shrink-0 text-marigold" /> {t}</li>
        ))}
      </ul>
      <div className="mt-8"><button type="button" onClick={onBack} className="text-sm font-semibold text-muted hover:text-ink">← Back</button></div>
    </div>
  )
}

export function StepHeading({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-display text-3xl font-medium tracking-tight">{title}</h3>
      <p className="mt-2 text-muted">{body}</p>
    </div>
  )
}

/* ─────────── Framing: pan + zoom inside a 3:4 frame with an oval guide ─────────── */

function Framer({ source, onReset, onDone }: { source: Source; onReset: () => void; onDone: (blob: Blob, url: string) => void }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [zoom, setZoom] = useState(source.focus?.zoom ?? 1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [busy, setBusy] = useState(false)
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null)
  const { img } = source

  const base = box.w ? Math.max(box.w / img.naturalWidth, box.h / img.naturalHeight) : 1
  const scale = base * zoom

  const clamp = useCallback(
    (x: number, y: number, s = scale) => ({
      x: Math.min(0, Math.max(box.w - img.naturalWidth * s, x)),
      y: Math.min(0, Math.max(box.h - img.naturalHeight * s, y)),
    }),
    [box, img, scale],
  )

  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Initial placement: centre on focus point (sample) or the image centre.
  useEffect(() => {
    if (!box.w) return
    const s = Math.max(box.w / img.naturalWidth, box.h / img.naturalHeight) * (source.focus?.zoom ?? 1)
    const fx = (source.focus?.x ?? 0.5) * img.naturalWidth * s
    const fy = (source.focus?.y ?? 0.42) * img.naturalHeight * s
    const x = Math.min(0, Math.max(box.w - img.naturalWidth * s, box.w / 2 - fx))
    const y = Math.min(0, Math.max(box.h - img.naturalHeight * s, box.h * 0.45 - fy))
    setPos({ x, y })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box.w, box.h, img])

  const setZoomAround = (z: number) => {
    const nz = Math.min(4, Math.max(1, z))
    const ns = base * nz
    const cx = box.w / 2
    const cy = box.h / 2
    const ix = (cx - pos.x) / scale
    const iy = (cy - pos.y) / scale
    setZoom(nz)
    setPos(clamp(cx - ix * ns, cy - iy * ns, ns))
  }

  const confirm = async () => {
    setBusy(true)
    const canvas = document.createElement('canvas')
    canvas.width = OUT_W
    canvas.height = OUT_H
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, -pos.x / scale, -pos.y / scale, box.w / scale, box.h / scale, 0, 0, OUT_W, OUT_H)
    canvas.toBlob((blob) => {
      setBusy(false)
      if (blob) onDone(blob, URL.createObjectURL(blob))
    }, 'image/jpeg', 0.92)
  }

  return (
    <div>
      <StepHeading title="Frame your face." body="Drag and zoom until your face fills the oval — this is what lets the AI read your skin precisely." />
      <div className="mt-6 grid items-start gap-6 sm:grid-cols-[minmax(0,320px)_1fr]">
        <div
          ref={frameRef}
          className="relative aspect-[3/4] w-full touch-none select-none overflow-hidden rounded-3xl bg-surface-2"
          style={{ cursor: drag.current ? 'grabbing' : 'grab' }}
          onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y } }}
          onPointerMove={(e) => { if (drag.current) setPos(clamp(drag.current.px + e.clientX - drag.current.x, drag.current.py + e.clientY - drag.current.y)) }}
          onPointerUp={() => { drag.current = null }}
        >
          {box.w > 0 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img.src} alt="Your photo" draggable={false} className="absolute left-0 top-0 max-w-none" style={{ width: img.naturalWidth * scale, height: img.naturalHeight * scale, transform: `translate(${pos.x}px, ${pos.y}px)` }} />
          )}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <mask id="oval-mask">
                <rect width="300" height="400" fill="white" />
                <ellipse cx="150" cy="180" rx="108" ry="142" fill="black" />
              </mask>
            </defs>
            <rect width="300" height="400" fill="rgba(20,12,14,.45)" mask="url(#oval-mask)" />
            <ellipse cx="150" cy="180" rx="108" ry="142" fill="none" stroke="#fff3d1" strokeWidth="2" strokeDasharray="6 6" />
          </svg>
          <span className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs font-semibold text-white drop-shadow">Face fills the oval</span>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="flex items-center gap-2 text-sm font-semibold"><ZoomIn size={16} /> Zoom</span>
            <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoomAround(Number(e.target.value))} className="mt-2 w-full" />
          </label>
          <ul className="space-y-2 text-sm text-muted">
            <li>• Chin near the bottom of the oval, hairline near the top.</li>
            <li>• Cheeks should almost touch the sides — the scan needs your face to fill most of the width.</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary" disabled={busy || !box.w} onClick={confirm}>Scan my face</button>
            <button type="button" className="btn btn-ghost" onClick={onReset}><RotateCcw size={15} /> Different photo</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────── Camera ─────────── */

function CameraCapture({ onCapture, onCancel }: { onCapture: (url: string) => void; onCancel: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let stream: MediaStream | undefined
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1440 }, height: { ideal: 1920 } }, audio: false })
      .then((s) => {
        stream = s
        if (videoRef.current) videoRef.current.srcObject = s
      })
      .catch(() => setError('Camera access was blocked. Allow it in your browser, or upload a photo instead.'))
    return () => stream?.getTracks().forEach((t) => t.stop())
  }, [])

  const snap = () => {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    const c = document.createElement('canvas')
    c.width = v.videoWidth
    c.height = v.videoHeight
    const ctx = c.getContext('2d')!
    ctx.translate(c.width, 0)
    ctx.scale(-1, 1) // keep it as the user saw it in the mirror preview
    ctx.drawImage(v, 0, 0)
    c.toBlob((b) => b && onCapture(URL.createObjectURL(b)), 'image/jpeg', 0.95)
  }

  const start = () => {
    let n = 3
    setCount(n)
    const t = setInterval(() => {
      n -= 1
      if (n === 0) {
        clearInterval(t)
        setCount(null)
        snap()
      } else setCount(n)
    }, 800)
  }

  return (
    <div>
      <StepHeading title="Smile — or don’t." body="Hold your phone at eye level, facing a window." />
      <div className="relative mx-auto mt-6 aspect-[3/4] max-w-sm overflow-hidden rounded-3xl bg-black">
        {error ? (
          <p className="grid h-full place-items-center p-6 text-center text-sm text-white">{error}</p>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
        )}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true">
          <ellipse cx="150" cy="180" rx="108" ry="142" fill="none" stroke="#fff3d1" strokeWidth="2" strokeDasharray="6 6" />
        </svg>
        {count !== null && <span className="absolute inset-0 grid place-items-center font-display text-8xl text-white drop-shadow-lg">{count}</span>}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" className="btn btn-ghost" onClick={onCancel}><X size={15} /> Cancel</button>
        <button type="button" className="btn btn-primary" disabled={!!error || count !== null} onClick={start}><Camera size={16} /> Take photo</button>
      </div>
    </div>
  )
}
