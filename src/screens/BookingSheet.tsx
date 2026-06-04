import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity, ScrollView,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { C, F, R, S } from '../theme';
import { useAvailableSlots, useCreateBooking } from '@domains/booking/hooks/useBooking';
import type { BookingSlot } from '../types/domain/booking';
import type { ID } from '../types/common';

interface BookingSheetProps {
  courtId:   ID | null;
  courtName: string;
  onClose:   () => void;
}

function SlotButton({ slot, selected, onPress }: { slot: BookingSlot; selected: boolean; onPress: () => void }) {
  var start = new Date(slot.slotStart).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  var end   = new Date(slot.slotEnd).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  return (
    <TouchableOpacity
      style={[bk.slot, !slot.available && bk.slotUnavailable, selected && bk.slotSelected]}
      onPress={onPress}
      disabled={!slot.available}
      activeOpacity={0.8}
    >
      <Text style={[bk.slotTime, selected && bk.slotTimeSelected, !slot.available && bk.slotTimeDisabled]}>
        {start}
      </Text>
      <Text style={[bk.slotEnd, !slot.available && bk.slotTimeDisabled]}>{end}</Text>
      {!slot.available ? <Text style={bk.slotDot}>✕</Text> : null}
    </TouchableOpacity>
  );
}

export default function BookingSheet({ courtId, courtName, onClose }: BookingSheetProps) {
  var today = new Date();
  var [selectedDate, setDate]   = useState(today);
  var [selectedSlot, setSlot]   = useState<BookingSlot | null>(null);
  var [playersMax, setPlayersMax] = useState(10);
  var slotsResult  = useAvailableSlots(courtId, selectedDate);
  var createBooking = useCreateBooking();

  var dates = Array.from({ length: 7 }, (_, i) => {
    var d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  function handleBook() {
    if (!courtId || !selectedSlot) return;
    createBooking.mutate({ courtId, slot: selectedSlot, playersMax, fee: 0 }, {
      onSuccess: () => onClose(),
    });
  }

  return (
    <Modal visible={!!courtId} transparent animationType="slide" onRequestClose={onClose}>
      <View style={bk.root}>
        <TouchableOpacity style={bk.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={bk.sheet}>
          <View style={bk.handle} />
          <View style={bk.header}>
            <Text style={bk.title}>{courtName}</Text>
            <Text style={bk.subtitle}>SAHA REZERVASYONU</Text>
            <TouchableOpacity style={bk.closeBtn} onPress={onClose}>
              <Text style={bk.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Gün seçici */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={bk.dateRow} contentContainerStyle={bk.dateContent}>
            {dates.map(function(date) {
              var active = date.toDateString() === selectedDate.toDateString();
              var day = date.toLocaleDateString('tr-TR', { weekday: 'short' }).toUpperCase();
              var num = date.getDate();
              return (
                <TouchableOpacity
                  key={date.toISOString()}
                  style={[bk.dateBtn, active && bk.dateBtnActive]}
                  onPress={function() { setDate(date); setSlot(null); }}
                  activeOpacity={0.8}
                >
                  <Text style={[bk.dateBtnDay, active && bk.dateBtnDayActive]}>{day}</Text>
                  <Text style={[bk.dateBtnNum, active && bk.dateBtnNumActive]}>{num}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Slot ızgarası */}
          <ScrollView style={bk.slotsScroll} showsVerticalScrollIndicator={false} contentContainerStyle={bk.slotsGrid}>
            {slotsResult.isLoading ? (
              <ActivityIndicator color={C.lime} style={{ marginTop: 32 }} />
            ) : (
              (slotsResult.data ?? []).map(function(slot: BookingSlot) {
                return (
                  <SlotButton
                    key={slot.slotStart}
                    slot={slot}
                    selected={selectedSlot?.slotStart === slot.slotStart}
                    onPress={function() { setSlot(slot); }}
                  />
                );
              })
            )}
          </ScrollView>

          {/* Footer */}
          <View style={bk.footer}>
            {selectedSlot ? (
              <Text style={bk.selectionTxt}>
                {new Date(selectedSlot.slotStart).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                {' — '}
                {new Date(selectedSlot.slotEnd).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                {'  ·  '}
                {playersMax} oyuncu
              </Text>
            ) : null}
            <TouchableOpacity
              style={[bk.bookBtn, !selectedSlot && bk.bookBtnDisabled]}
              disabled={!selectedSlot || createBooking.isPending}
              onPress={handleBook}
              activeOpacity={0.85}
            >
              {createBooking.isPending
                ? <ActivityIndicator size="small" color="#000" />
                : <Text style={bk.bookBtnTxt}>{selectedSlot ? 'REZERVE ET  →' : 'SAAT SEÇ'}</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const bk = StyleSheet.create({
  root:    { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet: { backgroundColor: C.bgCard, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, maxHeight: '85%', paddingBottom: 32 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginTop: 10 },
  header: { paddingHorizontal: S.screen, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: C.border },
  title: { color: C.text, fontSize: F.lg, fontWeight: '900', letterSpacing: 0.5 },
  subtitle: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 2, marginTop: 2 },
  closeBtn: { position: 'absolute', right: S.screen, top: S.md, padding: 4 },
  closeIcon: { color: C.textDim, fontSize: F.md },
  dateRow: { maxHeight: 72 },
  dateContent: { paddingHorizontal: S.screen, gap: S.sm, paddingVertical: S.sm },
  dateBtn: { width: 52, height: 52, borderRadius: R.sm, backgroundColor: C.bgCard2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  dateBtnActive: { backgroundColor: C.lime, borderColor: C.lime },
  dateBtnDay: { color: C.textDim, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  dateBtnDayActive: { color: '#000' },
  dateBtnNum: { color: C.text, fontSize: F.sm, fontWeight: '900', marginTop: 2 },
  dateBtnNumActive: { color: '#000' },
  slotsScroll: { flex: 1 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, padding: S.screen },
  slot: { width: '22%', aspectRatio: 1, borderRadius: R.sm, backgroundColor: C.bgCard2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  slotSelected: { borderColor: C.lime, backgroundColor: 'rgba(200,240,0,0.1)' },
  slotUnavailable: { opacity: 0.35 },
  slotTime: { color: C.text, fontSize: F.xs, fontWeight: '900' },
  slotTimeSelected: { color: C.lime },
  slotTimeDisabled: { color: C.textMuted },
  slotEnd: { color: C.textDim, fontSize: 9, marginTop: 2 },
  slotDot: { color: C.red, fontSize: 10, fontWeight: '700', marginTop: 2 },
  footer: { paddingHorizontal: S.screen, paddingTop: S.sm, borderTopWidth: 1, borderTopColor: C.border },
  selectionTxt: { color: C.textDim, fontSize: F.xs, textAlign: 'center', marginBottom: S.sm, fontWeight: '700' },
  bookBtn: { backgroundColor: C.lime, borderRadius: R.md, paddingVertical: 16, alignItems: 'center' },
  bookBtnDisabled: { backgroundColor: C.bgCard2 },
  bookBtnTxt: { color: '#000', fontSize: F.sm, fontWeight: '900', letterSpacing: 1.5 },
});
