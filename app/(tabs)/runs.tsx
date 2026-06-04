import React from 'react';
import { useRunsFeature } from '../../src/features/runs';
import RunsScreen from '../../src/screens/RunsScreen';

export default function RunsTab() {
  var feature = useRunsFeature();
  return <RunsScreen {...feature} />;
}
