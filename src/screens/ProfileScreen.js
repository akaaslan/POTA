
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { C, F, R, S } from '../theme';

var TIER_COLORS = { HOF: '#FFD700', GOLD: '#FFA500', SILVER: '#A8A9AD', BRONZE: '#CD7F32' };

function ProfileHeader({ profile }) {
  return (
    <View style={p.profileCard}>
      <View style={p.profileLeft}>
        <View style={p.jerseyBubble}>
          <Text style={p.jerseyNum}>{profile.jerseyNumber || '34'}</Text>
        </View>
        <View style={p.profileInfo}>
          <Text style={p.nickname}>{profile.nickname}</Text>
          <Text style={p.archetype}>{profile.archetype}</Text>
          <View style={p.profileMeta}>
            <Text style={p.metaChip}>{profile.district}</Text>
            <Text style={p.metaSep}>·</Text>
            <Text style={p.metaRank}>{profile.rank}</Text>
          </View>
        </View>
      </View>
      <Text style={p.profileUid}>{profile.uid}</Text>
    </View>
  );
}

function RepBar({ profile }) {
  return (
    <View style={p.repBar}>
      <View style={p.repItem}>
        <Text style={p.repVal}>{profile.playerRep}</Text>
        <Text style={p.repLbl}>OYUNCU REP</Text>
      </View>
      <View style={p.repDiv} />
      <View style={p.repItem}>
        <Text style={p.repValOrange}>{profile.streetStatus}</Text>
        <Text style={p.repLbl}>SOKAK DURUMU</Text>
      </View>
    </View>
  );
}

