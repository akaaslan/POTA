import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import {
  authService,
  matchService,
  teamService,
  profileService,
  notificationService,
} from './src/services/index';
import { C, S } from './src/theme';

import Header from './src/components/Header';
import BottomTabs from './src/components/BottomTabs';

import HomeScreen from './src/screens/HomeScreen';
import RunsScreen from './src/screens/RunsScreen';
import SquadScreen from './src/screens/SquadScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

import MatchDetailSheet from './src/screens/MatchDetailSheet';
import ChatSheet from './src/screens/ChatSheet';
import TeamDetailSheet from './src/screens/TeamDetailSheet';
import NotificationsSheet from './src/screens/NotificationsSheet';
import CreateRunSheet from './src/screens/CreateRunSheet';
import FilterSheet from './src/screens/FilterSheet';

export default function App() {
  // ── Boot ──────────────────────────────────────────────────────────────────
  var [bootState, setBootState] = useState('loading'); // 'loading' | 'guest' | 'ready'
  var [submitting, setSubmitting] = useState(false);

  // ── Navigation ────────────────────────────────────────────────────────────
  var [activeTab, setActiveTab] = useState('home');

  // ── Data ──────────────────────────────────────────────────────────────────
  var [session, setSession] = useState(null);
  var [draft, setDraft] = useState(null);
  var [homeFeed, setHomeFeed] = useState(null);
  var [runsFeed, setRunsFeed] = useState(null);
  var [teamFeed, setTeamFeed] = useState(null);
  var [profileFeed, setProfileFeed] = useState(null);
  var [notifications, setNotifications] = useState([]);

  // ── Sheet state ───────────────────────────────────────────────────────────
  var [selectedMatch, setSelectedMatch] = useState(null);
  var [selectedTeam, setSelectedTeam] = useState(null);
  var [chatOpen, setChatOpen] = useState(false);
  var [createRunOpen, setCreateRunOpen] = useState(false);
  var [notifOpen, setNotifOpen] = useState(false);
  var [filterOpen, setFilterOpen] = useState(false);
  var [filterKey, setFilterKey] = useState(null); // 'district'|'skill'|'format'
  var [historyExpanded, setHistoryExpanded] = useState(false);
  var [joiningMatch, setJoiningMatch] = useState(false);
  var [joiningTeam, setJoiningTeam] = useState(false);

  // ── Filter state ──────────────────────────────────────────────────────────
  var [activeFilters, setActiveFilters] = useState({
    district: 'Tümü',
    skill: 'Tümü',
    format: 'Tümü',
  });

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(function() {
    bootstrap();
  }, []);

  async function bootstrap() {
    try {
      var sess = await authService.getSession();
      if (sess) {
        setSession(sess);
        await loadAllData(sess);
        setBootState('ready');
      } else {
        var d = profileService.createDefaultProfileDraft();
        setDraft(d);
        setBootState('guest');
      }
    } catch (e) {
      console.warn('Bootstrap error:', e);
      var d = profileService.createDefaultProfileDraft();
      setDraft(d);
      setBootState('guest');
    }
  }

  async function loadAllData(sess) {
    var results = await Promise.all([
      matchService.getHomeFeed(),
      matchService.getNearbyMatches(),
      teamService.getFeaturedTeams(),
      profileService.getProfileOverview(sess ? sess.profile : null),
      notificationService.getNotifications(),
    ]);
    setHomeFeed(results[0]);
    setRunsFeed(results[1]);
    setTeamFeed(results[2]);
    setProfileFeed(results[3]);
    setNotifications(results[4]);
  }

  async function handleOnboardingSubmit() {
    if (!draft || !draft.nickname || !draft.district) {
      Alert.alert('Eksik Bilgi', 'Takma adın ve bölgen zorunludur.');
      return;
    }
    setSubmitting(true);
    try {
      var sess = await authService.signInMock(draft);
      setSession(sess);
      await loadAllData(sess);
      setBootState('ready');
    } catch (e) {
      Alert.alert('Hata', 'Giriş yapılamadı. Tekrar dene.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Match handlers ────────────────────────────────────────────────────────
  function handleOpenMatch(match) {
    setSelectedMatch(match);
  }

  function handleCloseMatch() {
    setSelectedMatch(null);
  }

  async function handleJoinMatch(match) {
    setJoiningMatch(true);
    try {
      await matchService.joinMatch(match.id);
      var updated = await matchService.getHomeFeed();
      setHomeFeed(updated);
      var updatedRuns = await matchService.getFilteredMatches(activeFilters);
      setRunsFeed(updatedRuns);
      setSelectedMatch(function(prev) {
        if (!prev || prev.id !== match.id) return prev;
        return Object.assign({}, prev, { playersJoined: prev.playersJoined + 1 });
      });
    } catch (e) {
      Alert.alert('Hata', 'Maca katilamadiniz.');
    } finally {
      setJoiningMatch(false);
    }
  }

  async function handleLeaveMatch(match) {
    setJoiningMatch(true);
    try {
      await matchService.leaveMatch(match.id);
      var updated = await matchService.getHomeFeed();
      setHomeFeed(updated);
      var updatedRuns = await matchService.getFilteredMatches(activeFilters);
      setRunsFeed(updatedRuns);
      setSelectedMatch(null);
    } catch (e) {
      Alert.alert('Hata', 'Mactan cikilamadiniz.');
    } finally {
      setJoiningMatch(false);
    }
  }

  // ── Filter handlers ───────────────────────────────────────────────────────
  function handleOpenFilter(key) {
    setFilterKey(key || null);
    setFilterOpen(true);
  }

  async function handleApplyFilters(newFilters) {
    setActiveFilters(newFilters);
    setFilterOpen(false);
    try {
      var filtered = await matchService.getFilteredMatches(newFilters);
      setRunsFeed(filtered);
    } catch (e) {
      console.warn('Filter error:', e);
    }
  }

  // ── Team handlers ─────────────────────────────────────────────────────────
  function handleOpenTeam(team) {
    setSelectedTeam(team);
  }

  function handleCloseTeam() {
    setSelectedTeam(null);
  }

  async function handleJoinTeam(team) {
    setJoiningTeam(true);
    try {
      await teamService.joinTeam(team.id);
      var updated = await teamService.getFeaturedTeams();
      setTeamFeed(updated);
      setSelectedTeam(function(prev) {
        if (!prev || prev.id !== team.id) return prev;
        return Object.assign({}, prev, {
          rosterSize: prev.rosterSize + 1,
          chemistry: Math.min(99, prev.chemistry + 1),
        });
      });
    } catch (e) {
      Alert.alert('Hata', 'Takima katililamadiniz.');
    } finally {
      setJoiningTeam(false);
    }
  }

  // ── Create run handler ────────────────────────────────────────────────────
  async function handleCreateMatch(data) {
    var newMatch = await matchService.createMatch(data);
    var updatedRuns = await matchService.getFilteredMatches(activeFilters);
    setRunsFeed(updatedRuns);
    var updatedHome = await matchService.getHomeFeed();
    setHomeFeed(updatedHome);
    return newMatch;
  }

  // ── Notifications handlers ────────────────────────────────────────────────
  async function handleMarkAllRead() {
    var updated = await notificationService.markAllRead();
    setNotifications(updated);
  }

  // ── Manage lineup handler ─────────────────────────────────────────────────
  function handleManageLineup() {
    Alert.alert('Kadro Düzenle', 'Bu özellik yakında geliyor.', [{ text: 'Tamam' }]);
  }

  // ── Activity expand handler ───────────────────────────────────────────────
  function handleOpenActivity() {
    Alert.alert(
      'Ekip Aktivitesi',
      'Tüm aktivite akışı yakında eklenecek.',
      [{ text: 'Tamam' }]
    );
  }

  // ── Pro upgrade handler ───────────────────────────────────────────────────
  function handleUpgradePro() {
    Alert.alert(
      'PRO OL',
      'Gelişmiş istatistikler, öncelikli saha erişimi ve daha fazlası için PRO aboneliğe geç.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: "YÜKSELT →", onPress: function() { setActiveTab('pro'); } },
      ]
    );
  }

  // ── Badge press handler ───────────────────────────────────────────────────
  function handleOpenBadge(badge) {
    Alert.alert(
      badge.icon + ' ' + badge.label,
      badge.active
        ? 'Bu rozet aktif. Sahada kazandın, maçlarda kanıtladın.'
        : 'Bu rozeti kazanmak için daha fazla maça katıl.',
      [{ text: 'Tamam' }]
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  var unreadCount = notifications.filter(function(n) { return !n.read; }).length;

  function renderScreen() {
    if (activeTab === 'home') {
      return (
        <HomeScreen
          data={homeFeed}
          onOpenMatch={handleOpenMatch}
          onOpenActivity={handleOpenActivity}
          onCreateRun={function() { setCreateRunOpen(true); }}
          onUpgradePro={handleUpgradePro}
        />
      );
    }
    if (activeTab === 'runs') {
      return (
        <RunsScreen
          data={runsFeed}
          activeFilters={activeFilters}
          onOpenMatch={handleOpenMatch}
          onCreateRun={function() { setCreateRunOpen(true); }}
          onOpenFilter={handleOpenFilter}
        />
      );
    }
    if (activeTab === 'squad') {
      return (
        <SquadScreen
          data={teamFeed}
          onOpenTeam={handleOpenTeam}
          onOpenChat={function() { setChatOpen(true); }}
          onManageLineup={handleManageLineup}
        />
      );
    }
    if (activeTab === 'pro') {
      return (
        <ProfileScreen
          data={profileFeed}
          historyExpanded={historyExpanded}
          onToggleHistory={function() { setHistoryExpanded(function(v) { return !v; }); }}
          onOpenBadge={handleOpenBadge}
          onUpgradePro={handleUpgradePro}
        />
      );
    }
    return null;
  }

  // ── Loading screen ────────────────────────────────────────────────────────
  if (bootState === 'loading') {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={a.splash}>
          <Text style={a.splashLogo}>POTA</Text>
          <Text style={a.splashSub}>STREET STATS</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // ── Onboarding ────────────────────────────────────────────────────────────
  if (bootState === 'guest') {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SafeAreaView style={a.root} edges={['top', 'bottom']}>
          <OnboardingScreen
            draft={draft || {}}
            onChange={setDraft}
            onSubmit={handleOnboardingSubmit}
            submitting={submitting}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // ── Main app ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={a.root} edges={['top']}>
        <Header
          onNotifications={function() { setNotifOpen(true); }}
          unreadCount={unreadCount}
          onLogoPress={function() { setActiveTab('home'); }}
        />
        <View style={a.content}>
          {renderScreen()}
        </View>
        <SafeAreaView edges={['bottom']} style={a.bottomSafe}>
          <BottomTabs active={activeTab} onSelect={setActiveTab} />
        </SafeAreaView>
      </SafeAreaView>

      {/* Sheets */}
      <MatchDetailSheet
        match={selectedMatch}
        isJoined={selectedMatch ? matchService.isJoined(selectedMatch.id) : false}
        joining={joiningMatch}
        onClose={handleCloseMatch}
        onJoin={handleJoinMatch}
        onLeave={handleLeaveMatch}
      />

      <TeamDetailSheet
        team={selectedTeam}
        isJoined={selectedTeam ? teamService.isJoined(selectedTeam.id) : false}
        joining={joiningTeam}
        onClose={handleCloseTeam}
        onJoin={handleJoinTeam}
        onOpenChat={function() { setSelectedTeam(null); setChatOpen(true); }}
      />

      <ChatSheet
        open={chatOpen}
        team={teamFeed ? teamFeed.featuredTeam : null}
        onClose={function() { setChatOpen(false); }}
        onSendMessage={function() {}}
      />

      <CreateRunSheet
        open={createRunOpen}
        onClose={function() { setCreateRunOpen(false); }}
        onCreate={handleCreateMatch}
      />

      <NotificationsSheet
        open={notifOpen}
        notifications={notifications}
        onClose={function() { setNotifOpen(false); }}
        onMarkAllRead={handleMarkAllRead}
      />

      <FilterSheet
        open={filterOpen}
        activeFilters={activeFilters}
        onApply={handleApplyFilters}
        onClose={function() { setFilterOpen(false); }}
      />
    </SafeAreaProvider>
  );
}

const a = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  splash: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  splashLogo: { color: C.lime, fontSize: 48, fontWeight: '900', letterSpacing: 6 },
  splashSub: { color: C.textDim, fontSize: 12, fontWeight: '700', letterSpacing: 3, marginTop: 4 },
  content: { flex: 1 },
  bottomSafe: { backgroundColor: C.bgPanel },
});
