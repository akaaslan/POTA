import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/auth';
import { useUIStore } from '../../src/store/ui';
import { authService } from '../../src/services';
import { api } from '../../src/api/client';
import LoginScreen from '../../src/screens/LoginScreen';
import { C } from '../../src/theme';

export default function LoginRoute() {
  var router      = useRouter();
  var qc          = useQueryClient();
  var setSession  = useAuthStore(function(s) { return s.setSession; });
  var showToast   = useUIStore(function(s) { return s.showToast; });
  var [loading, setLoading]             = useState(false);
  var [googleLoading, setGoogleLoading] = useState(false);

  async function handleLogin(email: string, password: string) {
    if (!email || !email.includes('@')) {
      showToast('Geçerli bir e-posta adresi girin.', 'warn');
      return;
    }
    if (!password || password.length < 6) {
      showToast('Şifre en az 6 karakter olmalıdır.', 'warn');
      return;
    }
    setLoading(true);
    try {
      var sess;
      if (api.isMock()) {
        sess = await authService.signInMock({ email });
      } else {
        sess = await authService.signIn(email, password);
      }
      setSession(sess);
      qc.invalidateQueries();
      router.replace('/(tabs)/');
    } catch (e) {
      var msg = e instanceof Error ? e.message : 'Giriş yapılamadı. E-posta veya şifre hatalı.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      var result = await authService.signInWithGoogle();
      if (result.needsProfile) {
        // Yeni Google kullanıcısı — profil oluşturması lazım
        setSession(result);
        router.replace('/(auth)/register?fromGoogle=1');
      } else {
        setSession(result);
        qc.invalidateQueries();
        router.replace('/(tabs)/');
      }
    } catch (e) {
      var msg = e instanceof Error ? e.message : 'Google girişi başarısız oldu.';
      showToast(msg, 'error');
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleRegister() {
    router.push('/(auth)/register');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <LoginScreen
        onLogin={handleLogin}
        onGoogle={handleGoogle}
        onRegister={handleRegister}
        loading={loading}
        googleLoading={googleLoading}
      />
    </SafeAreaView>
  );
}
