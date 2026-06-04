create table if not exists public.communication_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  channel text not null default 'note',
  direction text not null default 'internal',
  event_type text not null default 'note',
  subject text,
  body text,
  recipient text,
  actor text,
  status text not null default 'recorded',
  provider text,
  provider_message_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists communication_events_lead_id_idx on public.communication_events (lead_id);
create index if not exists communication_events_booking_id_idx on public.communication_events (booking_id);
create index if not exists communication_events_customer_id_idx on public.communication_events (customer_id);
create index if not exists communication_events_created_at_idx on public.communication_events (created_at desc);

alter table public.communication_events enable row level security;

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on table public.communication_events to authenticated, service_role;

create policy "authenticated morrow team can manage communication events"
  on public.communication_events for all
  to authenticated
  using (true)
  with check (true);

create policy "service role can manage communication events"
  on public.communication_events for all
  to service_role
  using (true)
  with check (true);

notify pgrst, 'reload schema';
