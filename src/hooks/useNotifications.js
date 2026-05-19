import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services';
import { useAuthStore } from '../store/auth';

export function useNotifications() {
  var session = useAuthStore(function(s) { return s.session; });
  return useQuery({
    queryKey: ['notifications'],
    queryFn: function() { return notificationService.getNotifications(); },
    enabled: !!session,
    refetchInterval: 60000,
  });
}

export function useNotificationsCount() {
  var result = useNotifications();
  if (!result.data) return 0;
  return result.data.filter(function(n) { return !n.read; }).length;
}

export function useMarkAllRead() {
  var qc = useQueryClient();
  return useMutation({
    mutationFn: function() { return notificationService.markAllRead(); },
    onSuccess: function(data) {
      qc.setQueryData(['notifications'], data);
    },
  });
}
