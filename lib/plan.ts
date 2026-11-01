import { CONCERNS, type Concern, type Lighting, type SkinReport } from './beauty'

const RITUALS: Record<Concern, { daily: string; home: string }> = {
  moisture: { daily: 'Hyaluronic serum on damp skin, morning and night, sealed with moisturiser.', home: 'Aloe vera gel as an overnight mask, twice a week.' },
  radiance: { daily: 'Vitamin C serum every morning under sunscreen.', home: 'Besan + curd + a pinch of haldi pack, twice a week.' },
  texture: { daily: 'Gentle lactic-acid exfoliant, two nights a week.', home: 'Rice-water toner after cleansing.' },
  pore: { daily: 'Niacinamide serum every night.', home: 'Multani mitti on the T-zone once a week.' },
  oiliness: { daily: 'Light gel moisturiser + niacinamide; blot, don’t powder.', home: 'Multani mitti + rose water on the T-zone weekly.' },
  dark_circle_v2: { daily: 'Caffeine eye cream and a real 7–8 hours of sleep.', home: 'Chilled spoons or cucumber slices for 10 minutes each morning.' },
  redness: { daily: 'Fragrance-free barrier cream; skip scrubs entirely.', home: 'Cold-milk compress on flushed areas.' },
  acne: { daily: 'Salicylic spot gel on active spots only — no picking.', home: 'Change pillowcases twice a week.' },
  wrinkle: { daily: 'SPF every morning; bakuchiol at night — gentle enough to use right up to the event.', home: 'Two-minute upward facial massage with almond or kumkumadi oil.' },
}

export type PlanStep = { daysBefore: number; date: Date; title: string; items: string[] }
export type Plan = { focus: { concern: Concern; label: string; score: number; daily: string; home: string }[]; steps: PlanStep[]; daysLeft: number }

export function buildPlan(eventDate: Date, skin: SkinReport | undefined, lighting: Lighting, lookName: string): Plan {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const event = new Date(eventDate)
  event.setHours(0, 0, 0, 0)
  const daysLeft = Math.max(0, Math.round((event.getTime() - today.getTime()) / 86_400_000))

  const focus = (Object.entries(skin?.scores ?? {}) as [Concern, number][])
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([concern, score]) => ({ concern, label: CONCERNS[concern], score, ...RITUALS[concern] }))

  const primary = focus[0]
  const milestones: { d: number; title: string; items: string[] }[] = [
    {
      d: 28,
      title: 'Start the ritual',
      items: [
        `Book a makeup trial and show your artist “${lookName}”.`,
        primary ? `Start your focus routine: ${primary.daily}` : 'Start a simple cleanse → moisturise → SPF routine.',
        'Patch-test every new product on your jawline for 48 hours.',
      ],
    },
    {
      d: 14,
      title: 'Last call for new products',
      items: ['No new actives or facials after today — your skin needs time to settle.', ...focus.slice(1).map((f) => `${f.label}: ${f.home}`)],
    },
    { d: 7, title: 'Hydration week', items: ['2.5 L of water a day; go easy on salt and sugar.', 'Swap exfoliants for hydrating masks.', 'Sleep before 11 pm — it shows under the eyes.'] },
    { d: 3, title: 'Grooming', items: ['Threading and waxing now, so any redness is gone by the day.', 'Final gentle exfoliation, then stop.'] },
    {
      d: 1,
      title: 'Night before',
      items: ['Hydrating sheet mask + lip balm overnight.', `Pack your kit: lip shade, kajal, blotting papers, setting spray.`, 'Lay out jewellery and pins; sleep early.'],
    },
    {
      d: 0,
      title: 'The day',
      items: [
        'Ice-roll for 2 minutes, then moisturiser and primer.',
        lighting === 'flash'
          ? 'Skip high-SPF or zinc-based sunscreen under makeup — it causes white flashback in photos.'
          : 'Sunscreen first, then let it set for 5 minutes before base.',
        'Lock it in with setting spray; touch up lips after the meal.',
      ],
    },
  ]

  const steps = milestones
    .filter((m) => m.d <= daysLeft)
    .map((m) => {
      const date = new Date(event)
      date.setDate(event.getDate() - m.d)
      return { daysBefore: m.d, date, title: m.title, items: m.items }
    })

  return { focus, steps, daysLeft }
}
