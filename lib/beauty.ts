import { hexToHsl, hexToLab, hslToHex as hexFromHsl, mix, shift } from './color'
import { EYE_PALETTES, lipProductFor, nearest, PRODUCTS, snapEye, type Match, type Shade } from './catalog'

/* ───────────────────────── Profile (from YouCam results) ───────────────────────── */

export type Undertone = 'warm' | 'neutral' | 'cool'
export type Depth = 'fair' | 'medium' | 'deep'

export const CONCERNS = {
  moisture: 'Hydration',
  radiance: 'Radiance',
  texture: 'Smoothness',
  pore: 'Pores',
  oiliness: 'Oil balance',
  dark_circle_v2: 'Under-eyes',
  redness: 'Calmness',
  acne: 'Clarity',
  wrinkle: 'Fine lines',
} as const
export type Concern = keyof typeof CONCERNS

export type SkinReport = {
  scores: Partial<Record<Concern, number>>
  masks: Partial<Record<Concern, string>>
  overall?: number
  skinAge?: number
  skinType?: string
}

export type ToneReport = {
  skin: string
  lip: string
  brow: string
  eye: string
  quality?: { lighting?: string; frontal?: string; area?: string }
}

export type Profile = ToneReport & {
  undertone: Undertone
  depth: Depth
  skinReport?: SkinReport
}

export function parseTone(results: unknown): ToneReport {
  const r = results as { color?: Record<string, string>; face_quality?: ToneReport['quality'] }
  const c = r?.color ?? {}
  return {
    skin: c.skin_color ?? '#b98a6c',
    lip: c.lip_color ?? '#a5544f',
    brow: c.eyebrow_color ?? '#3b2a1e',
    eye: c.eye_color ?? '#2b1d14',
    quality: r?.face_quality,
  }
}

export function parseSkin(results: unknown): SkinReport {
  const out = ((results as { output?: Record<string, unknown>[] })?.output ?? []) as {
    type: string
    ui_score?: number
    score?: number
    skin_type?: string
    region?: string
    mask_urls?: string[]
  }[]
  const report: SkinReport = { scores: {}, masks: {} }
  for (const o of out) {
    if (o.type in CONCERNS && typeof o.ui_score === 'number') {
      report.scores[o.type as Concern] = Math.round(o.ui_score)
      if (o.mask_urls?.[0]) report.masks[o.type as Concern] = o.mask_urls[0]
    } else if (o.type === 'all' && typeof o.score === 'number') report.overall = Math.round(o.score)
    else if (o.type === 'skin_age' && typeof o.score === 'number') report.skinAge = Math.round(o.score)
    else if (o.type === 'skin_type' && (o.region === 'whole' || !report.skinType)) report.skinType = o.skin_type
  }
  return report
}

export function buildProfile(tone: ToneReport, skin?: SkinReport): Profile {
  const { L, a, b } = hexToLab(tone.skin)
  const ratio = b / Math.max(a, 1)
  const undertone: Undertone = ratio > 1.6 ? 'warm' : ratio < 1.15 ? 'cool' : 'neutral'
  const depth: Depth = L > 70 ? 'fair' : L > 52 ? 'medium' : 'deep'
  return { ...tone, undertone, depth, skinReport: skin }
}

export const UNDERTONE_COPY: Record<Undertone, string> = {
  warm: 'Golden-olive warmth — gold, copper and brick shades sing on you.',
  neutral: 'Balanced undertone — you can pull off both rose and gold.',
  cool: 'Rosy-pink base — berry, plum and blue-reds flatter most.',
}

/* ───────────────────────── Occasions & lighting ───────────────────────── */

export type Lighting = 'daylight' | 'flash' | 'stage'

export const LIGHTING: Record<Lighting, { label: string; hint: string }> = {
  daylight: { label: 'Daylight', hint: 'Outdoor, garden or window light' },
  flash: { label: 'Camera flash', hint: 'Temple halls & photographers' },
  stage: { label: 'Stage lights', hint: 'Evening receptions & parties' },
}

