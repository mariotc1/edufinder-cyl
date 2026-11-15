// FORMATO DE CENTROS PARA PRESENTACIÓN
// El directorio oficial guarda los nombres en mayúsculas, sin tildes y con el tipo de centro
// repetido delante ("COLEGIO DE EDUCACION INFANTIL Y PRIMARIA JUAN DEL ENZINA").
// Estas utilidades lo convierten en algo legible: "Juan del Enzina" · "Colegio" · "Infantil · Primaria".

// Palabras que el dataset trae sin tilde
const ACCENTS: Record<string, string> = {
  EDUCACION: 'EDUCACIÓN', FORMACION: 'FORMACIÓN', PUBLICO: 'PÚBLICO', MUSICA: 'MÚSICA',
  ESPECIFICA: 'ESPECÍFICA', DRAMATICO: 'DRAMÁTICO', PLASTICAS: 'PLÁSTICAS', LEON: 'LEÓN',
  AVILA: 'ÁVILA', POLITECNICO: 'POLITÉCNICO', TECNICO: 'TÉCNICO', MARIA: 'MARÍA',
  JOSE: 'JOSÉ', JESUS: 'JESÚS', ANGEL: 'ÁNGEL', GARCIA: 'GARCÍA', MARTIN: 'MARTÍN',
  RAMON: 'RAMÓN', CONCEPCION: 'CONCEPCIÓN', ASUNCION: 'ASUNCIÓN', CORAZON: 'CORAZÓN',
};

// Palabras que van en minúscula dentro de un nombre (salvo al inicio)
const LOWER = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'e', 'en', 'a', 'al', 'con', 'para', 'por', 'o', 'u']);

// Siglas que deben quedarse en mayúsculas
const ACRONYMS = new Set(['CRA', 'CEIP', 'IES', 'IESO', 'CIFP', 'CEPA', 'EOI', 'FP', 'ESO', 'CPR', 'CEO', 'EEI', 'CEE', 'CFP', 'CC', 'UE', 'TIC', 'II', 'III', 'IV', 'VI', 'VII', 'VIII', 'IX', 'XI', 'XII', 'XIII', 'XXI', 'XXIII']);

