
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C, F, R, S } from '../theme';

var TABS = [
  { key: 'home', label: 'ANA SAYFA', icon: '🏠' },
  { key: 'runs', label: 'MAÇLAR', icon: '🏀' },
  { key: 'squad', label: 'EKİP', icon: '👥' },
  { key: 'pro', label: 'PROFİL', icon: '⭐' },
];

export default function BottomTabs({ active, onSelect }) {
  return (
    <View style={bt.root}>
      {TABS.map(function(tab) {
        var isActive = active === tab.key;
        return (
          <TouchableOpacity key={tab.key} style={[bt.tab, isActive && bt.tabActive]} onPress={function() { onSelect(tab.key); }} activeOpacity={0.7}>
            <Text style={[bt.icon, isActive && bt.iconActive]}>{tab.icon}</Text>
            <Text style={[bt.label, isActive && bt.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const bt = StyleSheet.create({
  root: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bgPanel, paddingBottom: 20, paddingTop: 8, paddingHorizontal: S.sm },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 5, borderRadius: R.md, marginHorizontal: 2 },
  tabActive: { backgroundColor: 'rgba(200,240,0,0.1)' },
  icon: { fontSize: 20, marginBottom: 3 },
  iconActive: {},
  label: { color: C.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  labelActive: { color: C.lime },
});
