import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useProfileFeed } from '../../src/hooks/useProfile';
import { useUIStore } from '../../src/store/ui';
import { useAuthStore } from '../../src/store/auth';
import { authService } from '../../src/services';
import ProfileScreen from '../../src/screens/ProfileScreen';
import { t } from '../../src/i18n';

export default function ProfileTab() {
  var result = useProfileFeed();
  var openSheet = useUIStore(function(s) { return s.openSheet; });
  var clearSession = useAuthStore(function(s) { return s.clearSession; });
  var [historyExpanded, setHistoryExpanded] = useState(false);
  var router = useRouter();
  var qc = useQueryClient();

  function handleLogout() {
    Alert.alert(
      t('profile.logout_title'),
      t('profile.logout_msg'),
      [
        { text: t('profile.logout_cancel'), style: 'cancel' },
        {
          text: t('profile.logout_confirm'),
          style: 'destructive',
          onPress: async function() {
            await authService.signOut();
            clearSession();
            qc.clear();
            router.replace('/onboarding');
          },
        },
      ]
    );
  }

  return (
    <ProfileScreen
      data={result.data || null}
      historyExpanded={historyExpanded}
      onToggleHistory={function() { setHistoryExpanded(function(v) { return !v; }); }}
      onOpenBadge={function(badge) {
        openSheet('badge-detail', badge);
      }}
      onUpgradePro={function() { openSheet('pro-upgrade'); }}
      onOpenLeaderboard={function() { openSheet('leaderboard'); }}
      onEditProfile={function() { openSheet('profile-edit'); }}
      onLogout={handleLogout}
    />
  );
}
