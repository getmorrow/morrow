create or replace function public.set_lead_attribution_fields()
returns trigger
language plpgsql
as $$
begin
  new.source = coalesce(nullif(new.source, ''), nullif(new.payload #>> '{utm,source}', ''), nullif(new.payload #>> '{utm,utm_source}', ''));
  new.campaign = coalesce(nullif(new.campaign, ''), nullif(new.payload #>> '{utm,campaign}', ''), nullif(new.payload #>> '{utm,utm_campaign}', ''));
  new.medium = coalesce(nullif(new.medium, ''), nullif(new.payload #>> '{utm,medium}', ''), nullif(new.payload #>> '{utm,utm_medium}', ''));
  new.content = coalesce(nullif(new.content, ''), nullif(new.payload #>> '{utm,content}', ''), nullif(new.payload #>> '{utm,utm_content}', ''));
  new.term = coalesce(nullif(new.term, ''), nullif(new.payload #>> '{utm,term}', ''), nullif(new.payload #>> '{utm,utm_term}', ''));
  new.referrer = coalesce(nullif(new.referrer, ''), nullif(new.payload #>> '{utm,referrer}', ''));
  new.landing_path = coalesce(nullif(new.landing_path, ''), nullif(new.payload #>> '{utm,landingPath}', ''));
  new.current_path = coalesce(nullif(new.current_path, ''), nullif(new.payload #>> '{formContext,currentPath}', ''), nullif(new.payload #>> '{utm,currentPath}', ''));
  new.gclid = coalesce(nullif(new.gclid, ''), nullif(new.payload #>> '{utm,gclid}', ''));
  new.fbclid = coalesce(nullif(new.fbclid, ''), nullif(new.payload #>> '{utm,fbclid}', ''));
  new.conversion_event = coalesce(nullif(new.conversion_event, ''), nullif(new.payload #>> '{conversionContext,event}', ''), nullif(new.payload #>> '{conversionContext,name}', ''));
  new.conversion_label = coalesce(nullif(new.conversion_label, ''), nullif(new.payload #>> '{conversionContext,label}', ''));
  new.conversion_path = coalesce(nullif(new.conversion_path, ''), nullif(new.payload #>> '{conversionContext,path}', ''), nullif(new.payload #>> '{conversionContext,location}', ''));

  return new;
end;
$$;

drop trigger if exists leads_set_attribution_fields on public.leads;

create trigger leads_set_attribution_fields
before insert or update on public.leads
for each row
execute function public.set_lead_attribution_fields();

update public.leads
set payload = payload
where payload is not null;
