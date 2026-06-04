import React from 'react';
import { Text, TextProps } from 'react-native';
import { colors, typography } from '../design/theme';
import type { TypographyVariant } from '../design/theme';

// ─────────────────────────────────────────────────────────────────────────────

export type TextColor =
  | 'default' | 'dim' | 'muted'
  | 'brand' | 'accent'
  | 'success' | 'warning' | 'error' | 'info' | 'special';

interface UiTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: TextColor | (string & {});
  children?: React.ReactNode;
}

const COLOR_MAP: Record<TextColor, string> = {
  default: colors.text,
  dim:     colors.textDim,
  muted:   colors.textMuted,
  brand:   colors.brand,
  accent:  colors.accent,
  success: colors.success,
  warning: colors.warning,
  error:   colors.error,
  info:    colors.info,
  special: colors.special,
};

/**
 * Typography primitive. Replaces raw `<Text>` with a consistent variant system.
 *
 * @example
 * <UiText variant="h2" color="accent">KADRO</UiText>
 * <UiText variant="caps" color="dim">PRO-AM SEVİYE</UiText>
 * <UiText variant="stat">94</UiText>
 */
export function UiText({
  variant = 'body',
  color   = 'default',
  style,
  ...props
}: UiTextProps) {
  const typographyStyle = typography[variant];
  const resolvedColor   = (COLOR_MAP as Record<string, string>)[color] ?? color;
  return (
    <Text
      style={[typographyStyle, { color: resolvedColor }, style]}
      {...props}
    />
  );
}
