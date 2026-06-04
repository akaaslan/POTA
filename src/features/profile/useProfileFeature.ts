import { useState, useCallback } from 'react';
import { Alert }              from 'react-native';
import { useRouter }          from 'expo-router';
import { useQueryClient }     from '@tanstack/react-query';
import { useProfileFeed }     from '@domains/profile';
import { authService }        from '@domains/auth/services';
import { useUIStore }         from '@state/ui.store';
import { useAuthStore }       from '@state/auth.store';
import { t }                  from '../../i18n';
import type { Badge }         from '../../types/domain/profile';

export function useProfileFeature() {
  const router        = useRouter();
  const qc            = useQueryClient();
  const result        = useProfileFeed();
  const openSheet     = useUIStore((s) => s.openSheet);
  const clearSession  = useAuthStore((s) => s.clearSession);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const onToggleHistory  = useCallback(() => setHistoryExpanded((v) => !v), []);
  const onOpenBadge      = useCallback((badge: Badge) => openSheet('badge-detail', badge), [openSheet]);
  const onUpgradePro     = useCallback(() => openSheet('pro-upgrade'), [openSheet]);
  const onOpenLeaderboard = useCallback(() => openSheet('leaderboard'), [openSheet]);
  const onEditProfile    = useCallback(() => openSheet('profile-edit'), [openSheet]);

  const onLogout = useCallback(() => {
    Alert.alert(
      t('profile.logout_title'),
      t('profile.logout_msg'),
      [
        { text: t('profile.logout_cancel'), style: 'cancel' },
        {
          text: t('profile.logout_confirm'),
          style: 'destructive',
          onPress: async () => {
            await authService.signOut();
            clearSession();
            qc.clear();
            router.replace('/onboarding');
          },
        },
      ],
    );
  }, [clearSession, qc, router]);

  return {
    data:            result.data ?? null,
    refreshing:      result.isRefetching,
    onRefresh:       result.refetch,
    isError:         result.isError,
    onRetry:         result.refetch,
    historyExpanded,
    onToggleHistory,
    onOpenBadge,
    onUpgradePro,
    onOpenLeaderboard,
    onEditProfile,
    onLogout,
  };
}
