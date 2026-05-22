import React from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useHomeFeed } from '../../src/hooks/useMatches';
import { useUIStore } from '../../src/store/ui';
import HomeScreen from '../../src/screens/HomeScreen';

export default function HomeTab() {
  var router = useRouter();
  var result = useHomeFeed();
  var openSheet = useUIStore(function(s) { return s.openSheet; });

  return (
    <HomeScreen
      data={result.data || null}
      refreshing={result.isRefetching}
      onRefresh={result.refetch}
      isError={result.isError}
      onRetry={result.refetch}
      onOpenMatch={function(match) { openSheet('match-detail', match); }}
      onOpenActivity={function() { openSheet('activity'); }}
      onCreateRun={function() { router.push('/create-run'); }}
      onUpgradePro={function() { openSheet('pro-upgrade'); }}
    />
  );
}
