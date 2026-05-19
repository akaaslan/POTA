import React from 'react';
import { Alert } from 'react-native';
import { useTeamFeed } from '../../src/hooks/useTeams';
import { useUIStore } from '../../src/store/ui';
import SquadScreen from '../../src/screens/SquadScreen';

export default function SquadTab() {
  var result = useTeamFeed();
  var openSheet = useUIStore(function(s) { return s.openSheet; });

  return (
    <SquadScreen
      data={result.data || null}
      onOpenTeam={function(team) { openSheet('team-detail', team); }}
      onOpenChat={function() { openSheet('chat'); }}
      onManageLineup={function() {
        Alert.alert('Kadro Düzenle', 'Bu özellik yakında geliyor.', [{ text: 'Tamam' }]);
      }}
    />
  );
}
