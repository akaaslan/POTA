import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../services';
import { useUIStore } from '../store/ui';
import { t } from '../i18n';

export function useTeamFeed() {
  return useQuery({
    queryKey: ['team-feed'],
    queryFn: function() { return teamService.getFeaturedTeams(); },
    staleTime: 60000,
  });
}

export function useJoinTeam() {
  var qc = useQueryClient();
  var showToast = useUIStore(function(s) { return s.showToast; });
  return useMutation({
    mutationFn: function(teamId) { return teamService.joinTeam(teamId); },
    onSuccess: function() {
      qc.invalidateQueries({ queryKey: ['team-feed'] });
      showToast(t('toast.join_team_success'), 'success');
    },
    onError: function() {
      showToast(t('toast.join_team_error'), 'error');
    },
  });
}

export function useLeaveTeam() {
  var qc = useQueryClient();
  var showToast = useUIStore(function(s) { return s.showToast; });
  return useMutation({
    mutationFn: function(teamId) { return teamService.leaveTeam(teamId); },
    onSuccess: function() {
      qc.invalidateQueries({ queryKey: ['team-feed'] });
    },
    onError: function() {
      showToast(t('toast.leave_team_error'), 'error');
    },
  });
}
