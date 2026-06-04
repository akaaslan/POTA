import type { ID, Nullable } from '../common';

// ─── Profile ──────────────────────────────────────────────────────────────────
export type ExperienceLevel = 'Yeni Başlayan' | 'Orta Seviye' | 'İleri Seviye' | 'Yarı-Pro' | 'Pro-Am' | 'Elit';
export type PlayerPosition = 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'Combo' | 'Unspecified';
export type PlayerArchetype = 'Playmaker' | 'Shooter' | 'Slasher' | 'Defender' | 'Big Man' | 'All-Around';
export type BadgeTier = 'HOF' | 'GOLD' | 'SILVER' | 'BRONZE';

export interface Badge {
  id: ID;
  label: string;
  icon: string;
  active: boolean;
  tier: BadgeTier;
  description: string;
  unlockCondition?: string;
}

export interface Profile {
  uid: ID;
  nickname: string;
  district: string;
  jerseyNumber: string;
  position: PlayerPosition;
  archetype: PlayerArchetype;
  experience: ExperienceLevel;
  bio: string;
  rank?: string;
  rankTier?: number;
  playerRep?: string;
  streetStatus?: string;
  avatar?: Nullable<string>;
}

export interface ProfileStatItem {
  label: string;
  value: string;
}

export interface ProfileRecentMatch {
  id: string;
  outcome: string;
  date: string;
  versus: string;
  matchName?: string;
  scoreA?: number;
  scoreB?: number;
  stats: Array<{ label: string; value: string | number }>;
  tags?: string[];
  mvp?: boolean;
}

export interface ProfileOverview {
  profile: Partial<Profile>;
  stats: ProfileStatItem[];
  badges: Badge[];
  recentMatches: ProfileRecentMatch[];
}

export interface PlayerStats {
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  avgPoints?: number;
  avgAssists?: number;
  avgRebounds?: number;
}

export interface RecentMatchSummary {
  id: ID;
  courtName: string;
  dateTime: string;
  result: 'W' | 'L' | 'DNF';
  score?: string;
}

// ─── Profile Draft (onboarding / form) ───────────────────────────────────────
export interface ProfileDraft {
  email: string;
  password: string;
  nickname: string;
  district: string;
  jerseyNumber: string;
  position: string;
  archetype: string;
  experience: string;
  bio: string;
}
