import type { ID } from '../common';

// ─── Notification types ───────────────────────────────────────────────────────
export type NotificationType =
  | 'info'
  | 'match_invite'
  | 'match_joined'
  | 'match_started'
  | 'match_result'
  | 'team_invite'
  | 'team_joined'
  | 'achievement'
  | 'system';

export interface Notification {
  id: ID;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  time: string;
  /** Optional deep-link target (matchId, teamId, etc.) */
  targetId?: ID;
}
