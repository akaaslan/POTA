// ─── Auth Service ─────────────────────────────────────────────────────────────
import { api }                                                  from '@infrastructure/api/client';
import { supabase }                                             from '@infrastructure/supabase';
import { storageGet, storageSet, storageRemove, STORAGE_KEYS } from '@infrastructure/storage';
import { mockStore }                                            from '@lib/mock/store';
import { MOCK_PROFILE }                                         from '@lib/mock/data';
import { delay }                                                from '@lib/helpers';
import * as Linking                                             from 'expo-linking';
import type { Session, GoogleSignInResult }                     from '../../types/domain/auth';
import type { ProfileDraft }                                    from '../../types/domain/profile';
import type { Nullable }                                        from '../../types/common';

export const authService = {
  async getSession(): Promise<Nullable<Session>> {
    if (api.isMock()) {
      if (mockStore.session) return delay(mockStore.session as Session, 100);
      const saved = await storageGet<Session>(STORAGE_KEYS.SESSION);
      if (saved) { mockStore.session = saved; return saved; }
      return null;
    }
    const result = await supabase!.auth.getSession();
    const sbSession = result.data?.session;
    if (!sbSession?.user) return null;
    const profileResult = await supabase!
      .from('profiles')
      .select('*')
      .eq('id', sbSession.user.id)
      .single();
    const profile = profileResult.data ?? null;
    return { id: sbSession.user.id, email: sbSession.user.email ?? '', profile };
  },

  async signInMock(profile?: Partial<ProfileDraft>): Promise<Session> {
    mockStore.profile = { ...MOCK_PROFILE, ...(profile ?? {}) } as unknown as typeof mockStore.profile;
    mockStore.session = {
      id:      'user-' + Date.now(),
      email:   'player@pota.app',
      profile: mockStore.profile as Session['profile'],
    };
    await storageSet(STORAGE_KEYS.SESSION, mockStore.session);
    return delay(mockStore.session as Session, 450);
  },

  async signUp(email: string, password: string, profileData: ProfileDraft): Promise<Session> {
    if (api.isMock()) return authService.signInMock(profileData);

    const signUpResult = await supabase!.auth.signUp({ email, password });
    if (signUpResult.error) throw signUpResult.error;
    const user = signUpResult.data?.user;
    if (!user) throw new Error('Kayıt tamamlandı ama oturum açılamadı. Lütfen e-postanı onayla ve tekrar giriş yap.');
    const profileInsert = {
      id:            user.id,
      nickname:      profileData.nickname     ?? '',
      district:      profileData.district     ?? '',
      jersey_number: profileData.jerseyNumber ?? '',
      position:      profileData.position     ?? '',
      archetype:     profileData.archetype    ?? '',
      experience:    profileData.experience   ?? '',
      bio:           profileData.bio          ?? '',
    };
    const insertResult = await supabase!.from('profiles').insert(profileInsert);
    if (insertResult.error) throw insertResult.error;
    return { id: user.id, email: user.email ?? email, profile: { uid: user.id, ...profileData } as Session['profile'] };
  },

  async signIn(email: string, password: string): Promise<Session> {
    const result = await supabase!.auth.signInWithPassword({ email, password });
    if (result.error) throw result.error;
    const sbSession = result.data?.session;
    if (!sbSession?.user) throw new Error('Giriş başarısız oldu.');
    const profileResult = await supabase!
      .from('profiles')
      .select('*')
      .eq('id', sbSession.user.id)
      .single();
    const profile = profileResult.data ?? null;
    return { id: sbSession.user.id, email: sbSession.user.email ?? email, profile };
  },

  async signInWithGoogle(): Promise<GoogleSignInResult> {
    // expo-web-browser native modülü gerektiriyor — APK rebuild sonrası çalışır
    let WebBrowser: typeof import('expo-web-browser');
    try {
      WebBrowser = require('expo-web-browser') as typeof import('expo-web-browser');
    } catch {
      throw new Error('Google girişi için uygulamanın güncellenmesi gerekiyor.');
    }

    const redirectTo = Linking.createURL('/');
    const result = await supabase!.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (result.error) throw result.error;
    if (!result.data?.url) throw new Error('Google OAuth URL alınamadı.');

    const browserResult = await WebBrowser.openAuthSessionAsync(result.data.url, redirectTo);
    if (browserResult.type !== 'success') throw new Error('Google girişi iptal edildi.');

    const exchangeResult = await supabase!.auth.exchangeCodeForSession(
      (browserResult as { url: string }).url,
    );
    if (exchangeResult.error) throw exchangeResult.error;

    const sbSession = exchangeResult.data?.session;
    if (!sbSession?.user) throw new Error('Google girişi tamamlanamadı.');

    const profileResult = await supabase!
      .from('profiles')
      .select('*')
      .eq('id', sbSession.user.id)
      .single();
    const profile = profileResult.data ?? null;

    // Yeni Google kullanıcısı — profil henüz yok, register'a yönlendir
    return {
      id:          sbSession.user.id,
      email:       sbSession.user.email ?? '',
      profile,
      needsProfile: !profile?.nickname,
    };
  },

  async signOut(): Promise<void> {
    if (api.isMock()) {
      mockStore.session        = null;
      mockStore.joinedMatchIds = [];
      mockStore.joinedTeamIds  = [];
      await storageRemove(STORAGE_KEYS.SESSION);
      return delay(undefined, 200);
    }
    await supabase!.auth.signOut();
  },
};
