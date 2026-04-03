import { listProducts } from "../api/productApi"
import { loadProducts } from "./productStore"

/** Map productId → tồn kho (ưu tiên API, fallback localStorage). */
export async function getStockMap(): Promise<Map<number, number>> {
  try {
    const res = await listProducts()
    return new Map(res.data.map((p) => [p.id, Math.max(0, p.quantity ?? 0)]))
  } catch {
    return new Map(loadProducts().map((p) => [p.id, Math.max(0, p.quantity ?? 0)]))
  }
}
