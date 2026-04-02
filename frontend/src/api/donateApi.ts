import { apiClient } from "./http";

export interface CreatePaymentResponse {
  paymentUrl: string;
  orderId: string;
}

export const donateApi = {
  createPayment: (amount: number, orderInfo?: string) => {
    return apiClient.post<CreatePaymentResponse>("/donate/create-payment", {
      amount,
      orderInfo,
    });
  },
};
