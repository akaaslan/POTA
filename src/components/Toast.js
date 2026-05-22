import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, R, S } from '../theme';
import { useUIStore } from '../store/ui';

var TYPE_CONFIG = {
  success: { color: C.lime,   icon: '✓', bg: 'rgba(200,240,0,0.08)' },
  error:   { color: C.red,    icon: '✕', bg: 'rgba(248,113,113,0.08)' },
  info:    { color: '#00D4FF', icon: 'ℹ', bg: 'rgba(0,212,255,0.08)' },
  warn:    { color: C.orange,  icon: '⚡', bg: 'rgba(255,91,0,0.08)' },
};

export default function Toast() {
  var toast    = useUIStore(function(s) { return s.toast; });
  var hideToast = useUIStore(function(s) { return s.hideToast; });
  var insets   = useSafeAreaInsets();

  var translateY = useRef(new Animated.Value(80)).current;
  var opacity    = useRef(new Animated.Value(0)).current;

  useEffect(function() {
    if (toast) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 90, friction: 11, overshootClamping: true }),
        Animated.timing(opacity,    { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 80, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity,    { toValue: 0,  duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [toast]);

  var cfg   = TYPE_CONFIG[(toast && toast.type) || 'success'];
  var msg   = toast ? toast.message : '';

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        t.wrap,
        { bottom: Math.max(insets.bottom, 0) + 80 },
        { transform: [{ translateY }], opacity },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={hideToast}
        style={[t.bar, { borderLeftColor: cfg.color }]}
      >
        <View style={[t.iconWrap, { backgroundColor: cfg.bg }]}>
          <Text style={[t.icon, { color: cfg.color }]}>{cfg.icon}</Text>
        </View>
        <Text style={t.msg} numberOfLines={2}>{msg}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

var t = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: S.screen,
    right: S.screen,
    zIndex: 9999,
    elevation: 20,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: C.bgCard,
    borderRadius: R.lg,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: C.borderLight,
    paddingVertical: 14,
    paddingHorizontal: S.md,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  iconWrap: {
    width: 30, height: 30,
    borderRadius: R.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: F.sm, fontWeight: '900' },
  msg: { flex: 1, color: C.text, fontSize: F.sm, fontWeight: '600', lineHeight: 18 },
});
