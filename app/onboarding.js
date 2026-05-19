import React, { useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/auth';
import { authService, profileService } from '../src/services';
import OnboardingScreen from '../src/screens/OnboardingScreen';
import { C } from '../src/theme';

export default function OnboardingRoute() {
  var router = useRouter();
  var qc = useQueryClient();
  var draft = useAuthStore(function(s) { return s.draft; });
  var setDraft = useAuthStore(function(s) { return s.setDraft; });
  var setSession = useAuthStore(function(s) { return s.setSession; });
  var [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!draft || !draft.nickname || !draft.district) {
      Alert.alert('Eksik Bilgi', 'Takma adın ve bölgen zorunludur.');
      return;
    }
    setSubmitting(true);
    try {
      var sess = await authService.signInMock(draft);
      setSession(sess);
      qc.invalidateQueries();
      router.replace('/(tabs)/');
    } catch (e) {
      Alert.alert('Hata', 'Giriş yapılamadı.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <OnboardingScreen
        draft={draft || profileService.createDefaultProfileDraft()}
        onChange={setDraft}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </SafeAreaView>
  );
}
