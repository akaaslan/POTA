import type { ID } from '../common';

export type BookingStatus = 'confirmed' | 'cancelled' | 'pending';

export interface CourtBooking {
  id: ID;
  courtId: ID;
  courtName: string;
  userId: ID;
  slotStart: string;
  slotEnd: string;
  playersMax: number;
  fee: number;
  status: BookingStatus;
  createdAt: string;
}

export interface BookingSlot {
  slotStart: string;
  slotEnd: string;
  available: boolean;
}
