alter table public.leads
  add column if not exists follow_up_at date;

update public.leads
set follow_up_at = left(follow_up_value.value, 10)::date
from lateral (
  select coalesce(
    nullif(public.leads.payload ->> 'followUpAt', ''),
    nullif(public.leads.payload ->> 'follow_up_at', ''),
    nullif(public.leads.payload ->> 'nextContactAt', '')
  ) as value
) as follow_up_value
where public.leads.follow_up_at is null
  and follow_up_value.value ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}';

create index if not exists leads_follow_up_at_idx
  on public.leads (follow_up_at)
  where follow_up_at is not null;
