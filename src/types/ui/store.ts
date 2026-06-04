import type { Nullable, Toast } from '../common';
import type { SheetName, SheetPayload } from './sheets';
import type { MatchFilters } from '../domain/match';

// ─── UI store state ───────────────────────────────────────────────────────────
export interface UIState {
  activeSheet: Nullable<SheetName>;
  /** Raw payload for the active sheet. Cast to the appropriate type in the consumer. */
  sheetPayload: unknown;
  activeFilters: MatchFilters;
  toast: Nullable<Toast>;
}

// ─── UI store actions ─────────────────────────────────────────────────────────
export interface UIActions {
  openSheet: (name: SheetName, payload?: unknown) => void;
  closeSheet: () => void;
  setFilters: (filters: Partial<MatchFilters>) => void;
  clearFilters: () => void;
  showToast: (message: string, type?: Toast['type']) => void;
  hideToast: () => void;
}

export type UIStore = UIState & UIActions;