type LipFamily = 'nude' | 'rose' | 'red' | 'maroon' | 'berry' | 'coral' | 'brick' | 'mauve'
type EyeFamily = 'temple-gold' | 'kohl-smoke' | 'rose-gold' | 'plum-gold' | 'peach-soft' | 'emerald-gold' | 'copper' | 'champagne'
type BlushFamily = 'peach' | 'rose' | 'berry' | 'bronze'

export type Recipe = {
  id: string
  name: string
  story: string
  lip: { family: LipFamily; texture: 'matte' | 'satin' | 'gloss'; intensity: number }
  eyes: { family: EyeFamily; intensity: number }
  blush: { family: BlushFamily; intensity: number }
  liner: 'wing' | 'soft' | 'none'
  brows: 'SoftArch1' | 'HighArch1' | 'Straight1'
  base: { coverage: number; glow: number }
}

export type Occasion = { id: string; name: string; sub: string; lighting: Lighting; looks: Recipe[] }

const r = (o: Recipe) => o

export const OCCASIONS: Occasion[] = [
  {
    id: 'muhurtham',
    name: 'Muhurtham',
    sub: 'Wedding morning',
    lighting: 'flash',
    looks: [
      r({ id: 'temple-gold', name: 'Temple Gold', story: 'Deep maroon lip, antique-gold lids and a sharp kajal wing — built for silk, jasmine and a hundred flashes.', lip: { family: 'maroon', texture: 'satin', intensity: 78 }, eyes: { family: 'temple-gold', intensity: 65 }, blush: { family: 'bronze', intensity: 40 }, liner: 'wing', brows: 'SoftArch1', base: { coverage: 65, glow: 35 } }),
      r({ id: 'jasmine-glow', name: 'Jasmine Glow', story: 'Soft rose lip and rose-gold shimmer for brides who want to look like themselves, only luminous.', lip: { family: 'rose', texture: 'satin', intensity: 65 }, eyes: { family: 'rose-gold', intensity: 55 }, blush: { family: 'rose', intensity: 40 }, liner: 'soft', brows: 'SoftArch1', base: { coverage: 50, glow: 55 } }),
      r({ id: 'kanjeevaram-red', name: 'Kanjeevaram Red', story: 'The classic red lip, tuned to your undertone, with plum-gold eyes and a dramatic wing.', lip: { family: 'red', texture: 'matte', intensity: 82 }, eyes: { family: 'plum-gold', intensity: 60 }, blush: { family: 'berry', intensity: 35 }, liner: 'wing', brows: 'HighArch1', base: { coverage: 70, glow: 30 } }),
    ],
  },
  {
    id: 'mehendi',
    name: 'Mehendi & Haldi',
    sub: 'Daytime, colour, laughter',
    lighting: 'daylight',
    looks: [
      r({ id: 'marigold-fresh', name: 'Marigold Fresh', story: 'Juicy coral gloss and champagne lids that hold up to turmeric, sunshine and dancing.', lip: { family: 'coral', texture: 'gloss', intensity: 62 }, eyes: { family: 'champagne', intensity: 55 }, blush: { family: 'peach', intensity: 45 }, liner: 'soft', brows: 'Straight1', base: { coverage: 35, glow: 60 } }),
      r({ id: 'haldi-glow', name: 'Haldi Glow', story: 'Your own lip colour, deepened a shade, with peachy lids — barely-there, all glow.', lip: { family: 'nude', texture: 'satin', intensity: 60 }, eyes: { family: 'peach-soft', intensity: 45 }, blush: { family: 'peach', intensity: 40 }, liner: 'none', brows: 'Straight1', base: { coverage: 30, glow: 65 } }),
      r({ id: 'henna-rose', name: 'Henna Rose', story: 'Rose lips and rose-gold eyes that pick up the warmth of fresh mehendi.', lip: { family: 'rose', texture: 'gloss', intensity: 60 }, eyes: { family: 'rose-gold', intensity: 50 }, blush: { family: 'rose', intensity: 45 }, liner: 'soft', brows: 'SoftArch1', base: { coverage: 40, glow: 55 } }),
    ],
  },
  {
    id: 'sangeet',
    name: 'Sangeet & Reception',
    sub: 'Night, lights, dance floor',
    lighting: 'stage',
    looks: [
      r({ id: 'starlit-plum', name: 'Starlit Plum', story: 'Berry lip, plum-to-gold shimmer and a lifted wing that catches every stage light.', lip: { family: 'berry', texture: 'satin', intensity: 75 }, eyes: { family: 'plum-gold', intensity: 70 }, blush: { family: 'berry', intensity: 40 }, liner: 'wing', brows: 'HighArch1', base: { coverage: 60, glow: 45 } }),
      r({ id: 'smoked-kohl', name: 'Smoked Kohl', story: 'A smoky kohl eye balanced with a nude built from your own lip colour.', lip: { family: 'nude', texture: 'satin', intensity: 65 }, eyes: { family: 'kohl-smoke', intensity: 70 }, blush: { family: 'bronze', intensity: 40 }, liner: 'wing', brows: 'SoftArch1', base: { coverage: 55, glow: 40 } }),
      r({ id: 'reception-red', name: 'Reception Red', story: 'Glossy red and emerald-gold lids — the look for walking into the hall last.', lip: { family: 'red', texture: 'gloss', intensity: 78 }, eyes: { family: 'emerald-gold', intensity: 60 }, blush: { family: 'rose', intensity: 35 }, liner: 'wing', brows: 'HighArch1', base: { coverage: 60, glow: 45 } }),
    ],
  },
  {
    id: 'festive',
    name: 'Festival',
    sub: 'Diwali · Pongal · Onam · Eid',
    lighting: 'stage',
    looks: [
      r({ id: 'diya-gold', name: 'Diya Gold', story: 'Brick satin lip with molten-gold lids, like lamplight on brass.', lip: { family: 'brick', texture: 'satin', intensity: 72 }, eyes: { family: 'temple-gold', intensity: 60 }, blush: { family: 'bronze', intensity: 40 }, liner: 'soft', brows: 'SoftArch1', base: { coverage: 50, glow: 50 } }),
      r({ id: 'kasavu', name: 'Kasavu Minimal', story: 'Cream-and-gold restraint for a kasavu saree: champagne lids, nude lip, clean skin.', lip: { family: 'nude', texture: 'satin', intensity: 60 }, eyes: { family: 'champagne', intensity: 55 }, blush: { family: 'peach', intensity: 35 }, liner: 'soft', brows: 'Straight1', base: { coverage: 35, glow: 55 } }),
      r({ id: 'rangoli', name: 'Rangoli Pop', story: 'Berry lip with emerald-gold eyes — colourful, confident, made for photos with family.', lip: { family: 'berry', texture: 'gloss', intensity: 70 }, eyes: { family: 'emerald-gold', intensity: 60 }, blush: { family: 'rose', intensity: 40 }, liner: 'wing', brows: 'SoftArch1', base: { coverage: 50, glow: 45 } }),
    ],
  },
  {
    id: 'everyday',
    name: 'Everyday',
    sub: 'Office · college · coffee',
    lighting: 'daylight',
    looks: [
      r({ id: 'filter-coffee', name: 'Filter Coffee', story: 'Mauve-brown lip and soft copper lids — polished, never trying too hard.', lip: { family: 'mauve', texture: 'satin', intensity: 58 }, eyes: { family: 'copper', intensity: 40 }, blush: { family: 'bronze', intensity: 30 }, liner: 'soft', brows: 'Straight1', base: { coverage: 30, glow: 45 } }),
      r({ id: 'fresh-face', name: 'Fresh Face', story: 'Your-lips-but-better nude and a wash of peach. Five minutes, done.', lip: { family: 'nude', texture: 'gloss', intensity: 50 }, eyes: { family: 'peach-soft', intensity: 35 }, blush: { family: 'peach', intensity: 35 }, liner: 'none', brows: 'Straight1', base: { coverage: 25, glow: 55 } }),
      r({ id: 'monday-power', name: 'Monday Power', story: 'Rose matte lip and a thin kohl line for presentations and big meetings.', lip: { family: 'rose', texture: 'matte', intensity: 65 }, eyes: { family: 'kohl-smoke', intensity: 35 }, blush: { family: 'rose', intensity: 30 }, liner: 'soft', brows: 'SoftArch1', base: { coverage: 40, glow: 35 } }),
    ],
  },
  {
    id: 'date',
    name: 'Date Night',
    sub: 'Dinner, rooftop, movies',
    lighting: 'stage',
    looks: [
      r({ id: 'velvet-berry', name: 'Velvet Berry', story: 'Matte berry lip with smoky lids — moody and soft at once.', lip: { family: 'berry', texture: 'matte', intensity: 75 }, eyes: { family: 'kohl-smoke', intensity: 55 }, blush: { family: 'berry', intensity: 35 }, liner: 'wing', brows: 'SoftArch1', base: { coverage: 45, glow: 45 } }),
      r({ id: 'bronzed', name: 'Bronzed', story: 'Copper lids, brick lip, sun-warmed cheeks — glows in candlelight.', lip: { family: 'brick', texture: 'gloss', intensity: 65 }, eyes: { family: 'copper', intensity: 60 }, blush: { family: 'bronze', intensity: 45 }, liner: 'soft', brows: 'SoftArch1', base: { coverage: 40, glow: 60 } }),
      r({ id: 'classic-red', name: 'Classic Red', story: 'One perfect red, matched to your undertone, and a clean wing. Nothing else needed.', lip: { family: 'red', texture: 'satin', intensity: 80 }, eyes: { family: 'champagne', intensity: 35 }, blush: { family: 'rose', intensity: 30 }, liner: 'wing', brows: 'HighArch1', base: { coverage: 45, glow: 40 } }),
    ],
  },
]

