import type { Team } from '../types/domain/squad';

// ─── Team helpers ─────────────────────────────────────────────────────────────
export function isTeamFull(team: Team): boolean {
  // Chemistry ≥ 100 treated as "full" for display
  return team.chemistry >= 100;
}

export function chemistryLabel(chemistry: number): string {
  if (chemistry >= 90) return 'Mükemmel';
  if (chemistry >= 70) return 'Yüksek';
  if (chemistry >= 50) return 'Orta';
  return 'Düşük';
}
