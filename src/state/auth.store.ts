import { create } from 'zustand';
import type { Nullable } from '../types/common';
import type { BootState } from '../types/common';
import type { Session } from '../types/domain/auth';
import type { ProfileDraft } from '../types/domain/profile';

interface AuthState {
  session:   Nullable<Session>;
  bootState: BootState;
  draft:     Nullable<ProfileDraft>;
}

interface AuthActions {
  setSession:   (session: Nullable<Session>) => void;
  clearSession: () => void;
  setDraft:     (draft: Nullable<ProfileDraft>) => void;
  setBootState: (state: BootState) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  session:   null,
  bootState: 'idle',
  draft:     null,

  setSession:   (session) => set({ session, bootState: 'ready' }),
  clearSession: ()        => set({ session: null, bootState: 'guest', draft: null }),
  setDraft:     (draft)   => set({ draft }),
  setBootState: (state)   => set({ bootState: state }),
}));
