import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchService }  from '../services';
import { useUIStore }    from '@state/ui.store';
import { t }             from '../../../i18n';
import type { ID }       from '../../../types/common';
import type { MatchFilters } from '../../../types/domain/match';

export function useHomeFeed() {
  return useQuery({
    queryKey: ['home-feed'],
    queryFn:  () => matchService.getHomeFeed(),
    staleTime: 60000,
  });
}

export function useRunsFeed() {
  const activeFilters = useUIStore((s) => s.activeFilters);
  return useQuery({
    queryKey: ['runs-feed', activeFilters],
    queryFn:  () => matchService.getFilteredMatches(activeFilters),
    staleTime: 30000,
  });
}

export function useJoinMatch() {
  const qc        = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  return useMutation({
    mutationFn: (matchId: ID) => matchService.joinMatch(matchId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['home-feed'] });
      qc.invalidateQueries({ queryKey: ['runs-feed'] });
      showToast(t('toast.join_match_success'), 'success');
    },
    onError: () => showToast(t('toast.join_match_error'), 'error'),
  });
}

export function useLeaveMatch() {
  const qc        = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  return useMutation({
    mutationFn: (matchId: ID) => matchService.leaveMatch(matchId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['home-feed'] });
      qc.invalidateQueries({ queryKey: ['runs-feed'] });
    },
    onError: () => showToast(t('toast.leave_match_error'), 'error'),
  });
}

export function useCreateMatch() {
  const qc        = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => matchService.createMatch(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['home-feed'] });
      qc.invalidateQueries({ queryKey: ['runs-feed'] });
    },
    onError: () => showToast(t('toast.create_match_error'), 'error'),
  });
}

export function useReportScore() {
  const qc        = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  return useMutation({
    mutationFn: (payload: { matchId: ID; outcome: unknown }) =>
      matchService.reportScore(payload.matchId, payload.outcome),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      showToast(t('toast.report_score_success'), 'success');
    },
    onError: () => showToast(t('toast.report_score_error'), 'error'),
  });
}
