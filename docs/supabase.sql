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
