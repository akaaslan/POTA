import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../src/components/Header';
import { t } from '../../src/i18n';
import { C, R, S, F } from '../../src/theme';

var TAB_CONFIG = [
  { name: 'index',   label: t('tabs.home'),    icon: '🏠' },
  { name: 'runs',    label: t('tabs.runs'),    icon: '🏀' },
  { name: 'map',     label: t('tabs.map'),     icon: '📍' },
  { name: 'squad',   label: t('tabs.squad'),   icon: '👥' },
  { name: 'profile', label: t('tabs.profile'), icon: '★' },
];

function CustomTabBar({ state, navigation }) {
  var insets = useSafeAreaInsets();
  return (
    <View style={[tb.root, { paddingBottom: insets.bottom > 0 ? insets.bottom : 14 }]}>
      {/* Top neon separator */}
      <View style={tb.topBorder} />
      {state.routes.map(function(route, index) {
        var tab = TAB_CONFIG.find(function(cfg) { return cfg.name === route.name; }) || TAB_CONFIG[index];
        var isFocused = state.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            style={tb.tab}
            onPress={function() {
              var event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            activeOpacity={0.7}
          >
            {/* Neon top indicator line */}
            {isFocused ? <View style={tb.activeBar} /> : <View style={tb.inactiveBar} />}
            <Text style={[tb.icon, isFocused && tb.iconActive]}>{tab ? tab.icon : ''}</Text>
            <Text style={[tb.label, isFocused && tb.labelActive]}>{tab ? tab.label : route.name.toUpperCase()}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <SafeAreaView style={tl.root} edges={['top']}>
      <AppHeader />
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={function(props) { return <CustomTabBar {...props} />; }}
      >
        <Tabs.Screen name="index"   options={{ title: 'Ana Sayfa' }} />
        <Tabs.Screen name="runs"    options={{ title: 'Maçlar' }} />
        <Tabs.Screen name="map"     options={{ title: 'Harita' }} />
        <Tabs.Screen name="squad"   options={{ title: 'Ekip' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
      </Tabs>
    </SafeAreaView>
  );
}

const tl = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPanel },
});

const tb = StyleSheet.create({
  root: {
    flexDirection: 'row',
    backgroundColor: C.bgPanel,
    paddingTop: 0,
    paddingHorizontal: S.xs,
    position: 'relative',
  },
  topBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: C.border,
  },
  tab: { flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 4, position: 'relative' },
  activeBar: { position: 'absolute', top: 0, left: 12, right: 12, height: 2, backgroundColor: C.lime, borderRadius: 1 },
  inactiveBar: { position: 'absolute', top: 0, left: 12, right: 12, height: 2, backgroundColor: 'transparent' },
  icon: { fontSize: 18, marginBottom: 3, opacity: 0.45 },
  iconActive: { opacity: 1 },
  label: { color: C.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 1.2 },
  labelActive: { color: C.lime },
});
