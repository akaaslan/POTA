
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert, Share, StyleSheet, Dimensions } from 'react-native';
import type { DimensionValue } from 'react-native';
import { Image } from 'expo-image';
import { C, F, R, S } from '../theme';
import { t } from '../i18n';
import type { Match } from '../types/domain/match';

const { height: SCREEN_H } = Dimensions.get('window');

export interface MatchScorePayload {
  scoreA: number;
  scoreB: number;
  points: number;
  rebounds: number;
  assists: number;
}

interface MatchDetailSheetProps {
  match: Match | null;
  isJoined: boolean;
  joining: boolean;
  onClose: () => void;
  onJoin: (match: Match) => void;
  onLeave: (match: Match) => void;
  onReportScore: (match: Match, scores: MatchScorePayload | null) => void;
}
export default function MatchDetailSheet({ match, isJoined, joining, onClose, onJoin, onLeave, onReportScore }: MatchDetailSheetProps) {
  if (!match) return null;
  var m = match; // narrowed non-null ref for use in callbacks
  var [showScoreEntry, setShowScoreEntry] = useState(false);
  var [scoreA,   setScoreA]   = useState('');
  var [scoreB,   setScoreB]   = useState('');
  var [points,   setPoints]   = useState('');
  var [rebounds, setRebounds] = useState('');
  var [assists,  setAssists]  = useState('');

  function resetScoreForm() {
    setShowScoreEntry(false);
    setScoreA(''); setScoreB('');
    setPoints(''); setRebounds(''); setAssists('');
  }
  var filled = match.playersJoined;
  var total = match.capacity;
  var pct = total > 0 ? (filled / total) : 0;
  var spotsLeft = total - filled;

  function handleJoinPress() {
    if (m.feeType === 'Ucretli') {
      Alert.alert(
        t('matchDetail.fee_alert_title'),
        t('matchDetail.fee_alert_msg', { fee: m.fee }),
        [
          { text: t('matchDetail.fee_alert_cancel'), style: 'cancel' },
          { text: t('matchDetail.fee_alert_confirm', { fee: m.fee }), onPress: function() { onJoin(m); } },
        ]
      );
    } else {
      onJoin(m);
    }
  }
  return (
    <Modal visible={!!match} transparent animationType="slide" onRequestClose={onClose}>
      <View style={md.root}>
        <TouchableOpacity style={md.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={md.sheet}>
          <Image source={{ uri: match.image }} style={md.heroImg} contentFit="cover" cachePolicy="memory-disk" />
          <View style={md.heroDim} />
          <TouchableOpacity style={md.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={md.closeIcon}>✕</Text>
          </TouchableOpacity>
          <ScrollView style={md.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={md.scroll}>
            <View style={md.pillRow}>
              {match.status === 'live' ? (
                <View style={md.livePill}><View style={md.liveDot} /><Text style={md.liveTxt}>{t('matchDetail.status_live')}</Text></View>
              ) : match.status === 'streaking' ? (
                <View style={md.hotPill}><Text style={md.hotTxt}>{t('matchDetail.status_active')}</Text></View>
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
                <Text style={md.sectionLbl}>{t('matchDetail.section_players')}</Text>
                <Text style={md.sectionVal}>{filled} / {total}</Text>
              </View>
              <View style={md.progressTrack}>
                <View style={[md.progressFill, { width: (Math.round(pct * 100) + '%') as DimensionValue }]} />
              </View>
              <Text style={md.spotsTxt}>{spotsLeft} {t('matchDetail.spots_left')}</Text>
            </View>
            <View style={md.divider} />
            <View style={md.feeSection}>
              <Text style={md.sectionLbl}>{t('matchDetail.section_fee')}</Text>
              <Text style={md.feeVal}>{match.feeType === 'Ucretli' ? match.fee + ' ₺' : t('matchDetail.fee_free')}</Text>
            </View>
            <View style={md.divider} />
            <View style={md.hostSection}>
              <Text style={md.sectionLbl}>{t('matchDetail.section_host')}</Text>
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
                  <Text style={md.sectionLbl}>{t('matchDetail.section_desc')}</Text>
                  <Text style={md.descTxt}>{match.description}</Text>
                </View>
              </View>
            ) : null}
            <View style={{ height: S.lg }} />
          </ScrollView>
          <View style={md.footer}>
            {isJoined ? (
              <>
                <View style={md.ctaRow}>
                  <View style={md.joinedPill}><Text style={md.joinedTxt}>{t('matchDetail.joined_badge')}</Text></View>
                  <TouchableOpacity style={md.leaveBtn} onPress={function() { onLeave(m); }} disabled={!!joining} activeOpacity={0.85}>
                    {joining ? <ActivityIndicator size="small" color={C.red} /> : <Text style={md.leaveTxt}>{t('matchDetail.leave_btn')}</Text>}
                  </TouchableOpacity>
                </View>
                {m.status === 'live' ? (
                  showScoreEntry ? (
                    <View style={md.scoreEntry}>
                      <Text style={md.scoreLbl}>{t('matchDetail.score_label')}</Text>
                      {/* Maç skoru */}
                      <View style={md.scoreRow}>
                        <TextInput style={md.scoreInput} value={scoreA} onChangeText={setScoreA} keyboardType="number-pad" maxLength={3} placeholder="0" placeholderTextColor={C.textMuted} />
                        <Text style={md.scoreSep}>–</Text>
                        <TextInput style={md.scoreInput} value={scoreB} onChangeText={setScoreB} keyboardType="number-pad" maxLength={3} placeholder="0" placeholderTextColor={C.textMuted} />
                      </View>
                      {/* Kişisel istatistikler */}
                      <Text style={[md.scoreLbl, { marginTop: S.sm }]}>KİŞİSEL İSTATİSTİKLER</Text>
                      <View style={md.statsRow}>
                        <View style={md.statInputWrap}>
                          <Text style={md.statInputLbl}>SAY</Text>
                          <TextInput style={md.statInput} value={points}   onChangeText={setPoints}   keyboardType="number-pad" maxLength={3} placeholder="0" placeholderTextColor={C.textMuted} />
                        </View>
                        <View style={md.statInputWrap}>
                          <Text style={md.statInputLbl}>RİB</Text>
                          <TextInput style={md.statInput} value={rebounds} onChangeText={setRebounds} keyboardType="number-pad" maxLength={3} placeholder="0" placeholderTextColor={C.textMuted} />
                        </View>
                        <View style={md.statInputWrap}>
                          <Text style={md.statInputLbl}>ASİST</Text>
                          <TextInput style={md.statInput} value={assists}  onChangeText={setAssists}  keyboardType="number-pad" maxLength={3} placeholder="0" placeholderTextColor={C.textMuted} />
                        </View>
                      </View>
                      <View style={md.scoreActions}>
                        <TouchableOpacity style={md.scoreCancelBtn} onPress={resetScoreForm} activeOpacity={0.8}>
                          <Text style={md.scoreCancelTxt}>{t('matchDetail.report_cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[md.scoreSubmitBtn, (!scoreA || !scoreB) && md.scoreSubmitDisabled]}
                          disabled={!scoreA || !scoreB}
                          onPress={function() {
                            onReportScore(m, {
                              scoreA:   parseInt(scoreA)   || 0,
                              scoreB:   parseInt(scoreB)   || 0,
                              points:   parseInt(points)   || 0,
                              rebounds: parseInt(rebounds) || 0,
                              assists:  parseInt(assists)  || 0,
                            });
                            resetScoreForm();
                          }}
                          activeOpacity={0.85}
                        >
                          <Text style={md.scoreSubmitTxt}>{t('matchDetail.score_submit')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity style={md.reportBtn} onPress={function() { setShowScoreEntry(true); }} activeOpacity={0.85}>
                      <Text style={md.reportTxt}>{t('matchDetail.report_btn')}</Text>
                    </TouchableOpacity>
                  )
                ) : null}
              </>
            ) : (
              <TouchableOpacity style={md.joinBtn} onPress={handleJoinPress} disabled={!!joining || spotsLeft === 0} activeOpacity={0.85}>
                {joining ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={md.joinTxt}>{spotsLeft === 0 ? t('matchDetail.full_btn') : t('matchDetail.join_btn')}</Text>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity style={md.shareBtn} onPress={function() {
              Share.share({
                message: m.title + ' — POTA\n' + m.courtName + ', ' + m.district + '\n' + m.dateTime,
                title: m.title,
              });
            }} activeOpacity={0.85}>
              <Text style={md.shareTxt}>{t('matchDetail.share_btn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const md = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { height: SCREEN_H * 0.9, backgroundColor: C.bgCard, borderTopLeftRadius: R.x2, borderTopRightRadius: R.x2, overflow: 'hidden', flexDirection: 'column' },
  heroImg: { width: '100%', height: 220, position: 'absolute', top: 0 },
  heroDim: { position: 'absolute', top: 0, left: 0, right: 0, height: 220, backgroundColor: 'rgba(0,0,0,0.35)' },
  closeBtn: { position: 'absolute', top: S.base, right: S.base, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', width: 36, height: 36, borderRadius: R.full, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { color: '#fff', fontSize: F.base, fontWeight: '700' },
  scroll: { marginTop: 200, backgroundColor: C.bgCard, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, padding: S.screen, paddingTop: S.lg },
  scrollView: { flex: 1 },
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
  joinBtn: { backgroundColor: C.orange, borderRadius: R.md, paddingVertical: 16, alignItems: 'center' },
  joinTxt: { color: '#fff', fontSize: F.sm, fontWeight: '900', letterSpacing: 2 },
  reportBtn: { marginTop: S.sm, borderWidth: 1, borderColor: C.lime, borderRadius: R.md, paddingVertical: 12, alignItems: 'center' },
  reportTxt: { color: C.lime, fontSize: F.xs, fontWeight: '900', letterSpacing: 2 },  scoreEntry: { marginTop: S.sm, backgroundColor: C.bgCard2, borderRadius: R.md, padding: S.md, borderWidth: 1, borderColor: C.border },
  scoreLbl: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 2, textAlign: 'center', marginBottom: S.sm },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.md, marginBottom: S.md },
  scoreInput: { width: 72, height: 52, backgroundColor: C.bgPanel, borderRadius: R.sm, borderWidth: 1, borderColor: C.borderLight, color: C.text, fontSize: F.x2, fontWeight: '900', textAlign: 'center' },
  scoreSep: { color: C.textDim, fontSize: F.x2, fontWeight: '300' },
  scoreActions: { flexDirection: 'row', gap: S.sm },
  scoreCancelBtn: { flex: 1, borderRadius: R.sm, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  scoreCancelTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '700' },
  scoreSubmitBtn: { flex: 2, borderRadius: R.sm, paddingVertical: 10, alignItems: 'center', backgroundColor: C.lime },
  scoreSubmitDisabled: { opacity: 0.4 },
  scoreSubmitTxt: { color: '#000', fontSize: F.xs, fontWeight: '900', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', gap: S.sm, marginBottom: S.md },
  statInputWrap: { flex: 1, alignItems: 'center' },
  statInputLbl: { color: C.textDim, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  statInput: { width: '100%', height: 40, backgroundColor: C.bgPanel, borderRadius: R.sm, borderWidth: 1, borderColor: C.borderLight, color: C.text, fontSize: F.md, fontWeight: '900', textAlign: 'center' },
  shareBtn: { marginTop: S.sm, borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 10, alignItems: 'center' },
  shareTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5 },
  footer: { borderTopWidth: 1, borderTopColor: C.border, paddingHorizontal: S.screen, paddingTop: S.md, paddingBottom: 30, backgroundColor: C.bgCard },
});
