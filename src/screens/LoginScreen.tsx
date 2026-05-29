import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { C, F, R, S } from '../theme';
import { t } from '../i18n';

export default function LoginScreen({ onLogin, onGoogle, onRegister, loading, googleLoading }) {
  var [email, setEmail]       = React.useState('');
  var [password, setPassword] = React.useState('');

  function handleLogin() {
    onLogin(email.trim(), password);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={s.root}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroBall}>
            <Text style={s.heroBallTxt}>🏀</Text>
          </View>
          <Text style={s.heroTitle}>{t('login.hero_title')}</Text>
          <Text style={s.heroSub}>{t('login.hero_sub')}</Text>
        </View>

        {/* Form */}
        <View style={s.card}>
          <Text style={s.label}>{t('login.field_email')}</Text>
          <TextInput
            style={s.input}
            placeholder={t('login.placeholder_email')}
            placeholderTextColor={C.textDim}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={[s.label, { marginTop: S.lg }]}>{t('login.field_password')}</Text>
          <TextInput
            style={s.input}
            placeholder={t('login.placeholder_password')}
            placeholderTextColor={C.textDim}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoComplete="current-password"
          />
        </View>

        {/* Giriş Yap */}
        <TouchableOpacity
          style={[s.primaryBtn, loading && s.btnDim]}
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={loading || googleLoading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.primaryTxt}>{t('login.submit_default')}</Text>
          }
        </TouchableOpacity>

        {/* Ayırıcı */}
        <View style={s.divider}>
          <View style={s.dividerLine} />
          <Text style={s.dividerTxt}>VEYA</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Google ile Giriş */}
        <TouchableOpacity
          style={[s.googleBtn, googleLoading && s.btnDim]}
          onPress={onGoogle}
          activeOpacity={0.85}
          disabled={loading || googleLoading}
        >
          {googleLoading
            ? <ActivityIndicator color={C.text} />
            : <>
                <Text style={s.googleIcon}>G</Text>
                <Text style={s.googleTxt}>{t('login.google_btn')}</Text>
              </>
          }
        </TouchableOpacity>

        {/* Kayıt ol linki */}
        <View style={s.footer}>
          <Text style={s.footerTxt}>{t('login.no_account')} </Text>
          <TouchableOpacity onPress={onRegister} activeOpacity={0.7}>
            <Text style={s.footerLink}>{t('login.register_link')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

var s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: C.bg },
  scroll:        { padding: S.screen },
  hero:          { alignItems: 'center', paddingVertical: S.x2, marginBottom: S.lg },
  heroBall:      { width: 80, height: 80, borderRadius: R.full, backgroundColor: C.bgCard, alignItems: 'center', justifyContent: 'center', marginBottom: S.base, borderWidth: 1, borderColor: C.border },
  heroBallTxt:   { fontSize: 40 },
  heroTitle:     { color: C.text, fontSize: 28, fontWeight: '900', letterSpacing: 2, marginBottom: S.sm },
  heroSub:       { color: C.textDim, fontSize: F.sm, textAlign: 'center', lineHeight: 22 },
  card:          { backgroundColor: C.bgCard, borderRadius: R.xl, padding: S.lg, borderWidth: 1, borderColor: C.border, marginBottom: S.lg },
  label:         { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 2, marginBottom: S.sm },
  input:         { backgroundColor: C.bgCard2, borderRadius: R.md, borderWidth: 1, borderColor: C.border, color: C.text, fontSize: F.sm, paddingHorizontal: S.base, paddingVertical: 14 },
  primaryBtn:    { backgroundColor: C.orange, borderRadius: R.lg, paddingVertical: 16, alignItems: 'center', marginBottom: S.md },
  btnDim:        { opacity: 0.6 },
  primaryTxt:    { color: '#fff', fontSize: F.md, fontWeight: '900', letterSpacing: 2 },
  divider:       { flexDirection: 'row', alignItems: 'center', marginVertical: S.md },
  dividerLine:   { flex: 1, height: 1, backgroundColor: C.border },
  dividerTxt:    { color: C.textDim, fontSize: F.xs, fontWeight: '700', marginHorizontal: S.md },
  googleBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.bgCard, borderRadius: R.lg, paddingVertical: 14, borderWidth: 1, borderColor: C.border, marginBottom: S.xl, gap: S.sm },
  googleIcon:    { color: '#4285F4', fontSize: 18, fontWeight: '900' },
  googleTxt:     { color: C.text, fontSize: F.sm, fontWeight: '800', letterSpacing: 1 },
  footer:        { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerTxt:     { color: C.textDim, fontSize: F.sm },
  footerLink:    { color: C.orange, fontSize: F.sm, fontWeight: '800' },
});
