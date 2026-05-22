import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/auth';
import { authService, profileService } from '../services';
import { api } from '../api/client';
import { supabase } from '../supabase';

export function useBootstrap() {
  var router = useRouter();
  var bootState = useAuthStore(function(s) { return s.bootState; });
  var setSession = useAuthStore(function(s) { return s.setSession; });
  var clearSession = useAuthStore(function(s) { return s.clearSession; });
  var setDraft = useAuthStore(function(s) { return s.setDraft; });
  var setBootState = useAuthStore(function(s) { return s.setBootState; });

  useEffect(function() {
    if (bootState !== 'idle') return;
    setBootState('loading');

    // Check existing session on launch
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

    // Listen for Supabase auth state changes (real mode only)
    if (!api.isMock()) {
      var subscription = supabase.auth.onAuthStateChange(function(event, sbSession) {
        if (event === 'SIGNED_OUT' || !sbSession) {
          clearSession();
          router.replace('/onboarding');
        } else if (event === 'TOKEN_REFRESHED' && sbSession) {
          // Session renewed — update store with refreshed data if needed
        }
      });
      return function() {
        if (subscription && subscription.data && subscription.data.subscription) {
          subscription.data.subscription.unsubscribe();
        }
      };
    }
  }, []);
}
