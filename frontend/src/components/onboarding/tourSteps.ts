export interface TourStep {
  id: string;
  targetSelector: string;
  targetSelectorMobile?: string;
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  placementMobile?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  spotlightPadding?: number;
  icon?: 'sparkles' | 'search' | 'heart' | 'map' | 'hand-wave';
  // Actions to perform before showing this step
  requiresMobileMenu?: boolean; // Open mobile menu before this step
}

export const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    targetSelector: '',
    title: 'Bienvenido a EduFinder',
    description: 'Te mostraremos las funciones principales para que encuentres tu centro educativo ideal en Castilla y León. Solo llevará un momento.',
    placement: 'center',
    icon: 'hand-wave',
  },
  {
    id: 'ai-wizard',
    targetSelector: '[data-tour="ai-wizard"]',
    title: 'Asistente Inteligente',
    description: 'Nuestro asistente con IA te guía paso a paso para encontrar el centro perfecto según tus preferencias.',
    placement: 'bottom',
    placementMobile: 'bottom',
    spotlightPadding: 8,
    icon: 'sparkles',
  },
  {
    id: 'filters',
    targetSelector: '[data-tour="filters"]',
    title: 'Filtros Avanzados',
    description: 'Filtra por provincia, tipo de enseñanza, titularidad y mucho más. También puedes buscar centros cerca de tu ubicación.',
    placement: 'bottom',
    placementMobile: 'top',
    spotlightPadding: 12,
    icon: 'search',
  },
  {
    id: 'favorites',
    // Desktop: apunta al link del navbar
    // Móvil: apunta al botón corazón del primer CentroCard (si existe)
    // Si no hay cards, mostrará el fallback
    targetSelector: '[data-tour="favorite-button"]',
    targetSelectorMobile: '[data-tour="favorite-button"]',
    title: 'Guarda tus Favoritos',
    description: 'Pulsa el corazón en cualquier centro para guardarlo en tus favoritos. Crea una cuenta gratuita para no perderlos.',
    placement: 'left',
    placementMobile: 'top',
    spotlightPadding: 8,
    icon: 'heart',
  },
  {
    id: 'map',
    // Desktop: link del mapa en navbar
    targetSelector: '[data-tour="map"]',
    // Móvil: necesita abrir el menú hamburguesa primero
    targetSelectorMobile: '[data-tour="map-mobile"]',
    title: 'Explora en el Mapa',
    description: 'Visualiza todos los centros educativos de Castilla y León en un mapa interactivo.',
    placement: 'bottom',
    placementMobile: 'bottom',
    spotlightPadding: 8,
    icon: 'map',
    requiresMobileMenu: true,
  },
];
