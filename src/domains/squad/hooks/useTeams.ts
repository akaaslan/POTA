import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { squadService } from '../services';
import { useUIStore }   from '@state/ui.store';
import { t }            from '../../../i18n';
import type { ID }      from '../../../types/common';

export function useTeamFeed() {
  return useQuery({
    queryKey:  ['team-feed'],
    queryFn:   () => squadService.getFeaturedTeams(),
    staleTime: 60000,
  });
}

export function useJoinTeam() {
  const qc        = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  return useMutation({
    mutationFn: (teamId: ID) => squadService.joinTeam(teamId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-feed'] });
      showToast(t('toast.join_team_success'), 'success');
    },
    onError: () => showToast(t('toast.join_team_error'), 'error'),
  });
}

export function useLeaveTeam() {
  const qc        = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  return useMutation({
    mutationFn: (teamId: ID) => squadService.leaveTeam(teamId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team-feed'] }),
    onError:   () => showToast(t('toast.leave_team_error'), 'error'),
  });
}
