import { create } from 'zustand';

export var useUIStore = create(function(set) {
  return {
    activeSheet: null,
    sheetPayload: null,
    activeFilters: { district: 'Tümü', skill: 'Tümü', format: 'Tümü' },

    openSheet: function(name, payload) {
      set({ activeSheet: name, sheetPayload: payload || null });
    },
    closeSheet: function() {
      set({ activeSheet: null, sheetPayload: null });
    },
    setFilters: function(filters) {
      set({ activeFilters: filters });
    },
  };
});
