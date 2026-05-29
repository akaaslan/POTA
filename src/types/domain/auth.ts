import type { ID, Nullable, BootState } from '../common';
import type { Profile, ProfileDraft } from './profile';

// ─── Auth session (runtime state) ────────────────────────────────────────────
export interface Session {
  id: ID;
  email: string;
  profile: Nullable<Profile>;
  needsProfile?: boolean;
}

// ─── Auth store state ─────────────────────────────────────────────────────────
export interface AuthState {
  session: Nullable<Session>;
  bootState: BootState;
}

// ─── Sign-in / sign-up payloads ───────────────────────────────────────────────
export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload extends SignInPayload {
  draft: ProfileDraft;
}

export interface GoogleSignInResult {
  id: ID;
  email: string;
  profile: Nullable<Profile>;
  needsProfile: boolean;
}

// ─── Auth store actions ───────────────────────────────────────────────────────
export interface AuthActions {
  setSession: (session: Nullable<Session>) => void;
  setBootState: (state: BootState) => void;
  clearSession: () => void;
}

export type AuthStore = AuthState & AuthActions;
