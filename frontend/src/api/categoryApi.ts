import { apiClient } from "./http";

export type Category = {
  id: string;
  name: string;
  status: "on" | "off";
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

/** GET LIST */
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  const { data } = await apiClient.get("/category");
  return data;
}

/** GET DETAIL */
export async function getCategoryById(id: string): Promise<ApiResponse<Category>> {
  const { data } = await apiClient.get(`/category/${id}`);
  return data;
}

/** CREATE */
export async function createCategory(payload: Partial<Category>) {
  const { data } = await apiClient.post("/category", payload);
  return data;
}

/** UPDATE */
export async function updateCategory(id: string, payload: Partial<Category>) {
  const { data } = await apiClient.put(`/category/${id}`, payload);
  return data;
}

/** DELETE */
export async function deleteCategory(id: string) {
  const { data } = await apiClient.delete(`/category/${id}`);
  return data;
}