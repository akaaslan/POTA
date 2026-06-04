import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@infrastructure/supabase';
import { api } from '@infrastructure/api/client';

/**
 * Supabase Realtime — match_participants değişikliklerini dinler.
 * Sadece TEK bir yerden (AppProviders) çağrılmalı.
 * Her mount'ta unique channel adı kullanılır → Strict Mode / duplicate sorunları olmaz.
 */
export function useRealtimeMatches(): void {
  const qc      = useQueryClient();
  // Her hook instance'ı için benzersiz ID — aynı channel adının yeniden kullanımını önler
  const idRef   = useRef(`mp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);

  useEffect(() => {
    if (api.isMock() || !supabase) return;
    const sb          = supabase;
    const channelName = idRef.current;

    const channel = sb
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'match_participants' },
        () => {
          qc.invalidateQueries({ queryKey: ['runs-feed'] });
          qc.invalidateQueries({ queryKey: ['home-feed'] });
        },
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [qc]);
}
