create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  event_type text not null,
  recipient text not null,
  status text not null default 'queued',
  provider text not null default 'resend',
  provider_message_id text,
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists email_events_lead_id_idx on public.email_events (lead_id);
create index if not exists email_events_status_idx on public.email_events (status);
create index if not exists email_events_created_at_idx on public.email_events (created_at desc);

alter table public.email_events enable row level security;

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on table public.email_events to authenticated, service_role;

create policy "authenticated morrow team can manage email events"
  on public.email_events for all
  to authenticated
  using (true)
  with check (true);

create policy "service role can manage email events"
  on public.email_events for all
  to service_role
  using (true)
  with check (true);

notify pgrst, 'reload schema';

