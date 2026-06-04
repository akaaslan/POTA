import { useCallback } from 'react';
import { useRouter }    from 'expo-router';
import { useRunsFeed }  from '@domains/match';
import { useUIStore }   from '@state/ui.store';
import type { Match, MatchFilters } from '../../types/domain/match';

const DEFAULT_FILTERS: MatchFilters = { district: 'Tümü', skill: 'Tümü', format: 'Tümü' };

export function useRunsFeature() {
  const router        = useRouter();
  const result        = useRunsFeed();
  const activeFilters = useUIStore((s) => s.activeFilters);
  const openSheet     = useUIStore((s) => s.openSheet);
  const setFilters    = useUIStore((s) => s.setFilters);

  const onOpenMatch    = useCallback((match: Match) => openSheet('match-detail', match), [openSheet]);
  const onCreateRun    = useCallback(() => router.push('/create-run'), [router]);
  const onOpenFilter   = useCallback((key: string) => router.push({ pathname: '/filter', params: { initialKey: key || 'district' } }), [router]);
  const onClearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [setFilters]);
  const onUpgradePro   = useCallback(() => openSheet('pro-upgrade'), [openSheet]);

  return {
    data:         result.data ?? null,
    activeFilters,
    refreshing:   result.isRefetching,
    onRefresh:    result.refetch,
    isError:      result.isError,
    onRetry:      result.refetch,
    onOpenMatch,
    onCreateRun,
    onOpenFilter,
    onClearFilters,
    onUpgradePro,
  };
}
