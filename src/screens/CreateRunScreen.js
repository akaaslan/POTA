import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Image, Switch, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, R, S } from '../theme';
import { useCreateMatch } from '../hooks/useMatches';
import { t } from '../i18n';
import { useUIStore } from '../store/ui';
import { MOCK_COURTS } from '../data/mockData';

var COURTS = MOCK_COURTS;

var FORMAT_LABEL = { '3V3': '3v3 Yarı Saha', '5V5': '5v5 Tam Saha' };
var LEVEL_LABEL  = { 'ROOKİE': 'Açık Saha', 'PRO-AM': 'Pro-Am', 'ELİT': 'Elit' };
function buildTimes() {
  var times = [];
  for (var h = 7; h <= 23; h++) {
    times.push((h < 10 ? '0' : '') + h + ':00');
    if (h < 23) times.push((h < 10 ? '0' : '') + h + ':30');
  }
  return times;
}
var TIMES = buildTimes(); // 07:00 … 23:00, her 30 dakikada bir
var FEES  = ['Ücretsiz', '10 TL', '20 TL', '30 TL', '40 TL', '50 TL', '75 TL', '100 TL', 'Özel'];

function buildDays() {
  var labels = [];
  var today = new Date();
  var dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  for (var i = 0; i < 5; i++) {
    if (i === 0) { labels.push('Bugün'); continue; }
    if (i === 1) { labels.push('Yarın'); continue; }
    var d = new Date(today);
    d.setDate(today.getDate() + i);
    labels.push(dayNames[d.getDay()]);
  }
  return labels;
}
var DAYS = buildDays();
var MAX_BY_FMT = { '3V3': 6, '5V5': 10 };

