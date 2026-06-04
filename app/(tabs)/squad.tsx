import React from 'react';
import { useSquadFeature } from '../../src/features/squad';
import SquadScreen from '../../src/screens/SquadScreen';

export default function SquadTab() {
  var feature = useSquadFeature();
  return <SquadScreen {...feature} />;
}
