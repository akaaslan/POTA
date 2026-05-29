import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../design/theme';

// ─────────────────────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  /** 1-based section number. Displayed as '01', '02', etc. */
  num?:         number;
  title:        string;
  actionLabel?: string;
  onAction?:    () => void;
  style?:       ViewStyle;
}

/**
 * Section header row — numbered, titled, with optional right-side action.
 * Replicates the `SectionHead` pattern used throughout the app.
 *
 * @example
 * <SectionHeader num={1} title="YAKLAŞAN MAÇLAR" actionLabel="Tümü" onAction={showAll} />
 * <SectionHeader title="ROZETLER" />
 */
export function SectionHeader({ num, title, actionLabel, onAction, style }: SectionHeaderProps) {
  const numStr = num !== undefined
    ? (num < 10 ? '0' + num : String(num))
    : null;

  return (
    <View style={[s.root, style]}>
      {numStr ? (
        <>
          <Text style={s.num}>{numStr}</Text>
          <View style={s.line} />
        </>
      ) : null}
      <Text style={s.title} numberOfLines={1}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onAction} style={s.actionWrap} activeOpacity={0.7}>
          <Text style={s.action}>{actionLabel} ›</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing.sm,
    marginBottom:   spacing.md,
  },
  num: {
    ...typography.caps,
    color:    colors.textMuted,
    minWidth: 22,
  },
  line: {
    width:           1,
    height:          12,
    backgroundColor: colors.border,
  },
  title: {
    ...typography.caps,
    color: colors.text,
    flex:  1,
  },
  actionWrap: {
    paddingVertical:  spacing.xs,
    paddingLeft:      spacing.sm,
  },
  action: {
    ...typography.labelSm,
    color: colors.textDim,
  },
});
