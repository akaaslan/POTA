import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../services';
import { useUIStore } from '@state/ui.store';
import type { BookingSlot } from '../../../types/domain/booking';
import type { ID } from '../../../types/common';

export function useAvailableSlots(courtId: ID | null, date: Date) {
  return useQuery({
    queryKey:  ['booking-slots', courtId, date.toDateString()],
    queryFn:   () => bookingService.getAvailableSlots(courtId!, date),
    enabled:   !!courtId,
    staleTime: 60_000,
  });
}

export function useUserBookings() {
  return useQuery({
    queryKey: ['user-bookings'],
    queryFn:  () => bookingService.getUserBookings(),
    staleTime: 30_000,
  });
}

export function useCreateBooking() {
  const qc        = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  return useMutation({
    mutationFn: (params: { courtId: ID; slot: BookingSlot; playersMax: number; fee: number }) =>
      bookingService.createBooking(params.courtId, params.slot, params.playersMax, params.fee),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking-slots'] });
      qc.invalidateQueries({ queryKey: ['user-bookings'] });
      showToast('Saha rezerve edildi! 🏀', 'success');
    },
    onError: () => showToast('Rezervasyon oluşturulamadı. Tekrar dene.', 'error'),
  });
}

export function useCancelBooking() {
  const qc        = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  return useMutation({
    mutationFn: (bookingId: ID) => bookingService.cancelBooking(bookingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-bookings'] });
      showToast('Rezervasyon iptal edildi.', 'info');
    },
    onError: () => showToast('İptal edilemedi. Tekrar dene.', 'error'),
  });
}
