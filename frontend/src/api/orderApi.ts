import { apiClient } from "./http";

export type OrderItemPayload = {
  productId: string;
  quantity: number;
};

export type CheckoutCustomer = {
  name: string;
  phone: string;
  address: string;
  reason?: string;
};

export type PaymentMethod = "cod" | "vnpay";

export type OrderItem = {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

export type ProductOrderResponse = {
  _id: string;
  createdAt: string;
  status: "paid" | "pending" | "cancelled";
  paymentMethod: PaymentMethod;
  customer: CheckoutCustomer;
  items: OrderItem[];
  totals: {
    subtotal: number;
    total: number;
  };
};

export type CheckoutResponse = {
  success: boolean;
  paymentMethod: PaymentMethod;
  payUrl?: string; // VNPay
  data: ProductOrderResponse;
};

export type OrdersListResponse = {
  success: boolean;
  data: ProductOrderResponse[];
};

export async function checkoutOrder(payload: {
  paymentMethod: PaymentMethod;
  customer: CheckoutCustomer;
  items: OrderItemPayload[];
}): Promise<CheckoutResponse> {
  const { data } = await apiClient.post<CheckoutResponse>(
    "/orders/checkout",
    payload
  );
  return data;
}

export async function listMyOrders(): Promise<OrdersListResponse> {
  const { data } = await apiClient.get<OrdersListResponse>("/orders/me");
  return data;
}
