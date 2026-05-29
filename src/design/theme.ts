// ─── Semantic Design Theme ────────────────────────────────────────────────────
// Built from primitive tokens. Import these in components, never raw Palette values.
// ─────────────────────────────────────────────────────────────────────────────
import {
  Palette, SpaceScale, FontSizeScale, RadiusScale, DurationScale, ZIndexScale,
} from './tokens';

// ── Semantic Color Tokens ─────────────────────────────────────────────────────
export const colors = {
  // Backgrounds
  bg:       Palette.neutral950,
  bgCard:   Palette.neutral850,
  bgCard2:  Palette.neutral800,
  bgPanel:  Palette.neutral900,

  // Borders
  border:      Palette.neutral700,
  borderLight: Palette.neutral600,

  // Text
  text:      Palette.neutral100,
  textDim:   Palette.neutral400,
  textMuted: Palette.neutral500,

  // Brand (orange — CTA / energy)
  brand:     Palette.orange600,
  brandLight: Palette.orange500,
  brandSoft: Palette.orange400,
  brandGlow: Palette.orangeGlow,

  // Accent (lime — active / positive)
  accent:     Palette.lime500,
  accentDark: Palette.lime600,
  accentText: Palette.lime700,
  accentGlow: Palette.limeGlow,

  // Semantic status
  success:    Palette.green500,
  warning:    Palette.yellow500,
  error:      Palette.red500,
  info:       Palette.blue500,
  infoGlow:   Palette.blueGlow,
  special:    Palette.purple500,
  specialGlow: Palette.purpleGlow,

  // Overlays
  overlay:      Palette.overlay72,
  overlayLight: Palette.overlay45,
  overlaySoft:  Palette.overlay20,

  // ── Skill-tier color map ────────────────────────────────────────────────────
  // Used on match cards, badges, progress bars, tier accent bars.
  tier: {
    'Açık Saha':   Palette.green500,   // beginner
    'Orta Seviye': Palette.yellow600,  // intermediate
    'Yarı-Pro':    Palette.yellow500,  // semi-pro
    'Pro-Am':      Palette.orange500,  // pro-am
    'Elit':        Palette.red500,     // elite
  } as Record<string, string>,

  // ── Badge-tier (HOF system) ─────────────────────────────────────────────────
  badgeTier: {
    HOF:    Palette.tierHOF,
    GOLD:   Palette.tierGold,
    SILVER: Palette.tierSilver,
    BRONZE: Palette.tierBronze,
  } as Record<string, string>,
} as const;

export type Colors = typeof colors;

// ── Spacing ───────────────────────────────────────────────────────────────────
export const spacing = {
  ...SpaceScale,
  // Named aliases that map to the numeric scale
  xs:      SpaceScale[1],   // 4
  sm:      SpaceScale[2],   // 8
  md:      SpaceScale[3],   // 12
  base:    SpaceScale[4],   // 16
  lg:      SpaceScale[5],   // 20
  xl:      SpaceScale[6],   // 24
  x2:      SpaceScale[8],   // 32
  x3:      SpaceScale[12],  // 48
  // Screen-level constants
  screen:  20,  // standard horizontal padding
  screenV: 24,  // standard vertical section gap
} as const;

export type SpacingKey = keyof typeof spacing;

// ── Border Radius ─────────────────────────────────────────────────────────────
export const radius = RadiusScale;
export type RadiusKey = keyof typeof radius;

// ── Typography Variants ───────────────────────────────────────────────────────
type FontWeight = '400' | '500' | '600' | '700' | '800' | '900';

