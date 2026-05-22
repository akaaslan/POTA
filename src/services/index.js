
// ─── POTA Servis Katmanı ──────────────────────────────────────────────────────
// Backend entegrasyon rehberi:
//   api.isMock() === true  → mock data döner (şu an bu mod aktif)
//   api.isMock() === false → Supabase çağrıları yapılır
//   Her metodun TODO yorumu hangi endpoint/tablo kullanılacağını gösterir
// ─────────────────────────────────────────────────────────────────────────────

import { api } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase';
import { MOCK_COURTS } from '../data/mockData';
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

// ─── Supabase helpers ─────────────────────────────────────────────────────────
var _sbJoinedMatchIds = [];
var _sbJoinedTeamIds  = [];

async function _getCurrentUserId() {
  var result = await supabase.auth.getUser();
  return result.data && result.data.user ? result.data.user.id : null;
}

var _FORMAT_LABEL  = { '3V3': '3v3 Yarı Saha', '5V5': '5v5 Tam Saha' };
var _SKILL_LABEL   = { 'ROOKİE': 'Açık Saha', 'PRO-AM': 'Pro-Am', 'ELİT': 'Elit' };
var _FORMAT_RAW    = { '3v3 Yarı Saha': '3V3', '5v5 Tam Saha': '5V5' };
var _SKILL_RAW     = { 'Açık Saha': 'ROOKİE', 'Pro-Am': 'PRO-AM', 'Elit': 'ELİT' };

function _sbMatchToApp(row, userId) {
  var participants = row.match_participants || [];
  var playersJoined = participants.length;
  var isJoined = userId
    ? participants.some(function(p) { return p.user_id === userId; })
    : false;
  // Try DB court first, fallback to MOCK_COURTS
  var court = row.courts || null;
  if (!court && row.court_id) {
    var mc = MOCK_COURTS.find(function(c) { return c.id === row.court_id; });
    if (mc) court = { name: mc.name, short_name: mc.shortName, district: mc.district, image_url: mc.image };
  }
  court = court || {};
  var dt = row.scheduled_at ? new Date(row.scheduled_at) : null;
  var dateStr = dt
    ? dt.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' }) + ' ' +
      dt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : (row.date_time || '');
  return {
    id:           row.id,
    title:        ((court.short_name || court.name || 'SAHA') + ' ' + (row.format || '5V5')).toUpperCase(),
    district:     court.district  || row.district || '',
    courtName:    court.name      || row.court_name || '',
    courtId:      row.court_id    || null,
    dateTime:     dateStr,
    format:       _FORMAT_LABEL[row.format] || row.format || '5v5 Tam Saha',
    playersJoined: playersJoined,
    capacity:     row.max_players || 10,
    skillLevel:   _SKILL_LABEL[row.skill_level] || row.skill_level || 'Açık Saha',
    intensity:    'Orta',
    host:         row.profiles ? row.profiles.nickname : '?',
    feeType:      (row.fee && row.fee !== 'Ücretsiz') ? 'Ucretli' : 'Ucretsiz',
    fee:          row.fee || 'ÜCRETSİZ',
    status:       null,
    image:        court.image_url || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80',
    distance:     '? KM',
    description:  row.description || '',
    isJoined:     isJoined,
  };
}

var _MATCH_SELECT = '*, courts(*), profiles!created_by(nickname), match_participants(user_id)';

// ─── Auth Service ─────────────────────────────────────────────────────────────
export var authService = {
  // TODO: supabase.auth.getSession() → profiles table
  async getSession() {
    if (api.isMock()) {
      if (_store.session) return _delay(_store.session, 100);
      try {
        var raw = await AsyncStorage.getItem(SESSION_KEY);
        if (raw) { _store.session = JSON.parse(raw); return _store.session; }
      } catch(e) {}
      return null;
    }
    var result = await supabase.auth.getSession();
    var sbSession = result.data && result.data.session;
    if (!sbSession || !sbSession.user) return null;
    var profileResult = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sbSession.user.id)
      .single();
    var profile = profileResult.data || {};
    return { id: sbSession.user.id, email: sbSession.user.email, profile: profile };
  },

  // Mock-only sign-in (onboarding mock flow)
  async signInMock(profile) {
    _store.profile = Object.assign({}, MOCK_PROFILE, profile);
    _store.session = { id: 'user-' + Date.now(), email: 'player@pota.app', profile: _store.profile };
    AsyncStorage.setItem(SESSION_KEY, JSON.stringify(_store.session)).catch(function() {});
    return _delay(_store.session, 450);
  },

  // TODO: supabase.auth.signUp → profiles table insert
  async signUp(email, password, profileData) {
    if (api.isMock()) {
      return authService.signInMock(profileData);
    }
    var signUpResult = await supabase.auth.signUp({ email: email, password: password });
    if (signUpResult.error) throw signUpResult.error;
    var user = signUpResult.data && signUpResult.data.user;
    if (!user) throw new Error('Kayıt tamamlandı ama oturum açılamadı. Lütfen e-postanı onayla ve tekrar giriş yap.');
    var profileInsert = {
      id:           user.id,
      nickname:     profileData.nickname     || '',
      district:     profileData.district     || '',
      jersey_number: profileData.jerseyNumber || '',
      position:     profileData.position     || '',
      archetype:    profileData.archetype    || '',
      experience:   profileData.experience   || '',
      bio:          profileData.bio          || '',
    };
    var insertResult = await supabase.from('profiles').insert(profileInsert);
    if (insertResult.error) throw insertResult.error;
    var profile = Object.assign({}, profileData, { uid: user.id });
    return { id: user.id, email: user.email, profile: profile };
  },

  // TODO: supabase.auth.signOut()
  async signOut() {
    if (api.isMock()) {
      _store.session = null;
      _store.joinedMatchIds = [];
      _store.joinedTeamIds = [];
      await AsyncStorage.removeItem(SESSION_KEY).catch(function() {});
      return _delay(null, 200);
    }
    await supabase.auth.signOut();
  },
};

