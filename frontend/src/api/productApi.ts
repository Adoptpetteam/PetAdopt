import { apiClient } from "./http"
import type { Product } from "../data/products"

export type ProductsListResponse = {
  success: boolean
  data: Product[]
}

export type ProductDetailResponse = {
  success: boolean
  data: Product
}

export async function listProducts(): Promise<ProductsListResponse> {
  const { data } = await apiClient.get<ProductsListResponse>("/products")
  return data
}

/** Trả về thẳng sản phẩm (unwrap `data`) để tránh nhầm lẫn response → màn trắng / crash. */
export async function getProductById(id: number): Promise<Product> {
  const { data } = await apiClient.get<ProductDetailResponse>(`/products/${id}`)
  if (data?.data == null) {
    throw new Error("PRODUCT_NOT_FOUND")
  }
  return data.data
}

// Admin CRUD (requires Bearer token)
export async function createProduct(payload: Omit<Product, "id">): Promise<ProductDetailResponse> {
  const { data } = await apiClient.post<ProductDetailResponse>("/products", payload)
  return data
}

export async function updateProduct(
  id: number,
  payload: Omit<Product, "id">
): Promise<ProductDetailResponse> {
  const { data } = await apiClient.put<ProductDetailResponse>(`/products/${id}`, payload)
  return data
}

export async function deleteProduct(id: number): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.delete(`/products/${id}`)
  return data
}

