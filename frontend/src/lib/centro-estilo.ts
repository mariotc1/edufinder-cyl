// IDENTIDAD VISUAL POR TIPO DE CENTRO
// Cada tipo tiene un icono y un color propios para reconocerlo de un vistazo en las tarjetas
// (las clases van completas para que Tailwind las detecte)
import {
  Wrench, BookOpen, Blocks, HeartHandshake, Baby, Music, Languages, Users, Palette, Trophy, Shield, Globe2, School,
  type LucideIcon,
} from 'lucide-react';
import { centroTipo } from './centro-format';

export interface EstiloTipo {
  icon: LucideIcon;
  tile: string;   // icono sólido
  header: string; // fondo suave de la cabecera
  text: string;   // etiqueta del tipo
  chip: string;   // etapas
}

const E = (icon: LucideIcon, c: { tile: string; header: string; text: string; chip: string }): EstiloTipo => ({ icon, ...c });

const ESTILOS: Record<string, EstiloTipo> = {
  'Centro de FP': E(Wrench, { tile: 'from-blue-600 to-sky-500 shadow-blue-600/30', header: 'from-blue-100', text: 'text-blue-700', chip: 'bg-blue-50 text-blue-800 ring-blue-100' }),
  'Instituto': E(BookOpen, { tile: 'from-orange-500 to-orange-400 shadow-orange-500/30', header: 'from-orange-100', text: 'text-orange-600', chip: 'bg-orange-50 text-orange-800 ring-orange-100' }),
  'Colegio': E(Blocks, { tile: 'from-emerald-600 to-teal-500 shadow-emerald-600/30', header: 'from-emerald-100', text: 'text-emerald-700', chip: 'bg-emerald-50 text-emerald-800 ring-emerald-100' }),
  'Escuela infantil': E(Baby, { tile: 'from-yellow-400 to-amber-300 shadow-yellow-500/30', header: 'from-yellow-100', text: 'text-yellow-700', chip: 'bg-yellow-50 text-yellow-800 ring-yellow-200' }),
  'Educación especial': E(HeartHandshake, { tile: 'from-rose-500 to-pink-500 shadow-rose-500/30', header: 'from-rose-100', text: 'text-rose-700', chip: 'bg-rose-50 text-rose-800 ring-rose-100' }),
  'Conservatorio': E(Music, { tile: 'from-fuchsia-600 to-pink-500 shadow-fuchsia-600/30', header: 'from-fuchsia-100', text: 'text-fuchsia-700', chip: 'bg-fuchsia-50 text-fuchsia-800 ring-fuchsia-100' }),
  'Música y danza': E(Music, { tile: 'from-fuchsia-600 to-pink-500 shadow-fuchsia-600/30', header: 'from-fuchsia-100', text: 'text-fuchsia-700', chip: 'bg-fuchsia-50 text-fuchsia-800 ring-fuchsia-100' }),
  'Escuela de idiomas': E(Languages, { tile: 'from-cyan-600 to-sky-500 shadow-cyan-600/30', header: 'from-cyan-100', text: 'text-cyan-700', chip: 'bg-cyan-50 text-cyan-800 ring-cyan-100' }),
  'Educación de adultos': E(Users, { tile: 'from-teal-600 to-emerald-500 shadow-teal-600/30', header: 'from-teal-100', text: 'text-teal-700', chip: 'bg-teal-50 text-teal-800 ring-teal-100' }),
  'Arte y diseño': E(Palette, { tile: 'from-purple-600 to-fuchsia-500 shadow-purple-600/30', header: 'from-purple-100', text: 'text-purple-700', chip: 'bg-purple-50 text-purple-800 ring-purple-100' }),
  'Enseñanzas deportivas': E(Trophy, { tile: 'from-lime-600 to-lime-500 shadow-lime-600/30', header: 'from-lime-100', text: 'text-lime-700', chip: 'bg-lime-50 text-lime-800 ring-lime-100' }),
  'Formación militar': E(Shield, { tile: 'from-slate-700 to-slate-500 shadow-slate-700/30', header: 'from-slate-200', text: 'text-slate-700', chip: 'bg-slate-100 text-slate-800 ring-slate-200' }),
  'Colegio internacional': E(Globe2, { tile: 'from-sky-600 to-cyan-500 shadow-sky-600/30', header: 'from-sky-100', text: 'text-sky-700', chip: 'bg-sky-50 text-sky-800 ring-sky-100' }),
};

const POR_DEFECTO = E(School, { tile: 'from-[#223945] to-blue-700 shadow-[#223945]/30', header: 'from-slate-100', text: 'text-[#223945]', chip: 'bg-slate-100 text-[#223945] ring-slate-200' });

export function estiloTipo(denominacion?: string | null): EstiloTipo & { label: string } {
  const label = centroTipo(denominacion);
  return { label, ...(ESTILOS[label] ?? POR_DEFECTO) };
}

// "850 m" · "2,3 km" · "15 km"
export function formatDistancia(km?: number | string | null): string | null {
  const n = typeof km === 'string' ? parseFloat(km) : km;
  if (n == null || isNaN(n)) return null;
  if (n < 1) return `${Math.round(n * 1000)} m`;
  return `${n < 10 ? n.toFixed(1).replace('.', ',') : Math.round(n)} km`;
}

// Estilo a partir del nombre del tipo ("Centro de FP", "Instituto"...), p. ej. para leyendas
export function estiloDeTipo(label: string): EstiloTipo {
  return ESTILOS[label] ?? POR_DEFECTO;
}
