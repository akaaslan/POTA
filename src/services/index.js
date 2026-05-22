
// ─── POTA Servis Katmanı ──────────────────────────────────────────────────────
// Backend entegrasyon rehberi:
//   api.isMock() === true  → mock data döner (şu an bu mod aktif)
//   api.isMock() === false → gerçek API çağrıları yapılır
//   Her metodun TODO yorumu hangi endpoint'in kullanılacağını gösterir
// ─────────────────────────────────────────────────────────────────────────────

import { api } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
var SESSION_KEY = '@pota_session';
import {
  MOCK_PROFILE,
  MOCK_MATCHES,
  MOCK_TEAMS,
  MOCK_NOTIFICATIONS,
  buildHomeFeed,
  buildProfileOverview,
} from '../data/mockData';

function _delay(value, ms) {
  return new Promise(function(resolve) {
    setTimeout(function() { resolve(value); }, ms || 350);
  });
}

// ─── In-memory store (mock only) ─────────────────────────────────────────────
var _store = {
  session: null,
  profile: Object.assign({}, MOCK_PROFILE),
  matches: MOCK_MATCHES.map(function(m) { return Object.assign({}, m); }),
  teams: MOCK_TEAMS.map(function(t) { return Object.assign({}, t); }),
  notifications: MOCK_NOTIFICATIONS.map(function(n) { return Object.assign({}, n); }),
  joinedMatchIds: [],
  joinedTeamIds: [],
};

// ─── Auth Service ─────────────────────────────────────────────────────────────
export var authService = {
  // TODO: api.get('/auth/session')
  async getSession() {
    if (api.isMock()) {
      if (_store.session) return _delay(_store.session, 100);
      try {
        var raw = await AsyncStorage.getItem(SESSION_KEY);
        if (raw) { _store.session = JSON.parse(raw); return _store.session; }
      } catch(e) {}
      return null;
    }
    return api.get('/auth/session');
  },
  // TODO: api.post('/auth/signin', profile)
  async signInMock(profile) {
    if (api.isMock()) {
      _store.profile = Object.assign({}, MOCK_PROFILE, profile);
      _store.session = { id: 'user-' + Date.now(), email: 'player@pota.app', profile: _store.profile };
      AsyncStorage.setItem(SESSION_KEY, JSON.stringify(_store.session)).catch(function() {});
      return _delay(_store.session, 450);
    }
    return api.post('/auth/signin', profile);
  },
  // TODO: api.post('/auth/signout')
  async signOut() {
    if (api.isMock()) {
      _store.session = null;
      _store.joinedMatchIds = [];
      _store.joinedTeamIds = [];
      await AsyncStorage.removeItem(SESSION_KEY).catch(function() {});
      return _delay(null, 200);
    }
    return api.post('/auth/signout');
  },
};

// ─── Match Service ─────────────────────────────────────────────────────────────
export var matchService = {
  // TODO: api.get('/matches/home-feed')
  async getHomeFeed() {
    if (api.isMock()) return _delay(buildHomeFeed(_store.matches), 400);
    return api.get('/matches/home-feed');
  },
  // TODO: api.get('/matches/nearby')
  async getNearbyMatches() {
    if (api.isMock()) return _delay({ matches: _store.matches.slice() }, 400);
    return api.get('/matches/nearby');
  },
  // TODO: api.get('/matches?district=X&skill=Y&format=Z')
  async getFilteredMatches(filters) {
    if (api.isMock()) {
      var results = _store.matches.slice();
      if (filters && filters.district && filters.district !== 'Tümü') {
        results = results.filter(function(m) { return m.district === filters.district; });
      }
      if (filters && filters.skill && filters.skill !== 'Tümü') {
        results = results.filter(function(m) { return m.skillLevel === filters.skill; });
      }
      if (filters && filters.format && filters.format !== 'Tümü') {
        results = results.filter(function(m) { return m.format === filters.format; });
      }
      return _delay({ matches: results }, 300);
    }
    var q = [];
    if (filters && filters.district && filters.district !== 'Tümü') q.push('district=' + encodeURIComponent(filters.district));
    if (filters && filters.skill && filters.skill !== 'Tümü') q.push('skill=' + encodeURIComponent(filters.skill));
    if (filters && filters.format && filters.format !== 'Tümü') q.push('format=' + encodeURIComponent(filters.format));
    return api.get('/matches?' + q.join('&'));
  },
  // TODO: api.post('/matches', data)
  async createMatch(data) {
    if (api.isMock()) {
      var newMatch = {
        id: 'mac-' + Date.now(),
        title: (data.title || 'YENİ MAÇ').toUpperCase(),
        district: data.district || 'Kadıköy',
        courtName: data.courtName || 'Belirsiz Saha',
        dateTime: data.dateTime || 'Bugün 20:00',
        format: data.format || '5v5 Tam Saha',
        playersJoined: 1,
        capacity: data.capacity || 10,
        skillLevel: data.skillLevel || 'Açık Saha',
        intensity: 'Orta',
        host: _store.profile.nickname || 'Sen',
        feeType: data.fee ? 'Ucretli' : 'Ucretsiz',
        fee: data.fee || 'UCRETSIZ',
        status: null,
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80',
        distance: '? KM',
        description: data.description || 'Yeni bir mahalle maçı. Herkes bekleniyor.',
      };
      _store.matches = [newMatch].concat(_store.matches);
      _store.joinedMatchIds.push(newMatch.id);
      return _delay(newMatch, 500);
    }
    return api.post('/matches', data);
  },
  // TODO: api.post('/matches/:id/join')
  async joinMatch(matchId) {
    if (api.isMock()) {
      _store.matches = _store.matches.map(function(m) {
        if (m.id === matchId) return Object.assign({}, m, { playersJoined: Math.min(m.capacity, m.playersJoined + 1) });
        return m;
      });
      if (_store.joinedMatchIds.indexOf(matchId) === -1) _store.joinedMatchIds.push(matchId);
      return _delay(_store.matches.find(function(m) { return m.id === matchId; }), 300);
    }
    return api.post('/matches/' + matchId + '/join');
  },
  // TODO: api.del('/matches/:id/join')
  async leaveMatch(matchId) {
    if (api.isMock()) {
      _store.matches = _store.matches.map(function(m) {
        if (m.id === matchId) return Object.assign({}, m, { playersJoined: Math.max(0, m.playersJoined - 1) });
        return m;
      });
      _store.joinedMatchIds = _store.joinedMatchIds.filter(function(id) { return id !== matchId; });
      return _delay(_store.matches.find(function(m) { return m.id === matchId; }), 300);
    }
    return api.del('/matches/' + matchId + '/join');
  },
  isJoined: function(matchId) {
    return _store.joinedMatchIds.indexOf(matchId) !== -1;
  },
  // TODO: api.post('/matches/:id/score')
  async reportScore(matchId, outcome) {
    if (api.isMock()) {
      return _delay({ success: true, matchId: matchId, outcome: outcome }, 300);
    }
    return api.post('/matches/' + matchId + '/score', { outcome: outcome });
  },
};

