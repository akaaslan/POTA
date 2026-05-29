import type { Match } from '../domain/match';
import type { Team } from '../domain/squad';
import type { Profile, Badge } from '../domain/profile';
import type { Notification } from '../domain/notification';
import type { Nullable } from '../common';

// ─── All sheet names in the app ───────────────────────────────────────────────
export type SheetName =
  | 'matchDetail'
  | 'teamDetail'
  | 'chat'
  | 'notifications'
  | 'profileEdit'
  | 'playerProfile'
  | 'activity'
  | 'proUpgrade'
  | 'leaderboard'
  | 'badgeDetail';

// ─── Per-sheet payload types ──────────────────────────────────────────────────
export interface MatchDetailPayload {
  sheet: 'matchDetail';
  match: Match;
}

export interface TeamDetailPayload {
  sheet: 'teamDetail';
  team: Team;
}

export interface ChatPayload {
  sheet: 'chat';
  matchId: string;
  matchTitle: string;
}

export interface NotificationsPayload {
  sheet: 'notifications';
  notifications: Notification[];
}

export interface ProfileEditPayload {
  sheet: 'profileEdit';
  profile: Profile;
}

export interface PlayerProfilePayload {
  sheet: 'playerProfile';
  userId: string;
  nickname: string;
}

export interface ActivityPayload {
  sheet: 'activity';
}

export interface ProUpgradePayload {
  sheet: 'proUpgrade';
}

export interface LeaderboardPayload {
  sheet: 'leaderboard';
}

export interface BadgeDetailPayload {
  sheet: 'badgeDetail';
  badge: Badge;
}

// ─── Discriminated union of all payloads ──────────────────────────────────────
export type SheetPayload =
  | MatchDetailPayload
  | TeamDetailPayload
  | ChatPayload
  | NotificationsPayload
  | ProfileEditPayload
  | PlayerProfilePayload
  | ActivityPayload
  | ProUpgradePayload
  | LeaderboardPayload
  | BadgeDetailPayload;

// ─── Open-sheet helper types ──────────────────────────────────────────────────
export type OpenSheet = (name: SheetName, payload?: Nullable<SheetPayload>) => void;
export type CloseSheet = () => void;
