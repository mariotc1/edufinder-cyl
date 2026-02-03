import axios from '@/lib/axios';
import { FilterOptions } from '@/types';

export const searchCentros = async (filters: FilterOptions) => {
  const params = new URLSearchParams();

  if (filters.q) params.append('q', filters.q);
  if (filters.provincia) params.append('provincia', filters.provincia);
  if (filters.tipo) params.append('tipo', filters.tipo);
  if (filters.familia) params.append('familia', filters.familia);
  if (filters.ciclo) params.append('ciclo', filters.ciclo);
  if (filters.nivel) params.append('nivel', filters.nivel);
  if (filters.modalidad) params.append('modalidad', filters.modalidad);
  
  if (filters.lat && filters.lng && filters.radio) {
    params.append('lat', filters.lat.toString());
    params.append('lng', filters.lng.toString());
    params.append('radio', filters.radio.toString());
  }

  if (filters.page) params.append('page', filters.page.toString());

  const response = await axios.get(`/busqueda?${params.toString()}`);
  return response.data;
};

export const addFavorite = async (centroId: number) => {
  const response = await axios.post(`/favoritos/${centroId}`);
  return response.data;
};

export const removeFavorite = async (centroId: number) => {
  const response = await axios.delete(`/favoritos/${centroId}`);
  return response.data;
};

export const fetchCycleSuggestions = async (q: string) => {
  const response = await axios.get(`/ciclos/sugerencias?q=${encodeURIComponent(q)}`);
  return response.data;
};

export const fetchCentroSuggestions = async (q: string) => {
  const response = await axios.get(`/centros/sugerencias?q=${encodeURIComponent(q)}`);
  return response.data;
};