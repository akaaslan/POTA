import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, typography, getTierColor, getBadgeTierColor, withOpacity } from '../design/theme';

// ─────────────────────────────────────────────────────────────────────────────

export type BadgeChipVariant =
  | 'tier'      // skill-level tier (Açık Saha, Pro-Am, etc.)
  | 'badge'     // HOF / GOLD / SILVER / BRONZE
  | 'live'      // CANLI pulsing indicator
  | 'hot'       // 🔥 streaking
  | 'status'    // generic status (success / warning / error)
  | 'custom';   // fully custom color

type StatusColor = 'success' | 'warning' | 'error' | 'info';

interface BadgeChipProps {
  label:     string;
  variant?:  BadgeChipVariant;
  // For 'tier' variant — pass the skill-level string
  tier?:     string;
  // For 'badge' variant — pass HOF / GOLD / SILVER / BRONZE
  badgeTier?: string;
  // For 'status' variant
  status?:   StatusColor;
  // For 'custom' variant — explicit color
  color?:    string;
  small?:    boolean;
  style?:    ViewStyle;
}

const STATUS_COLORS: Record<StatusColor, string> = {
  success: colors.success,
  warning: colors.warning,
  error:   colors.error,
  info:    colors.info,
};

/**
 * Small badge/chip for skill tiers, HOF badges, live status, and other labels.
 *
 * @example
 * <BadgeChip variant="tier" tier="Pro-Am" label="Pro-Am" />
 * <BadgeChip variant="badge" badgeTier="HOF" label="Deadeye" />
 * <BadgeChip variant="live" label="CANLI" />
 * <BadgeChip variant="status" status="success" label="Katıldın" />
 */
export function BadgeChip({
  label,
  variant   = 'custom',
  tier,
  badgeTier,
  status,
  color,
  small     = false,
  style,
}: BadgeChipProps) {
  let accentColor: string = colors.textDim;

  switch (variant) {
    case 'tier':
      accentColor = getTierColor(tier ?? '');
      break;
    case 'badge':
      accentColor = getBadgeTierColor(badgeTier ?? '');
      break;
    case 'live':
      accentColor = colors.success;
      break;
    case 'hot':
      accentColor = colors.brand;
      break;
    case 'status':
      accentColor = STATUS_COLORS[status ?? 'info'] ?? colors.info;
      break;
    case 'custom':
      accentColor = color ?? colors.textDim;
      break;
  }

  const bg     = withOpacity(accentColor, 0.15);
  const border = withOpacity(accentColor, 0.35);
  const pad    = small ? { paddingHorizontal: 6, paddingVertical: 3 } : { paddingHorizontal: 8, paddingVertical: 4 };
  const textStyle = small ? typography.capsSm : typography.caps;

  return (
    <View style={[s.chip, { backgroundColor: bg, borderColor: border }, pad, style]}>
      {variant === 'live' && <View style={[s.liveDot, { backgroundColor: accentColor }]} />}
      <Text style={[textStyle, { color: accentColor }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  chip: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            4,
    borderRadius:   radius.sm,
    borderWidth:    1,
    alignSelf:      'flex-start',
  },
  liveDot: {
    width:        5,
    height:       5,
    borderRadius: radius.full,
  },
});
