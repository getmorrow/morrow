alter table public.leads
  add column if not exists whatsapp_opt_in boolean,
  add column if not exists whatsapp_consent_at timestamptz;

update public.leads
set whatsapp_opt_in = case
    when lower(consent_value.value) in ('true', 'yes', 'ja', 'zugestimmt', '1') then true
    when lower(consent_value.value) in ('false', 'no', 'nein', 'abgelehnt', '0') then false
    else null
  end
from lateral (
  select coalesce(
    nullif(public.leads.payload ->> 'whatsappOptIn', ''),
    nullif(public.leads.payload ->> 'whatsapp_opt_in', ''),
    nullif(public.leads.payload ->> 'whatsappConsent', '')
  ) as value
) as consent_value
where public.leads.whatsapp_opt_in is null
  and consent_value.value is not null;

update public.leads
set whatsapp_consent_at = created_at
where whatsapp_opt_in is true
  and whatsapp_consent_at is null;

create index if not exists leads_whatsapp_opt_in_idx
  on public.leads (whatsapp_opt_in)
  where whatsapp_opt_in is true;
