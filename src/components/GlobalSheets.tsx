import React, { useEffect, useCallback, useRef } from 'react';
import { useUIStore } from '../store/ui';
import { useJoinMatch, useLeaveMatch, useCreateMatch, useReportScore } from '../hooks/useMatches';
import { useJoinTeam, useLeaveTeam, useTeamFeed } from '../hooks/useTeams';
import { useNotifications, useMarkAllRead } from '../hooks/useNotifications';
import { useAuthStore } from '../store/auth';
import { matchService, teamService, profileService } from '../services';
import { useQueryClient } from '@tanstack/react-query';
import type { Match } from '../types/domain/match';
import type { Team } from '../types/domain/squad';
import type { Badge, Profile } from '../types/domain/profile';
import type { Notification } from '../types/domain/notification';
import MatchDetailSheet, { type MatchScorePayload } from '../screens/MatchDetailSheet';
import { pushService } from '@domains/notifications/push';
import TeamDetailSheet from '../screens/TeamDetailSheet';
import ChatSheet from '../screens/ChatSheet';
import NotificationsSheet from '../screens/NotificationsSheet';
import ProfileEditSheet from '../screens/ProfileEditSheet';
import PlayerProfileSheet from '../screens/PlayerProfileSheet';
import ActivitySheet from '../screens/ActivitySheet';
import ProUpgradeSheet from '../screens/ProUpgradeSheet';
import LeaderboardSheet from '../screens/LeaderboardSheet';
import BadgeDetailSheet from '../screens/BadgeDetailSheet';
import BookingSheet from '../screens/BookingSheet';
import Toast from './Toast';
import { t } from '../i18n';
import { MOCK_MATCHES, MOCK_TEAMS } from '../data/mockData';

