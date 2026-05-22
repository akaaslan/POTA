import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { C, F, R, S } from '../theme';
import { t } from '../i18n';

const { height: SCREEN_H } = Dimensions.get('window');

export default function NotificationsSheet({ open, notifications, onClose, onMarkAllRead, onNotifPress }) {
  var unreadCount = (notifications || []).filter(function(n) { return !n.read; }).length;

  return (
    <Modal visible={!!open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={ns.root}>
        <TouchableOpacity style={ns.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={ns.sheet}>
          <View style={ns.handle} />

          {/* Header */}
          <View style={ns.header}>
            <View style={ns.headerLeft}>
              <Text style={ns.headerTitle}>{t('notifications.title')}</Text>
              {unreadCount > 0 ? (
                <View style={ns.unreadBadge}>
                  <Text style={ns.unreadNum}>{unreadCount}</Text>
                </View>
              ) : null}
            </View>
            {unreadCount > 0 ? (
              <TouchableOpacity onPress={onMarkAllRead}>
                <Text style={ns.markAllText}>{t('notifications.mark_read')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ns.scroll}>
            {(!notifications || notifications.length === 0) ? (
              <View style={ns.empty}>
                <Text style={ns.emptyIcon}>🏀</Text>
                <Text style={ns.emptyText}>{t('notifications.empty_title')}</Text>
                <Text style={ns.emptySubText}>{t('notifications.empty_sub')}</Text>
              </View>
            ) : (
              notifications.map(function(notif, i) {
                var isLast = i === notifications.length - 1;
                return (
                  <TouchableOpacity
                    key={notif.id}
                    style={[ns.notifRow, !isLast && ns.notifBorder]}
                    onPress={function() { if (onNotifPress) onNotifPress(notif); }}
                    activeOpacity={0.75}
                  >
                    <View style={[ns.notifDot, notif.read && ns.notifDotRead]} />
                    <View style={ns.notifIconBox}>
                      <Text style={ns.notifIcon}>{notif.icon}</Text>
                    </View>
                    <View style={ns.notifContent}>
                      <Text style={[ns.notifTitle, notif.read && ns.notifTitleRead]}>
                        {notif.title}
                      </Text>
                      <Text style={ns.notifTime}>{notif.time}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
            <View style={{ height: S.lg }} />
          </ScrollView>

          {/* Close */}
          <View style={ns.footer}>
            <TouchableOpacity style={ns.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={ns.closeBtnText}>{t('notifications.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const ns = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: C.bgCard,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    maxHeight: SCREEN_H * 0.8,
    paddingBottom: 32,
  },
  handle: {
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: S.sm,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.screen,
    paddingVertical: S.sm,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: {
    color: C.text,
    fontSize: F.sm,
    fontWeight: '800',
    letterSpacing: 2,
  },
  unreadBadge: {
    backgroundColor: C.orange,
    borderRadius: R.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadNum: { color: '#fff', fontSize: 11, fontWeight: '900' },
  markAllText: { color: C.orange, fontSize: F.xs, fontWeight: '700', letterSpacing: 1 },
  scroll: { paddingHorizontal: S.screen, paddingTop: S.sm },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: S.sm },
  emptyText: { color: C.text, fontSize: F.md, fontWeight: '700', marginBottom: 6 },
  emptySubText: { color: C.textDim, fontSize: F.xs, textAlign: 'center' },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  notifBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  notifDot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: C.orange,
  },
  notifDotRead: { backgroundColor: 'transparent' },
  notifIconBox: {
    width: 36, height: 36,
    borderRadius: R.md,
    backgroundColor: C.bgCard2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIcon: { fontSize: 18 },
  notifContent: { flex: 1 },
  notifTitle: {
    color: C.text,
    fontSize: F.xs,
    fontWeight: '600',
    lineHeight: 18,
  },
  notifTitleRead: { color: C.textDim },
  notifTime: {
    color: C.textDim,
    fontSize: 11,
    marginTop: 3,
  },
  footer: {
    paddingHorizontal: S.screen,
    paddingTop: S.sm,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  closeBtn: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    color: C.textDim,
    fontSize: F.xs,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
