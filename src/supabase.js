import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

var SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL      || '';
var SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (__DEV__ && !SUPABASE_URL) {
  console.warn('[supabase] EXPO_PUBLIC_SUPABASE_URL is missing — restart with --clear to pick up .env');
}

export var supabase = SUPABASE_URL
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage:            AsyncStorage,
        autoRefreshToken:   true,
        persistSession:     true,
        detectSessionInUrl: false,
      },
    })
  : null;
