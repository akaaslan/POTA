import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, R, S } from '../theme';
import { t } from '../i18n';

var AUTO_REPLIES = [
  { author: 'KRAL', texts: ['👍', 'Tamam, görüşürüz.', 'OK.', 'Hazırız.', 'Sahada buluşuruz.'] },
  { author: 'BORAN', texts: ['Harika!', '💪', 'Geliyor.', 'Ben de oradayım.', 'Anlıyorum.'] },
  { author: 'GÖLGE_34', texts: ['Anladım.', '🔥', 'Güzel.', 'Savunmayı iyi oynayalım.', 'Tamam bro.'] },
];

var MOCK_MESSAGES = [
  { id: 'm1', author: 'KRAL', text: 'Saha 21:00de. Geç kalmayın.', mine: false, time: '20:45' },
  { id: 'm2', author: 'BORAN', text: 'Hazırım. 5 dk sonra oradayım.', mine: false, time: '20:46' },
  { id: 'm3', author: 'Sen', text: 'Yolda, 10 dk.', mine: true, time: '20:47' },
  { id: 'm4', author: 'GÖLGE_34', text: 'Savunmada sıkı duralım bu sefer.', mine: false, time: '20:48' },
  { id: 'm5', author: 'BORAN', text: 'Kale bende. Korku yok. 🔥', mine: false, time: '20:49' },
  { id: 'm6', author: 'Sen', text: 'Geldim. Başlayalım mı?', mine: true, time: '21:02' },
];

function MsgBubble({ msg }) {
  if (msg.mine) {
    return (
      <View style={ch.rowRight}>
        <View style={ch.bubbleMine}>
          <Text style={ch.bubbleMineText}>{msg.text}</Text>
        </View>
        <Text style={ch.timeRight}>{msg.time}</Text>
      </View>
    );
  }
  return (
    <View style={ch.rowLeft}>
      <View style={ch.avatar}>
        <Text style={ch.avatarText}>{msg.author[0]}</Text>
      </View>
      <View style={ch.left}>
        <Text style={ch.authorName}>{msg.author}</Text>
        <View style={ch.bubbleOther}>
          <Text style={ch.bubbleOtherText}>{msg.text}</Text>
        </View>
        <Text style={ch.timeLeft}>{msg.time}</Text>
      </View>
    </View>
  );
}

export default function ChatSheet({ open, team, onClose, onSendMessage }) {
  var insets = useSafeAreaInsets();
  var [messages, setMessages] = useState(MOCK_MESSAGES);
  var [input, setInput] = useState('');
  var [typing, setTyping] = useState(null); // author name who is typing
  var listRef = useRef(null);

  function scrollToEnd() {
    setTimeout(function() {
      if (listRef.current) listRef.current.scrollToEnd({ animated: true });
    }, 100);
  }

  function send() {
    var text = input.trim();
    if (!text) return;
    var now = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    var newMsg = { id: 'msg-' + Date.now(), author: 'Sen', text: text, mine: true, time: now };
    setMessages(function(prev) { return prev.concat([newMsg]); });
    setInput('');
    if (onSendMessage) onSendMessage(text);
    scrollToEnd();

    // Simulate teammate auto-reply
    var replier = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    var replyText = replier.texts[Math.floor(Math.random() * replier.texts.length)];
    setTimeout(function() {
      setTyping(replier.author);
      scrollToEnd();
    }, 900);
    setTimeout(function() {
      setTyping(null);
      var replyTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      var reply = { id: 'reply-' + Date.now(), author: replier.author, text: replyText, mine: false, time: replyTime };
      setMessages(function(prev) { return prev.concat([reply]); });
      scrollToEnd();
    }, 2400);
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

        {/* Messages */}
        <KeyboardAvoidingView
          style={ch.kvRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={function(item) { return item.id; }}
            renderItem={function(info) { return <MsgBubble msg={info.item} />; }}
            contentContainerStyle={ch.msgList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={function() {
              if (listRef.current) listRef.current.scrollToEnd({ animated: false });
            }}
            ListFooterComponent={typing ? (
              <View style={ch.typingRow}>
                <View style={ch.typingAvatar}>
                  <Text style={ch.typingAvatarTxt}>{typing[0]}</Text>
                </View>
                <View style={ch.typingBubble}>
                  <View style={ch.typingDot} />
                  <View style={[ch.typingDot, ch.typingDotMid]} />
                  <View style={ch.typingDot} />
                </View>
              </View>
            ) : null}
          />

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
            <TouchableOpacity
              style={[ch.sendBtn, !input.trim() && ch.sendBtnDisabled]}
              onPress={send}
              disabled={!input.trim()}
            >
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
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: S.screen, paddingBottom: S.md,
    borderBottomWidth: 1, borderBottomColor: C.border,
    backgroundColor: C.bgPanel,
  },
  backBtn: { padding: 4 },
  backIcon: { color: C.text, fontSize: 22, fontWeight: '700' },
  headerInfo: { flex: 1 },
  headerTitle: { color: C.text, fontSize: F.md, fontWeight: '800' },
  headerStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.green },
  headerSub: { color: C.textDim, fontSize: F.xs },
  kvRoot: { flex: 1 },
  msgList: { paddingHorizontal: S.screen, paddingTop: S.md, paddingBottom: S.sm },
  rowRight: { alignItems: 'flex-end', marginBottom: S.sm },
  rowLeft: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: S.sm },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.bgCard2, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: C.textDim, fontSize: F.xs, fontWeight: '700' },
  left: { flex: 1 },
  authorName: { color: C.orange, fontSize: 10, fontWeight: '700', marginBottom: 3 },
  bubbleMine: {
    backgroundColor: C.lime, borderRadius: 16, borderBottomRightRadius: 4,
    paddingHorizontal: 14, paddingVertical: 10, maxWidth: '80%',
  },
  bubbleMineText: { color: '#000', fontSize: F.sm, fontWeight: '600' },
  bubbleOther: {
    backgroundColor: C.bgCard, borderRadius: 16, borderBottomLeftRadius: 4,
    paddingHorizontal: 14, paddingVertical: 10, maxWidth: '80%',
    borderWidth: 1, borderColor: C.border,
  },
  bubbleOtherText: { color: C.text, fontSize: F.sm },
  timeRight: { color: C.textDim, fontSize: 10, marginTop: 3 },
  timeLeft: { color: C.textDim, fontSize: 10, marginTop: 3 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: S.screen, paddingVertical: S.sm,
    borderTopWidth: 1, borderTopColor: C.border,
    backgroundColor: C.bgPanel,
  },
  input: {
    flex: 1, backgroundColor: C.bgCard2, borderRadius: R.pill,
    borderWidth: 1, borderColor: C.border,
    color: C.text, fontSize: F.sm,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: C.bgCard2 },
  sendIcon: { color: '#000', fontSize: F.md, fontWeight: '900' },
  // Typing indicator
  typingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: S.sm, paddingLeft: 0 },
  typingAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.bgCard2, alignItems: 'center', justifyContent: 'center' },
  typingAvatarTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '700' },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.bgCard, borderRadius: 16, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: C.border },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.textDim },
  typingDotMid: { opacity: 0.6 },
});
