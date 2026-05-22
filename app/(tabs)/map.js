import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapScreen from '../../src/screens/MapScreen';
import { C } from '../../src/theme';
import { useUIStore } from '../../src/store/ui';

export default function MapTab() {
  var openSheet = useUIStore(function(s) { return s.openSheet; });
  return (
    <View style={s.root}>
      <MapScreen onOpenMatch={function(match) { openSheet('match-detail', match); }} />
    </View>
  );
}

var s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
});
