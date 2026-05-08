import axios from "axios";

// Centralized API client with authentication and session management.
const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Request interceptor: attach stored token to every API call.
axiosInstance.interceptors.request.use((config) => {
  // Check localStorage first (persistent), then sessionStorage (session-only).
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor: redirect to login if token becomes invalid (401).
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Clear all auth data when the server rejects the token.
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;