// ─── Match Service ─────────────────────────────────────────────────────────────
export var matchService = {
  async getHomeFeed() {
    if (api.isMock()) return _delay(buildHomeFeed(_store.matches), 400);
    var userId = await _getCurrentUserId();
    var { data: rows, error } = await supabase
      .from('matches')
      .select(_MATCH_SELECT)
      .order('scheduled_at', { ascending: true })
      .limit(20);
    if (error) throw error;
    var matches = (rows || []).map(function(r) { return _sbMatchToApp(r, userId); });
    _sbJoinedMatchIds = matches.filter(function(m) { return m.isJoined; }).map(function(m) { return m.id; });
    return {
      heroMatch:      matches[0] || null,
      squadActivity:  [],
      trendingCourts: MOCK_COURTS.filter(function(c) { return c.popular; }).map(function(c) {
        return {
          id: c.id, name: c.shortName, distance: c.distance,
          heat: c.players + '/' + c.capacity + ' OYUNCU',
          type: 'TAM SAHA', image: c.image, featuredMatch: null,
          activeRuns: matches.filter(function(m) { return m.district === c.district; }).length,
        };
      }),
      urgentRuns: matches.slice(0, 4),
    };
  },

  async getNearbyMatches() {
    if (api.isMock()) return _delay({ matches: _store.matches.slice() }, 400);
    var userId = await _getCurrentUserId();
    var { data: rows, error } = await supabase
      .from('matches').select(_MATCH_SELECT).order('scheduled_at', { ascending: true }).limit(50);
    if (error) throw error;
    return { matches: (rows || []).map(function(r) { return _sbMatchToApp(r, userId); }) };
  },

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
    var userId = await _getCurrentUserId();
    var query = supabase.from('matches').select(_MATCH_SELECT).order('scheduled_at', { ascending: true });
    if (filters && filters.skill && filters.skill !== 'Tümü') {
      var rawSkill = _SKILL_RAW[filters.skill] || filters.skill;
      query = query.eq('skill_level', rawSkill);
    }
    if (filters && filters.format && filters.format !== 'Tümü') {
      var rawFmt = _FORMAT_RAW[filters.format] || filters.format;
      query = query.eq('format', rawFmt);
    }
    var { data: rows, error } = await query;
    if (error) throw error;
    var matches = (rows || []).map(function(r) { return _sbMatchToApp(r, userId); });
    if (filters && filters.district && filters.district !== 'Tümü') {
      matches = matches.filter(function(m) { return m.district === filters.district; });
    }
    return { matches: matches };
  },

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
    var userId = await _getCurrentUserId();
    if (!userId) throw new Error('Oturum gerekli');
    // Build scheduled_at from time string like 'Bugün 19:00'
    var scheduledAt = null;
    if (data.dateTime) {
      var timePart = data.dateTime.replace('Bugün ', '').trim();
      var parts = timePart.split(':');
      if (parts.length === 2) {
        var d = new Date();
        d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
        scheduledAt = d.toISOString();
      }
    }
    var matchInsert = {
      court_id:    data.courtId || null,
      format:      _FORMAT_RAW[data.format]  || 'N/A',
      skill_level: _SKILL_RAW[data.skillLevel] || 'ROOKİE',
      scheduled_at: scheduledAt,
      fee:         data.fee ? data.fee + ' TL' : 'Ücretsiz',
      max_players: data.capacity || 10,
      is_private:  !data.isPublic,
      created_by:  userId,
    };
    var { data: inserted, error } = await supabase
      .from('matches').insert(matchInsert)
      .select(_MATCH_SELECT).single();
    if (error) throw error;
    await supabase.from('match_participants').insert({ match_id: inserted.id, user_id: userId });
    if (_sbJoinedMatchIds.indexOf(inserted.id) === -1) _sbJoinedMatchIds.push(inserted.id);
    return _sbMatchToApp(inserted, userId);
  },

  async joinMatch(matchId) {
    if (api.isMock()) {
      _store.matches = _store.matches.map(function(m) {
        if (m.id === matchId) return Object.assign({}, m, { playersJoined: Math.min(m.capacity, m.playersJoined + 1) });
        return m;
      });
      if (_store.joinedMatchIds.indexOf(matchId) === -1) _store.joinedMatchIds.push(matchId);
      return _delay(_store.matches.find(function(m) { return m.id === matchId; }), 300);
    }
    var userId = await _getCurrentUserId();
    if (!userId) throw new Error('Oturum gerekli');
    var { error } = await supabase.from('match_participants').insert({ match_id: matchId, user_id: userId });
    if (error) throw error;
    if (_sbJoinedMatchIds.indexOf(matchId) === -1) _sbJoinedMatchIds.push(matchId);
    return { id: matchId };
  },

  async leaveMatch(matchId) {
    if (api.isMock()) {
      _store.matches = _store.matches.map(function(m) {
        if (m.id === matchId) return Object.assign({}, m, { playersJoined: Math.max(0, m.playersJoined - 1) });
        return m;
      });
      _store.joinedMatchIds = _store.joinedMatchIds.filter(function(id) { return id !== matchId; });
      return _delay(_store.matches.find(function(m) { return m.id === matchId; }), 300);
    }
    var userId = await _getCurrentUserId();
    if (!userId) throw new Error('Oturum gerekli');
    var { error } = await supabase.from('match_participants')
      .delete().eq('match_id', matchId).eq('user_id', userId);
    if (error) throw error;
    _sbJoinedMatchIds = _sbJoinedMatchIds.filter(function(id) { return id !== matchId; });
    return { id: matchId };
  },

  isJoined: function(matchId) {
    return api.isMock()
      ? _store.joinedMatchIds.indexOf(matchId) !== -1
      : _sbJoinedMatchIds.indexOf(matchId) !== -1;
  },

  async reportScore(matchId, outcome) {
    if (api.isMock()) return _delay({ success: true, matchId: matchId, outcome: outcome }, 300);
    // Future: insert into match_history table
    return { success: true, matchId: matchId, outcome: outcome };
  },
};

