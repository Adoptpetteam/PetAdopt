import { apiClient } from "../api/http";

export type Props = {
  resource: string;
  id?: number | string;
  values?: any;
};

const unwrap = <T = any>(payload: any): T => payload?.data ?? payload;

const buildPath = (resource: string, id?: string | number) =>
  id !== undefined ? `/${resource}/${id}` : `/${resource}`;

export const getListCategory = async ({ resource = "category" }: Props) => {
  const { data } = await apiClient.get(buildPath(resource));
  return unwrap(data);
};

export const getCategoryDetail = async ({ id, resource = "category" }: Props) => {
  if (!id) throw new Error("Thiếu ID danh mục");
  const { data } = await apiClient.get(buildPath(resource, id));
  return unwrap(data);
};

export const getDeleteCategory = async ({ resource = "category", id }: Props) => {
  if (!id) return null;
  const { data } = await apiClient.delete(buildPath(resource, id));
  return unwrap(data);
};

export const getCreateCategory = async ({ resource = "category", values }: Props) => {
  const { data } = await apiClient.post(buildPath(resource), values);
  return unwrap(data);
};

export const getUpdateCategory = async ({ resource = "category", id, values }: Props) => {
  if (!id) return null;
  const { data } = await apiClient.put(buildPath(resource, id), values);
  return unwrap(data);
};

export const getListPet = async ({ resource = "pets" }: Props) => {
  const { data } = await apiClient.get(buildPath(resource));
  return unwrap(data);
};

export const getPetDetail = async ({ resource = "pets", id }: any) => {
  const { data } = await apiClient.get(buildPath(resource, id));
  return unwrap(data);
};

export const createPet = async ({ resource = "pets", values }: Props) => {
  const { data } = await apiClient.post(buildPath(resource), values);
  return unwrap(data);
};

export const updatePet = async ({ resource = "pets", id, values }: Props) => {
  if (!id) return null;
  const { data } = await apiClient.put(buildPath(resource, id), values);
  return unwrap(data);
};

export const deletePet = async ({ resource = "pets", id }: Props) => {
  if (!id) return null;
  const { data } = await apiClient.delete(buildPath(resource, id));
  return unwrap(data);
};

export const createAdoption = async ({ resource = "adoptions", values }: any) => {
  const { data } = await apiClient.post(buildPath(resource), values);
  return unwrap(data);
};

export const getAdoptions = async ({ resource = "adoptions" }: any) => {
  const { data } = await apiClient.get(buildPath(resource));
  return unwrap(data);
};

export const getListAdoption = async ({ resource = "adoptions" }: any) => {
  const { data } = await apiClient.get(buildPath(resource));
  return unwrap(data);
};

export const deleteAdoption = async ({ resource = "adoptions", id }: any) => {
  const { data } = await apiClient.delete(buildPath(resource, id));
  return unwrap(data);
};
