export type HSL = { h: number; s: number; l: number }

const clamp = (v: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v))

export function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '').padEnd(6, '0')
  return [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16)) as [number, number, number]
}

export function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('')
}

export function hexToHsl(hex: string): HSL {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: l * 100 }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h *= 60
  return { h, s: s * 100, l: l * 100 }
}

export function hslToHex({ h, s, l }: HSL) {
  const hh = ((h % 360) + 360) % 360
  const ss = clamp(s) / 100
  const ll = clamp(l) / 100
  const k = (n: number) => (n + hh / 30) % 12
  const a = ss * Math.min(ll, 1 - ll)
  const f = (n: number) => ll - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255)
}

export function mix(a: string, b: string, t: number) {
  const ra = hexToRgb(a)
  const rb = hexToRgb(b)
  return rgbToHex(...(ra.map((v, i) => v + (rb[i] - v) * t) as [number, number, number]))
}

export function shift(hex: string, d: Partial<HSL>) {
  const c = hexToHsl(hex)
  return hslToHex({ h: c.h + (d.h ?? 0), s: c.s + (d.s ?? 0), l: c.l + (d.l ?? 0) })
}

/** CIE L*a*b* (D65) — used to read depth and undertone from a measured skin colour. */
export function hexToLab(hex: string) {
  const lin = hexToRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const [r, g, b] = lin
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  return { L: 116 * f(y) - 16, a: 500 * (f(x) - f(y)), b: 200 * (f(y) - f(z)) }
}

/** CIEDE2000 colour difference — the industry standard for "does this shade match?". <1 imperceptible, <3 close, >6 clearly different. */
export function deltaE(hex1: string, hex2: string) {
  const c1 = hexToLab(hex1)
  const c2 = hexToLab(hex2)
  const rad = Math.PI / 180
  const C1 = Math.hypot(c1.a, c1.b)
  const C2 = Math.hypot(c2.a, c2.b)
  const Cm = (C1 + C2) / 2
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)))
  const a1 = c1.a * (1 + G)
  const a2 = c2.a * (1 + G)
  const C1p = Math.hypot(a1, c1.b)
  const C2p = Math.hypot(a2, c2.b)
  const h = (b: number, a: number) => {
    const v = Math.atan2(b, a) / rad
    return v < 0 ? v + 360 : v
  }
  const h1 = h(c1.b, a1)
  const h2 = h(c2.b, a2)
  const dL = c2.L - c1.L
  const dC = C2p - C1p
  let dh = 0
  if (C1p * C2p !== 0) dh = Math.abs(h2 - h1) <= 180 ? h2 - h1 : h2 - h1 > 180 ? h2 - h1 - 360 : h2 - h1 + 360
  const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin((dh / 2) * rad)
  const Lm = (c1.L + c2.L) / 2
  const Cpm = (C1p + C2p) / 2
  let hm = h1 + h2
  if (C1p * C2p !== 0) hm = Math.abs(h1 - h2) <= 180 ? (h1 + h2) / 2 : h1 + h2 < 360 ? (h1 + h2 + 360) / 2 : (h1 + h2 - 360) / 2
  const T = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad) + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.2 * Math.cos((4 * hm - 63) * rad)
  const dTheta = 30 * Math.exp(-(((hm - 275) / 25) ** 2))
  const Rc = 2 * Math.sqrt(Cpm ** 7 / (Cpm ** 7 + 25 ** 7))
  const Sl = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2)
  const Sc = 1 + 0.045 * Cpm
  const Sh = 1 + 0.015 * Cpm * T
  const Rt = -Math.sin(2 * dTheta * rad) * Rc
  return Math.sqrt((dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh))
}

/** Maps a ΔE00 distance to a shopper-friendly match percentage. */
export function matchPercent(de: number) {
  return Math.max(50, Math.round(100 - de * 4.5))
}

/** Dominant non-neutral colour of an image region (used for outfit photos). */
export function dominantColor(data: Uint8ClampedArray) {
  const buckets = new Map<string, { n: number; r: number; g: number; b: number }>()
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    if (data[i + 3] < 200) continue
    const key = `${r >> 5}-${g >> 5}-${b >> 5}`
    const e = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 }
    e.n++; e.r += r; e.g += g; e.b += b
    buckets.set(key, e)
  }
  // Prefer saturated buckets — fabric colour, not background.
  let best = { score: -1, hex: '#808080' }
  for (const e of buckets.values()) {
    const hex = rgbToHex(e.r / e.n, e.g / e.n, e.b / e.n)
    const { s, l } = hexToHsl(hex)
    const score = e.n * (0.35 + s / 100) * (l > 8 && l < 94 ? 1 : 0.2)
    if (score > best.score) best = { score, hex }
  }
  return best.hex
}

/** Readable text colour on top of a swatch. */
export function onColor(hex: string) {
  return hexToLab(hex).L > 62 ? '#2a1418' : '#fff8ef'
}
