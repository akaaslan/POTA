// ─── AsyncStorage thin wrapper ────────────────────────────────────────────────
// Merkezi key yönetimi + tip güvenliği için kullanın.
// Doğrudan AsyncStorage kullanmak yerine bu modülü tercih edin.
// ─────────────────────────────────────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Storage key registry ─────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  SESSION:          '@pota_session',
  ONBOARDING_DRAFT: '@pota_onboarding_draft',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// ─── Typed read / write / remove ─────────────────────────────────────────────
export async function storageGet<T>(key: StorageKey): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function storageSet<T>(key: StorageKey, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Depolama hatalarını sessizce yut (kritik değil)
  }
}

export async function storageRemove(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // noop
  }
}
