// ─── Tier / Skill level color maps — tek kaynak ───────────────────────────────
// Tüm ekranlar ve bileşenler bu sabitten import etmeli.

/** Beceri seviyesi → renk (HomeScreen, RunsScreen, MatchDetailSheet) */
export const SKILL_TIER_COLOR: Record<string, string> = {
  'Açık Saha':   '#4ADE80',
  'Orta Seviye': '#A8CC00',
  'Yarı-Pro':    '#FBBF24',
  'Pro-Am':      '#FF7A2F',
  'Elit':        '#F87171',
};

/** Rozet kademesi → renk (ProfileScreen, BadgeDetailSheet) */
export const BADGE_TIER_COLOR: Record<string, string> = {
  HOF:    '#FFD700',
  GOLD:   '#FFA500',
  SILVER: '#A8A9AD',
  BRONZE: '#CD7F32',
};

/** Liderlik tablosu kademesi → renk (LeaderboardSheet) */
export const RANK_TIER_COLOR: Record<string, string> = {
  'Elmas I':    '#00D4FF',
  'Elmas II':   '#00D4FF',
  'Elmas III':  '#00D4FF',
  'Platin I':   '#A8A9AD',
  'Platin II':  '#A8A9AD',
  'Platin III': '#A8A9AD',
  'Altın I':    '#FFD700',
  'Altın II':   '#FFD700',
  'Altın III':  '#FFD700',
};
