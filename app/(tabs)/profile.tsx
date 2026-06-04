import React from 'react';
import { useProfileFeature } from '../../src/features/profile';
import ProfileScreen from '../../src/screens/ProfileScreen';

export default function ProfileTab() {
  var feature = useProfileFeature();
  return <ProfileScreen {...feature} />;
}
