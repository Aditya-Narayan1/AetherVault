import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
});

export function getApiErrorMessage(error, fallback = "Request failed") {
  const data = error.response?.data;
  if (data?.suggestion) {
    return `${data.message}. ${data.suggestion}`;
  }
  if (data?.message) {
    return data.message;
  }
  if (error.message === "Network Error") {
    return "Network Error: make sure the FastAPI gateway URL is correct and refresh the page.";
  }
  return error.message || fallback;
}

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
