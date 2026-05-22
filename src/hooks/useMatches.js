import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchService } from '../services';
import { useUIStore } from '../store/ui';
import { t } from '../i18n';

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
  var showToast = useUIStore(function(s) { return s.showToast; });
  return useMutation({
    mutationFn: function(matchId) { return matchService.joinMatch(matchId); },
    onSuccess: function() {
      qc.invalidateQueries({ queryKey: ['home-feed'] });
      qc.invalidateQueries({ queryKey: ['runs-feed'] });
      showToast(t('toast.join_match_success'), 'success');
    },
    onError: function() {
      showToast(t('toast.join_match_error'), 'error');
    },
  });
}

export function useLeaveMatch() {
  var qc = useQueryClient();
  var showToast = useUIStore(function(s) { return s.showToast; });
  return useMutation({
    mutationFn: function(matchId) { return matchService.leaveMatch(matchId); },
    onSuccess: function() {
      qc.invalidateQueries({ queryKey: ['home-feed'] });
      qc.invalidateQueries({ queryKey: ['runs-feed'] });
    },
    onError: function() {
      showToast(t('toast.leave_match_error'), 'error');
    },
  });
}

export function useCreateMatch() {
  var qc = useQueryClient();
  var showToast = useUIStore(function(s) { return s.showToast; });
  return useMutation({
    mutationFn: function(data) { return matchService.createMatch(data); },
    onSuccess: function() {
      qc.invalidateQueries({ queryKey: ['home-feed'] });
      qc.invalidateQueries({ queryKey: ['runs-feed'] });
    },
    onError: function() {
      showToast(t('toast.create_match_error'), 'error');
    },
  });
}

export function useReportScore() {
  var qc = useQueryClient();
  var showToast = useUIStore(function(s) { return s.showToast; });
  return useMutation({
    mutationFn: function(payload) { return matchService.reportScore(payload.matchId, payload.outcome); },
    onSuccess: function() {
      qc.invalidateQueries({ queryKey: ['profile'] });
      showToast(t('toast.report_score_success'), 'success');
    },
    onError: function() {
      showToast(t('toast.report_score_error'), 'error');
    },
  });
}
