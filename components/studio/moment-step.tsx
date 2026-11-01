'use client'

import { ArrowRight, Camera, Check, Shirt, Sun, Sparkles, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { LIGHTING, OCCASIONS, OUTFIT_PRESETS, outfitName, outfitTone, type Lighting } from '@/lib/beauty'
import { dominantColor, onColor } from '@/lib/color'
import { StepHeading } from './photo-step'

function OutfitPicker({ outfit, setOutfit }: { outfit: string | null; setOutfit: (hex: string | null) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const fromPhoto = (file?: File) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      // Sample the centre of the garment photo, where the fabric usually is.
      const c = document.createElement('canvas')
      c.width = c.height = 80
      const ctx = c.getContext('2d', { willReadFrequently: true })!
      const sw = img.naturalWidth * 0.6
      const sh = img.naturalHeight * 0.6
      ctx.drawImage(img, img.naturalWidth * 0.2, img.naturalHeight * 0.2, sw, sh, 0, 0, 80, 80)
      setOutfit(dominantColor(ctx.getImageData(0, 0, 80, 80).data))
      setPreview(url)
    }
    img.src = url
  }

  return (
    <fieldset className="mt-7 rounded-2xl border border-dashed border-line p-5">
      <legend className="eyebrow flex items-center gap-2 px-2"><Shirt size={13} /> What are you wearing? <span className="font-medium normal-case tracking-normal">(optional)</span></legend>
      <p className="text-sm text-muted">Pick your saree, lehenga or outfit colour, or upload a photo of it. Your looks will match the outfit instead of clashing with it.</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {OUTFIT_PRESETS.map((o) => {
          const on = outfit?.toLowerCase() === o.hex
          return (
            <button key={o.hex} type="button" title={o.name} aria-label={o.name} aria-pressed={on} onClick={() => { setOutfit(on ? null : o.hex); setPreview(null) }} className={`grid size-9 place-items-center rounded-full border-2 transition ${on ? 'scale-110 border-ink' : 'border-line'}`} style={{ background: o.hex }}>
              {on && <Check size={14} style={{ color: onColor(o.hex) }} />}
            </button>
          )
        })}
        <label className="grid size-9 cursor-pointer place-items-center rounded-full border-2 border-line bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)]" title="Custom colour">
          <input type="color" className="sr-only" value={outfit ?? '#b3122e'} onChange={(e) => { setOutfit(e.target.value); setPreview(null) }} aria-label="Custom outfit colour" />
        </label>
        <button type="button" onClick={() => fileRef.current?.click()} className="chip inline-flex items-center gap-1.5"><Upload size={13} /> Outfit photo</button>
        <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => fromPhoto(e.target.files?.[0])} />
      </div>
      {outfit && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface-2/70 p-3 text-sm">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Your outfit" className="size-10 rounded-lg object-cover" />
          ) : (
            <span className="size-10 rounded-lg border border-line" style={{ background: outfit }} />
          )}
          <p className="flex-1">
            <b className="capitalize">{outfitName(outfit)}</b> <span className="font-mono text-xs uppercase text-muted">{outfit}</span>
            <span className="block text-xs text-muted">{outfitTone(outfit) === 'neutral' ? 'Neutral: the looks will lean on gold and skin-true tones.' : `${outfitTone(outfit)}-toned: lips and lids will be matched to it.`}</span>
          </p>
          <button type="button" onClick={() => { setOutfit(null); setPreview(null) }} className="grid size-8 place-items-center rounded-full hover:bg-surface" aria-label="Clear outfit"><X size={15} /></button>
        </div>
      )}
    </fieldset>
  )
}

const LIGHT_ICON = { daylight: Sun, flash: Camera, stage: Sparkles }

export function MomentStep({
  occasionId,
  setOccasionId,
  date,
  setDate,
  lighting,
  setLighting,
  onNext,
  outfit,
  setOutfit,
}: {
  outfit: string | null
  setOutfit: (hex: string | null) => void
  occasionId: string
  setOccasionId: (id: string) => void
  date: string
  setDate: (d: string) => void
  lighting: Lighting
  setLighting: (l: Lighting) => void
  onNext: () => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  return (
    <div>
      <StepHeading title="What’s the moment?" body="Every look, every shade and your prep plan are built around this." />

      <fieldset className="mt-6">
        <legend className="eyebrow mb-3">Occasion</legend>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {OCCASIONS.map((o) => {
            const on = o.id === occasionId
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={on}
                onClick={() => { setOccasionId(o.id); setLighting(o.lighting) }}
                className={`rounded-2xl border p-4 text-left transition ${on ? 'border-accent bg-accent/[.07] ring-2 ring-accent/30' : 'border-line bg-surface hover:border-ink/40'}`}
              >
                <span className="block font-display text-lg leading-tight">{o.name}</span>
                <span className="mt-1 block text-xs text-muted">{o.sub}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-7 grid gap-6 sm:grid-cols-[1fr_1.4fr]">
        <label className="block">
          <span className="eyebrow mb-3 block">Event date</span>
          <input
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 font-semibold outline-none focus:border-accent"
          />
        </label>
        <fieldset>
          <legend className="eyebrow mb-3">Lighting you’ll be in</legend>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(LIGHTING) as Lighting[]).map((l) => {
              const Icon = LIGHT_ICON[l]
              const on = l === lighting
              return (
                <button key={l} type="button" aria-pressed={on} onClick={() => setLighting(l)} className={`rounded-xl border px-2 py-3 text-center transition ${on ? 'border-ink bg-ink text-bg' : 'border-line bg-surface hover:border-ink/40'}`}>
                  <Icon size={17} className="mx-auto" />
                  <span className="mt-1.5 block text-xs font-bold">{LIGHTING[l].label}</span>
                  <span className={`mt-0.5 hidden text-[0.65rem] leading-tight sm:block ${on ? 'opacity-70' : 'text-muted'}`}>{LIGHTING[l].hint}</span>
                </button>
              )
            })}
          </div>
        </fieldset>
      </div>

      <OutfitPicker outfit={outfit} setOutfit={setOutfit} />

      <div className="mt-9 flex justify-end">
        <button type="button" className="btn btn-primary" onClick={onNext} disabled={!date}>Continue <ArrowRight size={16} /></button>
      </div>
    </div>
  )
}
