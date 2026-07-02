alter table public.leads
  add column if not exists medium text,
  add column if not exists content text,
  add column if not exists term text,
  add column if not exists referrer text,
  add column if not exists landing_path text,
  add column if not exists current_path text,
  add column if not exists gclid text,
  add column if not exists fbclid text,
  add column if not exists conversion_event text,
  add column if not exists conversion_label text,
  add column if not exists conversion_path text;

create index if not exists leads_medium_idx on public.leads (medium);
create index if not exists leads_landing_path_idx on public.leads (landing_path);
create index if not exists leads_conversion_event_idx on public.leads (conversion_event);

update public.leads
set
  medium = coalesce(medium, nullif(payload #>> '{utm,medium}', ''), nullif(payload #>> '{utm,utm_medium}', '')),
  content = coalesce(content, nullif(payload #>> '{utm,content}', ''), nullif(payload #>> '{utm,utm_content}', '')),
  term = coalesce(term, nullif(payload #>> '{utm,term}', ''), nullif(payload #>> '{utm,utm_term}', '')),
  referrer = coalesce(referrer, nullif(payload #>> '{utm,referrer}', '')),
  landing_path = coalesce(landing_path, nullif(payload #>> '{utm,landingPath}', '')),
  current_path = coalesce(current_path, nullif(payload #>> '{formContext,currentPath}', ''), nullif(payload #>> '{utm,currentPath}', '')),
  gclid = coalesce(gclid, nullif(payload #>> '{utm,gclid}', '')),
  fbclid = coalesce(fbclid, nullif(payload #>> '{utm,fbclid}', '')),
  conversion_event = coalesce(conversion_event, nullif(payload #>> '{conversionContext,event}', ''), nullif(payload #>> '{conversionContext,name}', '')),
  conversion_label = coalesce(conversion_label, nullif(payload #>> '{conversionContext,label}', '')),
  conversion_path = coalesce(conversion_path, nullif(payload #>> '{conversionContext,path}', ''), nullif(payload #>> '{conversionContext,location}', ''))
where payload is not null;
