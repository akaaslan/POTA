import type { ID, Nullable } from '../common';

// ─── Court ────────────────────────────────────────────────────────────────────
export type CourtTier = 'Açık Saha' | 'Orta Seviye' | 'Yarı-Pro' | 'Pro-Am' | 'Elit';
export type CourtStatus = 'live' | 'active' | 'upcoming' | 'inactive';

export interface Court {
  id: ID;
  name: string;
  shortName: string;
  district: string;
  lat: number;
  lng: number;
  players: number;
  capacity: number;
  status: CourtStatus;
  tier: CourtTier;
  popular: boolean;
  distance: string;
  desc: string;
  image: string;
}

// ─── Match ────────────────────────────────────────────────────────────────────
export type MatchFormat = '3v3 Yarı Saha' | '5v5 Tam Saha';
export type MatchFormatKey = '3V3' | '5V5';
export type MatchSkillLevel = 'Açık Saha' | 'Orta Seviye' | 'Yarı-Pro' | 'Pro-Am' | 'Elit';
export type MatchSkillKey = 'ROOKİE' | 'ORTA' | 'PRO-AM' | 'ELİT';
export type MatchStatus = 'live' | 'streaking' | 'upcoming';
export type FeeType = 'Ucretli' | 'Ucretsiz';
export type MatchIntensity = 'Düşük' | 'Orta' | 'Yüksek' | 'Maksimum';

export interface Match {
  id: ID;
  title: string;
  district: string;
  courtName: string;
  courtId: Nullable<ID>;
  dateTime: string;
  format: MatchFormat;
  playersJoined: number;
  capacity: number;
  skillLevel: MatchSkillLevel;
  intensity: MatchIntensity;
  host: string;
  feeType: FeeType;
  fee: string;
  status: Nullable<MatchStatus>;
  image: string;
  distance: string;
  description: string;
  isJoined?: boolean;
  // Optional display-only fields
  urgency?: string;
  rank?: string;
  spots?: string;
  cta?: string;
}

// ─── Match Filters ────────────────────────────────────────────────────────────
export interface MatchFilters {
  district: string;
  skill: string;
  format: string;
}

// ─── Trending Court (home feed variant) ──────────────────────────────────────
export interface TrendingCourt {
  id: ID;
  name: string;
  distance: string;
  heat: string;
  type: string;
  image: string;
  featuredMatch: Nullable<Match>;
  activeRuns: number;
}

// ─── Squad Activity (home feed variant) ──────────────────────────────────────
export interface SquadActivity {
  id: ID;
  /** Display name of the player who triggered the activity */
  user: string;
  /** Short verb / action text */
  action: string;
  /** Highlighted noun (e.g. match title, rank name) */
  highlight: string;
  /** Relative timestamp string e.g. "5 DK ÖNCE" */
  time: string;
  /** District name */
  location: string;
  /** Avatar URL */
  avatar: string;
  /** Whether to show a trailing › arrow */
  arrow: boolean;
}

// ─── Home Feed ────────────────────────────────────────────────────────────────
export interface HomeFeed {
  heroMatch: Nullable<Match>;
  squadActivity: SquadActivity[];
  trendingCourts: TrendingCourt[];
  urgentRuns: Match[];
}

// ─── Create Match payload ─────────────────────────────────────────────────────
export interface CreateMatchPayload {
  title: string;
  district: string;
  courtId: Nullable<ID>;
  courtName: string;
  dateTime: string;
  format: MatchFormatKey;
  capacity: number;
  skillLevel: MatchSkillKey;
  intensity: string;
  feeType: FeeType;
  fee: string;
  description: string;
}

// ─── Score Report payload ─────────────────────────────────────────────────────
export interface ScoreReportPayload {
  matchId: ID;
  teamAScore: number;
  teamBScore: number;
}

// ─── Label maps ──────────────────────────────────────────────────────────────
export const FORMAT_LABEL: Record<MatchFormatKey, MatchFormat> = {
  '3V3': '3v3 Yarı Saha',
  '5V5': '5v5 Tam Saha',
} as const;

export const SKILL_LABEL: Record<MatchSkillKey, MatchSkillLevel> = {
  'ROOKİE': 'Açık Saha',
  'ORTA':   'Orta Seviye',
  'PRO-AM': 'Pro-Am',
  'ELİT':   'Elit',
} as const;
