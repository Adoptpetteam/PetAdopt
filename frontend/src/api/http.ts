import axios from "axios";

// Environment-based API URL configuration for Vite
const getBaseURL = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://api.petadopt.com/api';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const BASE_URL = getBaseURL();

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const isAdminPage = window.location.pathname.startsWith('/admin');
    const token = isAdminPage ? localStorage.getItem("admin_token") : localStorage.getItem("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      const isAdminPage = window.location.pathname.startsWith('/admin');
      if (isAdminPage) {
        localStorage.removeItem("admin_token");
        window.location.href = '/admin/login';
      } else {
        localStorage.removeItem("token");
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient };
export const BASE_URL_API = BASE_URL;
