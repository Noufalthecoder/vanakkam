'use client'

import { ArrowRight, Moon, Palette, ScanFace, ShoppingBag, Sun, CalendarHeart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CartButton } from './shop/cart-drawer'

export function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2.5" aria-label="Vanakkam home">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
        <circle cx="15" cy="15" r="14" fill="var(--accent)" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <circle key={i} cx={15 + 8 * Math.cos((i * Math.PI) / 4)} cy={15 + 8 * Math.sin((i * Math.PI) / 4)} r="1.6" fill="var(--accent-ink)" />
        ))}
        <circle cx="15" cy="15" r="3" fill="var(--marigold)" />
      </svg>
      <span className="font-display text-[1.35rem] font-semibold tracking-tight">Vanakkam</span>
    </a>
  )
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false)
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), [])
  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {}
  }
  return (
    <button type="button" onClick={toggle} className="grid size-10 place-items-center rounded-full border border-line bg-surface transition hover:border-ink" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-6" aria-label="Main">
          <a href="#how" className="hidden text-sm font-semibold text-muted transition hover:text-ink sm:block">How it works</a>
          <a href="#studio" className="hidden text-sm font-semibold text-muted transition hover:text-ink sm:block">Studio</a>
          <ThemeToggle />
          <CartButton />
          <a href="#studio" className="btn btn-primary hidden !px-4 !py-2.5 text-xs min-[420px]:inline-flex sm:text-sm">Start scan</a>
        </nav>
      </div>
    </header>
  )
}

