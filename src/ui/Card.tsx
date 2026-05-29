import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, elevation } from '../design/theme';
import type { ElevationKey } from '../design/theme';

// ─────────────────────────────────────────────────────────────────────────────

export type CardVariant = 'default' | 'elevated' | 'flat' | 'outlined';

interface BaseCardProps {
  children: React.ReactNode;
  variant?:  CardVariant;
  shadow?:   ElevationKey;
  style?:    ViewStyle;
}

interface PressableCardProps extends BaseCardProps {
  onPress:      () => void;
  activeOpacity?: number;
}

type CardProps = BaseCardProps | (BaseCardProps & { onPress: () => void; activeOpacity?: number });

function isPressable(props: CardProps): props is PressableCardProps {
  return 'onPress' in props && typeof props.onPress === 'function';
}

const VARIANT_STYLES: Record<CardVariant, ViewStyle> = {
  default:  { backgroundColor: colors.bgCard,  borderWidth: 1, borderColor: colors.border },
  elevated: { backgroundColor: colors.bgCard,  borderWidth: 0 },
  flat:     { backgroundColor: colors.bgCard2, borderWidth: 0 },
  outlined: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
};

/**
 * Card container with variant system.
 * Add `onPress` to make it pressable.
 *
 * @example
 * <Card variant="default" style={{ padding: spacing.base }}>
 *   <UiText variant="h3">Kadıköy Fırtınası</UiText>
 * </Card>
 *
 * <Card variant="elevated" onPress={handlePress}>
 *   <MatchContent />
 * </Card>
 */
export function Card(props: CardProps) {
  const { children, variant = 'default', shadow, style } = props;

  const baseStyle: ViewStyle = {
    ...VARIANT_STYLES[variant],
    borderRadius: radius.lg,
    overflow:     'hidden',
    ...(shadow ? elevation[shadow] : {}),
  };

  if (isPressable(props)) {
    return (
      <TouchableOpacity
        onPress={props.onPress}
        activeOpacity={props.activeOpacity ?? 0.88}
        style={[baseStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[baseStyle, style]}>{children}</View>;
}

// ─── Convenience: Card with a left-side colored tier accent bar ───────────────
interface TierCardProps {
  children:   React.ReactNode;
  tierColor:  string;
  onPress?:   () => void;
  style?:     ViewStyle;
}

/**
 * Match-card pattern — Card with a 4px left-side tier accent bar.
 */
export function TierCard({ children, tierColor, onPress, style }: TierCardProps) {
  const inner = (
    <View style={[tc.container, style]}>
      <View style={[tc.bar, { backgroundColor: tierColor }]} />
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={tc.wrapper}>
        {inner}
      </TouchableOpacity>
    );
  }
  return <View style={tc.wrapper}>{inner}</View>;
}

const tc = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.bgCard,
    borderRadius:    radius.lg,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     colors.border,
    marginBottom:    12,
  },
  container: {
    flexDirection: 'row',
    flex:          1,
  },
  bar: {
    width: 4,
  },
});
