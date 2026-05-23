import React from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { C, F, R, S } from '../theme';
import { SkeletonList, ErrorState } from '../components/ScreenStates';
import { t } from '../i18n';

function SectionHead({ num, title, actionLabel, onAction }) {
  return (
    <View style={sq.sectionHead}>
      <Text style={sq.sectionNum}>{num < 10 ? '0' + num : String(num)}</Text>
      <View style={sq.sectionLine} />
      <Text style={sq.sectionLabel}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={sq.sectionAction}>{actionLabel} ›</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function ChemBar({ value }) {
  var pct = Math.min(100, Math.max(0, value || 0));
  var barColor = pct >= 90 ? C.lime : pct >= 70 ? C.orange : C.red;
  return (
    <View style={sq.chemBlock}>
      <View style={sq.chemRow}>
        <Text style={sq.chemLabel}>{t('squad.chem_label')}</Text>
        <Text style={[sq.chemVal, { color: barColor }]}>{pct}</Text>
        <Text style={sq.chemPct}>%</Text>
      </View>
      <View style={sq.chemTrack}>
        <View style={[sq.chemFill, { width: String(pct) + '%', backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

function FormBadge({ result }) {
  return (
    <View style={[sq.formBadge, { backgroundColor: result === 'W' ? C.green : C.red }]}>
      <Text style={sq.formTxt}>{result}</Text>
    </View>
  );
}

function RosterRow({ player, index, onPress }) {
  return (
    <TouchableOpacity style={[sq.rosterRow, index > 0 && sq.rosterBorder]} onPress={onPress} activeOpacity={0.8}>
      <Text style={sq.rosterIdx}>{String(index + 1).padStart(2, '0')}</Text>
      <Image source={{ uri: player.avatar }} style={sq.rosterAvatar} />
      <View style={sq.rosterInfo}>
        <Text style={sq.rosterName}>{player.name}</Text>
        <Text style={sq.rosterArch}>{player.archetype}</Text>
      </View>
      <View style={sq.rosterStats}>
        {(player.stats || []).map(function(st) {
          return (
            <View key={st.label} style={sq.rosterStat}>
              <Text style={sq.rosterStatVal}>{st.value}</Text>
              <Text style={sq.rosterStatLbl}>{st.label}</Text>
            </View>
          );
        })}
      </View>
    </TouchableOpacity>
  );
}

function TeamCard({ team, isFirst, onPress }) {
  return (
    <TouchableOpacity style={[sq.teamCard, isFirst && sq.teamCardFeatured]} onPress={function() { onPress(team); }} activeOpacity={0.85}>
      {isFirst ? <View style={sq.teamCardAccent} /> : null}
      <View style={sq.teamCardLeft}>
        <Text style={[sq.teamName, isFirst && sq.teamNameFeatured]}>{team.name}</Text>
        <Text style={sq.teamMeta}>{team.district}  ·  {team.rosterSize} {t('squad.roster_suffix')}</Text>
      </View>
      <View style={sq.teamCardRight}>
        <Text style={[sq.teamRank, isFirst && sq.teamRankFeatured]}>{team.ranking}</Text>
        <View style={[sq.chemMini, { borderColor: team.chemistry >= 70 ? C.lime : C.orange }]}>
          <Text style={[sq.chemMiniTxt, { color: team.chemistry >= 70 ? C.lime : C.orange }]}>{team.chemistry}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SquadScreen({ data, onOpenTeam, onOpenChat, onManageLineup, onOpenPlayer, onBrowseTeams, refreshing, onRefresh, isError, onRetry }) {
  if (isError) {
    return <ErrorState message={t('squad.error')} onRetry={onRetry} />;
  }
  if (!data) {
    return <SkeletonList count={3} />;
  }
  var featured = data.featuredTeam;
  var teams = data.teams || [];

  if (!featured) {
    return (
      <View style={sq.emptyRoot}>
        <Text style={sq.emptyTitle}>{t('squad.no_team_title')}</Text>
        <Text style={sq.emptySub}>{t('squad.no_team_sub')}</Text>
        <TouchableOpacity style={sq.emptyCta} onPress={onBrowseTeams} activeOpacity={0.85}>
          <Text style={sq.emptyCtaTxt}>{t('squad.no_team_cta')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  var form = (featured.recentForm || []).map(function(f) { return f.result; });
  return (
    <View style={sq.root}>
      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={sq.scroll}
        data={teams}
        keyExtractor={function(item) { return item.id; }}
        renderItem={function(info) { return <TeamCard team={info.item} isFirst={info.index === 0} onPress={onOpenTeam} />; }}
        refreshControl={
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={C.lime} colors={[C.lime]} />
        }
        ListHeaderComponent={
          <>
            {/* Screen hero */}
            <View style={sq.heroSection}>
              <View style={sq.heroGlow} />
              <Text style={sq.heroTitle}>{t('squad.hero_title')}</Text>
              <Text style={sq.heroSub}>{t('squad.hero_sub')}</Text>
            </View>
            {/* Team header card */}
            <View style={sq.featuredCard}>
              <View style={sq.featuredAccent} />
              <View style={sq.featuredTop}>
                <View style={sq.featuredInfo}>
                  <Text style={sq.featuredName}>{featured.name}</Text>
                  <Text style={sq.featuredMeta}>{featured.district}  ·  {featured.rosterSize} {t('squad.roster_suffix')}</Text>
                </View>
                <View style={sq.featuredRight}>
                  <Text style={sq.featuredRank}>{featured.ranking}</Text>
                  {form.length > 0 ? (
                    <View style={sq.formRow}>
                      {form.slice(-5).map(function(r, i) { return <FormBadge key={i} result={r} />; })}
                    </View>
                  ) : null}
                </View>
              </View>
              <ChemBar value={featured.chemistry} />
              {featured.stats && featured.stats.length > 0 ? (
                <View style={sq.featuredStats}>
                  {featured.stats.map(function(st, i) {
                    return (
                      <View key={st.label} style={[sq.featuredStat, i > 0 && sq.featuredStatDiv]}>
                        <Text style={sq.featuredStatVal}>{st.value}</Text>
                        <Text style={sq.featuredStatLbl}>{st.label}</Text>
                      </View>
                    );
                  })}
                </View>
              ) : null}
              <View style={sq.featuredActions}>
                <TouchableOpacity style={sq.chatBtn} onPress={onOpenChat} activeOpacity={0.85}>
                  <Text style={sq.chatBtnTxt}>{t('squad.chat_btn')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={sq.lineupBtn} onPress={onManageLineup} activeOpacity={0.85}>
                  <Text style={sq.lineupBtnTxt}>{t('squad.lineup_btn')}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Roster */}
            {featured.roster && featured.roster.length > 0 ? (
              <View style={sq.section}>
                <SectionHead num={1} title={t('squad.section_roster')} />
                <View style={sq.rosterCard}>
                  {featured.roster.map(function(player, index) {
                    return <RosterRow key={player.id || index} player={player} index={index} onPress={function() { if (onOpenPlayer) onOpenPlayer(player); }} />;
                  })}
                </View>
              </View>
            ) : null}
            {teams.length > 0 ? (
              <View style={sq.sectionHead}>
                <Text style={sq.sectionNum}>02</Text>
                <View style={sq.sectionLine} />
                <Text style={sq.sectionLabel}>{t('squad.section_teams')}</Text>
              </View>
            ) : null}
          </>
        }
        ListFooterComponent={<View style={{ height: 120 }} />}
      />
    </View>
  );
}

const sq = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  loadingNum: { color: C.lime, fontSize: 48, fontWeight: '900', letterSpacing: 4, opacity: 0.2 },
  loadingTxt: { color: C.textDim, fontSize: F.xs, letterSpacing: 4, fontWeight: '800' },
  scroll: { padding: S.screen },
  // Section headers
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: S.base },
  sectionNum: { color: C.lime, fontSize: 11, fontWeight: '900', letterSpacing: 1, minWidth: 20 },
  sectionLine: { width: 1, height: 14, backgroundColor: C.border },
  sectionLabel: { flex: 1, color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 2 },
  sectionAction: { color: C.orange, fontSize: F.xs, fontWeight: '700' },
  section: { marginBottom: S.x2 },
  emptyRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: S.screen, gap: S.md },
  emptyTitle: { color: C.text, fontSize: F.xl, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center' },
  emptySub: { color: C.textDim, fontSize: F.sm, textAlign: 'center', lineHeight: 20 },
  emptyCta: { marginTop: S.sm, backgroundColor: C.lime, paddingHorizontal: S.lg, paddingVertical: 14, borderRadius: R.md },
  emptyCtaTxt: { color: '#000', fontSize: F.sm, fontWeight: '900', letterSpacing: 2 },
  // Hero section
  heroSection: { paddingTop: S.md, paddingBottom: S.lg, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: C.orange, opacity: 0.07 },
  heroTitle: { color: C.orange, fontSize: F.x5, fontWeight: '900', fontStyle: 'italic', lineHeight: F.x5 * 1.05, letterSpacing: -0.5 },
  heroSub: { color: C.text, fontSize: F.xs, fontWeight: '800', fontStyle: 'italic', letterSpacing: 2.5, marginTop: S.xs, opacity: 0.7 },
  // Featured team card
  featuredCard: { backgroundColor: C.bgCard, borderRadius: R.xl, padding: S.lg, marginBottom: S.x2, borderWidth: 1, borderColor: 'rgba(200,240,0,0.2)', overflow: 'hidden' },
  featuredAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: C.lime },
  featuredTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: S.lg, marginTop: S.sm },
  featuredInfo: {},
  featuredName: { color: C.text, fontSize: F.x2, fontWeight: '900', letterSpacing: 0.3, marginBottom: 4 },
  featuredMeta: { color: C.textDim, fontSize: F.sm },
  featuredRight: { alignItems: 'flex-end', gap: 6 },
  featuredRank: { color: C.lime, fontSize: F.xs, fontWeight: '800', letterSpacing: 1.5 },
  // Chemistry bar
  chemBlock: { marginBottom: S.lg },
  chemRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  chemLabel: { flex: 1, color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 1.5 },
  chemVal: { fontSize: 28, fontWeight: '900' },
  chemPct: { color: C.textDim, fontSize: F.sm, fontWeight: '700', marginLeft: 2 },
  chemTrack: { height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' },
  chemFill: { height: '100%', borderRadius: 3 },
  formRow: { flexDirection: 'row', gap: 4 },
  formBadge: { width: 20, height: 20, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  formTxt: { color: '#fff', fontSize: 9, fontWeight: '900' },
  // Featured stats
  featuredStats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.border, paddingTop: S.md, marginTop: S.sm, marginBottom: S.md },
  featuredStat: { flex: 1, alignItems: 'center' },
  featuredStatDiv: { borderLeftWidth: 1, borderLeftColor: C.border },
  featuredStatVal: { color: C.text, fontSize: F.xl, fontWeight: '900', marginBottom: 3 },
  featuredStatLbl: { color: C.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  // Actions
  featuredActions: { flexDirection: 'row', gap: S.sm, marginTop: S.sm },
  chatBtn: { flex: 1, backgroundColor: C.bgCard2, borderRadius: R.sm, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  chatBtnTxt: { color: C.text, fontSize: F.xs, fontWeight: '800', letterSpacing: 1 },
  lineupBtn: { flex: 2, backgroundColor: C.orange, borderRadius: R.sm, paddingVertical: 12, alignItems: 'center' },
  lineupBtnTxt: { color: '#fff', fontSize: F.xs, fontWeight: '900', letterSpacing: 1.5 },
  // Roster
  rosterCard: { backgroundColor: C.bgCard, borderRadius: R.xl, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  rosterRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingHorizontal: S.base, paddingVertical: S.md },
  rosterBorder: { borderTopWidth: 1, borderTopColor: C.border },
  rosterIdx: { color: C.lime, fontSize: 11, fontWeight: '900', letterSpacing: 1, minWidth: 24 },
  rosterAvatar: { width: 38, height: 38, borderRadius: R.full, backgroundColor: C.bgCard2 },
  rosterInfo: { flex: 1 },
  rosterName: { color: C.text, fontSize: F.sm, fontWeight: '800', marginBottom: 2 },
  rosterArch: { color: C.orange, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  rosterStats: { flexDirection: 'row', gap: S.md },
  rosterStat: { alignItems: 'center' },
  rosterStatVal: { color: C.text, fontSize: F.sm, fontWeight: '900' },
  rosterStatLbl: { color: C.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  // Team list
  teamCard: { backgroundColor: C.bgCard, borderRadius: R.lg, padding: S.base, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  teamCardFeatured: { borderColor: 'rgba(200,240,0,0.3)' },
  teamCardAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: C.lime },
  teamCardLeft: { flex: 1, paddingLeft: S.sm },
  teamName: { color: C.text, fontSize: F.sm, fontWeight: '800', marginBottom: 3 },
  teamNameFeatured: { color: C.lime },
  teamMeta: { color: C.textDim, fontSize: 10 },
  teamCardRight: { alignItems: 'flex-end', gap: 5 },
  teamRank: { color: C.textDim, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  teamRankFeatured: { color: C.lime },
  chemMini: { borderRadius: R.sm, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  chemMiniTxt: { fontSize: 10, fontWeight: '900' },
});
