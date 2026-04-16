import { apiClient } from "./http";

export type PetEntity = {
  id: string;
  name: string;
  species: string;
  age?: number;
  gender?: string;
  images?: string[];
  status?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type PetsListResponse = ApiResponse<PetEntity[]> & {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type PetDetailResponse = ApiResponse<PetEntity>;

export type ListPetsParams = {
  page?: number;
  limit?: number;
  species?: string;
  status?: string;
  search?: string;
};

/** GET LIST */
export async function listPets(
  params?: ListPetsParams
): Promise<PetsListResponse> {
  const { data } = await apiClient.get<PetsListResponse>("/pets", { params });
  return data;
}

/** GET DETAIL */
export async function getPetById(id: string): Promise<PetDetailResponse> {
  const { data } = await apiClient.get<PetDetailResponse>(`/pets/${id}`);
  return data;
}

/** CREATE */
export async function createPet(
  payload: Partial<PetEntity>
): Promise<ApiResponse<PetEntity>> {
  const { data } = await apiClient.post<ApiResponse<PetEntity>>("/pets", payload);
  return data;
}

/** UPDATE */
export async function updatePet(
  id: string,
  payload: Partial<PetEntity>
): Promise<ApiResponse<PetEntity>> {
  const { data } = await apiClient.put<ApiResponse<PetEntity>>(
    `/pets/${id}`,
    payload
  );
  return data;
}

/** DELETE */
export async function deletePet(
  id: string
): Promise<ApiResponse<null>> {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/pets/${id}`);
  return data;
}
