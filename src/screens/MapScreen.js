import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { C, F, R, S } from '../theme';
import { t } from '../i18n';
import { MOCK_MATCHES, MOCK_COURTS } from '../data/mockData';

var COURTS = MOCK_COURTS;

var TIER_COLOR = {
  'Açık Saha':    '#4ADE80',
  'Orta Seviye':  '#A8CC00',
  'Yarı-Pro':     '#FBBF24',
  'Pro-Am':       '#FF7A2F',
  'Elit':         '#F87171',
};

// İstanbul merkezli başlangıç bölgesi
var ISTANBUL_REGION = {
  latitude:      41.0082,
  longitude:     28.9784,
  latitudeDelta:  0.28,
  longitudeDelta: 0.28,
};

// Kalabalık yoğunluğuna göre ısı rengi
function heatColor(players, capacity) {
  var pct = capacity > 0 ? players / capacity : 0;
  if (pct >= 0.75) return '#F87171';   // kırmızı — dolu
  if (pct >= 0.5)  return '#FF7A2F';   // turuncu
  if (pct >= 0.25) return '#C8F000';   // lime
  return '#4ADE8044';                   // boş
}

// Özel saha marker bileşeni
function CourtMarker({ court, isSelected, onPress }) {
  var color   = court.players > 0 ? heatColor(court.players, court.capacity) : C.border;
  var isLive  = court.status === 'live';
  return (
    <Marker
      coordinate={{ latitude: court.lat, longitude: court.lng }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={[mk.outer, { borderColor: isSelected ? C.lime : color }, isSelected && mk.outerSelected]}>
        {isLive ? <View style={mk.livePip} /> : null}
        <Text style={[mk.num, { color: court.players > 0 ? color : C.textDim }]}>
          {court.players}
        </Text>
        <Text style={mk.icon}>🏀</Text>
      </View>
    </Marker>
  );
}

export default function MapScreen({ onOpenMatch }) {
  var [selected, setSelected] = useState(null);
  var [userLocation, setUserLocation] = useState(null);
  var mapRef = useRef(null);

  useEffect(function() {
    Location.requestForegroundPermissionsAsync().then(function(res) {
      if (res.status === 'granted') {
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).then(function(loc) {
          setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        }).catch(function() {});
      }
    }).catch(function() {});
  }, []);

  var activeCourts  = COURTS.filter(function(c) { return c.players > 0; });
  var liveCourts    = COURTS.filter(function(c) { return c.status === 'live'; });
  var totalPlayers  = COURTS.reduce(function(sum, c) { return sum + c.players; }, 0);

  return (
    <View style={m.root}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={ISTANBUL_REGION}
        customMapStyle={DARK_MAP_STYLE}
      >
        {COURTS.map(function(court) {
          var isSelected = selected && selected.id === court.id;
          var color      = heatColor(court.players, court.capacity);
          return (
            <React.Fragment key={court.id}>
              {/* Isı halkası */}
              {court.players > 0 ? (
                <Circle
                  center={{ latitude: court.lat, longitude: court.lng }}
                  radius={350}
                  fillColor={color + '28'}
                  strokeColor={color + '55'}
                  strokeWidth={1}
                />
              ) : null}
              <CourtMarker
                court={court}
                isSelected={isSelected}
                onPress={function() { setSelected(isSelected ? null : court); }}
              />
            </React.Fragment>
          );
        })}
        {/* User location marker */}
        {userLocation ? (
          <Marker
            coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }}
            tracksViewChanges={false}
          >
            <View style={mk.userMarker}>
              <View style={mk.userDot} />
            </View>
          </Marker>
        ) : null}
      </MapView>

      {/* İstatistik şeridi — haritanın üzerinde float eder */}
      <View style={m.statsRow}>
        <View style={m.statItem}>
          <Text style={m.statNum}>{totalPlayers}</Text>
          <Text style={m.statLabel}>{t('map.stat_players')}</Text>
        </View>
        <View style={m.statDivider} />
        <View style={m.statItem}>
          <Text style={m.statNum}>{activeCourts.length}</Text>
          <Text style={m.statLabel}>{t('map.stat_active_courts')}</Text>
        </View>
        <View style={m.statDivider} />
        <View style={m.statItem}>
          <Text style={[m.statNum, { color: '#F87171' }]}>{liveCourts.length}</Text>
          <Text style={m.statLabel}>{t('map.stat_live_matches')}</Text>
        </View>
      </View>

      {/* Seçili saha bilgi kartı */}
      {selected ? (
        <View style={m.card}>
          <View style={[m.cardTierBar, { backgroundColor: TIER_COLOR[selected.tier] || C.lime }]} />
          <View style={m.cardBody}>
            <View style={m.cardTop}>
              <View style={{ flex: 1 }}>
                <View style={m.cardTitleRow}>
                  {selected.status === 'live' ? (
                    <View style={m.liveChip}>
                      <Text style={m.liveChipTxt}>{t('map.live_badge')}</Text>
                    </View>
                  ) : null}
                  <Text style={m.cardName} numberOfLines={1}>{selected.name}</Text>
                </View>
                <Text style={m.cardMeta}>{selected.district}  ·  {selected.tier}</Text>
                <Text style={m.cardDesc} numberOfLines={1}>{selected.desc}</Text>
              </View>
              <TouchableOpacity onPress={function() { setSelected(null); }} style={m.closeBtn}>
                <Text style={m.closeTxt}>✕</Text>
              </TouchableOpacity>
            </View>
            {/* Doluluk barı */}
            <View style={m.progressRow}>
              <View style={m.progressTrack}>
                <View style={[
                  m.progressFill,
                  { width: (Math.round(selected.players / Math.max(selected.capacity, 1) * 100)) + '%',
                    backgroundColor: TIER_COLOR[selected.tier] || C.lime },
                ]} />
              </View>
              <Text style={m.progressTxt}>{selected.players}/{selected.capacity} {t('map.players_suffix')}</Text>
            </View>
            {/* Maçı Gör butonu */}
            {onOpenMatch ? (function() {
              var courtMatch = MOCK_MATCHES.find(function(match) {
                return match.district === selected.district && match.status === 'live';
              }) || MOCK_MATCHES.find(function(match) {
                return match.district === selected.district;
              });
              return courtMatch ? (
                <TouchableOpacity style={m.actionBtn} onPress={function() { onOpenMatch(courtMatch); }} activeOpacity={0.85}>
                  <Text style={m.actionTxt}>{t('map.see_match')}</Text>
                </TouchableOpacity>
              ) : null;
            })() : null}
          </View>
        </View>
      ) : null}

      {/* Renk lejantı */}
      <View style={m.legend}>
        <View style={[m.legendDot, { backgroundColor: '#F87171' }]} />
        <Text style={m.legendTxt}>{t('map.legend_crowded')}</Text>
        <View style={m.legendSep} />
        <View style={[m.legendDot, { backgroundColor: '#FF7A2F' }]} />
        <Text style={m.legendTxt}>{t('map.legend_active')}</Text>
        <View style={m.legendSep} />
        <View style={[m.legendDot, { backgroundColor: C.lime }]} />
        <Text style={m.legendTxt}>{t('map.legend_few')}</Text>
        <View style={m.legendSep} />
        <View style={[m.legendDot, { backgroundColor: C.border }]} />
        <Text style={m.legendTxt}>{t('map.legend_empty')}</Text>
      </View>

      {/* Geri Dön FAB */}
      <TouchableOpacity
        style={m.recenterBtn}
        onPress={function() {
          if (mapRef.current) mapRef.current.animateToRegion(ISTANBUL_REGION, 800);
        }}
        activeOpacity={0.8}
      >
        <Text style={m.recenterIcon}>◎</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Marker stilleri ──────────────────────────────────────────────────────────
