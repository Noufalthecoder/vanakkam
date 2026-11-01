import { deltaE, hexToHsl, hslToHex, matchPercent, mix } from './color'
import type { Concern } from './beauty'

/* Vanakkam Beauty — the demo store's own house brand (no third-party trademarks). Prices in INR. */

export type Shade = { code: string; name: string; hex: string }
export type Product = {
  id: string
  name: string
  kind: 'makeup' | 'skincare'
  category: string
  price: number
  size: string
  blurb: string
  shades?: Shade[]
  days?: number // supply length, for skincare
}

/* ── Foundation: 40 shades = 20 depths × 2 + neutral … built from a measured skin ramp ── */
const KEY_RAMP = ['#f3d6c3', '#ebc8ae', '#e2b998', '#d6a886', '#c99773', '#b98563', '#a57353', '#8f6045', '#774d37', '#5e3b2b', '#4a2e22']
const DEPTH_RAMP = KEY_RAMP.slice(0, -1).flatMap((hex, i) => [hex, mix(hex, KEY_RAMP[i + 1], 0.5)])
const UT = { W: { h: 4, s: 8 }, N: { h: 0, s: 0 }, C: { h: -7, s: -8 } } as const
const foundationShades: Shade[] = DEPTH_RAMP.flatMap((hex, i) =>
  (Object.keys(UT) as (keyof typeof UT)[]).map((u) => {
    const c = hexToHsl(hex)
    const n = 10 + i * 2
    return { code: `${n}${u}`, name: `${n}${u} · ${u === 'W' ? 'Warm' : u === 'C' ? 'Cool' : 'Neutral'}`, hex: hslToHex({ h: c.h + UT[u].h, s: c.s - 7 + UT[u].s, l: c.l }) }
  }),
)

const LIP_SHADES: Shade[] = [
  ['Sandalwood', '#c08f7e'], ['Chai Latte', '#b07a6a'], ['Cinnamon', '#9a5a4c'], ['Toffee', '#8a5544'], ['Cocoa', '#6e3d33'],
  ['Rose Water', '#d07f8a'], ['Gulab', '#c0566a'], ['Paan Rose', '#a84a5c'], ['Dusky Rose', '#9a5560'],
  ['Mirchi', '#d43f3a'], ['Sindoor', '#c0231e'], ['Chilli', '#c63b2b'], ['Kanchi Red', '#a51c2a'],
  ['Kathakali', '#7d2030'], ['Temple Maroon', '#6b1a24'], ['Wine', '#5a1a2a'],
  ['Berry Kheer', '#8e3a5a'], ['Plum', '#7a3050'], ['Jamun', '#6a2448'],
  ['Papaya', '#e88063'], ['Marigold Coral', '#e0704e'], ['Mango', '#d9653f'],
  ['Sienna', '#b05a3c'], ['Terracotta', '#a3462e'], ['Brick Kolam', '#8e4229'],
  ['Mauve Masala', '#8f5a62'], ['Filter Coffee', '#7d4b4f'],
  ['Kumkum Deep', '#5e1420'], ['Black Cherry', '#4a1424'], ['Mocha', '#5a3028'], ['Deep Berry', '#5a1f3c'], ['Rosewood', '#7a3a3a'], ['Spiced Rum', '#8a3a2a'],
].map(([name, hex], i) => ({ code: `L${String(i + 1).padStart(2, '0')}`, name, hex }))

const BLUSH_SHADES: Shade[] = [
  ['Peach Lassi', '#e8a07c'], ['Apricot', '#df9a73'], ['Coral Burst', '#e47a63'], ['Rose Sherbet', '#d67d84'],
  ['Deep Rose', '#b3586a'], ['Berry', '#a4485e'], ['Honey', '#c98a5a'], ['Bronze Dusk', '#a8714c'], ['Mahogany', '#8a4a3a'],
  ['Cinnamon Glow', '#b0603e'], ['Brick Rose', '#9a4a40'], ['Deep Plum', '#7a2e4a'], ['Fig', '#8e3a52'], ['Terracotta', '#b8573f'], ['Soft Pink', '#e7a3a8'],
].map(([name, hex], i) => ({ code: `B${i + 1}`, name, hex }))

