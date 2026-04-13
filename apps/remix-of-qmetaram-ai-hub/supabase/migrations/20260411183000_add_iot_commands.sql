create table if not exists public.iot_commands (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null,
  device_id text not null,
  action text not null,
  amount numeric null,
  locale text not null default 'fa',
  status text not null default 'queued',
  banking_reference text null,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.iot_commands enable row level security;

drop policy if exists "Users can view their own iot commands" on public.iot_commands;
create policy "Users can view their own iot commands"
on public.iot_commands
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own iot commands" on public.iot_commands;
create policy "Users can insert their own iot commands"
on public.iot_commands
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own iot commands" on public.iot_commands;
create policy "Users can update their own iot commands"
on public.iot_commands
for update
using (auth.uid() = user_id);

create index if not exists iot_commands_user_created_idx on public.iot_commands(user_id, created_at desc);
create index if not exists iot_commands_device_idx on public.iot_commands(device_id);

create or replace function public.handle_iot_commands_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_iot_commands_updated_at on public.iot_commands;
create trigger set_iot_commands_updated_at
before update on public.iot_commands
for each row execute function public.handle_iot_commands_updated_at();