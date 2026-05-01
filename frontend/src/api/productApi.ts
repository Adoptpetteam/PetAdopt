import { apiClient } from "./http"

export type Product = {
  id: string
  name: string
  price: number
  image: string
  images?: string[]
  quantity?: number
  description?: string
  category?: string
}

export type ApiResponse<T> = {
  success: boolean
  message?: string
  data: T
}

export type ProductsListResponse = ApiResponse<Product[]> & {
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export async function listProducts(params?: { page?: number; limit?: number; search?: string; category?: string }): Promise<ProductsListResponse> {
  const { data } = await apiClient.get<ProductsListResponse>("/products", { params })
  return data
}

export async function getProductById(id: string): Promise<ApiResponse<Product>> {
  const { data } = await apiClient.get<ApiResponse<Product>>(`/products/${id}`)
  return data
}

export async function createProduct(payload: Partial<Product>): Promise<ApiResponse<Product>> {
  const { data } = await apiClient.post<ApiResponse<Product>>("/products", payload)
  return data
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<ApiResponse<Product>> {
  const { data } = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, payload)
  return data
}

export async function deleteProduct(id: string): Promise<ApiResponse<null>> {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/products/${id}`)
  return data
}