function StatsRow({ stats }) {
  return (
    <View style={p.statsRow}>
      {(stats || []).map(function(st, i) {
        return (
          <View key={st.label} style={[p.statItem, i > 0 && p.statDiv]}>
            <Text style={p.statVal}>{st.value}</Text>
            <Text style={p.statLbl}>{st.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function BadgeCard({ badge, onPress }) {
  var tierColor = TIER_COLORS[badge.tier] || C.textDim;
  return (
    <TouchableOpacity
      style={[p.badge, badge.active ? p.badgeActive : p.badgeDim]}
      onPress={function() { onPress(badge); }}
      activeOpacity={0.78}
    >
      <Text style={p.badgeIcon}>{badge.icon}</Text>
      <Text style={[p.badgeName, !badge.active && p.badgeNameDim]}>{badge.label}</Text>
      <View style={[p.badgeTierPill, { backgroundColor: badge.active ? tierColor + '22' : 'transparent' }]}>
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

function ResultCard({ match }) {
  var win = match.outcome === 'W';
  return (
    <View style={[p.resultCard, win ? p.resultWin : p.resultLoss]}>
      <View style={p.resultHead}>
        <View style={[p.outcomePill, { backgroundColor: win ? C.green : C.red }]}>
          <Text style={p.outcomeTxt}>{win ? 'GALİBİYET' : 'MAĞLUBİYET'}</Text>
        </View>
        <Text style={p.resultDate}>{match.date}</Text>
      </View>
      <Text style={p.resultVs}>VS. {match.versus}</Text>
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

export default function ProfileScreen({ data, historyExpanded, onToggleHistory, onOpenBadge, onUpgradePro }) {
  if (!data) {
    return <View style={p.loading}><Text style={p.loadingTxt}>YÜKLENIYOR...</Text></View>;
  }
  var profile = data.profile || {};
  var history = historyExpanded ? data.recentMatches : (data.recentMatches || []).slice(0, 3);
  return (
    <View style={p.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={p.scroll}>
        <ProfileHeader profile={profile} />
        <RepBar profile={profile} />
        <View style={p.section}>
          <Text style={p.sectionLbl}>ORTALAMA İSTATİSTİKLER</Text>
          <StatsRow stats={data.stats} />
        </View>
        <View style={p.section}>
          <Text style={p.sectionLbl}>SAHA ISISINARI</Text>
          <View style={p.heatCard}>
            <HeatGrid />
            <Text style={p.heatSub}>Maçka  ·  Caddebostan  ·  Beşiktaş</Text>
          </View>
        </View>
        <View style={p.section}>
          <Text style={p.sectionLbl}>NBA 2K ROZETLERİ</Text>
          <View style={p.badgeGrid}>
            {(data.badges || []).map(function(badge) {
              return <BadgeCard key={badge.id || badge.label} badge={badge} onPress={onOpenBadge} />;
            })}
          </View>
        </View>
        <View style={p.section}>
          <Text style={p.sectionLbl}>SON MAÇLAR</Text>
          {history.map(function(match) {
            return <ResultCard key={match.id} match={match} />;
          })}
          {!historyExpanded && data.recentMatches && data.recentMatches.length > 3 ? (
            <TouchableOpacity style={p.histBtn} onPress={onToggleHistory}>
              <Text style={p.histBtnTxt}>TÜM GEÇMİŞİ GÖR  ↓</Text>
            </TouchableOpacity>
          ) : historyExpanded ? (
            <TouchableOpacity style={p.histBtn} onPress={onToggleHistory}>
              <Text style={p.histBtnTxt}>DARALT  ↑</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={p.proBanner} onPress={onUpgradePro} activeOpacity={0.9}>
          <Text style={p.proTag}>⭐  PRO AVANTAJ</Text>
          <Text style={p.proTitle}>Detaylı Analitik. Gelişmiş Profil.</Text>
          <Text style={p.proSub}>Rakip analizi, shot chart, gelişmiş istatistikler ve özel profil rozetleri.</Text>
          <View style={p.proBtn}><Text style={p.proBtnTxt}>YÜKSELT  →</Text></View>
        </TouchableOpacity>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const p = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingTxt: { color: C.textDim, fontSize: F.xs, letterSpacing: 3, fontWeight: '700' },
  scroll: { padding: S.screen },
  profileCard: { backgroundColor: C.bgCard, borderRadius: R.xl, padding: S.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: S.md, borderWidth: 1, borderColor: C.border },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: S.base, flex: 1 },
  jerseyBubble: { width: 64, height: 64, borderRadius: R.full, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center' },
  jerseyNum: { color: '#fff', fontSize: 26, fontWeight: '900' },
  profileInfo: { flex: 1 },
  nickname: { color: C.text, fontSize: F.lg, fontWeight: '900', letterSpacing: 0.3 },
  archetype: { color: C.orange, fontSize: F.xs, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  profileMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  metaChip: { color: C.textDim, fontSize: F.xs },
  metaSep: { color: C.border },
  metaRank: { color: C.lime, fontSize: F.xs, fontWeight: '700' },
  profileUid: { color: C.textMuted, fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  repBar: { backgroundColor: C.bgCard, borderRadius: R.xl, flexDirection: 'row', marginBottom: S.lg, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  repItem: { flex: 1, padding: S.base, alignItems: 'center' },
  repDiv: { width: 1, backgroundColor: C.border },
  repVal: { color: C.text, fontSize: F.xl, fontWeight: '900', marginBottom: 5 },
  repValOrange: { color: C.orange, fontSize: F.xl, fontWeight: '900', marginBottom: 5 },
  repLbl: { color: C.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  section: { marginBottom: S.x2 },
  sectionLbl: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 2.5, marginBottom: S.base },
  statsRow: { backgroundColor: C.bgCard, borderRadius: R.xl, flexDirection: 'row', borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  statItem: { flex: 1, padding: S.base, alignItems: 'center' },
  statDiv: { borderLeftWidth: 1, borderLeftColor: C.border },
  statVal: { color: C.text, fontSize: 24, fontWeight: '900', marginBottom: 5 },
  statLbl: { color: C.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  heatCard: { backgroundColor: C.bgCard, borderRadius: R.xl, padding: S.base, borderWidth: 1, borderColor: C.border },
  heatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: S.sm },
  heatCell: { width: 32, height: 20, borderRadius: 3, backgroundColor: C.orange },
  heatSub: { color: C.textDim, fontSize: 10, textAlign: 'center' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  badge: { width: '30%', borderRadius: R.lg, padding: S.md, alignItems: 'center', borderWidth: 1 },
  badgeActive: { backgroundColor: C.bgCard, borderColor: C.lime },
  badgeDim: { backgroundColor: C.bgCard, borderColor: C.border, opacity: 0.55 },
  badgeIcon: { fontSize: 26, marginBottom: 6 },
  badgeName: { color: C.text, fontSize: 10, fontWeight: '800', textAlign: 'center', letterSpacing: 0.3, marginBottom: 5 },
  badgeNameDim: { color: C.textDim },
  badgeTierPill: { borderRadius: R.pill, paddingHorizontal: 6, paddingVertical: 2 },
  badgeTier: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  resultCard: { borderRadius: R.lg, padding: S.base, marginBottom: S.sm, borderWidth: 1, borderColor: C.border, backgroundColor: C.bgCard },
  resultWin: { borderLeftWidth: 3, borderLeftColor: C.green },
  resultLoss: { borderLeftWidth: 3, borderLeftColor: C.red },
  resultHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: S.sm },
  outcomePill: { borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 4 },
  outcomeTxt: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  resultDate: { color: C.textDim, fontSize: 10 },
  resultVs: { color: C.text, fontSize: F.md, fontWeight: '900', marginBottom: S.sm },
  resultStats: { flexDirection: 'row', gap: S.xl, marginBottom: S.sm },
  resultStat: { alignItems: 'center' },
  resultStatVal: { color: C.text, fontSize: F.lg, fontWeight: '900' },
  resultStatLbl: { color: C.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  tag: { backgroundColor: 'rgba(200,240,0,0.12)', borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(200,240,0,0.25)' },
  tagTxt: { color: C.lime, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  histBtn: { alignItems: 'center', paddingVertical: S.base, backgroundColor: C.bgCard, borderRadius: R.md, borderWidth: 1, borderColor: C.border },
  histBtnTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5 },
  proBanner: { backgroundColor: C.bgCard, borderRadius: R.xl, padding: S.xl, borderWidth: 1, borderColor: 'rgba(255,91,0,0.3)', marginBottom: S.md },
  proTag: { color: C.orange, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5, marginBottom: S.sm },
  proTitle: { color: C.text, fontSize: 20, fontWeight: '900', marginBottom: 6 },
  proSub: { color: C.textDim, fontSize: F.sm, lineHeight: 20, marginBottom: S.lg },
  proBtn: { backgroundColor: C.orange, borderRadius: R.md, alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10 },
  proBtnTxt: { color: '#fff', fontSize: F.sm, fontWeight: '900', letterSpacing: 1 },
});
