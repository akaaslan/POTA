import React from 'react';
import { useHomeFeature } from '../../src/features/home';
import HomeScreen from '../../src/screens/HomeScreen';

export default function HomeTab() {
  var feature = useHomeFeature();
  return <HomeScreen {...feature} />;
}
