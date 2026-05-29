import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services';
import { useAuthStore }        from '@state/auth.store';
import type { Notification }   from '../../../types/domain/notification';

export function useNotifications() {
  const session = useAuthStore((s) => s.session);
  return useQuery({
    queryKey:        ['notifications'],
    queryFn:         () => notificationService.getNotifications(),
    enabled:         !!session,
    refetchInterval: 60000,
  });
}

export function useNotificationsCount(): number {
  const { data } = useNotifications();
  if (!data) return 0;
  return data.filter((n) => !n.read).length;
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess:  (data: Notification[]) => qc.setQueryData(['notifications'], data),
  });
}