/* ───────────────────────── Shade generation ───────────────────────── */

const LIP_BASE: Record<Exclude<LipFamily, 'nude'>, { h: number; s: number; l: number }> = {
  rose: { h: 350, s: 45, l: 52 },
  red: { h: 355, s: 76, l: 40 },
  maroon: { h: 350, s: 62, l: 26 },
  berry: { h: 332, s: 48, l: 34 },
  coral: { h: 10, s: 72, l: 58 },
  brick: { h: 12, s: 55, l: 36 },
  mauve: { h: 345, s: 24, l: 46 },
}
const BLUSH_BASE: Record<BlushFamily, { h: number; s: number; l: number }> = {
  peach: { h: 18, s: 62, l: 66 },
  rose: { h: 352, s: 46, l: 62 },
  berry: { h: 340, s: 40, l: 46 },
  bronze: { h: 22, s: 42, l: 46 },
}
const EYES: Record<EyeFamily, { label: string; colors: string[]; shimmerLast: boolean }> = {
  'temple-gold': { label: 'Bronze → antique gold', colors: ['#6b3a22', '#c9a14a'], shimmerLast: true },
  'kohl-smoke': { label: 'Kohl smoke', colors: ['#2b2222', '#6e5a50'], shimmerLast: false },
  'rose-gold': { label: 'Rose gold', colors: ['#b5776a', '#e8b9a0'], shimmerLast: true },
  'plum-gold': { label: 'Plum → gold', colors: ['#4e2a3c', '#8a4a5a', '#d4a64a'], shimmerLast: true },
  'peach-soft': { label: 'Soft peach', colors: ['#d9a183', '#f2d3bd'], shimmerLast: false },
  'emerald-gold': { label: 'Emerald & gold', colors: ['#1f5a46', '#d4a64a'], shimmerLast: true },
  copper: { label: 'Copper', colors: ['#8a4a2a', '#d07a45'], shimmerLast: true },
  champagne: { label: 'Champagne', colors: ['#e6cfa7'], shimmerLast: true },
}

