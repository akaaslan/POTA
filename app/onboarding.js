import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUIStore } from '../src/store/ui';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/auth';
import { authService, profileService } from '../src/services';
import OnboardingScreen from '../src/screens/OnboardingScreen';
import { C } from '../src/theme';
import { api } from '../src/api/client';

export default function OnboardingRoute() {
  var router = useRouter();
  var qc = useQueryClient();
  var draft = useAuthStore(function(s) { return s.draft; });
  var setDraft = useAuthStore(function(s) { return s.setDraft; });
  var setSession = useAuthStore(function(s) { return s.setSession; });
  var showToast = useUIStore(function(s) { return s.showToast; });
  var [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!draft || !draft.nickname || !draft.district) {
      showToast('Takma adın ve bölgen zorunludur.', 'warn');
      return;
    }
    if (!api.isMock()) {
      if (!draft.email || !draft.email.includes('@')) {
        showToast('Geçerli bir e-posta adresi girin.', 'warn');
        return;
      }
      if (!draft.password || draft.password.length < 6) {
        showToast('Şifre en az 6 karakter olmalıdır.', 'warn');
        return;
      }
    }
    setSubmitting(true);
    try {
      var sess;
      if (api.isMock()) {
        sess = await authService.signInMock(draft);
      } else {
        sess = await authService.signUp(draft.email, draft.password, draft);
      }
      setSession(sess);
      qc.invalidateQueries();
      router.replace('/(tabs)/');
    } catch (e) {
      var msg = (e && e.message) ? e.message : 'Kayıt oluşturulamadı. Tekrar dene.';
      showToast(msg, 'error');
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
