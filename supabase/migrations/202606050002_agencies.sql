create table if not exists public.agencies (
  id text primary key,
  name text not null,
  contact_name text,
  email text,
  phone text,
  location text,
  status text not null default 'lead',
  managed_property_ids text[] not null default '{}',
  response_due_days integer,
  available_dates_note text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agencies enable row level security;

grant select, insert, update, delete on table public.agencies to authenticated, service_role;

drop policy if exists "admin users can manage agencies" on public.agencies;
create policy "admin users can manage agencies"
  on public.agencies for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

notify pgrst, 'reload schema';