const depthAdj: Record<Depth, { l: number; s: number }> = { fair: { l: 6, s: -4 }, medium: { l: 0, s: 0 }, deep: { l: -9, s: 6 } }
const toneHue: Record<Undertone, number> = { warm: 7, neutral: 0, cool: -7 }

export function lipShade(family: LipFamily, p: Profile) {
  if (family === 'nude') {
    // Built from the person's own measured lip colour, pulled toward skin and deepened slightly.
    const base = mix(p.lip, p.skin, 0.3)
    return shift(base, { l: p.depth === 'deep' ? -6 : -10, s: 4 })
  }
  const b = LIP_BASE[family]
  const d = depthAdj[p.depth]
  return hexFromHsl({ h: b.h + toneHue[p.undertone], s: b.s + d.s, l: b.l + d.l })
}

export function blushShade(family: BlushFamily, p: Profile) {
  const b = BLUSH_BASE[family]
  const d = p.depth === 'deep' ? { l: -14, s: 10 } : p.depth === 'fair' ? { l: 6, s: -6 } : { l: 0, s: 0 }
  return hexFromHsl({ h: b.h + toneHue[p.undertone] * 0.6, s: b.s + d.s, l: b.l + d.l })
}

export function eyeColors(family: EyeFamily, p: Profile) {
  const deepen = p.depth === 'deep' ? -6 : 0
  return EYES[family].colors.map((c) => (deepen ? shift(c, { l: deepen, s: 4 }) : c))
}


