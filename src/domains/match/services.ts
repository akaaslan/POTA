// ─── Match Service ────────────────────────────────────────────────────────────
import { api }             from '@infrastructure/api/client';
import { supabase }        from '@infrastructure/supabase';
import { mockStore }       from '@lib/mock/store';
import { MOCK_COURTS, buildHomeFeed } from '@lib/mock/data';
import { delay, getCurrentUserId, formatScheduledAt, buildScheduledAt } from '@lib/helpers';
import type { Match, HomeFeed, MatchFilters } from '../../types/domain/match';
import type { ID } from '../../types/common';

// ─── Sabitler ─────────────────────────────────────────────────────────────────
export const FORMAT_LABEL: Record<string, string> = { '3V3': '3v3 Yarı Saha', '5V5': '5v5 Tam Saha' };
export const SKILL_LABEL:  Record<string, string> = { 'ROOKİE': 'Açık Saha', 'PRO-AM': 'Pro-Am', 'ELİT': 'Elit' };
export const FORMAT_RAW:   Record<string, string> = { '3v3 Yarı Saha': '3V3', '5v5 Tam Saha': '5V5' };
export const SKILL_RAW:    Record<string, string> = { 'Açık Saha': 'ROOKİE', 'Pro-Am': 'PRO-AM', 'Elit': 'ELİT' };

const MATCH_SELECT = '*, courts(*), profiles!created_by(nickname), match_participants(user_id)';

// ─── Supabase join tracking (non-mock) ────────────────────────────────────────
let _sbJoinedMatchIds: ID[] = [];

// ─── Supabase row → uygulama nesnesi ─────────────────────────────────────────
function _sbMatchToApp(row: Record<string, unknown>, userId: ID | null): Match {
  const participants  = (row['match_participants'] as Array<{ user_id: ID }>) ?? [];
  const playersJoined = participants.length;
  const isJoined = userId
    ? participants.some((p) => p.user_id === userId)
    : false;
  let court = (row['courts'] as Record<string, string> | null) ?? null;
  if (!court && row['court_id']) {
    const mc = MOCK_COURTS.find((c) => c.id === row['court_id']);
    if (mc) court = { name: mc.name, short_name: mc.shortName, district: mc.district, image_url: mc.image };
  }
  const c = court ?? ({} as Record<string, string>);
  const dateStr = row['scheduled_at'] ? formatScheduledAt(row['scheduled_at'] as string) : ((row['date_time'] as string) ?? '');
  return {
    id:           row['id'] as ID,
    title:        row['title']
      ? (row['title'] as string).toUpperCase()
      : ((c['short_name'] ?? c['name'] ?? 'SAHA') + ' ' + ((row['format'] as string) ?? '5V5')).toUpperCase(),
    district:     c['district']        ?? (row['district'] as string)   ?? '',
    courtName:    c['name']            ?? (row['court_name'] as string) ?? '',
    courtId:      (row['court_id'] as ID) ?? null,
    dateTime:     dateStr,
    format:       FORMAT_LABEL[row['format'] as string] ?? (row['format'] as string) ?? '5v5 Tam Saha',
    playersJoined,
    capacity:     (row['max_players'] as number) ?? 10,
    skillLevel:   SKILL_LABEL[row['skill_level'] as string] ?? (row['skill_level'] as string) ?? 'Açık Saha',
    intensity:    'Orta',
    host:         (row['profiles'] as { nickname: string } | null)?.nickname ?? '?',
    feeType:      (row['fee'] && row['fee'] !== 'Ücretsiz') ? 'Ucretli' : 'Ucretsiz',
    fee:          (row['fee'] as string) ?? 'ÜCRETSİZ',
    status:       null,
    image:        c['image_url'] ?? 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80',
    distance:     '? KM',
    description:  (row['description'] as string) ?? '',
    isJoined,
  } as Match;
}

