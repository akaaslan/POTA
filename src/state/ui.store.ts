import { create } from 'zustand';
import type { Nullable, Toast, ToastType } from '../types/common';
import type { SheetName } from '../types/ui/sheets';
import type { MatchFilters } from '../types/domain/match';

const DEFAULT_FILTERS: MatchFilters = {
  district: 'Tümü',
  skill:    'Tümü',
  format:   'Tümü',
};

interface UIState {
  activeSheet:   Nullable<SheetName>;
  sheetPayload:  unknown;
  activeFilters: MatchFilters;
  toast:         Nullable<Toast>;
}

interface UIActions {
  openSheet:    (name: SheetName, payload?: unknown) => void;
  closeSheet:   () => void;
  setFilters:   (filters: MatchFilters) => void;
  clearFilters: () => void;
  showToast:    (message: string, type?: ToastType) => void;
  hideToast:    () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useUIStore = create<UIState & UIActions>((set) => ({
  activeSheet:   null,
  sheetPayload:  null,
  activeFilters: DEFAULT_FILTERS,
  toast:         null,

  openSheet: (name, payload) => {
    set({ activeSheet: name, sheetPayload: payload ?? null });
  },
  closeSheet: () => {
    set({ activeSheet: null, sheetPayload: null });
  },
  setFilters: (filters) => {
    set({ activeFilters: filters });
  },
  clearFilters: () => {
    set({ activeFilters: DEFAULT_FILTERS });
  },
  showToast: (message, type = 'success') => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: { message, type } });
    toastTimer = setTimeout(() => set({ toast: null }), 3200);
  },
  hideToast: () => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: null });
  },
}));
