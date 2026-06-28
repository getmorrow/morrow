alter table public.leads
  add column if not exists follow_up_at date;

update public.leads
set follow_up_at = left(
  coalesce(
    nullif(payload ->> 'followUpAt', ''),
    nullif(payload ->> 'follow_up_at', ''),
    nullif(payload ->> 'nextContactAt', '')
  ),
  10
)::date
where public.leads.follow_up_at is null
  and coalesce(
    nullif(payload ->> 'followUpAt', ''),
    nullif(payload ->> 'follow_up_at', ''),
    nullif(payload ->> 'nextContactAt', '')
  ) ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}';

create index if not exists leads_follow_up_at_idx
  on public.leads (follow_up_at)
  where follow_up_at is not null;
