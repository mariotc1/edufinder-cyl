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

// INTERCEPTOR DE RESPONSE
// Si un token enviado deja de ser válido (expirado o revocado), se limpia la sesión local
// y se avisa al AuthContext para que la UI no muestre al usuario como autenticado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error?.response?.status === 401 &&
      error.config?.headers?.Authorization
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:expired"));
    }
    return Promise.reject(error);
  }
);
