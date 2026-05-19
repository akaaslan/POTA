import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../src/components/Header';
import { C, R, S } from '../../src/theme';

var TAB_CONFIG = [
  { name: 'index',   label: 'ANA SAYFA', icon: '🏠' },
  { name: 'runs',    label: 'MAÇLAR',   icon: '🏀' },
  { name: 'squad',   label: 'EKİP',     icon: '👥' },
  { name: 'profile', label: 'PROFİL',  icon: '★' },
];

function CustomTabBar({ state, navigation }) {
  var insets = useSafeAreaInsets();
  return (
    <View style={[tb.root, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
      {state.routes.map(function(route, index) {
        var tab = TAB_CONFIG.find(function(t) { return t.name === route.name; }) || TAB_CONFIG[index];
        var isFocused = state.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            style={[tb.tab, isFocused && tb.tabActive]}
            onPress={function() { navigation.navigate(route.name); }}
            activeOpacity={0.7}
          >
            <Text style={tb.icon}>{tab ? tab.icon : ''}</Text>
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
        <Tabs.Screen name="squad"   options={{ title: 'Ekip' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
      </Tabs>
    </SafeAreaView>
  );
}

var tl = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPanel },
});

var tb = StyleSheet.create({
  root: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.bgPanel,
    paddingTop: 8,
    paddingHorizontal: S.sm,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 5, borderRadius: R.md, marginHorizontal: 2 },
  tabActive: { backgroundColor: 'rgba(200,240,0,0.1)' },
  icon: { fontSize: 20, marginBottom: 3 },
  label: { color: C.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  labelActive: { color: C.lime },
});
