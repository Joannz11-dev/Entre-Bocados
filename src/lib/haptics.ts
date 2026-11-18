import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Hápticos suaves: el "squish" se siente también en la mano. */
function run(effect: () => void) {
  if (Platform.OS === 'web') return;
  try {
    effect();
  } catch {
    /* sin hápticos disponibles: no pasa nada */
  }
}

export const haptic = {
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warn: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};
