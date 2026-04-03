import { apiClient } from "./http";

export type NewsEntity = {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  image?: string;
  status?: string;
  createdAt: string;
};

export type NewsListResponse = {
  success: boolean;
  data: NewsEntity[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type NewsDetailResponse = {
  success: boolean;
  data: NewsEntity;
};

/** Lấy danh sách tin tức */
export async function listNews(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<NewsListResponse> {
  const { data } = await apiClient.get<NewsListResponse>("/news", { params });
  return data;
}

/** Lấy chi tiết tin tức theo id */
export async function getNewsById(id: string): Promise<NewsDetailResponse> {
  const { data } = await apiClient.get<NewsDetailResponse>(`/news/${id}`);
  return data;
}

/** Tạo tin tức (admin) */
export async function createNews(body: {
  title: string;
  description?: string;
  content?: string;
  image?: string;
  status?: string;
}): Promise<{ success: boolean; message: string; data: NewsEntity }> {
  const { data } = await apiClient.post("/news", body);
  return data;
}

/** Cập nhật tin tức (admin) */
export async function updateNews(
  id: string,
  body: {
    title?: string;
    description?: string;
    content?: string;
    image?: string;
    status?: string;
  }
): Promise<{ success: boolean; message: string; data: NewsEntity }> {
  const { data } = await apiClient.put(`/news/${id}`, body);
  return data;
}

/** Xóa tin tức (admin) */
export async function deleteNews(
  id: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.delete(`/news/${id}`);
  return data;
}