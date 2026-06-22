-- Life RPG — схема БД, RLS и триггер автосоздания профиля.
-- Выполнять в Supabase → SQL Editor. Скрипт идемпотентен (можно прогнать повторно).

-- ─────────────────────────────────────────────────────────────
-- 1. Таблица players: профиль игрока, одна строка на пользователя.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.players (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  total_xp   integer not null default 0,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- 2. Таблица actions: история засчитанных действий.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.actions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  text       text not null,
  difficulty text not null,
  xp         integer not null,
  created_at timestamptz default now()
);

-- Индекс под выборку истории «последние сначала» для конкретного игрока.
create index if not exists actions_user_created_idx
  on public.actions (user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- 3. RLS: включаем и разрешаем доступ только к своим строкам.
-- ─────────────────────────────────────────────────────────────
alter table public.players enable row level security;
alter table public.actions enable row level security;

-- players: по одной политике на каждую операцию.
drop policy if exists players_select_own on public.players;
create policy players_select_own on public.players
  for select using (auth.uid() = user_id);

drop policy if exists players_insert_own on public.players;
create policy players_insert_own on public.players
  for insert with check (auth.uid() = user_id);

drop policy if exists players_update_own on public.players;
create policy players_update_own on public.players
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists players_delete_own on public.players;
create policy players_delete_own on public.players
  for delete using (auth.uid() = user_id);

-- actions: то же самое.
drop policy if exists actions_select_own on public.actions;
create policy actions_select_own on public.actions
  for select using (auth.uid() = user_id);

drop policy if exists actions_insert_own on public.actions;
create policy actions_insert_own on public.actions
  for insert with check (auth.uid() = user_id);

drop policy if exists actions_update_own on public.actions;
create policy actions_update_own on public.actions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists actions_delete_own on public.actions;
create policy actions_delete_own on public.actions
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 4. Автосоздание профиля при регистрации пользователя.
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer        -- выполняется от владельца функции → обходит RLS
set search_path = ''     -- защита от подмены search_path (нужно полное имя public.*)
as $$
begin
  insert into public.players (user_id)
  values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 5. Атомарный инкремент XP текущего пользователя.
--    security invoker → внутри работает RLS (auth.uid() = свой профиль).
-- ─────────────────────────────────────────────────────────────
create or replace function public.increment_xp(amount int)
returns int
language sql
security invoker
set search_path = ''
as $$
  update public.players
     set total_xp = total_xp + amount
   where user_id = auth.uid()
  returning total_xp;
$$;
