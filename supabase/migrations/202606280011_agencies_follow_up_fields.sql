alter table public.agencies
  add column if not exists next_follow_up_at date,
  add column if not exists notes text;

update public.agencies
set
  next_follow_up_at = coalesce(
    next_follow_up_at,
    nullif(payload->>'nextFollowUpAt', '')::date,
    nullif(payload->>'next_follow_up_at', '')::date,
    nullif(payload->>'followUpAt', '')::date
  ),
  notes = coalesce(
    nullif(notes, ''),
    nullif(payload->>'notes', ''),
    nullif(payload->>'note', ''),
    nullif(payload->>'internalNote', '')
  )
where payload ?| array['nextFollowUpAt', 'next_follow_up_at', 'followUpAt', 'notes', 'note', 'internalNote'];

create index if not exists agencies_next_follow_up_at_idx
  on public.agencies (next_follow_up_at);

notify pgrst, 'reload schema';
