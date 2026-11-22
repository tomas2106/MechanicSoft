import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ms_token");
  const tallerId = localStorage.getItem("ms_taller_id");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (tallerId) {
    config.headers["X-Taller-Id"] = tallerId;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(
        new Error("El servidor está iniciando tras un periodo de inactividad. Intenta nuevamente en unos segundos.")
      );
    }
    if (error.response.status === 401) {
      localStorage.removeItem("ms_token");
    }
    return Promise.reject(error);
  }
);

export default api;