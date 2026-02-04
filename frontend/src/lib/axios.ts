import axios from "axios";

// INSTANCIA AXIOS CENTRALIZADA

// INSTANCIA AXIOS CENTRALIZADA
// Configuración base para todas las peticiones HTTP
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// INTERCEPTOR DE REQUEST
// Inyecta automáticamente el token JWT en las cabeceras si existe
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
