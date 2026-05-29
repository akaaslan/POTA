import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors, radius } from '../design/theme';

// ─────────────────────────────────────────────────────────────────────────────

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?:       string | null;
  initials?:  string;
  size?:      AvatarSize;
  ringColor?: string;    // colored border ring (tier color, brand, etc.)
  style?:     ViewStyle;
}

const SIZE_MAP: Record<AvatarSize, number> = {
  xs:  24,
  sm:  32,
  md:  40,
  lg:  48,
  xl:  64,
};

const FONT_MAP: Record<AvatarSize, number> = {
  xs:  9,
  sm:  12,
  md:  14,
  lg:  16,
  xl:  22,
};

/**
 * Player avatar. Shows image if `uri` is provided, else renders initials fallback.
 * Optional `ringColor` adds a 2px colored border (used for tier / status indication).
 *
 * @example
 * <Avatar uri={profile.avatar} initials="K34" size="lg" ringColor={colors.accent} />
 * <Avatar initials="KF" size="md" ringColor={colors.tier['Pro-Am']} />
 */
export function Avatar({ uri, initials, size = 'md', ringColor, style }: AvatarProps) {
  const dim  = SIZE_MAP[size];
  const font = FONT_MAP[size];

  const containerStyle: ViewStyle = {
    width:        dim,
    height:       dim,
    borderRadius: dim / 2,
    overflow:     'hidden',
    backgroundColor: colors.bgCard2,
    alignItems:   'center',
    justifyContent: 'center',
    ...(ringColor ? { borderWidth: 2, borderColor: ringColor } : {}),
  };

  return (
    <View style={[containerStyle, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: dim, height: dim }}
          contentFit="cover"
        />
      ) : (
        <Text style={[s.initials, { fontSize: font }]}>
          {initials?.slice(0, 2).toUpperCase() ?? '?'}
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  initials: {
    color:      colors.textDim,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