export const typography = {
  // Display — OVR numbers, hero stats
  display:    { fontSize: FontSizeScale['5xl'], fontWeight: '900' as FontWeight, letterSpacing: -1 },
  displaySm:  { fontSize: FontSizeScale['4xl'], fontWeight: '900' as FontWeight, letterSpacing: -0.5 },

  // Headings
  h1: { fontSize: FontSizeScale['3xl'], fontWeight: '800' as FontWeight, letterSpacing: 0.5 },
  h2: { fontSize: FontSizeScale['2xl'], fontWeight: '800' as FontWeight, letterSpacing: 0.5 },
  h3: { fontSize: FontSizeScale.xl,    fontWeight: '700' as FontWeight, letterSpacing: 0.3 },
  h4: { fontSize: FontSizeScale.lg,    fontWeight: '700' as FontWeight },

  // Body
  bodyLg: { fontSize: FontSizeScale.md,   fontWeight: '400' as FontWeight, lineHeight: 24 },
  body:   { fontSize: FontSizeScale.base, fontWeight: '400' as FontWeight, lineHeight: 22 },
  bodySm: { fontSize: FontSizeScale.sm,   fontWeight: '400' as FontWeight, lineHeight: 18 },

  // Labels
  label:   { fontSize: FontSizeScale.sm, fontWeight: '600' as FontWeight, letterSpacing: 0.3 },
  labelSm: { fontSize: FontSizeScale.xs, fontWeight: '700' as FontWeight, letterSpacing: 0.5 },

  // All-caps / eyebrow labels (NBA 2K UI language)
  caps:   { fontSize: FontSizeScale.xs,    fontWeight: '700' as FontWeight, letterSpacing: 1.5,  textTransform: 'uppercase' as const },
  capsSm: { fontSize: FontSizeScale['2xs'], fontWeight: '700' as FontWeight, letterSpacing: 2.0, textTransform: 'uppercase' as const },

  // Numeric / stat values
  stat:   { fontSize: FontSizeScale['2xl'], fontWeight: '900' as FontWeight, letterSpacing: -0.5 },
  statSm: { fontSize: FontSizeScale.xl,    fontWeight: '800' as FontWeight },

  // Button labels
  btnLg: { fontSize: FontSizeScale.md,   fontWeight: '800' as FontWeight, letterSpacing: 0.5 },
  btn:   { fontSize: FontSizeScale.base, fontWeight: '800' as FontWeight, letterSpacing: 0.5 },
  btnSm: { fontSize: FontSizeScale.sm,   fontWeight: '700' as FontWeight, letterSpacing: 0.3 },
} as const;

export type TypographyVariant = keyof typeof typography;

// ── Elevation / Shadow Presets ────────────────────────────────────────────────
export const elevation = {
  none: {},
  sm: {
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 12,
  },
  // Upward shadow for bottom sheets
  sheet: {
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.60,
    shadowRadius: 20,
    elevation: 20,
  },
  // Colored glows for CTAs
  brand: {
    shadowColor: Palette.orange600,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40,
    shadowRadius: 12,
    elevation: 8,
  },
  accent: {
    shadowColor: Palette.lime500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

export type ElevationKey = keyof typeof elevation;

// ── Animation ─────────────────────────────────────────────────────────────────
export const duration = DurationScale;
export type DurationKey = keyof typeof duration;

// ── Z-Index ───────────────────────────────────────────────────────────────────
export const zIndex = ZIndexScale;

// ── Utilities ─────────────────────────────────────────────────────────────────

/**
 * Returns the tier accent color for a given skill level string.
 * Falls back to lime accent if unrecognized.
 */
export function getTierColor(skillLevel: string): string {
  return (colors.tier as Record<string, string>)[skillLevel] ?? colors.accent;
}

/**
 * Returns the badge tier color for HOF / GOLD / SILVER / BRONZE.
 * Falls back to textDim if unrecognized.
 */
export function getBadgeTierColor(tier: string): string {
  return (colors.badgeTier as Record<string, string>)[tier] ?? colors.textDim;
}

/**
 * Returns a semi-transparent tint of a color (appends hex alpha).
 */
export function withOpacity(hexColor: string, opacity: number): string {
  // For rgba strings, just return them; for hex, append 2-digit alpha.
  if (hexColor.startsWith('rgba') || hexColor.startsWith('rgb')) return hexColor;
  const alpha = Math.round(Math.min(1, Math.max(0, opacity)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hexColor}${alpha}`;
}
