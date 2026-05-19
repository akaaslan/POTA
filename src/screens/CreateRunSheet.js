import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { C, F, R, S } from '../theme';

const { height: SCREEN_H } = Dimensions.get('window');

const DISTRICTS = ['Şişli', 'Kadıköy', 'Beşiktaş', 'Üsküdar', 'Fatih', 'Bağcılar', 'Zeytinburnu', 'Sarıyer'];
const FORMATS = ['3v3 Yarı Saha', '5v5 Tam Saha', '1v1', '2v2'];
const SKILLS = ['Açık Saha', 'Orta Seviye', 'Yarı-Pro', 'Pro-Am', 'Elit'];
const CAPACITIES = { '3v3 Yarı Saha': 6, '5v5 Tam Saha': 10, '1v1': 2, '2v2': 4 };

function SectionLabel({ children }) {
  return <Text style={cr.sectionLabel}>{children}</Text>;
}

function ChipGroup({ options, selected, onSelect }) {
  return (
    <View style={cr.chips}>
      {options.map(function(opt) {
        var active = selected === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[cr.chip, active && cr.chipActive]}
            onPress={function() { onSelect(opt); }}
          >
            <Text style={[cr.chipText, active && cr.chipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function CreateRunSheet({ open, onClose, onCreate }) {
  const [courtName, setCourtName] = useState('');
  const [district, setDistrict] = useState('Kadıköy');
  const [dateTime, setDateTime] = useState('');
  const [format, setFormat] = useState('5v5 Tam Saha');
  const [skill, setSkill] = useState('Açık Saha');
  const [fee, setFee] = useState('');
  const [freeEntry, setFreeEntry] = useState(true);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function reset() {
    setCourtName('');
    setDistrict('Kadıköy');
    setDateTime('');
    setFormat('5v5 Tam Saha');
    setSkill('Açık Saha');
    setFee('');
    setFreeEntry(true);
    setDescription('');
    setError('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleCreate() {
    if (!courtName.trim()) {
      setError('Saha adı boş bırakılamaz');
      return;
    }
    if (!dateTime.trim()) {
      setError('Tarih ve saat boş bırakılamaz');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onCreate({
        title: courtName.trim().toUpperCase(),
        courtName: courtName.trim(),
        district,
        dateTime,
        format,
        capacity: CAPACITIES[format] || 10,
        skillLevel: skill,
        fee: freeEntry ? '' : fee,
        description: description.trim(),
      });
      reset();
      onClose();
    } catch (e) {
      setError('Bir hata oluştu. Tekrar dene.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={!!open} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={cr.root}>
        <TouchableOpacity style={cr.backdrop} activeOpacity={1} onPress={handleClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={cr.avoidView}
        >
          <View style={cr.sheet}>
            <View style={cr.handle} />

            {/* Header */}
            <View style={cr.header}>
              <TouchableOpacity style={cr.closeBtn} onPress={handleClose}>
                <Text style={cr.closeIcon}>✕</Text>
              </TouchableOpacity>
              <Text style={cr.headerTitle}>MAÇ OLUŞTUR</Text>
              <View style={{ width: 32 }} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={cr.scroll}
              keyboardShouldPersistTaps="handled"
            >
              {/* Court Name */}
              <View style={cr.fieldGroup}>
                <SectionLabel>SAHA ADI</SectionLabel>
                <TextInput
                  style={cr.input}
                  placeholder="örn. Maçka Açık Saha"
                  placeholderTextColor={C.textDim}
                  value={courtName}
                  onChangeText={setCourtName}
                  maxLength={50}
                />
              </View>

              {/* District */}
              <View style={cr.fieldGroup}>
                <SectionLabel>BÖLGE</SectionLabel>
                <ChipGroup options={DISTRICTS} selected={district} onSelect={setDistrict} />
              </View>

              {/* Date/Time */}
              <View style={cr.fieldGroup}>
                <SectionLabel>TARİH VE SAAT</SectionLabel>
                <TextInput
                  style={cr.input}
                  placeholder="örn. Bugün 21:00"
                  placeholderTextColor={C.textDim}
                  value={dateTime}
                  onChangeText={setDateTime}
                  maxLength={30}
                />
              </View>

              {/* Format */}
              <View style={cr.fieldGroup}>
                <SectionLabel>FORMAT</SectionLabel>
                <ChipGroup options={FORMATS} selected={format} onSelect={setFormat} />
              </View>

              {/* Skill */}
              <View style={cr.fieldGroup}>
                <SectionLabel>SEVİYE</SectionLabel>
                <ChipGroup options={SKILLS} selected={skill} onSelect={setSkill} />
              </View>

              {/* Fee */}
              <View style={cr.fieldGroup}>
                <SectionLabel>KATILIM ÜCRETİ</SectionLabel>
                <View style={cr.feeRow}>
                  <TouchableOpacity
                    style={[cr.feeToggle, freeEntry && cr.feeToggleActive]}
                    onPress={function() { setFreeEntry(true); }}
                  >
                    <Text style={[cr.feeToggleText, freeEntry && cr.feeToggleTextActive]}>Ücretsiz</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[cr.feeToggle, !freeEntry && cr.feeToggleActive]}
                    onPress={function() { setFreeEntry(false); }}
                  >
                    <Text style={[cr.feeToggleText, !freeEntry && cr.feeToggleTextActive]}>Ücretli</Text>
                  </TouchableOpacity>
                  {!freeEntry ? (
                    <TextInput
                      style={[cr.input, cr.feeInput]}
                      placeholder="Miktar ₺"
                      placeholderTextColor={C.textDim}
                      value={fee}
                      onChangeText={setFee}
                      keyboardType="numeric"
                      maxLength={6}
                    />
                  ) : null}
                </View>
              </View>

              {/* Description */}
              <View style={cr.fieldGroup}>
                <SectionLabel>AÇIKLAMA (opsiyonel)</SectionLabel>
                <TextInput
                  style={[cr.input, cr.textarea]}
                  placeholder="Oyuncular için not..."
                  placeholderTextColor={C.textDim}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  maxLength={200}
                  textAlignVertical="top"
                />
              </View>

              {error ? (
                <View style={cr.errorBox}>
                  <Text style={cr.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={{ height: S.md }} />
            </ScrollView>

            {/* Submit */}
            <View style={cr.footer}>
              <TouchableOpacity
                style={cr.submitBtn}
                onPress={handleCreate}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={cr.submitText}>MAÇ OLUŞTUR</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const cr = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  avoidView: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.bgCard,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    maxHeight: SCREEN_H * 0.92,
    paddingBottom: 32,
  },
  handle: {
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: S.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.screen,
    paddingVertical: S.sm,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  closeBtn: {
    width: 32, height: 32,
    borderRadius: R.full,
    backgroundColor: C.bgCard2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: { color: C.textDim, fontSize: 14, fontWeight: '700' },
  headerTitle: {
    color: C.text,
    fontSize: F.sm,
    fontWeight: '900',
    letterSpacing: 2,
  },
  scroll: {
    paddingHorizontal: S.screen,
    paddingTop: S.md,
  },
  fieldGroup: { marginBottom: S.md },
  sectionLabel: {
    color: C.textDim,
    fontSize: F.xs,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: S.sm,
  },
  input: {
    backgroundColor: C.bgCard2,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    color: C.text,
    fontSize: F.sm,
    paddingHorizontal: S.md,
    paddingVertical: 13,
  },
  textarea: {
    height: 80,
    paddingTop: 13,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipActive: {
    backgroundColor: C.lime,
    borderColor: C.lime,
  },
  chipText: {
    color: C.textDim,
    fontSize: F.xs,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#000',
    fontWeight: '800',
  },
  feeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  feeToggle: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  feeToggleActive: { backgroundColor: C.lime, borderColor: C.lime },
  feeToggleText: { color: C.textDim, fontSize: F.xs, fontWeight: '600' },
  feeToggleTextActive: { color: '#000', fontWeight: '800' },
  feeInput: { flex: 1, marginTop: 0 },
  errorBox: {
    backgroundColor: 'rgba(248,113,113,0.15)',
    borderRadius: R.md,
    padding: S.sm,
    marginBottom: S.sm,
  },
  errorText: { color: C.red, fontSize: F.xs, fontWeight: '600' },
  footer: {
    paddingHorizontal: S.screen,
    paddingTop: S.sm,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  submitBtn: {
    backgroundColor: C.lime,
    borderRadius: R.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    color: '#000',
    fontSize: F.sm,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
