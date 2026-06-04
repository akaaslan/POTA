import { useQuery } from '@tanstack/react-query';
import { leaderboardService } from '../services';

export function useLeaderboard(seasonId?: number) {
  return useQuery({
    queryKey:  ['leaderboard', seasonId],
    queryFn:   () => leaderboardService.getLeaderboard(seasonId),
    staleTime: 60_000,
  });
}

export function useSeasons() {
  return useQuery({
    queryKey:  ['seasons'],
    queryFn:   () => leaderboardService.getSeasons(),
    staleTime: 300_000,
  });
}
