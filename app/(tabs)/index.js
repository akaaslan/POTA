import React from 'react';
import { Alert } from 'react-native';
import { useHomeFeed } from '../../src/hooks/useMatches';
import { useUIStore } from '../../src/store/ui';
import HomeScreen from '../../src/screens/HomeScreen';

export default function HomeTab() {
  var result = useHomeFeed();
  var openSheet = useUIStore(function(s) { return s.openSheet; });

  return (
    <HomeScreen
      data={result.data || null}
      onOpenMatch={function(match) { openSheet('match-detail', match); }}
      onOpenActivity={function() {
        Alert.alert(
          'Ekip Aktivitesi',
          'Aktivite akışı çok yakında eklenecek.',
          [{ text: 'Tamam' }]
        );
      }}
      onCreateRun={function() { openSheet('create-run'); }}
      onUpgradePro={function() {
        Alert.alert(
          'PRO OL',
          'Gelişmiş istatistikler, öncelikli saha erişimi ve daha fazlası için PRO aboneliğe geç.',
          [{ text: 'İptal', style: 'cancel' }, { text: 'YÜKSELT' }]
        );
      }}
    />
  );
}
