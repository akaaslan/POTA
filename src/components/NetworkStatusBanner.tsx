import React, { useEffect, useState, useRef } from 'react';
import { AppState, Animated, StyleSheet, Text, View } from 'react-native';
import { C, F, S } from '../theme';

// Native modül yok — sadece fetch ile bağlantı kontrol et.
// Expo Go dahil her ortamda çalışır.
async function checkOnline(): Promise<boolean> {
  try {
    const res = await fetch('https://clients3.google.com/generate_204', {
      method: 'HEAD',
      cache: 'no-store',
    });
    return res.status === 204 || res.ok;
  } catch {
    return false;
  }
}

export default function NetworkStatusBanner() {
  const [offline, setOffline]     = useState(false);
  const [visible, setVisible]     = useState(false);
  const slideAnim  = useRef(new Animated.Value(-44)).current;
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasOffline = useRef(false);

  function handleOnlineState(isOnline: boolean) {
    const wentOffline = !isOnline && !wasOffline.current;
    const cameBack    =  isOnline &&  wasOffline.current;
    wasOffline.current = !isOnline;

    if (wentOffline) {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setOffline(true);
      setVisible(true);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
    } else if (cameBack) {
      setOffline(false);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        Animated.timing(slideAnim, { toValue: -44, duration: 280, useNativeDriver: true })
          .start(() => setVisible(false));
      }, 2000);
    }
  }

  useEffect(() => {
    checkOnline().then(handleOnlineState);

    const appSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkOnline().then(handleOnlineState);
    });

    pollRef.current = setInterval(() => {
      checkOnline().then(handleOnlineState);
    }, 10_000);

    return () => {
      appSub.remove();
      if (pollRef.current)  clearInterval(pollRef.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <Animated.View style={[s.banner, !offline && s.onlineBanner, { transform: [{ translateY: slideAnim }] }]}>
      <Text style={s.icon}>{offline ? '📡' : '✓'}</Text>
      <Text style={s.txt}>
        {offline ? 'Bağlantı yok — önbellek gösteriliyor' : 'Bağlantı yeniden kuruldu'}
      </Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  banner: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999,
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
    paddingHorizontal: S.screen, paddingVertical: 10,
    backgroundColor: '#2C1810', borderBottomWidth: 1, borderBottomColor: C.red,
  },
  onlineBanner: { backgroundColor: '#0D1F0D', borderBottomColor: C.green },
  icon: { fontSize: 14 },
  txt:  { color: C.text, fontSize: F.xs, fontWeight: '700', flex: 1 },
});
