export interface Season {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface SeasonLeaderEntry {
  rank: number;
  userId: string;
  nickname: string;
  district: string;
  wins: number;
  games: number;
  avgPoints: number;
  avgAssists: number;
  ovr: number;
  tier: string;
  isMe?: boolean;
}
