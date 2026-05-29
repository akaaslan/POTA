// ─── Primitive Design Tokens ──────────────────────────────────────────────────
// Raw values with no semantic meaning.
// Never import these in components — use src/design/theme.ts instead.
// ─────────────────────────────────────────────────────────────────────────────

// ── Color Palette ─────────────────────────────────────────────────────────────
export const Palette = {
  // Neutrals (dark-mode scale)
  neutral950: '#0D0D0F',
  neutral900: '#111113',
  neutral850: '#161618',
  neutral800: '#1C1C1F',
  neutral700: '#252529',
  neutral600: '#2E2E34',
  neutral500: '#555259',
  neutral400: '#8A8680',
  neutral300: '#B8B4AE',
  neutral100: '#F0EDE6',
  white:      '#FFFFFF',
  black:      '#000000',

  // Orange — primary brand / CTA
  orange700:  '#CC4A00',
  orange600:  '#FF5B00',
  orange500:  '#FF7A2F',
  orange400:  '#FF9B63',
  orangeGlow: 'rgba(255,91,0,0.15)',

  // Lime — accent / active
  lime500:    '#C8F000',
  lime600:    '#A8CC00',
  lime700:    '#B4DA00',
  limeGlow:   'rgba(200,240,0,0.10)',

  // Status tints
  green500:    '#4ADE80',
  yellow600:   '#A8CC00',
  yellow500:   '#FBBF24',
  red500:      '#F87171',
  blue500:     '#00D4FF',
  blueGlow:    'rgba(0,212,255,0.15)',
  purple500:   '#8B5CF6',
  purpleGlow:  'rgba(139,92,246,0.15)',

  // Badge tier palette (NBA 2K / HOF system)
  tierHOF:    '#FFD700',
  tierGold:   '#FFA500',
  tierSilver: '#A8A9AD',
  tierBronze: '#CD7F32',

  // Overlays
  overlay72: 'rgba(0,0,0,0.72)',
  overlay45: 'rgba(0,0,0,0.45)',
  overlay20: 'rgba(0,0,0,0.20)',
} as const;

export type PaletteKey = keyof typeof Palette;

// ── Spacing Scale (base-4) ────────────────────────────────────────────────────
export const SpaceScale = {
  0:  0,
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  8:  32,
  12: 48,
} as const;

// ── Font-Size Scale ───────────────────────────────────────────────────────────
export const FontSizeScale = {
  '2xs':  9,
  xs:    10,
  sm:    12,
  base:  14,
  md:    16,
  lg:    18,
  xl:    20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
  '5xl': 42,
  '6xl': 54,
  '7xl': 68,
} as const;

// ── Border-Radius Scale ───────────────────────────────────────────────────────
export const RadiusScale = {
  xs:    4,
  sm:    8,
  md:    12,
  lg:    16,
  xl:    20,
  '2xl': 24,
  full:  999,
} as const;

// ── Animation Duration (ms) ───────────────────────────────────────────────────
export const DurationScale = {
  instant:  0,
  fast:     150,
  normal:   250,
  slow:     350,
  skeleton: 900,
} as const;

// ── Z-Index Scale ─────────────────────────────────────────────────────────────
export const ZIndexScale = {
  base:     0,
  card:     1,
  sticky:   10,
  sheet:    150,
  modal:    200,
  toast:    300,
} as const;
