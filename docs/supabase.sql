-- RiffGym: схема Supabase для синхронизации настроек (выполнить в SQL Editor проекта).
create table if not exists public.user_settings (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb  not null default '{}'::jsonb,   -- ключи grif.* (без префикса)
  updated_at bigint not null                          -- мс, время последнего изменения на устройстве
);
alter table public.user_settings enable row level security;
create policy "own row: select" on public.user_settings for select using (auth.uid() = user_id);
create policy "own row: insert" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "own row: update" on public.user_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own row: delete" on public.user_settings for delete using (auth.uid() = user_id);

-- ===== Учёт занятий (редизайн, этап 5, 2026-11-22). Пишет только вошедший пользователь, свои строки. =====
-- Одна строка на сегмент плана, сыгранный дольше 15 секунд (время считается, только пока идёт таймер).
create table if not exists public.practice_log (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  client_id   text not null,                 -- ключ записи с устройства: повторная отправка не дублирует
  day         date not null,                 -- дата плана (локальная дата пользователя)
  day_index   int  not null,                 -- dayIndex плана, якорь 2026-11-02
  genre       text not null,
  inst        text not null,
  kind        text not null,                 -- warm, base, focus, maint, combo, music, test
  ex_id       text,                          -- B1, R6…; у музыки и тестов null
  grp         text,                          -- W, B, R, A, L, C
  lvl         smallint,
  variant     smallint,
  planned_sec int  not null,
  played_sec  int  not null check (played_sec >= 0),
  bpm         smallint,
  created_at  timestamptz not null default now(),
  unique (user_id, client_id)
);
create index if not exists practice_log_user_day on public.practice_log (user_id, day);
alter table public.practice_log enable row level security;
drop policy if exists "own log: select" on public.practice_log;
drop policy if exists "own log: insert" on public.practice_log;
drop policy if exists "own log: delete" on public.practice_log;
create policy "own log: select" on public.practice_log for select using (auth.uid() = user_id);
create policy "own log: insert" on public.practice_log for insert with check (auth.uid() = user_id);
create policy "own log: delete" on public.practice_log for delete using (auth.uid() = user_id);

-- Итог занятия: самочувствие 1–5 и заметка.
create table if not exists public.practice_sessions (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  client_id   text not null,
  day         date not null,
  day_index   int  not null,
  genre       text not null,
  inst        text not null,
  planned_min int  not null,
  played_sec  int  not null check (played_sec >= 0),
  feel        smallint check (feel between 1 and 5),
  note        text check (char_length(note) <= 2000),
  created_at  timestamptz not null default now(),
  unique (user_id, client_id)
);
create index if not exists practice_sessions_user_day on public.practice_sessions (user_id, day);
alter table public.practice_sessions enable row level security;
drop policy if exists "own sessions: select" on public.practice_sessions;
drop policy if exists "own sessions: insert" on public.practice_sessions;
drop policy if exists "own sessions: delete" on public.practice_sessions;
create policy "own sessions: select" on public.practice_sessions for select using (auth.uid() = user_id);
create policy "own sessions: insert" on public.practice_sessions for insert with check (auth.uid() = user_id);
create policy "own sessions: delete" on public.practice_sessions for delete using (auth.uid() = user_id);
