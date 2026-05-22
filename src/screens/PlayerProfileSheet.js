import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { C, F, R, S } from '../theme';
import { t } from '../i18n';

var { height: SCREEN_H } = Dimensions.get('window');

function StatCell({ stat }) {
  return (
    <View style={pp.statCell}>
      <Text style={pp.statVal}>{stat.value}</Text>
      <Text style={pp.statLbl}>{stat.label}</Text>
    </View>
  );
}

export default function PlayerProfileSheet({ player, onClose }) {
  if (!player) return null;

  var ovrStat = (player.stats || []).find(function(s) { return s.label === 'OVR'; });
  var displayStats = (player.stats || []).filter(function(s) { return s.label !== 'OVR'; });

  return (
    <Modal visible={!!player} transparent animationType="slide" onRequestClose={onClose}>
      <View style={pp.root}>
        <TouchableOpacity style={pp.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={pp.sheet}>
          <View style={pp.handle} />
          {/* Header */}
          <View style={pp.topBar}>
            <TouchableOpacity style={pp.closeBtn} onPress={onClose}>
              <Text style={pp.closeIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={pp.topLabel}>{t('playerProfile.title')}</Text>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={pp.scroll}>
            {/* Avatar + identity */}
            <View style={pp.hero}>
              <View style={pp.avatarWrap}>
                <Image source={{ uri: player.avatar }} style={pp.avatar} />
                {ovrStat ? (
                  <View style={pp.ovrBadge}>
                    <Text style={pp.ovrNum}>{ovrStat.value}</Text>
                    <Text style={pp.ovrLbl}>OVR</Text>
                  </View>
                ) : null}
              </View>
              <View style={pp.heroText}>
                {player.jerseyNumber ? <Text style={pp.jersey}>#{player.jerseyNumber}</Text> : null}
                <Text style={pp.name}>{player.name}</Text>
                <View style={pp.archRow}>
                  <Text style={pp.arch}>{player.archetype}</Text>
                  {player.tier ? <View style={pp.tierBadge}><Text style={pp.tierTxt}>{player.tier}</Text></View> : null}
                </View>
                {player.district ? <Text style={pp.district}>📍 {player.district}</Text> : null}
              </View>
            </View>

            {/* Stats grid */}
            {player.stats && displayStats.length > 0 ? (
              <View style={pp.statsSection}>
                <Text style={pp.sectionLbl}>{t('playerProfile.section_stats')}</Text>
                <View style={pp.statsGrid}>
                  {displayStats.map(function(stat) {
                    return <StatCell key={stat.label} stat={stat} />;
                  })}
                </View>
              </View>
            ) : null}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

var pp = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet: {
    backgroundColor: C.bgCard,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    maxHeight: SCREEN_H * 0.75,
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
  closeIcon: { color: C.textDim, fontSize: 13, fontWeight: '700' },
  topLabel: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 2 },
  scroll: { paddingHorizontal: S.screen },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingVertical: S.md,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: S.lg,
  },
  avatarWrap: { position: 'relative' },
  ovrBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: C.orange, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2, minWidth: 32, alignItems: 'center', borderWidth: 1, borderColor: C.bg },
  ovrNum: { color: '#000', fontSize: 10, fontWeight: '900', lineHeight: 13 },
  ovrLbl: { color: '#000', fontSize: 7, fontWeight: '700', letterSpacing: 1 },
  jersey: { color: C.orange, fontSize: F.sm, fontWeight: '900', letterSpacing: 0.5 },
  district: { color: C.textMuted, fontSize: F.xs, marginTop: 2 },
  tierBadge: { backgroundColor: C.lime + '20', borderRadius: R.full, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: C.lime + '44' },
  tierTxt: { color: C.lime, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
    width: 72, height: 72,
    borderRadius: R.full,
    backgroundColor: C.bgCard2,
    borderWidth: 2,
    borderColor: C.border,
  },
  heroText: { flex: 1 },
  name: {
    color: C.text,
    fontSize: F.lg,
    fontWeight: '900',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  archRow: { flexDirection: 'row' },
  arch: {
    color: C.orange,
    fontSize: F.xs,
    fontWeight: '800',
    letterSpacing: 1.5,
    backgroundColor: 'rgba(255,91,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,91,0,0.3)',
  },
  statsSection: { marginBottom: S.lg },
  sectionLbl: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 2, marginBottom: S.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  statCell: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: C.bgCard2,
    borderRadius: R.md,
    padding: S.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  statVal: { color: C.text, fontSize: F.xl, fontWeight: '900', marginBottom: 4 },
  statLbl: { color: C.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 1.5, textAlign: 'center' },
});
