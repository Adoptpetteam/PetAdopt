import { getProductById as getProductByIdApi, updateProduct } from "../api/productApi"
import { getProductById as getLocalProductById, updateProduct as updateLocalProduct } from "./productStore"

/**
 * Cộng delta vào tồn kho (delta âm = trừ kho, dương = hoàn kho).
 * Ưu tiên API Mongo; lỗi mạng thì fallback productStore (chatbot / offline).
 */
export async function adjustProductStockDelta(productId: number, delta: number): Promise<void> {
  try {
    const p = await getProductByIdApi(productId)
    const next = Number(p.quantity ?? 0) + delta
    if (next < 0) {
      const err = new Error("INSUFFICIENT_STOCK")
      throw err
    }
    await updateProduct(productId, {
      name: p.name,
      image: p.image,
      price: p.price,
      quantity: next,
      description: p.description,
    })
    return
  } catch (e) {
    if ((e as Error).message === "INSUFFICIENT_STOCK") throw e
  }

  const local = getLocalProductById(productId)
  if (!local) throw new Error("PRODUCT_NOT_FOUND")
  const next = local.quantity + delta
  if (next < 0) {
    const err = new Error("INSUFFICIENT_STOCK")
    throw err
  }
  updateLocalProduct(productId, { quantity: next })
}
