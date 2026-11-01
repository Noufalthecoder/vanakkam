'use client'

import { AlertCircle, CalendarPlus, Check, ExternalLink, Loader2, RefreshCw, SlidersHorizontal, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CONCERNS, LIGHTING, OUTFIT_PRESETS, outfitName, UNDERTONE_COPY, type Concern, type Lighting, type Occasion, type Profile, type ResolvedLook, type Tweaks } from '@/lib/beauty'
import { onColor } from '@/lib/color'
import type { Plan } from '@/lib/plan'
import { RegimenShop, ShopTheLook } from '@/components/shop/shop-look'

export type LookState = { status: 'idle' | 'loading' | 'done' | 'error'; url?: string; error?: string; key?: string }

/* ───────────────────────── Beauty DNA ───────────────────────── */

export function BeautyDNA({ profile, photoUrl, skinError }: { profile: Profile; photoUrl: string; skinError?: string | null }) {
  const s = profile.skinReport
  const concerns = (Object.entries(s?.scores ?? {}) as [Concern, number][]).sort((a, b) => b[1] - a[1])
  const swatches = [
    { label: 'Skin', hex: profile.skin },
    { label: 'Lips', hex: profile.lip },
    { label: 'Brows', hex: profile.brow },
  ]
  return (
    <section className="card overflow-hidden" aria-labelledby="dna-title">
      <div className="grid md:grid-cols-[220px_1fr]">
        <div className="relative aspect-[3/4] bg-surface-2 md:aspect-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt="Your scanned photo" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white backdrop-blur">Scanned</span>
        </div>
        <div className="p-6 sm:p-7">
          <p className="eyebrow">Your Beauty DNA</p>
          <h3 id="dna-title" className="mt-2 font-display text-3xl font-medium capitalize tracking-tight">
            {profile.undertone} undertone · {profile.depth} depth
          </h3>
          <p className="mt-2 text-sm text-muted">{UNDERTONE_COPY[profile.undertone]}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            {swatches.map((w) => (
              <div key={w.label} className="flex items-center gap-2.5 rounded-full border border-line bg-bg py-1.5 pl-1.5 pr-3.5">
                <span className="size-8 rounded-full border border-line" style={{ background: w.hex }} />
                <span className="text-xs"><b className="block">{w.label}</b><span className="font-mono uppercase text-muted">{w.hex}</span></span>
              </div>
            ))}
          </div>

          {s && concerns.length > 0 ? (
            <>
              <div className="mt-6 flex flex-wrap gap-6">
                {s.overall !== undefined && <Stat label="Skin score" value={s.overall} suffix="/100" />}
                {s.skinAge !== undefined && <Stat label="Skin age" value={s.skinAge} />}
                {s.skinType && <Stat label="Skin type" value={s.skinType} />}
              </div>
              <div className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {concerns.map(([k, v]) => (
                  <div key={k}>
                    <div className="flex justify-between text-xs font-semibold"><span>{CONCERNS[k]}</span><span className={v < 70 ? 'text-accent' : 'text-muted'}>{v}</span></div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <div className={`h-full rounded-full transition-[width] duration-1000 ${v < 70 ? 'bg-accent' : v < 85 ? 'bg-marigold' : 'bg-leaf'}`} style={{ width: `${v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[0.7rem] text-muted">Higher is healthier. Shades and prep plan below adapt to these numbers.</p>
            </>
          ) : (
            <div className="mt-6 flex gap-3 rounded-2xl bg-surface-2 p-4 text-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-marigold" />
              <p><b>Colour scan complete; detailed skin scan skipped.</b> <span className="text-muted">{skinError ?? 'Retake with your face filling the oval for 9-point skin health.'}</span></p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) {
  return (
    <div>
      <p className="eyebrow !text-[0.62rem]">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}<span className="text-base text-muted">{suffix}</span></p>
    </div>
  )
}

/* ───────────────────────── Before / after ───────────────────────── */

function Compare({ before, after, loading, label }: { before: string; after?: string; loading: boolean; label: string }) {
  const [pos, setPos] = useState(50)
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-surface-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={after ?? before} alt={after ? `You wearing ${label}` : 'Your photo'} className="absolute inset-0 h-full w-full object-cover" />
      {after && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={before} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
          <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }}>
            <span className="absolute top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-xs font-bold text-black shadow-lg">⇆</span>
          </div>
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white">Before</span>
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-accent-ink">{label}</span>
          <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} aria-label="Compare before and after" className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/55 px-2.5 py-1 text-[0.62rem] font-semibold text-white backdrop-blur">AI try-on preview · real-life results vary</span>
        </>
      )}
      {loading && (
        <div className="absolute inset-0 grid place-items-center bg-black/35 backdrop-blur-[2px]">
          <div className="rounded-2xl bg-surface/95 px-5 py-4 text-center shadow-soft">
            <Loader2 className="mx-auto animate-spin text-accent" size={24} />
            <p className="mt-2 text-sm font-semibold">Applying {label}…</p>
            <p className="text-xs text-muted">YouCam is rendering on your face</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ───────────────────────── Look studio ───────────────────────── */

export function LookStudio({
  occasion,
  resolved,
  states,
  activeId,
  setActiveId,
  photoUrl,
  lighting,
  setLighting,
  applyTweaks,
  retry,
  outfit,
  setOutfit,
}: {
  outfit: string | null
  setOutfit: (hex: string | null) => void
  occasion: Occasion
  resolved: Record<string, ResolvedLook>
  states: Record<string, LookState>
  activeId: string
  setActiveId: (id: string) => void
  photoUrl: string
  lighting: Lighting
  setLighting: (l: Lighting) => void
  applyTweaks: (id: string, t: Tweaks) => void
  retry: (id: string) => void
}) {
  const look = resolved[activeId]
  const state = states[activeId] ?? { status: 'idle' }
  const [draft, setDraft] = useState<Tweaks>({})
  const [tweakOpen, setTweakOpen] = useState(false)
  const lastId = useRef(activeId)
  useEffect(() => {
    if (lastId.current !== activeId) {
      lastId.current = activeId
      setDraft({})
    }
  }, [activeId])

  const lipI = draft.lipIntensity ?? (look.effects.find((e) => e.category === 'lip_color') as { palettes: { colorIntensity: number }[] }).palettes[0].colorIntensity
  const eyeI = draft.eyeIntensity ?? (look.effects.find((e) => e.category === 'eye_shadow') as { palettes: { colorIntensity: number }[] }).palettes[0].colorIntensity
  const blushI = draft.blushIntensity ?? (look.effects.find((e) => e.category === 'blush') as { palettes: { colorIntensity: number }[] }).palettes[0].colorIntensity
  const lip = draft.lip ?? look.swatches.lip
  const dirty = Object.keys(draft).length > 0

  return (
    <section aria-labelledby="looks-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">03 · Designed for {occasion.name}</p>
          <h3 id="looks-title" className="mt-2 font-display text-3xl font-medium tracking-tight sm:text-4xl">Three looks, <em className="text-accent">on your face.</em></h3>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1" role="group" aria-label="Preview lighting">
          {(Object.keys(LIGHTING) as Lighting[]).map((l) => (
            <button key={l} type="button" aria-pressed={l === lighting} onClick={() => setLighting(l)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${l === lighting ? 'bg-ink text-bg' : 'text-muted hover:text-ink'}`}>
              {LIGHTING[l].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-3">
        <span className="mr-1 text-xs font-bold text-muted">Wearing:</span>
        <button type="button" aria-pressed={!outfit} onClick={() => setOutfit(null)} className="chip !py-1 text-xs">None</button>
        {OUTFIT_PRESETS.map((o) => (
          <button key={o.hex} type="button" title={o.name} aria-label={`Wearing ${o.name}`} aria-pressed={outfit === o.hex} onClick={() => setOutfit(o.hex)} className={`size-7 rounded-full border-2 transition ${outfit === o.hex ? 'scale-110 border-ink' : 'border-line'}`} style={{ background: o.hex }} />
        ))}
        {outfit && <span className="ml-auto text-xs text-muted">Matched to your {outfitName(outfit)}</span>}
      </div>

      {/* look picker */}
      <div className="mt-6 grid grid-cols-3 gap-2.5">
        {occasion.looks.map((r) => {
          const st = states[r.id]
          const rl = resolved[r.id]
          const on = r.id === activeId
          return (
            <button key={r.id} type="button" aria-pressed={on} onClick={() => setActiveId(r.id)} className={`group relative overflow-hidden rounded-2xl border text-left transition ${on ? 'border-accent ring-2 ring-accent/30' : 'border-line hover:border-ink/40'}`}>
              <div className="relative aspect-[4/3] bg-surface-2">
                {st?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={st.url} alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_35%]" />
                )}
                {st?.status === 'loading' && <Loader2 size={18} className="absolute right-2 top-2 animate-spin text-white drop-shadow" />}
                {st?.status === 'error' && <AlertCircle size={18} className="absolute right-2 top-2 text-accent" />}
                {!st?.url && (
                  <div className="absolute inset-0 flex items-center justify-center gap-1">
                    {[rl.swatches.lip, ...rl.swatches.eyes.slice(0, 2), rl.swatches.blush].map((c, i) => <span key={i} className="size-5 rounded-full border border-white/60" style={{ background: c }} />)}
                  </div>
                )}
              </div>
              <div className="bg-surface px-3 py-2.5">
                <span className="block truncate text-sm font-bold">{r.name}</span>
                <span className="mt-1 flex gap-1">
                  {[rl.swatches.lip, ...rl.swatches.eyes, rl.swatches.blush].map((c, i) => <span key={i} className="size-2.5 rounded-full" style={{ background: c }} />)}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div>
          <Compare before={photoUrl} after={state.url} loading={state.status === 'loading'} label={look.recipe.name} />
          {state.status === 'error' && (
            <div role="alert" className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-accent/10 p-3 text-sm">
              <span><b>Try-on failed.</b> {state.error}</span>
              <button type="button" onClick={() => retry(activeId)} className="btn btn-ghost !py-1.5 text-xs"><RefreshCw size={13} /> Retry</button>
            </div>
          )}
          {state.url && (
            <a href={state.url} target="_blank" rel="noreferrer" className="btn btn-ghost mt-3 w-full text-sm"><ExternalLink size={15} /> Open full-size image</a>
          )}
        </div>

        <div className="space-y-5">
          <div className="card p-6">
            <h4 className="font-display text-2xl">{look.recipe.name}</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted">{look.recipe.story}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Swatch label="Base" colors={[look.swatches.foundation]} note={`Shade ${look.matches.foundation.shade.code}`} />
              <Swatch label="Eyes" colors={look.swatches.eyes} note={look.swatches.eyeLabel} />
              <Swatch label="Cheeks" colors={[look.swatches.blush]} note={`${look.recipe.blush.family}`} />
              <Swatch label="Lips" colors={[look.swatches.lip]} note={`${look.lipShade.name} · ${look.recipe.lip.texture}`} />
            </div>
          </div>

          <div className="card p-6">
            <p className="eyebrow flex items-center gap-2"><Sparkles size={13} className="text-marigold" /> Why this works for you</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              {look.notes.map((n) => (
                <li key={n} className="flex gap-2.5"><Check size={15} className="mt-0.5 shrink-0 text-leaf" /><span>{n}</span></li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <button type="button" onClick={() => setTweakOpen(!tweakOpen)} className="flex w-full items-center justify-between" aria-expanded={tweakOpen}>
              <span className="eyebrow flex items-center gap-2"><SlidersHorizontal size={13} /> Make it yours</span>
              <span className="text-xs font-semibold text-muted">{tweakOpen ? 'Hide' : 'Tweak shades'}</span>
            </button>
            {tweakOpen && (
              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm font-semibold">Lip shade <span className="font-normal text-muted">— in-stock shades picked for your undertone</span></p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {look.lipOptions.map((sh) => (
                      <button key={sh.code} type="button" onClick={() => setDraft({ ...draft, lip: sh.hex })} title={sh.name} aria-label={`Lip shade ${sh.name}`} aria-pressed={sh.hex === lip} className={`grid size-9 place-items-center rounded-full border-2 transition ${sh.hex === lip ? 'scale-110 border-ink' : 'border-transparent'}`} style={{ background: sh.hex }}>
                        {sh.hex === lip && <Check size={14} style={{ color: onColor(sh.hex) }} />}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted">Selected: <b className="text-ink">{look.lipOptions.find((o) => o.hex === lip)?.name ?? look.lipShade.name}</b></p>
                </div>
                <Slider label="Lip intensity" value={lipI} onChange={(v) => setDraft({ ...draft, lipIntensity: v })} />
                <Slider label="Eye intensity" value={eyeI} onChange={(v) => setDraft({ ...draft, eyeIntensity: v })} />
                <Slider label="Blush intensity" value={blushI} onChange={(v) => setDraft({ ...draft, blushIntensity: v })} />
                <div className="flex gap-3">
                  <button type="button" className="btn btn-primary" disabled={!dirty || state.status === 'loading'} onClick={() => { applyTweaks(activeId, draft); setDraft({}) }}>Apply to my face</button>
                  {dirty && <button type="button" className="btn btn-ghost" onClick={() => setDraft({})}>Reset</button>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6">
        <ShopTheLook look={look} />
      </div>
    </section>
  )
}

function Swatch({ label, colors, note }: { label: string; colors: string[]; note: string }) {
  return (
    <div>
      <div className="flex h-12 overflow-hidden rounded-xl border border-line">
        {colors.map((c, i) => <span key={i} className="flex-1" style={{ background: c }} />)}
      </div>
      <p className="mt-2 text-xs font-bold">{label}</p>
      <p className="truncate text-[0.7rem] capitalize text-muted">{note}</p>
    </div>
  )
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm font-semibold"><span>{label}</span><span className="text-muted">{value}</span></span>
      <input type="range" min={10} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full" />
    </label>
  )
}

/* ───────────────────────── Prep plan ───────────────────────── */

function icsFor(plan: Plan, occasionName: string) {
  const fmt = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const esc = (s: string) => s.replace(/[,;\\]/g, (m) => `\\${m}`).replace(/\n/g, '\\n')
  const events = plan.steps.map((s, i) => {
    const end = new Date(s.date)
    end.setDate(end.getDate() + 1)
    return ['BEGIN:VEVENT', `UID:vanakkam-${fmt(s.date)}-${i}@vanakkam`, `DTSTAMP:${fmt(new Date())}T000000Z`, `DTSTART;VALUE=DATE:${fmt(s.date)}`, `DTEND;VALUE=DATE:${fmt(end)}`, `SUMMARY:${esc(`✿ ${s.title} — ${occasionName} prep`)}`, `DESCRIPTION:${esc(s.items.map((x) => `• ${x}`).join('\n'))}`, 'END:VEVENT'].join('\r\n')
  })
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Vanakkam//Prep Plan//EN', ...events, 'END:VCALENDAR'].join('\r\n')
}

export function PlanView({ plan, occasionName, eventDate }: { plan: Plan; occasionName: string; eventDate: string }) {
  const href = useMemo(() => `data:text/calendar;charset=utf-8,${encodeURIComponent(icsFor(plan, occasionName))}`, [plan, occasionName])
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
  return (
    <section aria-labelledby="plan-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">04 · Your countdown</p>
          <h3 id="plan-title" className="mt-2 font-display text-3xl font-medium tracking-tight sm:text-4xl">
            {plan.daysLeft === 0 ? <>It’s <em className="text-accent">today.</em></> : <><em className="text-accent">{plan.daysLeft} days</em> to {occasionName}.</>}
          </h3>
        </div>
        <a href={href} download="vanakkam-prep-plan.ics" className="btn btn-ghost text-sm"><CalendarPlus size={16} /> Add to calendar</a>
      </div>

      {plan.focus.length > 0 && (
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {plan.focus.map((f, i) => (
            <div key={f.concern} className="card p-5">
              <div className="flex items-center justify-between">
                <p className="eyebrow !text-[0.62rem]">Focus {i + 1}</p>
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">{f.score}/100</span>
              </div>
              <p className="mt-2 font-display text-xl">{f.label}</p>
              <p className="mt-2 text-sm">{f.daily}</p>
              <p className="mt-2 text-sm text-muted"><b className="text-ink">Home ritual:</b> {f.home}</p>
            </div>
          ))}
        </div>
      )}

      <RegimenShop plan={plan} eventDate={eventDate} />

      <ol className="relative mt-8 space-y-4 border-l-2 border-dashed border-line pl-6">
        {plan.steps.map((s) => (
          <li key={s.daysBefore} className="relative">
            <span className={`absolute -left-[33px] top-1 grid size-4 place-items-center rounded-full border-2 border-bg ${s.daysBefore === 0 ? 'bg-accent' : 'bg-marigold'}`} />
            <div className="card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-xl">{s.title}</p>
                <p className="text-xs font-bold text-muted">{s.daysBefore === 0 ? 'Event day' : `${s.daysBefore} day${s.daysBefore > 1 ? 's' : ''} before`} · {fmt(s.date)}</p>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-muted">
                {s.items.map((it) => <li key={it} className="flex gap-2"><span className="text-accent">✿</span><span>{it}</span></li>)}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
