import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, elevation } from '../design/theme';
import type { ElevationKey } from '../design/theme';

// ─────────────────────────────────────────────────────────────────────────────

export type IconButtonVariant = 'default' | 'brand' | 'accent' | 'ghost' | 'danger';
export type IconButtonSize    = 'sm' | 'md' | 'lg';

interface IconButtonProps {
  icon:      React.ReactNode;
  onPress:   () => void;
  variant?:  IconButtonVariant;
  size?:     IconButtonSize;
  disabled?: boolean;
  shadow?:   ElevationKey;
  style?:    ViewStyle;
}

const SIZE_MAP: Record<IconButtonSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
};

const VARIANT_STYLES: Record<IconButtonVariant, ViewStyle> = {
  default: { backgroundColor: colors.bgCard2, borderWidth: 1, borderColor: colors.border },
  brand:   { backgroundColor: colors.brand },
  accent:  { backgroundColor: colors.accent },
  ghost:   { backgroundColor: 'transparent' },
  danger:  { backgroundColor: colors.error + '22', borderWidth: 1, borderColor: colors.error + '44' },
};

/**
 * Circular icon button.
 *
 * @example
 * <IconButton icon={<Text>🔔</Text>} onPress={openNotifications} />
 * <IconButton icon={<Text>✕</Text>} onPress={onClose} variant="ghost" size="sm" />
 */
export function IconButton({
  icon,
  onPress,
  variant  = 'default',
  size     = 'md',
  disabled = false,
  shadow,
  style,
}: IconButtonProps) {
  const dim = SIZE_MAP[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        s.base,
        { width: dim, height: dim, borderRadius: dim / 2 },
        VARIANT_STYLES[variant],
        shadow ? elevation[shadow] : {},
        disabled && s.disabled,
        style,
      ]}
    >
      {icon}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  base: {
    alignItems:     'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
