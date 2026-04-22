import { apiClient } from "./http";

export type ContactBody = {
  name: string;
  email: string;
  message: string;
};

export type ContactResponse = {
  success: boolean;
  message: string;
  data?: any;
};

/** Gửi liên hệ */
export async function submitContact(
  body: ContactBody
): Promise<ContactResponse> {
  const { data } = await apiClient.post<ContactResponse>(
    "/contact",
    body
  );
  return data;
}

/** Lấy danh sách liên hệ (admin) */
export async function getContacts(params?: {
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data: any[]; pagination?: any }> {
  const { data } = await apiClient.get("/contact", { params });
  return data;
}
