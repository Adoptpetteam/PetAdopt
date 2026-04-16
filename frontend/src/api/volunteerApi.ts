import { apiClient } from "./http";

export type VolunteerStatus = "pending" | "approved" | "rejected";

export type Volunteer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  age?: number;
  experience?: string;
  availability?: string;
  reason: string;
  status: VolunteerStatus;
  adminNote?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type VolunteersListResponse = {
  success: boolean;
  data: Volunteer[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function createVolunteer(payload: {
  name: string;
  email: string;
  phone: string;
  age?: number;
  experience?: string;
  availability?: string;
  reason: string;
}): Promise<ApiResponse<Volunteer>> {
  const { data } = await apiClient.post<ApiResponse<Volunteer>>("/volunteer", payload);
  return data;
}

export async function listVolunteersAdmin(params?: {
  status?: VolunteerStatus;
  page?: number;
  limit?: number;
}): Promise<VolunteersListResponse> {
  const { data } = await apiClient.get<VolunteersListResponse>("/volunteer", { params });
  return data;
}

export async function getVolunteerById(id: string): Promise<ApiResponse<Volunteer>> {
  const { data } = await apiClient.get<ApiResponse<Volunteer>>(`/volunteer/${id}`);
  return data;
}

export async function approveVolunteer(
  id: string,
  adminNote?: string
): Promise<ApiResponse<Volunteer>> {
  const { data } = await apiClient.put<ApiResponse<Volunteer>>(`/volunteer/${id}/approve`, {
    adminNote,
  });
  return data;
}

export async function rejectVolunteer(
  id: string,
  adminNote?: string
): Promise<ApiResponse<Volunteer>> {
  const { data } = await apiClient.put<ApiResponse<Volunteer>>(`/volunteer/${id}/reject`, {
    adminNote,
  });
  return data;
}

