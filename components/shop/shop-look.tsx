'use client'

import { BadgeCheck, Check, Info, Plus, ShieldCheck, ShoppingBag } from 'lucide-react'
import type { ResolvedLook } from '@/lib/beauty'
import { inr, PRODUCTS } from '@/lib/catalog'
import { BUNDLE_DISCOUNT, useCart } from '@/lib/cart'
import type { Plan } from '@/lib/plan'
import { ProductArt } from './product-art'

export function ShopTheLook({ look }: { look: ResolvedLook }) {
  const { add, addMany, has } = useCart()
  const total = look.kit.reduce((s, k) => s + PRODUCTS[k.productId].price, 0)
  const bundle = Math.round(total * (1 - BUNDLE_DISCOUNT))
  // Base and lips drive most shade returns, so they carry most of the weight.
  const m = look.matches
  const confidence = Math.round(m.foundation.percent * 0.5 + m.lip.percent * 0.3 + m.blush.percent * 0.1 + m.brow.percent * 0.1)
  const allIn = look.kit.every((k) => has(k.productId, k.shade?.code))

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-6">
        <div>
          <p className="eyebrow flex items-center gap-2"><ShoppingBag size={13} /> Shop the look</p>
          <h4 className="mt-2 font-display text-2xl">The {look.recipe.name} kit</h4>
          <p className="mt-1 text-sm text-muted">The try-on above uses these exact shades, so what you saw is what arrives.</p>
        </div>
        <div className="rounded-2xl bg-leaf/10 px-4 py-3 text-right">
          <p className="flex items-center justify-end gap-1.5 text-xs font-bold text-leaf"><ShieldCheck size={14} /> Shade confidence</p>
          <p className="font-display text-3xl text-leaf">{confidence}%</p>
          <p className="text-[0.68rem] text-muted">{confidence >= 85 ? 'Low return risk' : confidence >= 75 ? 'Good match' : 'Check the runner-up shade'}</p>
        </div>
      </div>

      <ul className="divide-y divide-line">
        {look.kit.map((k) => {
          const p = PRODUCTS[k.productId]
          const inBag = has(k.productId, k.shade?.code)
          return (
            <li key={`${k.productId}-${k.shade?.code ?? ''}`} className="flex items-center gap-3 px-6 py-3.5">
              <ProductArt productId={k.productId} shade={k.shade} size={52} />
              <div className="min-w-0 flex-1">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">{k.role}</p>
                <p className="truncate text-sm font-bold">{p.name}</p>
                {k.shade && (
                  <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                    <span className="size-3 rounded-full border border-line" style={{ background: k.shade.hex }} />
                    {k.shade.name}
                    {k.match && (
                      <span className="group relative inline-flex items-center gap-1 rounded-full bg-leaf/15 px-1.5 font-bold text-leaf" tabIndex={0}>
                        <BadgeCheck size={11} /> {k.match.percent}%
                        <span role="tooltip" className="pointer-events-none absolute bottom-full left-0 z-10 mb-1.5 w-56 rounded-lg bg-ink p-2.5 text-[0.7rem] font-medium normal-case text-bg opacity-0 shadow-lg transition group-hover:opacity-100 group-focus:opacity-100">
                          CIEDE2000 colour difference ΔE {k.match.de.toFixed(1)} between your ideal AI shade and this SKU (under 2 is invisible to the eye).
                          {k.role === 'Base' && k.match.runnerUp ? ` Between shades? Try ${k.match.runnerUp.code}.` : ''}
                        </span>
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{inr(p.price)}</p>
                <button
                  type="button"
                  disabled={inBag}
                  onClick={() => add({ productId: k.productId, shade: k.shade, matchPercent: k.match?.percent })}
                  className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition ${inBag ? 'bg-leaf/15 text-leaf' : 'border border-line hover:border-ink'}`}
                >
                  {inBag ? <><Check size={12} /> In bag</> : <><Plus size={12} /> Add</>}
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-2/60 px-6 py-4">
        <p className="text-sm">
          <span className="text-muted line-through">{inr(total)}</span> <b className="text-lg">{inr(bundle)}</b>
          <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">Complete the look −{BUNDLE_DISCOUNT * 100}%</span>
        </p>
        <button
          type="button"
          className="btn btn-primary"
          disabled={allIn}
          onClick={() => addMany(look.kit.map((k) => ({ productId: k.productId, shade: k.shade, matchPercent: k.match?.percent, bundle: look.recipe.name })))}
        >
          {allIn ? <><Check size={16} /> Kit in bag</> : <><ShoppingBag size={16} /> Add full kit</>}
        </button>
      </div>
    </div>
  )
}

export function RegimenShop({ plan, eventDate }: { plan: Plan; eventDate: string }) {
  const { add, addMany, has } = useCart()
  if (!plan.focus.length) return null
  const event = new Date(`${eventDate}T00:00:00`)
  const ids = Array.from(new Set([...plan.focus.map((f) => f.concern as string), 'cleanser', 'spf']))
  const orderBy = new Date(event)
  orderBy.setDate(event.getDate() - 28 - 5) // start the ritual 4 weeks out, allow 5 days delivery
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const urgent = orderBy <= today
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })

  return (
    <div className="card mt-6 overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-6">
        <div>
          <p className="eyebrow">Your countdown regimen</p>
          <h4 className="mt-2 font-display text-2xl">Prescribed by your scan</h4>
          <p className="mt-1 text-sm text-muted">One product for each of your three lowest scores, plus the two essentials.</p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${urgent ? 'bg-marigold/20 text-ink' : 'bg-leaf/10 text-leaf'}`}>
          <Info size={12} className="mr-1 inline" />
          {urgent ? 'Order today to start in time' : `Order by ${fmt(orderBy)} to start 4 weeks out`}
        </span>
      </div>
      <ul className="grid gap-px bg-line sm:grid-cols-2">
        {ids.map((id) => {
          const p = PRODUCTS[id]
          const focus = plan.focus.find((f) => f.concern === id)
          const inBag = has(id)
          const covers = (p.days ?? 0) >= plan.daysLeft
          return (
            <li key={id} className="flex gap-3 bg-surface p-5">
              <ProductArt productId={id} size={56} />
              <div className="min-w-0 flex-1">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">{focus ? `For ${focus.label.toLowerCase()} · scored ${focus.score}` : p.category}</p>
                <p className="text-sm font-bold">{p.name}</p>
                <p className="mt-0.5 text-xs text-muted">{p.blurb}</p>
                <p className="mt-1 text-[0.7rem] text-muted">{p.size} · {covers ? `lasts ${p.days} days — covers your countdown` : `${p.days}-day supply`}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold">{inr(p.price)}</span>
                  <button type="button" disabled={inBag} onClick={() => add({ productId: id })} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${inBag ? 'bg-leaf/15 text-leaf' : 'border border-line hover:border-ink'}`}>
                    {inBag ? <><Check size={12} /> In bag</> : <><Plus size={12} /> Add</>}
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      <div className="flex justify-end border-t border-line bg-surface-2/60 px-6 py-4">
        <button type="button" className="btn btn-ghost" disabled={ids.every((id) => has(id))} onClick={() => addMany(ids.map((productId) => ({ productId })))}>
          <ShoppingBag size={15} /> Add regimen · {inr(ids.reduce((s, id) => s + PRODUCTS[id].price, 0))}
        </button>
      </div>
    </div>
  )
}
