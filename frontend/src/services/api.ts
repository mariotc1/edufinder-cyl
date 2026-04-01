import axios from "@/lib/axios";
import { FilterOptions } from "@/types";

// SERVICIO DE BÚSQUEDA DE CENTROS
// Construye la query string basada en los filtros y realiza la petición al backend
export const searchCentros = async (filters: FilterOptions) => {
  const params = new URLSearchParams();

  if (filters.q) params.append("q", filters.q);
  if (filters.provincia) params.append("provincia", filters.provincia);
  if (filters.tipo) params.append("tipo", filters.tipo);
  if (filters.naturaleza) params.append("naturaleza", filters.naturaleza);
  if (filters.familia) params.append("familia", filters.familia);
  if (filters.ciclo) params.append("ciclo", filters.ciclo);
  if (filters.nivel) params.append("nivel", filters.nivel);
  if (filters.modalidad) params.append("modalidad", filters.modalidad);

  if (filters.lat && filters.lng && filters.radio) {
    params.append("lat", filters.lat.toString());
    params.append("lng", filters.lng.toString());
    params.append("radio", filters.radio.toString());
  }

  if (filters.page) params.append("page", filters.page.toString());

  const response = await axios.get(`/busqueda?${params.toString()}`);
  return response.data;
};

// GESTIÓN DE FAVORITOS
// Añadir un centro a favoritos
export const addFavorite = async (centroId: number) => {
  const response = await axios.post(`/favoritos/${centroId}`);
  return response.data;
};

// Eliminar un centro de favoritos
export const removeFavorite = async (centroId: number) => {
  const response = await axios.delete(`/favoritos/${centroId}`);
  return response.data;
};

// SUGERENCIAS DE BÚSQUEDA (AUTOCOMPLETE)
// Obtener sugerencias de ciclos formativos
// Acepta filtros opcionales para mostrar solo ciclos que coincidan con los criterios
interface CycleSuggestionFilters {
  nivel?: string;
  familia?: string;
  modalidad?: string;
}

export const fetchCycleSuggestions = async (q: string, filters?: CycleSuggestionFilters) => {
  const params = new URLSearchParams();
  params.append('q', q);

  if (filters?.nivel) params.append('nivel', filters.nivel);
  if (filters?.familia) params.append('familia', filters.familia);
  if (filters?.modalidad) params.append('modalidad', filters.modalidad);

  const response = await axios.get(`/ciclos/sugerencias?${params.toString()}`);
  return response.data;
};

// Obtener sugerencias de centros educativos
// Acepta filtros opcionales para mostrar solo centros que coincidan con los criterios
interface CentroSuggestionFilters {
  provincia?: string;
}

export const fetchCentroSuggestions = async (q: string, filters?: CentroSuggestionFilters) => {
  const params = new URLSearchParams();
  params.append('q', q);

  if (filters?.provincia) params.append('provincia', filters.provincia);

  const response = await axios.get(`/centros/sugerencias?${params.toString()}`);
  return response.data;
};

// BÚSQUEDAS GUARDADAS
// Obtener todas las búsquedas guardadas del usuario
export const getSavedSearches = async () => {
  const response = await axios.get('/saved-searches');
  return response.data;
};

// Guardar una nueva búsqueda
export const createSavedSearch = async (name: string, filters: FilterOptions) => {
  const response = await axios.post('/saved-searches', { name, filters });
  return response.data;
};

// Eliminar una búsqueda guardada
export const deleteSavedSearch = async (id: number) => {
  const response = await axios.delete(`/saved-searches/${id}`);
  return response.data;
};
