export interface TourStep {
  id: string;
  targetSelector: string;
  targetSelectorMobile?: string;
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  placementMobile?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  spotlightPadding?: number;
  // En vez de centrar o pegar el elemento a la cabecera, se desplaza hasta este ancla (p. ej. "Resultados")
  scrollAnchor?: string;
  icon?: 'sparkles' | 'search' | 'heart' | 'map' | 'hand-wave' | 'party' | 'compass' | 'palette';
  // Bloque visual extra bajo la descripción (leyenda de colores, acciones de la tarjeta)
  extra?: 'leyenda' | 'acciones';
  // Actions to perform before showing this step
  requiresMobileMenu?: boolean; // Open mobile menu before this step
  // Special styling for first/final step
  isWelcomeStep?: boolean;
  isFinalStep?: boolean;
}

export const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    targetSelector: '',
    title: 'Encuentra qué estudiar y dónde hacerlo',
    description: 'Todos los centros educativos y ciclos de FP de Castilla y León, con los datos abiertos oficiales de la Junta. Te enseñamos lo esencial en un minuto.',
    placement: 'center',
    icon: 'hand-wave',
    isWelcomeStep: true,
  },
  {
    id: 'descubre-fp',
    targetSelector: '[data-tour="descubre-fp"]',
    title: '¿No sabes qué estudiar?',
    description: 'Responde 12 preguntas rápidas sobre lo que te gusta y te diremos qué familias de FP encajan contigo, y dónde estudiarlas.',
    placement: 'bottom',
    placementMobile: 'bottom',
    spotlightPadding: 8,
    icon: 'compass',
  },
  {
    id: 'filters',
    targetSelector: '[data-tour="filters"]',
    title: '¿Ya lo tienes claro? Filtra',
    description: 'Elige qué quieres estudiar, la provincia o si buscas público o privado. Para la FP puedes afinar por familia, nivel y modalidad, o dejar que la IA rellene los filtros por ti.',
    placement: 'bottom',
    placementMobile: 'top',
    spotlightPadding: 12,
    icon: 'search',
  },
  {
    id: 'leyenda',
    targetSelector: '[data-tour="centro-card"]',
    title: 'Así se lee cada centro',
    description: 'El color y el icono te dicen qué tipo de centro es antes de leer nada.',
    placement: 'right',
    placementMobile: 'top',
    spotlightPadding: 6,
    scrollAnchor: '[data-tour="resultados"]',
    icon: 'palette',
    extra: 'leyenda',
  },
  {
    id: 'acciones',
    targetSelector: '[data-tour="card-actions"]',
    title: 'Guarda, comparte y compara',
    description: 'Cada centro tiene sus acciones a mano. Toca la tarjeta para ver la ficha completa con todos sus ciclos.',
    placement: 'right',
    placementMobile: 'top',
    spotlightPadding: 6,
    icon: 'heart',
    extra: 'acciones',
  },
  {
    id: 'map',
    targetSelector: '[data-tour="map"]',
    targetSelectorMobile: '[data-tour="map-mobile"]',
    title: 'Explora en el mapa',
    description: 'Todos los centros de Castilla y León en un mapa. Usa tu ubicación para ver lo que tienes cerca de casa.',
    placement: 'bottom',
    placementMobile: 'top',
    spotlightPadding: 8,
    icon: 'map',
  },
  {
    id: 'finish',
    targetSelector: '',
    title: '¡Todo listo!',
    description: 'Con una cuenta gratuita tus favoritos, comparaciones y resultados de Descubre tu FP te acompañan en cualquier dispositivo.',
    placement: 'center',
    icon: 'party',
    isFinalStep: true,
  },
];
