# POTA — Codebase Context & Handover Document

> **Son güncelleme:** 29 Mayıs 2026 (TypeScript tam geçiş tamamlandı)
> Bu dosya her önemli prompt sonrası güncellenir. Başka bir cihazdan devam ederken bu dosyayı oku.

---

## 1. Proje Özeti

**POTA** — İstanbul'da sokak basketbolu oynamak isteyen oyuncuları bir araya getiren mobil uygulama.  
Konsept: "Nerede maç var, kimler oynuyor, katılabilir miyim?"  
Tasarım dili: Koyu tema, NBA 2K oyunu estetiği (lime/turuncu, OVR kartı, rozetler, tier sistemi).

---

## 2. Tech Stack

| Katman | Teknoloji | Versiyon |
|---|---|---|
| Framework | Expo (SDK ~55.0.24) | expo ~55.0.24 |
| Routing | Expo Router | ~55.0.14 |
| UI | React Native | 0.83.6 |
| React | React | 19.2.0 |
| **Dil** | **TypeScript (strict mode)** | **^5.x** |
| Global State | Zustand | ^5.0.13 |
| Server State | TanStack Query | ^5.100.11 |
| Harita | react-native-maps | 1.27.2 |
| Konum | expo-location | ~55.1.10 |
| Görsel | expo-image | ~55.0.11 |
| Storage | @react-native-async-storage/async-storage | 2.2.0 |
| Backend/Auth/DB | @supabase/supabase-js | ^2.x |
| Build | EAS Build | — |

---

## 2b. TypeScript Yapılandırması

