import type { Match, MatchFilters, MatchFormat, MatchFormatKey, MatchSkillKey, MatchSkillLevel } from '../types/domain/match';
import type { Nullable } from '../types/common';

// ─── Label mappings ───────────────────────────────────────────────────────────
export const FORMAT_LABEL: Record<MatchFormatKey, MatchFormat> = {
  '3V3': '3v3 Yarı Saha',
  '5V5': '5v5 Tam Saha',
};

export const SKILL_LABEL: Record<MatchSkillKey, MatchSkillLevel> = {
  'ROOKİE': 'Açık Saha',
  'ORTA':   'Orta Seviye',
  'PRO-AM': 'Pro-Am',
  'ELİT':   'Elit',
};

// ─── Default filter state ─────────────────────────────────────────────────────
export const DEFAULT_MATCH_FILTERS: MatchFilters = {
  district: '',
  skill:    '',
  format:   '',
};

// ─── Match helpers ────────────────────────────────────────────────────────────
export function isMatchLive(match: Match): boolean {
  return match.status === 'live';
}

export function isMatchFull(match: Match): boolean {
  return match.playersJoined >= match.capacity;
}

export function openSpots(match: Match): number {
  return Math.max(0, match.capacity - match.playersJoined);
}

export function isFreeMatch(match: Match): boolean {
  return match.feeType === 'Ucretsiz';
}

export function applyMatchFilters(
  matches: Match[],
  filters: MatchFilters,
): Match[] {
  return matches.filter((m) => {
    if (filters.district && m.district !== filters.district) return false;
    if (filters.skill && m.skillLevel !== filters.skill) return false;
    if (filters.format && m.format !== filters.format) return false;
    return true;
  });
}
