import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing, duration } from '../design/theme';

// ─────────────────────────────────────────────────────────────────────────────

interface SkeletonBlockProps {
  width?:   number | `${number}%`;
  height?:  number;
  radius?:  number;
  style?:   ViewStyle;
}

/**
 * Pulsing skeleton block. Use to compose skeleton loading states.
 */
export function SkeletonBlock({ width = '100%', height = 12, radius: r, style }: SkeletonBlockProps) {
  const anim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1,    duration: duration.skeleton, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.35, duration: duration.skeleton, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius:    r ?? radius.sm,
          backgroundColor: colors.bgCard2,
          opacity:         anim,
        },
        style,
      ]}
    />
  );
}

// ─── Pre-built skeleton shapes ────────────────────────────────────────────────

/**
 * Skeleton that mimics a RunCard / HomeCard.
 */
export function SkeletonCard() {
  return (
    <View style={s.card}>
      <View style={s.tierBar} />
      <View style={s.thumb} />
      <View style={s.body}>
        <SkeletonBlock width="68%" height={13} style={{ marginBottom: spacing.sm }} />
        <SkeletonBlock width="45%" height={10} style={{ marginBottom: spacing.base }} />
        <SkeletonBlock width="100%" height={3} style={{ marginBottom: spacing.xs }} />
        <SkeletonBlock width="40%" height={10} />
      </View>
    </View>
  );
}

interface SkeletonListProps {
  count?: number;
  style?: ViewStyle;
}

/**
 * Vertical list of SkeletonCards.
 */
export function SkeletonList({ count = 3, style }: SkeletonListProps) {
  return (
    <View style={[s.list, style]}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

/**
 * Row of circular skeleton circles — for rosters, avatars, etc.
 */
export function SkeletonAvatarRow({ count = 4 }: { count?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonBlock key={i} width={40} height={40} radius={radius.full} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.screen,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius:    radius.lg,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     colors.border,
    flexDirection:   'row',
    height:          120,
  },
  tierBar: {
    width:           4,
    backgroundColor: colors.border,
  },
  thumb: {
    width:           100,
    backgroundColor: colors.bgCard2,
  },
  body: {
    flex:            1,
    padding:         spacing.md,
    justifyContent:  'center',
    gap:             spacing.xs,
  },
});