var mk = StyleSheet.create({
  outer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1A1A26',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
  outerSelected: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
  },
  livePip: {
    position: 'absolute', top: 2, right: 2,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#F87171',
  },
  num:  { fontSize: 13, fontWeight: '900', lineHeight: 16 },
  icon: { fontSize: 10 },
  userMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,212,255,0.25)',
    borderWidth: 2,
    borderColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.blue,
  },
});

// ─── Ekran stilleri ───────────────────────────────────────────────────────────
var m = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: C.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: S.md,
  },
  statItem:    { flex: 1, alignItems: 'center' },
  statNum:     { color: C.lime, fontSize: F.xl, fontWeight: '900' },
  statLabel:   { color: C.textDim, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },

  map: { flex: 1 },

  card: {
    position: 'absolute',
    bottom: 80,
    left: S.screen,
    right: S.screen,
    backgroundColor: C.bgCard,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  cardTierBar: { height: 3, width: '100%' },
  cardBody:    { padding: S.md },
  cardTop:     { flexDirection: 'row', alignItems: 'flex-start', gap: S.sm },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  liveChip:    { backgroundColor: '#F87171', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  liveChipTxt: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  cardName:    { color: C.text, fontSize: F.sm, fontWeight: '900', letterSpacing: 0.5, flex: 1 },
  cardMeta:    { color: C.textDim, fontSize: F.xs, fontWeight: '700', letterSpacing: 0.5 },
  cardDesc:    { color: C.textDim, fontSize: F.xs, marginTop: 4 },
  closeBtn:    { padding: 4 },
  closeTxt:    { color: C.textDim, fontSize: F.md, fontWeight: '700' },
  progressRow:   { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginTop: S.sm },
  progressTrack: { flex: 1, height: 4, backgroundColor: C.border, borderRadius: 2, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 2 },
  progressTxt:   { color: C.textDim, fontSize: F.xs, fontWeight: '700', minWidth: 80, textAlign: 'right' },
  actionBtn: { marginTop: 10, backgroundColor: C.lime, borderRadius: R.sm, paddingVertical: 9, alignItems: 'center' },
  actionTxt: { color: '#000', fontSize: F.xs, fontWeight: '900', letterSpacing: 1.5 },

  legend: {
    position: 'absolute',
    top: S.screen + 72,
    right: S.sm,
    backgroundColor: C.bgCard + 'EE',
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'column',
    gap: 6,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  legendTxt: { color: C.textDim, fontSize: 10, fontWeight: '700' },
  legendSep: { height: 1, backgroundColor: C.border },
  recenterBtn: {
    position: 'absolute', bottom: 140, right: S.screen,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderLight,
    alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  recenterIcon: { color: C.lime, fontSize: 20 },
});

// ─── Koyu harita stili (Android / Google Maps) ────────────────────────────────
var DARK_MAP_STYLE = [
  { elementType: 'geometry',             stylers: [{ color: '#12121C' }] },
  { elementType: 'labels.text.fill',     stylers: [{ color: '#6B6B8A' }] },
  { elementType: 'labels.text.stroke',   stylers: [{ color: '#0D0D0F' }] },
  { featureType: 'road',              elementType: 'geometry',        stylers: [{ color: '#1E1E2E' }] },
  { featureType: 'road',              elementType: 'geometry.stroke', stylers: [{ color: '#0D0D0F' }] },
  { featureType: 'road',              elementType: 'labels.text.fill',stylers: [{ color: '#5A5A72' }] },
  { featureType: 'road.highway',      elementType: 'geometry',        stylers: [{ color: '#2A2A3E' }] },
  { featureType: 'water',             elementType: 'geometry',        stylers: [{ color: '#0A1628' }] },
  { featureType: 'water',             elementType: 'labels.text.fill',stylers: [{ color: '#1A3A5A' }] },
  { featureType: 'poi',               elementType: 'geometry',        stylers: [{ color: '#161624' }] },
  { featureType: 'poi.park',          elementType: 'geometry',        stylers: [{ color: '#0F1A0F' }] },
  { featureType: 'transit',           elementType: 'geometry',        stylers: [{ color: '#1A1A2E' }] },
  { featureType: 'administrative',    elementType: 'geometry.stroke', stylers: [{ color: '#2A2A3E' }] },
  { featureType: 'landscape',         elementType: 'geometry',        stylers: [{ color: '#111120' }] },
];
