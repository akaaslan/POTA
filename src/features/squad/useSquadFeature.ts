import { useCallback } from 'react';
import { useTeamFeed } from '@domains/squad';
import { useUIStore }  from '@state/ui.store';
import { t }           from '../../i18n';
import type { Team } from '../../types/domain/squad';
import type { Profile } from '../../types/domain/profile';

export function useSquadFeature() {
  const result    = useTeamFeed();
  const openSheet = useUIStore((s) => s.openSheet);
  const showToast = useUIStore((s) => s.showToast);

  const onOpenTeam = useCallback((team: Team) => openSheet('team-detail', team), [openSheet]);

  const onBrowseTeams = useCallback(() => {
    const teams = result.data?.teams;
    if (teams && teams.length > 0) openSheet('team-detail', teams[0]);
  }, [openSheet, result.data]);

  const onOpenChat = useCallback(() => {
    openSheet('chat', { team: result.data?.featuredTeam ?? null });
  }, [openSheet, result.data]);

  const onOpenPlayer    = useCallback((player: Profile) => openSheet('player-profile', player), [openSheet]);
  const onManageLineup  = useCallback(() => showToast(t('squad.lineup_coming_soon'), 'info'), [showToast]);

  return {
    data:       result.data ?? null,
    refreshing: result.isRefetching,
    onRefresh:  result.refetch,
    isError:    result.isError,
    onRetry:    result.refetch,
    onOpenTeam,
    onBrowseTeams,
    onOpenChat,
    onOpenPlayer,
    onManageLineup,
  };
}
