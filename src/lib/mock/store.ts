// ─── Shared in-memory mock store (singleton) ──────────────────────────────────
// Tüm domain servisleri bu store'u paylaşır.
// MOCK_MODE=true olduğunda veri kaynağı olarak kullanılır.
// ─────────────────────────────────────────────────────────────────────────────
import {
  MOCK_PROFILE,
  MOCK_MATCHES,
  MOCK_TEAMS,
  MOCK_NOTIFICATIONS,
} from './data';
import type { Session } from '../../types/domain/auth';
import type { Profile } from '../../types/domain/profile';
import type { Match }   from '../../types/domain/match';
import type { Team }    from '../../types/domain/squad';
import type { Notification } from '../../types/domain/notification';
import type { ID }      from '../../types/common';

interface MockStore {
  session:        Session | null;
  profile:        Profile;
  matches:        Match[];
  teams:          Team[];
  notifications:  Notification[];
  joinedMatchIds: ID[];
  joinedTeamIds:  ID[];
}

export const mockStore: MockStore = {
  session:        null,
  profile:        { ...MOCK_PROFILE } as Profile,
  matches:        MOCK_MATCHES.map((m) => ({ ...m })) as unknown as Match[],
  teams:          MOCK_TEAMS.map((t) => ({ ...t })) as unknown as Team[],
  notifications:  MOCK_NOTIFICATIONS.map((n) => ({ ...n })) as unknown as Notification[],
  joinedMatchIds: [],
  joinedTeamIds:  [],
};
