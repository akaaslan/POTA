import { create } from 'zustand';

var toastTimer = null;

export var useUIStore = create(function(set) {
  return {
    activeSheet: null,
    sheetPayload: null,
    activeFilters: { district: 'Tümü', skill: 'Tümü', format: 'Tümü' },
    toast: null,

    openSheet: function(name, payload) {
      set({ activeSheet: name, sheetPayload: payload || null });
    },
    closeSheet: function() {
      set({ activeSheet: null, sheetPayload: null });
    },
    setFilters: function(filters) {
      set({ activeFilters: filters });
    },
    showToast: function(message, type) {
      if (toastTimer) clearTimeout(toastTimer);
      set({ toast: { message: message, type: type || 'success' } });
      toastTimer = setTimeout(function() { set({ toast: null }); }, 3200);
    },
    hideToast: function() {
      if (toastTimer) clearTimeout(toastTimer);
      set({ toast: null });
    },
  };
});
