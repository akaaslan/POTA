import React, { useState, useMemo, useCallback, memo } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { C, F, R, S } from '../theme';
import { t } from '../i18n';
import { useLeaderboard, useSeasons } from '@domains/leaderboard';
import { RANK_TIER_COLOR as TIER_COLOR } from '@shared/constants/tier';
import type { LeaderEntry } from '../types/domain/leaderboard';

const { height: SCREEN_H } = Dimensions.get('window');

var TABS = [t('leaderboard.tab_ovr'), t('leaderboard.tab_wins'), t('leaderboard.tab_winpct')];

var TAB_OVR = t('leaderboard.tab_ovr');
var TAB_WINS = t('leaderboard.tab_wins');

type RankedEntry = LeaderEntry & { rank: number; isMe: boolean };
const RANK_COLORS: Record<number, string> = { 1: '#FFD700', 2: '#A8A9AD', 3: '#CD7F32' };
const PODIUM_SIZES: Record<number, number> = { 1: 56, 2: 48, 3: 44 };

function PodiumRow({ item }: { item: RankedEntry | undefined }) {
  if (!item) return null;
  var rankColor = RANK_COLORS[item.rank] ?? C.textDim;
  var tierColor = TIER_COLOR[item.tier] ?? C.textDim;
  var podSize   = PODIUM_SIZES[item.rank] ?? 0;
  return (
    <View style={[lb.podiumItem, { width: podSize + 44 }]}>
      <View style={[lb.podiumAvatar, { borderColor: rankColor }]}>
        <Text style={[lb.podiumAvatarTxt, { color: rankColor }]}>{item.nickname[0]}</Text>
      </View>
      <View style={[lb.podiumCrown, { backgroundColor: rankColor }]}>
        <Text style={lb.podiumRankTxt}>{item.rank}</Text>
      </View>
      <Text style={[lb.podiumName, { color: item.isMe ? C.lime : C.text }]} numberOfLines={1}>{item.nickname}</Text>
      <Text style={[lb.podiumTier, { color: tierColor }]}>{item.tier}</Text>
    </View>
  );
}

function _LeaderRow({ item, tab }: { item: RankedEntry; tab: string }) {
  var rankColor = item.rank <= 3 ? (RANK_COLORS[item.rank] ?? C.textDim) : C.textDim;
  var wl = item.games > 0 ? Math.round((item.wins / item.games) * 100) : 0;
  var statVal = tab === TAB_OVR ? String(item.ovr) : tab === TAB_WINS ? String(item.wins) + 'G' : wl + '%';
  var tierColor = TIER_COLOR[item.tier] ?? C.textDim;
  return (
    <View style={[lb.row, item.isMe && lb.rowMe]}>
      <Text style={[lb.rankNum, { color: rankColor }]}>{String(item.rank).padStart(2, '0')}</Text>
      <View style={lb.playerInfo}>
        <View style={lb.nameRow}>
          <Text style={[lb.playerName, item.isMe && lb.playerNameMe]}>{item.nickname}</Text>
          {item.isMe ? (
            <View style={lb.meTag}><Text style={lb.meTxt}>{t('leaderboard.me_tag')}</Text></View>
          ) : null}
        </View>
        <Text style={lb.playerDistrict}>{item.district}</Text>
      </View>
      <View style={[lb.tierPill, { borderColor: tierColor + '55', backgroundColor: tierColor + '11' }]}>
        <Text style={[lb.tierTxt, { color: tierColor }]}>{item.tier}</Text>
      </View>
      <Text style={[lb.statVal, item.isMe && lb.statValMe]}>{statVal}</Text>
    </View>
  );
}
const LeaderRow = memo(_LeaderRow);

