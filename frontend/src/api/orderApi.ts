import { apiClient } from "./http"

export type OrderItemPayload = {
  productId: number
  quantity: number
}

export type CheckoutCustomer = {
  name: string
  phone: string
  address: string
  reason: string
}

export type PaymentMethod = "momo" | "zalopay"

export type ProductOrderResponse = {
  id: string
  createdAt: string
  status: "paid" | "pending" | "cancelled"
  paymentMethod: PaymentMethod
  customer: CheckoutCustomer
  items: Array<{
    productId: number
    name: string
    image: string
    price: number
    quantity: number
  }>
  totals: {
    subtotal: number
    total: number
  }
}

export type CheckoutResponse = {
  success: boolean
  data: ProductOrderResponse
}

export type OrdersListResponse = {
  success: boolean
  data: ProductOrderResponse[]
}

export async function checkoutOrder(payload: {
  paymentMethod: PaymentMethod
  customer: CheckoutCustomer
  items: OrderItemPayload[]
}): Promise<CheckoutResponse> {
  const { data } = await apiClient.post<CheckoutResponse>("/orders/checkout", payload)
  return data
}

export async function listMyOrders(): Promise<OrdersListResponse> {
  const { data } = await apiClient.get<OrdersListResponse>("/orders/me")
  return data
}
