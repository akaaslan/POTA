import { Platform } from 'react-native';

// ─── Push Bildirimler ─────────────────────────────────────────────────────────
// expo-notifications paketi EAS Build / geliştirme build'i gerektirir.
// Expo Go'da ÇALIŞMAZ. Şu an tüm fonksiyonlar no-op döner.
// EAS Build kullanmak için:
//   1. npx expo install expo-notifications
//   2. eas build --profile development --platform android
// ─────────────────────────────────────────────────────────────────────────────

export async function registerForPushNotifications(): Promise<string | null> {
  // TODO: expo-notifications ile implement et (EAS Build gerektirir)
  return null;
}

export async function scheduleMatchReminder(_title: string, _time: Date): Promise<void> {
  // TODO: expo-notifications ile implement et
}

export async function cancelAllScheduled(): Promise<void> {}

export async function clearBadge(): Promise<void> {}

export function addNotificationResponseListener(
  _onPress: (data: Record<string, string>) => void,
): () => void {
  return () => {};
}

export const pushService = {
  registerForPushNotifications,
  scheduleMatchReminder,
  cancelAllScheduled,
  clearBadge,
  addNotificationResponseListener,
};