interface LeaderboardSheetProps { open: boolean; onClose: () => void; myNickname: string | null; }
export default function LeaderboardSheet({ open, onClose, myNickname }: LeaderboardSheetProps) {
  var [activeTab, setActiveTab]       = useState(0);
  var [activeSeasonId, setSeasonId]   = useState<number | undefined>(undefined);
  var leaderResult  = useLeaderboard(activeSeasonId);
  var seasonsResult = useSeasons();
  var rawData    = leaderResult.data  || [];
  var seasons    = seasonsResult.data || [];
  if (!open) return null;

  var sorted = useMemo(function() {
    return rawData.slice().sort(function(a, b) {
      if (activeTab === 0) return b.ovr - a.ovr;
      if (activeTab === 1) return b.wins - a.wins;
      var aPct = a.games > 0 ? a.wins / a.games : 0;
      var bPct = b.games > 0 ? b.wins / b.games : 0;
      return bPct - aPct;
    }).map(function(item, i) {
      return Object.assign({}, item, {
        rank: i + 1,
        isMe: myNickname ? item.nickname.toLowerCase() === myNickname.toLowerCase() : false,
      });
    });
  }, [activeTab, myNickname, rawData]);

  var top3 = sorted.slice(0, 3);
  var rest = sorted.slice(3);
  var activeTabLabel = TABS[Math.min(activeTab, TABS.length - 1)] ?? '';
  var keyExtractor  = useCallback(function(item: RankedEntry) { return String(item.rank); }, []);
  var renderItem    = useCallback(function(info: ListRenderItemInfo<RankedEntry>) { return <LeaderRow item={info.item} tab={activeTabLabel ?? ''} />; }, [activeTabLabel]);
  var renderSep     = useCallback(function() { return <View style={lb.sep} />; }, []);
  var onTab0 = useCallback(function() { setActiveTab(0); }, []);
  var onTab1 = useCallback(function() { setActiveTab(1); }, []);
  var onTab2 = useCallback(function() { setActiveTab(2); }, []);
  var tabHandlers = [onTab0, onTab1, onTab2];
  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={onClose}>
      <View style={lb.root}>
        <TouchableOpacity style={lb.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={lb.sheet}>
          <View style={lb.handle} />
          <View style={lb.header}>
            <View>
              <Text style={lb.title}>{t('leaderboard.title')}</Text>
              <Text style={lb.sub}>{t('leaderboard.subtitle')}</Text>
            </View>
            <TouchableOpacity style={lb.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={lb.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Sezon seçici */}
          {seasons.length > 1 ? (
            <View style={lb.seasonRow}>
              {seasons.map(function(season) {
                var active = (activeSeasonId ?? seasons[0]?.id) === season.id;
                return (
                  <TouchableOpacity
                    key={season.id}
                    style={[lb.seasonBtn, active && lb.seasonBtnActive]}
                    onPress={function() { setSeasonId(season.id); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[lb.seasonTxt, active && lb.seasonTxtActive]}>{season.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {/* Tabs */}
          <View style={lb.tabRow}>
            {TABS.map(function(tab, i) {
              return (
                <TouchableOpacity
                  key={tab}
                  style={[lb.tab, activeTab === i && lb.tabActive]}
                  onPress={tabHandlers[i]}
                  activeOpacity={0.8}
                >
                  <Text style={[lb.tabTxt, activeTab === i && lb.tabTxtActive]}>{tab}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Podium */}
          <View style={lb.podium}>
            <PodiumRow item={top3[1]} />
            <PodiumRow item={top3[0]} />
            <PodiumRow item={top3[2]} />
          </View>

          {/* Rest of list */}
          <FlatList
            data={rest}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={lb.list}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={renderSep}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
          />
        </View>
      </View>
    </Modal>
  );
}

const lb = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet: {
    backgroundColor: C.bgCard,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    maxHeight: SCREEN_H * 0.88,
    paddingBottom: 40,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.screen,
    paddingVertical: S.md,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  title: { color: C.text, fontSize: F.base, fontWeight: '900', letterSpacing: 1.5 },
  sub: { color: C.textDim, fontSize: F.xs, marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: R.full, backgroundColor: C.bgCard2, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { color: C.textDim, fontSize: 13, fontWeight: '700' },
  tabRow: {
    flexDirection: 'row',
    gap: S.sm,
    paddingHorizontal: S.screen,
    paddingVertical: S.sm,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tab: {
    paddingHorizontal: S.md,
    paddingVertical: 6,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabActive: { backgroundColor: 'rgba(200,240,0,0.1)', borderColor: C.lime },
  tabTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 1 },
  tabTxtActive: { color: C.lime },
  // Podium
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: S.screen,
    paddingVertical: S.md,
    gap: S.md,
    backgroundColor: C.bgPanel,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  podiumItem: { alignItems: 'center', gap: 4 },
  podiumAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: C.bgCard2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumAvatarTxt: { fontSize: F.lg, fontWeight: '900' },
  podiumCrown: {
    position: 'absolute',
    top: -8,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumRankTxt: { color: C.bg, fontSize: 10, fontWeight: '900' },
  podiumName: { fontSize: F.xs, fontWeight: '800', textAlign: 'center' },
  podiumTier: { fontSize: 9, fontWeight: '700', textAlign: 'center' },
  // List rows
  list: { paddingHorizontal: S.screen, paddingTop: S.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: S.sm },
  rowMe: {
    backgroundColor: 'rgba(200,240,0,0.05)',
    marginHorizontal: -S.screen,
    paddingHorizontal: S.screen,
  },
  rankNum: { fontSize: F.base, fontWeight: '900', width: 28, letterSpacing: 0.5 },
  playerInfo: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  playerName: { color: C.text, fontSize: F.sm, fontWeight: '800' },
  playerNameMe: { color: C.lime },
  playerDistrict: { color: C.textDim, fontSize: F.xs },
  meTag: {
    backgroundColor: 'rgba(200,240,0,0.15)',
    borderRadius: R.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: C.lime,
  },
  meTxt: { color: C.lime, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  tierPill: { borderRadius: R.sm, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  tierTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  statVal: { color: C.text, fontSize: F.base, fontWeight: '900', width: 44, textAlign: 'right' },
  statValMe: { color: C.lime },
  sep: { height: 1, backgroundColor: C.border },
  // Sezon seçici
  seasonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, paddingHorizontal: S.screen, paddingVertical: S.sm, borderBottomWidth: 1, borderBottomColor: C.border },
  seasonBtn: { paddingHorizontal: S.md, paddingVertical: 5, borderRadius: R.full, borderWidth: 1, borderColor: C.border },
  seasonBtnActive: { borderColor: C.orange, backgroundColor: 'rgba(255,91,0,0.1)' },
  seasonTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '700' },
  seasonTxtActive: { color: C.orange, fontWeight: '900' },
});
