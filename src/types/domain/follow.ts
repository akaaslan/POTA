import type { ID } from '../common';

export interface FollowCounts {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface FollowEntry {
  userId: ID;
  nickname: string;
  district: string;
  avatarUrl?: string | null;
}
