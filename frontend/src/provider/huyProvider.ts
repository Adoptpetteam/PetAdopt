import axios from "axios";

// ===== BASE URL =====
const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

// ===== AXIOS CLIENT =====
const axiosClient = axios.create({
  baseURL,
});

// ===== REQUEST INTERCEPTOR =====
axiosClient.interceptors.request.use((config) => {
  const isAdminPage = window.location.pathname.startsWith("/admin");

  const token = isAdminPage
    ? localStorage.getItem("admin_token")
    : localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ===== RESPONSE INTERCEPTOR =====
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 401) {
        const isAdminPage = window.location.pathname.startsWith("/admin");

        if (isAdminPage) {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
          window.location.href = "/admin/login";
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// ===== TYPES =====
export type Props = {
  resource: string;
  id?: number | string;
  values?: any;
};

// ===== GET LIST =====
export const getListResource = async ({ resource = "category" }: Props) => {
  const { data } = await axiosClient.get(resource);

  if (data.success && data.data) return data.data;
  return data;
};

// ===== GET DETAIL =====
export const getResourceDetail = async ({
  id,
  resource = "category",
}: Props) => {
  if (!id) throw new Error("Thiếu ID");

  const { data } = await axiosClient.get(`${resource}/${id}`);

  if (data.success && data.data) return data.data;
  return data;
};

// ===== CREATE =====
export const createResource = async ({
  resource = "category",
  values,
}: Props) => {
  let config: any = undefined;

  // 🔥 QUAN TRỌNG: nếu là FormData thì set đúng header
  if (values instanceof FormData) {
    config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
  }

  const { data } = await axiosClient.post(resource, values, config);

  return data;
};

// ===== UPDATE =====
export const updateResource = async ({
  resource = "category",
  id,
  values,
}: Props) => {
  if (!id) throw new Error("Thiếu ID");

  let config: any = undefined;

  if (values instanceof FormData) {
    config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
  }

  const { data } = await axiosClient.put(
    `${resource}/${id}`,
    values,
    config
  );

  return data;
};

// ===== DELETE =====
export const deleteResource = async ({
  resource = "category",
  id,
}: Props) => {
  if (!id) throw new Error("Thiếu ID");

  const { data } = await axiosClient.delete(`${resource}/${id}`);
  return data;
};

export default axiosClient;