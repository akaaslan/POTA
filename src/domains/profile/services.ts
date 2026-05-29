// ─── Profile Service ──────────────────────────────────────────────────────────
import { api }      from '@infrastructure/api/client';
import { supabase } from '@infrastructure/supabase';
import { mockStore } from '@lib/mock/store';
import { buildProfileOverview } from '@lib/mock/data';
import { delay, getCurrentUserId } from '@lib/helpers';
import type { ProfileDraft, ProfileOverview } from '../../types/domain/profile';

export const profileService = {
  createDefaultProfileDraft(): ProfileDraft {
    return {
      email: '', password: '', nickname: '', district: '',
      jerseyNumber: '', position: 'Kanat', archetype: 'Nişancı',
      experience: 'Orta Seviye', bio: '',
    };
  },

  async getProfileOverview(profileDraft?: Partial<ProfileDraft>): Promise<ProfileOverview> {
    if (api.isMock()) return delay(buildProfileOverview(profileDraft), 350);
    const userId = await getCurrentUserId(supabase);
    if (!userId) throw new Error('Oturum gerekli');
    const { data: profile, error } = await supabase!
      .from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    const mapped = {
      uid:          profile.id,
      nickname:     profile.nickname      ?? '',
      district:     profile.district      ?? '',
      jerseyNumber: profile.jersey_number ?? '',
      position:     profile.position      ?? '',
      archetype:    profile.archetype     ?? '',
      experience:   profile.experience    ?? '',
      bio:          profile.bio           ?? '',
    };
    return buildProfileOverview(mapped);
  },

  async updateProfile(updates: Partial<ProfileDraft>): Promise<ProfileOverview> {
    if (api.isMock()) {
      mockStore.profile = { ...mockStore.profile, ...updates };
      return delay(buildProfileOverview(mockStore.profile as ProfileDraft), 300);
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
    const { data: profile, error } = await supabase!
      .from('profiles').update(dbUpdates).eq('id', userId).select().single();
    if (error) throw error;
    const mapped = {
      uid:          profile.id,
      nickname:     profile.nickname      ?? '',
      district:     profile.district      ?? '',
      jerseyNumber: profile.jersey_number ?? '',
      position:     profile.position      ?? '',
      archetype:    profile.archetype     ?? '',
      experience:   profile.experience    ?? '',
      bio:          profile.bio           ?? '',
    };
    return buildProfileOverview(mapped);
  },
};