// ─── Team Service ─────────────────────────────────────────────────────────────
export var teamService = {
  async getFeaturedTeams() {
    if (api.isMock()) return _delay({ featuredTeam: _store.teams[0], teams: _store.teams.slice() }, 300);
    var userId = await _getCurrentUserId();
    var { data: rows, error } = await supabase
      .from('teams')
      .select('*, team_members(user_id)')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    var teams = (rows || []).map(function(t) {
      var members = t.team_members || [];
      var joined = userId ? members.some(function(m) { return m.user_id === userId; }) : false;
      if (joined && _sbJoinedTeamIds.indexOf(t.id) === -1) _sbJoinedTeamIds.push(t.id);
      return {
        id: t.id, name: t.name, district: t.district || '',
        description: t.description || '', rosterSize: members.length,
        chemistry: 75, isJoined: joined,
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80',
      };
    });
    return { featuredTeam: teams[0] || null, teams: teams };
  },

  async getTeamById(teamId) {
    if (api.isMock()) return _delay(_store.teams.find(function(t) { return t.id === teamId; }), 200);
    var { data, error } = await supabase.from('teams').select('*, team_members(user_id)').eq('id', teamId).single();
    if (error) throw error;
    return data;
  },

  async joinTeam(teamId) {
    if (api.isMock()) {
      _store.teams = _store.teams.map(function(t) {
        if (t.id === teamId) return Object.assign({}, t, { rosterSize: t.rosterSize + 1, chemistry: Math.min(99, t.chemistry + 1) });
        return t;
      });
      if (_store.joinedTeamIds.indexOf(teamId) === -1) _store.joinedTeamIds.push(teamId);
      return _delay(_store.teams.find(function(t) { return t.id === teamId; }), 300);
    }
    var userId = await _getCurrentUserId();
    if (!userId) throw new Error('Oturum gerekli');
    var { error } = await supabase.from('team_members').insert({ team_id: teamId, user_id: userId });
    if (error) throw error;
    if (_sbJoinedTeamIds.indexOf(teamId) === -1) _sbJoinedTeamIds.push(teamId);
    return { id: teamId };
  },

  async leaveTeam(teamId) {
    if (api.isMock()) {
      _store.teams = _store.teams.map(function(t) {
        if (t.id === teamId) return Object.assign({}, t, { rosterSize: Math.max(0, t.rosterSize - 1), chemistry: Math.max(0, t.chemistry - 1) });
        return t;
      });
      _store.joinedTeamIds = _store.joinedTeamIds.filter(function(id) { return id !== teamId; });
      return _delay(_store.teams.find(function(t) { return t.id === teamId; }), 300);
    }
    var userId = await _getCurrentUserId();
    if (!userId) throw new Error('Oturum gerekli');
    var { error } = await supabase.from('team_members')
      .delete().eq('team_id', teamId).eq('user_id', userId);
    if (error) throw error;
    _sbJoinedTeamIds = _sbJoinedTeamIds.filter(function(id) { return id !== teamId; });
    return { id: teamId };
  },

  isJoined: function(teamId) {
    return api.isMock()
      ? _store.joinedTeamIds.indexOf(teamId) !== -1
      : _sbJoinedTeamIds.indexOf(teamId) !== -1;
  },
};

