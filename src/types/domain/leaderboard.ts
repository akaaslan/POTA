// ─── Leaderboard Types ────────────────────────────────────────────────────────

export interface LeaderEntry {
  rank:     number;
  nickname: string;
  district: string;
  wins:     number;
  games:    number;
  ovr:      number;
  tier:     string;
  isMe?:    boolean;
}

export type LeaderSortTab = 'ovr' | 'wins' | 'winpct';
