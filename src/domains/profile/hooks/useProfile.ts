import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services';
import { useAuthStore }   from '@state/auth.store';

export function useProfileFeed() {
  const session = useAuthStore((s) => s.session);
  return useQuery({
    queryKey:  ['profile', session],
    queryFn:   () => profileService.getProfileOverview(session?.profile ?? undefined),
    enabled:   !!session,
    staleTime: 60000,
  });
}
