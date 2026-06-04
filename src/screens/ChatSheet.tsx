import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, Modal,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, R, S } from '../theme';
import { t } from '../i18n';
import { api } from '../api/client';
import { useChat } from '@domains/chat/hooks/useChat';
import type { Team } from '../types/domain/squad';
import type { ChatMessage } from '../types/domain/chat';

// ─── Mock verisi (yalnızca mock modda kullanılır) ──────────────────────────
var MOCK_MESSAGES: ChatMessage[] = [
  { id: 'm1', teamId: 'mock', userId: 'u1', nickname: 'KRAL',     text: 'Saha 21:00de. Geç kalmayın.', mine: false, createdAt: '2026-01-01T20:45:00Z' },
  { id: 'm2', teamId: 'mock', userId: 'u2', nickname: 'BORAN',    text: 'Hazırım. 5 dk sonra oradayım.', mine: false, createdAt: '2026-01-01T20:46:00Z' },
  { id: 'm3', teamId: 'mock', userId: 'me', nickname: 'Sen',      text: 'Yolda, 10 dk.',               mine: true,  createdAt: '2026-01-01T20:47:00Z' },
  { id: 'm4', teamId: 'mock', userId: 'u3', nickname: 'GÖLGE_34', text: 'Savunmada sıkı duralım.',     mine: false, createdAt: '2026-01-01T20:48:00Z' },
];

// ─── Sub-component ─────────────────────────────────────────────────────────
function MsgBubble({ msg }: { msg: ChatMessage }) {
  var time = new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  if (msg.mine) {
    return (
      <View style={ch.rowRight}>
        <View style={ch.bubbleMine}><Text style={ch.bubbleMineText}>{msg.text}</Text></View>
        <Text style={ch.timeRight}>{time}</Text>
      </View>
    );
  }
  return (
    <View style={ch.rowLeft}>
      <View style={ch.avatar}><Text style={ch.avatarText}>{(msg.nickname[0] ?? '?').toUpperCase()}</Text></View>
      <View style={ch.left}>
        <Text style={ch.authorName}>{msg.nickname}</Text>
        <View style={ch.bubbleOther}><Text style={ch.bubbleOtherText}>{msg.text}</Text></View>
        <Text style={ch.timeLeft}>{time}</Text>
      </View>
    </View>
  );
}

// ─── Ana bileşen ───────────────────────────────────────────────────────────
interface ChatSheetProps { open: boolean; team: Team | null; onClose: () => void; onSendMessage: (text: string) => void; }

export default function ChatSheet({ open, team, onClose }: ChatSheetProps) {
  var insets = useSafeAreaInsets();
  var [input, setInput] = useState('');
  var listRef = useRef<FlatList<ChatMessage>>(null);

  // Mock modda statik mesajlar, real modda gerçek hook
  var realChat = useChat((!api.isMock() && team?.id) ? team.id : null);
  var messages = api.isMock() ? MOCK_MESSAGES : realChat.messages;

  function scrollToEnd() {
    setTimeout(function() { listRef.current?.scrollToEnd({ animated: true }); }, 100);
  }

  useEffect(() => {
    if (messages.length > 0) scrollToEnd();
  }, [messages.length]);

  async function send() {
    var text = input.trim();
    if (!text) return;
    setInput('');
    if (!api.isMock() && team?.id) {
      await realChat.sendMessage(text);
    }
    scrollToEnd();
  }

  return (
    <Modal visible={!!open} animationType="slide" onRequestClose={onClose}>
      <View style={ch.root}>
        {/* Header */}
        <View style={[ch.header, { paddingTop: insets.top + S.md }]}>
          <TouchableOpacity style={ch.backBtn} onPress={onClose}>
            <Text style={ch.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={ch.headerInfo}>
            <Text style={ch.headerTitle}>{team ? team.name : t('chat.title')}</Text>
            <View style={ch.headerStatusRow}>
              <View style={ch.onlineDot} />
              <Text style={ch.headerSub}>{team ? team.district : ''} • {t('chat.online_status', { count: 3 })}</Text>
            </View>
          </View>
        </View>

        {/* Mesaj listesi */}
        <KeyboardAvoidingView style={ch.kvRoot} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
          {realChat.loading && !api.isMock() ? (
            <View style={ch.loadingWrap}>
              <ActivityIndicator color={C.lime} />
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={function(item: ChatMessage) { return item.id; }}
              renderItem={function(info: { item: ChatMessage }) { return <MsgBubble msg={info.item} />; }}
              contentContainerStyle={ch.msgList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={function() { listRef.current?.scrollToEnd({ animated: false }); }}
            />
          )}

          {/* Input */}
          <View style={[ch.inputRow, { paddingBottom: Math.max(insets.bottom + S.xs, S.sm) }]}>
            <TextInput
              style={ch.input}
              placeholder={t('chat.input_placeholder')}
              placeholderTextColor={C.textDim}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={send}
              returnKeyType="send"
              maxLength={300}
            />
            <TouchableOpacity style={[ch.sendBtn, !input.trim() && ch.sendBtnDisabled]} onPress={send} disabled={!input.trim()}>
              <Text style={ch.sendIcon}>↑</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const ch = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: S.screen, paddingBottom: S.md, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.bgPanel },
  backBtn: { padding: 4 },
  backIcon: { color: C.text, fontSize: 22, fontWeight: '700' },
  headerInfo: { flex: 1 },
  headerTitle: { color: C.text, fontSize: F.md, fontWeight: '800' },
  headerStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.green },
  headerSub: { color: C.textDim, fontSize: F.xs },
  kvRoot: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  msgList: { paddingHorizontal: S.screen, paddingTop: S.md, paddingBottom: S.sm },
  rowRight: { alignItems: 'flex-end', marginBottom: S.sm },
  rowLeft: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: S.sm },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.bgCard2, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.textDim, fontSize: F.xs, fontWeight: '700' },
  left: { flex: 1 },
  authorName: { color: C.orange, fontSize: 10, fontWeight: '700', marginBottom: 3 },
  bubbleMine: { backgroundColor: C.lime, borderRadius: 16, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '80%' },
  bubbleMineText: { color: '#000', fontSize: F.sm, fontWeight: '600' },
  bubbleOther: { backgroundColor: C.bgCard, borderRadius: 16, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '80%', borderWidth: 1, borderColor: C.border },
  bubbleOtherText: { color: C.text, fontSize: F.sm },
  timeRight: { color: C.textDim, fontSize: 10, marginTop: 3 },
  timeLeft: { color: C.textDim, fontSize: 10, marginTop: 3 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: S.screen, paddingVertical: S.sm, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bgPanel },
  input: { flex: 1, backgroundColor: C.bgCard2, borderRadius: R.pill, borderWidth: 1, borderColor: C.border, color: C.text, fontSize: F.sm, paddingHorizontal: 16, paddingVertical: 10 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: C.bgCard2 },
  sendIcon: { color: '#000', fontSize: F.md, fontWeight: '900' },
});
