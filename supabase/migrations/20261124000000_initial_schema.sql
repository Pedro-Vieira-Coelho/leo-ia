create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  code text not null,
  title text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_code text not null,
  title text not null,
  completed_on date not null default current_date,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Nova conversa',
  is_pinned boolean not null default false,
  context_workout text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender text not null check (sender in ('user', 'leo')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists workouts_user_id_idx on public.workouts (user_id);
create unique index if not exists workouts_user_code_uidx on public.workouts (user_id, code);
create index if not exists workout_logs_user_date_idx on public.workout_logs (user_id, completed_on desc);
create index if not exists conversations_user_updated_idx on public.conversations (user_id, updated_at desc);
create index if not exists chat_messages_conversation_created_idx on public.chat_messages (conversation_id, created_at);

alter table public.profiles enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_logs enable row level security;
alter table public.conversations enable row level security;
alter table public.chat_messages enable row level security;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.workouts to authenticated;
grant select, insert, update, delete on public.workout_logs to authenticated;
grant select, insert, update, delete on public.conversations to authenticated;
grant select, insert on public.chat_messages to authenticated;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can create their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can manage their own workouts"
  on public.workouts for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage their own workout logs"
  on public.workout_logs for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage their own conversations"
  on public.conversations for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can read messages in their conversations"
  on public.chat_messages for select
  to authenticated
  using (
    exists (
      select 1
      from public.conversations
      where conversations.id = chat_messages.conversation_id
        and conversations.user_id = (select auth.uid())
    )
  );

create policy "Users can add their own messages"
  on public.chat_messages for insert
  to authenticated
  with check (
    sender = 'user'
    and exists (
      select 1
      from public.conversations
      where conversations.id = chat_messages.conversation_id
        and conversations.user_id = (select auth.uid())
    )
  );

create table if not exists public.chat_rate_limits (
  user_id uuid not null references auth.users (id) on delete cascade,
  window_start timestamptz not null,
  request_count integer not null default 0,
  primary key (user_id, window_start)
);

alter table public.chat_rate_limits enable row level security;

create or replace function public.consume_chat_rate_limit(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_count integer;
begin
  insert into public.chat_rate_limits (user_id, window_start, request_count)
  values (p_user_id, date_trunc('minute', now()), 1)
  on conflict (user_id, window_start)
  do update set request_count = public.chat_rate_limits.request_count + 1
  returning public.chat_rate_limits.request_count into request_count;

  return request_count <= 10;
end;
$$;

revoke all on function public.consume_chat_rate_limit(uuid) from public, anon, authenticated;
grant execute on function public.consume_chat_rate_limit(uuid) to service_role;
