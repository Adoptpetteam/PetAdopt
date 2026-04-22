import axios from "axios";

/** Base URL API backend, ví dụ: http://localhost:5000/api */
function resolveApiBaseUrl(): string {
  const fallback = "http://localhost:5000/api";
  const raw = import.meta.env.VITE_API_URL;
  if (!raw) return fallback;

  const cleaned = String(raw).trim();
  if (!cleaned) return fallback;

  try {
    const normalized = cleaned.replace(/\/+$/, "");
    const url = new URL(normalized);
    if (!url.protocol || !url.host) return fallback;
    return normalized;
  } catch {
    return fallback;
  }
}

const baseURL = resolveApiBaseUrl();

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
