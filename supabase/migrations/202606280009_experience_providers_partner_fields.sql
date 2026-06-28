alter table public.experience_providers
  add column if not exists contact_name text,
  add column if not exists audience_fit text,
  add column if not exists collaboration_note text,
  add column if not exists pricing_note text,
  add column if not exists availability_note text,
  add column if not exists notes text;

update public.experience_providers
set
  contact_name = coalesce(contact_name, nullif(coalesce(payload->>'contactName', payload->>'contact_name'), '')),
  audience_fit = coalesce(audience_fit, nullif(coalesce(payload->>'audienceFit', payload->>'audience_fit'), '')),
  collaboration_note = coalesce(collaboration_note, nullif(coalesce(payload->>'collaborationNote', payload->>'collaboration_note'), '')),
  pricing_note = coalesce(pricing_note, nullif(coalesce(payload->>'pricingNote', payload->>'pricing_note'), '')),
  availability_note = coalesce(availability_note, nullif(coalesce(payload->>'availabilityNote', payload->>'availability_note'), '')),
  notes = coalesce(notes, nullif(coalesce(payload->>'notes', payload->>'note', payload->>'internalNote'), ''))
where payload is not null;

create index if not exists experience_providers_status_idx
  on public.experience_providers (status);

create index if not exists experience_providers_audience_fit_idx
  on public.experience_providers (audience_fit);

notify pgrst, 'reload schema';
