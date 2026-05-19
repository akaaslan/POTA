import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/auth';
import { authService, profileService } from '../services';

export function useBootstrap() {
  var router = useRouter();
  var bootState = useAuthStore(function(s) { return s.bootState; });
  var setSession = useAuthStore(function(s) { return s.setSession; });
  var setDraft = useAuthStore(function(s) { return s.setDraft; });
  var setBootState = useAuthStore(function(s) { return s.setBootState; });

  useEffect(function() {
    if (bootState !== 'idle') return;
    setBootState('loading');
    authService.getSession().then(function(sess) {
      if (sess) {
        setSession(sess);
        router.replace('/(tabs)/');
      } else {
        setDraft(profileService.createDefaultProfileDraft());
        setBootState('guest');
        router.replace('/onboarding');
      }
    }).catch(function() {
      setDraft(profileService.createDefaultProfileDraft());
      setBootState('guest');
      router.replace('/onboarding');
    });
  }, []);
}
