
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { C, F, R, S } from '../theme';
import { t } from '../i18n';
import { api } from '../api/client';

var POSITIONS   = t('profileEdit.positions');
var ARCHETYPES  = t('profileEdit.archetypes');
var EXPERIENCES = t('profileEdit.levels');
var DISTRICTS   = t('profileEdit.districts');

function FieldLabel({ children }) {
  return <Text style={ob.label}>{children}</Text>;
}

function ChipRow({ options, selected, onSelect }) {
  return (
    <View style={ob.chipRow}>
      {options.map(function(opt) {
        var active = selected === opt;
        return (
          <TouchableOpacity key={opt} style={[ob.chip, active && ob.chipActive]} onPress={function() { onSelect(opt); }} activeOpacity={0.8}>
            <Text style={[ob.chipTxt, active && ob.chipTxtActive]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function FieldGroup({ label, children }) {
  return (
    <View style={ob.field}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </View>
  );
}

export default function OnboardingScreen({ draft, onChange, onSubmit, onLogin, submitting, hideAuth, isRegister }) {
  function set(key, val) {
    onChange(Object.assign({}, draft, { [key]: val }));
  }
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={ob.root} contentContainerStyle={ob.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={ob.hero}>
          <View style={ob.heroBall}><Text style={ob.heroBallTxt}>🏀</Text></View>
          <Text style={ob.heroTitle}>{isRegister ? t('register.hero_title') : t('onboarding.hero_title')}</Text>
          <Text style={ob.heroSub}>{isRegister ? t('register.hero_sub') : t('onboarding.hero_sub')}</Text>
        </View>
        <View style={ob.formCard}>
          {!api.isMock() && !hideAuth && (
            <>
              <FieldGroup label={t('profileEdit.email')}>
                <TextInput
                  style={ob.input}
                  placeholder={t('profileEdit.placeholder_email')}
                  placeholderTextColor={C.textDim}
                  value={draft.email || ''}
                  onChangeText={function(v) { set('email', v); }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </FieldGroup>
              <FieldGroup label={t('profileEdit.password')}>
                <TextInput
                  style={ob.input}
                  placeholder={t('profileEdit.placeholder_password')}
                  placeholderTextColor={C.textDim}
                  value={draft.password || ''}
                  onChangeText={function(v) { set('password', v); }}
                  secureTextEntry={true}
                  autoComplete="new-password"
                />
              </FieldGroup>
            </>
          )}
          <FieldGroup label={t('onboarding.field_nickname')}>
            <TextInput
              style={ob.input}
              placeholder={t('onboarding.placeholder_nickname')}
              placeholderTextColor={C.textDim}
              value={draft.nickname}
              onChangeText={function(v) { set('nickname', v); }}
              autoCapitalize="none"
              maxLength={20}
            />
          </FieldGroup>
          <FieldGroup label={t('onboarding.field_district')}>
            <ChipRow options={DISTRICTS} selected={draft.district} onSelect={function(v) { set('district', v); }} />
          </FieldGroup>
          <FieldGroup label={t('onboarding.field_jersey')}>
            <TextInput
              style={[ob.input, ob.inputNarrow]}
              placeholder={t('onboarding.placeholder_jersey')}
              placeholderTextColor={C.textDim}
              value={draft.jerseyNumber}
              onChangeText={function(v) { set('jerseyNumber', v); }}
              keyboardType="numeric"
              maxLength={3}
            />
          </FieldGroup>
          <FieldGroup label={t('onboarding.field_position')}>
            <ChipRow options={POSITIONS} selected={draft.position} onSelect={function(v) { set('position', v); }} />
          </FieldGroup>
          <FieldGroup label={t('onboarding.field_archetype')}>
            <ChipRow options={ARCHETYPES} selected={draft.archetype} onSelect={function(v) { set('archetype', v); }} />
          </FieldGroup>
          <FieldGroup label={t('onboarding.field_level')}>
            <ChipRow options={EXPERIENCES} selected={draft.experience} onSelect={function(v) { set('experience', v); }} />
          </FieldGroup>
          <FieldGroup label={t('onboarding.field_bio')}>
            <TextInput
              style={[ob.input, ob.textarea]}
              placeholder={t('onboarding.placeholder_bio')}
              placeholderTextColor={C.textDim}
              value={draft.bio}
              onChangeText={function(v) { set('bio', v); }}
              multiline
              maxLength={100}
              textAlignVertical="top"
            />
          </FieldGroup>
        </View>
        <TouchableOpacity style={[ob.submitBtn, submitting && ob.submitDim]} onPress={onSubmit} activeOpacity={0.85} disabled={!!submitting}>
          <Text style={ob.submitTxt}>{submitting ? t(isRegister ? 'register.submit_loading' : 'onboarding.submit_loading') : t(isRegister ? 'register.submit_default' : 'onboarding.submit_default')}</Text>
        </TouchableOpacity>
        {isRegister && onLogin ? (
          <View style={ob.footer}>
            <Text style={ob.footerTxt}>{t('register.have_account')} </Text>
            <TouchableOpacity onPress={onLogin} activeOpacity={0.7}>
              <Text style={ob.footerLink}>{t('register.login_link')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ob = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: S.screen },
  hero: { alignItems: 'center', paddingVertical: S.x2, marginBottom: S.lg },
  heroBall: { width: 80, height: 80, borderRadius: R.full, backgroundColor: C.bgCard, alignItems: 'center', justifyContent: 'center', marginBottom: S.base, borderWidth: 1, borderColor: C.border },
  heroBallTxt: { fontSize: 40 },
  heroTitle: { color: C.text, fontSize: 28, fontWeight: '900', letterSpacing: 2, marginBottom: S.sm },
  heroSub: { color: C.textDim, fontSize: F.sm, textAlign: 'center', lineHeight: 22 },
  formCard: { backgroundColor: C.bgCard, borderRadius: R.xl, padding: S.lg, borderWidth: 1, borderColor: C.border, marginBottom: S.lg },
  field: { marginBottom: S.xl },
  label: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 2, marginBottom: S.sm },
  input: { backgroundColor: C.bgCard2, borderRadius: R.md, borderWidth: 1, borderColor: C.border, color: C.text, fontSize: F.sm, paddingHorizontal: S.base, paddingVertical: 14 },
  inputNarrow: { width: 120 },
  textarea: { height: 80, paddingTop: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  chip: { paddingHorizontal: S.md, paddingVertical: 8, borderRadius: R.full, backgroundColor: C.bgCard2, borderWidth: 1, borderColor: C.border },
  chipActive: { backgroundColor: 'rgba(255,91,0,0.12)', borderColor: C.orange },
  chipTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '700' },
  chipTxtActive: { color: C.orange },
  submitBtn: { backgroundColor: C.orange, borderRadius: R.lg, paddingVertical: 16, alignItems: 'center', marginBottom: S.md },
  submitDim: { opacity: 0.6 },
  submitTxt:  { color: '#fff', fontSize: F.md, fontWeight: '900', letterSpacing: 2 },
  footer:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: S.md },
  footerTxt:  { color: C.textDim, fontSize: F.sm },
  footerLink: { color: C.orange, fontSize: F.sm, fontWeight: '800' },
});
