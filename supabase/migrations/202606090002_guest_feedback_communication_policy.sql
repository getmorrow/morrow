grant insert on table public.communication_events to anon;

create policy "public can insert guest feedback communication events"
  on public.communication_events for insert
  to anon
  with check (
    event_type = 'guest_feedback'
    and direction = 'inbound'
    and channel = 'note'
  );

notify pgrst, 'reload schema';
