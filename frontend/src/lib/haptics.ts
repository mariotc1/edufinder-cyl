// Utilidad para feedback háptico en PWA/móvil
// Proporciona vibración sutil para acciones importantes

type HapticIntensity = 'light' | 'medium' | 'success';

const intensityMap: Record<HapticIntensity, number | number[]> = {
  light: 10,      // Toque sutil (favorito, botones)
  medium: 20,     // Acción confirmada
  success: [15, 50, 15], // Patrón de éxito (inicio onboarding, fin comparación)
};

/**
 * Ejecuta vibración háptica si está disponible
 * Solo funciona en dispositivos móviles con soporte de vibración
 */
export function hapticFeedback(intensity: HapticIntensity = 'light'): void {
  // Verificar si la API de vibración está disponible
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(intensityMap[intensity]);
    } catch {
      // Silenciar errores - no todos los dispositivos soportan vibración
    }
  }
}

/**
 * Verifica si el dispositivo soporta haptic feedback
 */
export function supportsHaptics(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}
