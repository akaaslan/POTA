// ─── Leaderboard Service ──────────────────────────────────────────────────────
import { api }      from '@infrastructure/api/client';
import { supabase } from '@infrastructure/supabase';
import { delay }    from '@lib/helpers';
import { calcOVR }  from '@domains/gamification';
import type { LeaderEntry } from '../../types/domain/leaderboard';
import type { Season, SeasonLeaderEntry } from '../../types/domain/season';

const TIER_THRESHOLDS = [
  { min: 95, tier: 'Elmas I'   },
  { min: 90, tier: 'Elmas II'  },
  { min: 87, tier: 'Elmas III' },
  { min: 84, tier: 'Platin I'  },
  { min: 81, tier: 'Platin II' },
  { min: 78, tier: 'Platin III'},
  { min: 75, tier: 'Altın I'   },
  { min: 72, tier: 'Altın II'  },
  { min: 69, tier: 'Altın III' },
  { min: 0,  tier: 'Demir'     },
];

function ovrToTier(ovr: number): string {
  return (TIER_THRESHOLDS.find((t) => ovr >= t.min) ?? TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1]!).tier;
}

const MOCK_LEADERBOARD: Omit<LeaderEntry, 'rank' | 'isMe'>[] = [
  { nickname: 'SULTAN_34',    district: 'Fatih',    wins: 42, games: 51, ovr: 97, tier: 'Elmas I'   },
  { nickname: 'THUNDER_41',   district: 'Bakırköy', wins: 38, games: 46, ovr: 95, tier: 'Elmas I'   },
  { nickname: 'MJ_STYLE',     district: 'Beşiktaş', wins: 35, games: 44, ovr: 93, tier: 'Elmas II'  },
  { nickname: 'KRAL_34',      district: 'Kadıköy',  wins: 31, games: 41, ovr: 91, tier: 'Elmas III' },
  { nickname: 'FALCON_BS',    district: 'Üsküdar',  wins: 29, games: 39, ovr: 89, tier: 'Platin I'  },
  { nickname: 'EJDER_KDK',    district: 'Kadıköy',  wins: 27, games: 38, ovr: 87, tier: 'Platin II' },
  { nickname: 'GÖLGE_34',     district: 'Şişli',    wins: 25, games: 35, ovr: 85, tier: 'Platin II' },
  { nickname: 'BORAN',        district: 'Beşiktaş', wins: 23, games: 33, ovr: 83, tier: 'Platin III'},
  { nickname: 'SKYWALKER_0',  district: 'Ataşehir', wins: 21, games: 30, ovr: 81, tier: 'Altın I'   },
  { nickname: 'HAWK_KADIKOY', district: 'Kadıköy',  wins: 19, games: 28, ovr: 79, tier: 'Altın II'  },
  { nickname: 'DEMİR_KDK',    district: 'Kadıköy',  wins: 17, games: 26, ovr: 77, tier: 'Altın III' },
  { nickname: 'ŞİMŞEK_BSK',  district: 'Beşiktaş', wins: 15, games: 24, ovr: 75, tier: 'Altın III' },
];

const MOCK_SEASONS: Season[] = [
  { id: 1, name: 'Sezon 1', startDate: '2026-01-01', endDate: '2026-06-30', isActive: true },
];

export const leaderboardService = {
  async getSeasons(): Promise<Season[]> {
    if (api.isMock()) return delay(MOCK_SEASONS, 200);
    const { data, error } = await supabase!.from('seasons').select('*').order('id', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((s) => ({
      id:        s['id'] as number,
      name:      s['name'] as string,
      startDate: s['start_date'] as string,
      endDate:   s['end_date'] as string,
      isActive:  s['is_active'] as boolean,
    }));
  },

  async getLeaderboard(seasonId?: number): Promise<Omit<LeaderEntry, 'rank' | 'isMe'>[]> {
    if (api.isMock()) return delay(MOCK_LEADERBOARD, 300);
    let query = supabase!
      .from('season_leaderboard')
      .select('*')
      .order('wins', { ascending: false })
      .limit(50);

    if (seasonId) query = (query as unknown as { eq: (c: string, v: unknown) => typeof query }).eq('season_id', seasonId) as typeof query;

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map((row) => {
      const wins     = Number(row['wins'])      || 0;
      const games    = Number(row['games'])     || 0;
      const avgPts   = Number(row['avg_points'])|| 0;
      const avgAst   = Number(row['avg_assists'])|| 0;
      const ovr = Math.min(99, Math.max(55, Math.round(
        calcOVR([
          { label: 'GALİBİYET',    value: wins },
          { label: 'MAÇLAR',       value: games },
          { label: 'ORT. SAYILAR', value: avgPts },
          { label: 'ORT. ASİST',   value: avgAst },
        ])
      )));
      return {
        nickname: row['nickname'] as string,
        district: row['district'] as string,
        wins,
        games,
        ovr,
        tier: ovrToTier(ovr),
      };
    });
  },

  async getSeasonLeaderboard(seasonId: number): Promise<SeasonLeaderEntry[]> {
    const entries = await leaderboardService.getLeaderboard(seasonId);
    return entries.map((e, i) => ({
      ...e,
      rank:       i + 1,
      userId:     '',
      avgPoints:  0,
      avgAssists: 0,
    }));
  },
};
