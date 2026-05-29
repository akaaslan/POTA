import React from 'react';
import { useRouter } from 'expo-router';
import { useRunsFeed } from '../../src/hooks/useMatches';
import { useUIStore } from '../../src/store/ui';
import RunsScreen from '../../src/screens/RunsScreen';

var DEFAULT_FILTERS = { district: 'Tümü', skill: 'Tümü', format: 'Tümü' };

export default function RunsTab() {
  var router = useRouter();
  var result = useRunsFeed();
  var activeFilters = useUIStore(function(s) { return s.activeFilters; });
  var openSheet = useUIStore(function(s) { return s.openSheet; });
  var setFilters = useUIStore(function(s) { return s.setFilters; });

  return (
    <RunsScreen
      data={result.data || null}
      activeFilters={activeFilters}
      refreshing={result.isRefetching}
      onRefresh={result.refetch}
      isError={result.isError}
      onRetry={result.refetch}
      onOpenMatch={function(match) { openSheet('match-detail', match); }}
      onCreateRun={function() { router.push('/create-run'); }}
      onOpenFilter={function(key) { router.push({ pathname: '/filter', params: { initialKey: key || 'district' } }); }}
      onClearFilters={function() { setFilters(DEFAULT_FILTERS); }}
      onUpgradePro={function() { openSheet('pro-upgrade'); }}
    />
  );
}
