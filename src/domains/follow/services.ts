import { api }      from '@infrastructure/api/client';
import { supabase } from '@infrastructure/supabase';
import { getCurrentUserId } from '@lib/helpers';
import type { FollowCounts, FollowEntry } from '../../types/domain/follow';
import type { ID } from '../../types/common';

export const followService = {
  async getFollowCounts(targetUserId: ID): Promise<FollowCounts> {
    if (api.isMock() || !supabase) return { followersCount: 0, followingCount: 0, isFollowing: false };
    const sb = supabase;
    const currentUserId = await getCurrentUserId(sb);

    const [followersRes, followingRes, isFollowingRes] = await Promise.all([
      sb.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', targetUserId),
      sb.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', targetUserId),
      currentUserId
        ? sb.from('follows').select('*', { count: 'exact', head: true })
            .eq('follower_id', currentUserId).eq('following_id', targetUserId)
        : Promise.resolve({ count: 0, error: null }),
    ]);

    return {
      followersCount: followersRes.count ?? 0,
      followingCount: followingRes.count ?? 0,
      isFollowing:    (isFollowingRes.count ?? 0) > 0,
    };
  },

  async follow(targetUserId: ID): Promise<void> {
    if (api.isMock() || !supabase) return;
    const userId = await getCurrentUserId(supabase);
    if (!userId) throw new Error('Oturum gerekli');
    const { error } = await supabase.from('follows').insert({ follower_id: userId, following_id: targetUserId });
    if (error) throw error;
  },

  async unfollow(targetUserId: ID): Promise<void> {
    if (api.isMock() || !supabase) return;
    const userId = await getCurrentUserId(supabase);
    if (!userId) throw new Error('Oturum gerekli');
    const { error } = await supabase.from('follows')
      .delete().eq('follower_id', userId).eq('following_id', targetUserId);
    if (error) throw error;
  },

  async getFollowers(userId: ID): Promise<FollowEntry[]> {
    if (api.isMock() || !supabase) return [];
    const { data, error } = await supabase
      .from('follows')
      .select('profiles!follower_id(id, nickname, district, avatar_url)')
      .eq('following_id', userId);
    if (error) throw error;
    return (data ?? []).map((row) => {
      type ProfileRow = { id: string; nickname: string; district: string; avatar_url?: string };
      const p = row['profiles'] as unknown as ProfileRow | null;
      return { userId: p?.id ?? '', nickname: p?.nickname ?? '', district: p?.district ?? '', avatarUrl: p?.avatar_url ?? null };
    });
  },

  async getFollowing(userId: ID): Promise<FollowEntry[]> {
    if (api.isMock() || !supabase) return [];
    const { data, error } = await supabase
      .from('follows')
      .select('profiles!following_id(id, nickname, district, avatar_url)')
      .eq('follower_id', userId);
    if (error) throw error;
    return (data ?? []).map((row) => {
      type ProfileRow = { id: string; nickname: string; district: string; avatar_url?: string };
      const p = row['profiles'] as unknown as ProfileRow | null;
      return { userId: p?.id ?? '', nickname: p?.nickname ?? '', district: p?.district ?? '', avatarUrl: p?.avatar_url ?? null };
    });
  },
};
