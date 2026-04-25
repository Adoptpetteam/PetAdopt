import { apiClient } from "./http";

export type CreatePaymentBody = {
  amount: number;
  email?: string;
  name?: string;
};

export type CreatePaymentResponse = {
  paymentUrl: string;
  orderId: string;
};

/** Tạo link thanh toán VNPay */
export async function createVNPayPayment(
  body: CreatePaymentBody
): Promise<CreatePaymentResponse> {
  const { data } = await apiClient.post<CreatePaymentResponse>(
    "/donate/create-payment",
    body
  );
  return data;
}
