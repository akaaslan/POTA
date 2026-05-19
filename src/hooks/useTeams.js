import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../services';

export function useTeamFeed() {
  return useQuery({
    queryKey: ['team-feed'],
    queryFn: function() { return teamService.getFeaturedTeams(); },
    staleTime: 60000,
  });
}

export function useJoinTeam() {
  var qc = useQueryClient();
  return useMutation({
    mutationFn: function(teamId) { return teamService.joinTeam(teamId); },
    onSuccess: function() {
      qc.invalidateQueries({ queryKey: ['team-feed'] });
    },
  });
}
