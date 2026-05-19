import React from 'react';
import { Alert } from 'react-native';
import { useUIStore } from '../store/ui';
import { useJoinMatch, useLeaveMatch, useCreateMatch } from '../hooks/useMatches';
import { useJoinTeam, useTeamFeed } from '../hooks/useTeams';
import { useNotifications, useMarkAllRead } from '../hooks/useNotifications';
import { matchService, teamService } from '../services';
import MatchDetailSheet from '../screens/MatchDetailSheet';
import TeamDetailSheet from '../screens/TeamDetailSheet';
import ChatSheet from '../screens/ChatSheet';
import CreateRunSheet from '../screens/CreateRunSheet';
import FilterSheet from '../screens/FilterSheet';
import NotificationsSheet from '../screens/NotificationsSheet';

export default function GlobalSheets() {
  var activeSheet = useUIStore(function(s) { return s.activeSheet; });
  var sheetPayload = useUIStore(function(s) { return s.sheetPayload; });
  var closeSheet = useUIStore(function(s) { return s.closeSheet; });
  var activeFilters = useUIStore(function(s) { return s.activeFilters; });
  var setFilters = useUIStore(function(s) { return s.setFilters; });
  var openSheet = useUIStore(function(s) { return s.openSheet; });

  var joinMatch = useJoinMatch();
  var leaveMatch = useLeaveMatch();
  var createMatch = useCreateMatch();
  var joinTeam = useJoinTeam();
  var teamFeed = useTeamFeed();
  var notifResult = useNotifications();
  var markAllRead = useMarkAllRead();

  var activeMatch = activeSheet === 'match-detail' ? sheetPayload : null;
  var activeTeam = activeSheet === 'team-detail' ? sheetPayload : null;
  var chatTeam = activeSheet === 'chat'
    ? (sheetPayload && sheetPayload.team ? sheetPayload.team : (teamFeed.data ? teamFeed.data.featuredTeam : null))
    : null;

  return (
    <>
      <MatchDetailSheet
        match={activeMatch}
        isJoined={activeMatch ? matchService.isJoined(activeMatch.id) : false}
        joining={joinMatch.isPending || leaveMatch.isPending}
        onClose={closeSheet}
        onJoin={function(match) { joinMatch.mutate(match.id); }}
        onLeave={function(match) { leaveMatch.mutate(match.id); closeSheet(); }}
      />
      <TeamDetailSheet
        team={activeTeam}
        isJoined={activeTeam ? teamService.isJoined(activeTeam.id) : false}
        joining={joinTeam.isPending}
        onClose={closeSheet}
        onJoin={function(team) { joinTeam.mutate(team.id); }}
        onOpenChat={function() { openSheet('chat', { team: activeTeam }); }}
      />
      <ChatSheet
        open={activeSheet === 'chat'}
        team={chatTeam}
        onClose={closeSheet}
        onSendMessage={function() {}}
      />
      <CreateRunSheet
        open={activeSheet === 'create-run'}
        onClose={closeSheet}
        onCreate={function(data) { createMatch.mutate(data); closeSheet(); }}
      />
      <FilterSheet
        open={activeSheet === 'filter'}
        activeFilters={activeFilters}
        onApply={function(filters) { setFilters(filters); closeSheet(); }}
        onClose={closeSheet}
      />
      <NotificationsSheet
        open={activeSheet === 'notifications'}
        notifications={notifResult.data || []}
        onClose={closeSheet}
        onMarkAllRead={function() { markAllRead.mutate(); }}
      />
    </>
  );
}
