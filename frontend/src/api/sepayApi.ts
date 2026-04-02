import { apiClient } from './http';

export const sepayApi = {
  createOrder: (amount: number) =>
    apiClient.post<{
      code: string;
      amount: number;
      status: string;
      expiresAt: string;
      accountNumber: string;
      bank: string;
      accountName: string;
      qrUrl: string;
      transferContent: string;
    }>('/sepay/create-order', { amount }),

  getOrder: (code: string) =>
    apiClient.get<{
      code: string;
      amount: number;
      status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
      paidAt: string | null;
      createdAt: string;
      expiresAt: string;
    }>(`/sepay/order/${code}`),
};
