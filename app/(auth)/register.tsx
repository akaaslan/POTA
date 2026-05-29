import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/auth';
import { useUIStore } from '../../src/store/ui';
import { authService, profileService } from '../../src/services';
import { api } from '../../src/api/client';
import OnboardingScreen from '../../src/screens/OnboardingScreen';
import { C } from '../../src/theme';

export default function RegisterRoute() {
  var router       = useRouter();
  var params       = useLocalSearchParams();
  var qc           = useQueryClient();
  var session      = useAuthStore(function(s) { return s.session; });
  var draft        = useAuthStore(function(s) { return s.draft; });
  var setDraft     = useAuthStore(function(s) { return s.setDraft; });
  var setSession   = useAuthStore(function(s) { return s.setSession; });
  var showToast    = useUIStore(function(s) { return s.showToast; });
  var [submitting, setSubmitting] = useState(false);

  // fromGoogle=1: kullanıcı zaten auth, sadece profil oluşturuyor
  var fromGoogle = params.fromGoogle === '1';

  var currentDraft = draft || profileService.createDefaultProfileDraft();

  async function handleSubmit() {
    if (!currentDraft || !currentDraft.nickname || !currentDraft.district) {
      showToast('Takma adın ve bölgen zorunludur.', 'warn');
      return;
    }
    if (!fromGoogle && !api.isMock()) {
      if (!currentDraft.email || !currentDraft.email.includes('@')) {
        showToast('Geçerli bir e-posta adresi girin.', 'warn');
        return;
      }
      if (!currentDraft.password || currentDraft.password.length < 6) {
        showToast('Şifre en az 6 karakter olmalıdır.', 'warn');
        return;
      }
    }
    setSubmitting(true);
    try {
      var sess;
      if (fromGoogle && session) {
        // Google ile giriş yapıldı, sadece profil kaydet
        var { supabase } = await import('../../src/supabase');
        var profileInsert = {
          id:            session.id,
          nickname:      currentDraft.nickname     || '',
          district:      currentDraft.district     || '',
          jersey_number: currentDraft.jerseyNumber || '',
          position:      currentDraft.position     || '',
          archetype:     currentDraft.archetype    || '',
          experience:    currentDraft.experience   || '',
          bio:           currentDraft.bio          || '',
        };
        var insertResult = await supabase.from('profiles').upsert(profileInsert);
        if (insertResult.error) throw insertResult.error;
        sess = Object.assign({}, session, { profile: profileInsert, needsProfile: false });
      } else if (api.isMock()) {
        sess = await authService.signInMock(currentDraft);
      } else {
        sess = await authService.signUp(currentDraft.email, currentDraft.password, currentDraft);
      }
      setSession(sess);
      qc.invalidateQueries();
      router.replace('/(tabs)/');
    } catch (e) {
      var msg = e && e.message ? e.message : 'Kayıt oluşturulamadı. Tekrar dene.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogin() {
    router.push('/(auth)/login');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <OnboardingScreen
        draft={currentDraft}
        onChange={setDraft}
        onSubmit={handleSubmit}
        onLogin={handleLogin}
        submitting={submitting}
        hideAuth={fromGoogle}
        isRegister
      />
    </SafeAreaView>
  );
}
