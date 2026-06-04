import React, { useCallback, memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, R, S } from '../theme';
import { SkeletonList, ErrorState } from '../components/ScreenStates';
import { t } from '../i18n';
import { SKILL_TIER_COLOR as TIER_COLOR } from '@shared/constants/tier';
import type { Match, HomeFeed, TrendingCourt, SquadActivity } from '../types/domain/match';

// ─── Sub-component prop types ─────────────────────────────────────────────────
interface SectionHeadProps { num: number; title: string; actionLabel?: string; onAction?: () => void; }
interface HeroCardProps    { match: Match | null; onPress: (m: Match) => void; }
interface ActivityItemProps { item: SquadActivity; }
interface CourtCardProps   { court: TrendingCourt; onPress: (m: Match) => void; }
interface UrgentCardProps  { match: Match; onPress: (m: Match) => void; }
interface ProBannerProps   { onUpgrade: () => void; }
interface HomeScreenProps {
  data: HomeFeed | null;
  onOpenMatch: (m: Match) => void;
  onOpenActivity?: () => void;
  onCreateRun: () => void;
  onUpgradePro: () => void;
  refreshing: boolean;
  onRefresh: () => void;
  isError: boolean;
  onRetry: () => void;
}

function _SectionHead({ num, title, actionLabel, onAction }: SectionHeadProps) {
  return (
    <View style={h.sectionHead}>
      <Text style={h.sectionNum}>{num < 10 ? '0' + num : String(num)}</Text>
      <View style={h.sectionLine} />
      <Text style={h.sectionLabel}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onAction} style={h.sectionActionWrap}>
          <Text style={h.sectionAction}>{actionLabel} ›</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
const SectionHead = memo(_SectionHead);

function _HeroCard({ match, onPress }: HeroCardProps) {
  if (!match) return null;
  var filled = match.playersJoined;
  var total = match.capacity;
  var pct = total > 0 ? (filled / total) : 0;
  var spotsLeft = total - filled;
  var tierColor = TIER_COLOR[match.skillLevel] || C.lime;
  var handlePress = useCallback(function() { onPress(match); }, [match, onPress]);
  return (
    <TouchableOpacity style={h.hero} onPress={handlePress} activeOpacity={0.92}>
      <Image source={{ uri: match.image }} style={h.heroImg} contentFit="cover" cachePolicy="memory-disk" />
      <View style={h.heroDim} />
      {/* Tier accent bar */}
      <View style={[h.heroTierBar, { backgroundColor: tierColor }]} />
      <View style={h.heroContent}>
        <View style={h.heroPillRow}>
          {match.status === 'live' ? (
            <View style={h.livePill}>
              <View style={h.liveDot} />
              <Text style={h.liveTxt}>{t('common.live')}</Text>
            </View>
          ) : match.status === 'streaking' ? (
            <View style={h.hotPill}><Text style={h.hotTxt}>{t('common.active')}</Text></View>
          ) : null}
          <View style={[h.skillPill, { borderColor: tierColor + '55' }]}>
            <Text style={[h.skillTxt, { color: tierColor }]}>{match.skillLevel}</Text>
          </View>
        </View>
        <Text style={h.heroTitle} numberOfLines={2}>{match.title}</Text>
        <Text style={h.heroSub}>{match.courtName}  ·  {match.district}  ·  {match.distance}</Text>
        <View style={h.heroMiniRow}>
          <View style={h.miniBox}>
            <Text style={h.miniLabel}>{t('home.card_fee_label')}</Text>
            <Text style={h.miniVal}>{match.feeType === 'Ucretli' ? match.fee + ' ₺' : t('common.free')}</Text>
          </View>
          <View style={h.miniBox}>
            <Text style={h.miniLabel}>{t('home.card_format_label')}</Text>
            <Text style={h.miniVal}>{match.format}</Text>
          </View>
          <View style={h.miniBox}>
            <Text style={h.miniLabel}>{t('home.card_time_label')}</Text>
            <Text style={h.miniVal}>{match.dateTime}</Text>
          </View>
        </View>
        <View style={h.progressTrack}>
          <View style={[h.progressFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: tierColor }]} />
        </View>
        <View style={h.progressMeta}>
          <Text style={h.progressTxt}>{filled} / {total} {t('home.players_label')}</Text>
          <Text style={[h.spotsTxt, { color: tierColor }]}>{spotsLeft} {t('common.spots_left')}</Text>
        </View>
        <TouchableOpacity style={h.joinBtn} onPress={handlePress} activeOpacity={0.85}>
          <Text style={h.joinTxt}>{match.cta || t('home.join_cta')}  →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
const HeroCard = memo(_HeroCard);

function _ActivityItem({ item }: ActivityItemProps) {
  return (
    <View style={h.actItem}>
      <Image source={{ uri: item.avatar }} style={h.actAvatar} contentFit="cover" cachePolicy="memory-disk" />
      <View style={h.actBody}>
        <Text style={h.actTxt} numberOfLines={2}>
          <Text style={h.actUser}>{item.user} </Text>
          <Text style={h.actAction}>{item.action} </Text>
          <Text style={h.actHL}>{item.highlight}</Text>
        </Text>
        <Text style={h.actMeta}>{item.time}  ·  {item.location}</Text>
      </View>
      {item.arrow ? <Text style={h.actArrow}>›</Text> : null}
    </View>
  );
}
const ActivityItem = memo(_ActivityItem);

function _CourtCard({ court, onPress }: CourtCardProps) {
  const handlePress = useCallback(function() { if (court.featuredMatch) onPress(court.featuredMatch); }, [court, onPress]);
  return (
    <TouchableOpacity style={h.courtCard} onPress={handlePress} activeOpacity={0.88}>
      <Image source={{ uri: court.image }} style={h.courtImg} contentFit="cover" cachePolicy="memory-disk" />
      <View style={h.courtDim} />
      <View style={h.courtBody}>
        <Text style={h.courtHeat}>{court.heat}</Text>
        <Text style={h.courtName}>{court.name}</Text>
        <Text style={h.courtMeta}>{court.distance}  ·  {court.type}</Text>
      </View>
      {/* THPS-style corner score */}
      <View style={h.courtScore}>
          <Text style={h.courtScoreTxt}>{court.activeRuns || 0}</Text>
          <Text style={h.courtScoreLbl}>RUN</Text>
      </View>
    </TouchableOpacity>
  );
}

function _UrgentCard({ match, onPress }: UrgentCardProps) {
  var tierColor = TIER_COLOR[match.skillLevel] || C.orange;
  var handlePress = useCallback(function() { onPress(match); }, [match, onPress]);
  return (
    <TouchableOpacity style={h.urgentCard} onPress={handlePress} activeOpacity={0.88}>
      <View style={[h.urgentAccent, { backgroundColor: tierColor }]} />
      <View style={h.urgentLeft}>
        {match.urgency ? (
          <View style={h.urgentPill}>
            <View style={[h.urgentDot, { backgroundColor: tierColor }]} />
            <Text style={[h.urgentPillTxt, { color: tierColor }]}>{match.urgency}</Text>
          </View>
        ) : null}
        <Text style={h.urgentTitle} numberOfLines={1}>{match.title}</Text>
        <Text style={h.urgentMeta}>{match.district}  ·  {match.format}</Text>
      </View>
      <View style={h.urgentRight}>
        {match.rank ? <Text style={h.urgentRank}>{match.rank}</Text> : null}
        {match.spots ? <Text style={h.urgentSpots}>{match.spots}</Text> : null}
        <View style={[h.urgentCTA, { backgroundColor: tierColor }]}>
          <Text style={h.urgentCTATxt}>{match.cta || 'GİR'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function _ProBanner({ onUpgrade }: ProBannerProps) {
  return (
    <TouchableOpacity style={h.proBanner} onPress={onUpgrade} activeOpacity={0.9}>
      <View style={h.proBannerAccent} />
      <Text style={h.proTag}>{t('home.pro_tag')}</Text>
      <Text style={h.proTitle}>{t('home.pro_title_1')}</Text>
      <Text style={h.proTitle2}>{t('home.pro_title_2')}</Text>
      <Text style={h.proSub}>{t('home.pro_sub')}</Text>
      <View style={h.proBtn}><Text style={h.proBtnTxt}>{t('home.pro_cta')}</Text></View>
    </TouchableOpacity>
  );
}
const ProBanner  = memo(_ProBanner);
const UrgentCard = memo(_UrgentCard);
const CourtCard  = memo(_CourtCard);

export default function HomeScreen({ data, onOpenMatch, onOpenActivity, onCreateRun, onUpgradePro, refreshing, onRefresh, isError, onRetry }: HomeScreenProps) {
  var insets = useSafeAreaInsets();
  var handleOpenActivity = useCallback(function() { onOpenActivity && onOpenActivity(); }, [onOpenActivity]);
  if (isError) {
    return <ErrorState message={t('home.error')} onRetry={onRetry} />;
  }
  if (!data) {
    return <SkeletonList count={3} />;
  }
  return (
    <View style={h.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={h.scroll}
        refreshControl={
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={C.lime} colors={[C.lime]} />
        }
      >
        <View style={h.screenHero}>
          <View style={h.screenHeroGlow} />
          <Text style={h.screenHeroTitle}>{t('home.hero_title')}</Text>
          <Text style={h.screenHeroSub}>{t('home.hero_sub')}</Text>
        </View>
        <HeroCard match={data.heroMatch} onPress={onOpenMatch} />
        <View style={h.section}>
          <SectionHead num={1} title={t('home.section_activity')} actionLabel={t('home.section_activity_action')} onAction={handleOpenActivity} />
          <View style={h.actCard}>
            {(data.squadActivity || []).map(function(item) {
              return <ActivityItem key={item.id} item={item} />;
            })}
          </View>
        </View>
        <View style={h.section}>
          <SectionHead num={2} title={t('home.section_courts')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={h.hPad}>
            {(data.trendingCourts || []).map(function(court) {
              return <CourtCard key={court.id} court={court} onPress={onOpenMatch} />;
            })}
            <View style={{ width: S.screen }} />
          </ScrollView>
        </View>
        {data.urgentRuns && data.urgentRuns.length > 0 ? (
          <View style={h.section}>
            <SectionHead num={3} title={t('home.section_urgent')} />
            {data.urgentRuns.map(function(run) {
              return <UrgentCard key={run.id} match={run} onPress={onOpenMatch} />;
            })}
          </View>
        ) : null}
        <ProBanner onUpgrade={onUpgradePro} />
        <View style={{ height: 120 }} />
      </ScrollView>
      <TouchableOpacity style={[h.fab, { bottom: Math.max(insets.bottom, 14) + 57 }]} onPress={onCreateRun} activeOpacity={0.85}>
        <Text style={h.fabTxt}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const h = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  loadingNum: { color: C.lime, fontSize: 48, fontWeight: '900', letterSpacing: 4, opacity: 0.25 },
  loadingTxt: { color: C.textDim, fontSize: F.xs, letterSpacing: 4, fontWeight: '800' },
  scroll: { paddingBottom: 40 },
  // Screen identity hero
  screenHero: { paddingHorizontal: S.screen, paddingTop: S.lg, paddingBottom: S.sm, overflow: 'hidden' },
  screenHeroGlow: { position: 'absolute', top: -20, left: -20, width: 160, height: 160, borderRadius: 80, backgroundColor: C.orange, opacity: 0.07 },
  screenHeroTitle: { color: C.orange, fontSize: F.x4, fontWeight: '900', fontStyle: 'italic', letterSpacing: -0.5 },
  screenHeroSub: { color: C.textDim, fontSize: F.xs, fontWeight: '800', fontStyle: 'italic', letterSpacing: 2, marginTop: 3 },
  // Hero
  hero: { height: 480, position: 'relative', overflow: 'hidden', marginBottom: S.lg },
  heroImg: StyleSheet.absoluteFillObject,
  heroDim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.62)' },
  heroTierBar: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 4 },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: S.screen, paddingBottom: S.xl },
  heroPillRow: { flexDirection: 'row', gap: S.sm, marginBottom: S.md },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.orange, borderRadius: R.sm, paddingHorizontal: 10, paddingVertical: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveTxt: { color: '#fff', fontSize: F.xs, fontWeight: '900', letterSpacing: 1.5 },
  hotPill: { backgroundColor: 'rgba(200,240,0,0.18)', borderRadius: R.sm, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(200,240,0,0.35)' },
  hotTxt: { color: C.lime, fontSize: F.xs, fontWeight: '800', letterSpacing: 1 },
  skillPill: { backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: R.sm, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  skillTxt: { fontSize: F.xs, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -0.5, marginBottom: 6, lineHeight: 38 },
  heroSub: { color: 'rgba(255,255,255,0.55)', fontSize: F.sm, marginBottom: S.base, fontWeight: '500' },
  heroMiniRow: { flexDirection: 'row', gap: S.sm, marginBottom: S.md },
  miniBox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: R.sm, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  miniLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  miniVal: { color: '#fff', fontSize: F.xs, fontWeight: '900' },
  progressTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden', marginBottom: S.sm },
  progressFill: { height: '100%', borderRadius: 2 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: S.base },
  progressTxt: { color: 'rgba(255,255,255,0.55)', fontSize: F.xs, fontWeight: '600' },
  spotsTxt: { fontSize: F.xs, fontWeight: '900' },
  joinBtn: { backgroundColor: C.orange, borderRadius: R.sm, paddingVertical: 15, alignItems: 'center' },
  joinTxt: { color: '#fff', fontSize: F.sm, fontWeight: '900', letterSpacing: 2 },
  // Section headers — numbered THPS style
  section: { paddingHorizontal: S.screen, marginBottom: S.x2 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: S.base, gap: 8 },
  sectionNum: { color: C.lime, fontSize: 11, fontWeight: '900', letterSpacing: 1, minWidth: 20 },
  sectionLine: { width: 1, height: 14, backgroundColor: C.border },
  sectionLabel: { flex: 1, color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 2 },
  sectionActionWrap: {},
  sectionAction: { color: C.orange, fontSize: F.xs, fontWeight: '700', letterSpacing: 1 },
  // Activity
  actCard: { backgroundColor: C.bgCard, borderRadius: R.lg, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  actItem: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingHorizontal: S.base, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: C.border },
  actAvatar: { width: 38, height: 38, borderRadius: R.full, backgroundColor: C.bgCard2 },
  actBody: { flex: 1 },
  actTxt: { fontSize: F.sm, lineHeight: 18 },
  actUser: { color: C.text, fontWeight: '800' },
  actAction: { color: C.textDim },
  actHL: { color: C.lime, fontWeight: '800' },
  actMeta: { color: C.textDim, fontSize: 10, marginTop: 3 },
  actArrow: { color: C.textDim, fontSize: 20 },
  // Courts
  hPad: { paddingLeft: S.screen },
  courtCard: { width: 200, height: 140, borderRadius: R.lg, marginRight: S.sm, overflow: 'hidden' },
  courtImg: StyleSheet.absoluteFillObject,
  courtDim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.52)' },
  courtBody: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: S.md },
  courtHeat: { color: C.lime, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 3 },
  courtName: { color: '#fff', fontSize: F.sm, fontWeight: '900', marginBottom: 2 },
  courtMeta: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  courtScore: { position: 'absolute', top: S.sm, right: S.sm, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: R.sm, paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(200,240,0,0.3)' },
  courtScoreTxt: { color: C.lime, fontSize: 14, fontWeight: '900' },
  courtScoreLbl: { color: C.textDim, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  // Urgent
  urgentCard: { backgroundColor: C.bgCard, borderRadius: R.lg, paddingHorizontal: S.base, paddingVertical: S.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  urgentAccent: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 3 },
  urgentLeft: { flex: 1, paddingRight: S.sm, paddingLeft: S.sm },
  urgentPill: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  urgentDot: { width: 5, height: 5, borderRadius: 3 },
  urgentPillTxt: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  urgentTitle: { color: C.text, fontSize: F.sm, fontWeight: '900', marginBottom: 3, letterSpacing: 0.2 },
  urgentMeta: { color: C.textDim, fontSize: 10 },
  urgentRight: { alignItems: 'flex-end', gap: 5 },
  urgentRank: { color: C.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  urgentSpots: { color: C.text, fontSize: F.xs, fontWeight: '900' },
  urgentCTA: { borderRadius: R.sm, paddingHorizontal: 14, paddingVertical: 8 },
  urgentCTATxt: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  // Pro Banner
  proBanner: { marginHorizontal: S.screen, backgroundColor: C.bgCard, borderRadius: R.xl, padding: S.xl, borderWidth: 1, borderColor: 'rgba(255,91,0,0.3)', overflow: 'hidden' },
  proBannerAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: C.orange },
  proTag: { color: C.orange, fontSize: F.xs, fontWeight: '800', letterSpacing: 2, marginBottom: S.sm, marginTop: S.sm },
  proTitle: { color: C.text, fontSize: 26, fontWeight: '900', lineHeight: 30 },
  proTitle2: { color: C.lime, fontSize: 26, fontWeight: '900', lineHeight: 30, marginBottom: S.sm },
  proSub: { color: C.textDim, fontSize: F.sm, lineHeight: 20, marginBottom: S.lg },
  proBtn: { backgroundColor: C.orange, borderRadius: R.sm, alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10 },
  proBtnTxt: { color: '#fff', fontSize: F.xs, fontWeight: '900', letterSpacing: 2 },
  // FAB
  fab: { position: 'absolute', bottom: 88, right: S.screen, width: 52, height: 52, borderRadius: R.full, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center', shadowColor: C.orange, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 8 },
  fabTxt: { color: '#fff', fontSize: 26, fontWeight: '300', lineHeight: 30 },
});
