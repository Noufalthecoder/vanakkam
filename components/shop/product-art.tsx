import { PRODUCTS, type Shade } from '@/lib/catalog'

/** Illustrated packshots — drawn, not photographed, so every shade renders exactly. */
export function ProductArt({ productId, shade, size = 64 }: { productId: string; shade?: Shade; size?: number }) {
  const p = PRODUCTS[productId]
  const c = shade?.hex ?? '#141010'
  const gold = '#c9a14a'
  const body = 'var(--surface-2)'
  let art: React.ReactNode

  if (productId.startsWith('lip-')) {
    art = productId === 'lip-gloss' ? (
      <>
        <rect x="26" y="8" width="12" height="20" rx="3" fill="#2a1418" />
        <rect x="24" y="26" width="16" height="32" rx="4" fill={c} opacity=".9" />
        <rect x="28" y="30" width="3" height="22" rx="1.5" fill="#fff" opacity=".45" />
      </>
    ) : (
      <>
        <path d="M26 30 L26 14 Q32 4 38 12 L38 30 Z" fill={c} />
        <rect x="24" y="30" width="16" height="8" rx="1" fill={gold} />
        <rect x="23" y="38" width="18" height="20" rx="2" fill="#2a1418" />
      </>
    )
  } else if (productId === 'foundation') {
    art = (
      <>
        <rect x="27" y="6" width="10" height="10" rx="2" fill="#2a1418" />
        <rect x="20" y="16" width="24" height="42" rx="6" fill={c} />
        <rect x="24" y="28" width="16" height="12" rx="2" fill="#fff" opacity=".55" />
      </>
    )
  } else if (productId === 'blush') {
    art = (
      <>
        <circle cx="32" cy="34" r="24" fill="#2a1418" />
        <circle cx="32" cy="34" r="18" fill={c} />
        <path d="M22 30 Q32 22 42 30" stroke="#fff" strokeOpacity=".35" strokeWidth="2" fill="none" />
      </>
    )
  } else if (productId.startsWith('eyes-')) {
    const shades = p.shades ?? []
    art = (
      <>
        <rect x="6" y="14" width="52" height="38" rx="5" fill="#2a1418" />
        {shades.slice(0, 4).map((s, i) => (
          <circle key={s.code} cx={17 + i * 10} cy="33" r="5" fill={s.hex} stroke={gold} strokeWidth=".8" />
        ))}
      </>
    )
  } else if (productId === 'brow' || productId === 'liner-soft') {
    art = (
      <>
        <rect x="10" y="29" width="40" height="7" rx="2" fill={productId === 'brow' ? '#2a1418' : '#3a2a24'} transform="rotate(-30 32 32)" />
        <path d="M48 20 L56 14 L52 24 Z" fill={c} transform="rotate(0)" />
      </>
    )
  } else if (productId === 'liner-wing') {
    art = (
      <>
        <rect x="28" y="6" width="8" height="40" rx="3" fill="#2a1418" />
        <path d="M29 46 L35 46 L32 58 Z" fill="#141010" />
        <rect x="28" y="16" width="8" height="3" fill={gold} />
      </>
    )
  } else {
    // skincare: tube or dropper bottle
    const tone = { spf: '#f3e6b8', cleanser: '#efe6dc', oiliness: '#c9a98a', acne: '#cfe3d8' }[productId] ?? '#e9d7c8'
    art = ['spf', 'cleanser', 'redness', 'oiliness'].includes(productId) ? (
      <>
        <path d="M18 10 H46 L42 50 H22 Z" fill={tone} stroke="var(--line)" />
        <rect x="24" y="50" width="16" height="8" rx="2" fill="#2a1418" />
        <rect x="24" y="22" width="16" height="2" fill="#8e1b3a" />
      </>
    ) : (
      <>
        <rect x="28" y="4" width="8" height="12" rx="3" fill="#2a1418" />
        <rect x="22" y="16" width="20" height="42" rx="5" fill={tone} stroke="var(--line)" />
        <rect x="26" y="30" width="12" height="2" fill="#8e1b3a" />
      </>
    )
  }

  return (
    <div className="grid shrink-0 place-items-center overflow-hidden rounded-xl" style={{ width: size, height: size, background: body }}>
      <svg viewBox="0 0 64 64" width={size * 0.86} height={size * 0.86} aria-hidden="true">{art}</svg>
    </div>
  )
}
