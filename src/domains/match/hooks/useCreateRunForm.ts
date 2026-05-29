import { useState } from 'react';
import { MOCK_COURTS } from '../../../data/mockData';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const COURTS: any[] = MOCK_COURTS as any[];

export const FORMAT_LABEL: Record<string, string> = { '3V3': '3v3 Yarı Saha', '5V5': '5v5 Tam Saha' };
export const LEVEL_LABEL: Record<string, string>  = { 'ROOKİE': 'Açık Saha', 'PRO-AM': 'Pro-Am', 'ELİT': 'Elit' };

function buildTimes(): string[] {
  const times: string[] = [];
  for (let h = 7; h <= 23; h++) {
    times.push((h < 10 ? '0' : '') + h + ':00');
    if (h < 23) times.push((h < 10 ? '0' : '') + h + ':30');
  }
  return times;
}
export const TIMES: string[] = buildTimes();
export const FEES: string[]  = ['Ücretsiz', '10 TL', '20 TL', '30 TL', '40 TL', '50 TL', '75 TL', '100 TL', 'Özel'];

function buildDays(): string[] {
  const labels: string[] = [];
  const today = new Date();
  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  for (let i = 0; i < 5; i++) {
    if (i === 0) { labels.push('Bugün'); continue; }
    if (i === 1) { labels.push('Yarın'); continue; }
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    labels.push(dayNames[d.getDay()] ?? '');
  }
  return labels;
}
export const DAYS: string[]              = buildDays();
export const MAX_BY_FMT: Record<string, number> = { '3V3': 6, '5V5': 10 };

export function useCreateRunForm() {
  const [courtId,     setCourtId]     = useState<string>(COURTS[0]?.id ?? '');
  const [format,      setFormat]      = useState<string>('3V3');
  const [level,       setLevel]       = useState<string>('ROOKİE');
  const [capacity,    setCapacity]    = useState<number>(6);
  const [dayIdx,      setDayIdx]      = useState<number>(0);
  const [timeIdx,     setTimeIdx]     = useState<number>(24); // 19:00
  const [feeIdx,      setFeeIdx]      = useState<number>(0);
  const [isPublic,    setIsPublic]    = useState<boolean>(true);
  const [title,       setTitle]       = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [customFee,   setCustomFee]   = useState<string>('');

  const maxPlayers = MAX_BY_FMT[format] ?? 6;

  function handleFormat(f: string): void {
    setFormat(f);
    const newMax = MAX_BY_FMT[f] ?? 6;
    if (capacity > newMax) setCapacity(newMax);
  }

  function buildMatchPayload(): Record<string, unknown> {
    const court    = COURTS.find((c) => c.id === courtId) ?? COURTS[0];
    const feeRaw   = FEES[feeIdx];
    const fee: string | null = feeRaw === 'Ücretsiz' ? null
      : feeRaw === 'Özel' ? (customFee.trim() || null)
      : (feeRaw?.replace(' TL', '') ?? null);
    const matchTitle = title.trim()
      ? title.trim().toUpperCase()
      : ((court?.name ?? '') + ' ' + (FORMAT_LABEL[format] ?? format)).toUpperCase();
    return {
      title:       matchTitle,
      courtId:     court?.id,
      courtName:   court?.name,
      district:    court?.district,
      format:      FORMAT_LABEL[format] ?? format,
      skillLevel:  LEVEL_LABEL[level]   ?? level,
      capacity,
      dayOffset:   dayIdx,
      dateTime:    (DAYS[dayIdx] ?? '') + ' ' + (TIMES[timeIdx] ?? ''),
      fee,
      isPublic,
      description: description.trim() || null,
    };
  }

  return {
    // state
    courtId, setCourtId,
    format,  handleFormat,
    level,   setLevel,
    capacity, setCapacity,
    dayIdx,  setDayIdx,
    timeIdx, setTimeIdx,
    feeIdx,  setFeeIdx,
    isPublic, setIsPublic,
    title,   setTitle,
    description, setDescription,
    customFee, setCustomFee,
    // computed
    maxPlayers,
    // constants
    COURTS, TIMES, FEES, DAYS, MAX_BY_FMT, FORMAT_LABEL,
    // builder
    buildMatchPayload,
  };
}
