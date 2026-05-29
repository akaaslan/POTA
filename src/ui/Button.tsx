import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator,
  StyleSheet, ViewStyle, TextStyle, View,
} from 'react-native';
import { colors, typography, radius, spacing, elevation } from '../design/theme';

// ─────────────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  disabled?: boolean;
  loading?:  boolean;
  fullWidth?: boolean;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
  style?:    ViewStyle;
  labelStyle?: TextStyle;
}

// Per-variant token sets
const VARIANT_STYLES: Record<ButtonVariant, {
  container: ViewStyle;
  label:     TextStyle;
  pressed:   ViewStyle;
}> = {
  primary: {
    container: { backgroundColor: colors.brand, ...elevation.brand },
    label:     { color: colors.text },
    pressed:   { backgroundColor: colors.brandLight },
  },
  accent: {
    container: { backgroundColor: colors.accent, ...elevation.accent },
    label:     { color: '#0D0D0F' },          // dark text on lime
    pressed:   { backgroundColor: colors.accentDark },
  },
  secondary: {
    container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
    label:     { color: colors.text },
    pressed:   { backgroundColor: colors.bgCard2 },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    label:     { color: colors.textDim },
    pressed:   { backgroundColor: colors.bgCard },
  },
  danger: {
    container: { backgroundColor: colors.error + '22', borderWidth: 1, borderColor: colors.error + '55' },
    label:     { color: colors.error },
    pressed:   { backgroundColor: colors.error + '33' },
  },
};

// Per-size token sets
const SIZE_STYLES: Record<ButtonSize, { container: ViewStyle; label: TextStyle }> = {
  sm: {
    container: { height: 34, paddingHorizontal: spacing.md, borderRadius: radius.sm, gap: spacing.xs },
    label:     typography.btnSm,
  },
  md: {
    container: { height: 44, paddingHorizontal: spacing.lg, borderRadius: radius.md, gap: spacing.xs },
    label:     typography.btn,
  },
  lg: {
    container: { height: 52, paddingHorizontal: spacing.xl, borderRadius: radius.lg, gap: spacing.sm },
    label:     typography.btnLg,
  },
};

/**
 * Core interactive button with variant + size system.
 *
 * @example
 * <Button label="KATIL" variant="primary" onPress={joinMatch} />
 * <Button label="EKLE" variant="accent" size="sm" loading={isPending} />
 * <Button label="Tümü Gör" variant="ghost" onPress={showAll} />
 */
export function Button({
  label,
  onPress,
  variant   = 'primary',
  size      = 'md',
  disabled  = false,
  loading   = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  labelStyle,
}: ButtonProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle    = SIZE_STYLES[size];
  const isDisabled   = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      style={[
        s.base,
        variantStyle.container,
        sizeStyle.container,
        fullWidth && s.fullWidth,
        isDisabled && s.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyle.label.color as string} />
      ) : (
        <>
          {leftIcon ? <View>{leftIcon}</View> : null}
          <Text style={[variantStyle.label, sizeStyle.label, labelStyle]}>
            {label}
          </Text>
          {rightIcon ? <View>{rightIcon}</View> : null}
        </>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  base: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.45,
  },
});