/* ───────────────────────── Outfit harmony ───────────────────────── */

export type OutfitTone = 'warm' | 'cool' | 'neutral'

export const OUTFIT_PRESETS: { name: string; hex: string }[] = [
  { name: 'Kanjeevaram red', hex: '#b3122e' },
  { name: 'Temple maroon', hex: '#6d1426' },
  { name: 'Haldi yellow', hex: '#e9b21c' },
  { name: 'Marigold orange', hex: '#e8741c' },
  { name: 'Rani pink', hex: '#d0266f' },
  { name: 'Peacock blue', hex: '#0e6f86' },
  { name: 'Emerald green', hex: '#1d6b45' },
  { name: 'Royal purple', hex: '#5b2a86' },
  { name: 'Kasavu ivory', hex: '#efe4cc' },
  { name: 'Classic black', hex: '#1b1b1f' },
]

export function outfitTone(hex: string): OutfitTone {
  const { h, s, l } = hexToHsl(hex)
  if (s < 20 || l > 84 || l < 12) return 'neutral'
  return h < 70 || h >= 342 ? 'warm' : 'cool'
}

export function outfitName(hex: string) {
  const preset = OUTFIT_PRESETS.find((p) => p.hex.toLowerCase() === hex.toLowerCase())
  if (preset) return preset.name.toLowerCase()
  return `${outfitTone(hex)}-toned outfit`
}

/* ───────────────────────── Look → products → YouCam effects ───────────────────────── */

export type Tweaks = { lip?: string; lipIntensity?: number; eyeIntensity?: number; blushIntensity?: number; glow?: number }

export type KitItem = { productId: string; shade?: Shade; match?: Match; role: string }

export type ResolvedLook = {
  recipe: Recipe
  swatches: { lip: string; eyes: string[]; blush: string; foundation: string; eyeLabel: string }
  lipOptions: Shade[]
  lipShade: Shade
  matches: { foundation: Match; lip: Match; blush: Match; brow: Match }
  kit: KitItem[]
  effects: Record<string, unknown>[]
  notes: string[]
}

const cl = (v: number) => Math.round(Math.min(100, Math.max(0, v)))

