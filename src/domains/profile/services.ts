// ─── Profile Service ──────────────────────────────────────────────────────────
import { api }      from '@infrastructure/api/client';
import { supabase } from '@infrastructure/supabase';
import { mockStore } from '@lib/mock/store';
import { buildProfileOverview } from '@lib/mock/data';
import { delay, getCurrentUserId } from '@lib/helpers';
import type { ProfileDraft, ProfileOverview, PlayerPosition, PlayerArchetype, ExperienceLevel, Profile, ProfileStatItem, ProfileRecentMatch } from '../../types/domain/profile';

export const profileService = {
  createDefaultProfileDraft(): ProfileDraft {
    return {
      email: '', password: '', nickname: '', district: '',
      jerseyNumber: '', position: 'Kanat', archetype: 'Nişancı',
      experience: 'Orta Seviye', bio: '',
    };
  },

  async getProfileOverview(profileDraft?: Partial<ProfileDraft>): Promise<ProfileOverview> {
    if (api.isMock()) return delay(buildProfileOverview(profileDraft) as ProfileOverview, 350);
    const userId = await getCurrentUserId(supabase);
    if (!userId) throw new Error('Oturum gerekli');

    // Profil + gerçek maç sonuçları paralel çek
    const [profileResult, resultsResult] = await Promise.all([
      supabase!.from('profiles').select('*').eq('id', userId).single(),
      supabase!.from('match_results').select('*, matches(courts(name,district))')
        .eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
    ]);
    if (profileResult.error) throw profileResult.error;

    const profile = profileResult.data;
    const results = resultsResult.data ?? [];

    const wins  = results.filter((r) => r.outcome === 'win').length;
    const games = results.length;
    const avgPts = games > 0 ? results.reduce((s, r) => s + (r.points ?? 0), 0) / games : 0;
    const avgAst = games > 0 ? results.reduce((s, r) => s + (r.assists ?? 0), 0) / games : 0;

    const stats: ProfileStatItem[] = [
      { label: 'GALİBİYET',   value: String(wins) },
      { label: 'MAÇLAR',      value: String(games) },
      { label: 'ORT. SAYILAR', value: avgPts.toFixed(1) },
      { label: 'ORT. ASİST',  value: avgAst.toFixed(1) },
    ];

    const recentMatches: ProfileRecentMatch[] = results.slice(0, 10).map((r) => {
      const court = (r.matches as Record<string, unknown> | null);
      const courtData = court ? (court['courts'] as Record<string, string> | null) : null;
      return {
        id:        r.id,
        outcome:   r.outcome === 'win' ? 'W' : r.outcome === 'draw' ? 'D' : 'L',
        versus:    'RAKIP',
        matchName: courtData?.['name'] ?? 'SAHA',
        date:      new Date(r.created_at as string).toLocaleDateString('tr-TR'),
        scoreA:    r.score_a as number,
        scoreB:    r.score_b as number,
        mvp:       r.mvp as boolean,
        stats: [
          { label: 'SAY',   value: String(r.points ?? 0) },
          { label: 'RİB',   value: String(r.rebounds ?? 0) },
          { label: 'ASİST', value: String(r.assists ?? 0) },
        ],
        tags: (r.mvp as boolean) ? ['MVP'] : [],
      };
    });

    const mapped = {
      uid:          profile.id,
      nickname:     profile.nickname      ?? '',
      district:     profile.district      ?? '',
      jerseyNumber: profile.jersey_number ?? '',
      position:     (profile.position  ?? '') as PlayerPosition,
      archetype:    (profile.archetype ?? '') as PlayerArchetype,
      experience:   (profile.experience ?? '') as ExperienceLevel,
      bio:          profile.bio           ?? '',
      avatar:       profile.avatar_url    ?? null,
    };

    return buildProfileOverview(mapped as unknown as ProfileDraft, stats, recentMatches) as ProfileOverview;
  },

  async updateProfile(updates: Partial<ProfileDraft>): Promise<ProfileOverview> {
    if (api.isMock()) {
      mockStore.profile = { ...mockStore.profile, ...updates } as unknown as Profile;
      return delay(buildProfileOverview(mockStore.profile as unknown as ProfileDraft) as ProfileOverview, 300);
    }
    const userId = await getCurrentUserId(supabase);
    if (!userId) throw new Error('Oturum gerekli');
    const dbUpdates: Record<string, string> = {};
    if (updates.nickname     !== undefined) dbUpdates['nickname']      = updates.nickname;
    if (updates.district     !== undefined) dbUpdates['district']      = updates.district;
    if (updates.jerseyNumber !== undefined) dbUpdates['jersey_number'] = updates.jerseyNumber;
    if (updates.position     !== undefined) dbUpdates['position']      = updates.position;
    if (updates.archetype    !== undefined) dbUpdates['archetype']     = updates.archetype;
    if (updates.experience   !== undefined) dbUpdates['experience']    = updates.experience;
    if (updates.bio          !== undefined) dbUpdates['bio']           = updates.bio;
    const avatar = (updates as { avatar?: string | null }).avatar;
    if (avatar !== undefined && avatar !== null) dbUpdates['avatar_url'] = avatar;
    const { data: profile, error } = await supabase!
      .from('profiles').update(dbUpdates).eq('id', userId).select().single();
    if (error) throw error;
    const mapped = {
      uid:          profile.id,
      nickname:     profile.nickname      ?? '',
      district:     profile.district      ?? '',
      jerseyNumber: profile.jersey_number ?? '',
      position:     (profile.position  ?? '') as PlayerPosition,
      archetype:    (profile.archetype ?? '') as PlayerArchetype,
      experience:   (profile.experience ?? '') as ExperienceLevel,
      bio:          profile.bio           ?? '',
    };
    return buildProfileOverview(mapped as unknown as ProfileDraft) as ProfileOverview;
  },
};
