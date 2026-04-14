import { apiClient } from "./http";

export type AdoptionRequestBody = {
  pet: string;
  fullName: string;
  phone: string;
  address: string;
  reason: string;
  experience?: string;
  experienceDetails?: string;
  housingType: string;
  hasYard?: boolean;
  familyMembers: string;
  hasChildren?: boolean;
  childrenAges?: string;
  hasOtherPets?: boolean;
  otherPetsDetails?: string;
  monthlyIncome: string;
  commitment: boolean;
};

export type AdoptionRequestResponse = {
  success: boolean;
  message: string;
  data?: any;
};

export type AdoptionListResponse = {
  success: boolean;
  data: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

/** Tạo đơn nhận nuôi mới */
export async function createAdoptionRequest(
  body: AdoptionRequestBody
): Promise<AdoptionRequestResponse> {
  const { data } = await apiClient.post<AdoptionRequestResponse>(
    "/adoption",
    body
  );
  return data;
}

/** Lấy danh sách đơn nhận nuôi (admin) */
export async function getAdoptionRequests(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<AdoptionListResponse> {
  const { data } = await apiClient.get<AdoptionListResponse>("/adoption", {
    params,
  });
  return data;
}

/** Lấy đơn của user hiện tại */
export async function getMyAdoptionRequests(): Promise<AdoptionListResponse> {
  const { data } = await apiClient.get<AdoptionListResponse>(
    "/adoption/my-requests"
  );
  return data;
}

/** Lấy chi tiết một đơn nhận nuôi */
export async function getAdoptionRequestById(
  id: string
): Promise<{ success: boolean; data: any }> {
  const { data } = await apiClient.get(`/adoption/${id}`);
  return data;
}

/** Hủy đơn nhận nuôi */
export async function cancelAdoptionRequest(
  id: string
): Promise<AdoptionRequestResponse> {
  const { data } = await apiClient.put<AdoptionRequestResponse>(
    `/adoption/${id}/cancel`
  );
  return data;
}

/** Duyệt đơn nhận nuôi (admin) */
export async function approveAdoptionRequest(
  id: string,
  adminNote?: string
): Promise<AdoptionRequestResponse> {
  const { data } = await apiClient.put<AdoptionRequestResponse>(
    `/adoption/${id}/approve`,
    { adminNote }
  );
  return data;
}

/** Từ chối đơn nhận nuôi (admin) */
export async function rejectAdoptionRequest(
  id: string,
  adminNote?: string
): Promise<AdoptionRequestResponse> {
  const { data } = await apiClient.put<AdoptionRequestResponse>(
    `/adoption/${id}/reject`,
    { adminNote }
  );
  return data;
}
