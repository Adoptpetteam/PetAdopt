export type Product = {
  id: number
  name: string
  price: number
  image: string
  quantity: number
  description?: string
  category?: string
}

const PRODUCTS_KEY = "pawpalace_products"

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveProductsLocal(items: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(items))
}

export function saveProducts(items: Product[]) {
  saveProductsLocal(items)
}

export function listProducts(): Product[] {
  return loadProducts()
}

export function getProductById(id: number): Product | undefined {
  return loadProducts().find(p => p.id === id)
}

export function addProduct(product: Omit<Product, "id">): Product {
  const items = loadProducts()
  const newId = items.length > 0 ? Math.max(...items.map(p => p.id)) + 1 : 1
  const newProduct: Product = { ...product, id: newId }
  items.push(newProduct)
  saveProductsLocal(items)
  return newProduct
}

export function updateProduct(id: number, updates: Partial<Product>): boolean {
  const items = loadProducts()
  const index = items.findIndex(p => p.id === id)
  if (index === -1) return false
  items[index] = { ...items[index], ...updates }
  saveProductsLocal(items)
  return true
}

export function deleteProduct(id: number): boolean {
  const items = loadProducts()
  const filtered = items.filter(p => p.id !== id)
  if (filtered.length === items.length) return false
  saveProductsLocal(filtered)
  return true
}

export async function adjustProductStockDelta(id: number, delta: number): Promise<void> {
  const items = loadProducts()
  const item = items.find(p => p.id === id)
  if (!item) throw new Error("Product not found")
  if (item.quantity + delta < 0) throw new Error("Not enough stock")
  item.quantity += delta
  saveProductsLocal(items)
}
