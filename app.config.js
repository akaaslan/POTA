// app.config.js takes priority over app.json when both exist.
// This file reads sensitive keys from environment variables so they
// never have to be committed to source control.
//
// Local development: set the key in .env (gitignored)
// EAS Build: add the secret with `npx eas secret:create`

import baseConfig from './app.json';

var googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';

export default ({ config }) => ({
  ...baseConfig.expo,
  plugins: [
    'expo-router',
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: googleMapsApiKey,
        iosGoogleMapsApiKey: googleMapsApiKey,
      },
    ],
    'expo-image',
  ],
});
