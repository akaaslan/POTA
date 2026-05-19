import React from 'react';
import { useRunsFeed } from '../../src/hooks/useMatches';
import { useUIStore } from '../../src/store/ui';
import RunsScreen from '../../src/screens/RunsScreen';

export default function RunsTab() {
  var result = useRunsFeed();
  var activeFilters = useUIStore(function(s) { return s.activeFilters; });
  var openSheet = useUIStore(function(s) { return s.openSheet; });

  return (
    <RunsScreen
      data={result.data || null}
      activeFilters={activeFilters}
      onOpenMatch={function(match) { openSheet('match-detail', match); }}
      onCreateRun={function() { openSheet('create-run'); }}
      onOpenFilter={function(key) { openSheet('filter', { initialKey: key }); }}
    />
  );
}
