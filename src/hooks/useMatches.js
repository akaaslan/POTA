import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchService } from '../services';
import { useUIStore } from '../store/ui';

export function useHomeFeed() {
  return useQuery({
    queryKey: ['home-feed'],
    queryFn: function() { return matchService.getHomeFeed(); },
    staleTime: 60000,
  });
}

export function useRunsFeed() {
  var activeFilters = useUIStore(function(s) { return s.activeFilters; });
  return useQuery({
    queryKey: ['runs-feed', activeFilters],
    queryFn: function() { return matchService.getFilteredMatches(activeFilters); },
    staleTime: 30000,
  });
}

export function useJoinMatch() {
  var qc = useQueryClient();
  return useMutation({
    mutationFn: function(matchId) { return matchService.joinMatch(matchId); },
    onSuccess: function() {
      qc.invalidateQueries({ queryKey: ['home-feed'] });
      qc.invalidateQueries({ queryKey: ['runs-feed'] });
    },
  });
}

export function useLeaveMatch() {
  var qc = useQueryClient();
  return useMutation({
    mutationFn: function(matchId) { return matchService.leaveMatch(matchId); },
    onSuccess: function() {
      qc.invalidateQueries({ queryKey: ['home-feed'] });
      qc.invalidateQueries({ queryKey: ['runs-feed'] });
    },
  });
}

export function useCreateMatch() {
  var qc = useQueryClient();
  return useMutation({
    mutationFn: function(data) { return matchService.createMatch(data); },
    onSuccess: function() {
      qc.invalidateQueries({ queryKey: ['home-feed'] });
      qc.invalidateQueries({ queryKey: ['runs-feed'] });
    },
  });
}
