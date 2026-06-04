// ─── Notification Service ─────────────────────────────────────────────────────
import { api }      from '@infrastructure/api/client';
import { supabase } from '@infrastructure/supabase';
import { mockStore } from '@lib/mock/store';
import { delay, getCurrentUserId } from '@lib/helpers';
import type { Notification } from '../../types/domain/notification';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    if (api.isMock()) return delay(mockStore.notifications.slice() as Notification[], 200);
    const userId = await getCurrentUserId(supabase);
    if (!userId) return [];
    const { data: rows, error } = await supabase!
      .from('notifications').select('*')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    return (rows ?? []).map((n) => ({
      id:    n.id,
      type:  n.type  ?? 'info',
      title: n.title ?? '',
      body:  n.body  ?? '',
      read:  n.read  ?? false,
      time:  n.created_at ? new Date(n.created_at).toLocaleDateString('tr-TR') : '',
    })) as Notification[];
  },

  async markAllRead(): Promise<Notification[]> {
    if (api.isMock()) {
      mockStore.notifications = mockStore.notifications.map((n) => ({ ...n, read: true }));
      return delay(mockStore.notifications.slice() as Notification[], 200);
    }
    const userId = await getCurrentUserId(supabase);
    if (!userId) return [];
    await supabase!.from('notifications').update({ read: true }).eq('user_id', userId);
    return notificationService.getNotifications();
  },

};
