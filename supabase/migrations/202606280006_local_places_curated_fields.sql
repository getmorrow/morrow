alter table public.local_places
  add column if not exists description text,
  add column if not exists cuisine text,
  add column if not exists curation_kind text,
  add column if not exists event_date date,
  add column if not exists event_time text,
  add column if not exists event_audience text,
  add column if not exists event_setting text,
  add column if not exists event_fit_note text,
  add column if not exists best_for text[],
  add column if not exists audiences text[],
  add column if not exists images text[];

update public.local_places
set
  description = coalesce(
    description,
    nullif(coalesce(payload->>'description', payload->>'guestDescription', payload->>'morrowNote', payload->>'routeNote'), '')
  ),
  cuisine = coalesce(cuisine, nullif(payload->>'cuisine', '')),
  curation_kind = coalesce(
    curation_kind,
    nullif(coalesce(payload->>'curationKind', payload->>'curation_kind'), '')
  ),
  event_date = coalesce(
    event_date,
    case
      when coalesce(payload->>'eventDate', payload->>'startsOn', payload->>'date') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
        then coalesce(payload->>'eventDate', payload->>'startsOn', payload->>'date')::date
      else null
    end
  ),
  event_time = coalesce(event_time, nullif(coalesce(payload->>'eventTime', payload->>'time'), '')),
  event_audience = coalesce(event_audience, nullif(coalesce(payload->>'eventAudience', payload->>'audience'), '')),
  event_setting = coalesce(event_setting, nullif(coalesce(payload->>'eventSetting', payload->>'setting'), '')),
  event_fit_note = coalesce(event_fit_note, nullif(coalesce(payload->>'eventFitNote', payload->>'fitNote', payload->>'morrowFit'), '')),
  best_for = coalesce(
    best_for,
    case
      when jsonb_typeof(payload->'bestFor') = 'array'
        then array(select jsonb_array_elements_text(payload->'bestFor'))
      else null
    end
  ),
  audiences = coalesce(
    audiences,
    case
      when jsonb_typeof(payload->'audiences') = 'array'
        then array(select jsonb_array_elements_text(payload->'audiences'))
      else null
    end
  ),
  images = coalesce(
    images,
    case
      when jsonb_typeof(payload->'images') = 'array'
        then array(select jsonb_array_elements_text(payload->'images'))
      when jsonb_typeof(payload->'gallery') = 'array'
        then array(select jsonb_array_elements_text(payload->'gallery'))
      when jsonb_typeof(payload->'media') = 'array'
        then array(select jsonb_array_elements_text(payload->'media'))
      else null
    end
  )
where payload is not null;

create index if not exists local_places_event_date_idx
  on public.local_places (event_date)
  where event_date is not null;

create index if not exists local_places_curation_kind_idx
  on public.local_places (curation_kind)
  where curation_kind is not null;

notify pgrst, 'reload schema';
