import React from 'react';
import { useTeamFeed } from '../../src/hooks/useTeams';
import { useUIStore } from '../../src/store/ui';
import SquadScreen from '../../src/screens/SquadScreen';
import { t } from '../../src/i18n';

export default function SquadTab() {
  var result = useTeamFeed();
  var openSheet = useUIStore(function(s) { return s.openSheet; });
  var showToast = useUIStore(function(s) { return s.showToast; });

  return (
    <SquadScreen
      data={result.data || null}
      refreshing={result.isRefetching}
      onRefresh={result.refetch}
      isError={result.isError}
      onRetry={result.refetch}
      onOpenTeam={function(team) { openSheet('team-detail', team); }}
      onBrowseTeams={function() {
        var teams = result.data && result.data.teams;
        if (teams && teams.length > 0) { openSheet('team-detail', teams[0]); }
      }}
      onOpenChat={function() {
        var featuredTeam = result.data && result.data.featuredTeam;
        openSheet('chat', { team: featuredTeam });
      }}
      onOpenPlayer={function(player) { openSheet('player-profile', player); }}
      onManageLineup={function() {
        showToast(t('squad.lineup_coming_soon'), 'info');
      }}
    />
  );
}
