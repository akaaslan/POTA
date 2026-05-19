import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useProfileFeed } from '../../src/hooks/useProfile';
import { useUIStore } from '../../src/store/ui';
import ProfileScreen from '../../src/screens/ProfileScreen';

export default function ProfileTab() {
  var result = useProfileFeed();
  var openSheet = useUIStore(function(s) { return s.openSheet; });
  var [historyExpanded, setHistoryExpanded] = useState(false);

  return (
    <ProfileScreen
      data={result.data || null}
      historyExpanded={historyExpanded}
      onToggleHistory={function() { setHistoryExpanded(function(v) { return !v; }); }}
      onOpenBadge={function(badge) {
        Alert.alert(
          badge.label,
          badge.active
            ? 'Bu rozet aktif. Sahada kazandın, maçlarda kanıtladın.'
            : 'Bu rozeti kazanmak için daha fazla maça katıl.',
          [{ text: 'Tamam' }]
        );
      }}
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
