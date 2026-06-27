create index if not exists communication_events_support_id_idx
  on public.communication_events ((payload ->> 'supportId'));

create or replace function public.get_owner_communication_events()
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
          'id', communication_event.id,
          'supportId', communication_event.payload ->> 'supportId',
          'channel', communication_event.channel,
          'direction', communication_event.direction,
          'eventType', communication_event.event_type,
          'subject', communication_event.subject,
          'body', communication_event.body,
          'actor', communication_event.actor,
          'status', communication_event.status,
          'createdAt', communication_event.created_at
        )
        order by communication_event.created_at desc
      )
      from owner_support
      join public.communication_events communication_event
        on communication_event.payload ->> 'supportId' = owner_support.id
          or communication_event.event_type = 'support:' || owner_support.id
      where communication_event.direction <> 'internal'
    ),
    '[]'::jsonb
  );
$$;

grant execute on function public.get_owner_communication_events() to authenticated, service_role;

notify pgrst, 'reload schema';
