import axios from '@/lib/axios';
import { FilterOptions } from '@/types';

export const searchCentros = async (filters: FilterOptions) => {
  const params = new URLSearchParams();

  if (filters.q) params.append('q', filters.q);
  if (filters.provincia) params.append('provincia', filters.provincia);
  if (filters.tipo) params.append('tipo', filters.tipo);
  if (filters.familia) params.append('familia', filters.familia);
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

export const toggleFavorite = async (centroId: number) => {
  // Assuming POST /favoritos/toggle matches the backend convention for "smart toggle"
  // If not, we might need separate add/remove endpoints. 
  // For now, usually POST to a resource collection with an ID implies adding, 
  // but a specific 'toggle' action is common in these apps.
  // Converting to standard REST: usually POST to add, DELETE to remove.
  // Let's assume a toggle endpoint exists or we use POST to 'favoritos' which handles uniqueness.
  // I will use a robust approach: try to toggle.
  const response = await axios.post('/favoritos/toggle', { centro_id: centroId });
  return response.data;
};