**`tsconfig.json`** — `expo/tsconfig.base` extend eder:
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "allowJs": true,
  "checkJs": false
}
```

**Path Aliases** (`@` prefix):
| Alias | Hedef |
|---|---|
| `@types/*` | `src/types/*` |
| `@models/*` | `src/models/*` |
| `@state/*` | `src/state/*` |
| `@infrastructure/*` | `src/infrastructure/*` |
| `@domains/*` | `src/domains/*` |
| `@lib/*` | `src/lib/*` |

**Kural:** `supabase` tipi `SupabaseClient | null` — erişimde `supabase!` non-null assertion kullanılır (env var kontrolü sonrası).  
**`checkJs: false`** — `mockData.js` gibi saf veri dosyaları tip kontrolü dışında tutulur.  
**`allowJs: true`** — geriye dönük uyumluluk re-export `.js` dosyaları derlenir.

---

## 3. Klasör Yapısı

```
POTA/
├── app/                        # Expo Router file-based routing (tümü .tsx)
│   ├── _layout.tsx             # Root layout (QueryClient, SafeAreaProvider, GlobalSheets)
│   ├── index.tsx               # Splash screen → useBootstrap → yönlendirme
│   ├── onboarding.tsx          # Yeni kullanıcı profil oluşturma
│   ├── filter.tsx              # Filtre ekranı (slide_from_bottom modal)
│   ├── create-run.tsx          # Maç oluşturma (slide_from_bottom, CreateRunScreen'e proxy)
│   └── (tabs)/
│       ├── _layout.tsx         # Tab bar layout + AppHeader
│       ├── index.tsx           # Home tab
│       ├── runs.tsx            # Runs tab
│       ├── map.tsx             # Map tab
│       ├── squad.tsx           # Squad tab
│       └── profile.tsx         # Profile tab
├── src/
│   ├── types/                  # ✅ Tüm TypeScript tip tanımları
│   │   ├── common.ts           # ID, ISO8601, Nullable<T>, Maybe<T>, BootState, Toast
│   │   ├── domain/
│   │   │   ├── auth.ts         # Session, AuthState, SignInPayload, AuthStore
│   │   │   ├── match.ts        # Match, MatchFilters, HomeFeed, CreateMatchPayload, FORMAT_LABEL, SKILL_LABEL
│   │   │   ├── notification.ts # NotificationType, Notification
│   │   │   ├── profile.ts      # Profile, ProfileOverview, PlayerStats, Badge, ProfileDraft
│   │   │   └── squad.ts        # Team, RosterMember, TeamDetail
│   │   ├── ui/
│   │   │   ├── sheets.ts       # SheetName, SheetPayload (discriminated union), OpenSheet, CloseSheet
│   │   │   └── store.ts        # UIState, UIActions, UIStore
│   │   ├── api/
│   │   │   └── responses.ts    # SupabaseProfileRow, SupabaseMatchRow, ApiResult<T>
│   │   ├── navigation/
│   │   │   └── routes.ts       # RootStackParamList, TabParamList
│   │   └── index.ts            # Barrel export
│   ├── models/                 # ✅ Domain iş mantığı (saf fonksiyonlar)
│   │   ├── Match.ts            # DEFAULT_MATCH_FILTERS, isMatchLive, isMatchFull, applyMatchFilters
│   │   ├── Notification.ts     # unreadCount, hasUnread, markAllAsRead
│   │   ├── Profile.ts          # getDisplayName, sortBadgesByTier, draftToProfileFields
│   │   ├── Team.ts             # isTeamFull, chemistryLabel
│   │   └── index.ts            # Barrel export
│   ├── infrastructure/         # ✅ Altyapı katmanı
│   │   ├── storage.ts          # storageGet<T>, storageSet<T>, storageRemove (typed keys)
│   │   ├── supabase.ts         # export const supabase: SupabaseClient | null
│   │   ├── api/
│   │   │   └── client.ts       # api.get/post/put/patch/del, api.isMock(), setAuthToken
│   │   └── index.ts
│   ├── state/                  # ✅ Zustand store'ları
│   │   ├── auth.store.ts       # useAuthStore — session, bootState, draft
│   │   ├── ui.store.ts         # useUIStore — activeSheet, activeFilters, toast
│   │   └── index.ts
│   ├── domains/                # ✅ Domain katmanı (servisler + hook'lar)
│   │   ├── auth/
│   │   │   ├── services.ts     # authService (getSession, signIn, signUp, signOut, signInWithGoogle)
│   │   │   ├── hooks/
│   │   │   │   └── useBootstrap.ts  # oturum kontrolü + router yönlendirme (bug fix: else branch)
│   │   │   └── index.ts
│   │   ├── match/
│   │   │   ├── services.ts     # matchService (getHomeFeed, getFilteredMatches, joinMatch, …)
│   │   │   ├── hooks/
│   │   │   │   ├── useMatches.ts      # useHomeFeed, useRunsFeed, useJoinMatch, useLeaveMatch, …
│   │   │   │   └── useCreateRunForm.ts # form state + buildMatchPayload()
│   │   │   ├── components/
│   │   │   │   └── CapacitySlider.tsx
│   │   │   └── index.ts
│   │   ├── notifications/
│   │   │   ├── services.ts     # notificationService
│   │   │   ├── hooks/
│   │   │   │   └── useNotifications.ts # useNotifications, useNotificationsCount, useMarkAllRead
│   │   │   └── index.ts
│   │   ├── profile/
│   │   │   ├── services.ts     # profileService
│   │   │   ├── hooks/
│   │   │   │   └── useProfile.ts # useProfileFeed
│   │   │   └── index.ts
│   │   └── squad/
│   │       ├── services.ts     # squadService (+ teamService alias)
│   │       ├── hooks/
│   │       │   └── useTeams.ts # useTeamFeed, useJoinTeam, useLeaveTeam
│   │       └── index.ts
│   ├── lib/                    # ✅ Yardımcı kütüphane
│   │   ├── helpers.ts          # delay<T>, getCurrentUserId, formatScheduledAt, buildScheduledAt
│   │   ├── index.ts
│   │   └── mock/
│   │       ├── data.ts         # re-export from ../../data/mockData
│   │       ├── store.ts        # MockStore interface + mockStore singleton
│   │       └── index.ts
│   ├── components/             # ✅ Paylaşılan UI bileşenleri (tümü .tsx)
│   │   ├── GlobalSheets.tsx
│   │   ├── Header.tsx
│   │   ├── ScreenStates.tsx
│   │   └── Toast.tsx
│   ├── screens/                # ✅ Ekranlar (tümü .tsx)
│   │   ├── HomeScreen.tsx, RunsScreen.tsx, MapScreen.tsx, SquadScreen.tsx, ProfileScreen.tsx
│   │   ├── OnboardingScreen.tsx, CreateRunScreen.tsx, LoginScreen.tsx
│   │   └── *Sheet.tsx (MatchDetail, TeamDetail, Chat, Notifications, ProfileEdit, …)
│   ├── constants.js            # DISTRICTS, SKILLS, FORMATS, POSITIONS, ARCHETYPES, EXPERIENCES
│   ├── data/
│   │   └── mockData.js         # MOCK_COURTS (10 saha), MOCK_PROFILE, MOCK_MATCHES, MOCK_TEAMS, MOCK_NOTIFICATIONS
│   ├── i18n/
│   │   ├── index.js            # t() fonksiyonu
│   │   └── tr.json             # Tüm UI string'leri Türkçe
│   └── theme.js                # C (renkler), F (font), R (radius), S (spacing)
│
│   # ── Geriye dönük uyumluluk re-export'ları (silinmedi) ──────────────────
│   ├── src/hooks/*.js          # → @domains/*/hooks/* re-export (eski import yolları için)
│   ├── src/store/auth.js       # → @state/auth.store re-export
│   ├── src/store/ui.js         # → @state/ui.store re-export
│   ├── src/services/index.js   # → domain services re-export
│   ├── src/api/client.js       # → @infrastructure/api/client re-export
│   └── src/supabase.js         # → @infrastructure/supabase re-export
│
├── tsconfig.json               # ✅ strict, noImplicitAny, strictNullChecks, noUncheckedIndexedAccess
├── babel.config.js             # .ts/.tsx extensions + @types/@models path aliases
├── App.js                      # ⚠️ KULLANILMIYOR — eski monolitik sürüm
├── .env                        # Gerçek ortam değişkenleri (git'e commit edilmez)
├── .env.example                # Env şablonu
├── app.config.js               # GOOGLE_MAPS_API_KEY env enjeksiyonu
├── app.json                    # Expo konfigürasyonu
├── eas.json                    # EAS Build profilleri
├── index.js                    # Entry point → expo-router/entry
└── package.json
```

---

## 4. Uygulama Akışı (Routing)

```
app/index.js (Splash)
  └── useBootstrap()
       ├── AsyncStorage'da session var → router.replace('/(tabs)/')
       └── Session yok → router.replace('/onboarding')

/onboarding
  ├── (MOCK_MODE=true)  → Profil formu → authService.signInMock() → router.replace('/(tabs)/')
  └── (MOCK_MODE=false) → E-posta+Şifre+Profil formu → authService.signUp() → router.replace('/(tabs)/')

/(tabs)/
  ├── index  → HomeTab     → HomeScreen
  ├── runs   → RunsTab     → RunsScreen
  ├── map    → MapTab      → MapScreen
  ├── squad  → SquadTab    → SquadScreen
  └── profile → ProfileTab → ProfileScreen

/filter         → FilterScreen     (slide_from_bottom)
/create-run     → CreateRunScreen  (slide_from_bottom)
```

---

## 5. State Yönetimi

### Zustand Store'ları

**`useAuthStore`** (`src/state/auth.store.ts`):
```typescript
session:       Nullable<Session>   — { id, email, profile } | null
bootState:     BootState           — 'idle' | 'loading' | 'guest' | 'ready'
draft:         Nullable<ProfileDraft>
setSession()  — session'ı set eder, bootState → 'ready'
clearSession() — session'ı temizler, bootState → 'guest'
setDraft()
setBootState()
```
*Eski yol:* `src/store/auth.js` → re-export olarak korundu.

**`useUIStore`** (`src/state/ui.store.ts`):
```typescript
activeSheet:   SheetName | null
sheetPayload:  SheetPayload | null  (discriminated union — 10 sheet tipi)
activeFilters: MatchFilters         — { district, skill, format }
toast:         Toast | null         — { message, type: ToastType }
openSheet(name, payload)
closeSheet()
setFilters(filters)
clearFilters()
showToast(message, type)   — 3.2 saniye sonra otomatik kapanır
hideToast()
```
*Eski yol:* `src/store/ui.js` → re-export olarak korundu.

### TanStack Query Keys
| Key | Hook | Açıklama |
|---|---|---|
| `['home-feed']` | `useHomeFeed` | Ana sayfa maç feed'i |
| `['runs-feed', activeFilters]` | `useRunsFeed` | Filtrelenmiş maç listesi |
| `['team-feed']` | `useTeamFeed` | Takım feed'i |
| `['profile', session]` | `useProfileFeed` | Oyuncu profil verisi |
| `['notifications']` | `useNotifications` | Bildirimler (60s polling) |

---

## 6. Global Sheets Sistemi

`GlobalSheets.tsx` — `app/_layout.tsx` içinde render edilir, tüm uygulamanın üstünde her zaman hazır.  
`useUIStore.openSheet(name, payload)` çağrısıyla herhangi bir ekrandan açılır.

| Sheet Adı | Bileşen | Payload |
|---|---|---|
| `'match-detail'` | MatchDetailSheet | match nesnesi |
| `'team-detail'` | TeamDetailSheet | team nesnesi |
| `'chat'` | ChatSheet | `{ team }` veya null (featured takımı açar) |
| `'notifications'` | NotificationsSheet | — |
| `'profile-edit'` | ProfileEditSheet | — (session.profile'ı kullanır) |
| `'player-profile'` | PlayerProfileSheet | player nesnesi |
| `'activity'` | ActivitySheet | — |
| `'pro-upgrade'` | ProUpgradeSheet | — |
| `'leaderboard'` | LeaderboardSheet | — |

---

## 7. Servis Katmanı

**`src/infrastructure/api/client.ts`**:
- `MOCK_MODE = false` → backend hazır olunca değiştir
- `BASE_URL = 'https://api.pota.app/v1'`
- `let _authToken: string | null`
- `api.isMock()`, `api.get<T>()`, `api.post<T>()`, `api.put<T>()`, `api.patch<T>()`, `api.del<T>()`
- *Eski yol:* `src/api/client.js` → re-export

**Domain servisler** (`src/domains/*/services.ts`):

| Servis | Dosya | Metodlar |
|---|---|---|
| `authService` | `domains/auth/services.ts` | `getSession()`, `signInMock(profile?)`, `signUp(email, password, draft)`, `signIn(email, password)`, `signInWithGoogle()`, `signOut()` |
| `matchService` | `domains/match/services.ts` | `getHomeFeed()`, `getNearbyMatches()`, `getFilteredMatches(filters)`, `createMatch(data)`, `joinMatch(id)`, `leaveMatch(id)`, `isJoined(id)`, `reportScore(id, outcome)` |
| `squadService` | `domains/squad/services.ts` | `getFeaturedTeams()`, `getTeamById(id)`, `joinTeam(id)`, `leaveTeam(id)`, `isJoined(id)` |
| `profileService` | `domains/profile/services.ts` | `createDefaultProfileDraft()`, `getProfileOverview(draft?)`, `updateProfile(updates)` |
| `notificationService` | `domains/notifications/services.ts` | `getNotifications()`, `markAllRead()`, `getUnreadCount()` |

**Mock mod (`MOCK_MODE=true`):** Servisler `src/lib/mock/store.ts` → `mockStore` singleton'ından döner.  
**Real mod (`MOCK_MODE=false`):** Supabase sorguları çalışır. `_sbMatchToApp()` satırı app shape'ine çevirir.  
Session AsyncStorage key (yalnızca mock): `@pota_session`  
Real modda session `supabase.auth.getSession()` üzerinden yönetilir.

---

## 8. Veri Modelleri

### Match (Maç)
```js
{
  id: 'mac-1',
  title: 'MAÇKA ELİT 5v5',
  district: 'Şişli',
  courtName: 'Maçka Parkı Sahası',
  courtLat: 41.0432, courtLng: 28.9979,
  dateTime: 'Bugün 21:00',
  format: '5v5 Tam Saha',          // '3v3 Yarı Saha' | '5v5 Tam Saha' | '1v1' | '2v2'
  playersJoined: 8,
  capacity: 10,
  skillLevel: 'Pro-Am',            // 'Açık Saha' | 'Orta Seviye' | 'Yarı-Pro' | 'Pro-Am' | 'Elit'
  intensity: 'Maksimum',
  host: 'Kral_34',
  feeType: 'Ucretli',              // 'Ucretli' | 'Ucretsiz'
  fee: '75',                       // TL veya 'UCRETSIZ'
  status: 'live',                  // 'live' | 'streaking' | null
  image: 'https://...',
  distance: '0.8 KM',
  description: '...',
  urgency?: '12 DAK KALDI',
  rank?: 'ALTIN+',
  spots?: '2 YER',
  cta?: 'YERİNİ KAPAT',
}
```

### Team (Takım)
```js
{
  id: 'takim-1',
  name: 'Kadıköy Fırtınası',
  district: 'Kadıköy',
  logo: 'https://...',
  ranking: '#1 BÖLGE SIRALAMASI',
  established: '2019',
  chemistry: 94,                   // 0-100
  rivalry: 'VS. BEŞİKTAŞ...',
  rosterSize: 5,
  recentForm: [{ result: 'W'|'L', opponent: '...' }],
  roster: [{ id, name, archetype, avatar, stats: [{ label, value }] }],
  offensiveRating: '118.7',
  offensiveRankText: 'BÖLGE\'DE #1',
  winStreak: 4,
  winStreakText: 'YANIYORUZ! BONUS AKTİF',
  defensiveRank: '#2 BÖLGEDE',
  chatPreview: [{ author, text }],
  chatUnread: 3,
  description: '...',
}
```

### Profile (Oyuncu Profili)
```js
{
  uid: '034-KRAL-34',
  nickname: 'Kral_34',
  district: 'Kadıköy',
  jerseyNumber: '34',
  position: 'Kanat',               // POSITIONS listesinden
  archetype: 'Keskin Nişancı Slasher',
  experience: 'Pro-Am',
  bio: '...',
  rank: 'Elmas III',
  rankTier: 3,
  playerRep: '12.7k',
  streetStatus: 'EFSANE',
  avatar: 'https://...',
}
```

### Badge (Rozet — NBA 2K tarzı)
```js
{
  id: 'bdg-deadeye',
  label: 'Deadeye',
  icon: '🎯',
  active: true,                    // kazanılmış mı?
  tier: 'HOF',                     // 'HOF' | 'GOLD' | 'SILVER' | 'BRONZE'
  description: '...',
  unlockCondition?: '...',         // sadece active:false olanlarda
}
```

---

## 9. Tasarım Sistemi (`src/theme.js`)

### Renkler (`C`)
| Değişken | Hex | Kullanım |
|---|---|---|
| `C.bg` | `#0D0D0F` | Arka plan |
| `C.bgCard` | `#161618` | Kart arka planı |
| `C.bgCard2` | `#1C1C1F` | İkincil kart |
| `C.bgPanel` | `#111113` | Panel/header |
| `C.border` | `#252529` | Kenar çizgisi |
| `C.text` | `#F0EDE6` | Ana yazı |
| `C.textDim` | `#8A8680` | Soluk yazı |
| `C.textMuted` | `#555259` | Çok soluk yazı |
| `C.orange` | `#FF5B00` | Ana aksan |
| `C.lime` | `#C8F000` | Vurgu/aktif |
| `C.green` | `#4ADE80` | Başarı |
| `C.red` | `#F87171` | Hata |
| `C.blue` | `#00D4FF` | Bilgi |
| `C.purple` | `#8B5CF6` | Özel |