export const EYE_PALETTES: { id: string; name: string; shades: Shade[] }[] = [
  ['temple-gold', 'Temple Gold', ['#6b3a22', '#c9a14a', '#8c5a2e', '#e6c27a']],
  ['rose-gold', 'Rose Gold', ['#b5776a', '#e8b9a0', '#9a5b52', '#f1d0bd']],
  ['plum-night', 'Plum Night', ['#4e2a3c', '#8a4a5a', '#d4a64a', '#2e1a26']],
  ['kohl-smoke', 'Kohl & Smoke', ['#2b2222', '#6e5a50', '#4a3b36', '#a08a7e']],
  ['peach-soft', 'Peach Soft', ['#d9a183', '#f2d3bd', '#c48868', '#e8b89a']],
  ['peacock', 'Peacock', ['#1f5a46', '#d4a64a', '#1d4a6b', '#2f7a6a']],
  ['copper-diya', 'Copper Diya', ['#8a4a2a', '#d07a45', '#b0603a', '#e8a46a']],
  ['champagne', 'Champagne Kasavu', ['#e6cfa7', '#f4e6c8', '#c9a878', '#fff3d6']],
  ['bridal-silk', 'Bridal Silk', ['#7a1530', '#b8484f', '#5a2a5a', '#d8b06a']],
].map(([id, name, hexes]) => ({ id: id as string, name: name as string, shades: (hexes as string[]).map((hex, i) => ({ code: `${(id as string).slice(0, 3).toUpperCase()}-${i + 1}`, name: `${name} ${i + 1}`, hex })) }))

const BROW_SHADES: Shade[] = [['Taupe', '#6b5546'], ['Soft Brown', '#5a3f2e'], ['Dark Brown', '#3b2a1e'], ['Soft Black', '#241b17'], ['Ash Brown', '#5b5352'], ['Grey Taupe', '#6f6763'], ['Charcoal', '#3d393a'], ['Auburn', '#7a4a32']].map(([name, hex], i) => ({ code: `BR${i + 1}`, name, hex }))

