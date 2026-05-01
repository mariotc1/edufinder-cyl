export interface CicloFP {
  id: number;
  centro_id: number;
  familia_profesional: string;
  codigo_familia: string;
  nivel_educativo: string;
  clave_ciclo: string;
  ciclo_formativo: string;
  modalidad: string;
  tipo_ensenanza: string;
}

export interface MatchReason {
  type: string;
  icon: string;
  text: string;
  priority?: number;
}

export interface Centro {
  id: number;
  codigo: string;
  nombre: string;
  naturaleza: string;
  denominacion_generica: string;
  provincia: string;
  municipio: string;
  localidad: string;
  telefono: string;
  email: string;
  web: string;
  codigo_postal: string;
  direccion: string;
  latitud: string;
  longitud: string;
  distancia?: number;
  distancia_km?: number;
  ciclos?: CicloFP[];
  match_reasons?: MatchReason[];
  relevance_score?: number;
  favorite_affinity?: number;
}

export interface FilterOptions {
  q?: string;
  provincia?: string;
  tipo?: string;
  naturaleza?: string;
  familia?: string;
  ciclo?: string;
  nivel?: string;
  modalidad?: string;
  lat?: number;
  lng?: number;
  radio?: number;
  page?: number;
}

export interface SavedSearch {
  id: number;
  name: string;
  filters: FilterOptions;
  created_at: string;
}
