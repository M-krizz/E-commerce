import axios from "axios";

// Create an Axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000",
});

// Public API without auth header (for login/otp/forgot)
export const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000",
});

const AUTH_EXCLUDE_PATHS = [
  "/auth/login",
  "/auth/verify-otp",
  "/auth/forgot-password",
  "/auth/verify-reset-otp",
  "/auth/reset-password",
];

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("jwt");
      const url = config.url || "";
      const shouldSkip = AUTH_EXCLUDE_PATHS.some((path) => url.startsWith(path));
      if (token && !shouldSkip) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("jwt");
      localStorage.removeItem("profile");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
