create table if not exists public.guest_feedback (
  id text primary key,
  lead_id uuid references public.leads(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  rating integer check (rating between 1 and 5),
  return_interest text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists guest_feedback_lead_id_idx on public.guest_feedback (lead_id);
create index if not exists guest_feedback_booking_id_idx on public.guest_feedback (booking_id);
create index if not exists guest_feedback_rating_idx on public.guest_feedback (rating);
create index if not exists guest_feedback_created_at_idx on public.guest_feedback (created_at desc);

alter table public.guest_feedback enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on table public.guest_feedback to authenticated, service_role;
grant insert on table public.guest_feedback to anon;

create policy "public can insert guest feedback"
  on public.guest_feedback for insert
  to anon
  with check (true);

create policy "authenticated morrow team can manage guest feedback"
  on public.guest_feedback for all
  to authenticated
  using (true)
  with check (true);

create policy "service role can manage guest feedback"
  on public.guest_feedback for all
  to service_role
  using (true)
  with check (true);

notify pgrst, 'reload schema';
