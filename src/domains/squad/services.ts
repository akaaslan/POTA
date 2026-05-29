// ─── Squad (Team) Service ─────────────────────────────────────────────────────
import { api }      from '@infrastructure/api/client';
import { supabase } from '@infrastructure/supabase';
import { mockStore } from '@lib/mock/store';
import { delay, getCurrentUserId } from '@lib/helpers';
import type { Team } from '../../types/domain/squad';
import type { ID } from '../../types/common';

const _sbJoinedTeamIds: ID[] = [];

export const squadService = {
  async getFeaturedTeams(): Promise<{ featuredTeam: Team | null; teams: Team[] }> {
    if (api.isMock()) return delay({ featuredTeam: (mockStore.teams[0] as Team) ?? null, teams: mockStore.teams.slice() as Team[] }, 300);
    const userId = await getCurrentUserId(supabase);
    const { data: rows, error } = await supabase!
      .from('teams')
      .select('*, team_members(user_id)')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    const teams: Team[] = (rows ?? []).map((t) => {
      const members = (t.team_members as Array<{ user_id: ID }>) ?? [];
      const joined  = userId ? members.some((m) => m.user_id === userId) : false;
      if (joined && !_sbJoinedTeamIds.includes(t.id)) _sbJoinedTeamIds.push(t.id);
      return {
        id: t.id, name: t.name, district: t.district ?? '',
        description: t.description ?? '', rosterSize: members.length,
        chemistry: 75, isJoined: joined,
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80',
      };
    });
    return { featuredTeam: teams[0] ?? null, teams };
  },

  async getTeamById(teamId: ID): Promise<Team | null> {
    if (api.isMock()) return delay((mockStore.teams.find((t) => t.id === teamId) as Team) ?? null, 200);
    const { data, error } = await supabase!
      .from('teams').select('*, team_members(user_id)').eq('id', teamId).single();
    if (error) throw error;
    return data as Team;
  },

  async joinTeam(teamId: ID): Promise<{ id: ID }> {
    if (api.isMock()) {
      mockStore.teams = mockStore.teams.map((t) =>
        t.id === teamId
          ? { ...t, rosterSize: t.rosterSize + 1, chemistry: Math.min(99, t.chemistry + 1) }
          : t,
      );
      if (!mockStore.joinedTeamIds.includes(teamId)) mockStore.joinedTeamIds.push(teamId);
      return delay({ id: teamId }, 300);
    }
    const userId = await getCurrentUserId(supabase);
    if (!userId) throw new Error('Oturum gerekli');
    const { error } = await supabase!.from('team_members').insert({ team_id: teamId, user_id: userId });
    if (error) throw error;
    if (!_sbJoinedTeamIds.includes(teamId)) _sbJoinedTeamIds.push(teamId);
    return { id: teamId };
  },

  async leaveTeam(teamId: ID): Promise<{ id: ID }> {
    if (api.isMock()) {
      mockStore.teams = mockStore.teams.map((t) =>
        t.id === teamId
          ? { ...t, rosterSize: Math.max(0, t.rosterSize - 1), chemistry: Math.max(0, t.chemistry - 1) }
          : t,
      );
      mockStore.joinedTeamIds = mockStore.joinedTeamIds.filter((id) => id !== teamId);
      return delay({ id: teamId }, 300);
    }
    const userId = await getCurrentUserId(supabase);
    if (!userId) throw new Error('Oturum gerekli');
    const { error } = await supabase!.from('team_members')
      .delete().eq('team_id', teamId).eq('user_id', userId);
    if (error) throw error;
    _sbJoinedTeamIds.splice(_sbJoinedTeamIds.indexOf(teamId), 1);
    return { id: teamId };
  },

  isJoined(teamId: ID): boolean {
    return api.isMock()
      ? mockStore.joinedTeamIds.includes(teamId)
      : _sbJoinedTeamIds.includes(teamId);
  },
};

// Backward-compat alias
export const teamService = squadService;
