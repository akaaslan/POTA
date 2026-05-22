import React, { useEffect } from 'react';
import { useUIStore } from '../store/ui';
import { useJoinMatch, useLeaveMatch, useCreateMatch, useReportScore } from '../hooks/useMatches';
import { useJoinTeam, useLeaveTeam, useTeamFeed } from '../hooks/useTeams';
import { useNotifications, useMarkAllRead } from '../hooks/useNotifications';
import { useAuthStore } from '../store/auth';
import { matchService, teamService, profileService } from '../services';
import { useQueryClient } from '@tanstack/react-query';
import MatchDetailSheet from '../screens/MatchDetailSheet';
import TeamDetailSheet from '../screens/TeamDetailSheet';
import ChatSheet from '../screens/ChatSheet';
import NotificationsSheet from '../screens/NotificationsSheet';
import ProfileEditSheet from '../screens/ProfileEditSheet';
import PlayerProfileSheet from '../screens/PlayerProfileSheet';
import ActivitySheet from '../screens/ActivitySheet';
import ProUpgradeSheet from '../screens/ProUpgradeSheet';
import LeaderboardSheet from '../screens/LeaderboardSheet';
import Toast from './Toast';
import { t } from '../i18n';

export default function GlobalSheets() {
  var activeSheet  = useUIStore(function(s) { return s.activeSheet; });
  var sheetPayload = useUIStore(function(s) { return s.sheetPayload; });
  var closeSheet   = useUIStore(function(s) { return s.closeSheet; });
  var openSheet    = useUIStore(function(s) { return s.openSheet; });
  var showToast    = useUIStore(function(s) { return s.showToast; });
  var session      = useAuthStore(function(s) { return s.session; });
  var setSession   = useAuthStore(function(s) { return s.setSession; });
  var qc           = useQueryClient();

  var joinMatch  = useJoinMatch();
  var leaveMatch = useLeaveMatch();
  var createMatch = useCreateMatch();
  var reportScore = useReportScore();
  var joinTeam   = useJoinTeam();
  var leaveTeam  = useLeaveTeam();
  var teamFeed   = useTeamFeed();
  var notifResult = useNotifications();
  var markAllRead = useMarkAllRead();

  var activeMatch  = activeSheet === 'match-detail' ? sheetPayload : null;
  var activeTeam   = activeSheet === 'team-detail'  ? sheetPayload : null;
  var activePlayer = activeSheet === 'player-profile' ? sheetPayload : null;
  var chatTeam     = activeSheet === 'chat'
    ? (sheetPayload && sheetPayload.team ? sheetPayload.team : (teamFeed.data ? teamFeed.data.featuredTeam : null))
    : null;

  var editProfile = session ? session.profile : null;

  // Auto-mark notifications as read 2 s after the sheet opens
  useEffect(function() {
    if (activeSheet !== 'notifications') return;
    var hasUnread = (notifResult.data || []).some(function(n) { return !n.read; });
    if (!hasUnread) return;
    var timer = setTimeout(function() { markAllRead.mutate(); }, 2000);
    return function() { clearTimeout(timer); };
  }, [activeSheet]);

  function handleReportScore(match, scores) {
    var outcome = scores ? (scores.scoreA >= scores.scoreB ? 'win' : 'loss') : null;
    if (outcome) {
      reportScore.mutate({ matchId: match.id, outcome: outcome, scoreA: scores.scoreA, scoreB: scores.scoreB });
      closeSheet();
      return;
    }
    showToast(t('matchDetail.report_alert_msg'), 'info');
    closeSheet();
  }

  async function handleSaveProfile(updates) {
    var result = await profileService.updateProfile(updates);
    if (session) {
      setSession(Object.assign({}, session, { profile: Object.assign({}, session.profile, updates) }));
    }
    qc.invalidateQueries({ queryKey: ['profile'] });
  }

  return (
    <>
      <MatchDetailSheet
        match={activeMatch}
        isJoined={activeMatch ? matchService.isJoined(activeMatch.id) : false}
        joining={joinMatch.isPending || leaveMatch.isPending}
        onClose={closeSheet}
        onJoin={function(match) { joinMatch.mutate(match.id); }}
        onLeave={function(match) { leaveMatch.mutate(match.id); closeSheet(); }}
        onReportScore={handleReportScore}
      />
      <TeamDetailSheet
        team={activeTeam}
        isJoined={activeTeam ? teamService.isJoined(activeTeam.id) : false}
        joining={joinTeam.isPending || leaveTeam.isPending}
        onClose={closeSheet}
        onJoin={function(team) { joinTeam.mutate(team.id); }}
        onLeave={function(team) { leaveTeam.mutate(team.id); closeSheet(); }}
        onOpenChat={function() { openSheet('chat', { team: activeTeam }); }}
        onOpenPlayer={function(player) { openSheet('player-profile', player); }}
      />
      <ChatSheet
        open={activeSheet === 'chat'}
        team={chatTeam}
        onClose={closeSheet}
        onSendMessage={function() {}}
      />

      <NotificationsSheet
        open={activeSheet === 'notifications'}
        notifications={notifResult.data || []}
        onClose={closeSheet}
        onMarkAllRead={function() { markAllRead.mutate(); }}
        onNotifPress={function(notif) { closeSheet(); }}
      />
      <ProfileEditSheet
        open={activeSheet === 'profile-edit'}
        profile={editProfile}
        onClose={closeSheet}
        onSave={handleSaveProfile}
      />
      <PlayerProfileSheet
        player={activePlayer}
        onClose={closeSheet}
      />
      <ActivitySheet open={activeSheet === 'activity'} onClose={closeSheet} onItemPress={function() { closeSheet(); }} />
      <ProUpgradeSheet
        open={activeSheet === 'pro-upgrade'}
        onClose={closeSheet}
        onUpgrade={function(plan) {
          closeSheet();
          showToast(plan === 'yearly' ? t('proUpgrade.purchase_msg_yearly') : t('proUpgrade.purchase_msg_monthly'), 'success');
        }}
      />
      <LeaderboardSheet
        open={activeSheet === 'leaderboard'}
        onClose={closeSheet}
        myNickname={session && session.profile ? session.profile.nickname : null}
      />
      <Toast />
    </>
  );
}
