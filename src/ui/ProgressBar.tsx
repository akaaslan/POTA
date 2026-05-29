import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius } from '../design/theme';

// ─────────────────────────────────────────────────────────────────────────────

interface ProgressBarProps {
  /** 0–1 */
  value:    number;
  /** Bar fill color. Defaults to colors.accent */
  color?:   string;
  /** Track color. Defaults to colors.bgCard2 */
  trackColor?: string;
  /** Bar height in dp. Default 3 */
  height?:  number;
  style?:   ViewStyle;
}

/**
 * Thin horizontal progress bar. `value` should be between 0 and 1.
 *
 * @example
 * <ProgressBar value={player.ratingNorm} color={colors.brand} height={4} />
 */
export function ProgressBar({
  value,
  color      = colors.accent,
  trackColor = colors.bgCard2,
  height     = 3,
  style,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;

  return (
    <View style={[{ height, borderRadius: radius.full, backgroundColor: trackColor, overflow: 'hidden' }, style]}>
      <View style={{ width: `${pct}%`, height, backgroundColor: color, borderRadius: radius.full }} />
    </View>
  );
}