export default function GlobalSheets() {
  const activeSheet  = useUIStore((s) => s.activeSheet);
  const sheetPayload = useUIStore((s) => s.sheetPayload);
  const closeSheet   = useUIStore((s) => s.closeSheet);
  const openSheet    = useUIStore((s) => s.openSheet);
  const showToast    = useUIStore((s) => s.showToast);
  const session      = useAuthStore((s) => s.session);
  const setSession   = useAuthStore((s) => s.setSession);
  const qc           = useQueryClient();

  const joinMatch        = useJoinMatch();
  const leaveMatch       = useLeaveMatch();
  const reportScore      = useReportScore();
  const joinTeam         = useJoinTeam();
  const leaveTeam        = useLeaveTeam();
  const joinMatchPending = useRef(false);
  const joinTeamPending  = useRef(false);
  const teamFeed    = useTeamFeed();
  const notifResult = useNotifications();
  const markAllRead = useMarkAllRead();

  // Extract typed payloads with explicit casts (runtime shape matches type)
  const activeMatch   = activeSheet === 'match-detail'   ? (sheetPayload as Match | null) : null;
  const activeTeam    = activeSheet === 'team-detail'    ? (sheetPayload as Team | null)  : null;
  const activePlayer  = activeSheet === 'player-profile' ? (sheetPayload as Profile | null) : null;
  const activeBadge   = activeSheet === 'badge-detail'   ? (sheetPayload as Badge | null) : null;
  const activeBooking = activeSheet === 'booking'        ? (sheetPayload as { courtId: string; courtName: string } | null) : null;
  const chatPayload   = activeSheet === 'chat' ? (sheetPayload as { team?: Team | null } | null) : null;
  const chatTeam      = chatPayload?.team ?? (teamFeed.data ? teamFeed.data.featuredTeam : null) ?? null;
  const editProfile  = session ? session.profile : null;

  // Auto-mark notifications as read 2 s after the sheet opens
  useEffect(function() {
    if (activeSheet !== 'notifications') return;
    const notifs = notifResult.data ?? [];
    const hasUnread = notifs.some((n: Notification) => !n.read);
    if (!hasUnread) return;
    const timer = setTimeout(function() { markAllRead.mutate(); }, 2000);
    return function() { clearTimeout(timer); };
  }, [activeSheet, notifResult.data, markAllRead]);

  const handleReportScore = useCallback(function(match: Match, scores: MatchScorePayload | null) {
    if (!scores) { showToast(t('matchDetail.report_alert_msg'), 'info'); closeSheet(); return; }
    const outcome: 'win' | 'loss' | 'draw' =
      scores.scoreA > scores.scoreB ? 'win' :
      scores.scoreA < scores.scoreB ? 'loss' : 'draw';
    reportScore.mutate({
      matchId:     match.id,
      outcome,
      scores:      { scoreA: scores.scoreA, scoreB: scores.scoreB },
      playerStats: { points: scores.points, rebounds: scores.rebounds, assists: scores.assists },
    });
    closeSheet();
  }, [reportScore, closeSheet, showToast]);

  const handleSaveProfile = useCallback(async function(updates: Partial<Profile>) {
    try {
      await profileService.updateProfile(updates);
      if (session) {
        setSession({ ...session, profile: session.profile ? { ...session.profile, ...updates } : null });
      }
      qc.invalidateQueries({ queryKey: ['profile'] });
      showToast(t('toast.save_profile_success'), 'success');
    } catch {
      showToast(t('toast.save_profile_error'), 'error');
    }
  }, [session, setSession, qc, showToast]);

  const onJoinMatch  = useCallback(function(match: Match) {
    if (joinMatchPending.current) return;
    joinMatchPending.current = true;
    joinMatch.mutate(match.id, {
      onSuccess: () => {
        // Maç zamanı ISO string'den Date'e çevrilip hatırlatıcı planlanır
        try {
          const matchDate = new Date(match.dateTime);
          if (!isNaN(matchDate.getTime())) {
            pushService.scheduleMatchReminder(match.title, matchDate).catch(() => {});
          }
        } catch {}
      },
      onSettled: () => { joinMatchPending.current = false; },
    });
  }, [joinMatch]);
  const onLeaveMatch = useCallback(function(match: Match) { leaveMatch.mutate(match.id); closeSheet(); }, [leaveMatch, closeSheet]);
  const onJoinTeam   = useCallback(function(team: Team) {
    if (joinTeamPending.current) return;
    joinTeamPending.current = true;
    joinTeam.mutate(team.id, { onSettled: () => { joinTeamPending.current = false; } });
  }, [joinTeam]);
  const onLeaveTeam  = useCallback(function(team: Team)   { leaveTeam.mutate(team.id); closeSheet(); }, [leaveTeam, closeSheet]);
  const onOpenChat   = useCallback(function() { openSheet('chat', { team: activeTeam }); }, [openSheet, activeTeam]);
  const onOpenPlayer = useCallback(function(player: Profile) { openSheet('player-profile', player as unknown); }, [openSheet]);
  const onMarkAllReadPress = useCallback(function() { markAllRead.mutate(); }, [markAllRead]);

  const onNotifPress = useCallback(function(notif: Notification & { relatedId?: string }) {
    closeSheet();
    if (notif.type === 'match_invite' && notif.targetId) {
      const match = (MOCK_MATCHES as unknown as Match[]).find((m) => m.id === notif.targetId);
      if (match) { setTimeout(function() { openSheet('match-detail', match); }, 300); }
    } else if (notif.type === 'team_invite' && notif.targetId) {
      const team = (MOCK_TEAMS as unknown as Team[]).find((tm) => tm.id === notif.targetId);
      if (team) { setTimeout(function() { openSheet('team-detail', team); }, 300); }
    }
  }, [closeSheet, openSheet]);

  const onActivityItemPress = useCallback(function(item: { type: string; actor?: string; district?: string }) {
    closeSheet();
    if (item.type === 'badge') {
      setTimeout(function() {
        openSheet('player-profile', { nickname: item.actor, district: item.district, tier: 'GOLD', ovr: 78, avatar: null });
      }, 300);
    } else {
      const match = (MOCK_MATCHES as unknown as Match[]).find((m) => m.district === item.district);
      if (match) { setTimeout(function() { openSheet('match-detail', match); }, 300); }
    }
  }, [closeSheet, openSheet]);

  const onProUpgrade = useCallback(function(plan: string) {
    closeSheet();
    showToast(plan === 'yearly' ? t('proUpgrade.purchase_msg_yearly') : t('proUpgrade.purchase_msg_monthly'), 'success');
  }, [closeSheet, showToast]);

  return (
    <>
      <MatchDetailSheet
        match={activeMatch}
        isJoined={activeMatch ? matchService.isJoined(activeMatch.id) : false}
        joining={joinMatch.isPending || leaveMatch.isPending}
        onClose={closeSheet}
        onJoin={onJoinMatch}
        onLeave={onLeaveMatch}
        onReportScore={handleReportScore}
      />
      <TeamDetailSheet
        team={activeTeam}
        isJoined={activeTeam ? teamService.isJoined(activeTeam.id) : false}
        joining={joinTeam.isPending || leaveTeam.isPending}
        onClose={closeSheet}
        onJoin={onJoinTeam}
        onLeave={onLeaveTeam}
        onOpenChat={onOpenChat}
        onOpenPlayer={onOpenPlayer}
      />
      <ChatSheet
        open={activeSheet === 'chat'}
        team={chatTeam}
        onClose={closeSheet}
        onSendMessage={function() {}}
      />
      <NotificationsSheet
        open={activeSheet === 'notifications'}
        notifications={notifResult.data ?? []}
        onClose={closeSheet}
        onMarkAllRead={onMarkAllReadPress}
        onNotifPress={onNotifPress}
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
      <BadgeDetailSheet
        badge={activeBadge}
        onClose={closeSheet}
      />
      <ActivitySheet
        open={activeSheet === 'activity'}
        onClose={closeSheet}
        onItemPress={onActivityItemPress}
      />
      <ProUpgradeSheet
        open={activeSheet === 'pro-upgrade'}
        onClose={closeSheet}
        onUpgrade={onProUpgrade}
      />
      <LeaderboardSheet
        open={activeSheet === 'leaderboard'}
        onClose={closeSheet}
        myNickname={session?.profile?.nickname ?? null}
      />
      <BookingSheet
        courtId={activeBooking?.courtId ?? null}
        courtName={activeBooking?.courtName ?? ''}
        onClose={closeSheet}
      />
      <Toast />
    </>
  );
}
