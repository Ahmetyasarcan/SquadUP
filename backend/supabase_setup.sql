-- SquadUp Database Schema for Supabase
-- Run this in the Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/<your-project>/sql
--
-- Tables:
--   sqlusers       — user profiles
--   activities     — activities to join
--   participations — junction: which users joined which activities

-- ---------------------------------------------------------------------------
-- Enable UUID generation
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Table: sqlusers
-- Stores user profiles. 'interests' stored as text[] with Turkish values.
-- reliability_score is a computed column (attended / joined).
-- ---------------------------------------------------------------------------
create table if not exists sqlusers (
    id                uuid primary key default uuid_generate_v4(),
    name              text not null,
    interests         text[] not null default '{}',
    competition_level int  not null check (competition_level between 1 and 5),
    attended_events   int  not null default 0 check (attended_events >= 0),
    joined_events     int  not null default 0 check (joined_events >= 0),
    -- Generated column: reliability score (0.0 to 1.0 as numeric)
    -- Will be null when joined_events = 0 (handled by app layer)
    created_at        timestamptz not null default now()
);

-- Index for fast lookups by id (already pk, but explicit for clarity)
create index if not exists idx_sqlusers_id on sqlusers(id);

-- ---------------------------------------------------------------------------
-- Table: activities
-- Stores activities. Category uses English keys for code logic.
-- ---------------------------------------------------------------------------
create table if not exists activities (
    id                 uuid primary key default uuid_generate_v4(),
    creator_id         uuid references sqlusers(id) on delete cascade,
    title              text not null,                          -- Turkish: "Kadıköy'de Futbol Maçı"
    category           text not null check (
                           category in ('sports', 'esports', 'board_games', 'outdoor')
                       ),                                      -- English key for logic
    competition_level  int  not null check (competition_level between 1 and 5),
    location           text not null,                          -- Turkish: "Kadıköy Halı Saha"
    datetime           timestamptz not null,
    max_participants   int  not null check (max_participants > 0),
    created_at         timestamptz not null default now()
);

create index if not exists idx_activities_category on activities(category);
create index if not exists idx_activities_datetime  on activities(datetime);
create index if not exists idx_activities_creator   on activities(creator_id);

-- ---------------------------------------------------------------------------
-- Table: participations
-- Junction table between users and activities.
-- status: 'joined' | 'attended' | 'cancelled'
-- ---------------------------------------------------------------------------
create table if not exists participations (
    id          uuid primary key default uuid_generate_v4(),
    user_id     uuid not null references sqlusers(id)  on delete cascade,
    activity_id uuid not null references activities(id) on delete cascade,
    status      text not null check (status in ('joined', 'attended', 'cancelled'))
                     default 'joined',
    created_at  timestamptz not null default now(),
    -- Prevent duplicate active participations
    unique (user_id, activity_id)
);

create index if not exists idx_participations_user     on participations(user_id);
create index if not exists idx_participations_activity on participations(activity_id);
create index if not exists idx_participations_status   on participations(status);

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS) — Basic open policies for academic project
-- In production, these should be restricted per authenticated user.
-- ---------------------------------------------------------------------------
alter table sqlusers     enable row level security;
alter table activities   enable row level security;
alter table participations enable row level security;

-- Allow all operations (anon key) — suitable for academic demo
create policy "Allow all for sqlusers"      on sqlusers      for all using (true) with check (true);
create policy "Allow all for activities"    on activities    for all using (true) with check (true);
create policy "Allow all for participations" on participations for all using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Sample Data (Turkish content for demonstration)
-- ---------------------------------------------------------------------------
-- Sample users
insert into sqlusers (name, interests, competition_level, attended_events, joined_events) values
    ('Ahmet Yılmaz',  array['futbol', 'koşu'],          3, 5, 6),
    ('Fatma Demir',   array['valorant', 'lol', 'cs2'],  4, 8, 9),
    ('Mehmet Can',    array['satranç', 'kutu oyunu'],    2, 2, 2),
    ('Zeynep Kaya',   array['futbol', 'basketbol'],      4, 3, 4),
    ('Ali Yıldız',    array['doğa yürüyüşü', 'kamp'],   1, 0, 1);

-- Sample activities (insert after users so creator_id references work)
-- Use a fixed creator for sample data
insert into activities (creator_id, title, category, competition_level, location, datetime, max_participants)
select
    (select id from sqlusers where name = 'Ahmet Yılmaz' limit 1),
    'Kadıköy''de Hafta Sonu Futbolu',
    'sports',
    3,
    'Kadıköy Halı Saha',
    now() + interval '2 days',
    10
union all
select
    (select id from sqlusers where name = 'Fatma Demir' limit 1),
    'Valorant 5v5 Turnuvası',
    'esports',
    4,
    'Online (Discord)',
    now() + interval '3 days',
    10
union all
select
    (select id from sqlusers where name = 'Mehmet Can' limit 1),
    'Catan Strateji Gecesi',
    'board_games',
    2,
    'Beşiktaş Kafe',
    now() + interval '5 days',
    6
union all
select
    (select id from sqlusers where name = 'Zeynep Kaya' limit 1),
    'Belgrad Ormanı Doğa Yürüyüşü',
    'outdoor',
    1,
    'Belgrad Ormanı Giriş',
    now() + interval '7 days',
    20;