export function resolveLook(recipe: Recipe, p: Profile, lighting: Lighting, tweaks: Tweaks = {}, outfit?: string | null): ResolvedLook {
  const s = p.skinReport?.scores ?? {}
  const notes: string[] = []

  // Lighting modifiers — the part most try-on apps ignore.
  const L = {
    daylight: { lip: -8, eye: -10, blush: -5, glow: 10, coverage: -10, shimmer: 0 },
    flash: { lip: 8, eye: 0, blush: 10, glow: -18, coverage: 10, shimmer: -15 },
    stage: { lip: 4, eye: 10, blush: 0, glow: 5, coverage: 0, shimmer: 15 },
  }[lighting]

  if (lighting === 'flash') notes.push('Flash flattens colour, so lips and blush are pushed up a notch and glow is cut to stop forehead flashback.')
  if (lighting === 'daylight') notes.push('Daylight shows everything, so intensities are softened and skin is kept dewy.')
  if (lighting === 'stage') notes.push('Warm stage lights eat shimmer, so lid sparkle is boosted.')

  // Skin-driven base tuning.
  let coverage = recipe.base.coverage + L.coverage
  let glow = recipe.base.glow + L.glow
  if ((s.texture ?? 100) < 70 || (s.pore ?? 100) < 65) {
    coverage += 10
    notes.push('Your scan showed visible texture/pores, so base coverage was raised slightly.')
  }
  if ((s.oiliness ?? 100) < 60) {
    glow -= 15
    notes.push('Oil-prone zones detected — glow dialled down to keep you matte longer.')
  } else if ((s.radiance ?? 100) < 70 || (s.moisture ?? 100) < 65) {
    glow += 12
    notes.push('Radiance read a little low — extra glow added to bring skin to life.')
  }
  if ((s.dark_circle_v2 ?? 100) < 70) notes.push('Under-eye shadows detected — tap a peach corrector before concealer.')
  glow = tweaks.glow ?? glow

  // Outfit harmony: lips and lids respond to what you're wearing.
  let lipFamily = recipe.lip.family
  let eyeIdeal = eyeColors(recipe.eyes.family, p)
  if (outfit) {
    const tone = outfitTone(outfit)
    const name = outfitName(outfit)
    const swap: Partial<Record<LipFamily, LipFamily>> =
      tone === 'cool' ? { coral: 'rose', brick: 'berry' } : tone === 'warm' ? { berry: 'maroon', mauve: 'brick' } : {}
    const swapped = swap[lipFamily]
    if (swapped) {
      notes.push(`Your ${name} is ${tone}-toned, so the ${lipFamily} lip was swapped for ${swapped} to avoid a clash.`)
      lipFamily = swapped
    } else if (tone !== 'neutral') {
      const lipTone: OutfitTone = (['red', 'maroon', 'brick', 'coral'] as LipFamily[]).includes(lipFamily) ? 'warm' : lipFamily === 'nude' ? 'neutral' : 'cool'
      if (lipTone === tone) notes.push(`The lip sits in the same ${tone} family as your ${name}, so the whole look reads as one.`)
      else if (lipTone === 'neutral') notes.push(`A skin-true nude lets your ${name} do the talking.`)
      else notes.push(`A deep ${lipFamily} lip is a classic contrast against your ${name} — rich, not clashing.`)
    }
    const { s: sat } = hexToHsl(outfit)
    if (tone !== 'neutral' && sat > 35) {
      eyeIdeal = [mix(eyeIdeal[0], outfit, 0.55), ...eyeIdeal.slice(1)]
      notes.push(`Your lids pick up a hint of your ${name}.`)
    } else if (tone === 'neutral') {
      notes.push(`A ${name} is a blank canvas — the look leans on gold and skin-true tones.`)
    }
  }

  // AI ideal → nearest real product shade (CIEDE2000). The try-on renders the exact SKU you would buy.
  const fMatch = nearest(p.skin, PRODUCTS.foundation.shades!)
  const lipMatch = nearest(tweaks.lip ?? lipShade(lipFamily, p), PRODUCTS['lip-satin'].shades!)
  const blushMatch = nearest(blushShade(recipe.blush.family, p), PRODUCTS.blush.shades!)
  const browMatch = nearest(p.brow, PRODUCTS.brow.shades!)
  const eyeShades = eyeIdeal.map((c) => snapEye(c))
  const eyes = eyeShades.map((e) => e.hex)

  notes.unshift(`Foundation ${fMatch.shade.code} is a ${fMatch.percent}% match to your measured skin (ΔE ${fMatch.de.toFixed(1)}) — no grey or white cast in photos.`)

  const families: LipFamily[] = [lipFamily, 'nude', 'rose', 'red', 'maroon', 'berry', 'brick', 'coral', 'mauve']
  const lipOptions = Array.from(new Map(families.map((f) => nearest(lipShade(f, p), PRODUCTS['lip-satin'].shades!).shade).map((sh) => [sh.code, sh])).values()).slice(0, 8)

  const lipI = cl(tweaks.lipIntensity ?? recipe.lip.intensity + L.lip)
  const eyeI = cl(tweaks.eyeIntensity ?? recipe.eyes.intensity + L.eye)
  const blushI = cl(tweaks.blushIntensity ?? recipe.blush.intensity + L.blush)
  const shimmerI = cl(55 + L.shimmer)

  const lipPalette: Record<string, unknown> = { color: lipMatch.shade.hex, texture: recipe.lip.texture, colorIntensity: lipI }
  if (recipe.lip.texture === 'gloss') Object.assign(lipPalette, { gloss: lighting === 'flash' ? 40 : 65, transparencyIntensity: 30 })

  const eyeDef = EYES[recipe.eyes.family]
  const eyePalettes = eyes.map((color, i) => {
    const shimmer = eyeDef.shimmerLast && i === eyes.length - 1
    return shimmer
      ? { color, texture: 'shimmer', shimmerColor: '#fff3d1', shimmerIntensity: shimmerI, colorIntensity: eyeI }
      : { color, texture: 'matte', colorIntensity: eyeI }
  })

  const effects: Record<string, unknown>[] = [
    { category: 'foundation', palettes: [{ color: fMatch.shade.hex, colorIntensity: 45, glowIntensity: cl(glow), coverageIntensity: cl(coverage) }] },
    { category: 'blush', pattern: { name: '1color1' }, palettes: [{ color: blushMatch.shade.hex, texture: 'matte', colorIntensity: blushI }] },
    { category: 'eye_shadow', pattern: { name: `${eyes.length}color${eyes.length > 1 ? 's' : ''}1` }, palettes: eyePalettes },
    {
      category: 'eyebrows',
      pattern: { type: 'shape', name: recipe.brows, curvature: 0, thickness: 5, definition: 35 },
      palettes: [{ color: browMatch.shade.hex, colorIntensity: 45, texture: 'matte' }],
    },
    { category: 'lip_color', shape: { name: 'original' }, style: { type: 'full' }, palettes: [lipPalette] },
  ]
  if (recipe.liner !== 'none') {
    effects.push({
      category: 'eye_liner',
      pattern: { name: recipe.liner === 'wing' ? 'Arabic3' : '2colors1' },
      palettes: [{ color: '#141010', texture: 'matte', colorIntensity: recipe.liner === 'wing' ? 80 : 55 }],
    })
  }

  const palettes = Array.from(new Set(eyeShades.map((e) => e.palette)))
  const kit: KitItem[] = [
    { productId: 'foundation', shade: fMatch.shade, match: fMatch, role: 'Base' },
    ...palettes.map((id) => ({ productId: `eyes-${id}`, role: 'Eyes' })),
    ...(recipe.liner === 'none' ? [] : [{ productId: recipe.liner === 'wing' ? 'liner-wing' : 'liner-soft', role: 'Liner' }]),
    { productId: 'brow', shade: browMatch.shade, match: browMatch, role: 'Brows' },
    { productId: 'blush', shade: blushMatch.shade, match: blushMatch, role: 'Cheeks' },
    { productId: lipProductFor(recipe.lip.texture).id, shade: lipMatch.shade, match: lipMatch, role: 'Lips' },
  ]

  return {
    recipe,
    swatches: { lip: lipMatch.shade.hex, eyes, blush: blushMatch.shade.hex, foundation: fMatch.shade.hex, eyeLabel: palettes.map((id) => EYE_PALETTES.find((e) => e.id === id)!.name).join(' + ') },
    lipOptions,
    lipShade: lipMatch.shade,
    matches: { foundation: fMatch, lip: lipMatch, blush: blushMatch, brow: browMatch },
    kit,
    effects,
    notes,
  }
}
