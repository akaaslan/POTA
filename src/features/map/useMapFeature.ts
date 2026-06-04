import { useCallback } from 'react';
import { useUIStore }  from '@state/ui.store';
import type { Match } from '../../types/domain/match';

export function useMapFeature() {
  const openSheet    = useUIStore((s) => s.openSheet);
  const onOpenMatch  = useCallback((match: Match) => openSheet('match-detail', match), [openSheet]);
  const onOpenBooking = useCallback(
    (courtId: string, courtName: string) => openSheet('booking', { courtId, courtName }),
    [openSheet],
  );
  return { onOpenMatch, onOpenBooking };
}
