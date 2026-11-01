'use client'

import { Check, Loader2, RotateCcw, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildProfile, OCCASIONS, parseSkin, parseTone, resolveLook, type Lighting, type Profile, type Tweaks } from '@/lib/beauty'
import { renderLook, runTask, TaskError, uploadPhoto } from '@/lib/client'
import { buildPlan } from '@/lib/plan'
import { useCart } from '@/lib/cart'
import { MomentStep } from './moment-step'
import { PhotoStep } from './photo-step'
import { BeautyDNA, LookStudio, PlanView, type LookState } from './results'

type Stage = 'moment' | 'photo' | 'scan' | 'results'
const STEPS: { id: Stage; label: string }[] = [
  { id: 'moment', label: 'Moment' },
  { id: 'photo', label: 'Selfie' },
  { id: 'scan', label: 'Scan' },
  { id: 'results', label: 'Your looks' },
]
const SKIN_ACTIONS = ['moisture', 'radiance', 'texture', 'pore', 'oiliness', 'dark_circle_v2', 'redness', 'acne', 'wrinkle', 'skin_type']

function inDays(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function Studio() {
  const [stage, setStage] = useState<Stage>('moment')
  const [occasionId, setOccasionId] = useState(OCCASIONS[0].id)
  const [date, setDate] = useState(inDays(30))
  const [lighting, setLighting] = useState<Lighting>(OCCASIONS[0].lighting)
  const [outfit, setOutfit] = useState<string | null>(null)
  const { setEventDate } = useCart()
  useEffect(() => setEventDate(date), [date, setEventDate])
  const [photo, setPhoto] = useState<{ blob: Blob; url: string } | null>(null)
  const [fileId, setFileId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [skinError, setSkinError] = useState<string | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [activeId, setActiveId] = useState(OCCASIONS[0].looks[0].id)
  const [tweaks, setTweaks] = useState<Record<string, Tweaks>>({})
  const [looks, setLooks] = useState<Record<string, LookState>>({})
  const looksRef = useRef(looks)
  looksRef.current = looks
  const inflight = useRef(new Set<string>())
  const topRef = useRef<HTMLDivElement>(null)

  const occasion = OCCASIONS.find((o) => o.id === occasionId)!

  const go = (s: Stage) => {
    setStage(s)
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  /* ── scan ── */
  const scan = useCallback(async (blob: Blob) => {
    setScanError(null)
    setSkinError(null)
    setProgress(0)
    try {
      const id = await uploadPhoto(blob)
      setFileId(id)
      setProgress(1)
      const tone = runTask('skin-tone-analysis', id).then((r) => { setProgress((p) => Math.max(p, 2)); return parseTone(r) })
      const skin = runTask('skin-analysis', id, { dst_actions: SKIN_ACTIONS, miniserver_args: { enable_mask_overlay: true }, format: 'json' })
        .then(parseSkin)
        .catch((e: Error) => { setSkinError(e.message); return undefined })
      const [t, s] = await Promise.all([tone, skin])
      setProgress(3)
      setLooks({})
      setTweaks({})
      setProfile(buildProfile(t, s))
      setTimeout(() => go('results'), 500)
    } catch (e) {
      setScanError(e instanceof TaskError ? e.message : 'Could not reach the scanner. Check your connection and try again.')
    }
  }, [])

  /* ── looks ── */
  const resolved = useMemo(() => {
    if (!profile) return null
    return Object.fromEntries(occasion.looks.map((r) => [r.id, resolveLook(r, profile, lighting, tweaks[r.id], outfit)]))
  }, [profile, occasion, lighting, tweaks, outfit])

  const ensure = useCallback(
    async (id: string, force = false) => {
      if (!resolved || !fileId) return
      const look = resolved[id]
      if (!look) return
      const key = JSON.stringify(look.effects)
      const flightKey = `${fileId}|${id}|${key}`
      const cur = looksRef.current[id]
      if (inflight.current.has(flightKey)) return
      if (!force && cur && cur.key === key && cur.status !== 'idle') return
      inflight.current.add(flightKey)
      setLooks((s) => ({ ...s, [id]: { ...s[id], status: 'loading', key, error: undefined } }))
      try {
        const url = await renderLook(fileId, look.effects)
        setLooks((s) => (s[id]?.key === key ? { ...s, [id]: { status: 'done', url, key } } : s))
      } catch (e) {
        setLooks((s) => (s[id]?.key === key ? { ...s, [id]: { ...s[id], status: 'error', error: (e as Error).message, key } } : s))
      } finally {
        inflight.current.delete(flightKey)
      }
    },
    [resolved, fileId],
  )

  // First render: all three looks in parallel. Afterwards: re-render whichever look is active when its inputs change.
  useEffect(() => {
    if (stage !== 'results' || !resolved) return
    occasion.looks.forEach((r) => ensure(r.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, profile])
  useEffect(() => {
    if (stage === 'results') ensure(activeId)
  }, [stage, activeId, ensure])

  const plan = useMemo(() => (profile ? buildPlan(new Date(`${date}T00:00:00`),profile.skinReport, lighting, occasion.looks.find((l) => l.id === activeId)?.name ?? '') : null), [profile, date, lighting, occasion, activeId])

  const restart = () => {
    setPhoto(null)
    setProfile(null)
    setFileId(null)
    setLooks({})
    setTweaks({})
    go('photo')
  }

  const stepIndex = STEPS.findIndex((s) => s.id === stage)

  return (
    <section id="studio" className="relative scroll-mt-16">
      <div ref={topRef} className="scroll-mt-20" />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">The studio</p>
            <h2 className="mt-2 font-display text-4xl font-medium tracking-tight sm:text-5xl">Build your <em className="text-accent">signature look.</em></h2>
          </div>
          <ol className="flex items-center gap-1.5 sm:gap-2" aria-label="Progress">
            {STEPS.map((s, i) => {
              const done = i < stepIndex
              const on = i === stepIndex
              return (
                <li key={s.id} className="flex items-center gap-1.5 sm:gap-2">
                  <span aria-current={on ? 'step' : undefined} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold transition sm:px-3 ${on ? 'bg-ink text-bg' : done ? 'bg-accent/10 text-accent' : 'text-muted'}`}>
                    <span className="grid size-4 place-items-center rounded-full text-[0.6rem]">{done ? <Check size={12} /> : i + 1}</span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </span>
                  {i < STEPS.length - 1 && <span className="h-px w-3 bg-line sm:w-5" />}
                </li>
              )
            })}
          </ol>
        </div>

        {stage !== 'results' ? (
          <div className="card mt-8 p-6 sm:p-10">
            {stage === 'moment' && <MomentStep {...{ occasionId, date, setDate, lighting, setLighting, outfit, setOutfit }} setOccasionId={(id) => { setOccasionId(id); setActiveId(OCCASIONS.find((o) => o.id === id)!.looks[0].id) }} onNext={() => go('photo')} />}
            {stage === 'photo' && <PhotoStep onBack={() => go('moment')} onDone={(blob, url) => { setPhoto({ blob, url }); go('scan'); scan(blob) }} />}
            {stage === 'scan' && photo && <ScanView photoUrl={photo.url} progress={progress} error={scanError} onRetry={() => scan(photo.blob)} onRetake={restart} />}
          </div>
        ) : (
          profile && resolved && photo && plan && (
            <div className="mt-8 space-y-14">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm text-muted"><ShieldCheck size={16} className="text-leaf" /> Analysed by YouCam AI · results expire in 24h</p>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-ghost !py-2 text-sm" onClick={() => go('moment')}>Change occasion</button>
                  <button type="button" className="btn btn-ghost !py-2 text-sm" onClick={restart}><RotateCcw size={14} /> New photo</button>
                </div>
              </div>
              <BeautyDNA profile={profile} photoUrl={photo.url} skinError={skinError} />
              <LookStudio
                occasion={occasion}
                resolved={resolved}
                states={looks}
                activeId={activeId}
                setActiveId={setActiveId}
                photoUrl={photo.url}
                lighting={lighting}
                setLighting={setLighting}
                applyTweaks={(id, t) => setTweaks((s) => ({ ...s, [id]: { ...s[id], ...t } }))}
                retry={(id) => ensure(id, true)}
                outfit={outfit}
                setOutfit={setOutfit}
              />
              <PlanView plan={plan} occasionName={occasion.name} eventDate={date} />
            </div>
          )
        )}

        {/* when coming back to change the occasion with an existing scan, offer a shortcut */}
        {stage === 'moment' && profile && (
          <div className="mt-4 text-center">
            <button type="button" className="text-sm font-semibold text-accent hover:underline" onClick={() => { setLooks({}); go('results') }}>Use my existing scan → see looks</button>
          </div>
        )}
      </div>
    </section>
  )
}

function ScanView({ photoUrl, progress, error, onRetry, onRetake }: { photoUrl: string; progress: number; error: string | null; onRetry: () => void; onRetake: () => void }) {
  const steps = ['Uploading securely to YouCam', 'Reading skin, lip & brow colour', 'Measuring 9 skin-health signals', 'Designing your looks']
  return (
    <div className="grid items-center gap-10 sm:grid-cols-[minmax(0,300px)_1fr]">
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt="Your photo being scanned" className="absolute inset-0 h-full w-full object-cover" />
        {!error && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-accent/30" />
            <div className="scan-line absolute inset-x-0 top-0 h-[10%] bg-gradient-to-b from-transparent via-[#fff3d1]/70 to-transparent" />
            <div className="kolam-bg absolute inset-0 opacity-30" />
          </>
        )}
      </div>
      <div>
        <h3 className="font-display text-3xl font-medium tracking-tight">{error ? 'We hit a snag.' : 'Reading your Beauty DNA…'}</h3>
        {error ? (
          <>
            <p role="alert" className="mt-3 text-accent">{error}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="btn btn-primary" onClick={onRetake}>Retake photo</button>
              <button type="button" className="btn btn-ghost" onClick={onRetry}>Try again</button>
            </div>
          </>
        ) : (
          <ul className="mt-6 space-y-3.5" aria-live="polite">
            {steps.map((s, i) => {
              const done = progress > i
              const active = progress === i
              return (
                <li key={s} className={`flex items-center gap-3 text-sm transition ${done ? 'text-ink' : active ? 'font-semibold text-ink' : 'text-muted/60'}`}>
                  <span className={`grid size-6 place-items-center rounded-full ${done ? 'bg-leaf text-white' : active ? 'bg-accent/10 text-accent' : 'bg-surface-2'}`}>
                    {done ? <Check size={13} /> : active ? <Loader2 size={13} className="animate-spin" /> : null}
                  </span>
                  {s}
                </li>
              )
            })}
          </ul>
        )}
        <p className="mt-8 text-xs text-muted">Usually takes 10–20 seconds.</p>
      </div>
    </div>
  )
}
