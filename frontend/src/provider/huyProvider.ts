import axios from "axios";


//dùng khi mà có đường dẫn api từ back-end
const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

const axiosClient = axios.create({
  baseURL,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);


export type Props = {
  resource: string;
  id?: number | string;
  values?: any;
};

export const getListResource = async ({resource = "category"} : Props) => {
  const {data} = await axiosClient.get(resource);
  // Handle different response formats
  if (data.success && data.data) {
    return data.data;
  }
  return data;
}

export const getResourceDetail = async ({ id, resource = "category" }: Props) => {
  if (!id) throw new Error("Thiếu ID");
  const { data } = await axiosClient.get(`${resource}/${id}`);
  // Handle different response formats
  if (data.success && data.data) {
    return data.data;
  }
  return data;
};

export const createResource = async ({ resource = "category", values }: Props) => {
  const { data } = await axiosClient.post(resource, values);
  return data;
};

export const updateResource = async ({ resource = "category", id, values }: Props) => {
  if (!id) throw new Error("Thiếu ID");

  const config = values instanceof FormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : undefined;

  const { data } = await axiosClient.put(`${resource}/${id}`, values, config);
  return data;
};

export const deleteResource = async ({resource = "category" , id} : Props) => {
  if(!id) throw new Error("Thiếu ID");
  const {data} = await axiosClient.delete(`${resource}/${id}`)
  return data;
}