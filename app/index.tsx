import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '../src/theme';
import { useBootstrap } from '../src/hooks/useBootstrap';

export default function SplashScreen() {
  useBootstrap();
  return (
    <View style={styles.root}>
      <Text style={styles.logo}>POTA</Text>
      <Text style={styles.sub}>STREET STATS</Text>
    </View>
  );
}

var styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  logo: { color: C.lime, fontSize: 48, fontWeight: '900', letterSpacing: 6 },
  sub: { color: C.textDim, fontSize: 12, fontWeight: '700', letterSpacing: 3, marginTop: 4 },
});
