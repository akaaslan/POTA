import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { C, F, R, S } from '../theme';
import { t } from '../i18n';

// ─── Animated skeleton block ──────────────────────────────────────────────────
function SkeletonBlock({ style }: { style?: StyleProp<ViewStyle> }) {
  var anim = useRef(new Animated.Value(0.35)).current;
  useEffect(function() {
    var loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.35, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return function() { loop.stop(); };
  }, []);
  return <Animated.View style={[sk.block, style, { opacity: anim }]} />;
}

// ─── Skeleton card mimics a RunCard / HomeCard ────────────────────────────────
export function SkeletonCard() {
  return (
    <View style={sk.card}>
      <View style={sk.tierBar} />
      <View style={sk.thumb} />
      <View style={sk.body}>
        <SkeletonBlock style={{ width: '68%', height: 13, marginBottom: 8 }} />
        <SkeletonBlock style={{ width: '45%', height: 10, marginBottom: 14 }} />
        <SkeletonBlock style={{ width: '100%', height: 3, marginBottom: 6 }} />
        <SkeletonBlock style={{ width: '40%', height: 10 }} />
      </View>
    </View>
  );
}

export function SkeletonList({ count }: { count?: number }) {
  var rows = [];
  for (var i = 0; i < (count || 3); i++) { rows.push(i); }
  return (
    <View style={sk.list}>
      {rows.map(function(i) { return <SkeletonCard key={i} />; })}
    </View>
  );
}

// ─── Error state with retry button ────────────────────────────────────────────
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <View style={er.root}>
      <Text style={er.icon}>!</Text>
      <Text style={er.title}>{message || t('screenStates.error_title')}</Text>
      <Text style={er.sub}>{t('screenStates.error_sub')}</Text>
      {onRetry ? (
        <TouchableOpacity style={er.btn} onPress={onRetry} activeOpacity={0.8}>
          <Text style={er.btnTxt}>{t('screenStates.retry')}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

var sk = StyleSheet.create({
  list: { padding: S.screen },
  card: {
    backgroundColor: C.bgCard,
    borderRadius: R.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    height: 120,
    marginBottom: S.md,
  },
  tierBar: { width: 4, backgroundColor: C.border },
  thumb: { width: 100, backgroundColor: C.bgCard2 },
  body: { flex: 1, padding: S.md, justifyContent: 'center' },
  block: { backgroundColor: C.bgCard2, borderRadius: R.sm },
});

var er = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: S.x3 },
  icon: {
    color: C.orange,
    fontSize: 56,
    fontWeight: '900',
    opacity: 0.3,
    marginBottom: S.sm,
    letterSpacing: -4,
  },
  title: { color: C.text, fontSize: F.lg, fontWeight: '900', textAlign: 'center', marginBottom: S.sm },
  sub: { color: C.textDim, fontSize: F.sm, textAlign: 'center', lineHeight: 22, marginBottom: S.lg },
  btn: {
    backgroundColor: C.bgCard,
    borderRadius: R.sm,
    paddingHorizontal: S.x2,
    paddingVertical: S.md,
    borderWidth: 1,
    borderColor: C.border,
  },
  btnTxt: { color: C.text, fontSize: F.xs, fontWeight: '900', letterSpacing: 2 },
});
