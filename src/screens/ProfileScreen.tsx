import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import type { DimensionValue } from 'react-native';
import { C, F, R, S } from '../theme';
import { t } from '../i18n';
import { calcOVR, ovrGrade } from '@domains/gamification';
import { BADGE_TIER_COLOR as TIER_COLORS } from '@shared/constants/tier';
import type { Badge, Profile, ProfileOverview, ProfileRecentMatch } from '../types/domain/profile';

interface StatItem { label: string; value: string | number; }
function OVRCard({ stats, profile }: { stats: StatItem[]; profile: Partial<Profile> }) {
  var ovr = useMemo(function() { return calcOVR(stats); }, [stats]);
  var grade = ovrGrade(ovr);
  return (
    <View style={p.ovrCard}>
      <View style={p.ovrLeft}>
        <Text style={p.ovrNum}>{ovr}</Text>
        <Text style={p.ovrLabel}>OVR</Text>
      </View>
      <View style={p.ovrMid}>
        <Text style={p.ovrNickname}>{profile.nickname || 'OYUNCU'}</Text>
        <Text style={p.ovrArch}>{profile.archetype}</Text>
        <Text style={p.ovrPos}>{profile.position}</Text>
      </View>
      <View style={p.ovrRight}>
        <Text style={p.ovrGrade}>{grade}</Text>
        <Text style={p.ovrGradeLabel}>{t('profile.grade_label')}</Text>
        <View style={p.ovrJersey}>
          <Text style={p.ovrJerseyTxt}>#{profile.jerseyNumber || '34'}</Text>
        </View>
      </View>
    </View>
  );
}

function AttrBar({ label, value, maxVal, color }: { label: string; value: number; maxVal: number; color?: string }) {
  var pct = Math.min(1, Math.max(0, (value || 0) / (maxVal || 99)));
  return (
    <View style={p.attrRow}>
      <Text style={p.attrLabel}>{label}</Text>
      <View style={p.attrTrack}>
        <View style={[p.attrFill, { width: (Math.round(pct * 100) + '%') as DimensionValue, backgroundColor: color || C.lime }]} />
      </View>
      <Text style={p.attrVal}>{value}</Text>
    </View>
  );
}

function RepSection({ stats }: { profile: Partial<Profile>; stats: StatItem[] }) {
  var wins  = stats ? String((stats.find(function(s: StatItem) { return s.label === 'GALİBİYET'; }) ?? { value: '0' }).value) : '0';
  var games = stats ? String((stats.find(function(s: StatItem) { return s.label === 'MAÇLAR'; }) ?? { value: '0' }).value) : '0';
  var pts   = stats ? String((stats.find(function(s: StatItem) { return s.label === 'ORT. SAYILAR'; }) ?? { value: '0' }).value) : '0';
  var ast   = stats ? String((stats.find(function(s: StatItem) { return s.label === 'ORT. ASİST'; }) ?? { value: '0' }).value) : '0';
  var wint = parseInt(wins) || 0;
  var gamest = Math.max(1, parseInt(games) || 1);
  return (
    <View style={p.attrCard}>
      <AttrBar label={t('profile.attr_score')}    value={parseFloat(pts)  || 0}  maxVal={30} color={C.orange} />
      <AttrBar label={t('profile.attr_assist')}   value={parseFloat(ast)  || 0}  maxVal={12} color={C.blue || '#00D4FF'} />
      <AttrBar label={t('profile.attr_winpct')}   value={Math.round(wint / gamest * 100)} maxVal={100} color={C.lime} />
      <AttrBar label={t('profile.attr_matches')}  value={gamest}                maxVal={100} color={C.textDim} />
    </View>
  );
}

function BadgeCard({ badge, onPress }: { badge: Badge; onPress: (b: Badge) => void }) {
  var tierColor = TIER_COLORS[badge.tier] || C.textDim;
  var handlePress = useCallback(function() { onPress(badge); }, [badge, onPress]);
  return (
    <TouchableOpacity
      style={[p.badge, badge.active ? p.badgeActive : p.badgeDim, badge.active && { borderColor: tierColor + '55' }]}
      onPress={handlePress}
      activeOpacity={0.78}
    >
      {badge.active ? <View style={[p.badgeGlow, { backgroundColor: tierColor + '18' }]} /> : null}
      <Text style={p.badgeIcon}>{badge.icon}</Text>
      <Text style={[p.badgeName, !badge.active && p.badgeNameDim]}>{badge.label}</Text>
      <View style={[p.badgeTierPill, { backgroundColor: badge.active ? tierColor + '22' : 'transparent', borderColor: badge.active ? tierColor + '44' : 'transparent', borderWidth: 1 }]}>
        <Text style={[p.badgeTier, { color: badge.active ? tierColor : C.textMuted }]}>{badge.tier || 'LOCKED'}</Text>
      </View>
    </TouchableOpacity>
  );
}

