// ─── Navigation route params ──────────────────────────────────────────────────
// expo-router uses file-based routing; typed params defined here.

export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)': undefined;
};

export type AuthStackParamList = {
  login: undefined;
  register: RegisterScreenParams;
};

export interface RegisterScreenParams {
  fromGoogle?: '1';
}

export type TabParamList = {
  index: undefined;   // Home
  runs: undefined;    // Runs/Matches
  squad: undefined;   // Squad/Teams
  profile: undefined; // Profile
};
