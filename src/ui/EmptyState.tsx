import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography, radius } from '../design/theme';
import { Button } from './Button';

// ─────────────────────────────────────────────────────────────────────────────

type EmptyStateVariant = 'empty' | 'error' | 'offline' | 'filtered';

interface EmptyStateProps {
  variant?:    EmptyStateVariant;
  icon?:       string;            // emoji or text icon
  title?:      string;
  description?: string;
  actionLabel?: string;
  onAction?:   () => void;
  style?:      ViewStyle;
}

const DEFAULTS: Record<EmptyStateVariant, { icon: string; title: string; description: string }> = {
  empty: {
    icon:        '🏀',
    title:       'Henüz içerik yok',
    description: 'Burada gösterilecek bir şey bulunamadı.',
  },
  error: {
    icon:        '⚠',
    title:       'Bir şeyler ters gitti',
    description: 'Lütfen bağlantını kontrol edip tekrar dene.',
  },
  offline: {
    icon:        '📡',
    title:       'Bağlantı yok',
    description: 'İnternet bağlantını kontrol et.',
  },
  filtered: {
    icon:        '🔍',
    title:       'Sonuç bulunamadı',
    description: 'Filtrelerini değiştirerek tekrar dene.',
  },
};

/**
 * Full empty / error state with icon, title, description and optional CTA.
 * Replaces the local `EmptyState` / `ErrorState` defined in individual screens.
 *
 * @example
 * <EmptyState variant="error" onAction={refetch} actionLabel="Tekrar Dene" />
 * <EmptyState variant="filtered" actionLabel="Filtreleri Temizle" onAction={clearFilters} />
 * <EmptyState icon="🏆" title="Liderlik tablosu boş" description="Henüz sıralama yok." />
 */
export function EmptyState({
  variant     = 'empty',
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const defaults = DEFAULTS[variant];
  const resolvedIcon        = icon        ?? defaults.icon;
  const resolvedTitle       = title       ?? defaults.title;
  const resolvedDescription = description ?? defaults.description;

  return (
    <View style={[s.root, style]}>
      <View style={s.iconWrap}>
        <Text style={s.icon}>{resolvedIcon}</Text>
      </View>
      <Text style={s.title}>{resolvedTitle}</Text>
      <Text style={s.description}>{resolvedDescription}</Text>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          size="sm"
          style={s.btn}
        />
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: spacing.xl,
    paddingVertical:  spacing.x3,
    gap:             spacing.md,
  },
  iconWrap: {
    width:           64,
    height:          64,
    borderRadius:    radius.full,
    backgroundColor: colors.bgCard2,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing.xs,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    ...typography.h4,
    color:     colors.text,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color:     colors.textDim,
    textAlign: 'center',
  },
  btn: {
    marginTop: spacing.sm,
  },
});
