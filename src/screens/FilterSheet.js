import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { C, F, R, S } from '../theme';

const { height: SCREEN_H } = Dimensions.get('window');

const DISTRICTS = ['Tümü', 'Şişli', 'Kadıköy', 'Beşiktaş', 'Üsküdar', 'Fatih', 'Bağcılar', 'Zeytinburnu', 'Sarıyer'];
const SKILLS = ['Tümü', 'Açık Saha', 'Orta Seviye', 'Yarı-Pro', 'Pro-Am', 'Elit'];
const FORMATS = ['Tümü', '3v3 Yarı Saha', '5v5 Tam Saha', '1v1', '2v2'];

export default function FilterSheet({ open, activeFilters, onApply, onClose }) {
  const [local, setLocal] = useState(activeFilters || { district: 'Tümü', skill: 'Tümü', format: 'Tümü' });

  useEffect(() => {
    if (open) setLocal(activeFilters || { district: 'Tümü', skill: 'Tümü', format: 'Tümü' });
  }, [open]);

  function pick(key, val) {
    setLocal(function(prev) { return Object.assign({}, prev, { [key]: val }); });
  }

  function reset() {
    setLocal({ district: 'Tümü', skill: 'Tümü', format: 'Tümü' });
  }

  function apply() {
    onApply(local);
    onClose();
  }

  function hasFilters() {
    return local.district !== 'Tümü' || local.skill !== 'Tümü' || local.format !== 'Tümü';
  }

  return (
    <Modal visible={!!open} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={s.sheet}>
        {/* Handle */}
        <View style={s.handle} />

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>FİLTRELE</Text>
          {hasFilters() ? (
            <TouchableOpacity onPress={reset}>
              <Text style={s.resetText}>SIFIRLA</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {/* Bölge */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>BÖLGE</Text>
            <View style={s.chips}>
              {DISTRICTS.map(function(d) {
                var active = local.district === d;
                return (
                  <TouchableOpacity
                    key={d}
                    style={[s.chip, active && s.chipActive]}
                    onPress={function() { pick('district', d); }}
                  >
                    <Text style={[s.chipText, active && s.chipTextActive]}>{d}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Seviye */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>SEVİYE</Text>
            <View style={s.chips}>
              {SKILLS.map(function(sk) {
                var active = local.skill === sk;
                return (
                  <TouchableOpacity
                    key={sk}
                    style={[s.chip, active && s.chipActive]}
                    onPress={function() { pick('skill', sk); }}
                  >
                    <Text style={[s.chipText, active && s.chipTextActive]}>{sk}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Format */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>FORMAT</Text>
            <View style={s.chips}>
              {FORMATS.map(function(fmt) {
                var active = local.format === fmt;
                return (
                  <TouchableOpacity
                    key={fmt}
                    style={[s.chip, active && s.chipActive]}
                    onPress={function() { pick('format', fmt); }}
                  >
                    <Text style={[s.chipText, active && s.chipTextActive]}>{fmt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={{ height: S.md }} />
        </ScrollView>

        {/* Apply Button */}
        <View style={s.footer}>
          <TouchableOpacity style={s.applyBtn} onPress={apply} activeOpacity={0.8}>
            <Text style={s.applyText}>UYGULA</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: C.bgCard,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    paddingBottom: 40,
    maxHeight: SCREEN_H * 0.85,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: S.sm,
    marginBottom: S.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.screen,
    paddingBottom: S.sm,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    color: C.text,
    fontSize: F.sm,
    fontWeight: '800',
    letterSpacing: 2,
  },
  resetText: {
    color: C.orange,
    fontSize: F.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  scroll: {
    paddingHorizontal: S.screen,
    paddingTop: S.md,
  },
  section: {
    marginBottom: S.lg,
  },
  sectionLabel: {
    color: C.textDim,
    fontSize: F.xs,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: S.sm,
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
    letterSpacing: 0.5,
  },
  chipTextActive: {
    color: '#000',
    fontWeight: '800',
  },
  footer: {
    paddingHorizontal: S.screen,
    paddingTop: S.md,
  },
  applyBtn: {
    backgroundColor: C.lime,
    borderRadius: R.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyText: {
    color: '#000',
    fontSize: F.sm,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