// ─── Profile Service ──────────────────────────────────────────────────────────
export var profileService = {
  createDefaultProfileDraft: function() {
    return { email: '', password: '', nickname: '', district: '', jerseyNumber: '', position: 'Kanat', archetype: 'Nişancı', experience: 'Orta Seviye', bio: '' };
  },

  async getProfileOverview(profileDraft) {
    if (api.isMock()) return _delay(buildProfileOverview(profileDraft), 350);
    var userId = await _getCurrentUserId();
    if (!userId) throw new Error('Oturum gerekli');
    var { data: profile, error } = await supabase
      .from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    var mapped = {
      uid:          profile.id,
      nickname:     profile.nickname      || '',
      district:     profile.district      || '',
      jerseyNumber: profile.jersey_number || '',
      position:     profile.position      || '',
      archetype:    profile.archetype     || '',
      experience:   profile.experience    || '',
      bio:          profile.bio           || '',
    };
    return buildProfileOverview(mapped);
  },

  async updateProfile(updates) {
    if (api.isMock()) {
      _store.profile = Object.assign({}, _store.profile, updates);
      return _delay(buildProfileOverview(_store.profile), 300);
    }
    var userId = await _getCurrentUserId();
    if (!userId) throw new Error('Oturum gerekli');
    var dbUpdates = {};
    if (updates.nickname     !== undefined) dbUpdates.nickname      = updates.nickname;
    if (updates.district     !== undefined) dbUpdates.district      = updates.district;
    if (updates.jerseyNumber !== undefined) dbUpdates.jersey_number = updates.jerseyNumber;
    if (updates.position     !== undefined) dbUpdates.position      = updates.position;
    if (updates.archetype    !== undefined) dbUpdates.archetype     = updates.archetype;
    if (updates.experience   !== undefined) dbUpdates.experience    = updates.experience;
    if (updates.bio          !== undefined) dbUpdates.bio           = updates.bio;
    var { data: profile, error } = await supabase
      .from('profiles').update(dbUpdates).eq('id', userId).select().single();
    if (error) throw error;
    var mapped = {
      uid: profile.id, nickname: profile.nickname || '', district: profile.district || '',
      jerseyNumber: profile.jersey_number || '', position: profile.position || '',
      archetype: profile.archetype || '', experience: profile.experience || '', bio: profile.bio || '',
    };
    return buildProfileOverview(mapped);
  },
};

// ─── Notification Service ──────────────────────────────────────────────────────
export var notificationService = {
  async getNotifications() {
    if (api.isMock()) return _delay(_store.notifications.slice(), 200);
    var userId = await _getCurrentUserId();
    if (!userId) return [];
    var { data: rows, error } = await supabase
      .from('notifications').select('*')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    return (rows || []).map(function(n) {
      return {
        id: n.id, type: n.type || 'info', title: n.title || '',
        body: n.body || '', read: n.read || false,
        time: n.created_at ? new Date(n.created_at).toLocaleDateString('tr-TR') : '',
      };
    });
  },

  async markAllRead() {
    if (api.isMock()) {
      _store.notifications = _store.notifications.map(function(n) { return Object.assign({}, n, { read: true }); });
      return _delay(_store.notifications.slice(), 200);
    }
    var userId = await _getCurrentUserId();
    if (!userId) return [];
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
    return notificationService.getNotifications();
  },

  getUnreadCount: function() {
    return _store.notifications.filter(function(n) { return !n.read; }).length;
  },
};
