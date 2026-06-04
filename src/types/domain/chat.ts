import type { ID } from '../common';

export interface ChatMessage {
  id: ID;
  teamId: ID;
  userId: ID;
  nickname: string;
  avatarUrl?: string | null;
  text: string;
  createdAt: string;
  mine: boolean;
}
