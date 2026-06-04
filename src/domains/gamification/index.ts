// ─── Gamification Domain ──────────────────────────────────────────────────────
// OVR hesaplama, derece sistemi ve rozet logic'i.
// Bu dosya ProfileScreen ve diğer UI bileşenlerinin import ettiği tek kaynak.

/** Ekranlarda kullanılan gösterim formatındaki istatistik nesnesi */
export interface DisplayStat {
  label: string;
  value: string | number;
}

// ─── OVR Hesaplama ────────────────────────────────────────────────────────────

/**
 * İstatistiklerden 55–99 arası OVR puanı hesaplar.
 * Algoritma: kazanma oranı %30 + ortalama sayı %14 ağırlığı.
 */
export function calcOVR(stats: DisplayStat[] | null | undefined): number {
  if (!stats || !stats.length) return 72;
  const winsEntry  = stats.find((s) => s.label === 'GALİBİYET');
  const gamesEntry = stats.find((s) => s.label === 'MAÇLAR');
  const ptsEntry   = stats.find((s) => s.label === 'ORT. SAYILAR');
  const wins  = winsEntry  ? parseInt(String(winsEntry.value))  || 0 : 0;
  const games = gamesEntry ? parseInt(String(gamesEntry.value)) || 1 : 1;
  const pts   = ptsEntry   ? parseFloat(String(ptsEntry.value)) || 0 : 0;
  const wr = wins / Math.max(1, games);
  return Math.min(99, Math.max(55, Math.round(55 + wr * 30 + Math.min(14, pts * 0.7))));
}

// ─── OVR Derece Sistemi ───────────────────────────────────────────────────────

/** OVR'den harf derecesi döndürür (S+ … C) */
export function ovrGrade(ovr: number): string {
  if (ovr >= 95) return 'S+';
  if (ovr >= 90) return 'S';
  if (ovr >= 85) return 'A+';
  if (ovr >= 80) return 'A';
  if (ovr >= 75) return 'B+';
  if (ovr >= 70) return 'B';
  if (ovr >= 65) return 'C+';
  return 'C';
}
