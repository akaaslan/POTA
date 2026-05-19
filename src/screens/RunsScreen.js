
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { C, F, R, S } from '../theme';

function FilterPill({ label, value, onPress }) {
  var active = value !== 'Tümü' && value !== undefined;
  return (
    <TouchableOpacity style={[r.pill, active && r.pillActive]} onPress={onPress} activeOpacity={0.8}>
      <Text style={[r.pillTxt, active && r.pillTxtActive]}>{active ? value : label}</Text>
      <Text style={[r.pillArrow, active && r.pillArrowActive]}>▾</Text>
    </TouchableOpacity>
  );
}

function RunCard({ match, onPress }) {
  var filled = match.playersJoined;
  var total = match.capacity;
  var pct = total > 0 ? (filled / total) : 0;
  var spotsLeft = total - filled;
  return (
    <TouchableOpacity style={r.card} onPress={function() { onPress(match); }} activeOpacity={0.88}>
      <Image source={{ uri: match.image }} style={r.thumb} />
      <View style={r.cardBody}>
        <View style={r.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={r.cardTitle} numberOfLines={1}>{match.title}</Text>
            <Text style={r.cardMeta}>{match.district}  ·  {match.skillLevel}  ·  {match.format}</Text>
          </View>
          {match.status === 'live' ? (
            <View style={r.liveBadge}><Text style={r.liveBadgeTxt}>CANLI</Text></View>
          ) : match.status === 'streaking' ? (
            <View style={r.hotBadge}><Text style={r.hotBadgeTxt}>🔥</Text></View>
          ) : null}
        </View>
        <View style={r.cardBottom}>
          <View style={r.progressCol}>
            <View style={r.progressTrack}>
              <View style={[r.progressFill, { width: (Math.round(pct * 100)) + '%' }]} />
            </View>
            <Text style={r.playersTxt}>{filled}/{total}  ·  {spotsLeft} yer kaldı</Text>
          </View>
          <View style={r.cardRight}>
            <Text style={r.feeTxt}>{match.feeType === 'Ucretli' ? match.fee + ' ₺' : 'ÜCRETSİZ'}</Text>
            <TouchableOpacity style={r.joinBtn} onPress={function() { onPress(match); }}>
              <Text style={r.joinBtnTxt}>OYUNA GİR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ hasFilters, onReset }) {
  return (
    <View style={r.empty}>
      <Text style={r.emptyIcon}>🏀</Text>
      <Text style={r.emptyTitle}>{hasFilters ? 'Filtrene Uyan Maç Yok' : 'Henüz Maç Yok'}</Text>
      <Text style={r.emptySub}>{hasFilters ? 'Farklı bölge veya seviye dene.' : 'Yeni bir maç oluştur veya yakında tekrar bak.'}</Text>
      {hasFilters ? (
        <TouchableOpacity style={r.emptyBtn} onPress={onReset}>
          <Text style={r.emptyBtnTxt}>FİLTRELERİ TEMİZLE</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function RunsScreen({ data, activeFilters, onOpenMatch, onCreateRun, onOpenFilter }) {
  var filters = activeFilters || { district: 'Tümü', skill: 'Tümü', format: 'Tümü' };
  var matches = data ? (data.matches || []) : null;
  var hasFilters = filters.district !== 'Tümü' || filters.skill !== 'Tümü' || filters.format !== 'Tümü';

  function clearFilters() { onOpenFilter(null); }

  return (
    <View style={r.root}>
      <View style={r.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={r.filterScroll}>
          <FilterPill label="BÖLGE" value={filters.district} onPress={function() { onOpenFilter('district'); }} />
          <FilterPill label="SEVİYE" value={filters.skill} onPress={function() { onOpenFilter('skill'); }} />
          <FilterPill label="FORMAT" value={filters.format} onPress={function() { onOpenFilter('format'); }} />
        </ScrollView>
      </View>
      {matches === null ? (
        <View style={r.loading}><ActivityIndicator size="large" color={C.orange} /></View>
      ) : matches.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onReset={clearFilters} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={r.scroll}>
          <View style={r.countRow}>
            <Text style={r.countTxt}>{matches.length} MAÇ BULUNDU</Text>
            {hasFilters ? <View style={r.activeFilterDot} /> : null}
          </View>
          {matches.map(function(match) {
            return <RunCard key={match.id} match={match} onPress={onOpenMatch} />;
          })}
          <View style={r.promoBanner}>
            <Text style={r.promoTag}>PRO ÖZELLİĞİ</Text>
            <Text style={r.promoTitle}>Maçlara 10 Dakika Önce Eriş</Text>
            <Text style={r.promoSub}>Pro üyeler yeni maçlara erken erişim, öncelikli yer ayırma hakkı kazanır.</Text>
            <View style={r.promoBtn}><Text style={r.promoBtnTxt}>YERİNİ KAPAT  →</Text></View>
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>
      )}
      <TouchableOpacity style={r.fab} onPress={onCreateRun} activeOpacity={0.85}>
        <Text style={r.fabTxt}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const r = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  filterBar: { backgroundColor: C.bgPanel, borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: S.sm },
  filterScroll: { paddingHorizontal: S.screen, gap: S.sm, flexDirection: 'row' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.bgCard, borderRadius: R.full, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  pillActive: { backgroundColor: 'rgba(255,91,0,0.1)', borderColor: C.orange },
  pillTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '700', letterSpacing: 0.5 },
  pillTxtActive: { color: C.orange },
  pillArrow: { color: C.textDim, fontSize: 10 },
  pillArrowActive: { color: C.orange },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: S.screen },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: S.base },
  countTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5 },
  activeFilterDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.orange },
  card: { backgroundColor: C.bgCard, borderRadius: R.lg, marginBottom: S.md, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  thumb: { width: '100%', height: 160 },
  cardBody: { padding: S.base },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: S.sm },
  cardTitle: { color: C.text, fontSize: F.md, fontWeight: '900', letterSpacing: 0.2, marginBottom: 3 },
  cardMeta: { color: C.textDim, fontSize: F.xs },
  liveBadge: { backgroundColor: C.orange, borderRadius: R.sm, paddingHorizontal: 8, paddingVertical: 4, marginLeft: S.sm },
  liveBadgeTxt: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  hotBadge: { backgroundColor: 'rgba(200,240,0,0.12)', borderRadius: R.sm, paddingHorizontal: 8, paddingVertical: 4, marginLeft: S.sm },
  hotBadgeTxt: { fontSize: 14 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: S.sm },
  progressCol: { flex: 1 },
  progressTrack: { height: 3, backgroundColor: C.border, borderRadius: 2, overflow: 'hidden', marginBottom: 5 },
  progressFill: { height: '100%', backgroundColor: C.lime, borderRadius: 2 },
  playersTxt: { color: C.textDim, fontSize: 10, fontWeight: '500' },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  feeTxt: { color: C.lime, fontSize: F.sm, fontWeight: '800' },
  joinBtn: { backgroundColor: C.orange, borderRadius: R.sm, paddingHorizontal: 14, paddingVertical: 7 },
  joinBtnTxt: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: S.x3 },
  emptyIcon: { fontSize: 48, marginBottom: S.base },
  emptyTitle: { color: C.text, fontSize: F.lg, fontWeight: '900', marginBottom: S.sm, textAlign: 'center' },
  emptySub: { color: C.textDim, fontSize: F.sm, textAlign: 'center', lineHeight: 20 },
  emptyBtn: { marginTop: S.lg, backgroundColor: C.bgCard, borderRadius: R.md, paddingHorizontal: S.xl, paddingVertical: S.md, borderWidth: 1, borderColor: C.border },
  emptyBtnTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '700', letterSpacing: 1 },
  promoBanner: { backgroundColor: C.bgCard, borderRadius: R.xl, padding: S.lg, borderWidth: 1, borderColor: 'rgba(255,91,0,0.25)', marginBottom: S.lg },
  promoTag: { color: C.orange, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  promoTitle: { color: C.text, fontSize: F.lg, fontWeight: '900', marginBottom: 6 },
  promoSub: { color: C.textDim, fontSize: F.sm, lineHeight: 20, marginBottom: S.md },
  promoBtn: { backgroundColor: C.orange, borderRadius: R.sm, alignSelf: 'flex-start', paddingHorizontal: S.base, paddingVertical: 8 },
  promoBtnTxt: { color: '#fff', fontSize: F.xs, fontWeight: '900', letterSpacing: 1 },
  fab: { position: 'absolute', bottom: 88, right: S.screen, width: 56, height: 56, borderRadius: R.full, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center', shadowColor: C.lime, shadowOpacity: 0.35, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 8 },
  fabTxt: { color: '#000', fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