### Tier Renkleri (maç skill level)
```js
'Açık Saha'  → #4ADE80  (yeşil)
'Orta Seviye'→ #A8CC00  (lime-dim)
'Yarı-Pro'   → #FBBF24  (sarı)
'Pro-Am'     → #FF7A2F  (turuncu)
'Elit'       → #F87171  (kırmızı)
```

### Font Boyutları (`F`)
`xs=10, sm=12, base=14, md=16, lg=18, xl=20, x2=24, x3=28, x4=34, x5=42, x6=54, x7=68`

### Border Radius (`R`)
`sm=8, md=12, lg=16, xl=20, x2=24, full=999, pill=999`

### Spacing (`S`)
`xs=4, sm=8, md=12, base=16, lg=20, xl=24, x2=32, x3=48, screen=20, screenV=24`

---

## 10. i18n Sistemi

- Dosya: `src/i18n/tr.json`
- Tek dil: Türkçe
- Kullanım: `import { t } from '../i18n'; t('common.live')` → `"CANLI"`
- Array döndürür (seçenek listeleri için): `t('profileEdit.positions')` → `["Oyun Kurucu", ...]`
- Parametre interpolasyonu: `t('matchDetail.fee_alert_msg', { fee: 75 })` → `"75 ₺ katılım ücreti..."`

