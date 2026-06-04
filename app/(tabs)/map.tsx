import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useMapFeature } from '../../src/features/map';
import MapScreen from '../../src/screens/MapScreen';
import { C } from '../../src/theme';

export default function MapTab() {
  var feature = useMapFeature();
  return (
    <View style={s.root}>
      <MapScreen onOpenMatch={feature.onOpenMatch} onOpenBooking={feature.onOpenBooking} />
    </View>
  );
}

var s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
});
