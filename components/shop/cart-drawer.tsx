'use client'

import { AlertTriangle, CheckCircle2, Minus, PartyPopper, Plus, ShoppingBag, Truck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { inr, PRODUCTS } from '@/lib/catalog'
import { BUNDLE_DISCOUNT, deliveryWindow, useCart } from '@/lib/cart'
import { ProductArt } from './product-art'

export function CartButton() {
  const { totals, setOpen } = useCart()
  return (
    <button type="button" onClick={() => setOpen(true)} className="relative grid size-10 place-items-center rounded-full border border-line bg-surface transition hover:border-ink" aria-label={`Open bag, ${totals.count} items`}>
      <ShoppingBag size={17} />
      {totals.count > 0 && <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[0.65rem] font-bold text-accent-ink">{totals.count}</span>}
    </button>
  )
}

const fmt = (d: Date) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })

export function CartDrawer() {
  const { items, open, setOpen, setQty, totals, clear, eventDate } = useCart()
  const [step, setStep] = useState<'bag' | 'checkout' | 'done'>('bag')
  const [orderId, setOrderId] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', pin: '' })

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, setOpen])

  useEffect(() => {
    if (open && step === 'done' && items.length > 0) setStep('bag')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const [from, to] = deliveryWindow()
  const event = eventDate ? new Date(`${eventDate}T00:00:00`) : null
  const late = event && to > event
  const valid = form.name.trim().length > 1 && /^\d{10}$/.test(form.phone) && /^\d{6}$/.test(form.pin)

  const place = () => {
    setOrderId(`VNK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`)
    setStep('done')
    clear()
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />
      <aside role="dialog" aria-modal="true" aria-label="Shopping bag" className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-bg shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-2xl">{step === 'checkout' ? 'Checkout' : step === 'done' ? 'Order placed' : 'Your bag'}</h2>
          <button type="button" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full hover:bg-surface-2" aria-label="Close bag"><X size={18} /></button>
        </header>

        {step === 'done' ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-leaf/15 text-leaf"><PartyPopper size={28} /></span>
            <p className="mt-5 font-display text-3xl">Nandri!</p>
            <p className="mt-2 text-muted">Order <b className="text-ink">{orderId}</b> is confirmed and arrives {fmt(from)}–{fmt(to)}.</p>
            <p className="mt-1 text-xs text-muted">(Demo store — no payment was taken.)</p>
            <button type="button" className="btn btn-primary mt-8" onClick={() => { setOpen(false); setStep('bag') }}>Back to my looks</button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <ShoppingBag size={36} className="text-muted" />
            <p className="mt-4 font-semibold">Your bag is empty</p>
            <p className="mt-1 text-sm text-muted">Scan your face and add a shade-matched kit.</p>
            <a href="#studio" onClick={() => setOpen(false)} className="btn btn-primary mt-6">Start a scan</a>
          </div>
        ) : step === 'bag' ? (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((i) => {
                const p = PRODUCTS[i.productId]
                return (
                  <li key={i.key} className="flex gap-3 py-4">
                    <ProductArt productId={i.productId} shade={i.shade} size={60} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{p.name}</p>
                      {i.shade && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                          <span className="size-3 rounded-full border border-line" style={{ background: i.shade.hex }} /> {i.shade.name}
                          {i.matchPercent && <span className="rounded-full bg-leaf/15 px-1.5 font-bold text-leaf">{i.matchPercent}% match</span>}
                        </p>
                      )}
                      {i.bundle && <p className="mt-0.5 text-[0.7rem] font-bold text-accent">{i.bundle} kit · −{BUNDLE_DISCOUNT * 100}%</p>}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-line">
                          <button type="button" className="grid size-7 place-items-center" onClick={() => setQty(i.key, i.qty - 1)} aria-label="Decrease quantity"><Minus size={13} /></button>
                          <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                          <button type="button" className="grid size-7 place-items-center" onClick={() => setQty(i.key, i.qty + 1)} aria-label="Increase quantity"><Plus size={13} /></button>
                        </div>
                        <span className="text-sm font-bold">{inr(p.price * i.qty)}</span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
            <Summary />
            <div className="border-t border-line p-5">
              <button type="button" className="btn btn-primary w-full" onClick={() => setStep('checkout')}>Checkout · {inr(totals.total)}</button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className={`flex gap-3 rounded-2xl p-4 text-sm ${late ? 'bg-marigold/15' : 'bg-leaf/10'}`}>
                {late ? <AlertTriangle size={18} className="shrink-0 text-marigold" /> : <Truck size={18} className="shrink-0 text-leaf" />}
                <p>
                  Arrives <b>{fmt(from)}–{fmt(to)}</b>.{' '}
                  {event && (late ? <>That’s cutting it close for your event on {fmt(event)} — choose express at the counter or pick up in store.</> : <>Comfortably before your event on {fmt(event)}.</>)}
                </p>
              </div>
              {(
                [
                  ['name', 'Full name', 'text', 'Priya Raman'],
                  ['phone', 'Mobile (10 digits)', 'tel', '9876543210'],
                  ['pin', 'PIN code', 'text', '600001'],
                ] as const
              ).map(([k, label, type, ph]) => (
                <label key={k} className="block">
                  <span className="text-sm font-semibold">{label}</span>
                  <input type={type} inputMode={k === 'name' ? 'text' : 'numeric'} placeholder={ph} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-accent" />
                </label>
              ))}
              <p className="flex items-center gap-2 text-xs text-muted"><CheckCircle2 size={14} className="text-leaf" /> Cash on delivery · free shade exchange within 30 days</p>
            </div>
            <Summary />
            <div className="flex gap-2 border-t border-line p-5">
              <button type="button" className="btn btn-ghost" onClick={() => setStep('bag')}>Back</button>
              <button type="button" className="btn btn-primary flex-1" disabled={!valid} onClick={place}>Place order · {inr(totals.total)}</button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

function Summary() {
  const { totals } = useCart()
  return (
    <dl className="space-y-1.5 border-t border-line bg-surface px-5 py-4 text-sm">
      <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{inr(totals.subtotal)}</dd></div>
      {totals.discount > 0 && <div className="flex justify-between text-leaf"><dt>Complete-the-look saving</dt><dd>−{inr(totals.discount)}</dd></div>}
      <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{totals.shipping ? inr(totals.shipping) : 'Free'}</dd></div>
      <div className="flex justify-between pt-1.5 text-base font-bold"><dt>Total</dt><dd>{inr(totals.total)}</dd></div>
    </dl>
  )
}
