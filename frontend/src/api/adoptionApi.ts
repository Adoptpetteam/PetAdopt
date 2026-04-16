import { apiClient } from "./http";

export type AdoptionStatus = "pending" | "approved" | "rejected" | "cancelled";

export type AdoptionRequest = {
  _id: string;
  status: AdoptionStatus;
  fullName: string;
  phone: string;
  address: string;
  reason: string;
  pet?: { id?: string; name: string; images?: string[]; species?: string; status?: string } | string;
  user?: { id?: string; name: string; email?: string; phone?: string } | string;
  adminNote?: string;
  createdAt?: string;
  processedAt?: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type AdoptionListResponse = {
  success: boolean;
  data: AdoptionRequest[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function createAdoptionRequest(payload: {
  pet: string;
  user: string;
  fullName: string;
  phone: string;
  address: string;
  reason: string;
  housingType: string;
  familyMembers: number;
  monthlyIncome: string;
  commitment: boolean;
  experience?: string;
  experienceDetails?: string;
  hasYard?: boolean;
  hasChildren?: boolean;
  childrenAges?: string;
  hasOtherPets?: boolean;
  otherPetsDetails?: string;
}): Promise<ApiResponse<AdoptionRequest>> {
  const { data } = await apiClient.post<ApiResponse<AdoptionRequest>>("/adoption", payload);
  return data;
}

export async function listAdoptionRequestsAdmin(params?: {
  status?: AdoptionStatus;
  page?: number;
  limit?: number;
}): Promise<AdoptionListResponse> {
  const { data } = await apiClient.get<AdoptionListResponse>("/adoption", { params });
  return data;
}

export async function approveAdoptionRequest(id: string, adminNote?: string) {
  const { data } = await apiClient.put<ApiResponse<AdoptionRequest>>(`/adoption/${id}/approve`, {
    adminNote,
  });
  return data;
}

export async function rejectAdoptionRequest(id: string, adminNote?: string) {
  const { data } = await apiClient.put<ApiResponse<AdoptionRequest>>(`/adoption/${id}/reject`, {
    adminNote,
  });
  return data;
}

export async function cancelMyAdoptionRequest(id: string) {
  const { data } = await apiClient.put<ApiResponse<AdoptionRequest>>(`/adoption/${id}/cancel`);
  return data;
}

