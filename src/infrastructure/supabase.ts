import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL      = process.env['EXPO_PUBLIC_SUPABASE_URL']      ?? '';
const SUPABASE_ANON_KEY = process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] ?? '';

if (__DEV__ && !SUPABASE_URL) {
  console.warn('[supabase] EXPO_PUBLIC_SUPABASE_URL is missing — restart with --clear to pick up .env');
}

export const supabase: SupabaseClient | null = SUPABASE_URL
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage:            AsyncStorage,
        autoRefreshToken:   true,
        persistSession:     true,
        detectSessionInUrl: false,
      },
    })
  : null;
