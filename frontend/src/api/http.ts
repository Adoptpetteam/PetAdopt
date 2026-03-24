import axios from "axios";

/** Base URL API backend, ví dụ: http://localhost:5000/api */
const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});
