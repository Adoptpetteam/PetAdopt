import { apiClient } from './http';

export interface AdoptionRequestData {
  pet?: string;
  user?: string;
  fullName: string;
  phone: string;
  address: string;
  reason: string;
  experience?: 'none' | 'beginner' | 'intermediate' | 'expert';
  experienceDetails?: string;
  housingType: 'apartment' | 'house' | 'farm' | 'other';
  hasYard?: boolean;
  familyMembers: number;
  hasChildren?: boolean;
  childrenAges?: string;
  hasOtherPets?: boolean;
  otherPetsDetails?: string;
  monthlyIncome: 'under_5m' | '5m_10m' | '10m_20m' | 'over_20m';
  commitment: boolean;
}

export interface AdoptionRequest {
  _id: string;
  pet?: {
    _id: string;
    name: string;
    images?: string[];
    species?: string;
  };
  user?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  fullName: string;
  phone: string;
  address: string;
  reason: string;
  experience: string;
  experienceDetails?: string;
  housingType: string;
  hasYard: boolean;
  familyMembers: number;
  hasChildren: boolean;
  childrenAges?: string;
  hasOtherPets: boolean;
  otherPetsDetails?: string;
  monthlyIncome: string;
  commitment: boolean;
  adminNote?: string;
  processedAt?: string;
  createdAt: string;
}

export const adoptionApi = {
  // Tạo đơn nhận nuôi mới
  create: (data: AdoptionRequestData) => {
    return apiClient.post<{ success: boolean; message: string; data: AdoptionRequest }>(
      '/api/adoption',
      data
    );
  },

  // Lấy danh sách đơn (admin) với filters
  list: (params?: { status?: string; page?: number; limit?: number }) => {
    return apiClient.get<{
      success: boolean;
      data: AdoptionRequest[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/api/adoption', { params });
  },

  // Lấy chi tiết đơn
  getById: (id: string) => {
    return apiClient.get<{ success: boolean; data: AdoptionRequest }>(
      `/api/adoption/${id}`
    );
  },

  // Lấy đơn của user hiện tại
  getMyRequests: () => {
    return apiClient.get<{ success: boolean; data: AdoptionRequest[] }>(
      '/api/adoption/my-requests'
    );
  },

  // Duyệt đơn (admin)
  approve: (id: string, adminNote?: string) => {
    return apiClient.put<{ success: boolean; message: string; data: AdoptionRequest }>(
      `/api/adoption/${id}/approve`,
      { adminNote }
    );
  },

  // Từ chối đơn (admin)
  reject: (id: string, adminNote?: string) => {
    return apiClient.put<{ success: boolean; message: string; data: AdoptionRequest }>(
      `/api/adoption/${id}/reject`,
      { adminNote }
    );
  },

  // Hủy đơn (user)
  cancel: (id: string) => {
    return apiClient.put<{ success: boolean; message: string; data: AdoptionRequest }>(
      `/api/adoption/${id}/cancel`
    );
  },
};
