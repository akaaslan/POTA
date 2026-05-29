import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '../design/theme';

// ─────────────────────────────────────────────────────────────────────────────

interface ListItemProps {
  title:        string;
  subtitle?:    string;
  left?:        React.ReactNode;   // avatar, icon, badge, etc.
  right?:       React.ReactNode;   // value, chevron, action, etc.
  onPress?:     () => void;
  topDivider?:  boolean;
  bottomDivider?: boolean;
  style?:       ViewStyle;
}

/**
 * Standard list row: [left] [title / subtitle] [right]
 * Pass `onPress` to make it pressable.
 *
 * @example
 * <ListItem
 *   left={<Avatar initials="KF" size="sm" />}
 *   title="Kadıköy Fırtınası"
 *   subtitle="#1 BÖLGE"
 *   right={<Text style={{ color: colors.textDim }}>›</Text>}
 *   onPress={() => openTeam(team)}
 * />
 */
export function ListItem({
  title,
  subtitle,
  left,
  right,
  onPress,
  topDivider,
  bottomDivider,
  style,
}: ListItemProps) {
  const inner = (
    <View
      style={[
        s.root,
        topDivider    && s.dividerTop,
        bottomDivider && s.dividerBottom,
        style,
      ]}
    >
      {left  ? <View style={s.left}>{left}</View>   : null}
      <View style={s.body}>
        <Text style={s.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={s.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={s.right}>{right}</View> : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

const s = StyleSheet.create({
  root: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing.md,
    paddingVertical: spacing.sm,
  },
  dividerTop: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dividerBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: {
    flexShrink: 0,
  },
  body: {
    flex:  1,
    gap:   2,
  },
  title: {
    ...typography.label,
    color: colors.text,
  },
  subtitle: {
    ...typography.capsSm,
    color: colors.textDim,
  },
  right: {
    flexShrink: 0,
  },
});