var THUMB_D   = 22;
function CapacitySlider({ value, min, max, onChange }) {
  var trackWRef = useRef(1);
  var [trackW, setTrackW] = useState(1);

  var pct     = max > min ? (value - min) / (max - min) : 0;
  var thumbPx = Math.max(0, pct * (trackW - THUMB_D));

  function calcAndEmit(locationX) {
    var w = trackWRef.current;
    if (w <= THUMB_D) return;
    var p   = Math.max(0, Math.min(1, locationX / w));
    var val = Math.round(min + p * (max - min));
    onChange(val);
  }

  function onLayout(e) {
    var w = e.nativeEvent.layout.width;
    trackWRef.current = w;
    setTrackW(w);
  }

  return (
    <View style={sl.root}>
      {/* Touch surface — captures full 44 px height */}
      <View
        style={sl.hitArea}
        onLayout={onLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={function(e) { calcAndEmit(e.nativeEvent.locationX); }}
        onResponderMove={function(e) { calcAndEmit(e.nativeEvent.locationX); }}
      >
        {/* Track */}
        <View style={sl.track} pointerEvents="none">
          <View style={[sl.fill, { width: thumbPx + THUMB_D / 2 }]} />
        </View>
        {/* Thumb */}
        <View
          pointerEvents="none"
          style={[sl.thumb, { left: thumbPx, top: (44 - THUMB_D) / 2 }]}
        />
      </View>
      <View style={sl.labels}>
        <Text style={sl.labelTxt}>{min}</Text>
        <Text style={sl.labelTxt}>{max}</Text>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function CreateRunScreen() {
  var router = useRouter();
  var insets = useSafeAreaInsets();
  var createMatch = useCreateMatch();
  var showToast = useUIStore(function(s) { return s.showToast; });

  var [courtId,  setCourtId]  = useState(COURTS[0].id);
  var [format,   setFormat]   = useState('3V3');
  var [level,    setLevel]    = useState('ROOKİE');
  var [capacity, setCapacity] = useState(6);
  var [dayIdx,   setDayIdx]   = useState(0);
  var [timeIdx,  setTimeIdx]  = useState(24); // 19:00
  var [feeIdx,   setFeeIdx]   = useState(0);
  var [isPublic,    setIsPublic]    = useState(true);
  var [title,       setTitle]       = useState('');
  var [description, setDescription] = useState('');
  var [customFee,   setCustomFee]   = useState('');

  var maxPlayers = MAX_BY_FMT[format] || 6;

  function handleFormat(f) {
    setFormat(f);
    var newMax = MAX_BY_FMT[f] || 6;
    if (capacity > newMax) setCapacity(newMax);
  }

  function handleCreate() {
    var court      = COURTS.find(function(c) { return c.id === courtId; }) || COURTS[0];
    var feeRaw     = FEES[feeIdx];
    var fee        = feeRaw === 'Ücretsiz' ? null
      : feeRaw === 'Özel' ? (customFee.trim() || null)
      : feeRaw.replace(' TL', '');
    var matchTitle = title.trim()
      ? title.trim().toUpperCase()
      : (court.name + ' ' + (FORMAT_LABEL[format] || format)).toUpperCase();
    createMatch.mutate({
      title:       matchTitle,
      courtId:     court.id,
      courtName:   court.name,
      district:    court.district,
      format:      FORMAT_LABEL[format] || format,
      skillLevel:  LEVEL_LABEL[level]   || level,
      capacity:    capacity,
      dayOffset:   dayIdx,
      dateTime:    DAYS[dayIdx] + ' ' + TIMES[timeIdx],
      fee:         fee,
      isPublic:    isPublic,
      description: description.trim() || null,
    }, {
      onSuccess: function() { showToast(t('createRun.success'), 'success'); router.back(); },
    });
  }

  return (
    <View style={[g.root, { paddingTop: insets.top }]}>

      {/* ── Header ── */}
      <View style={g.header}>
        <TouchableOpacity
          onPress={function() { router.back(); }}
          style={g.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Text style={g.backTxt}>{t('createRun.back_btn')}</Text>
        </TouchableOpacity>
          <Text style={g.headerTitle}>{t('createRun.header_title')}</Text>
        <View style={g.headerRight} />
      </View>

      <ScrollView
        style={g.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={g.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero ── */}
        <View style={g.hero}>
          <View style={g.heroGlow} />
          <Text style={g.heroTitle}>{t('createRun.hero_title')}</Text>
          <Text style={g.heroSub}>{t('createRun.hero_sub')}</Text>
        </View>

        {/* ── Court Selection ── */}
        <View style={g.secRow}>
          <Text style={g.secTitle}>{t('createRun.section_court')}</Text>
          <Text style={g.secSub}>{t('createRun.section_court_nearby')}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={g.courtList}
        >
          {COURTS.map(function(court) {
            var sel = courtId === court.id;
            return (
              <TouchableOpacity
                key={court.id}
                style={[cd.card, sel && cd.cardSel]}
                onPress={function() { setCourtId(court.id); }}
                activeOpacity={0.82}
              >
                {/* Image */}
                <View style={cd.imgBox}>
                  <Image
                    source={{ uri: court.image }}
                    style={cd.img}
                    resizeMode="cover"
                  />
                  {court.popular ? (
                    <View style={cd.badge}>
                      <Text style={cd.badgeTxt}>{t('createRun.court_popular')}</Text>
                    </View>
                  ) : null}
                  {sel ? (
                    <View style={cd.selOverlay}>
                      <Text style={cd.checkmark}>✓</Text>
                    </View>
                  ) : null}
                </View>

                {/* Info */}
                <View style={cd.info}>
                  <Text style={[cd.name, sel && cd.nameSel]} numberOfLines={1}>
                    {court.name}
                  </Text>
                  <View style={cd.metaRow}>
                    <Text style={cd.metaTxt} numberOfLines={1}>
                      {'📍 '}{court.district}{', '}{court.distance}
                    </Text>
                    <Text style={[cd.selBtn, sel && cd.selBtnOn]}>
                      {sel ? t('createRun.court_selected') : t('createRun.court_select')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Match Details header ── */}
        <Text style={[g.secTitle, g.secTitleBlock]}>{t('createRun.section_details')}</Text>

        {/* ── Match Title ── */}
        <View style={card.box}>
          <Text style={card.label}>MAÇ İSMİ (OPSİYONEL)</Text>
          <TextInput
            style={inp.field}
            placeholder={
              (COURTS.find(function(c) { return c.id === courtId; }) || COURTS[0]).name +
              ' — ' + (FORMAT_LABEL[format] || format)
            }
            placeholderTextColor={C.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={40}
            returnKeyType="done"
          />
        </View>

        {/* ── Format ── */}
        <View style={card.box}>
          <Text style={card.label}>{t('createRun.format_label')}</Text>
          <View style={tog.row}>
            {['3V3', '5V5'].map(function(f) {
              var on = format === f;
              return (
                <TouchableOpacity
                  key={f}
                  style={[tog.btn, on && tog.btnOn]}
                  onPress={function() { handleFormat(f); }}
                  activeOpacity={0.8}
                >
                  <Text style={[tog.txt, on && tog.txtOn]}>{f === '3V3' ? t('createRun.format_3v3') : t('createRun.format_5v5')}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Level ── */}
        <View style={card.box}>
          <Text style={card.label}>{t('createRun.level_label')}</Text>
          <View style={tog.row}>
            {['ROOKİE', 'PRO-AM', 'ELİT'].map(function(l) {
              var on = level === l;
              return (
                <TouchableOpacity
                  key={l}
                  style={[tog.btn, tog.btnFlex, on && tog.btnOn]}
                  onPress={function() { setLevel(l); }}
                  activeOpacity={0.8}
                >
                  <Text style={[tog.txt, on && tog.txtOn]}>
                    {l === 'ROOKİE' ? t('createRun.level_rookie') : l === 'PRO-AM' ? t('createRun.level_proam') : t('createRun.level_elite')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Capacity ── */}
        <View style={cap.box}>
          <View style={cap.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={card.label}>{t('createRun.capacity_label')}</Text>
              <Text style={cap.bigNum}>{capacity} {t('createRun.capacity_suffix')}</Text>
            </View>
            <Text style={cap.emojiIcon}>👥</Text>
          </View>
          <CapacitySlider
            value={capacity}
            min={1}
            max={maxPlayers}
            onChange={setCapacity}
          />
        </View>

        {/* ── Day + Time + Fee ── */}
        {/* Day */}
        <View style={card.box}>
          <Text style={card.label}>{t('createRun.day_label') || 'GÜN'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: S.sm }}>
            <View style={tog.row}>
              {DAYS.map(function(day, idx) {
                var on = dayIdx === idx;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[tog.btn, tog.btnFlex, on && tog.btnOn]}
                    onPress={function() { setDayIdx(idx); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[tog.txt, on && tog.txtOn]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* ── Time ── */}
        <View style={card.box}>
          <Text style={card.label}>{t('createRun.time_label')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: S.sm }}>
            <View style={tog.row}>
              {TIMES.map(function(time, idx) {
                var on = timeIdx === idx;
                return (
                  <TouchableOpacity
                    key={time}
                    style={[tog.btn, on && tog.btnOn, { flex: 0, paddingHorizontal: 14 }]}
                    onPress={function() { setTimeIdx(idx); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[tog.txt, on && tog.txtOn, { fontSize: F.xs }]}>{time}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* ── Fee ── */}
        <View style={card.box}>
          <Text style={card.label}>{t('createRun.fee_label')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: S.sm }}>
            <View style={tog.row}>
              {FEES.map(function(fee, idx) {
                var on = feeIdx === idx;
                return (
                  <TouchableOpacity
                    key={fee}
                    style={[tog.btn, on && tog.btnOn, { flex: 0, paddingHorizontal: 14 }]}
                    onPress={function() { setFeeIdx(idx); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[tog.txt, on && tog.txtOn, { fontSize: F.xs }]}>{fee}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          {FEES[feeIdx] === 'Özel' ? (
            <TextInput
              style={inp.field}
              placeholder="Tutar gir (ör. 45)"
              placeholderTextColor={C.textMuted}
              keyboardType="numeric"
              value={customFee}
              onChangeText={setCustomFee}
              maxLength={6}
              returnKeyType="done"
            />
          ) : null}
        </View>

        {/* ── Privacy ── */}
        <View style={prv.box}>
          <View style={prv.left}>
            <Text style={prv.title}>GİZLİLİK</Text>
            <Text style={prv.sub}>
              {isPublic ? 'HERKESE AÇIK MAÇ' : 'SADECE DAVETLILER'}
            </Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: C.border, true: C.lime }}
            thumbColor={C.bg}
          />
        </View>

        {/* ── Description ── */}
        <View style={card.box}>
          <Text style={card.label}>AÇIKLAMA (OPSİYONEL)</Text>
          <TextInput
            style={[inp.field, inp.textArea]}
            placeholder="Maç hakkında kısa bir not... (ör. seviye beklentisi, ekipman, park yeri)"
            placeholderTextColor={C.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={200}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* ── Sticky CTA ── */}
      <View style={[cta.bar, { paddingBottom: Math.max(insets.bottom, S.base) }]}>
        <TouchableOpacity
          style={[cta.btn, createMatch.isPending && cta.btnDim]}
          onPress={handleCreate}
          activeOpacity={0.86}
          disabled={createMatch.isPending}
        >
          <Text style={cta.txt}>{createMatch.isPending ? t('createRun.submit_loading') : t('createRun.submit_default')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Slider styles ────────────────────────────────────────────────────────────
var sl = StyleSheet.create({
  root:     { marginTop: S.sm },
  hitArea:  { height: 44 },
  track: {
    position: 'absolute',
    top: (44 - 4) / 2,
    left: 0, right: 0,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: C.lime,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_D, height: THUMB_D,
    borderRadius: THUMB_D / 2,
    backgroundColor: C.lime,
    elevation: 6,
    shadowColor: C.lime,
    shadowOpacity: 0.55,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: S.xs,
  },
  labelTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '700' },
});

// ─── Court card styles ────────────────────────────────────────────────────────
var cd = StyleSheet.create({
  card: {
    width: 155,
    marginRight: S.md,
    backgroundColor: C.bgCard,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  cardSel: { borderColor: C.lime, borderWidth: 2 },

  imgBox:  { height: 130, backgroundColor: C.bgPanel },
  img:     { width: '100%', height: '100%' },

  badge: {
    position: 'absolute',
    top: S.sm, left: S.sm,
    backgroundColor: C.orange,
    borderRadius: R.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeTxt: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },

  selOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(200,240,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { color: C.lime, fontSize: 34, fontWeight: '900' },

  info:    { padding: S.sm },
  name:    { color: C.text, fontSize: F.xs, fontWeight: '900', letterSpacing: 1, marginBottom: S.xs },
  nameSel: { color: C.lime },

  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaTxt: { color: C.textDim, fontSize: 9, flex: 1 },
  selBtn:  { color: C.textDim, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  selBtnOn: { color: C.lime },
});

// ─── Toggle styles ────────────────────────────────────────────────────────────
var tog = StyleSheet.create({
  row:    { flexDirection: 'row', gap: S.xs },
  btn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: C.bg,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFlex: { flex: 1 },
  btnOn:   { backgroundColor: C.lime, borderColor: C.lime },
  txt:     { color: C.textDim, fontSize: F.sm, fontWeight: '900', letterSpacing: 2 },
  txtOn:   { color: C.bg },
});

// ─── Capacity card styles ─────────────────────────────────────────────────────
var cap = StyleSheet.create({
  box: {
    marginHorizontal: S.screen,
    marginTop: S.sm,
    backgroundColor: C.bgCard2,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    padding: S.md,
  },
  topRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: S.sm },
  bigNum:    { color: C.orange, fontSize: F.x3, fontWeight: '900', letterSpacing: -0.5, marginTop: 2 },
  emojiIcon: { fontSize: 34, marginLeft: S.md },
});

// ─── Shared card styles ───────────────────────────────────────────────────────
var card = StyleSheet.create({
  box: {
    marginHorizontal: S.screen,
    marginTop: S.sm,
    backgroundColor: C.bgCard,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    padding: S.md,
  },
  label: {
    color: C.textDim,
    fontSize: F.xs,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: S.sm,
  },
});

// ─── Time + Fee styles ────────────────────────────────────────────────────────
var tf = StyleSheet.create({
  row:      { flexDirection: 'row', marginHorizontal: S.screen, marginTop: S.sm, gap: S.sm },
  halfCard: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    padding: S.md,
  },
  valRow:   { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginTop: S.xs },
  icon:     { fontSize: F.md },
  val:      { color: C.text, fontSize: F.base, fontWeight: '800' },
});

// ─── Privacy card styles ──────────────────────────────────────────────────────
var prv = StyleSheet.create({
  box: {
    marginHorizontal: S.screen,
    marginTop: S.sm,
    backgroundColor: C.bgCard,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    padding: S.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  left:  { flex: 1 },
  title: { color: C.text, fontSize: F.sm, fontWeight: '900', letterSpacing: 1 },
  sub:   { color: C.textDim, fontSize: F.xs, marginTop: 3, fontWeight: '700' },
});

// ─── Input styles ───────────────────────────────────────────────────────────────
var inp = StyleSheet.create({
  field: {
    marginTop: S.sm,
    backgroundColor: C.bg,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    color: C.text,
    fontSize: F.sm,
    fontWeight: '700',
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
  },
  textArea: {
    minHeight: 80,
    paddingTop: S.sm,
  },
});

// ─── CTA bar styles ───────────────────────────────────────────────────────────
var cta = StyleSheet.create({
  bar: {
    paddingHorizontal: S.screen,
    paddingTop: S.md,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  btn: {
    backgroundColor: C.orange,
    borderRadius: R.md,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txt: { color: '#fff', fontSize: F.md, fontWeight: '900', letterSpacing: 2 },
  btnDim: { opacity: 0.5 },
});

// ─── Screen / global styles ───────────────────────────────────────────────────
var g = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: S.screen,
    paddingVertical: S.md,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn:    { minWidth: 72 },
  backTxt:    { color: C.text, fontSize: F.xs, fontWeight: '800', letterSpacing: 1 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: C.text,
    fontSize: F.sm,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerRight: { minWidth: 72 },

  // Hero
  hero: {
    paddingHorizontal: S.screen,
    paddingTop: S.x2,
    paddingBottom: S.lg,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -40, left: -40,
    width: 220, height: 220,
    borderRadius: 110,
    backgroundColor: C.orange,
    opacity: 0.08,
  },
  heroTitle: {
    color: C.orange,
    fontSize: F.x6,          // 54
    fontWeight: '900',
    fontStyle: 'italic',
    lineHeight: F.x6 * 1.05,
    letterSpacing: -1,
  },
  heroSub: {
    color: C.text,
    fontSize: F.xs,
    fontWeight: '800',
    fontStyle: 'italic',
    letterSpacing: 2.5,
    marginTop: S.sm,
    opacity: 0.75,
  },

  // Section rows
  secRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.screen,
    marginTop: S.lg,
    marginBottom: S.md,
  },
  secTitle:      { color: C.text, fontSize: F.sm, fontWeight: '900', letterSpacing: 2 },
  secSub:        { color: C.lime, fontSize: F.xs, fontWeight: '800', letterSpacing: 1.5 },
  secTitleBlock: {
    paddingHorizontal: S.screen,
    marginTop: S.x2,
    marginBottom: S.sm,
    color: C.text,
    fontSize: F.sm,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // Court horizontal list
  courtList: { paddingLeft: S.screen, paddingRight: S.sm },
});
