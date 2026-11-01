'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { PRODUCTS, type Shade } from './catalog'

export type CartItem = {
  key: string // productId + shade code
  productId: string
  shade?: Shade
  qty: number
  bundle?: string // look name when added as a full kit
  matchPercent?: number
}

type Cart = {
  items: CartItem[]
  open: boolean
  setOpen: (o: boolean) => void
  add: (item: Omit<CartItem, 'key' | 'qty'>, qty?: number) => void
  addMany: (items: Omit<CartItem, 'key' | 'qty'>[]) => void
  setQty: (key: string, qty: number) => void
  clear: () => void
  has: (productId: string, shadeCode?: string) => boolean
  totals: { subtotal: number; discount: number; shipping: number; total: number; count: number }
  eventDate: string | null
  setEventDate: (d: string | null) => void
}

export const BUNDLE_DISCOUNT = 0.15
const FREE_SHIP = 999
const SHIP = 79

const CartContext = createContext<Cart | null>(null)
const keyOf = (productId: string, code?: string) => `${productId}${code ? `:${code}` : ''}`

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [open, setOpen] = useState(false)
  const [eventDate, setEventDate] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('vanakkam-cart') ?? '[]')
      if (Array.isArray(saved)) setItems(saved.filter((i) => PRODUCTS[i.productId]))
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem('vanakkam-cart', JSON.stringify(items))
    } catch {}
  }, [items])

  const merge = (list: CartItem[], item: Omit<CartItem, 'key' | 'qty'>, qty: number) => {
    const key = keyOf(item.productId, item.shade?.code)
    const found = list.find((i) => i.key === key)
    if (found) return list.map((i) => (i.key === key ? { ...i, qty: i.qty + qty, bundle: item.bundle ?? i.bundle } : i))
    return [...list, { ...item, key, qty }]
  }

  const add = useCallback((item: Omit<CartItem, 'key' | 'qty'>, qty = 1) => {
    setItems((l) => merge(l, item, qty))
    setOpen(true)
  }, [])
  const addMany = useCallback((list: Omit<CartItem, 'key' | 'qty'>[]) => {
    setItems((l) => list.reduce((acc, it) => (acc.some((a) => a.key === keyOf(it.productId, it.shade?.code)) ? acc.map((a) => (a.key === keyOf(it.productId, it.shade?.code) ? { ...a, bundle: it.bundle ?? a.bundle } : a)) : merge(acc, it, 1)), l))
    setOpen(true)
  }, [])
  const setQty = useCallback((key: string, qty: number) => setItems((l) => (qty <= 0 ? l.filter((i) => i.key !== key) : l.map((i) => (i.key === key ? { ...i, qty } : i)))), [])
  const clear = useCallback(() => setItems([]), [])
  const has = useCallback((productId: string, code?: string) => items.some((i) => i.key === keyOf(productId, code)), [items])

  const totals = useMemo(() => {
    let subtotal = 0
    let discount = 0
    let count = 0
    for (const i of items) {
      const line = PRODUCTS[i.productId].price * i.qty
      subtotal += line
      count += i.qty
      if (i.bundle) discount += Math.round(line * BUNDLE_DISCOUNT)
    }
    const shipping = subtotal - discount >= FREE_SHIP || subtotal === 0 ? 0 : SHIP
    return { subtotal, discount, shipping, total: subtotal - discount + shipping, count }
  }, [items])

  return <CartContext.Provider value={{ items, open, setOpen, add, addMany, setQty, clear, has, totals, eventDate, setEventDate }}>{children}</CartContext.Provider>
}

export function useCart() {
  const c = useContext(CartContext)
  if (!c) throw new Error('useCart must be used inside CartProvider')
  return c
}

/** Standard delivery: 3–5 days. */
export function deliveryWindow(from = new Date()) {
  const a = new Date(from)
  a.setDate(a.getDate() + 3)
  const b = new Date(from)
  b.setDate(b.getDate() + 5)
  return [a, b] as const
}
