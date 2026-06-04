import type { Match } from '../domain/match';
import type { Team } from '../domain/squad';
import type { Profile, Badge } from '../domain/profile';
import type { Notification } from '../domain/notification';
import type { Nullable } from '../common';

// ─── All sheet names in the app ───────────────────────────────────────────────
export type SheetName =
  | 'match-detail'
  | 'team-detail'
  | 'chat'
  | 'notifications'
  | 'profile-edit'
  | 'player-profile'
  | 'activity'
  | 'pro-upgrade'
  | 'leaderboard'
  | 'badge-detail'
  | 'booking';

// ─── Per-sheet payload types ──────────────────────────────────────────────────
export interface MatchDetailPayload {
  sheet: 'match-detail';
  match: Match;
}

export interface TeamDetailPayload {
  sheet: 'team-detail';
  team: Team;
}

export interface ChatPayload {
  sheet: 'chat';
  team?: Team | null;
  matchId?: string;
  matchTitle?: string;
}

export interface NotificationsPayload {
  sheet: 'notifications';
  notifications?: Notification[];
}

export interface ProfileEditPayload {
  sheet: 'profile-edit';
  profile?: Profile | null;
}

export interface PlayerProfilePayload {
  sheet: 'player-profile';
  userId?: string;
  nickname?: string;
  player?: Profile | null;
}

export interface ActivityPayload {
  sheet: 'activity';
}

export interface ProUpgradePayload {
  sheet: 'pro-upgrade';
  plan?: string;
}

export interface LeaderboardPayload {
  sheet: 'leaderboard';
}

export interface BadgeDetailPayload {
  sheet: 'badge-detail';
  badge: Badge;
}

export interface BookingPayload {
  sheet:     'booking';
  courtId:   string;
  courtName: string;
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
  | BadgeDetailPayload
  | BookingPayload;

// ─── Open-sheet helper types ──────────────────────────────────────────────────
export type OpenSheet = (name: SheetName, payload?: Nullable<SheetPayload>) => void;
export type CloseSheet = () => void;
