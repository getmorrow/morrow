alter table public.leads
  add column if not exists whatsapp_opt_in boolean,
  add column if not exists whatsapp_consent_at timestamptz;

update public.leads
set whatsapp_opt_in = case
    when lower(coalesce(
      nullif(payload ->> 'whatsappOptIn', ''),
      nullif(payload ->> 'whatsapp_opt_in', ''),
      nullif(payload ->> 'whatsappConsent', '')
    )) in ('true', 'yes', 'ja', 'zugestimmt', '1') then true
    when lower(coalesce(
      nullif(payload ->> 'whatsappOptIn', ''),
      nullif(payload ->> 'whatsapp_opt_in', ''),
      nullif(payload ->> 'whatsappConsent', '')
    )) in ('false', 'no', 'nein', 'abgelehnt', '0') then false
    else null
  end
where public.leads.whatsapp_opt_in is null
  and coalesce(
    nullif(payload ->> 'whatsappOptIn', ''),
    nullif(payload ->> 'whatsapp_opt_in', ''),
    nullif(payload ->> 'whatsappConsent', '')
  ) is not null;

update public.leads
set whatsapp_consent_at = created_at
where whatsapp_opt_in is true
  and whatsapp_consent_at is null;

create index if not exists leads_whatsapp_opt_in_idx
  on public.leads (whatsapp_opt_in)
  where whatsapp_opt_in is true;
