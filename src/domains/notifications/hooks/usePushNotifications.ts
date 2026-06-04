import { useEffect } from 'react';
import { addNotificationResponseListener, registerForPushNotifications, clearBadge } from '../push';
import { useAuthStore } from '@state/auth.store';
import { useUIStore } from '@state/ui.store';

/**
 * Push bildirim kayıt + listener hook'u.
 * Expo Go'da sessizce pas geçer, dev/production build'de tam çalışır.
 * Root layout'ta (AppProviders içinde) bir kez mount edilir.
 */
export function usePushNotifications(): void {
  const session   = useAuthStore((s) => s.session);
  const openSheet = useUIStore((s) => s.openSheet);

  // Oturum açıldığında token kaydet
  useEffect(() => {
    if (!session) return;
    registerForPushNotifications().catch(() => {});
  }, [session?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bildirime tıklanınca sheet aç
  useEffect(() => {
    const unsub = addNotificationResponseListener((data) => {
      if (data?.type === 'match_reminder' && data?.matchId) {
        openSheet('match-detail', { id: data.matchId });
      } else if (data?.type === 'team_invite' && data?.teamId) {
        openSheet('team-detail', { id: data.teamId });
      }
    });
    return unsub;
  }, [openSheet]);

  // Uygulama açıldığında badge sıfırla
  useEffect(() => {
    clearBadge().catch(() => {});
  }, []);
}
