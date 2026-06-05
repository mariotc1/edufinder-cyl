// Haptic feedback for PWA/mobile
// navigator.vibrate() works on Android Chrome/Firefox.
// iOS Safari has no web haptics API — calls are silently ignored.

type HapticStyle =
  | 'selection'     // Subtle tick — tab switch, minor interaction
  | 'impact-light'  // Soft tap — add to favorites
  | 'impact-medium' // Double tap — remove from favorites, confirm
  | 'success'       // Success pattern — save completed
  | 'warning'       // Error buzz
  | 'heavy';        // Strong single — destructive action

const PATTERNS: Record<HapticStyle, number | number[]> = {
  'selection':     8,
  'impact-light':  14,
  'impact-medium': [10, 40, 10],
  'success':       [14, 60, 22],
  'warning':       [30, 50, 30],
  'heavy':         55,
};

export function haptic(style: HapticStyle = 'impact-light'): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  try { navigator.vibrate(PATTERNS[style]); } catch { /* silenced */ }
}

// Legacy alias — keeps existing callers working
type LegacyIntensity = 'light' | 'medium' | 'success';
const LEGACY_MAP: Record<LegacyIntensity, HapticStyle> = {
  light:   'impact-light',
  medium:  'impact-medium',
  success: 'success',
};
export function hapticFeedback(intensity: LegacyIntensity = 'light'): void {
  haptic(LEGACY_MAP[intensity]);
}

export function supportsHaptics(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}
