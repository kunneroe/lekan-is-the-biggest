import * as Haptics from 'expo-haptics';

const safe = (p: Promise<unknown>) => {
  p.catch(() => {});
};

/** Haptics map: tap = presses, grab = a catch moment, success = order placed. */
export const haptic = {
  tap: () => safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  grab: () => safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  select: () => safe(Haptics.selectionAsync()),
  success: () => safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  error: () => safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
