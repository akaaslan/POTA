import React from 'react';
import {
  ScrollView, View, RefreshControl, StyleSheet, ViewStyle, ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../design/theme';

// ─────────────────────────────────────────────────────────────────────────────

interface ScreenContainerProps extends Omit<ScrollViewProps, 'style' | 'contentContainerStyle'> {
  children:     React.ReactNode;
  /** Apply standard horizontal screen padding. Default true */
  padH?:         boolean;
  /** Apply standard top padding. Default false (header handles it) */
  padTop?:       boolean;
  /** Extra bottom padding (added on top of safe area). Default spacing.xl */
  bottomPad?:    number;
  /** Whether to pull-to-refresh */
  refreshing?:   boolean;
  onRefresh?:    () => void;
  style?:        ViewStyle;
  contentStyle?: ViewStyle;
}

/**
 * Standard scrollable screen wrapper.
 * Handles safe-area insets, standard padding, and optional pull-to-refresh.
 *
 * @example
 * <ScreenContainer refreshing={isFetching} onRefresh={refetch}>
 *   <SectionHeader title="FEED" num={1} />
 *   {matches.map(m => <MatchCard key={m.id} match={m} />)}
 * </ScreenContainer>
 */
export function ScreenContainer({
  children,
  padH        = true,
  padTop      = false,
  bottomPad   = spacing.xl,
  refreshing,
  onRefresh,
  style,
  contentStyle,
  ...rest
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[s.root, style]}
      contentContainerStyle={[
        {
          paddingHorizontal: padH ? spacing.screen : 0,
          paddingTop:        padTop ? spacing.screenV : 0,
          paddingBottom:     insets.bottom + bottomPad,
        },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh !== undefined ? (
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.brand]}
          />
        ) : undefined
      }
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

// ─── Non-scrollable screen wrapper (for screens with FlatList) ────────────────
interface ScreenViewProps {
  children:  React.ReactNode;
  padH?:     boolean;
  style?:    ViewStyle;
}

/**
 * Non-scrollable screen root view.
 * Use when the screen contains a `FlatList` that handles its own scrolling.
 */
export function ScreenView({ children, padH = false, style }: ScreenViewProps) {
  return (
    <View
      style={[s.root, padH && { paddingHorizontal: spacing.screen }, style]}
    >
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: colors.bg,
  },
});
