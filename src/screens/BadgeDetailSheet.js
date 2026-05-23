import React from 'react';
import {
  View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { C, F, R, S } from '../theme';

var { height: SCREEN_H } = Dimensions.get('window');

export default function BadgeDetailSheet({ badge, onClose }) {
  if (!badge) return null;
  var isActive = !!badge.active;

  return (
    <Modal visible={!!badge} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.root}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.handle} />

          {/* Icon */}
          <View style={[s.iconCircle, { backgroundColor: isActive ? C.lime + '20' : C.border }]}>
            <Text style={s.iconTxt}>{badge.icon || '🏅'}</Text>
          </View>

          {/* Label */}
          <Text style={[s.label, { color: isActive ? C.lime : C.textDim }]}>
            {badge.label}
            {isActive ? '  ✓' : '  🔒'}
          </Text>

          {/* Status chip */}
          <View style={[s.chip, { backgroundColor: isActive ? C.lime + '20' : C.bgCard2 }]}>
            <Text style={[s.chipTxt, { color: isActive ? C.lime : C.textMuted }]}>
              {isActive ? 'KAZANILDI' : 'KİLİTLİ'}
            </Text>
          </View>

          {/* Description */}
          {badge.description ? (
            <Text style={s.desc}>{badge.description}</Text>
          ) : null}

          {/* Unlock condition */}
          {!isActive && badge.unlockCondition ? (
            <View style={s.unlockBox}>
              <Text style={s.unlockTitle}>🔓  KİLİDİ AÇMAK İÇİN</Text>
              <Text style={s.unlockTxt}>{badge.unlockCondition}</Text>
            </View>
          ) : null}

          {isActive ? (
            <View style={s.unlockBox}>
              <Text style={s.earnedTxt}>🏆  Sahada ispat ettin!</Text>
            </View>
          ) : null}

          <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={s.closeTxt}>TAMAM</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

var s = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: C.bgCard,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    paddingHorizontal: S.screen,
    paddingBottom: 32,
    paddingTop: S.md,
    alignItems: 'center',
    maxHeight: SCREEN_H * 0.6,
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    marginBottom: S.lg,
  },
  iconCircle: {
    width: 72, height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: S.md,
  },
  iconTxt: { fontSize: 32 },
  label: {
    fontSize: F.xl,
    fontWeight: '700',
    color: C.text,
    textAlign: 'center',
    marginBottom: S.sm,
  },
  chip: {
    paddingHorizontal: S.md,
    paddingVertical: 4,
    borderRadius: R.full,
    marginBottom: S.lg,
  },
  chipTxt: { fontSize: F.xs, fontWeight: '700', letterSpacing: 1 },
  desc: {
    fontSize: F.base,
    color: C.textDim,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: S.md,
  },
  unlockBox: {
    width: '100%',
    backgroundColor: C.bgCard2,
    borderRadius: R.md,
    padding: S.md,
    marginBottom: S.md,
  },
  unlockTitle: {
    fontSize: F.xs,
    color: C.orange,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  unlockTxt: {
    fontSize: F.sm,
    color: C.textDim,
    lineHeight: 20,
  },
  earnedTxt: {
    fontSize: F.sm,
    color: C.lime,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeBtn: {
    width: '100%',
    backgroundColor: C.bgCard2,
    paddingVertical: 14,
    borderRadius: R.lg,
    alignItems: 'center',
    marginTop: S.sm,
  },
  closeTxt: {
    fontSize: F.base,
    fontWeight: '700',
    color: C.text,
    letterSpacing: 1,
  },
});