function HeroVisual() {
  const bars: [string, number][] = [['Hydration', 72], ['Radiance', 88], ['Under-eyes', 64]]
  return (
    <div className="relative mx-auto w-full max-w-[420px]" aria-hidden="true">
      {/* temple arch */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[2rem] border border-line bg-gradient-to-b from-marigold/80 via-accent/80 to-accent shadow-soft">
        <div className="kolam-bg absolute inset-0 opacity-40 mix-blend-overlay" />
        <svg viewBox="0 0 200 250" className="absolute inset-x-0 bottom-0 h-[78%] w-full">
          <ellipse cx="100" cy="112" rx="50" ry="62" fill="#c48d6b" />
          <path d="M52 100 C 50 40, 150 40, 148 100 C 150 70, 130 50, 100 52 C 70 50, 50 70, 52 100Z" fill="#2b1a17" />
          <path d="M30 250 C 40 190, 70 175, 100 175 C 130 175, 160 190, 170 250Z" fill="#7a1530" />
          <path d="M70 178 Q100 205 130 178" stroke="#d8b06a" strokeWidth="5" fill="none" />
          <ellipse cx="82" cy="108" rx="6" ry="3" fill="#2b1a17" />
          <ellipse cx="118" cy="108" rx="6" ry="3" fill="#2b1a17" />
          <path d="M90 140 Q100 147 110 140 Q100 151 90 140Z" fill="#8e1b3a" />
          <circle cx="100" cy="88" r="2.6" fill="#8e1b3a" />
          <rect className="scan-line" x="40" y="40" width="120" height="2" rx="1" fill="#fff3d1" opacity=".9" />
        </svg>
      </div>

      <div className="float card absolute -left-4 top-10 w-44 p-4 sm:-left-10">
        <p className="eyebrow !text-[0.6rem]">Beauty DNA</p>
        <div className="mt-3 flex items-center gap-2">
          {['#c48d6b', '#a5544f', '#3b2a1e'].map((c) => (
            <span key={c} className="size-7 rounded-full border border-line" style={{ background: c }} />
          ))}
        </div>
        <p className="mt-3 text-xs font-semibold">Warm · Medium depth</p>
      </div>

      <div className="float card absolute -right-3 bottom-16 w-48 p-4 [animation-delay:-3s] sm:-right-8">
        <p className="eyebrow !text-[0.6rem]">Skin scan</p>
        <div className="mt-3 space-y-2">
          {bars.map(([k, v]) => (
            <div key={k}>
              <div className="flex justify-between text-[0.68rem] font-semibold"><span>{k}</span><span>{v}</span></div>
              <div className="mt-1 h-1.5 rounded-full bg-surface-2"><div className="h-full rounded-full bg-accent" style={{ width: `${v}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="kolam-bg pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 md:grid-cols-[1.1fr_.9fr] md:pt-20">
        <div>
          <p className="eyebrow flex items-center gap-2"><span className="size-1.5 rounded-full bg-marigold" /> AI beauty studio · powered by YouCam</p>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,6vw,4.6rem)] font-medium leading-[0.98] tracking-tight">
            Your skin, <em className="text-accent">read</em> by AI.<br />
            Your look, made for <em className="text-accent">the moment.</em>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
            One selfie. We measure your undertone and skin health, design looks for your occasion, <strong className="text-ink">your outfit and your venue lighting</strong>, and try them on your face, using the exact product shades you can buy.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#studio" className="btn btn-primary">Open the studio <ArrowRight size={17} /></a>
            <a href="#how" className="btn btn-ghost">How it works</a>
          </div>
          <dl className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-5">
            {[['60', 'foundation shades matched by ΔE'], ['3', 'YouCam AI APIs per scan'], ['0', 'guesswork at checkout']].map(([n, l]) => (
              <div key={l}><dt className="font-display text-3xl text-accent">{n}</dt><dd className="mt-1 text-[0.7rem] leading-snug text-muted">{l}</dd></div>
            ))}
          </dl>
          <p className="mt-5 text-xs text-muted">Photos go only to YouCam for analysis and are never stored by us.</p>
        </div>
        <HeroVisual />
      </div>
    </section>
  )
}

const HOW = [
  { icon: CalendarHeart, title: 'Moment & outfit', body: 'Muhurtham, Sangeet, Diwali or a Monday, plus your outfit colour, the date and the lighting you’ll be in.' },
  { icon: ScanFace, title: 'Beauty DNA scan', body: 'One selfie. YouCam measures skin, lip and brow colour, undertone and 9 skin-health signals.' },
  { icon: Palette, title: 'Try on real shades', body: 'AI-designed looks matched to in-stock product shades (CIEDE2000), then rendered on your face.' },
  { icon: ShoppingBag, title: 'Shop & countdown', body: 'Buy the exact kit, get a skincare regimen chosen from your lowest scores, and order in time for the day.' },
]

const PROBLEMS = [
  { title: 'Wrong shade, sent back', body: 'Buying base makeup online is a guess. Each foundation shade here comes with a measured match score, and you see the runner-up too.' },
  { title: 'Looks that fight the outfit', body: 'A coral lip with a peacock-blue saree. Vanakkam reads your outfit colour and adjusts lips and lids to suit it.' },
  { title: 'Fine in the shop, flat in photos', body: 'Temple flash, stage lights and daylight each change how makeup reads. Every look is tuned for where you’ll actually be.' },
]

export function WhyItMatters() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="eyebrow">Why it matters</p>
      <h2 className="mt-2 max-w-2xl font-display text-3xl font-medium tracking-tight sm:text-4xl">Online beauty shopping has three big problems. <em className="text-accent">We fix all three.</em></h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PROBLEMS.map((p, i) => (
          <div key={p.title} className="rounded-2xl border border-line p-6">
            <span className="font-display text-4xl text-accent/40">0{i + 1}</span>
            <h3 className="mt-3 font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function HowItWorks() {
  return (
    <section id="how" className="border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">Less guesswork. <em className="text-accent">More you.</em></h2>
          <p className="max-w-sm text-sm text-muted">Most try-on apps give everyone the same red. Vanakkam builds every shade from your own measurements.</p>
        </div>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="rounded-2xl border border-line bg-bg p-5">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-full bg-accent/10 text-accent"><Icon size={19} /></span>
                <span className="font-display text-2xl text-muted/50">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-xs text-muted sm:px-6">
        <Logo />
        <p>Skin analysis, skin-tone analysis & makeup try-on by the YouCam API. Not medical advice.</p>
      </div>
    </footer>
  )
}
