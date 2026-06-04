import React, { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, TextInput, StyleSheet, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, R, S } from '../theme';
import { ErrorState } from '../components/ScreenStates';
import { t } from '../i18n';
import { SKILL_TIER_COLOR as TIER_COLOR } from '@shared/constants/tier';
import type { Match, MatchFilters } from '../types/domain/match';

type RunsFeed = { matches: Match[] };

interface FilterPillProps { label: string; value: string | undefined; onPress: () => void; }
interface RunCardProps    { match: Match; onPress: (m: Match) => void; }
interface EmptyStateProps { hasFilters: boolean; onReset: () => void; }
interface RunsScreenProps {
  data: RunsFeed | null;
  activeFilters: MatchFilters | null;
  onOpenMatch: (m: Match) => void;
  onCreateRun: () => void;
  onOpenFilter: (key: string) => void;
  onClearFilters: () => void;
  onUpgradePro: () => void;
  refreshing: boolean;
  onRefresh: () => void;
  isError: boolean;
  onRetry: () => void;
}

function _FilterPill({ label, value, onPress }: FilterPillProps) {
  var active = value !== 'Tümü' && value !== undefined;
  return (
    <TouchableOpacity
      style={[r.pill, active && r.pillActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[r.pillTxt, active && r.pillTxtActive]}>{active ? value : label}</Text>
      <Text style={[r.pillArrow, active && r.pillArrowActive]}>▾</Text>
    </TouchableOpacity>
  );
}
const FilterPill = memo(_FilterPill);

function _RunCard({ match, onPress }: RunCardProps) {
  var filled = match.playersJoined;
  var total = match.capacity;
  var pct = total > 0 ? (filled / total) : 0;
  var spotsLeft = total - filled;
  var tierColor = TIER_COLOR[match.skillLevel] || C.lime;
  var handlePress = useCallback(function() { onPress(match); }, [match, onPress]);
  return (
    <TouchableOpacity style={r.card} onPress={handlePress} activeOpacity={0.88}>
      {/* Left-side tier accent bar */}
      <View style={[r.tierBar, { backgroundColor: tierColor }]} />
      <Image source={{ uri: match.image }} style={r.thumb} contentFit="cover" cachePolicy="memory-disk" />
      <View style={r.cardBody}>
        <View style={r.cardTop}>
          <View style={{ flex: 1 }}>
            <View style={r.cardTitleRow}>
              <Text style={r.cardTitle} numberOfLines={1}>{match.title}</Text>
              <View style={[r.tierBadge, { backgroundColor: tierColor + '22', borderColor: tierColor + '55' }]}>
                <Text style={[r.tierBadgeTxt, { color: tierColor }]}>{match.skillLevel}</Text>
              </View>
            </View>
            <Text style={r.cardMeta}>{match.district}  ·  {match.format}</Text>
          </View>
          {match.status === 'live' ? (
            <View style={r.liveBadge}><Text style={r.liveBadgeTxt}>{t('common.live')}</Text></View>
          ) : match.status === 'streaking' ? (
            <View style={r.hotBadge}><Text style={r.hotBadgeTxt}>🔥</Text></View>
          ) : null}
        </View>
        <View style={r.cardBottom}>
          <View style={r.progressCol}>
            <View style={r.progressTrack}>
              <View style={[r.progressFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: tierColor }]} />
            </View>
            <Text style={r.playersTxt}>{filled}/{total}  ·  {spotsLeft} yer kaldı</Text>
          </View>
          <View style={r.cardRight}>
            <Text style={[r.feeTxt, { color: tierColor }]}>{match.feeType === 'Ucretli' ? match.fee + ' ₺' : t('common.free')}</Text>
            <TouchableOpacity style={[r.joinBtn, { backgroundColor: tierColor === '#4ADE80' ? C.lime : tierColor }]} onPress={handlePress}>
              <Text style={r.joinBtnTxt}>{t('runs.join_btn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
const RunCard = memo(_RunCard);

function _EmptyState({ hasFilters, onReset }: EmptyStateProps) {
  return (
    <View style={r.empty}>
      <Text style={r.emptyNum}>00</Text>
      <Text style={r.emptyTitle}>{hasFilters ? t('runs.empty_title_filtered') : t('runs.empty_title_default')}</Text>
      <Text style={r.emptySub}>{hasFilters ? t('runs.empty_sub_filtered') : t('runs.empty_sub_default')}</Text>
      {hasFilters ? (
        <TouchableOpacity style={r.emptyBtn} onPress={onReset}>
          <Text style={r.emptyBtnTxt}>{t('runs.empty_clear_btn')}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
const EmptyState = _EmptyState;

export default function RunsScreen({ data, activeFilters, onOpenMatch, onCreateRun, onOpenFilter, onClearFilters, onUpgradePro, refreshing, onRefresh, isError, onRetry }: RunsScreenProps) {
  var insets = useSafeAreaInsets();
  var [searchQuery, setSearchQuery] = useState('');
  var filters = activeFilters || { district: 'Tümü', skill: 'Tümü', format: 'Tümü' };
  var matches = data ? (data.matches || []) : null;
  var hasFilters = filters.district !== 'Tümü' || filters.skill !== 'Tümü' || filters.format !== 'Tümü';

  var filtered = useMemo(function() {
    if (matches === null) return null;
    var q = searchQuery.trim().toLowerCase();
    if (!q) return matches;
    return matches.filter(function(m) {
      return (
        m.title.toLowerCase().includes(q) ||
        m.courtName.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q)
      );
    });
  }, [matches, searchQuery]);

  var keyExtractor = useCallback(function(item: Match) { return item.id; }, []);
  var renderItem   = useCallback(function(info: { item: Match }) { return <RunCard match={info.item} onPress={onOpenMatch} />; }, [onOpenMatch]);
  var onFilterDistrict = useCallback(function() { onOpenFilter('district'); }, [onOpenFilter]);
  var onFilterSkill    = useCallback(function() { onOpenFilter('skill'); }, [onOpenFilter]);
  var onFilterFormat   = useCallback(function() { onOpenFilter('format'); }, [onOpenFilter]);
  var onClearSearch    = useCallback(function() { setSearchQuery(''); }, []);
  var onResetAll       = useCallback(function() { setSearchQuery(''); onClearFilters(); }, [onClearFilters]);

  return (
    <View style={r.root}>
      <View style={r.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={r.filterScroll}>
          <FilterPill label={t('runs.filter_district')} value={filters.district} onPress={onFilterDistrict} />
          <FilterPill label={t('runs.filter_skill')} value={filters.skill} onPress={onFilterSkill} />
          <FilterPill label={t('runs.filter_format')} value={filters.format} onPress={onFilterFormat} />
          {hasFilters ? (
            <TouchableOpacity style={r.clearPill} onPress={onClearFilters} activeOpacity={0.8}>
              <Text style={r.clearPillTxt}>{t('runs.filter_clear')}</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
        <View style={r.searchRow}>
          <Text style={r.searchIcon}>🔍</Text>
          <TextInput
            style={r.searchInput}
            placeholder={t('runs.search_placeholder')}
            placeholderTextColor={C.textDim}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={onClearSearch} style={r.searchClear}>
              <Text style={r.searchClearTxt}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      {isError ? (
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={<RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={C.lime} colors={[C.lime]} />}
          contentContainerStyle={{ flex: 1 }}
        >
          <ErrorState message={t('runs.error')} onRetry={onRetry} />
        </ScrollView>
      ) : filtered === null ? (
        <View style={r.loading}>
          <Text style={r.loadingNum}>00</Text>
          <Text style={r.loadingTxt}>{t('runs.loading')}</Text>
        </View>
      ) : filtered.length === 0 ? (
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={<RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={C.lime} colors={[C.lime]} />}
          contentContainerStyle={{ flex: 1 }}
        >
          <EmptyState hasFilters={hasFilters || searchQuery.length > 0} onReset={onResetAll} />
        </ScrollView>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={r.scroll}
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          maxToRenderPerBatch={8}
          initialNumToRender={6}
          windowSize={5}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={C.lime} colors={[C.lime]} />
          }
          ListHeaderComponent={
            <>
              <View style={r.heroSection}>
                <View style={r.heroGlow} />
                <Text style={r.heroTitle}>{t('runs.hero_title')}</Text>
                <Text style={r.heroSub}>{t('runs.hero_sub')}</Text>
              </View>
              <View style={r.countRow}>
                <Text style={r.countNum}>{String(filtered.length).padStart(2, '0')}</Text>
                <View style={r.countLine} />
                <Text style={r.countTxt}>{t('runs.found')}</Text>
                {hasFilters ? <View style={r.activeFilterDot} /> : null}
              </View>
            </>
          }
          ListFooterComponent={
            <>
              <View style={r.promoBanner}>
                <View style={r.promoBannerAccent} />
                <Text style={r.promoTag}>{t('runs.promo_tag')}</Text>
                <Text style={r.promoTitle}>{t('runs.promo_title')}</Text>
                <Text style={r.promoSub}>{t('runs.promo_sub')}</Text>
                <TouchableOpacity style={r.promoBtn} onPress={onUpgradePro} activeOpacity={0.85}><Text style={r.promoBtnTxt}>{t('runs.promo_cta')}</Text></TouchableOpacity>
              </View>
              <View style={{ height: 120 }} />
            </>
          }
        />
      )}
      <TouchableOpacity style={[r.fab, { bottom: Math.max(insets.bottom, 14) + 10 }]} onPress={onCreateRun} activeOpacity={0.85}>
        <Text style={r.fabTxt}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const r = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  filterBar: { backgroundColor: C.bgPanel, borderBottomWidth: 1, borderBottomColor: C.border, paddingTop: S.sm },
  filterScroll: { paddingHorizontal: S.screen, gap: S.sm, flexDirection: 'row', paddingBottom: S.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: S.screen, paddingBottom: S.sm, gap: S.sm },
  searchIcon: { fontSize: 14 },
  searchInput: {
    flex: 1,
    backgroundColor: C.bgCard2,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: S.md,
    paddingVertical: 7,
    color: C.text,
    fontSize: F.sm,
  },
  searchClear: { padding: 4 },
  searchClearTxt: { color: C.textDim, fontSize: F.sm, fontWeight: '700' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.bgCard, borderRadius: R.sm, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  pillActive: { backgroundColor: 'rgba(200,240,0,0.1)', borderColor: C.lime },
  pillTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 1 },
  pillTxtActive: { color: C.lime },
  pillArrow: { color: C.textDim, fontSize: 10 },
  pillArrowActive: { color: C.lime },
  clearPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,91,0,0.12)', borderRadius: R.sm, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,91,0,0.35)' },
  clearPillTxt: { color: C.orange, fontSize: F.xs, fontWeight: '900', letterSpacing: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  loadingNum: { color: C.lime, fontSize: 48, fontWeight: '900', letterSpacing: 4, opacity: 0.2 },
  loadingTxt: { color: C.textDim, fontSize: F.xs, letterSpacing: 4, fontWeight: '800' },
  scroll: { padding: S.screen },
  // Hero section
  heroSection: { paddingTop: S.md, paddingBottom: S.lg, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: C.orange, opacity: 0.07 },
  heroTitle: { color: C.orange, fontSize: F.x5, fontWeight: '900', fontStyle: 'italic', lineHeight: F.x5 * 1.05, letterSpacing: -0.5 },
  heroSub: { color: C.text, fontSize: F.xs, fontWeight: '800', fontStyle: 'italic', letterSpacing: 2.5, marginTop: S.xs, opacity: 0.7 },
  // Count row
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: S.base },
  countNum: { color: C.lime, fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  countLine: { width: 1, height: 12, backgroundColor: C.border },
  countTxt: { flex: 1, color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 1.5 },
  activeFilterDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.lime },
  card: { backgroundColor: C.bgCard, borderRadius: R.lg, marginBottom: S.md, overflow: 'hidden', borderWidth: 1, borderColor: C.border, flexDirection: 'row' },
  tierBar: { width: 4, alignSelf: 'stretch' },
  thumb: { width: 100, height: 120 },
  cardBody: { flex: 1, padding: S.md },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: S.sm },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' },
  cardTitle: { color: C.text, fontSize: F.sm, fontWeight: '900', letterSpacing: 0.2, flexShrink: 1 },
  tierBadge: { borderRadius: R.sm, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  tierBadgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  cardMeta: { color: C.textDim, fontSize: 10 },
  liveBadge: { backgroundColor: C.orange, borderRadius: R.sm, paddingHorizontal: 7, paddingVertical: 3 },
  liveBadgeTxt: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  hotBadge: { backgroundColor: 'rgba(200,240,0,0.12)', borderRadius: R.sm, paddingHorizontal: 7, paddingVertical: 3 },
  hotBadgeTxt: { fontSize: 12 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: S.sm },
  progressCol: { flex: 1 },
  progressTrack: { height: 3, backgroundColor: C.border, borderRadius: 2, overflow: 'hidden', marginBottom: 5 },
  progressFill: { height: '100%', borderRadius: 2 },
  playersTxt: { color: C.textDim, fontSize: 10, fontWeight: '600' },
  cardRight: { alignItems: 'flex-end', gap: 5 },
  feeTxt: { fontSize: F.xs, fontWeight: '900' },
  joinBtn: { borderRadius: R.sm, paddingHorizontal: 12, paddingVertical: 6 },
  joinBtnTxt: { color: '#000', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: S.x3 },
  emptyNum: { color: C.lime, fontSize: 64, fontWeight: '900', letterSpacing: 4, opacity: 0.15 },
  emptyTitle: { color: C.text, fontSize: F.lg, fontWeight: '900', marginBottom: S.sm, textAlign: 'center' },
  emptySub: { color: C.textDim, fontSize: F.sm, textAlign: 'center', lineHeight: 20 },
  emptyBtn: { marginTop: S.lg, backgroundColor: C.bgCard, borderRadius: R.sm, paddingHorizontal: S.xl, paddingVertical: S.md, borderWidth: 1, borderColor: C.border },
  emptyBtnTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 1.5 },
  promoBanner: { backgroundColor: C.bgCard, borderRadius: R.xl, padding: S.lg, borderWidth: 1, borderColor: 'rgba(255,91,0,0.25)', marginBottom: S.lg, overflow: 'hidden' },
  promoBannerAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: C.orange },
  promoTag: { color: C.orange, fontSize: F.xs, fontWeight: '900', letterSpacing: 2, marginBottom: 6, marginTop: S.sm },
  promoTitle: { color: C.text, fontSize: F.lg, fontWeight: '900', marginBottom: 6 },
  promoSub: { color: C.textDim, fontSize: F.sm, lineHeight: 20, marginBottom: S.md },
  promoBtn: { backgroundColor: C.orange, borderRadius: R.sm, alignSelf: 'flex-start', paddingHorizontal: S.base, paddingVertical: 8 },
  promoBtnTxt: { color: '#fff', fontSize: F.xs, fontWeight: '900', letterSpacing: 1.5 },
  fab: { position: 'absolute', bottom: 88, right: S.screen, width: 52, height: 52, borderRadius: R.full, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center', shadowColor: C.orange, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 8 },
  fabTxt: { color: '#fff', fontSize: 26, fontWeight: '300', lineHeight: 30 },
});