function HeatGrid() {
  var cells = [];
  for (var i = 0; i < 35; i++) {
    var v = 0.1 + Math.abs(Math.sin(i * 7.3)) * 0.9;
    cells.push(v);
  }
  return (
    <View style={p.heatGrid}>
      {cells.map(function(v, i) {
        return <View key={String(i)} style={[p.heatCell, { opacity: v }]} />;
      })}
    </View>
  );
}

function ResultCard({ match }: { match: ProfileRecentMatch }) {
  var win = match.outcome === 'W';
  return (
    <View style={[p.resultCard, win ? p.resultWin : p.resultLoss]}>
      <View style={p.resultHead}>
        <View style={[p.outcomePill, { backgroundColor: win ? C.green : C.red }]}>
          <Text style={p.outcomeTxt}>{win ? t('profile.outcome_win') : t('profile.outcome_loss')}</Text>
        </View>
        <Text style={p.resultDate}>{match.date}</Text>
      </View>
      <Text style={p.resultVs}>{t('profile.vs')} {match.versus}</Text>
      <View style={p.resultStats}>
        {match.stats.map(function(st) {
          return (
            <View key={st.label} style={p.resultStat}>
              <Text style={p.resultStatVal}>{st.value}</Text>
              <Text style={p.resultStatLbl}>{st.label}</Text>
            </View>
          );
        })}
      </View>
      {match.tags && match.tags.length > 0 ? (
        <View style={p.tagRow}>
          {match.tags.map(function(tag) {
            return <View key={tag} style={p.tag}><Text style={p.tagTxt}>{tag}</Text></View>;
          })}
        </View>
      ) : null}
    </View>
  );
}

function SectionHead({ num, title }: { num: number; title: string }) {
  return (
    <View style={p.sectionHead}>
      <Text style={p.sectionNum}>{num < 10 ? '0' + num : String(num)}</Text>
      <View style={p.sectionLine} />
      <Text style={p.sectionLbl}>{title}</Text>
    </View>
  );
}

