import type { ID } from '../common';

// ─── Supabase table row types (matches DB schema exactly) ─────────────────────

export interface SupabaseProfileRow {
  id: ID;
  email: string;
  nickname: string | null;
  district: string | null;
  jersey_number: string | null;
  position: string | null;
  archetype: string | null;
  experience: string | null;
  bio: string | null;
  rank: string | null;
  rank_tier: number | null;
  player_rep: string | null;
  street_status: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseMatchRow {
  id: ID;
  title: string;
  district: string;
  court_id: ID | null;
  court_name: string;
  date_time: string;
  format: string;
  players_joined: number;
  capacity: number;
  skill_level: string;
  intensity: string;
  created_by: ID;
  fee_type: string;
  fee: string;
  status: string | null;
  image: string | null;
  description: string | null;
  created_at: string;
  // Joined relations
  courts?: SupabaseCourtRow | null;
  profiles?: { nickname: string } | null;
  match_participants?: Array<{ user_id: ID }>;
}

export interface SupabaseCourtRow {
  id: ID;
  name: string;
  short_name: string;
  district: string;
  lat: number;
  lng: number;
  capacity: number;
  status: string;
  tier: string;
  popular: boolean;
  distance: string;
  description: string;
  image: string | null;
}

export interface SupabaseTeamRow {
  id: ID;
  name: string;
  district: string;
  description: string | null;
  roster_size: number;
  chemistry: number;
  image: string | null;
  created_by: ID;
  created_at: string;
  // Joined relations
  team_members?: Array<{ user_id: ID }>;
}

export interface SupabaseNotificationRow {
  id: ID;
  user_id: ID;
  type: string;
  title: string;
  body: string;
  read: boolean;
  target_id: ID | null;
  created_at: string;
}

// ─── Generic API response wrapper ────────────────────────────────────────────
export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: string;
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;
