-- ─── POTA — 3 Haziran 2026 Feature Migration ──────────────────────────────────
-- Bu migration'ı Supabase Dashboard > SQL Editor'da çalıştır.

-- ─── 1. Maç Sonuç Tablosu (Skor Geçmişi) ────────────────────────────────────
create table if not exists match_results (
  id            uuid primary key default gen_random_uuid(),
  match_id      uuid references matches(id) on delete cascade not null,
  user_id       uuid references auth.users(id) on delete cascade not null,
  outcome       text not null check (outcome in ('win','loss','draw')),
  score_a       int  not null default 0,
  score_b       int  not null default 0,
  points        int  not null default 0,
  rebounds      int  not null default 0,
  assists       int  not null default 0,
  mvp           boolean not null default false,
  created_at    timestamptz not null default now(),
  unique(match_id, user_id)
);
alter table match_results enable row level security;
create policy "Users can insert own results"   on match_results for insert with check (auth.uid() = user_id);
create policy "Users can read own results"     on match_results for select using (auth.uid() = user_id);
create policy "Users can update own results"   on match_results for update using (auth.uid() = user_id);

-- ─── 2. Mesajlar Tablosu (Gerçek Chat) ───────────────────────────────────────
create table if not exists messages (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid references teams(id) on delete cascade not null,
  user_id    uuid references auth.users(id) on delete cascade not null,
  text       text not null check (char_length(text) <= 500),
  created_at timestamptz not null default now()
);
alter table messages enable row level security;
create policy "Team members can read messages"
  on messages for select using (
    exists (select 1 from team_members tm where tm.team_id = messages.team_id and tm.user_id = auth.uid())
  );
create policy "Team members can insert messages"
  on messages for insert with check (
    auth.uid() = user_id and
    exists (select 1 from team_members tm where tm.team_id = messages.team_id and tm.user_id = auth.uid())
  );
-- Mesajları profiles ile join etmek için view
create or replace view messages_with_profiles as
  select m.*, p.nickname, p.avatar_url
  from messages m
  join profiles p on p.id = m.user_id;

-- ─── 3. Takipçi/Arkadaş Tablosu ─────────────────────────────────────────────
create table if not exists follows (
  follower_id  uuid references auth.users(id) on delete cascade not null,
  following_id uuid references auth.users(id) on delete cascade not null,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
alter table follows enable row level security;
create policy "Anyone can view follows"    on follows for select using (true);
create policy "Users can manage own follows" on follows for all using (auth.uid() = follower_id);

-- ─── 4. Sezonlar Tablosu ────────────────────────────────────────────────────
create table if not exists seasons (
  id         serial primary key,
  name       text not null,
  start_date date not null,
  end_date   date not null,
  is_active  boolean not null default false
);
alter table seasons enable row level security;
create policy "Anyone can view seasons" on seasons for select using (true);

-- Başlangıç verisi
insert into seasons (name, start_date, end_date, is_active) values
  ('Sezon 1', '2026-01-01', '2026-06-30', true);

-- Sezon bazlı skor toplamı için view
create or replace view season_leaderboard as
  select
    p.id,
    p.nickname,
    p.district,
    count(mr.id) filter (where mr.outcome = 'win')  as wins,
    count(mr.id)                                     as games,
    coalesce(avg(mr.points), 0)::numeric(5,1)        as avg_points,
    coalesce(avg(mr.assists), 0)::numeric(5,1)       as avg_assists,
    s.id  as season_id,
    s.name as season_name
  from profiles p
  left join match_results mr on mr.user_id = p.id
  left join matches mx on mx.id = mr.match_id
  cross join seasons s
  where s.is_active = true
    and (mx.scheduled_at >= s.start_date::timestamptz or mx.id is null)
  group by p.id, p.nickname, p.district, s.id, s.name;

-- ─── 5. Push Token Tablosu ───────────────────────────────────────────────────
create table if not exists push_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null unique,
  token      text not null,
  platform   text not null check (platform in ('ios','android')),
  updated_at timestamptz not null default now()
);
alter table push_tokens enable row level security;
create policy "Users can manage own push token" on push_tokens for all using (auth.uid() = user_id);

-- ─── 6. Saha Rezervasyon Tablosu ────────────────────────────────────────────
create table if not exists court_bookings (
  id          uuid primary key default gen_random_uuid(),
  court_id    uuid references courts(id) on delete cascade not null,
  user_id     uuid references auth.users(id) on delete cascade not null,
  slot_start  timestamptz not null,
  slot_end    timestamptz not null,
  players_max int not null default 10,
  fee         int not null default 0,
  status      text not null default 'confirmed' check (status in ('confirmed','cancelled','pending')),
  created_at  timestamptz not null default now(),
  check (slot_end > slot_start)
);
alter table court_bookings enable row level security;
create policy "Anyone can view bookings"         on court_bookings for select using (true);
create policy "Users can create own bookings"    on court_bookings for insert with check (auth.uid() = user_id);
create policy "Users can cancel own bookings"    on court_bookings for update using (auth.uid() = user_id);

-- ─── 7. profiles Tablosuna avatar_url Kolonu Ekle ───────────────────────────
alter table profiles add column if not exists avatar_url text;

-- ─── 8. Realtime Enable ─────────────────────────────────────────────────────
-- Dashboard > Database > Replication > Supabase Realtime kısmında
-- match_participants, messages tablolarını aktif et.