export const PRODUCTS: Record<string, Product> = {
  foundation: { id: 'foundation', name: 'Second Skin Serum Foundation', kind: 'makeup', category: 'Base', price: 1199, size: '30 ml', blurb: 'Buildable, breathable, sweat-proof for 16 hours.', shades: foundationShades },
  'lip-matte': { id: 'lip-matte', name: 'Kumkum Matte Lipstick', kind: 'makeup', category: 'Lips', price: 649, size: '4.2 g', blurb: 'Transfer-resistant velvet matte.', shades: LIP_SHADES },
  'lip-satin': { id: 'lip-satin', name: 'Silk Satin Lipstick', kind: 'makeup', category: 'Lips', price: 699, size: '4.2 g', blurb: 'Creamy colour with a soft sheen.', shades: LIP_SHADES },
  'lip-gloss': { id: 'lip-gloss', name: 'Jasmine Gloss', kind: 'makeup', category: 'Lips', price: 549, size: '6 ml', blurb: 'Cushiony shine, never sticky.', shades: LIP_SHADES },
  blush: { id: 'blush', name: 'Cheek Glow Blush', kind: 'makeup', category: 'Cheeks', price: 549, size: '5 g', blurb: 'Silky powder that blends like a cream.', shades: BLUSH_SHADES },
  ...Object.fromEntries(
    EYE_PALETTES.map((p) => [`eyes-${p.id}`, { id: `eyes-${p.id}`, name: `${p.name} Eye Palette`, kind: 'makeup', category: 'Eyes', price: 1299, size: '4 × 1.5 g', blurb: 'Four coordinated shades, mattes + shimmer.', shades: p.shades } satisfies Product]),
  ),
  'liner-wing': { id: 'liner-wing', name: 'Kajal Wing Liner', kind: 'makeup', category: 'Eyes', price: 399, size: '0.6 ml', blurb: 'Felt-tip precision, smudge-proof all day.' },
  'liner-soft': { id: 'liner-soft', name: 'Soft Kohl Pencil', kind: 'makeup', category: 'Eyes', price: 349, size: '1.2 g', blurb: 'Smudgeable kohl for the waterline.' },
  brow: { id: 'brow', name: 'Brow Define Pencil', kind: 'makeup', category: 'Brows', price: 449, size: '0.3 g', blurb: 'Hair-like strokes with a spoolie.', shades: BROW_SHADES },

  spf: { id: 'spf', name: 'Gel Sunscreen SPF 50', kind: 'skincare', category: 'Daily essential', price: 599, size: '50 ml', blurb: 'No white cast, no flashback.', days: 60 },
  cleanser: { id: 'cleanser', name: 'Gentle Rice Cleanser', kind: 'skincare', category: 'Daily essential', price: 449, size: '100 ml', blurb: 'Low-foam, pH-balanced.', days: 75 },
  moisture: { id: 'moisture', name: 'Hyaluronic Dew Serum', kind: 'skincare', category: 'Hydration', price: 899, size: '30 ml', blurb: 'Three weights of hyaluronic acid.', days: 60 },
  radiance: { id: 'radiance', name: 'Vitamin C + Haldi Glow Serum', kind: 'skincare', category: 'Radiance', price: 999, size: '30 ml', blurb: 'Stable vitamin C with turmeric extract.', days: 45 },
  texture: { id: 'texture', name: 'Lactic Smooth Night Peel', kind: 'skincare', category: 'Smoothness', price: 849, size: '30 ml', blurb: 'Gentle 5% lactic acid, twice a week.', days: 90 },
  pore: { id: 'pore', name: 'Niacinamide 10% Pore Serum', kind: 'skincare', category: 'Pores', price: 749, size: '30 ml', blurb: 'Refines pores, balances oil.', days: 60 },
  oiliness: { id: 'oiliness', name: 'Multani Mitti Clarifying Mask', kind: 'skincare', category: 'Oil balance', price: 599, size: '100 g', blurb: 'Fuller’s earth + rose water.', days: 90 },
  dark_circle_v2: { id: 'dark_circle_v2', name: 'Caffeine + Kesar Eye Cream', kind: 'skincare', category: 'Under-eyes', price: 799, size: '15 ml', blurb: 'De-puffs and brightens.', days: 60 },
  redness: { id: 'redness', name: 'Centella Calm Barrier Cream', kind: 'skincare', category: 'Calmness', price: 749, size: '50 ml', blurb: 'Fragrance-free ceramide repair.', days: 60 },
  acne: { id: 'acne', name: 'Salicylic Clear Spot Gel', kind: 'skincare', category: 'Clarity', price: 449, size: '15 ml', blurb: '2% BHA for active spots only.', days: 90 },
  wrinkle: { id: 'wrinkle', name: 'Bakuchiol Night Serum', kind: 'skincare', category: 'Fine lines', price: 1099, size: '30 ml', blurb: 'Plant-based retinol alternative, safe before events.', days: 60 },
}

export const REGIMEN_FOR: Record<Concern, string> = {
  moisture: 'moisture', radiance: 'radiance', texture: 'texture', pore: 'pore', oiliness: 'oiliness',
  dark_circle_v2: 'dark_circle_v2', redness: 'redness', acne: 'acne', wrinkle: 'wrinkle',
}

/* ── Shade snapping ── */

export type Match = { shade: Shade; de: number; percent: number; runnerUp?: Shade }

export function nearest(target: string, shades: Shade[]): Match {
  const ranked = shades.map((s) => ({ s, d: deltaE(target, s.hex) })).sort((a, b) => a.d - b.d)
  return { shade: ranked[0].s, de: ranked[0].d, percent: matchPercent(ranked[0].d), runnerUp: ranked[1]?.s }
}

export const ALL_EYE_SHADES = EYE_PALETTES.flatMap((p) => p.shades.map((s) => ({ ...s, palette: p.id })))

export function snapEye(target: string) {
  const ranked = ALL_EYE_SHADES.map((s) => ({ s, d: deltaE(target, s.hex) })).sort((a, b) => a.d - b.d)
  return ranked[0].s
}

export const lipProductFor = (texture: 'matte' | 'satin' | 'gloss') => PRODUCTS[`lip-${texture}`]

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`
