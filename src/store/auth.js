import { create } from 'zustand';

export var useAuthStore = create(function(set) {
  return {
    session: null,
    bootState: 'idle', // 'idle' | 'loading' | 'guest' | 'ready'
    draft: null,

    setSession: function(session) {
      set({ session: session, bootState: 'ready' });
    },
    clearSession: function() {
      set({ session: null, bootState: 'guest', draft: null });
    },
    setDraft: function(draft) {
      set({ draft: draft });
    },
    setBootState: function(state) {
      set({ bootState: state });
    },
  };
});
