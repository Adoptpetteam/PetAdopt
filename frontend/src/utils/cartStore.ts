import type { Product } from "../data/products"
import { MSG_OUT_OF_STOCK, MSG_STOCK_INSUFFICIENT } from "../constants/productMessages"
import { safeJsonParse } from "./storage"

export type CartItem = {
  productId: number
  name: string
  price: number
  image: string
  quantity: number
  description?: string
}

const CART_KEY = "cart"

function normalizeCartItem(raw: any): CartItem {
  // New format: { productId, quantity, ... }
  if (raw && typeof raw.productId === "number") {
    return {
      productId: Number(raw.productId),
      name: String(raw.name ?? ""),
      price: Number(raw.price ?? 0),
      image: String(raw.image ?? ""),
      quantity: Math.max(1, Number(raw.quantity ?? 1)),
      description: raw.description ? String(raw.description) : undefined,
    }
  }

  // Legacy format (current app): push(product) where product has `id`.
  return {
    productId: Number(raw?.id),
    name: String(raw?.name ?? ""),
    price: Number(raw?.price ?? 0),
    image: String(raw?.image ?? ""),
    quantity: 1,
    description: raw?.description ? String(raw.description) : undefined,
  }
}

export function loadCartItems(): CartItem[] {
  const raw = localStorage.getItem(CART_KEY)
  const parsed = safeJsonParse<any[]>(raw, [])
  if (!Array.isArray(parsed) || parsed.length === 0) return []

  const normalized = parsed.map(normalizeCartItem).filter((i) => i.productId > 0)

  // Merge duplicates by productId.
  const map = new Map<number, CartItem>()
  for (const item of normalized) {
    const existing = map.get(item.productId)
    if (existing) {
      existing.quantity = existing.quantity + item.quantity
    } else {
      map.set(item.productId, { ...item })
    }
  }
  return Array.from(map.values()).sort((a, b) => a.productId - b.productId)
}

export function saveCartItems(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export type AddToCartResult =
  | { ok: true; items: CartItem[] }
  | { ok: false; error: string }

export function getCartQuantityForProduct(productId: number): number {
  return loadCartItems().find((i) => i.productId === productId)?.quantity ?? 0
}

export type AddToCartOptions = {
  /** Đã trừ kho trên server trước đó — bỏ qua kiểm tra tồn trong giỏ. */
  skipStockCheck?: boolean
}

export function addToCart(product: Product, quantity: number, options?: AddToCartOptions): AddToCartResult {
  const items = loadCartItems()
  const qty = Math.max(1, Math.floor(quantity || 1))
  const stock = Math.max(0, product.quantity ?? 0)
  const idx = items.findIndex((i) => i.productId === product.id)
  const currentQty = idx === -1 ? 0 : items[idx].quantity
  const newTotal = currentQty + qty

  if (!options?.skipStockCheck) {
    if (stock <= 0) {
      return { ok: false, error: MSG_OUT_OF_STOCK }
    }
    if (newTotal > stock) {
      return { ok: false, error: MSG_STOCK_INSUFFICIENT }
    }
  }

  const next = items.slice()
  if (idx === -1) {
    next.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: qty,
      description: product.description,
    })
  } else {
    next[idx] = { ...next[idx], quantity: newTotal }
  }

  saveCartItems(next)
  return { ok: true, items: next }
}

export function removeFromCart(productId: number): CartItem[] {
  const items = loadCartItems()
  const next = items.filter((i) => i.productId !== productId)
  saveCartItems(next)
  return next
}

/** Xóa nhiều dòng giỏ theo productId (sau khi thanh toán một phần). */
export function removeCartItemsByProductIds(productIds: number[]): CartItem[] {
  if (productIds.length === 0) return loadCartItems()
  const drop = new Set(productIds)
  const items = loadCartItems()
  const next = items.filter((i) => !drop.has(i.productId))
  saveCartItems(next)
  return next
}

export function setCartItemQuantity(productId: number, quantity: number): CartItem[] {
  const items = loadCartItems()
  const qty = Math.max(1, Math.floor(quantity || 1))

  const idx = items.findIndex((i) => i.productId === productId)
  if (idx === -1) return items

  items[idx] = { ...items[idx], quantity: qty }
  saveCartItems(items)
  return items
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY)
}

export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}

