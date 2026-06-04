import { api }      from '@infrastructure/api/client';
import { supabase } from '@infrastructure/supabase';
import { delay, getCurrentUserId } from '@lib/helpers';
import type { CourtBooking, BookingSlot } from '../../types/domain/booking';
import type { ID } from '../../types/common';

function generateSlots(date: Date, courtId: string): BookingSlot[] {
  const slots: BookingSlot[] = [];
  for (let h = 8; h <= 22; h++) {
    const start = new Date(date);
    start.setHours(h, 0, 0, 0);
    const end = new Date(start);
    end.setHours(h + 1);
    slots.push({
      slotStart: start.toISOString(),
      slotEnd:   end.toISOString(),
      available: Math.random() > 0.3, // Mock: %70 müsait
    });
  }
  return slots;
}

export const bookingService = {
  async getAvailableSlots(courtId: ID, date: Date): Promise<BookingSlot[]> {
    if (api.isMock() || !supabase) return delay(generateSlots(date, courtId), 300);
    const sb = supabase;

    const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999);

    const { data, error } = await sb
      .from('court_bookings')
      .select('slot_start, slot_end')
      .eq('court_id', courtId)
      .eq('status', 'confirmed')
      .gte('slot_start', dayStart.toISOString())
      .lte('slot_start', dayEnd.toISOString());

    if (error) throw error;
    const bookedStarts = new Set((data ?? []).map((b) => b['slot_start'] as string));

    return generateSlots(date, courtId).map((s) => ({
      ...s,
      available: !bookedStarts.has(s.slotStart),
    }));
  },

  async createBooking(courtId: ID, slot: BookingSlot, playersMax: number, fee: number): Promise<CourtBooking> {
    if (api.isMock()) {
      return delay({
        id:        'booking-' + Date.now(),
        courtId,
        courtName: 'Mock Saha',
        userId:    'mock-user',
        slotStart: slot.slotStart,
        slotEnd:   slot.slotEnd,
        playersMax,
        fee,
        status:    'confirmed',
        createdAt: new Date().toISOString(),
      }, 400);
    }
    if (!supabase) throw new Error('Supabase bağlantısı yok');
    const sb = supabase;
    const userId = await getCurrentUserId(sb);
    if (!userId) throw new Error('Oturum gerekli');

    const { data, error } = await sb
      .from('court_bookings')
      .insert({
        court_id:    courtId,
        user_id:     userId,
        slot_start:  slot.slotStart,
        slot_end:    slot.slotEnd,
        players_max: playersMax,
        fee,
        status:      'confirmed',
      })
      .select('*, courts(name)')
      .single();
    if (error) throw error;

    const court = (data['courts'] as Record<string, string> | null);
    return {
      id:        data['id'] as ID,
      courtId:   data['court_id'] as ID,
      courtName: court?.['name'] ?? '',
      userId,
      slotStart: data['slot_start'] as string,
      slotEnd:   data['slot_end'] as string,
      playersMax: data['players_max'] as number,
      fee:       data['fee'] as number,
      status:    data['status'] as CourtBooking['status'],
      createdAt: data['created_at'] as string,
    };
  },

  async getUserBookings(): Promise<CourtBooking[]> {
    if (api.isMock() || !supabase) return delay([], 200);
    const sb = supabase;
    const userId = await getCurrentUserId(sb);
    if (!userId) return [];
    const { data, error } = await sb
      .from('court_bookings')
      .select('*, courts(name)')
      .eq('user_id', userId)
      .order('slot_start', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => {
      const court = (row['courts'] as Record<string, string> | null);
      return {
        id:        row['id'] as ID,
        courtId:   row['court_id'] as ID,
        courtName: court?.['name'] ?? '',
        userId,
        slotStart: row['slot_start'] as string,
        slotEnd:   row['slot_end'] as string,
        playersMax: row['players_max'] as number,
        fee:       row['fee'] as number,
        status:    row['status'] as CourtBooking['status'],
        createdAt: row['created_at'] as string,
      };
    });
  },

  async cancelBooking(bookingId: ID): Promise<void> {
    if (api.isMock() || !supabase) return;
    const { error } = await supabase
      .from('court_bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    if (error) throw error;
  },
};
