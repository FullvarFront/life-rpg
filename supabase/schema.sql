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

-- ─────────────────────────────────────────────────────────────
-- 6. Характеристики и дисциплина-стрик.
-- ─────────────────────────────────────────────────────────────

-- 6.1. XP по характеристикам (одна строка на пару пользователь+характеристика).
create table if not exists public.attribute_xp (
  user_id   uuid not null references auth.users (id) on delete cascade,
  attribute text not null,
  xp        int  not null default 0,
  primary key (user_id, attribute)
);

alter table public.attribute_xp enable row level security;

drop policy if exists attribute_xp_select_own on public.attribute_xp;
create policy attribute_xp_select_own on public.attribute_xp
  for select using (auth.uid() = user_id);

drop policy if exists attribute_xp_insert_own on public.attribute_xp;
create policy attribute_xp_insert_own on public.attribute_xp
  for insert with check (auth.uid() = user_id);

drop policy if exists attribute_xp_update_own on public.attribute_xp;
create policy attribute_xp_update_own on public.attribute_xp
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 6.2. Стрик в players + характеристика в actions.
alter table public.players
  add column if not exists current_streak   int not null default 0,
  add column if not exists longest_streak   int not null default 0,
  add column if not exists last_active_date date;

alter table public.actions
  add column if not exists attribute text;

-- 6.3. Атомарное применение действия: запись + XP + стрик + XP характеристики.
create or replace function public.apply_action(
  p_text       text,
  p_difficulty text,
  p_xp         int,
  p_attribute  text
)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid       uuid := auth.uid();
  v_last    date;
  v_streak  int;
  v_longest int;
  v_total   int;
  v_attr_xp int := null;
begin
  -- 1. запись действия
  insert into public.actions (user_id, text, difficulty, xp, attribute)
  values (uid, p_text, p_difficulty, p_xp, p_attribute);

  -- 2. текущее состояние профиля (блокируем строку на время апдейта)
  select players.last_active_date, players.current_streak, players.longest_streak
    into v_last, v_streak, v_longest
  from public.players
  where players.user_id = uid
  for update;

  -- 3. стрик по дням (current_date — UTC)
  if v_last = current_date then
    null;                              -- уже отмечались сегодня — без изменений
  elsif v_last = current_date - 1 then
    v_streak := v_streak + 1;          -- продолжили вчерашний
  else
    v_streak := 1;                     -- начали заново (пропуск или первый раз)
  end if;
  v_longest := greatest(v_longest, v_streak);

  -- 4. обновляем профиль: XP + стрик + дата
  update public.players
     set total_xp         = total_xp + p_xp,
         current_streak   = v_streak,
         longest_streak   = v_longest,
         last_active_date = current_date
   where user_id = uid
  returning total_xp into v_total;

  -- 5. XP характеристики (upsert), если она задана
  if p_attribute is not null then
    insert into public.attribute_xp (user_id, attribute, xp)
    values (uid, p_attribute, p_xp)
    on conflict (user_id, attribute)
    do update set xp = public.attribute_xp.xp + excluded.xp
    returning xp into v_attr_xp;
  end if;

  return json_build_object(
    'total_xp',       v_total,
    'current_streak', v_streak,
    'longest_streak', v_longest,
    'attribute_xp',   v_attr_xp
  );
end;
$$;
