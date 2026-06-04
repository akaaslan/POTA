import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, ActivityIndicator, StyleSheet, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { C, F, R, S } from '../theme';
import { t } from '../i18n';
import type { Profile } from '../types/domain/profile';
import { PRESET_AVATARS } from '@shared/constants/avatars';

const { height: SCREEN_H } = Dimensions.get('window');
var POSITIONS   = t('profileEdit.positions');
var ARCHETYPES  = t('profileEdit.archetypes');
var EXPERIENCES = t('profileEdit.levels');
var DISTRICTS   = t('profileEdit.districts');
var LEVEL_COLORS = ['#555259', '#00D4FF', '#4ADE80', '#FF5B00', '#C8F000'];

function SectionHead({ num, title }: { num: number; title: string }) {
  return (
    <View style={pe.sectionHead}>
      <Text style={pe.sectionNum}>{num < 10 ? '0' + num : String(num)}</Text>
      <View style={pe.sectionLine} />
      <Text style={pe.sectionLbl}>{title}</Text>
    </View>
  );
}

interface ProfileEditSheetProps {
  open: boolean;
  profile: Partial<Profile> | null;
  onClose: () => void;
  onSave: (updates: Partial<Profile>) => void | Promise<void>;
}
export default function ProfileEditSheet({ open, profile, onClose, onSave }: ProfileEditSheetProps) {
  var [form, setForm]     = useState<Partial<Profile>>(profile || {});
  var [saving, setSaving] = useState(false);

  function selectAvatar(url: string) {
    setForm(function(prev) { return Object.assign({}, prev, { avatar: url }); });
  }

  useEffect(function() {
    if (open && profile) setForm(Object.assign({}, profile));
  }, [open, profile]);

  function set(key: keyof Profile, val: string) {
    setForm(function(prev) { return Object.assign({}, prev, { [key]: val }); });
  }

  async function handleSave() {
    if (!form.nickname || !form.district) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  var canSave = !!(form.nickname && form.district);

  return (
    <Modal visible={!!open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={pe.root}>
        <TouchableOpacity style={pe.backdrop} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={pe.avoidView}>
          <View style={pe.sheet}>
            <View style={pe.handle} />

            {/* Header */}
            <View style={pe.header}>
              <TouchableOpacity style={pe.closeBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={pe.closeIcon}>✕</Text>
              </TouchableOpacity>
              <View style={pe.headerCenter}>
                <View style={pe.headerGlow} />
                <Text style={pe.headerTitle}>{t('profileEdit.title')}</Text>
              </View>
              <View style={{ width: 32 }} />
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={pe.scroll}
              keyboardShouldPersistTaps="handled"
            >
              {/* ── AVATAR SEÇİMİ ── */}
              <View style={pe.avatarSection}>
                {/* Seçili avatar önizleme */}
                <View style={pe.avatarPreviewWrap}>
                  {form.avatar ? (
                    <Image source={{ uri: form.avatar }} style={pe.avatarPreview} contentFit="cover" cachePolicy="memory-disk" />
                  ) : (
                    <View style={pe.avatarPlaceholder}>
                      <Text style={pe.avatarPlaceholderTxt}>{form.nickname ? form.nickname.charAt(0).toUpperCase() : '?'}</Text>
                    </View>
                  )}
                </View>
                <Text style={pe.avatarHint}>AVATAR SEÇ</Text>
                {/* Hazır avatar ızgarası */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={pe.avatarRow}>
                  {PRESET_AVATARS.map(function(url) {
                    var active = form.avatar === url;
                    return (
                      <TouchableOpacity
                        key={url}
                        style={[pe.avatarOption, active && pe.avatarOptionActive]}
                        onPress={function() { selectAvatar(url); }}
                        activeOpacity={0.8}
                      >
                        <Image source={{ uri: url }} style={pe.avatarOptionImg} contentFit="cover" cachePolicy="memory-disk" />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* ── LIVE PLAYER CARD ── */}
              <View style={pe.previewCard}>
                <View style={pe.previewAccentBar} />
                <View style={pe.previewJerseyCol}>
                  <Text style={pe.previewJerseySymbol}>#</Text>
                  <Text style={pe.previewJerseyNum}>{form.jerseyNumber || '—'}</Text>
                </View>
                <View style={pe.previewContent}>
                  <Text style={pe.previewNickname} numberOfLines={1}>
                    {form.nickname ? form.nickname.toUpperCase() : '· · ·'}
                  </Text>
                  <Text style={pe.previewArch}>
                    {form.archetype || form.position || '–'}
                  </Text>
                  <View style={pe.previewTagRow}>
                    {form.district ? (
                      <View style={pe.previewTag}>
                        <Text style={pe.previewTagTxt}>📍 {form.district}</Text>
                      </View>
                    ) : null}
                    {form.experience ? (
                      <View style={[pe.previewTag, pe.previewTagAlt]}>
                        <Text style={[pe.previewTagTxt, { color: C.lime }]}>{form.experience.toUpperCase()}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>

              {/* ── 01 KİMLİK ── */}
              <View style={pe.section}>
                <SectionHead num={1} title={t('profileEdit.section_identity')} />
                <View style={pe.identityCard}>
                  <View style={pe.nicknameBlock}>
                    <Text style={pe.fieldLabel}>{t('profileEdit.field_nickname')}</Text>
                    <TextInput
                      style={pe.nickInput}
                      value={form.nickname || ''}
                      onChangeText={function(v) { set('nickname', v); }}
                      placeholder={t('profileEdit.placeholder_nickname')}
                      placeholderTextColor={C.textMuted}
                      maxLength={20}
                      autoCapitalize="none"
                    />
                  </View>
                  <View style={pe.jerseyBlock}>
                    <Text style={pe.fieldLabel}>{t('profileEdit.field_jersey')}</Text>
                    <View style={pe.jerseyInputWrap}>
                      <Text style={pe.jerseySymbol}>#</Text>
                      <TextInput
                        style={pe.jerseyInput}
                        value={form.jerseyNumber || ''}
                        onChangeText={function(v) { set('jerseyNumber', v.replace(/[^0-9]/g, '')); }}
                        placeholder={t('profileEdit.placeholder_jersey')}
                        placeholderTextColor={C.textMuted}
                        keyboardType="number-pad"
                        maxLength={3}
                        textAlign="center"
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* ── 02 POZİSYON ── */}
              <View style={pe.section}>
                <SectionHead num={2} title={t('profileEdit.field_position')} />
                <View style={pe.chipWrap}>
                  {(POSITIONS as string[]).map(function(opt: string) {
                    var active = form.position === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        style={[pe.chip, active && pe.chipActiveL]}
                        onPress={function() { set('position', opt); }}
                        activeOpacity={0.75}
                      >
                        <Text style={[pe.chipTxt, active && pe.chipTxtActiveL]}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* ── 03 OYUNCU TİPİ ── */}
              <View style={pe.section}>
                <SectionHead num={3} title={t('profileEdit.field_archetype')} />
                <View style={pe.chipWrap}>
                  {(ARCHETYPES as string[]).map(function(opt: string) {
                    var active = form.archetype === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        style={[pe.chip, active && pe.chipActiveO]}
                        onPress={function() { set('archetype', opt); }}
                        activeOpacity={0.75}
                      >
                        <Text style={[pe.chipTxt, active && pe.chipTxtActiveO]}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* ── 04 SEVİYE ── */}
              <View style={pe.section}>
                <SectionHead num={4} title={t('profileEdit.field_level')} />
                <View style={pe.levelWrap}>
                  {(EXPERIENCES as string[]).map(function(opt: string, idx: number) {
                    var active = form.experience === opt;
                    var col = LEVEL_COLORS[idx] || C.lime;
                    return (
                      <TouchableOpacity
                        key={opt}
                        style={[pe.levelBtn, { borderColor: active ? col : C.border, backgroundColor: active ? col + '18' : C.bgCard2 }]}
                        onPress={function() { set('experience', opt); }}
                        activeOpacity={0.75}
                      >
                        <View style={[pe.levelBar, { backgroundColor: active ? col : C.border }]} />
                        <Text style={[pe.levelTxt, { color: active ? col : C.textDim }]}>{opt}</Text>
                        {active ? <View style={[pe.levelCheck, { backgroundColor: col }]}><Text style={pe.levelCheckTxt}>✓</Text></View> : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* ── 05 SEMT ── */}
              <View style={pe.section}>
                <SectionHead num={5} title={t('profileEdit.field_district')} />
                <View style={pe.chipWrap}>
                  {(DISTRICTS as string[]).map(function(opt: string) {
                    var active = form.district === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        style={[pe.chip, pe.chipCompact, active && pe.chipActiveL]}
                        onPress={function() { set('district', opt); }}
                        activeOpacity={0.75}
                      >
                        <Text style={[pe.chipTxt, pe.chipCompactTxt, active && pe.chipTxtActiveL]}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* ── 06 BİO ── */}
              <View style={pe.section}>
                <SectionHead num={6} title={t('profileEdit.field_bio')} />
                <TextInput
                  style={pe.textarea}
                  value={form.bio || ''}
                  onChangeText={function(v) { set('bio', v); }}
                  placeholder={t('profileEdit.placeholder_bio')}
                  placeholderTextColor={C.textMuted}
                  multiline
                  maxLength={100}
                  textAlignVertical="top"
                />
                <Text style={pe.charCount}>{(form.bio || '').length}/100</Text>
              </View>

              <View style={{ height: S.md }} />
            </ScrollView>

            {/* Footer */}
            <View style={pe.footer}>
              {!canSave ? (
                <Text style={pe.validHint}>
                  {!form.nickname ? t('profileEdit.required_nickname') : t('profileEdit.required_district')}
                </Text>
              ) : null}
              <TouchableOpacity
                style={[pe.saveBtn, !canSave && pe.saveBtnDim]}
                onPress={handleSave}
                disabled={!canSave || saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={pe.saveBtnTxt}>{t('profileEdit.save_btn')}  →</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const pe = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' },
  avoidView: {},
  sheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: R.x2,
    borderTopRightRadius: R.x2,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: C.border,
    height: SCREEN_H * 0.92,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginTop: S.sm, marginBottom: S.xs },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: S.screen, paddingVertical: S.md,
    borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.bgPanel,
  },
  headerCenter: { flex: 1, alignItems: 'center', overflow: 'hidden' },
  headerGlow: { position: 'absolute', width: 120, height: 40, borderRadius: 60, backgroundColor: C.orange, opacity: 0.10, top: -12 },
  headerTitle: { color: C.text, fontSize: F.sm, fontWeight: '900', letterSpacing: 2.5, textTransform: 'uppercase', fontStyle: 'italic' },
  closeBtn: { width: 32, height: 32, borderRadius: R.full, backgroundColor: C.bgCard2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  closeIcon: { color: C.textDim, fontSize: 12, fontWeight: '700' },

  scroll: { paddingHorizontal: S.screen, paddingTop: S.base },

  // Avatar seçimi
  avatarSection: { alignItems: 'center', marginBottom: S.lg },
  avatarPreviewWrap: { marginBottom: S.sm },
  avatarPreview: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: C.lime, backgroundColor: C.bgCard2 },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: C.border, backgroundColor: C.bgCard2, alignItems: 'center', justifyContent: 'center' },
  avatarPlaceholderTxt: { color: C.lime, fontSize: 32, fontWeight: '900' },
  avatarHint: { color: C.textMuted, fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: S.sm },
  avatarRow: { gap: S.sm, paddingHorizontal: S.xs },
  avatarOption: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: C.border, overflow: 'hidden', backgroundColor: C.bgCard2 },
  avatarOptionActive: { borderColor: C.lime },
  avatarOptionImg: { width: '100%', height: '100%' },
  // Live preview card
  previewCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bgCard, borderRadius: R.xl,
    borderWidth: 1, borderColor: C.border,
    overflow: 'hidden', marginBottom: S.x2, minHeight: 88,
  },
  previewAccentBar: { width: 4, alignSelf: 'stretch', backgroundColor: C.orange },
  previewJerseyCol: {
    paddingHorizontal: S.md, alignItems: 'center', justifyContent: 'center',
    borderRightWidth: 1, borderRightColor: C.border, alignSelf: 'stretch', minWidth: 64,
  },
  previewJerseySymbol: { color: C.textMuted, fontSize: F.xs, fontWeight: '900', letterSpacing: 1 },
  previewJerseyNum: { color: C.orange, fontSize: F.x3, fontWeight: '900', lineHeight: F.x3 + 4 },
  previewContent: { flex: 1, padding: S.md, gap: 4 },
  previewNickname: { color: C.text, fontSize: F.lg, fontWeight: '900', letterSpacing: 0.5 },
  previewArch: { color: C.orange, fontSize: F.xs, fontWeight: '800', letterSpacing: 1.5 },
  previewTagRow: { flexDirection: 'row', gap: S.xs, marginTop: 2, flexWrap: 'wrap' },
  previewTag: { backgroundColor: C.bgCard2, borderRadius: R.sm, paddingHorizontal: S.sm, paddingVertical: 3, borderWidth: 1, borderColor: C.border },
  previewTagAlt: { borderColor: C.lime + '55', backgroundColor: 'rgba(200,240,0,0.06)' },
  previewTagTxt: { color: C.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  // Sections
  section: { marginBottom: S.x2 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: S.md },
  sectionNum: { color: C.orange, fontSize: 11, fontWeight: '900', letterSpacing: 0.5, minWidth: 24 },
  sectionLine: { width: 1, height: 12, backgroundColor: C.border },
  sectionLbl: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 2.5 },
  fieldLabel: { color: C.textMuted, fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: S.xs, textTransform: 'uppercase' },

  // Identity card
  identityCard: {
    flexDirection: 'row', gap: S.sm,
    backgroundColor: C.bgCard, borderRadius: R.lg,
    borderWidth: 1, borderColor: C.border, padding: S.md,
  },
  nicknameBlock: { flex: 1 },
  nickInput: {
    backgroundColor: C.bgPanel, borderRadius: R.md,
    borderWidth: 1, borderColor: C.borderLight,
    color: C.text, fontSize: F.base, fontWeight: '800',
    paddingHorizontal: S.md, paddingVertical: 12, letterSpacing: 0.5,
  },
  jerseyBlock: { width: 76, alignItems: 'center' },
  jerseyInputWrap: {
    width: '100%', backgroundColor: C.bgPanel, borderRadius: R.md,
    borderWidth: 1, borderColor: C.borderLight,
    alignItems: 'center', justifyContent: 'center', paddingVertical: 6,
  },
  jerseySymbol: { color: C.textMuted, fontSize: F.xs, fontWeight: '900', letterSpacing: 1 },
  jerseyInput: { color: C.lime, fontSize: F.x2, fontWeight: '900', letterSpacing: -1, textAlign: 'center', padding: 0, width: '100%' },

  // Chips
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  chip: { paddingHorizontal: S.md, paddingVertical: 10, borderRadius: R.full, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border },
  chipCompact: { paddingHorizontal: S.sm, paddingVertical: 7 },
  chipActiveL: { borderColor: C.lime, backgroundColor: 'rgba(200,240,0,0.10)' },
  chipActiveO: { borderColor: C.orange, backgroundColor: 'rgba(255,91,0,0.10)' },
  chipTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '700', letterSpacing: 0.3 },
  chipCompactTxt: { fontSize: 10 },
  chipTxtActiveL: { color: C.lime, fontWeight: '900' },
  chipTxtActiveO: { color: C.orange, fontWeight: '900' },

  // Level buttons
  levelWrap: { gap: S.sm },
  levelBtn: { flexDirection: 'row', alignItems: 'center', gap: S.md, borderRadius: R.md, borderWidth: 1, padding: S.md },
  levelBar: { width: 3, height: 18, borderRadius: 2 },
  levelTxt: { flex: 1, fontSize: F.sm, fontWeight: '800', letterSpacing: 1 },
  levelCheck: { width: 22, height: 22, borderRadius: R.full, alignItems: 'center', justifyContent: 'center' },
  levelCheckTxt: { color: '#000', fontSize: 10, fontWeight: '900' },

  // Bio
  textarea: {
    backgroundColor: C.bgCard, borderRadius: R.lg,
    borderWidth: 1, borderColor: C.borderLight,
    color: C.text, fontSize: F.sm,
    paddingHorizontal: S.md, paddingVertical: S.md, minHeight: 80, textAlignVertical: 'top',
  },
  charCount: { color: C.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1, textAlign: 'right', marginTop: S.xs },

  // Footer
  footer: { paddingHorizontal: S.screen, paddingTop: S.sm, paddingBottom: 32, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bg },
  validHint: { color: C.orange, fontSize: F.xs, fontWeight: '700', textAlign: 'center', marginBottom: S.sm, letterSpacing: 0.5 },
  saveBtn: { backgroundColor: C.lime, borderRadius: R.md, paddingVertical: 17, alignItems: 'center', justifyContent: 'center' },
  saveBtnDim: { opacity: 0.35 },
  saveBtnTxt: { color: '#000', fontSize: F.sm, fontWeight: '900', letterSpacing: 2.5, textTransform: 'uppercase' },
});
