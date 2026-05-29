import { useEffect }       from 'react';
import { useRouter }      from 'expo-router';
import { useAuthStore }   from '@state/auth.store';
import { authService }    from '../services';
import { profileService } from '@domains/profile/services';
import { api }            from '@infrastructure/api/client';
import { supabase }       from '@infrastructure/supabase';

export function useBootstrap(): void {
  const router       = useRouter();
  const bootState    = useAuthStore((s) => s.bootState);
  const setSession   = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);
  const setDraft     = useAuthStore((s) => s.setDraft);
  const setBootState = useAuthStore((s) => s.setBootState);

  useEffect(() => {
    if (bootState !== 'idle') return;
    setBootState('loading');

    authService.getSession().then((sess) => {
      if (sess) {
        setSession(sess);
        router.replace('/(tabs)/');
      } else {
        setDraft(profileService.createDefaultProfileDraft());
        setBootState('guest');
        router.replace('/(auth)/login');
      }
    });

    if (!api.isMock() && supabase) {
      const subscription = supabase.auth.onAuthStateChange((event, sbSession) => {
        if (event === 'SIGNED_OUT' || !sbSession) {
          clearSession();
          router.replace('/(auth)/login');
        } else if (event === 'SIGNED_IN' && sbSession) {
          authService.getSession().then((sess) => {
            if (sess) setSession(sess);
          }).catch(() => {});
        }
      });
      return () => {
        subscription.data?.subscription.unsubscribe();
      };
    }
  }, [bootState]);
}
