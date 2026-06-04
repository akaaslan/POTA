import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services';
import { useAuthStore } from '@state/auth.store';
import type { ChatMessage } from '../../../types/domain/chat';
import type { ID } from '../../../types/common';

export function useChat(teamId: ID | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const session = useAuthStore((s) => s.session);
  const userId  = session?.id ?? null;

  useEffect(() => {
    if (!teamId) return;
    let active = true;
    setLoading(true);

    chatService.getMessages(teamId).then((msgs) => {
      if (active) { setMessages(msgs); setLoading(false); }
    }).catch((e) => {
      if (active) { setError((e as Error).message); setLoading(false); }
    });

    const unsubscribe = chatService.subscribeToMessages(teamId, (msg) => {
      if (!active) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    }, userId);

    return () => { active = false; unsubscribe(); };
  }, [teamId, userId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!teamId || !text.trim()) return;
    await chatService.sendMessage(teamId, text);
  }, [teamId]);

  return { messages, loading, error, sendMessage };
}