// ─── Team Service ─────────────────────────────────────────────────────────────
export var teamService = {
  // TODO: api.get('/teams/featured')
  async getFeaturedTeams() {
    if (api.isMock()) return _delay({ featuredTeam: _store.teams[0], teams: _store.teams.slice() }, 300);
    return api.get('/teams/featured');
  },
  // TODO: api.get('/teams/:id')
  async getTeamById(teamId) {
    if (api.isMock()) return _delay(_store.teams.find(function(t) { return t.id === teamId; }), 200);
    return api.get('/teams/' + teamId);
  },
  // TODO: api.post('/teams/:id/join')
  async joinTeam(teamId) {
    if (api.isMock()) {
      _store.teams = _store.teams.map(function(t) {
        if (t.id === teamId) return Object.assign({}, t, { rosterSize: t.rosterSize + 1, chemistry: Math.min(99, t.chemistry + 1) });
        return t;
      });
      if (_store.joinedTeamIds.indexOf(teamId) === -1) _store.joinedTeamIds.push(teamId);
      return _delay(_store.teams.find(function(t) { return t.id === teamId; }), 300);
    }
    return api.post('/teams/' + teamId + '/join');
  },
  // TODO: api.del('/teams/:id/join')
  async leaveTeam(teamId) {
    if (api.isMock()) {
      _store.teams = _store.teams.map(function(t) {
        if (t.id === teamId) return Object.assign({}, t, { rosterSize: Math.max(0, t.rosterSize - 1), chemistry: Math.max(0, t.chemistry - 1) });
        return t;
      });
      _store.joinedTeamIds = _store.joinedTeamIds.filter(function(id) { return id !== teamId; });
      return _delay(_store.teams.find(function(t) { return t.id === teamId; }), 300);
    }
    return api.del('/teams/' + teamId + '/join');
  },
  isJoined: function(teamId) {
    return _store.joinedTeamIds.indexOf(teamId) !== -1;
  },
};

// ─── Profile Service ──────────────────────────────────────────────────────────
export var profileService = {
  createDefaultProfileDraft: function() {
    return { nickname: '', district: '', jerseyNumber: '', position: 'Kanat', archetype: 'Nişancı', experience: 'Orta Seviye', bio: '' };
  },
  // TODO: api.get('/profile')
  async getProfileOverview(profileDraft) {
    if (api.isMock()) return _delay(buildProfileOverview(profileDraft), 350);
    return api.get('/profile');
  },
  // TODO: api.patch('/profile', updates)
  async updateProfile(updates) {
    if (api.isMock()) {
      _store.profile = Object.assign({}, _store.profile, updates);
      return _delay(buildProfileOverview(_store.profile), 300);
    }
    return api.patch('/profile', updates);
  },
};

// ─── Notification Service ──────────────────────────────────────────────────────
export var notificationService = {
  // TODO: api.get('/notifications')
  async getNotifications() {
    if (api.isMock()) return _delay(_store.notifications.slice(), 200);
    return api.get('/notifications');
  },
  // TODO: api.post('/notifications/read-all')
  async markAllRead() {
    if (api.isMock()) {
      _store.notifications = _store.notifications.map(function(n) { return Object.assign({}, n, { read: true }); });
      return _delay(_store.notifications.slice(), 200);
    }
    return api.post('/notifications/read-all');
  },
  getUnreadCount: function() {
    return _store.notifications.filter(function(n) { return !n.read; }).length;
  },
};
