alter table public.leads
  add column if not exists adults integer,
  add column if not exists children integer,
  add column if not exists children_ages text,
  add column if not exists dog text;

update public.leads
set
  adults = coalesce(
    public.leads.adults,
    case
      when coalesce(payload->>'adults', payload->>'adultCount') ~ '^[0-9]+$'
        then coalesce(payload->>'adults', payload->>'adultCount')::integer
      else null
    end
  ),
  children = coalesce(
    public.leads.children,
    case
      when coalesce(payload->>'children', payload->>'childCount', payload->>'kids') ~ '^[0-9]+$'
        then coalesce(payload->>'children', payload->>'childCount', payload->>'kids')::integer
      else null
    end
  ),
  children_ages = coalesce(
    public.leads.children_ages,
    nullif(coalesce(payload->>'childrenAges', payload->>'children_ages', payload->>'kidsAges'), '')
  ),
  dog = coalesce(
    public.leads.dog,
    nullif(coalesce(payload->>'dog', payload->>'dogs', payload->>'dogNote', payload->>'pet', payload->>'hund'), '')
  )
where payload is not null
  and (
    public.leads.adults is null
    or public.leads.children is null
    or public.leads.children_ages is null
    or public.leads.dog is null
  );
