
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { C, F, R, S } from '../theme';

function HeroCard({ match, onPress }) {
  if (!match) return null;
  var filled = match.playersJoined;
  var total = match.capacity;
  var pct = total > 0 ? (filled / total) : 0;
  var spotsLeft = total - filled;
  return (
    <TouchableOpacity style={h.hero} onPress={function() { onPress(match); }} activeOpacity={0.92}>
      <Image source={{ uri: match.image }} style={h.heroImg} />
      <View style={h.heroDim} />
      <View style={h.heroContent}>
        <View style={h.heroPillRow}>
          {match.status === 'live' ? (
            <View style={h.livePill}>
              <View style={h.liveDot} />
              <Text style={h.liveTxt}>CANLI</Text>
            </View>
          ) : match.status === 'streaking' ? (
            <View style={h.hotPill}><Text style={h.hotTxt}>🔥 AKTIF</Text></View>
          ) : null}
          <View style={h.skillPill}><Text style={h.skillTxt}>{match.skillLevel}</Text></View>
        </View>
        <Text style={h.heroTitle} numberOfLines={2}>{match.title}</Text>
        <Text style={h.heroSub}>{match.courtName}  ·  {match.district}  ·  {match.distance}</Text>
        <View style={h.heroMiniRow}>
          <View style={h.miniBox}>
            <Text style={h.miniLabel}>KATILIM</Text>
            <Text style={h.miniVal}>{match.feeType === 'Ucretli' ? match.fee + ' ₺' : 'ÜCRETSİZ'}</Text>
          </View>
          <View style={h.miniBox}>
            <Text style={h.miniLabel}>FORMAT</Text>
            <Text style={h.miniVal}>{match.format}</Text>
          </View>
          <View style={h.miniBox}>
            <Text style={h.miniLabel}>SAAT</Text>
            <Text style={h.miniVal}>{match.dateTime}</Text>
          </View>
        </View>
        <View style={h.progressTrack}>
          <View style={[h.progressFill, { width: (Math.round(pct * 100)) + '%' }]} />
        </View>
        <View style={h.progressMeta}>
          <Text style={h.progressTxt}>{filled} / {total} OYUNCU</Text>
          <Text style={h.spotsTxt}>{spotsLeft} yer kaldı</Text>
        </View>
        <TouchableOpacity style={h.joinBtn} onPress={function() { onPress(match); }} activeOpacity={0.85}>
          <Text style={h.joinTxt}>{match.cta || 'OYUNA GİR'}  →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function SectionHead({ title, actionLabel, onAction }) {
  return (
    <View style={h.sectionHead}>
      <Text style={h.sectionLabel}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={h.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function ActivityItem({ item }) {
  return (
    <View style={h.actItem}>
      <Image source={{ uri: item.avatar }} style={h.actAvatar} />
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

function CourtCard({ court, onPress }) {
  return (
    <TouchableOpacity style={h.courtCard} onPress={function() { onPress(court.featuredMatch); }} activeOpacity={0.88}>
      <Image source={{ uri: court.image }} style={h.courtImg} />
      <View style={h.courtDim} />
      <View style={h.courtBody}>
        <Text style={h.courtHeat}>{court.heat}</Text>
        <Text style={h.courtName}>{court.name}</Text>
        <Text style={h.courtMeta}>{court.distance}  ·  {court.type}</Text>
      </View>
    </TouchableOpacity>
  );
}

function UrgentCard({ match, onPress }) {
  return (
    <TouchableOpacity style={h.urgentCard} onPress={function() { onPress(match); }} activeOpacity={0.88}>
      <View style={h.urgentLeft}>
        {match.urgency ? (
          <View style={h.urgentPill}>
            <View style={h.urgentDot} />
            <Text style={h.urgentPillTxt}>{match.urgency}</Text>
          </View>
        ) : null}
        <Text style={h.urgentTitle} numberOfLines={1}>{match.title}</Text>
        <Text style={h.urgentMeta}>{match.district}  ·  {match.format}</Text>
      </View>
      <View style={h.urgentRight}>
        {match.rank ? <Text style={h.urgentRank}>{match.rank}</Text> : null}
        {match.spots ? <Text style={h.urgentSpots}>{match.spots}</Text> : null}
        <View style={h.urgentCTA}>
          <Text style={h.urgentCTATxt}>{match.cta || 'GİR'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ProBanner({ onUpgrade }) {
  return (
    <TouchableOpacity style={h.proBanner} onPress={onUpgrade} activeOpacity={0.9}>
      <Text style={h.proTag}>⭐  PRO AVANTAJ</Text>
      <Text style={h.proTitle}>Sahneye Çık. Fark Yarat.</Text>
      <Text style={h.proSub}>Gelişmiş istatistikler, öncelikli saha erişimi, rakip analizi ve çok daha fazlası.</Text>
      <View style={h.proBtn}><Text style={h.proBtnTxt}>YÜKSELT  →</Text></View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ data, onOpenMatch, onOpenActivity, onCreateRun, onUpgradePro }) {
  if (!data) {
    return (
      <View style={h.empty}>
        <Text style={h.emptyTxt}>YÜKLENIYOR...</Text>
      </View>
    );
  }
  return (
    <View style={h.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={h.scroll}>
        <HeroCard match={data.heroMatch} onPress={onOpenMatch} />
        <View style={h.section}>
          <SectionHead title="EKİP AKTİVİTESİ" actionLabel="TÜMÜNÜ GÖR" onAction={onOpenActivity} />
          <View style={h.actCard}>
            {(data.squadActivity || []).map(function(item) {
              return <ActivityItem key={item.id} item={item} />;
            })}
          </View>
        </View>
        <View style={h.section}>
          <SectionHead title="POPÜLER SAHALAR" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={h.hPad}>
            {(data.trendingCourts || []).map(function(court) {
              return <CourtCard key={court.id} court={court} onPress={onOpenMatch} />;
            })}
            <View style={{ width: S.screen }} />
          </ScrollView>
        </View>
        {data.urgentRuns && data.urgentRuns.length > 0 ? (
          <View style={h.section}>
            <SectionHead title="ACİL MAÇLAR" />
            {data.urgentRuns.map(function(run) {
              return <UrgentCard key={run.id} match={run} onPress={onOpenMatch} />;
            })}
          </View>
        ) : null}
        <ProBanner onUpgrade={onUpgradePro} />
        <View style={{ height: 120 }} />
      </ScrollView>
      <TouchableOpacity style={h.fab} onPress={onCreateRun} activeOpacity={0.85}>
        <Text style={h.fabTxt}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const h = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTxt: { color: C.textDim, fontSize: F.xs, letterSpacing: 3, fontWeight: '700' },
  scroll: { paddingBottom: 40 },
  hero: { height: 460, position: 'relative', overflow: 'hidden', marginBottom: S.md },
  heroImg: StyleSheet.absoluteFillObject,
  heroDim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.58)' },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: S.screen, paddingBottom: S.xl },
  heroPillRow: { flexDirection: 'row', gap: S.sm, marginBottom: S.md },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.orange, borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveTxt: { color: '#fff', fontSize: F.xs, fontWeight: '900', letterSpacing: 1.5 },
  hotPill: { backgroundColor: 'rgba(200,240,0,0.18)', borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(200,240,0,0.35)' },
  hotTxt: { color: C.lime, fontSize: F.xs, fontWeight: '800', letterSpacing: 1 },
  skillPill: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  skillTxt: { color: 'rgba(255,255,255,0.85)', fontSize: F.xs, fontWeight: '700' },
  heroTitle: { color: '#fff', fontSize: 30, fontWeight: '900', letterSpacing: 0.2, marginBottom: 6, lineHeight: 36 },
  heroSub: { color: 'rgba(255,255,255,0.6)', fontSize: F.sm, marginBottom: S.base, fontWeight: '500' },
  heroMiniRow: { flexDirection: 'row', gap: S.sm, marginBottom: S.md },
  miniBox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: R.sm, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  miniLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  miniVal: { color: '#fff', fontSize: F.xs, fontWeight: '800' },
  progressTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden', marginBottom: S.sm },
  progressFill: { height: '100%', backgroundColor: C.lime, borderRadius: 2 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: S.base },
  progressTxt: { color: 'rgba(255,255,255,0.65)', fontSize: F.xs, fontWeight: '600' },
  spotsTxt: { color: C.lime, fontSize: F.xs, fontWeight: '800' },
  joinBtn: { backgroundColor: C.lime, borderRadius: R.md, paddingVertical: 15, alignItems: 'center' },
  joinTxt: { color: '#000', fontSize: F.sm, fontWeight: '900', letterSpacing: 2 },
  section: { paddingHorizontal: S.screen, marginBottom: S.x2 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: S.base },
  sectionLabel: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 2.5 },
  sectionAction: { color: C.orange, fontSize: F.xs, fontWeight: '700', letterSpacing: 1 },
  actCard: { backgroundColor: C.bgCard, borderRadius: R.lg, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  actItem: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingHorizontal: S.base, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: C.border },
  actAvatar: { width: 40, height: 40, borderRadius: R.full, backgroundColor: C.bgCard2 },
  actBody: { flex: 1 },
  actTxt: { fontSize: F.sm, lineHeight: 18 },
  actUser: { color: C.text, fontWeight: '700' },
  actAction: { color: C.textDim },
  actHL: { color: C.lime, fontWeight: '700' },
  actMeta: { color: C.textDim, fontSize: 10, marginTop: 3 },
  actArrow: { color: C.textDim, fontSize: 22 },
  hPad: { paddingLeft: S.screen },
  courtCard: { width: 200, height: 140, borderRadius: R.lg, marginRight: S.sm, overflow: 'hidden' },
  courtImg: StyleSheet.absoluteFillObject,
  courtDim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  courtBody: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: S.md },
  courtHeat: { color: C.lime, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 3 },
  courtName: { color: '#fff', fontSize: F.sm, fontWeight: '900', marginBottom: 2 },
  courtMeta: { color: 'rgba(255,255,255,0.65)', fontSize: 10 },
  urgentCard: { backgroundColor: C.bgCard, borderRadius: R.lg, paddingHorizontal: S.base, paddingVertical: S.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm, borderWidth: 1, borderColor: C.border },
  urgentLeft: { flex: 1, paddingRight: S.sm },
  urgentPill: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  urgentDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.orange },
  urgentPillTxt: { color: C.orange, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  urgentTitle: { color: C.text, fontSize: F.sm, fontWeight: '900', marginBottom: 3 },
  urgentMeta: { color: C.textDim, fontSize: 10 },
  urgentRight: { alignItems: 'flex-end', gap: 5 },
  urgentRank: { color: C.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  urgentSpots: { color: C.text, fontSize: F.xs, fontWeight: '800' },
  urgentCTA: { backgroundColor: C.orange, borderRadius: R.sm, paddingHorizontal: 14, paddingVertical: 8 },
  urgentCTATxt: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  proBanner: { marginHorizontal: S.screen, backgroundColor: C.bgCard, borderRadius: R.xl, padding: S.xl, borderWidth: 1, borderColor: 'rgba(255,91,0,0.3)' },
  proTag: { color: C.orange, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5, marginBottom: S.sm },
  proTitle: { color: C.text, fontSize: 22, fontWeight: '900', marginBottom: S.sm, lineHeight: 28 },
  proSub: { color: C.textDim, fontSize: F.sm, lineHeight: 20, marginBottom: S.lg },
  proBtn: { backgroundColor: C.orange, borderRadius: R.md, alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10 },
  proBtnTxt: { color: '#fff', fontSize: F.sm, fontWeight: '900', letterSpacing: 1.5 },
  fab: { position: 'absolute', bottom: 88, right: S.screen, width: 56, height: 56, borderRadius: R.full, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center', shadowColor: C.lime, shadowOpacity: 0.35, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 8 },
  fabTxt: { color: '#000', fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
