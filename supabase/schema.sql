-- ============================================================
-- Wochenende — Supabase backend schema
-- ============================================================
-- The whole app persists through ONE generic key-value table,
-- `family_data` (key text → value jsonb). Every feature stores its
-- state under its own key via the `useSupabaseStorage` hook:
--
--   weekend_plan · user_events · sticky_activities · todos ·
--   hidden_activities · workouts · body · pickups
--
-- Because the table is generic JSONB, adding a new feature (e.g. the
-- v3 Fitness tab's `workouts` / `body` keys) requires NO migration —
-- it is just a new row. This file documents the table so the backend
-- is reproducible from scratch. Run it once in the Supabase SQL editor
-- of a fresh project.
-- ============================================================

create table if not exists public.family_data (
  key        text primary key,
  value      jsonb       not null,
  updated_at timestamptz not null default now()
);

-- This is a shared, password-free family app (no per-user auth), so the
-- anon key is allowed full read/write on this single table.
alter table public.family_data enable row level security;

drop policy if exists family_data_select on public.family_data;
drop policy if exists family_data_insert on public.family_data;
drop policy if exists family_data_update on public.family_data;

create policy family_data_select on public.family_data
  for select using (true);
create policy family_data_insert on public.family_data
  for insert with check (true);
create policy family_data_update on public.family_data
  for update using (true) with check (true);

-- Real-time sync across the household's devices/tabs. The hook subscribes
-- to UPDATE events filtered by key; enabling the table once covers every
-- key, including the new Fitness keys.
alter publication supabase_realtime add table public.family_data;

-- ------------------------------------------------------------
-- Optional: the Fitness tab ships its starting data as a client-side
-- `initialValue` (src/data/fitness.js), which persists to these keys on
-- the first edit. No SQL seed is required; the keys below are created
-- automatically the first time a workout is toggled or a measurement saved.
--   key='workouts' → { "Navid": ["YYYY-MM-DD", ...], "Diandra": [...] }
--   key='body'     → { "Navid": [{d,w,bmi,fat,mus,kal,vis}, ...], "Diandra": [...] }
-- ------------------------------------------------------------
