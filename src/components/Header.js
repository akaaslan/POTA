import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { C, F, R, S } from '../theme';
import { useUIStore } from '../store/ui';
import { useNotificationsCount } from '../hooks/useNotifications';

export default function Header() {
  var router = useRouter();
  var openSheet = useUIStore(function(s) { return s.openSheet; });
  var unreadCount = useNotificationsCount();

  return (
    <View style={hd.root}>
      <TouchableOpacity onPress={function() { router.push('/(tabs)/'); }} activeOpacity={0.8} style={hd.logoWrap}>
        <Text style={hd.logo}>POTA</Text>
        <Text style={hd.sub}>STREET STATS</Text>
      </TouchableOpacity>
      <View style={hd.right}>
        <TouchableOpacity style={hd.bell} onPress={function() { openSheet('notifications'); }} activeOpacity={0.8}>
          <Text style={hd.bellIcon}>🔔</Text>
          {unreadCount > 0 ? (
            <View style={hd.badge}>
              <Text style={hd.badgeTxt}>{unreadCount > 9 ? '9+' : String(unreadCount)}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );
}

var hd = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.screen, paddingTop: 6, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.bgPanel },
  logoWrap: { gap: 1 },
  logo: { color: C.lime, fontSize: 24, fontWeight: '900', letterSpacing: 4, fontStyle: 'italic' },
  sub: { color: C.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 2.5 },
  right: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  bell: { position: 'relative', padding: 8 },
  bellIcon: { fontSize: 20 },
  badge: { position: 'absolute', top: 2, right: 2, backgroundColor: C.orange, borderRadius: R.full, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: '900' },
});
