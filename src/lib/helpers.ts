// ─── Genel yardımcı fonksiyonlar ──────────────────────────────────────────────
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Promise-based gecikme (mock servisler için)
 */
export function delay<T>(value: T, ms?: number): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms ?? 350);
  });
}

/**
 * Supabase oturumundan mevcut kullanıcı ID'sini al
 */
export async function getCurrentUserId(
  supabase: SupabaseClient | null,
): Promise<string | null> {
  if (!supabase) return null;
  const result = await supabase.auth.getUser();
  return result.data?.user?.id ?? null;
}

/**
 * Tarih biçimlendirme — scheduled_at → görüntülenecek Türkçe tarih dizesi
 */
export function formatScheduledAt(isoString: string): string {
  if (!isoString) return '';
  const dt = new Date(isoString);
  return (
    dt.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' ' +
    dt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  );
}

/**
 * dayOffset + HH:MM → ISO tarih dizesi
 */
export function buildScheduledAt(
  dateTimeStr: string,
  dayOffset?: number,
): string | null {
  if (!dateTimeStr) return null;
  const words    = dateTimeStr.trim().split(' ');
  const timePart = words[words.length - 1] ?? '';
  const parts    = timePart.split(':');
  if (parts.length !== 2) return null;
  const d = new Date();
  d.setDate(d.getDate() + (dayOffset ?? 0));
  d.setHours(parseInt(parts[0]!, 10), parseInt(parts[1]!, 10), 0, 0);
  return d.toISOString();
}
