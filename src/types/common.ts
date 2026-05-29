// ─── Common primitives ────────────────────────────────────────────────────────
export type ID = string;
export type ISO8601 = string;
export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;
export type StringRecord = Record<string, string>;
export type NumericString = string; // e.g. "75 TL", "34"

// ─── Utility: make selected keys optional ────────────────────────────────────
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ─── App-wide toast types ─────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warn' | 'info';

export interface Toast {
  message: string;
  type: ToastType;
}

// ─── App boot lifecycle ───────────────────────────────────────────────────────
export type BootState = 'idle' | 'loading' | 'guest' | 'ready';
