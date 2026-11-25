alter table public.workouts
  add column if not exists code text;

update public.workouts
set code = coalesce(payload->>'code', 'legacy-' || id::text)
where code is null;

alter table public.workouts
  alter column code set not null;

create unique index if not exists workouts_user_code_uidx
  on public.workouts (user_id, code);
