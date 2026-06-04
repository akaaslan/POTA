import type { ID } from '../common';

// ─── Team / Squad ─────────────────────────────────────────────────────────────
export interface Team {
  id: ID;
  name: string;
  district: string;
  description: string;
  rosterSize: number;
  chemistry: number;
  isJoined: boolean;
  image: string;
  ranking?: string;
}

// ─── Team roster member ───────────────────────────────────────────────────────
export interface RosterMember {
  userId: ID;
  nickname: string;
  position: string;
  jerseyNumber: string;
  avatar?: string | null;
}

// ─── Team detail (extended) ───────────────────────────────────────────────────
export interface TeamDetail extends Team {
  roster: RosterMember[];
  wins: number;
  losses: number;
}
