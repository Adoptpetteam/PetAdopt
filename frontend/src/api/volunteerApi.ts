import { apiClient } from "./http";

export type VolunteerBody = {
  name: string;
  email: string;
  phone: string;
  age?: number;
  experience?: string;
  availability?: string;
  reason: string;
};

export type VolunteerResponse = {
  success: boolean;
  message: string;
  data?: any;
};

/** Đăng ký làm tình nguyện viên */
export async function submitVolunteer(
  body: VolunteerBody
): Promise<VolunteerResponse> {
  const { data } = await apiClient.post<VolunteerResponse>(
    "/volunteer",
    body
  );
  return data;
}

/** Lấy danh sách volunteer (admin) */
export async function getVolunteers(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data: any[]; pagination?: any }> {
  const { data } = await apiClient.get("/volunteer", { params });
  return data;
}

/** Lấy chi tiết volunteer (admin) */
export async function getVolunteerById(
  id: string
): Promise<{ success: boolean; data: any }> {
  const { data } = await apiClient.get(`/volunteer/${id}`);
  return data;
}

/** Duyệt volunteer (admin) */
export async function approveVolunteer(
  id: string
): Promise<VolunteerResponse> {
  const { data } = await apiClient.put(`/volunteer/${id}/approve`);
  return data;
}

/** Từ chối volunteer (admin) */
export async function rejectVolunteer(
  id: string,
  adminNote?: string
): Promise<VolunteerResponse> {
  const { data } = await apiClient.put(`/volunteer/${id}/reject`, {
    adminNote,
  });
  return data;
}
