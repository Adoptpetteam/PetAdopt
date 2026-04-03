import { products as seedProducts } from "../data/products"
import type { Product } from "../data/products"
import { safeJsonParse } from "./storage"

const BOT_PRODUCTS_KEY = "bot_products"

function normalizeProduct(p: any): Product {
  // Older data might not have quantity yet.
  return {
    id: Number(p?.id),
    name: String(p?.name ?? ""),
    price: Number(p?.price ?? 0),
    image: String(p?.image ?? ""),
    description: String(p?.description ?? ""),
    quantity: Number(p?.quantity ?? 0),
  }
}

export function loadProducts(): Product[] {
  const raw = localStorage.getItem(BOT_PRODUCTS_KEY)
  if (!raw) {
    // Seed initial catalog for chatbot-only CRUD.
    const seeded = seedProducts.map(normalizeProduct)
    localStorage.setItem(BOT_PRODUCTS_KEY, JSON.stringify(seeded))
    return seeded
  }

  const parsed = safeJsonParse<any[]>(raw, [])
  const normalized = parsed.map(normalizeProduct).filter((p) => !Number.isNaN(p.id) && p.id > 0)
  if (normalized.length === 0) {
    const seeded = seedProducts.map(normalizeProduct)
    localStorage.setItem(BOT_PRODUCTS_KEY, JSON.stringify(seeded))
    return seeded
  }
  return normalized
}

export function saveProducts(items: Product[]): void {
  localStorage.setItem(BOT_PRODUCTS_KEY, JSON.stringify(items))
}

export function getProductById(id: number): Product | undefined {
  const items = loadProducts()
  return items.find((p) => p.id === id)
}

export function listProducts(): Product[] {
  return loadProducts().slice().sort((a, b) => a.id - b.id)
}

export function generateNextProductId(items: Product[]): number {
  const maxId = items.reduce((m, p) => Math.max(m, p.id), 0)
  return maxId + 1
}

export function addProduct(draft: Omit<Product, "id">): Product {
  const items = loadProducts()
  const nextId = generateNextProductId(items)
  const next: Product = { id: nextId, ...draft }
  const updated = [...items, next]
  saveProducts(updated)
  return next
}

export function updateProduct(id: number, patch: Partial<Omit<Product, "id">>): Product | null {
  const items = loadProducts()
  const idx = items.findIndex((p) => p.id === id)
  if (idx === -1) return null
  const updated: Product = { ...items[idx], ...patch, id }
  const nextItems = items.slice()
  nextItems[idx] = updated
  saveProducts(nextItems)
  return updated
}

export function deleteProduct(id: number): boolean {
  const items = loadProducts()
  const nextItems = items.filter((p) => p.id !== id)
  if (nextItems.length === items.length) return false
  saveProducts(nextItems)
  return true
}

