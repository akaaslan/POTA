import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followService } from '../services';
import { useUIStore } from '@state/ui.store';
import type { ID } from '../../../types/common';

export function useFollowCounts(targetUserId: ID | null) {
  return useQuery({
    queryKey:  ['follow-counts', targetUserId],
    queryFn:   () => followService.getFollowCounts(targetUserId!),
    enabled:   !!targetUserId,
    staleTime: 30_000,
  });
}

export function useFollowToggle(targetUserId: ID | null) {
  const qc        = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  const follow = useMutation({
    mutationFn: () => followService.follow(targetUserId!),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['follow-counts', targetUserId] }); showToast('Takip edildi! 🏀', 'success'); },
    onError:    () => showToast('Takip edilemedi. Tekrar dene.', 'error'),
  });

  const unfollow = useMutation({
    mutationFn: () => followService.unfollow(targetUserId!),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['follow-counts', targetUserId] }); },
    onError:    () => showToast('Takipten çıkılamadı. Tekrar dene.', 'error'),
  });

  return { follow, unfollow, isPending: follow.isPending || unfollow.isPending };
}