// ─── Servis ───────────────────────────────────────────────────────────────────
export const matchService = {
  async getHomeFeed(): Promise<HomeFeed> {
    if (api.isMock()) return delay(buildHomeFeed(mockStore.matches) as HomeFeed, 400);
    const userId = await getCurrentUserId(supabase);
    const { data: rows, error } = await supabase!
      .from('matches')
      .select(MATCH_SELECT)
      .order('scheduled_at', { ascending: true })
      .limit(20);
    if (error) throw error;
    const matches = (rows ?? []).map((r) => _sbMatchToApp(r as Record<string, unknown>, userId));
    _sbJoinedMatchIds = matches.filter((m) => m.isJoined).map((m) => m.id);
    return {
      heroMatch:      matches[0] ?? null,
      squadActivity:  [],
      trendingCourts: MOCK_COURTS.filter((c) => c.popular).map((c) => ({
        id: c.id, name: c.shortName, distance: c.distance,
        heat: `${c.players}/${c.capacity} OYUNCU`,
        type: 'TAM SAHA', image: c.image, featuredMatch: null,
        activeRuns: matches.filter((m) => m.district === c.district).length,
      })),
      urgentRuns: matches.slice(0, 4),
    };
  },

  async getNearbyMatches(): Promise<{ matches: Match[] }> {
    if (api.isMock()) return delay({ matches: mockStore.matches.slice() as Match[] }, 400);
    const userId = await getCurrentUserId(supabase);
    const { data: rows, error } = await supabase!
      .from('matches').select(MATCH_SELECT).order('scheduled_at', { ascending: true }).limit(50);
    if (error) throw error;
    return { matches: (rows ?? []).map((r) => _sbMatchToApp(r as Record<string, unknown>, userId)) };
  },

  async getFilteredMatches(filters: MatchFilters): Promise<{ matches: Match[] }> {
    if (api.isMock()) {
      let results = mockStore.matches.slice() as Match[];
      if (filters.district && filters.district !== 'Tümü')
        results = results.filter((m) => m.district === filters.district);
      if (filters.skill && filters.skill !== 'Tümü')
        results = results.filter((m) => m.skillLevel === filters.skill);
      if (filters.format && filters.format !== 'Tümü')
        results = results.filter((m) => m.format === filters.format);
      return delay({ matches: results }, 300);
    }
    const userId = await getCurrentUserId(supabase);
    let query = supabase!.from('matches').select(MATCH_SELECT).order('scheduled_at', { ascending: true });
    if (filters.skill && filters.skill !== 'Tümü')
      query = query.eq('skill_level', SKILL_RAW[filters.skill] ?? filters.skill);
    if (filters.format && filters.format !== 'Tümü')
      query = query.eq('format', FORMAT_RAW[filters.format] ?? filters.format);
    const { data: rows, error } = await query;
    if (error) throw error;
    let matches = (rows ?? []).map((r) => _sbMatchToApp(r as Record<string, unknown>, userId));
    if (filters.district && filters.district !== 'Tümü')
      matches = matches.filter((m) => m.district === filters.district);
    return { matches };
  },

  async createMatch(data: Record<string, unknown>): Promise<Match> {
    if (api.isMock()) {
      const newMatch: Match = {
        id: 'mac-' + Date.now(),
        title: ((data['title'] as string) ?? 'YENİ MAÇ').toUpperCase(),
        district: (data['district'] as string) ?? 'Kadıköy',
        courtName: (data['courtName'] as string) ?? 'Belirsiz Saha',
        courtId: (data['courtId'] as ID) ?? null,
        dateTime: (data['dateTime'] as string) ?? 'Bugün 20:00',
        format: (data['format'] as Match['format']) ?? '5v5 Tam Saha',
        playersJoined: 1,
        capacity: (data['capacity'] as number) ?? 10,
        skillLevel: (data['skillLevel'] as Match['skillLevel']) ?? 'Açık Saha',
        intensity: 'Orta',
        host: (mockStore.profile as { nickname?: string })?.nickname ?? 'Sen',
        feeType: data['fee'] ? 'Ucretli' : 'Ucretsiz',
        fee: (data['fee'] as string) ?? 'UCRETSIZ',
        status: null,
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80',
        distance: '? KM',
        description: (data['description'] as string) ?? 'Yeni bir mahalle maçı.',
      };
      mockStore.matches = [newMatch, ...mockStore.matches as Match[]];
      mockStore.joinedMatchIds.push(newMatch.id);
      return delay(newMatch, 500);
    }
    const userId = await getCurrentUserId(supabase);
    if (!userId) throw new Error('Oturum gerekli');
    const matchInsert = {
      court_id:     (data['courtId'] as ID)     ?? null,
      format:       FORMAT_RAW[data['format'] as string]     ?? 'N/A',
      skill_level:  SKILL_RAW[data['skillLevel'] as string]  ?? 'ROOKİE',
      scheduled_at: buildScheduledAt(data['dateTime'] as string, data['dayOffset'] as number | undefined),
      fee:          data['fee'] ? `${data['fee']} TL` : 'Ücretsiz',
      max_players:  (data['capacity'] as number) ?? 10,
      is_private:   !data['isPublic'],
      created_by:   userId,
      title:        (data['title'] as string) ?? null,
      description:  (data['description'] as string) ?? null,
    };
    const { data: inserted, error } = await supabase!
      .from('matches').insert(matchInsert).select(MATCH_SELECT).single();
    if (error) throw error;
    await supabase!.from('match_participants').insert({ match_id: inserted.id, user_id: userId });
    if (!_sbJoinedMatchIds.includes(inserted.id)) _sbJoinedMatchIds.push(inserted.id);
    return _sbMatchToApp(inserted as Record<string, unknown>, userId);
  },

  async joinMatch(matchId: ID): Promise<{ id: ID }> {
    if (api.isMock()) {
      mockStore.matches = (mockStore.matches as Match[]).map((m) =>
        m.id === matchId
          ? { ...m, playersJoined: Math.min(m.capacity, m.playersJoined + 1) }
          : m,
      );
      if (!mockStore.joinedMatchIds.includes(matchId)) mockStore.joinedMatchIds.push(matchId);
      return delay({ id: matchId }, 300);
    }
    const userId = await getCurrentUserId(supabase);
    if (!userId) throw new Error('Oturum gerekli');
    const [{ count, error: countErr }, { data: matchRow, error: matchErr }] = await Promise.all([
      supabase!.from('match_participants').select('*', { count: 'exact', head: true }).eq('match_id', matchId),
      supabase!.from('matches').select('max_players').eq('id', matchId).single(),
    ]);
    if (countErr) throw countErr;
    if (matchErr) throw matchErr;
    const maxPlayers = matchRow ? (matchRow as unknown as { max_players: number }).max_players ?? 10 : 10;
    if ((count ?? 0) >= maxPlayers) {
      throw new Error('Maç kapasitesi dolu');
    }
    const { error } = await supabase!.from('match_participants').insert({ match_id: matchId, user_id: userId });
    if (error) throw error;
    if (!_sbJoinedMatchIds.includes(matchId)) _sbJoinedMatchIds.push(matchId);
    return { id: matchId };
  },

  async leaveMatch(matchId: ID): Promise<{ id: ID }> {
    if (api.isMock()) {
      mockStore.matches = (mockStore.matches as Match[]).map((m) =>
        m.id === matchId
          ? { ...m, playersJoined: Math.max(0, m.playersJoined - 1) }
          : m,
      );
      mockStore.joinedMatchIds = mockStore.joinedMatchIds.filter((id) => id !== matchId);
      return delay({ id: matchId }, 300);
    }
    const userId = await getCurrentUserId(supabase);
    if (!userId) throw new Error('Oturum gerekli');
    const { error } = await supabase!.from('match_participants')
      .delete().eq('match_id', matchId).eq('user_id', userId);
    if (error) throw error;
    _sbJoinedMatchIds = _sbJoinedMatchIds.filter((id) => id !== matchId);
    return { id: matchId };
  },

  isJoined(matchId: ID): boolean {
    return api.isMock()
      ? mockStore.joinedMatchIds.includes(matchId)
      : _sbJoinedMatchIds.includes(matchId);
  },

  async reportScore(
    matchId: ID,
    outcome: 'win' | 'loss' | 'draw',
    scores?: { scoreA: number; scoreB: number },
    playerStats?: { points: number; rebounds: number; assists: number; mvp?: boolean },
  ): Promise<{ success: boolean }> {
    if (api.isMock()) {
      // Mock: maç geçmişine ekle
      const entry = {
        id:        'result-' + Date.now(),
        outcome:   outcome === 'win' ? 'W' : outcome === 'draw' ? 'D' : 'L',
        versus:    'RAKIP',
        matchName: 'SAHA',
        date:      new Date().toLocaleDateString('tr-TR'),
        scoreA:    scores?.scoreA ?? 0,
        scoreB:    scores?.scoreB ?? 0,
        mvp:       playerStats?.mvp ?? false,
        stats: [
          { label: 'SAY',   value: String(playerStats?.points   ?? 0) },
          { label: 'RİB',   value: String(playerStats?.rebounds ?? 0) },
          { label: 'ASİST', value: String(playerStats?.assists  ?? 0) },
        ],
        tags: playerStats?.mvp ? ['MVP'] : [],
      };
      const store = mockStore as unknown as Record<string, unknown>;
      store['recentResults'] = [entry, ...((store['recentResults'] as unknown[]) ?? [])].slice(0, 20);
      return delay({ success: true }, 300);
    }
    const userId = await getCurrentUserId(supabase);
    if (!userId) throw new Error('Oturum gerekli');
    const { error } = await supabase!.from('match_results').upsert({
      match_id:  matchId,
      user_id:   userId,
      outcome,
      score_a:   scores?.scoreA ?? 0,
      score_b:   scores?.scoreB ?? 0,
      points:    playerStats?.points   ?? 0,
      rebounds:  playerStats?.rebounds ?? 0,
      assists:   playerStats?.assists  ?? 0,
      mvp:       playerStats?.mvp ?? false,
    }, { onConflict: 'match_id,user_id' });
    if (error) throw error;
    return { success: true };
  },
};

