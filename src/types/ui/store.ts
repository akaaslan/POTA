import type { Nullable, Toast } from '../common';
import type { SheetName, SheetPayload } from './sheets';
import type { MatchFilters } from '../domain/match';

// ─── UI store state ───────────────────────────────────────────────────────────
export interface UIState {
  activeSheet: Nullable<SheetName>;
  sheetPayload: Nullable<SheetPayload>;
  activeFilters: MatchFilters;
  toast: Nullable<Toast>;
}

// ─── UI store actions ─────────────────────────────────────────────────────────
export interface UIActions {
  openSheet: (name: SheetName, payload?: Nullable<SheetPayload>) => void;
  closeSheet: () => void;
  setFilters: (filters: Partial<MatchFilters>) => void;
  clearFilters: () => void;
  showToast: (message: string, type?: Toast['type']) => void;
  hideToast: () => void;
}

export type UIStore = UIState & UIActions;
