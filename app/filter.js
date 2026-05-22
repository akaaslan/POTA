import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '../src/store/ui';
import { C, F, R, S } from '../src/theme';
import { t } from '../src/i18n';

var DISTRICTS = ['Tümü', 'Şişli', 'Kadıköy', 'Beşiktaş', 'Üsküdar', 'Fatih', 'Bağcılar', 'Zeytinburnu', 'Sarıyer'];
var SKILLS    = ['Tümü', 'Açık Saha', 'Orta Seviye', 'Yarı-Pro', 'Pro-Am', 'Elit'];
var FORMATS   = ['Tümü', '3v3 Yarı Saha', '5v5 Tam Saha', '1v1', '2v2'];

var TABS = [
  { key: 'district', label: t('filter.tab_district'), options: DISTRICTS },
  { key: 'skill',    label: t('filter.tab_skill'),    options: SKILLS    },
  { key: 'format',   label: t('filter.tab_format'),   options: FORMATS   },
];

export default function FilterScreen() {
  var router       = useRouter();
  var params       = useLocalSearchParams();
  var insets       = useSafeAreaInsets();
  var activeFilters = useUIStore(function(s) { return s.activeFilters; });
  var setFilters   = useUIStore(function(s) { return s.setFilters; });

  var [local, setLocal]       = useState(activeFilters || { district: 'Tümü', skill: 'Tümü', format: 'Tümü' });
  var [activeTab, setActiveTab] = useState(params.initialKey || 'district');

  function pick(key, val) {
    setLocal(function(prev) { return Object.assign({}, prev, { [key]: val }); });
  }

  function reset() {
    setLocal({ district: 'Tümü', skill: 'Tümü', format: 'Tümü' });
  }

  function apply() {
    setFilters(local);
    router.back();
  }

  function hasFilters() {
    return local.district !== 'Tümü' || local.skill !== 'Tümü' || local.format !== 'Tümü';
  }

  var currentTab = TABS.find(function(t) { return t.key === activeTab; }) || TABS[0];

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={function() { router.back(); }} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backTxt}>{t('filter.back_btn')}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('filter.title')}</Text>
        {hasFilters() ? (
          <TouchableOpacity onPress={reset} style={s.resetBtn} activeOpacity={0.7}>
            <Text style={s.resetTxt}>{t('filter.reset_btn')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.resetBtn} />
        )}
      </View>

      {/* Active filter summary pills */}
      {hasFilters() ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.activeBar} contentContainerStyle={s.activeBarContent}>
          {local.district !== 'Tümü' ? (
            <View style={s.activePill}>
              <Text style={s.activePillTxt}>📍 {local.district}</Text>
            </View>
          ) : null}
          {local.skill !== 'Tümü' ? (
            <View style={s.activePill}>
              <Text style={s.activePillTxt}>🏀 {local.skill}</Text>
            </View>
          ) : null}
          {local.format !== 'Tümü' ? (
            <View style={s.activePill}>
              <Text style={s.activePillTxt}>⚡ {local.format}</Text>
            </View>
          ) : null}
        </ScrollView>
      ) : null}

      {/* Tab bar */}
      <View style={s.tabBar}>
        {TABS.map(function(tab) {
          var isActive = activeTab === tab.key;
          var hasVal   = local[tab.key] !== 'Tümü';
          return (
            <TouchableOpacity
              key={tab.key}
              style={s.tab}
              onPress={function() { setActiveTab(tab.key); }}
              activeOpacity={0.75}
            >
              <Text style={[s.tabTxt, isActive && s.tabTxtActive]}>{tab.label}</Text>
              {hasVal ? <View style={s.tabDot} /> : null}
              {isActive ? <View style={s.tabIndicator} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Option chips */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.chips}>
          {currentTab.options.map(function(opt) {
            var isActive = local[currentTab.key] === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[s.chip, isActive && s.chipActive]}
                onPress={function() { pick(currentTab.key, opt); }}
                activeOpacity={0.75}
              >
                <Text style={[s.chipTxt, isActive && s.chipTxtActive]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Apply button */}
      <View style={[s.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 24 }]}>
        <TouchableOpacity style={s.applyBtn} onPress={apply} activeOpacity={0.82}>
          <Text style={s.applyTxt}>{t('filter.apply_btn')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

var s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.screen,
    paddingVertical: S.md,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn:  { minWidth: 70 },
  backTxt:  { color: C.text, fontSize: F.xs, fontWeight: '900', letterSpacing: 1.5 },
  headerTitle: { color: C.text, fontSize: F.sm, fontWeight: '900', letterSpacing: 3 },
  resetBtn: { minWidth: 70, alignItems: 'flex-end' },
  resetTxt: { color: C.orange, fontSize: F.xs, fontWeight: '900', letterSpacing: 1 },

  activeBar:        { maxHeight: 48, borderBottomWidth: 1, borderBottomColor: C.border },
  activeBarContent: { alignItems: 'center', paddingHorizontal: S.screen, gap: 8 },
  activePill:    { backgroundColor: C.lime + '22', borderWidth: 1, borderColor: C.lime + '55', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  activePillTxt: { color: C.lime, fontSize: F.xs, fontWeight: '800' },

  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border },
  tab:    { flex: 1, alignItems: 'center', paddingVertical: 18, position: 'relative' },
  tabTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 2 },
  tabTxtActive: { color: C.lime },
  tabDot: { position: 'absolute', top: 10, right: 14, width: 5, height: 5, borderRadius: 3, backgroundColor: C.orange },
  tabIndicator: { position: 'absolute', bottom: 0, left: 16, right: 16, height: 2, backgroundColor: C.lime, borderRadius: 1 },

  scroll: { paddingHorizontal: S.screen, paddingTop: S.xl, paddingBottom: S.xl },
  chips:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip:      { borderWidth: 1, borderColor: C.border, borderRadius: R.sm, paddingHorizontal: 20, paddingVertical: 14 },
  chipActive: { backgroundColor: C.lime, borderColor: C.lime },
  chipTxt:      { color: C.textDim, fontSize: F.xs, fontWeight: '700', letterSpacing: 0.5 },
  chipTxtActive: { color: '#000', fontWeight: '900' },

  footer:   { paddingHorizontal: S.screen, paddingTop: S.md, borderTopWidth: 1, borderTopColor: C.border },
  applyBtn: { backgroundColor: C.lime, borderRadius: R.sm, paddingVertical: 18, alignItems: 'center' },
  applyTxt: { color: '#000', fontSize: F.md, fontWeight: '900', letterSpacing: 3 },
});
