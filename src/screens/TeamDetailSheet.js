import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  FlatList,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { C, F, R, S } from '../theme';
import { t } from '../i18n';

const { height: SCREEN_H } = Dimensions.get('window');

var MOCK_INVITE_PLAYERS = [
  { id: 'inv-1', nickname: 'SKYWALKER_0', district: 'Ataşehir', ovr: 81, archetype: 'Slasher' },
  { id: 'inv-2', nickname: 'HAWK_KADIKOY', district: 'Kadıköy', ovr: 79, archetype: 'Playmaker' },
  { id: 'inv-3', nickname: 'DÜZ_MAKİNE', district: 'Beşiktaş', ovr: 76, archetype: 'Shooter' },
  { id: 'inv-4', nickname: 'MİNİK_34', district: 'Zeytinburnu', ovr: 73, archetype: 'Point Guard' },
  { id: 'inv-5', nickname: 'DEMİR_KDK', district: 'Kadıköy', ovr: 74, archetype: 'Bigs' },
  { id: 'inv-6', nickname: 'ŞİMŞEK_BSK', district: 'Beşiktaş', ovr: 81, archetype: 'Shooter' },
];

function InviteModal({ visible, onClose }) {
  var [invited, setInvited] = useState({});
  function handleInvite(player) {
    setInvited(function(prev) { return Object.assign({}, prev, { [player.id]: true }); });
  }
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={sb.invRoot}>
        <TouchableOpacity style={sb.invBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={sb.invSheet}>
          <View style={sb.invHandle} />
          <View style={sb.invHeader}>
            <Text style={sb.invTitle}>{t('teamDetail.invite_modal_title')}</Text>
            <TouchableOpacity style={sb.invCloseBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={sb.invCloseIcon}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={MOCK_INVITE_PLAYERS}
            keyExtractor={function(item) { return item.id; }}
            contentContainerStyle={sb.invList}
            showsVerticalScrollIndicator={false}
            renderItem={function(info) {
              var p = info.item;
              var sent = !!invited[p.id];
              return (
                <View style={sb.invRow}>
                  <View style={sb.invAvatar}>
                    <Text style={sb.invAvatarTxt}>{p.nickname[0]}</Text>
                  </View>
                  <View style={sb.invInfo}>
                    <Text style={sb.invName}>{p.nickname}</Text>
                    <Text style={sb.invMeta}>{p.district}  ·  {p.archetype}  ·  OVR {p.ovr}</Text>
                  </View>
                  <TouchableOpacity
                    style={[sb.invBtn, sent && sb.invBtnSent]}
                    onPress={function() { handleInvite(p); }}
                    disabled={sent}
                    activeOpacity={0.8}
                  >
                    <Text style={[sb.invBtnTxt, sent && sb.invBtnTxtSent]}>{sent ? t('teamDetail.invite_sent') : t('teamDetail.invite_send')}</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
            ItemSeparatorComponent={function() { return <View style={sb.invSep} />; }}
          />
        </View>
      </View>
    </Modal>
  );
}

function FormBadge({ result }) {
  var bg = result === 'W' ? C.green : C.red;
  return (
    <View style={[sb.formBadge, { backgroundColor: bg }]}>
      <Text style={sb.formText}>{result}</Text>
    </View>
  );
}

function RosterRow({ player, last, onPress }) {
  return (
    <TouchableOpacity style={[sb.rosterRow, !last && sb.rosterBorder]} onPress={onPress} activeOpacity={0.75}>
      <Image source={{ uri: player.avatar }} style={sb.rosterAvatar} />
      <View style={sb.rosterInfo}>
        <Text style={sb.rosterName}>{player.name}</Text>
        <Text style={sb.rosterArch}>{player.archetype}</Text>
      </View>
      <View style={sb.rosterStats}>
        {player.stats.map(function(stat) {
          return (
            <View key={stat.label} style={sb.rosterStat}>
              <Text style={sb.statVal}>{stat.value}</Text>
              <Text style={sb.statLbl}>{stat.label}</Text>
            </View>
          );
        })}
      </View>
      <Text style={sb.rosterChevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function TeamDetailSheet({ team, isJoined, joining, onClose, onJoin, onLeave, onOpenChat, onOpenPlayer }) {
  if (!team) return null;
  var [showInvite, setShowInvite] = useState(false);
  var chemBar = Math.min(100, Math.max(0, team.chemistry));

  return (
    <Modal visible={!!team} transparent animationType="slide" onRequestClose={onClose}>
      <View style={sb.root}>
        <TouchableOpacity style={sb.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={sb.sheet}>
          <View style={sb.handle} />

          {/* Header */}
          <View style={sb.topBar}>
            <TouchableOpacity style={sb.closeBtn} onPress={onClose}>
              <Text style={sb.closeIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={sb.topBadge}>{team.ranking}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={sb.scroll}>
            {/* Team Identity */}
            <View style={sb.identity}>
              <Image source={{ uri: team.logo }} style={sb.teamLogo} />
              <View style={sb.identityText}>
                <Text style={sb.teamName}>{team.name}</Text>
                <Text style={sb.teamMeta}>{team.district} • Kur. {team.established}</Text>
              </View>
              <View style={sb.rosterBadge}>
                <Text style={sb.rosterBadgeNum}>{team.rosterSize}</Text>
                <Text style={sb.rosterBadgeLbl}>{t('teamDetail.roster_suffix')}</Text>
              </View>
            </View>

            {/* Chemistry */}
            <View style={sb.chemBlock}>
              <View style={sb.chemRow}>
                <Text style={sb.chemLabel}>{t('teamDetail.section_chem')}</Text>
                <Text style={sb.chemValue}>{team.chemistry}%</Text>
              </View>
              <View style={sb.chemTrack}>
                <View style={[sb.chemFill, { width: chemBar + '%' }]} />
              </View>
            </View>

            {/* Recent Form */}
            <View style={sb.statsBlock}>
              <View style={sb.statBlockRow}>
                <View style={sb.statBlockItem}>
                  <Text style={sb.statBlockVal}>{team.offensiveRating}</Text>
                  <Text style={sb.statBlockLbl}>{t('teamDetail.section_offense')}</Text>
                  <Text style={sb.statBlockSub}>{team.offensiveRankText}</Text>
                </View>
                <View style={sb.statBlockItem}>
                  <Text style={[sb.statBlockVal, { color: C.lime }]}>{team.winStreak}W</Text>
                  <Text style={sb.statBlockLbl}>{t('teamDetail.section_streak')}</Text>
                  <Text style={sb.statBlockSub}>{team.winStreakText}</Text>
                </View>
                <View style={sb.statBlockItem}>
                  <Text style={sb.statBlockVal}>{team.defensiveRank}</Text>
                  <Text style={sb.statBlockLbl}>{t('teamDetail.section_defense')}</Text>
                  <Text style={sb.statBlockSub}>{t('teamDetail.section_defense_rank')}</Text>
                </View>
              </View>
            </View>

            {/* Form Row */}
            <View style={sb.formBlock}>
              <Text style={sb.formLabel}>{t('teamDetail.section_form')}</Text>
              <View style={sb.formRow}>
                {team.recentForm.map(function(f, i) {
                  return <FormBadge key={i} result={f.result} />;
                })}
              </View>
            </View>

            {/* Description */}
            {team.description ? (
              <View style={sb.descBlock}>
                <Text style={sb.descText}>{team.description}</Text>
              </View>
            ) : null}

            {/* Rivalry */}
            {team.rivalry ? (
              <View style={sb.rivalBlock}>
                <Text style={sb.rivalBadge}>{t('teamDetail.section_rivalry')}</Text>
                <Text style={sb.rivalText}>{team.rivalry}</Text>
              </View>
            ) : null}

            {/* Roster */}
            <View style={sb.rosterBlock}>
              <Text style={sb.rosterTitle}>{t('teamDetail.section_roster')}</Text>
              {team.roster.map(function(player, i) {
                return <RosterRow key={player.name} player={player} last={i === team.roster.length - 1} onPress={onOpenPlayer ? function() { onOpenPlayer(player); } : undefined} />;
              })}
            </View>

            <View style={{ height: S.md }} />
          </ScrollView>

          {/* Actions */}
          <View style={sb.actions}>
            {!isJoined ? (
              <TouchableOpacity
                style={sb.joinBtn}
                onPress={function() { onJoin(team); }}
                activeOpacity={0.8}
                disabled={!!joining}
              >
                {joining ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={sb.joinText}>{t('teamDetail.join_btn')}</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={sb.joinedCol}>
                <View style={sb.joinedRow}>
                  <View style={sb.joinedBadge}>
                    <Text style={sb.joinedText}>{t('teamDetail.joined_badge')}</Text>
                  </View>
                  <TouchableOpacity style={sb.chatBtn} onPress={onOpenChat} activeOpacity={0.8}>
                    <Text style={sb.chatBtnText}>{t('teamDetail.chat_btn')}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={sb.inviteBtn} onPress={function() { setShowInvite(true); }} activeOpacity={0.8}>
                  <Text style={sb.inviteBtnTxt}>{t('teamDetail.invite_btn')}</Text>
                </TouchableOpacity>
                {onLeave ? (
                  <TouchableOpacity style={sb.leaveBtn} onPress={function() { onLeave(team); }} activeOpacity={0.8}>
                    <Text style={sb.leaveBtnTxt}>{t('teamDetail.leave_btn')}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          </View>
          <InviteModal visible={showInvite} onClose={function() { setShowInvite(false); }} />
        </View>
      </View>
    </Modal>
  );
}

const sb = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    backgroundColor: C.bgCard,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    maxHeight: SCREEN_H * 0.9,
    paddingBottom: 40,
  },
  handle: {
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: S.sm,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.screen,
    paddingVertical: S.sm,
  },
  closeBtn: {
    width: 32, height: 32,
    borderRadius: R.full,
    backgroundColor: C.bgCard2,
    alignItems: 'center', justifyContent: 'center',
  },
  closeIcon: { color: C.textDim, fontSize: 14, fontWeight: '700' },
  topBadge: {
    color: C.lime,
    fontSize: F.xs,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  scroll: {
    paddingHorizontal: S.screen,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: S.md,
  },
  teamLogo: {
    width: 60, height: 60,
    borderRadius: R.full,
    backgroundColor: C.bgCard2,
  },
  identityText: { flex: 1 },
  teamName: {
    color: C.text,
    fontSize: F.lg,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  teamMeta: {
    color: C.textDim,
    fontSize: F.xs,
    marginTop: 2,
  },
  rosterBadge: {
    alignItems: 'center',
    backgroundColor: C.bgCard2,
    borderRadius: R.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rosterBadgeNum: { color: C.text, fontSize: F.lg, fontWeight: '900' },
  rosterBadgeLbl: { color: C.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  chemBlock: { marginBottom: S.md },
  chemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  chemLabel: { color: C.textDim, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5 },
  chemValue: { color: C.lime, fontSize: F.sm, fontWeight: '800' },
  chemTrack: {
    height: 6,
    backgroundColor: C.border,
    borderRadius: R.full,
    overflow: 'hidden',
  },
  chemFill: {
    height: '100%',
    backgroundColor: C.lime,
    borderRadius: R.full,
  },
  statsBlock: { marginBottom: S.md },
  statBlockRow: { flexDirection: 'row', gap: 8 },
  statBlockItem: {
    flex: 1,
    backgroundColor: C.bgCard2,
    borderRadius: R.md,
    padding: S.sm,
    alignItems: 'center',
  },
  statBlockVal: { color: C.text, fontSize: F.md, fontWeight: '900' },
  statBlockLbl: { color: C.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  statBlockSub: { color: C.orange, fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginTop: 2, textAlign: 'center' },
  formBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: S.md,
  },
  formLabel: { color: C.textDim, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5 },
  formRow: { flexDirection: 'row', gap: 4 },
  formBadge: {
    width: 28, height: 28,
    borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  formText: { color: '#fff', fontSize: F.xs, fontWeight: '900' },
  descBlock: {
    backgroundColor: C.bgPanel,
    borderRadius: R.md,
    padding: S.sm,
    marginBottom: S.md,
  },
  descText: { color: C.textDim, fontSize: F.xs, lineHeight: 18 },
  rivalBlock: {
    borderLeftWidth: 3,
    borderLeftColor: C.orange,
    paddingLeft: S.sm,
    marginBottom: S.md,
  },
  rivalBadge: { color: C.orange, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 3 },
  rivalText: { color: C.text, fontSize: F.xs, fontWeight: '700' },
  rosterBlock: { marginBottom: S.sm },
  rosterTitle: { color: C.textDim, fontSize: F.xs, fontWeight: '700', letterSpacing: 2, marginBottom: S.sm },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  rosterBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  rosterAvatar: {
    width: 40, height: 40,
    borderRadius: R.full,
    backgroundColor: C.bgCard2,
  },
  rosterInfo: { flex: 1 },
  rosterName: { color: C.text, fontSize: F.sm, fontWeight: '700' },
  rosterArch: { color: C.orange, fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginTop: 1 },
  rosterStats: { flexDirection: 'row', gap: 10 },
  rosterStat: { alignItems: 'center' },
  statVal: { color: C.text, fontSize: F.xs, fontWeight: '800' },
  statLbl: { color: C.textDim, fontSize: 9, fontWeight: '600', marginTop: 1 },
  rosterChevron: { color: C.textDim, fontSize: F.md, marginLeft: S.sm },
  actions: {
    paddingHorizontal: S.screen,
    paddingTop: S.sm,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  joinBtn: {
    backgroundColor: C.orange,
    borderRadius: R.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  joinText: {
    color: '#fff',
    fontSize: F.sm,
    fontWeight: '900',
    letterSpacing: 2,
  },
  joinedCol: { gap: 8 },
  joinedRow: { flexDirection: 'row', gap: 8 },
  joinedBadge: {
    flex: 1,
    backgroundColor: C.bgCard2,
    borderRadius: R.md,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.lime,
  },
  joinedText: { color: C.lime, fontSize: F.xs, fontWeight: '800', letterSpacing: 1.5 },
  chatBtn: {
    flex: 1,
    backgroundColor: C.orange,
    borderRadius: R.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  chatBtnText: {
    color: '#fff',
    fontSize: F.xs,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  inviteBtn: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  inviteBtnTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 1 },
  leaveBtn: {
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
    borderRadius: R.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  leaveBtnTxt: { color: C.red, fontSize: F.xs, fontWeight: '800', letterSpacing: 1 },
  // Invite modal
  invRoot: { flex: 1, justifyContent: 'flex-end' },
  invBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  invSheet: { backgroundColor: C.bgCard, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, maxHeight: SCREEN_H * 0.7, paddingBottom: 30 },
  invHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  invHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: S.screen, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: C.border },
  invTitle: { color: C.text, fontSize: F.sm, fontWeight: '900', letterSpacing: 1.5 },
  invCloseBtn: { width: 32, height: 32, borderRadius: R.full, backgroundColor: C.bgCard2, alignItems: 'center', justifyContent: 'center' },
  invCloseIcon: { color: C.textDim, fontSize: 13, fontWeight: '700' },
  invList: { paddingHorizontal: S.screen, paddingTop: S.sm },
  invRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: S.md },
  invAvatar: { width: 40, height: 40, borderRadius: R.full, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center' },
  invAvatarTxt: { color: '#fff', fontSize: F.sm, fontWeight: '900' },
  invInfo: { flex: 1, gap: 3 },
  invName: { color: C.text, fontSize: F.sm, fontWeight: '800' },
  invMeta: { color: C.textDim, fontSize: F.xs },
  invBtn: { backgroundColor: C.orange, borderRadius: R.sm, paddingHorizontal: S.md, paddingVertical: 8 },
  invBtnSent: { backgroundColor: 'rgba(74,222,128,0.12)', borderWidth: 1, borderColor: C.green },
  invBtnTxt: { color: '#fff', fontSize: F.xs, fontWeight: '900', letterSpacing: 1 },
  invBtnTxtSent: { color: C.green },
  invSep: { height: 1, backgroundColor: C.border },
});