---

## 11. Sabitler (`src/constants.js`)

```js
DISTRICTS:   ['Tümü', 'Şişli', 'Kadıköy', 'Beşiktaş', 'Üsküdar', 'Fatih', 'Bağcılar', 'Zeytinburnu', 'Sarıyer']
SKILLS:      ['Tümü', 'Açık Saha', 'Orta Seviye', 'Yarı-Pro', 'Pro-Am', 'Elit']
FORMATS:     ['Tümü', '3v3 Yarı Saha', '5v5 Tam Saha', '1v1', '2v2']
POSITIONS:   ['Oyun Kurucu', 'Kanat', 'Uzun Adam', 'Şut Oyuncusu', 'Pivot']   // ✅ düzeltildi
ARCHETYPES:  ['Slasher', 'Nişancı', 'Kale Bekçisi', 'Playmaker', 'Savunma Duvarı'] // ✅ düzeltildi
EXPERIENCES: ['Acemi', 'Orta Seviye', 'Yarı-Pro', 'Pro-Am', 'Elit']
```

---

## 12. Build & Deployment

```json
// eas.json profilleri
development:  expo-dev-client, APK, internal
preview:      APK, internal
production:   AAB (App Bundle)
```

- **Bundle ID (Android):** `com.knasln.pota`
- **EAS Project ID:** `b1e9474a-1b44-417c-95da-f0cffae2b014`
- **Google Maps API Key:** `.env` dosyasında `GOOGLE_MAPS_API_KEY` olarak tanımlanır (EAS secret)
- **Supabase URL:** `EXPO_PUBLIC_SUPABASE_URL=https://cknfzognxqyecfdaqlxe.supabase.co`
- **Supabase Anon Key:** `EXPO_PUBLIC_SUPABASE_ANON_KEY` — `.env` dosyasında (git'e commit edilmez)
- **Komutlar:**
  - `npm start` → Expo Go / dev build
  - `npm run android` → Android emülatör
  - `npx eas build --profile preview --platform android` → Test APK

---

## 13. Önemli Notlar & Bilinen Durumlar

### ⚠️ App.js Kullanılmıyor
`App.js` projenin kökünde var ama Expo Router'ın `app/` dizini öncelikli. Entry point `index.js` → `expo-router/entry`. `App.js` eski monolitik versiyon; `BottomTabs` ve `CreateRunSheet` gibi var olmayan bileşenlere başvuruyor. **Silinmedi çünkü referans olarak tutuluyor.**

### ✅ TypeScript Tam Geçiş (Tamamlandı — 29 Mayıs 2026)
- `tsconfig.json` oluşturuldu: `strict`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- Path aliases: `@types`, `@models`, `@state`, `@infrastructure`, `@domains`, `@lib`
- `babel.config.js` güncellendi: `.ts`/`.tsx` extensions, path alias'lar eklendi
- `src/types/` tamamlandı: common, domain/*, ui/*, api/responses, navigation/routes
- `src/models/` tamamlandı: Match, Profile, Team, Notification
- `src/infrastructure/` oluşturuldu: supabase.ts, storage.ts, api/client.ts
- `src/state/` oluşturuldu: auth.store.ts, ui.store.ts
- `src/domains/` oluşturuldu: auth, match, notifications, profile, squad (services + hooks)
- `src/lib/` güncellendi: helpers.ts, mock/store.ts (MockStore interface)
- Tüm bileşenler, ekranlar, app route'ları `.tsx` olarak yeniden adlandırıldı
- `useBootstrap.ts` — fallthrough bug düzeltildi (else branch eksikti)
- Geriye dönük uyumluluk: `src/hooks/*.js`, `src/store/*.js`, `src/services/index.js` → re-export

### ✅ Supabase Entegrasyonu (Tamamlandı — 22 Mayıs 2026)
- `@supabase/supabase-js` kurulu, `src/supabase.js` oluşturuldu
- `MOCK_MODE = false` — uygulama artık gerçek Supabase veritabanına yazıyor
- Supabase proje: `cknfzognxqyecfdaqlxe.supabase.co`
- E-posta doğrulaması Dashboard'dan kapatıldı (mobil uygulama için)
- `useBootstrap.js` içinde `supabase.auth.onAuthStateChange` listener eklendi

### 🗄️ Supabase Tabloları
```
profiles          → id, nickname, district, jersey_number, position, archetype, experience, bio
matches           → id, court_id, format, skill_level, scheduled_at, fee, max_players, is_private, created_by
match_participants → match_id, user_id, joined_at  (PK: match_id + user_id)
courts            → id, name, short_name, district, lat, lng, tier, popular, description, image_url
teams             → id, name, district, description, captain_id
team_members      → team_id, user_id, joined_at  (PK: team_id + user_id)
notifications     → id, user_id, type, title, body, read, created_at
```
Tüm tablolarda **RLS aktif**. Bkz. önceki prompt için SQL.

### 🔧 Mock Mode
`src/api/client.js` içinde `MOCK_MODE = false` (gerçek mod aktif).  
Mock moda dönmek için `MOCK_MODE = true` yap — tüm servisler in-memory `_store`'a döner.

### 📱 Map Ekranı
- `PROVIDER_GOOGLE` kullanıyor — Android'de Google Maps API key zorunlu
- `expo-location` ile kullanıcı konumu alıyor (`requestForegroundPermissionsAsync`)
- Court'lar artık tek kaynakta: `src/data/mockData.js` → `MOCK_COURTS` (10 İstanbul sahası)
- `MapScreen.js` ve `CreateRunScreen.js` artık `MOCK_COURTS`'u import ediyor

### 🏀 Mock Veri Değerleri
- **Mock oyuncu:** Kral_34, Kadıköy, Pro-Am, Kanat, rank: Elmas III
- **Mock maçlar:** 8 adet, tüm İstanbul ilçelerini kapsıyor, farklı tier'larda
- **Mock takımlar:** Kadıköy Fırtınası (#1), Boğaz Savunması (#3)
- **Leaderboard:** 12 kişi, SULTAN_34 birinci (OVR 97, Elmas I)

### 🔔 Bildirim Otomatik Okundu
`GlobalSheets.js` içinde: `notifications` sheet'i açıldıktan 2 saniye sonra `markAllRead.mutate()` otomatik çağrılır.

### 💰 Pro Upgrade Planlar
- Aylık: 79 ₺/ay
- Yıllık: 599 ₺/yıl (önerilen)
- Özellikler: Gelişmiş analitik, erken erişim, premium rozetler, leaderboard, öncelikli bildirimler, sohbet

---

## 14. Komponent Sorumlulukları (Özet)

| Komponent | Ne Yapar |
|---|---|
| `Header` | Logo + bildirim zili, unread count badge, zile tıklayınca `openSheet('notifications')` |
| `Toast` | `useUIStore.toast` dinler, animated slide-up bar, 3.2s otomatik kapanır |
| `SkeletonCard/List` | Veri yüklenirken animated placeholder |
| `ErrorState` | Hata + retry butonu |
| `GlobalSheets` | Tüm Modal'ları tek yerden yönetir, mutation hook'larını wire eder |
| `FilterScreen` | 3 tab (ilçe/seviye/format), Zustand'a yazar, router.back() |
| `CreateRunScreen` | Saha seçimi, format/seviye/saat/kapasite/ücret; `useCreateMatch` mutation |

---

## 15. Bağımlılık Grafiği (Basitleştirilmiş)

```
app/_layout.js
  └── GlobalSheets (tüm sheet'leri + Toast barındırır)
      ├── useUIStore (activeSheet, openSheet, closeSheet)
      ├── useAuthStore (session)
      └── tüm mutation hook'ları (useJoinMatch, useCreateMatch, ...)

app/(tabs)/_layout.js
  └── AppHeader
      └── useNotificationsCount → useNotifications

Her tab screen:
  └── ilgili hook (useHomeFeed, useTeamFeed, ...) → TanStack Query → services/index.js → api/client.js
```

---

## 16. Supabase Veri Dönüşümü

`src/services/index.js` içindeki `_sbMatchToApp(row, userId)` helper'ı Supabase satırını app shape'ine çevirir:

```
Supabase matches row           →  App Match Shape
─────────────────────────────────────────────────
row.format ('3V3'/'5V5')       →  format ('3v3 Yarı Saha'/'5v5 Tam Saha')
row.skill_level ('ROOKİE'..)   →  skillLevel ('Açık Saha'..)
row.courts.name                →  courtName
row.courts.district            →  district
row.courts.image_url           →  image
row.profiles.nickname          →  host
row.match_participants.length  →  playersJoined
row.max_players                →  capacity
```

Ters dönüşüm (app → Supabase) için `_FORMAT_RAW` ve `_SKILL_RAW` map'leri kullanılır.  
Maç yoksa courtId, MOCK_COURTS'tan fallback ile çözülür.

### Joined State Yönetimi
- Mock mod: `_store.joinedMatchIds[]` ve `_store.joinedTeamIds[]`
- Real mod: `_sbJoinedMatchIds[]` ve `_sbJoinedTeamIds[]` — her feed yenileme sonrası güncellenir
- `isJoined(id)` her iki modda çalışır

---

## 17. Değişiklik Günlüğü

### 29 Mayıs 2026 — TypeScript Tam Geçiş

| # | Değişiklik | Dosya(lar) |
|---|---|---|
| 1 | `tsconfig.json` oluşturuldu (strict mode) | `tsconfig.json` |
| 2 | `babel.config.js` güncellendi (.ts/.tsx + alias) | `babel.config.js` |
| 3 | `src/types/` tamamlandı (common, domain, ui, api, navigation) | yeni dosyalar |
| 4 | `src/models/` tamamlandı (Match, Profile, Team, Notification) | yeni dosyalar |
| 5 | Infrastructure katmanı oluşturuldu | `src/infrastructure/*.ts` |
| 6 | State store'ları TypeScript'e geçirildi | `src/state/auth.store.ts`, `ui.store.ts` |
| 7 | Domain servisler TypeScript'e geçirildi | `src/domains/*/services.ts` |
| 8 | Domain hook'lar TypeScript'e geçirildi (arrow fn, typed mutations) | `src/domains/*/hooks/*.ts` |
| 9 | `useBootstrap` fallthrough bug düzeltildi | `domains/auth/hooks/useBootstrap.ts` |
| 10 | `useCreateRunForm` TypeScript'e geçirildi | `domains/match/hooks/useCreateRunForm.ts` |
| 11 | `CapacitySlider.ts` → `.tsx` yeniden adlandırıldı | `domains/match/components/CapacitySlider.tsx` |
| 12 | `src/lib/helpers.ts` typed (generic `delay<T>`, SupabaseClient) | `lib/helpers.ts` |
| 13 | `MockStore` interface oluşturuldu | `lib/mock/store.ts` |
| 14 | Tüm bileşenler `.tsx` olarak yeniden adlandırıldı | `src/components/*.tsx` |
| 15 | Tüm ekranlar `.tsx` olarak yeniden adlandırıldı | `src/screens/*.tsx` |
| 16 | Tüm app route'ları `.tsx` olarak yeniden adlandırıldı | `app/**/*.tsx` |

---

### 22 Mayıs 2026 — Supabase Entegrasyonu

### 22 Mayıs 2026 — Supabase Entegrasyonu

| # | Değişiklik | Dosya |
|---|---|---|
| 1 | `showToast` ReferenceError bug fix | `CreateRunScreen.js` |
| 2 | POSITIONS: 'Şüt'→'Şut', 'Pivi'→'Pivot' | `constants.js` |
| 3 | ARCHETYPES: 'Kale Bekçi'→'Kale Bekçisi' | `constants.js` |
| 4 | Tüm mutation hook'larına `onError` + `showToast` eklendi | `useMatches.js`, `useTeams.js` |
| 5 | Toast string'leri eklendi | `tr.json` |
| 6 | `MOCK_COURTS` tek kaynağa taşındı (10 saha, tam veri) | `mockData.js` |
| 7 | MapScreen ve CreateRunScreen `MOCK_COURTS` import ediyor | `MapScreen.js`, `CreateRunScreen.js` |
| 8 | `src/supabase.js` oluşturuldu (AsyncStorage, autoRefresh) | yeni dosya |
| 9 | `authService.signUp()` Supabase kayıt akışı eklendi | `services/index.js` |
| 10 | Tüm servisler Supabase sorgularıyla güncellendi | `services/index.js` |
| 11 | `useBootstrap.js` Supabase auth state listener eklendi | `useBootstrap.js` |
| 12 | Email/şifre alanları onboarding'e eklendi (real mod) | `OnboardingScreen.js` |
| 13 | `app/onboarding.js` signUp/signInMock dallanması | `onboarding.js` |
| 14 | `MOCK_MODE = false` (canlı mod aktif) | `src/api/client.js` |
| 15 | `.env` oluşturuldu, Supabase credentials set edildi | `.env` |
| 16 | `courtId` create match payload'a eklendi | `CreateRunScreen.js` |

---

*Bu dosya otomatik olarak güncellenmektedir. Değişiklik yaptığında ilgili bölümü güncelle.*
