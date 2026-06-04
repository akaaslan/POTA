import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { C, F, R, S } from '../theme';
import { t } from '../i18n';

var ACTIVITIES: ActivityItem[] = [
  { id: 'a1',  actor: 'GÖLGE_34',     actionKey: 'joined',  target: 'MAÇKA ELİT 5v5',           time: '2 dk önce',  type: 'join',   district: 'Şişli' },
  { id: 'a2',  actor: 'THUNDER_41',  actionKey: 'created', target: 'BAKIRKÖY ELİT RUN',          time: '8 dk önce',  type: 'create', district: 'Bakırköy' },
  { id: 'a3',  actor: 'BORAN',       actionKey: 'joined',  target: 'KADIKÖY GECE KOŞUSU',         time: '15 dk önce', type: 'join',   district: 'Kadıköy' },
  { id: 'a4',  actor: 'KRAL_34',     actionKey: 'won',     target: 'CADDEBOSTAN RUN',             time: '1 sa önce',  type: 'win',    district: 'Kadıköy' },
  { id: 'a5',  actor: 'EJDER_KDK',   actionKey: 'joined',  target: 'ÜSKÜDAR 3v3 BLACKTOP',        time: '2 sa önce',  type: 'join',   district: 'Üsküdar' },
  { id: 'a6',  actor: 'SULTAN_34',   actionKey: 'badge',   target: 'Deadeye 🎯',                   time: '3 sa önce',  type: 'badge',  district: 'Fatih' },
  { id: 'a7',  actor: 'FALCON_BS',   actionKey: 'won',     target: 'FATİH 3v3 AÇIK SAHA',         time: '4 sa önce',  type: 'win',    district: 'Fatih' },
  { id: 'a8',  actor: 'MJ_STYLE',    actionKey: 'created', target: 'BEŞİKTAŞ SAHİL GECE',          time: '5 sa önce',  type: 'create', district: 'Beşiktaş' },
  { id: 'a9',  actor: 'GÖLGE_34',     actionKey: 'badge',   target: 'Fast Twitch ⚡',                time: '5 sa önce',  type: 'badge',  district: 'Şişli' },
  { id: 'a10', actor: 'HIZ_KDK',     actionKey: 'joined',  target: 'ZEYTTİNBURNU AKŞAMI',          time: '6 sa önce',  type: 'join',   district: 'Zeytinburnu' },
  { id: 'a11', actor: 'HAWK_KADIKOY', actionKey: 'won',    target: 'BEŞİKTAŞ SAHİL 3v3',          time: '7 sa önce',  type: 'win',    district: 'Beşiktaş' },
  { id: 'a12', actor: 'DUVAR_34',    actionKey: 'created', target: 'ŞİŞLİ PAZAR KOŞUSU',            time: '8 sa önce',  type: 'create', district: 'Şişli' },
];

type ActivityType = 'join' | 'create' | 'win' | 'badge';
interface ActivityItem { id: string; actor: string; actionKey: string; target: string; time: string; type: ActivityType; district: string; }
var TYPE_META: Record<ActivityType, { icon: string; color: string }> = {
  join:   { icon: '🏀', color: '#00D4FF' },
  create: { icon: '✚',  color: '#C8F000' },
  win:    { icon: '🏆', color: '#FFD700' },
  badge:  { icon: '⭐', color: '#FF5B00' },
};

function ActivityRow({ item, onPress }: { item: ActivityItem; onPress: () => void }) {
  var meta = TYPE_META[item.type] ?? { icon: '•', color: C.textDim };
  return (
    <TouchableOpacity style={a.row} onPress={onPress} activeOpacity={0.75}>
      <View style={[a.iconWrap, { backgroundColor: meta.color + '18' }]}>
        <Text style={a.icon}>{meta.icon}</Text>
      </View>
      <View style={a.body}>
        <Text style={a.text} numberOfLines={2}>
          <Text style={a.actor}>{item.actor}</Text>
          <Text style={a.actionTxt}>{' ' + t('activity.action_' + item.actionKey) + ' '}</Text>
          <Text style={[a.target, { color: meta.color }]}>{item.target}</Text>
        </Text>
        <View style={a.metaRow}>
          <Text style={a.district}>{item.district}</Text>
          <Text style={a.dot}> · </Text>
          <Text style={a.time}>{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface ActivitySheetProps { open: boolean; onClose: () => void; onItemPress?: (item: ActivityItem) => void; }
export default function ActivitySheet({ open, onClose, onItemPress }: ActivitySheetProps) {
  if (!open) return null;
  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={onClose}>
      <View style={a.root}>
        <TouchableOpacity style={a.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={a.sheet}>
          <View style={a.handle} />
          <View style={a.header}>
            <View>
              <Text style={a.title}>{t('activity.title')}</Text>
              <Text style={a.sub}>{t('activity.subtitle')}</Text>
            </View>
            <TouchableOpacity style={a.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={a.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={ACTIVITIES}
            keyExtractor={function(item) { return item.id; }}
            renderItem={function(info) { return <ActivityRow item={info.item} onPress={function() { if (onItemPress) onItemPress(info.item); }} />; }}
            contentContainerStyle={a.list}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={function() { return <View style={a.sep} />; }}
          />
        </View>
      </View>
    </Modal>
  );
}

const a = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet: {
    backgroundColor: C.bgCard,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    maxHeight: '82%',
    paddingBottom: 40,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.screen,
    paddingVertical: S.md,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  title: { color: C.text, fontSize: F.base, fontWeight: '900', letterSpacing: 1.5 },
  sub: { color: C.textDim, fontSize: F.xs, marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: R.full, backgroundColor: C.bgCard2, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { color: C.textDim, fontSize: 13, fontWeight: '700' },
  list: { paddingHorizontal: S.screen, paddingTop: S.sm, paddingBottom: S.md },
  row: { flexDirection: 'row', gap: S.md, alignItems: 'flex-start', paddingVertical: 14 },
  iconWrap: { width: 40, height: 40, borderRadius: R.full, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  icon: { fontSize: 18 },
  body: { flex: 1, gap: 4 },
  text: { color: C.text, fontSize: F.sm, lineHeight: 20 },
  actor: { fontWeight: '900' },
  actionTxt: { color: C.textDim, fontWeight: '600' },
  target: { fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  district: { color: C.textDim, fontSize: F.xs, fontWeight: '700', letterSpacing: 0.5 },
  dot: { color: C.textDim, fontSize: F.xs },
  time: { color: C.textDim, fontSize: F.xs },
  sep: { height: 1, backgroundColor: C.border },
});
