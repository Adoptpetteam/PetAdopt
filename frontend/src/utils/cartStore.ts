export type CartItem = {
  productId: number
  name: string
  price: number
  quantity: number
  image?: string
}

const CART_KEY = "pawpalace_cart"

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function loadCartItems(): CartItem[] {
  return loadCart()
}

export function addToCart(product: any, quantity: number): { ok: boolean; error?: string } {
  const items = loadCart()
  const existing = items.find(i => i.productId === product.id)

  if (existing) {
    existing.quantity += quantity
  } else {
    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
    })
  }

  saveCart(items)
  return { ok: true }
}

export function removeFromCart(productId: number) {
  const items = loadCart().filter(i => i.productId !== productId)
  saveCart(items)
}

export function updateCartQuantity(productId: number, quantity: number) {
  const items = loadCart()
  const item = items.find(i => i.productId === productId)
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      item.quantity = quantity
      saveCart(items)
    }
  }
}

export function clearCart() {
  localStorage.removeItem(CART_KEY)
}

export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function getCartCount(): number {
  return loadCart().reduce((sum, item) => sum + item.quantity, 0)
}
