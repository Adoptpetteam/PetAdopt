import { apiClient } from "./http";

export type PetEntity = {
  _id: string;
  name: string;
  species: string;
  age?: number;
  gender?: string;
  images?: string[];
  status?: string;
};

export type PetsListResponse = {
  success: boolean;
  data: PetEntity[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type PetDetailResponse = {
  success: boolean;
  data: PetEntity;
};

export type ListPetsParams = {
  page?: number;
  limit?: number;
  species?: string;
  status?: string;
  search?: string;
};

/** Lấy danh sách thú cưng với filter cơ bản. */
export async function listPets(
  params?: ListPetsParams
): Promise<PetsListResponse> {
  const { data } = await apiClient.get<PetsListResponse>("/pets", { params });
  return data;
}

/** Lấy thông tin chi tiết một thú cưng theo id. */
export async function getPetById(id: string): Promise<PetDetailResponse> {
  const { data } = await apiClient.get<PetDetailResponse>(`/pets/${id}`);
  return data;
}
