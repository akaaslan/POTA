import { useCallback } from 'react';
import { useRouter }   from 'expo-router';
import { useHomeFeed } from '@domains/match';
import { useUIStore }  from '@state/ui.store';
import type { Match } from '../../types/domain/match';

export function useHomeFeature() {
  const router    = useRouter();
  const result    = useHomeFeed();
  const openSheet = useUIStore((s) => s.openSheet);

  const onOpenMatch    = useCallback((match: Match) => openSheet('match-detail', match), [openSheet]);
  const onOpenActivity = useCallback(() => openSheet('activity'), [openSheet]);
  const onCreateRun    = useCallback(() => router.push('/create-run'), [router]);
  const onUpgradePro   = useCallback(() => openSheet('pro-upgrade'), [openSheet]);

  return {
    data:       result.data ?? null,
    refreshing: result.isRefetching,
    onRefresh:  result.refetch,
    isError:    result.isError,
    onRetry:    result.refetch,
    onOpenMatch,
    onOpenActivity,
    onCreateRun,
    onUpgradePro,
  };
}