interface ProfileScreenProps {
  data: ProfileOverview | null;
  historyExpanded: boolean;
  onToggleHistory: () => void;
  onOpenBadge: (badge: Badge) => void;
  onUpgradePro: () => void;
  onEditProfile: () => void;
  onLogout: () => void;
  onOpenLeaderboard?: () => void;
}
export default function ProfileScreen({ data, historyExpanded, onToggleHistory, onOpenBadge, onUpgradePro, onEditProfile, onLogout, onOpenLeaderboard }: ProfileScreenProps) {
  if (!data) {
    return (
      <View style={p.loading}>
        <Text style={p.loadingNum}>00</Text>
        <Text style={p.loadingTxt}>{t('profile.loading')}</Text>
      </View>
    );
  }
  var profile = data.profile || {};
  var allMatches = data.recentMatches ?? [];
  var history = historyExpanded ? allMatches : allMatches.slice(0, 3);
  return (
    <View style={p.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={p.scroll}>
        {/* Screen hero */}
        <View style={p.heroSection}>
          <View style={p.heroGlow} />
          <Text style={p.heroTitle}>{t('profile.hero_title')}</Text>
          <Text style={p.heroSub}>{t('profile.hero_sub')}</Text>
        </View>
        {/* OVR Card */}
        <OVRCard stats={data.stats} profile={profile} />
        {/* Quick actions */}
        <View style={p.actionRow}>
          <TouchableOpacity style={p.actionBtn} onPress={onEditProfile} activeOpacity={0.8}>
            <Text style={p.actionBtnTxt}>{t('profile.edit_btn')}</Text>
          </TouchableOpacity>
          <View style={p.repTag}>
            <Text style={p.repTagVal}>{profile.playerRep}</Text>
            <Text style={p.repTagLbl}>{t('profile.rep_label')}</Text>
          </View>
          {onOpenLeaderboard ? (
            <TouchableOpacity style={p.ldrBtn} onPress={onOpenLeaderboard} activeOpacity={0.8}>
              <Text style={p.ldrBtnTxt}>🏆</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={p.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
            <Text style={p.logoutBtnTxt}>{t('profile.logout_btn')}</Text>
          </TouchableOpacity>
        </View>
        {/* Attribute Bars */}
        <View style={p.section}>
          <SectionHead num={1} title={t('profile.section_attributes')} />
          <RepSection profile={profile} stats={data.stats} />
        </View>
        {/* Heat grid */}
        <View style={p.section}>
          <SectionHead num={2} title={t('profile.section_heat')} />
          <View style={p.heatCard}>
            <HeatGrid />
            <Text style={p.heatSub}>{t('profile.heat_courts')}</Text>
          </View>
        </View>
        {/* Badges */}
        <View style={p.section}>
          <SectionHead num={3} title={t('profile.section_badges')} />
          <View style={p.badgeGrid}>
            {(data.badges || []).map(function(badge: Badge) {
              return <BadgeCard key={badge.id || badge.label} badge={badge} onPress={onOpenBadge} />;
            })}
          </View>
        </View>
        {/* Match history */}
        <View style={p.section}>
          <SectionHead num={4} title={t('profile.section_history')} />
          {history.map(function(match: ProfileRecentMatch) {
            return <ResultCard key={match.id} match={match} />;
          })}
          {!historyExpanded && data.recentMatches && data.recentMatches.length > 3 ? (
            <TouchableOpacity style={p.histBtn} onPress={onToggleHistory}>
              <Text style={p.histBtnTxt}>{t('profile.history_expand')}</Text>
            </TouchableOpacity>
          ) : historyExpanded ? (
            <TouchableOpacity style={p.histBtn} onPress={onToggleHistory}>
              <Text style={p.histBtnTxt}>{t('profile.history_collapse')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {/* Pro Banner */}
        <TouchableOpacity style={p.proBanner} onPress={onUpgradePro} activeOpacity={0.9}>
          <View style={p.proBannerAccent} />
          <Text style={p.proTag}>{t('profile.pro_tag')}</Text>
          <Text style={p.proTitle}>{t('profile.pro_title_1')}</Text>
          <Text style={p.proTitle2}>{t('profile.pro_title_2')}</Text>
          <Text style={p.proSub}>{t('profile.pro_sub')}</Text>
          <View style={p.proBtn}><Text style={p.proBtnTxt}>{t('profile.pro_cta')}</Text></View>
        </TouchableOpacity>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const p = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  loadingNum: { color: C.lime, fontSize: 48, fontWeight: '900', letterSpacing: 4, opacity: 0.2 },
  loadingTxt: { color: C.textDim, fontSize: F.xs, letterSpacing: 4, fontWeight: '800' },
  scroll: { padding: S.screen },
  // Hero section
  heroSection: { paddingTop: S.md, paddingBottom: S.lg, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: C.orange, opacity: 0.07 },
  heroTitle: { color: C.orange, fontSize: F.x5, fontWeight: '900', fontStyle: 'italic', lineHeight: F.x5 * 1.05, letterSpacing: -0.5 },
  heroSub: { color: C.text, fontSize: F.xs, fontWeight: '800', fontStyle: 'italic', letterSpacing: 2.5, marginTop: S.xs, opacity: 0.7 },
  // OVR Card
  ovrCard: { backgroundColor: C.bgCard, borderRadius: R.xl, padding: S.lg, flexDirection: 'row', alignItems: 'center', marginBottom: S.md, borderWidth: 1, borderColor: 'rgba(200,240,0,0.2)', overflow: 'hidden' },
  ovrLeft: { alignItems: 'center', marginRight: S.lg, minWidth: 80 },
  ovrNum: { color: C.lime, fontSize: 64, fontWeight: '900', lineHeight: 68, letterSpacing: -2 },
  ovrLabel: { color: C.textDim, fontSize: F.xs, fontWeight: '900', letterSpacing: 3, marginTop: -4 },
  ovrMid: { flex: 1, gap: 3 },
  ovrNickname: { color: C.text, fontSize: F.xl, fontWeight: '900', letterSpacing: 0.5, fontStyle: 'italic' },
  ovrArch: { color: C.orange, fontSize: F.xs, fontWeight: '800', letterSpacing: 1.5 },
  ovrPos: { color: C.textDim, fontSize: F.xs },
  ovrRight: { alignItems: 'center', gap: 4 },
  ovrGrade: { color: C.lime, fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  ovrGradeLabel: { color: C.textDim, fontSize: 9, fontWeight: '800', letterSpacing: 2, marginTop: -4 },
  ovrJersey: { backgroundColor: C.bgCard2, borderRadius: R.sm, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.border, marginTop: 4 },
  ovrJerseyTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '800' },
  // Action row
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.x2 },
  actionBtn: { flex: 1, backgroundColor: C.bgCard, borderRadius: R.sm, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  actionBtnTxt: { color: C.textDim, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  repTag: { alignItems: 'center', paddingHorizontal: S.sm },
  repTagVal: { color: C.lime, fontSize: F.lg, fontWeight: '900' },
  repTagLbl: { color: C.textDim, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  logoutBtn: { backgroundColor: 'rgba(248,113,113,0.1)', borderRadius: R.sm, paddingVertical: 10, paddingHorizontal: S.md, borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)' },
  logoutBtnTxt: { color: C.red, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  ldrBtn: { backgroundColor: C.bgCard2, borderRadius: R.sm, paddingVertical: 10, paddingHorizontal: S.sm, borderWidth: 1, borderColor: C.border },
  ldrBtnTxt: { fontSize: 16 },
  // Attribute bars
  attrCard: { backgroundColor: C.bgCard, borderRadius: R.xl, padding: S.base, borderWidth: 1, borderColor: C.border, gap: S.sm },
  attrRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  attrLabel: { color: C.textDim, fontSize: 10, fontWeight: '800', letterSpacing: 1, width: 80 },
  attrTrack: { flex: 1, height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' },
  attrFill: { height: '100%', borderRadius: 3 },
  attrVal: { color: C.text, fontSize: 11, fontWeight: '900', width: 28, textAlign: 'right' },
  // Section head
  section: { marginBottom: S.x2 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: S.base },
  sectionNum: { color: C.lime, fontSize: 11, fontWeight: '900', letterSpacing: 1, minWidth: 20 },
  sectionLine: { width: 1, height: 14, backgroundColor: C.border },
  sectionLbl: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 2.5 },
  // Heat grid
  heatCard: { backgroundColor: C.bgCard, borderRadius: R.xl, padding: S.base, borderWidth: 1, borderColor: C.border },
  heatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: S.sm },
  heatCell: { width: 32, height: 18, borderRadius: 3, backgroundColor: C.orange },
  heatSub: { color: C.textDim, fontSize: 10, textAlign: 'center', letterSpacing: 1 },
  // Badges
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  badge: { width: '30%', borderRadius: R.lg, padding: S.md, alignItems: 'center', borderWidth: 1, overflow: 'hidden' },
  badgeActive: { backgroundColor: C.bgCard },
  badgeDim: { backgroundColor: C.bgCard, borderColor: C.border, opacity: 0.5 },
  badgeGlow: { ...StyleSheet.absoluteFillObject },
  badgeIcon: { fontSize: 26, marginBottom: 6 },
  badgeName: { color: C.text, fontSize: 10, fontWeight: '800', textAlign: 'center', letterSpacing: 0.3, marginBottom: 5 },
  badgeNameDim: { color: C.textDim },
  badgeTierPill: { borderRadius: R.sm, paddingHorizontal: 6, paddingVertical: 2 },
  badgeTier: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  // Match history
  resultCard: { borderRadius: R.lg, padding: S.base, marginBottom: S.sm, borderWidth: 1, borderColor: C.border, backgroundColor: C.bgCard },
  resultWin: { borderLeftWidth: 3, borderLeftColor: C.green },
  resultLoss: { borderLeftWidth: 3, borderLeftColor: C.red },
  resultHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: S.sm },
  outcomePill: { borderRadius: R.sm, paddingHorizontal: 10, paddingVertical: 4 },
  outcomeTxt: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  resultDate: { color: C.textDim, fontSize: 10 },
  resultVs: { color: C.text, fontSize: F.md, fontWeight: '900', marginBottom: S.sm },
  resultStats: { flexDirection: 'row', gap: S.xl, marginBottom: S.sm },
  resultStat: { alignItems: 'center' },
  resultStatVal: { color: C.text, fontSize: F.lg, fontWeight: '900' },
  resultStatLbl: { color: C.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: 'rgba(200,240,0,0.1)', borderRadius: R.sm, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(200,240,0,0.25)' },
  tagTxt: { color: C.lime, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  histBtn: { backgroundColor: C.bgCard, borderRadius: R.sm, paddingVertical: S.md, alignItems: 'center', marginTop: S.sm, borderWidth: 1, borderColor: C.border },
  histBtnTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 1.5 },
  // Pro banner
  proBanner: { backgroundColor: C.bgCard, borderRadius: R.xl, padding: S.xl, borderWidth: 1, borderColor: 'rgba(255,91,0,0.3)', overflow: 'hidden', marginBottom: S.lg },
  proBannerAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: C.orange },
  proTag: { color: C.orange, fontSize: F.xs, fontWeight: '800', letterSpacing: 2, marginBottom: S.sm, marginTop: S.sm },
  proTitle: { color: C.text, fontSize: 22, fontWeight: '900', lineHeight: 28 },
  proTitle2: { color: C.lime, fontSize: 22, fontWeight: '900', lineHeight: 28, marginBottom: S.sm },
  proSub: { color: C.textDim, fontSize: F.sm, lineHeight: 20, marginBottom: S.lg },
  proBtn: { backgroundColor: C.orange, borderRadius: R.sm, alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10 },
  proBtnTxt: { color: '#fff', fontSize: F.xs, fontWeight: '900', letterSpacing: 2 },
});
