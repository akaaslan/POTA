import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, R, S } from '../theme';
import { t } from '../i18n';
import { MOCK_COURTS } from '../data/mockData';
import { useRunsFeed } from '../hooks/useMatches';
import type { Match } from '../types/domain/match';

const TIER_COLOR: Record<string, string> = {
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

interface Court {
  id: string; name: string; shortName: string; district: string;
  lat: number; lng: number; players: number; capacity: number;
  status: string; tier: string; popular: boolean; distance: string;
  desc: string; image: string;
}
type UserLocation = { lat: number; lng: number };

// Kalabalık yoğunluğuna göre ısı rengi
function heatColor(players: number, capacity: number): string {
  var pct = capacity > 0 ? players / capacity : 0;
  if (pct >= 0.75) return '#F87171';   // kırmızı — dolu
  if (pct >= 0.5)  return '#FF7A2F';   // turuncu
  if (pct >= 0.25) return '#C8F000';   // lime
  return '#4ADE80';                     // boş
}

// Özel saha marker bileşeni
interface CourtMarkerProps { court: Court; isSelected: boolean; onPress: () => void; }
function CourtMarker({ court, isSelected, onPress }: CourtMarkerProps) {
  // Start tracking so the custom view renders on first load,
  // then disable after a short delay to avoid per-frame re-renders.
  var [tracked, setTracked] = useState(true);
  useEffect(function() {
    var timer = setTimeout(function() { setTracked(false); }, 500);
    return function() { clearTimeout(timer); };
  }, []);
  var color   = court.players > 0 ? heatColor(court.players, court.capacity) : C.border;
  var isLive  = court.status === 'live';
  return (
    <Marker
      coordinate={{ latitude: court.lat, longitude: court.lng }}
      onPress={onPress}
      tracksViewChanges={tracked || isSelected}
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

interface UserMarkerProps { coordinate: { latitude: number; longitude: number }; }
function UserMarker({ coordinate }: UserMarkerProps) {
  var [tracked, setTracked] = useState(true);
  useEffect(function() {
    var timer = setTimeout(function() { setTracked(false); }, 500);
    return function() { clearTimeout(timer); };
  }, []);
  return (
    <Marker coordinate={coordinate} tracksViewChanges={tracked}>
      <View style={mk.userMarker}>
        <View style={mk.userDot} />
      </View>
    </Marker>
  );
}

interface MapScreenProps {
  onOpenMatch?:   (match: Match) => void;
  onOpenBooking?: (courtId: string, courtName: string) => void;
}
export default function MapScreen({ onOpenMatch, onOpenBooking }: MapScreenProps) {
  var insets = useSafeAreaInsets();
  var { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();
  var [selected, setSelected] = useState<Court | null>(null);
  var [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  var [mapRegion, setMapRegion] = useState<Region>(ISTANBUL_REGION);
  var mapRegionRef = useRef<Region>(ISTANBUL_REGION);
  var rafRef = useRef<number | null>(null);
  var mapRef = useRef<MapView>(null);

  function handleRegionChange(region: Region) {
    mapRegionRef.current = region;
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(function() {
        setMapRegion(mapRegionRef.current);
        rafRef.current = null;
      });
    }
  }
  var matchFeed = useRunsFeed();
  var liveMatches: Match[] = (matchFeed.data && matchFeed.data.matches) || [];

  // Augment MOCK_COURTS with real player counts and live status.
  // If no live data yet, keep static mock values so markers remain visible.
  var COURTS = MOCK_COURTS.map(function(court) {
    var courtMatches = liveMatches.filter(function(m) { return m.district === court.district; });
    if (!courtMatches.length) return court; // keep original players/status from MOCK_COURTS
    var totalPlayers = courtMatches.reduce(function(sum: number, m) { return sum + (m.playersJoined ?? 0); }, 0);
    var hasLive = courtMatches.some(function(m) { return m.status === 'live'; });
    return Object.assign({}, court, {
      players: totalPlayers,
      status: hasLive ? 'live' : 'active',
    });
  });

  useEffect(function() {
    Location.requestForegroundPermissionsAsync().then(function(res) {
      if (res.status === 'granted') {
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).then(function(loc) {
          setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        }).catch(function() {});
      }
    }).catch(function() {});
    return function() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  var activeCourts  = COURTS.filter(function(c) { return c.players > 0; });
  var liveCourts    = COURTS.filter(function(c) { return c.status === 'live'; });
  var totalPlayers  = COURTS.reduce(function(sum, c) { return sum + c.players; }, 0);

  // ── Off-screen user location arrow ──────────────────────────────────────────
  var userArrow = null;
  if (userLocation) {
    var latMin = mapRegion.latitude  - mapRegion.latitudeDelta  / 2;
    var latMax = mapRegion.latitude  + mapRegion.latitudeDelta  / 2;
    var lngMin = mapRegion.longitude - mapRegion.longitudeDelta / 2;
    var lngMax = mapRegion.longitude + mapRegion.longitudeDelta / 2;
    var userVisible = (
      userLocation.lat > latMin && userLocation.lat < latMax &&
      userLocation.lng > lngMin && userLocation.lng < lngMax
    );
    if (!userVisible) {
      var dLat = userLocation.lat - mapRegion.latitude;
      var dLng = userLocation.lng - mapRegion.longitude;
      // Convert geographic delta → screen pixels using map's current scale
      var pxPerLat = SCREEN_H / mapRegion.latitudeDelta;
      var pxPerLng = SCREEN_W / mapRegion.longitudeDelta;
      var sdx =  dLng * pxPerLng; // +X = east  (rightward)
      var sdy = -dLat * pxPerLat; // +Y = south (downward)
      // Arrow rotation: 0° = up (▲ points north), clockwise
      var angle = Math.atan2(sdx, -sdy) * (180 / Math.PI);
      // Map center = true screen center (MapView fills full viewport)
      var mapCX = SCREEN_W / 2;
      var mapCY = SCREEN_H / 2;
      // Drawable bounds for the arrow button center
      var ARROW_BTN = 36;
      var ARROW_PAD = 20;
      var topOff    = 64; // stats bar height
      var bottomOff = Math.max(insets.bottom, 14) + 82; // tab bar + recenter btn
      var bx1 = ARROW_PAD + ARROW_BTN / 2;
      var bx2 = SCREEN_W - ARROW_PAD - ARROW_BTN / 2;
      var by1 = topOff + ARROW_PAD + ARROW_BTN / 2;
      var by2 = SCREEN_H - bottomOff;
      // Scale direction vector until it hits the nearest bound edge
      var sx = Math.abs(sdx) > 0.001
        ? (sdx > 0 ? bx2 - mapCX : mapCX - bx1) / Math.abs(sdx)
        : Infinity;
      var sy = Math.abs(sdy) > 0.001
        ? (sdy > 0 ? by2 - mapCY : mapCY - by1) / Math.abs(sdy)
        : Infinity;
      var arrowS = Math.min(sx, sy);
      var arrowCX = Math.max(bx1, Math.min(bx2, mapCX + sdx * arrowS));
      var arrowCY = Math.max(by1, Math.min(by2, mapCY + sdy * arrowS));
      userArrow = {
        left:  arrowCX - ARROW_BTN / 2,
        top:   arrowCY - ARROW_BTN / 2,
        angle: angle,
      };
    }
  }

  return (
    <View style={m.root}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={StyleSheet.absoluteFillObject}
        initialRegion={ISTANBUL_REGION}
        {...(Platform.OS === 'android' ? { customMapStyle: DARK_MAP_STYLE } : {})}
        onRegionChangeComplete={handleRegionChange}
      >
        {COURTS.map(function(court) {
          var isSelected = !!selected && selected.id === court.id;
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
          <UserMarker coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }} />
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
                  { width: `${Math.round(selected.players / Math.max(selected.capacity, 1) * 100)}%`,
                    backgroundColor: TIER_COLOR[selected.tier] ?? C.lime },
                ]} />
              </View>
              <Text style={m.progressTxt}>{selected.players}/{selected.capacity} {t('map.players_suffix')}</Text>
            </View>
            {/* Aksiyon butonları */}
            <View style={m.actionRow}>
              {onOpenMatch ? (function() {
                var courtMatch = liveMatches.find(function(match) {
                  return match.district === selected!.district && match.status === 'live';
                }) || liveMatches.find(function(match) {
                  return match.district === selected!.district;
                });
                return courtMatch ? (
                  <TouchableOpacity style={m.actionBtn} onPress={function() { onOpenMatch(courtMatch!); }} activeOpacity={0.85}>
                    <Text style={m.actionTxt}>{t('map.see_match')}</Text>
                  </TouchableOpacity>
                ) : null;
              })() : null}
              {onOpenBooking ? (
                <TouchableOpacity
                  style={m.bookingBtn}
                  onPress={function() { onOpenBooking(selected!.id, selected!.name); }}
                  activeOpacity={0.85}
                >
                  <Text style={m.bookingTxt}>REZERVE ET  📅</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      ) : null}

      {/* Renk lejantı */}
      <View style={m.legend}>
        <View style={m.legendRow}>
          <View style={[m.legendDot, { backgroundColor: '#F87171' }]} />
          <Text style={m.legendTxt}>{t('map.legend_crowded')}</Text>
        </View>
        <View style={m.legendSep} />
        <View style={m.legendRow}>
          <View style={[m.legendDot, { backgroundColor: '#FF7A2F' }]} />
          <Text style={m.legendTxt}>{t('map.legend_active')}</Text>
        </View>
        <View style={m.legendSep} />
        <View style={m.legendRow}>
          <View style={[m.legendDot, { backgroundColor: C.lime }]} />
          <Text style={m.legendTxt}>{t('map.legend_few')}</Text>
        </View>
        <View style={m.legendSep} />
        <View style={m.legendRow}>
          <View style={[m.legendDot, { backgroundColor: C.border }]} />
          <Text style={m.legendTxt}>{t('map.legend_empty')}</Text>
        </View>
      </View>
      {/* Off-screen kullanıcı ok göstergesi */}
      {userArrow ? (
        <TouchableOpacity
          style={[m.userArrowBtn, {
            left: userArrow.left,
            top:  userArrow.top,
            transform: [{ rotate: userArrow.angle + 'deg' }],
          }]}
          onPress={function() {
            if (mapRef.current) {
              mapRef.current.animateToRegion({
                latitude:      userLocation!.lat,
                longitude:     userLocation!.lng,
                latitudeDelta:  0.03,
                longitudeDelta: 0.03,
              }, 600);
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={m.userArrowIcon}>▲</Text>
        </TouchableOpacity>
      ) : null}
      {/* Geri Dön FAB */}
      <TouchableOpacity
        style={[m.recenterBtn, { bottom: selected ? 290 : Math.max(insets.bottom, 14) + 16 }]}
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
  actionRow: { flexDirection: 'row', gap: S.sm, marginTop: 10 },
  actionBtn: { flex: 1, backgroundColor: C.lime, borderRadius: R.sm, paddingVertical: 9, alignItems: 'center' },
  actionTxt: { color: '#000', fontSize: F.xs, fontWeight: '900', letterSpacing: 1.5 },
  bookingBtn: { flex: 1, borderWidth: 1, borderColor: C.borderLight, borderRadius: R.sm, paddingVertical: 9, alignItems: 'center' },
  bookingTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 1 },

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
  legendRow: { flexDirection: 'row', alignItems: 'center' },
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

  userArrowBtn: {
    position: 'absolute',
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.blue + 'CC',
    borderWidth: 2, borderColor: C.blue,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8,
    shadowColor: C.blue, shadowOpacity: 0.7, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
  },
  userArrowIcon: { color: '#fff', fontSize: 13, lineHeight: 14 },
});

// ─── Koyu harita stili (Android / Google Maps) ────────────────────────────────
var DARK_MAP_STYLE = [
  { elementType: 'geometry',             stylers: [{ color: '#0D0D1A' }] },
  { elementType: 'labels.text.fill',     stylers: [{ color: '#8888AA' }] },
  { elementType: 'labels.text.stroke',   stylers: [{ color: '#0D0D0F' }] },
  { featureType: 'road',              elementType: 'geometry',        stylers: [{ color: '#2C2C4A' }] },
  { featureType: 'road',              elementType: 'geometry.stroke', stylers: [{ color: '#1A1A2E' }] },
  { featureType: 'road',              elementType: 'labels.text.fill',stylers: [{ color: '#7070A0' }] },
  { featureType: 'road.highway',      elementType: 'geometry',        stylers: [{ color: '#3A3A5C' }] },
  { featureType: 'road.highway',      elementType: 'geometry.stroke', stylers: [{ color: '#24243C' }] },
  { featureType: 'water',             elementType: 'geometry',        stylers: [{ color: '#0A1628' }] },
  { featureType: 'water',             elementType: 'labels.text.fill',stylers: [{ color: '#1A3A5A' }] },
  { featureType: 'poi',               elementType: 'geometry',        stylers: [{ color: '#141422' }] },
  { featureType: 'poi.park',          elementType: 'geometry',        stylers: [{ color: '#0D1A0D' }] },
  { featureType: 'transit',           elementType: 'geometry',        stylers: [{ color: '#1A1A30' }] },
  { featureType: 'administrative',    elementType: 'geometry.stroke', stylers: [{ color: '#2A2A44' }] },
  { featureType: 'landscape',         elementType: 'geometry',        stylers: [{ color: '#0D0D1A' }] },
];
