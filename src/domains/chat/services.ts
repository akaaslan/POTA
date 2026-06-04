import { supabase } from '@infrastructure/supabase';
import { getCurrentUserId } from '@lib/helpers';
import type { ChatMessage } from '../../types/domain/chat';
import type { ID } from '../../types/common';

export const chatService = {
  async getMessages(teamId: ID): Promise<ChatMessage[]> {
    if (!supabase) return [];
    const userId = await getCurrentUserId(supabase);
    const { data, error } = await supabase
      .from('messages')
      .select('id, team_id, user_id, text, created_at, profiles(nickname, avatar_url)')
      .eq('team_id', teamId)
      .order('created_at', { ascending: true })
      .limit(100);
    if (error) throw error;
    return (data ?? []).map((row) => {
      const profile = row['profiles'] as unknown as { nickname: string; avatar_url?: string } | null;
      return {
        id:        row['id'] as ID,
        teamId:    row['team_id'] as ID,
        userId:    row['user_id'] as ID,
        nickname:  profile?.nickname ?? '?',
        avatarUrl: profile?.avatar_url ?? null,
        text:      row['text'] as string,
        createdAt: row['created_at'] as string,
        mine:      row['user_id'] === userId,
      };
    });
  },

  async sendMessage(teamId: ID, text: string): Promise<void> {
    if (!supabase) return;
    const userId = await getCurrentUserId(supabase);
    if (!userId) throw new Error('Oturum gerekli');
    const { error } = await supabase
      .from('messages')
      .insert({ team_id: teamId, user_id: userId, text: text.trim() });
    if (error) throw error;
  },

  subscribeToMessages(
    teamId: ID,
    onNew: (message: ChatMessage) => void,
    currentUserId: string | null,
  ) {
    if (!supabase) return () => {};
    const sb = supabase; // Callback'lerde güvenli referans
    const channel = sb
      .channel(`team_chat_${teamId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `team_id=eq.${teamId}` },
        async (payload) => {
          const row = payload.new as Record<string, unknown>;
          const { data: profileRow } = await sb
            .from('profiles')
            .select('nickname, avatar_url')
            .eq('id', row['user_id'])
            .single();
          const profileData = profileRow as { nickname: string; avatar_url?: string } | null;
          onNew({
            id:        row['id'] as ID,
            teamId:    row['team_id'] as ID,
            userId:    row['user_id'] as ID,
            nickname:  profileData?.nickname ?? '?',
            avatarUrl: profileData?.avatar_url ?? null,
            text:      row['text'] as string,
            createdAt: row['created_at'] as string,
            mine:      row['user_id'] === currentUserId,
          });
        },
      )
      .subscribe();

    return () => { sb.removeChannel(channel); };
  },
};
