create table if not exists public.support_status_events (
  id uuid primary key default gen_random_uuid(),
  support_id text not null references public.support_messages(id) on delete cascade,
  from_status text,
  to_status text not null,
  note text,
  actor text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists support_status_events_support_id_idx
  on public.support_status_events (support_id);

create index if not exists support_status_events_created_at_idx
  on public.support_status_events (created_at desc);

alter table public.support_status_events enable row level security;

grant select, insert, update, delete on table public.support_status_events to authenticated, service_role;

drop policy if exists "admin users can manage support status events" on public.support_status_events;
create policy "admin users can manage support status events"
  on public.support_status_events for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

drop policy if exists "service role can manage support status events" on public.support_status_events;
create policy "service role can manage support status events"
  on public.support_status_events for all
  to service_role
  using (true)
  with check (true);

create or replace function public.get_owner_support_status_events()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with current_owner as (
    select owner_profile.*
    from public.owner_profiles owner_profile
    where owner_profile.status = 'active'
      and (
        owner_profile.auth_user_id = auth.uid()
        or lower(owner_profile.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
    limit 1
  ),
  owner_support as (
    select support_message.id
    from current_owner
    join public.support_messages support_message
      on support_message.payload ->> 'ownerProfileId' = current_owner.id::text
    where support_message.category like 'owner_%'
      and (
        support_message.payload ->> 'propertyId' is null
        or exists (
          select 1
          from public.owner_property_access owner_access
          where owner_access.owner_profile_id = current_owner.id
            and owner_access.property_id = support_message.payload ->> 'propertyId'
        )
      )
  )
  select coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', status_event.id,
          'supportId', status_event.support_id,
          'fromStatus', status_event.from_status,
          'toStatus', status_event.to_status,
          'note', status_event.note,
          'actor', status_event.actor,
          'payload', status_event.payload,
          'createdAt', status_event.created_at
        )
        order by status_event.created_at desc
      )
      from owner_support
      join public.support_status_events status_event
        on status_event.support_id = owner_support.id
    ),
    '[]'::jsonb
  );
$$;

grant execute on function public.get_owner_support_status_events() to authenticated, service_role;

notify pgrst, 'reload schema';
