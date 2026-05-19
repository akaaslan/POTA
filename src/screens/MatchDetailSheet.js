
import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { C, F, R, S } from '../theme';

const { height: SCREEN_H } = Dimensions.get('window');

export default function MatchDetailSheet({ match, isJoined, joining, onClose, onJoin, onLeave }) {
  if (!match) return null;
  var filled = match.playersJoined;
  var total = match.capacity;
  var pct = total > 0 ? (filled / total) : 0;
  var spotsLeft = total - filled;
  return (
    <Modal visible={!!match} transparent animationType="slide" onRequestClose={onClose}>
      <View style={md.root}>
        <TouchableOpacity style={md.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={md.sheet}>
          <Image source={{ uri: match.image }} style={md.heroImg} />
          <View style={md.heroDim} />
          <TouchableOpacity style={md.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={md.closeIcon}>✕</Text>
          </TouchableOpacity>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={md.scroll}>
            <View style={md.pillRow}>
              {match.status === 'live' ? (
                <View style={md.livePill}><View style={md.liveDot} /><Text style={md.liveTxt}>CANLI</Text></View>
              ) : match.status === 'streaking' ? (
                <View style={md.hotPill}><Text style={md.hotTxt}>🔥 AKTİF</Text></View>
              ) : null}
              <View style={md.pill}><Text style={md.pillTxt}>{match.skillLevel}</Text></View>
              <View style={md.pill}><Text style={md.pillTxt}>{match.format}</Text></View>
              {match.intensity ? <View style={md.pill}><Text style={md.pillTxt}>{match.intensity}</Text></View> : null}
            </View>
            <Text style={md.title}>{match.title}</Text>
            <View style={md.metaList}>
              <View style={md.metaRow}><Text style={md.metaIcon}>📍</Text><Text style={md.metaTxt}>{match.courtName}  ·  {match.district}</Text></View>
              <View style={md.metaRow}><Text style={md.metaIcon}>📅</Text><Text style={md.metaTxt}>{match.dateTime}</Text></View>
              {match.distance ? <View style={md.metaRow}><Text style={md.metaIcon}>🗺</Text><Text style={md.metaTxt}>{match.distance}</Text></View> : null}
            </View>
            <View style={md.divider} />
            <View style={md.section}>
              <View style={md.sectionHead}>
                <Text style={md.sectionLbl}>OYUNCULAR</Text>
                <Text style={md.sectionVal}>{filled} / {total}</Text>
              </View>
              <View style={md.progressTrack}>
                <View style={[md.progressFill, { width: (Math.round(pct * 100)) + '%' }]} />
              </View>
              <Text style={md.spotsTxt}>{spotsLeft} yer kaldı</Text>
            </View>
            <View style={md.divider} />
            <View style={md.feeSection}>
              <Text style={md.sectionLbl}>KATILIM ÜCRETİ</Text>
              <Text style={md.feeVal}>{match.feeType === 'Ucretli' ? match.fee + ' ₺' : 'ÜCRETSİZ'}</Text>
            </View>
            <View style={md.divider} />
            <View style={md.hostSection}>
              <Text style={md.sectionLbl}>DÜZENLEYEN</Text>
              <View style={md.hostRow}>
                <View style={md.hostAvatar}>
                  <Text style={md.hostAvatarTxt}>{match.host ? match.host.charAt(0) : '?'}</Text>
                </View>
                <Text style={md.hostName}>{match.host}</Text>
              </View>
            </View>
            {match.description ? (
              <View>
                <View style={md.divider} />
                <View style={md.descSection}>
                  <Text style={md.sectionLbl}>AÇIKLAMA</Text>
                  <Text style={md.descTxt}>{match.description}</Text>
                </View>
              </View>
            ) : null}
            <View style={md.divider} />
            {isJoined ? (
              <View style={md.ctaRow}>
                <View style={md.joinedPill}><Text style={md.joinedTxt}>✓  KATILDINIZ</Text></View>
                <TouchableOpacity style={md.leaveBtn} onPress={function() { onLeave(match); }} disabled={!!joining} activeOpacity={0.85}>
                  {joining ? <ActivityIndicator size="small" color={C.red} /> : <Text style={md.leaveTxt}>ÇIKIYORUM</Text>}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={md.joinBtn} onPress={function() { onJoin(match); }} disabled={!!joining || spotsLeft === 0} activeOpacity={0.85}>
                {joining ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={md.joinTxt}>{spotsLeft === 0 ? 'SAHA DOLU' : 'OYUNA GİR  →'}</Text>
                )}
              </TouchableOpacity>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const md = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { height: SCREEN_H * 0.9, backgroundColor: C.bgCard, borderTopLeftRadius: R.x2, borderTopRightRadius: R.x2, overflow: 'hidden' },
  heroImg: { width: '100%', height: 220, position: 'absolute', top: 0 },
  heroDim: { position: 'absolute', top: 0, left: 0, right: 0, height: 220, backgroundColor: 'rgba(0,0,0,0.35)' },
  closeBtn: { position: 'absolute', top: S.base, right: S.base, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', width: 36, height: 36, borderRadius: R.full, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { color: '#fff', fontSize: F.base, fontWeight: '700' },
  scroll: { marginTop: 200, backgroundColor: C.bgCard, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, padding: S.screen, paddingTop: S.lg },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, marginBottom: S.md },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.orange, borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveTxt: { color: '#fff', fontSize: F.xs, fontWeight: '900', letterSpacing: 1.5 },
  hotPill: { backgroundColor: 'rgba(200,240,0,0.12)', borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(200,240,0,0.3)' },
  hotTxt: { color: C.lime, fontSize: F.xs, fontWeight: '800' },
  pill: { backgroundColor: C.bgCard2, borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: C.border },
  pillTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '600' },
  title: { color: C.text, fontSize: 26, fontWeight: '900', marginBottom: S.md, lineHeight: 32 },
  metaList: { gap: S.sm, marginBottom: S.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  metaIcon: { fontSize: 16 },
  metaTxt: { color: C.textDim, fontSize: F.sm },
  divider: { height: 1, backgroundColor: C.border, marginVertical: S.md },
  section: { marginBottom: 0 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm },
  sectionLbl: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 2 },
  sectionVal: { color: C.text, fontSize: F.sm, fontWeight: '800' },
  progressTrack: { height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: C.lime, borderRadius: 3 },
  spotsTxt: { color: C.textDim, fontSize: F.xs },
  feeSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feeVal: { color: C.lime, fontSize: F.xl, fontWeight: '900' },
  hostSection: { gap: S.sm },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  hostAvatar: { width: 36, height: 36, borderRadius: R.full, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center' },
  hostAvatarTxt: { color: '#fff', fontSize: F.sm, fontWeight: '900' },
  hostName: { color: C.text, fontSize: F.sm, fontWeight: '700' },
  descSection: { gap: S.sm },
  descTxt: { color: C.textDim, fontSize: F.sm, lineHeight: 22 },
  ctaRow: { flexDirection: 'row', gap: S.sm, alignItems: 'center' },
  joinedPill: { flex: 1, backgroundColor: 'rgba(74,222,128,0.1)', borderRadius: R.md, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: C.green },
  joinedTxt: { color: C.green, fontSize: F.sm, fontWeight: '900', letterSpacing: 1 },
  leaveBtn: { paddingHorizontal: S.xl, paddingVertical: 14, borderRadius: R.md, borderWidth: 1, borderColor: C.red },
  leaveTxt: { color: C.red, fontSize: F.sm, fontWeight: '800' },
  joinBtn: { backgroundColor: C.lime, borderRadius: R.md, paddingVertical: 16, alignItems: 'center' },
  joinTxt: { color: '#000', fontSize: F.sm, fontWeight: '900', letterSpacing: 2 },
});
