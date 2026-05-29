import type { Profile, ProfileDraft, Badge, BadgeTier } from '../types/domain/profile';

// ─── Badge tier ordering ──────────────────────────────────────────────────────
export const BADGE_TIER_RANK: Record<BadgeTier, number> = {
  HOF:    4,
  GOLD:   3,
  SILVER: 2,
  BRONZE: 1,
};

// ─── Profile display helpers ──────────────────────────────────────────────────
export function getDisplayName(profile: Profile): string {
  return profile.nickname || 'Oyuncu';
}

export function getAvatarInitials(profile: Profile): string {
  return profile.nickname ? profile.nickname.slice(0, 2).toUpperCase() : 'OY';
}

export function sortBadgesByTier(badges: Badge[]): Badge[] {
  return [...badges].sort(
    (a, b) => BADGE_TIER_RANK[b.tier] - BADGE_TIER_RANK[a.tier],
  );
}

export function activeBadges(badges: Badge[]): Badge[] {
  return badges.filter((b) => b.active);
}

// ─── ProfileDraft → partial Profile for upsert ────────────────────────────────
export function draftToProfileFields(draft: ProfileDraft): Omit<Profile, 'uid'> {
  return {
    nickname:      draft.nickname,
    district:      draft.district,
    jerseyNumber:  draft.jerseyNumber,
    position:      draft.position as Profile['position'],
    archetype:     draft.archetype as Profile['archetype'],
    experience:    draft.experience as Profile['experience'],
    bio:           draft.bio,
  };
}