// Convierte "FRAY LUIS DE LEON" en "Fray Luis de León"
export function titleCase(text?: string | null): string {
  if (!text) return '';
  return text
    .trim()
    .split(/\s+/)
    .map((raw, i) => {
      const upper = ACCENTS[raw.toUpperCase()] ?? raw.toUpperCase();
      if (ACRONYMS.has(upper.replace(/[.,]/g, ''))) return upper;
      const lower = upper.toLocaleLowerCase('es-ES');
      if (i > 0 && LOWER.has(lower)) return lower;
      // Respeta separadores internos: "MADRE-POLITECNOS" -> "Madre-Politecnos", "(LEÓN)" -> "(León)"
      return lower.replace(/(^|[-(/"'«])(\p{L})/gu, (_, sep, ch) => sep + ch.toLocaleUpperCase('es-ES'));
    })
    .join(' ');
}

// Localidades oficiales vienen como "ADRADA (LA)": se reordena el artículo -> "La Adrada"
export function formatLocalidad(text?: string | null): string {
  if (!text) return '';
  const m = text.match(/^(.*)\s+\((LA|EL|LOS|LAS)\)$/i);
  return titleCase(m ? `${m[2]} ${m[1]}` : text);
}

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();

// Tipos frecuentes del directorio, para limpiar nombres cuando no llega denominacion_generica
// (p. ej. centros guardados en localStorage o respuestas reducidas)
const TIPOS_CONOCIDOS = [
  'CENTRO PRIVADO DE EDUCACION INFANTIL PRIMARIA Y SECUNDARIA', 'CENTRO PRIVADO DE FORMACION PROFESIONAL ESPECIFICA',
  'CENTRO PUBLICO INTEGRADO DE FORMACION PROFESIONAL', 'CENTRO PRIVADO INTEGRADO DE FORMACION PROFESIONAL',
  'CENTRO PUBLICO DE EDUCACION DE PERSONAS ADULTAS', 'INSTITUTO DE EDUCACION SECUNDARIA OBLIGATORIA',
  'CENTRO PRIVADO DE EDUCACION INFANTIL Y PRIMARIA', 'COLEGIO DE EDUCACION INFANTIL Y PRIMARIA',
  'CENTRO PRIVADO DE EDUCACION SECUNDARIA', 'CENTRO PRIVADO DE EDUCACION INFANTIL', 'CENTRO PRIVADO DE EDUCACION ESPECIAL',
  'INSTITUTO DE EDUCACION SECUNDARIA', 'ESCUELA DE EDUCACION INFANTIL', 'CONSERVATORIO PROFESIONAL DE MUSICA',
  'COLEGIO DE EDUCACION ESPECIAL', 'ESCUELA OFICIAL DE IDIOMAS', 'ESCUELA DE MUSICA Y DANZA', 'ESCUELA DE MUSICA',
];

// Nombre propio del centro, sin el tipo repetido delante
export function centroName(centro: { nombre?: string | null; denominacion_generica?: string | null }): string {
  const nombre = centro.nombre?.trim() ?? '';
  const n = normalize(nombre);
  const tipo = centro.denominacion_generica?.trim()
    || TIPOS_CONOCIDOS.find(t => n.startsWith(t + ' '))
    || '';
  let name = nombre;
  if (tipo && n.startsWith(normalize(tipo)) && nombre.length > tipo.length) {
    name = nombre.slice(tipo.length).trim();
  }
  // Casos como "ESCUELA DE MUSICA ESCUELA DE MÚSICA DE CABRERIZOS": queda "Escuela de Música de Cabrerizos"
  return titleCase(name || nombre);
}

// Denominación genérica del centro; si no llega (historial antiguo, respuestas reducidas) se deduce del nombre
export function denominacionDe(centro: { nombre?: string | null; denominacion_generica?: string | null }): string {
  const n = normalize(centro.nombre ?? '');
  return centro.denominacion_generica?.trim() || TIPOS_CONOCIDOS.find(t => n.startsWith(t + ' ')) || '';
}

// Tipo de centro en lenguaje cotidiano ("Instituto", "Colegio", "Centro de FP"...)
export function centroTipo(denominacion?: string | null): string {
  const d = normalize(denominacion ?? '');
  if (!d) return 'Centro educativo';
  if (d.includes('FORMACION PROFESIONAL')) return 'Centro de FP';
  if (d.includes('IDIOMAS')) return 'Escuela de idiomas';
  if (d.includes('PERSONAS ADULTAS')) return 'Educación de adultos';
  if (d.includes('EDUCACION ESPECIAL')) return 'Educación especial';
  if (d.includes('CONSERVATORIO')) return 'Conservatorio';
  if (d.includes('MUSICA') || d.includes('DANZA')) return 'Música y danza';
  if (d.includes('DEPORTIVAS')) return 'Enseñanzas deportivas';
  if (d.includes('ARTE') || d.includes('DISENO') || d.includes('DRAMATICO')) return 'Arte y diseño';
  if (d.includes('MILITAR')) return 'Formación militar';
  if (d.includes('EXTRANJERO')) return 'Colegio internacional';
  if (d.startsWith('INSTITUTO')) return 'Instituto';
  if (d.includes('ESCUELA DE EDUCACION INFANTIL') || d === 'CENTRO PRIVADO DE EDUCACION INFANTIL') return 'Escuela infantil';
  if (d.includes('PRIMARIA') || d.includes('SECUNDARIA') || d.includes('OBLIGATORIA')) return 'Colegio';
  return titleCase(denominacion).replace(/^Centro Privado (Autorizado )?(de )?/i, '') || 'Centro educativo';
}

// Etapas que se pueden cursar según el tipo de centro (para centros sin ciclos de FP)
export function centroEtapas(denominacion?: string | null): string[] {
  const d = normalize(denominacion ?? '');
  if (d.startsWith('INSTITUTO DE EDUCACION SECUNDARIA OBLIGATORIA')) return ['ESO'];
  if (d.startsWith('INSTITUTO')) return ['ESO', 'Bachillerato'];
  if (d.includes('PERSONAS ADULTAS')) return ['Educación de adultos'];
  if (d.includes('IDIOMAS')) return ['Idiomas'];
  if (d.includes('EDUCACION ESPECIAL')) return ['Educación especial'];
  const etapas: string[] = [];
  if (d.includes('INFANTIL')) etapas.push('Infantil');
  if (d.includes('PRIMARIA')) etapas.push('Primaria');
  if (d.includes('SECUNDARIA') || d.includes('OBLIGATORIA')) etapas.push('ESO');
  if (d.includes('MUSICA')) etapas.push('Música');
  if (d.includes('DANZA')) etapas.push('Danza');
  if (d.includes('DEPORTIVAS')) etapas.push('Deporte');
  if (d.includes('ARTE') || d.includes('DISENO')) etapas.push('Arte y diseño');
  return etapas;
}

// "Salamanca" si localidad y provincia coinciden; si no, "Astorga, León"
export function centroLugar(centro: { localidad?: string | null; provincia?: string | null }): string {
  const localidad = formatLocalidad(centro.localidad);
  const provincia = titleCase(centro.provincia);
  if (!localidad) return provincia;
  return normalize(localidad) === normalize(provincia) ? localidad : `${localidad}, ${provincia}`;
}

// Orden, nombres y colores de los niveles de FP (mismo código de color en toda la app)
export const NIVELES_FP = [
  { key: 'BASIC', label: 'Grado Básico', short: 'Básico', abbr: 'FPB', solid: 'bg-blue-600 text-white', soft: 'bg-blue-50 border-blue-100 text-blue-900' },
  { key: 'MEDIO', label: 'Grado Medio', short: 'Medio', abbr: 'GM', solid: 'bg-amber-500 text-white', soft: 'bg-amber-50 border-amber-100 text-amber-900' },
  { key: 'SUPERIOR', label: 'Grado Superior', short: 'Superior', abbr: 'GS', solid: 'bg-purple-600 text-white', soft: 'bg-purple-50 border-purple-100 text-purple-900' },
  { key: 'ESPECIALIZA', label: 'Curso de Especialización', short: 'Especialización', abbr: 'CE', solid: 'bg-rose-600 text-white', soft: 'bg-rose-50 border-rose-100 text-rose-900' },
] as const;

export function nivelFP(nivel?: string | null) {
  const n = normalize(nivel ?? '');
  return NIVELES_FP.find(l => n.includes(l.key)) ?? null;
}
