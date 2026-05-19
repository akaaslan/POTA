import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services';
import { useAuthStore } from '../store/auth';

export function useProfileFeed() {
  var session = useAuthStore(function(s) { return s.session; });
  return useQuery({
    queryKey: ['profile', session],
    queryFn: function() {
      return profileService.getProfileOverview(session ? session.profile : null);
    },
    enabled: !!session,
    staleTime: 60000,
  });
}
