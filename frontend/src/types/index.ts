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
  distancia?: number; // Calculado por backend si hay coords
  ciclos?: CicloFP[];
}

export interface FilterOptions {
  q?: string;
  provincia?: string;
  tipo?: string; // FP, ESO, BACHILLERATO, PRIMARIA
  familia?: string;
  ciclo?: string;
  nivel?: string;
  modalidad?: string;
  lat?: number;
  lng?: number;
  radio?: number;
  page?: number;
}
