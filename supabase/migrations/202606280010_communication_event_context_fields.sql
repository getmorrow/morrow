alter table public.communication_events
  add column if not exists support_id text references public.support_messages(id) on delete set null,
  add column if not exists template_key text,
  add column if not exists source text;

update public.communication_events
set
  support_id = coalesce(
    support_id,
    nullif(payload->>'supportId', ''),
    case
      when event_type like 'support:%' then nullif(regexp_replace(event_type, '^support:', ''), '')
      else null
    end
  ),
  template_key = coalesce(
    template_key,
    nullif(coalesce(payload->>'templateKey', payload->>'template', payload->>'emailTemplate'), '')
  ),
  source = coalesce(source, nullif(payload->>'source', ''))
where payload is not null;

create index if not exists communication_events_support_id_structured_idx
  on public.communication_events (support_id);

create index if not exists communication_events_template_key_idx
  on public.communication_events (template_key);

create or replace function public.get_guest_support_events(
  p_booking_id uuid,
  p_access_code text
)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with guest_booking as (
    select b.id, b.lead_id
    from public.bookings b
    where b.id = p_booking_id
      and b.guest_access_code = p_access_code
      and b.status in ('Bezahlt', 'Vor Anreise', 'Aktiv', 'Abgeschlossen')
    limit 1
  ),
  guest_support as (
    select
      support_message.id,
      support_message.category,
      support_message.message,
      support_message.status,
      support_message.urgency,
      support_message.payload,
      support_message.created_at,
      support_message.updated_at
    from public.support_messages support_message
    join guest_booking booking on true
    where support_message.category not like 'owner_%'
      and (
        support_message.lead_id = booking.lead_id
        or support_message.booking_id = booking.id
        or support_message.payload ->> 'bookingId' = booking.id::text
      )
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', guest_support.id,
        'category', guest_support.category,
        'message', guest_support.message,
        'status', guest_support.status,
        'urgency', guest_support.urgency,
        'payload', guest_support.payload,
        'createdAt', guest_support.created_at,
        'updatedAt', guest_support.updated_at,
        'replies', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id', communication_event.id,
              'channel', communication_event.channel,
              'subject', communication_event.subject,
              'body', communication_event.body,
              'status', communication_event.status,
              'createdAt', communication_event.created_at
            )
            order by communication_event.created_at asc
          )
          from public.communication_events communication_event
          where (
              communication_event.support_id = guest_support.id
              or communication_event.payload ->> 'supportId' = guest_support.id
            )
            and communication_event.direction = 'outbound'
            and communication_event.status <> 'internal'
        ), '[]'::jsonb)
      )
      order by coalesce(guest_support.updated_at, guest_support.created_at) desc
    ),
    '[]'::jsonb
  )
  from guest_support;
$$;

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
      on (
        support_message.owner_profile_id = current_owner.id
        or support_message.payload ->> 'ownerProfileId' = current_owner.id::text
      )
    where support_message.category like 'owner_%'
      and (
        coalesce(support_message.property_id, support_message.payload ->> 'propertyId') is null
        or exists (
          select 1
          from public.owner_property_access owner_access
          where owner_access.owner_profile_id = current_owner.id
            and owner_access.property_id = coalesce(support_message.property_id, support_message.payload ->> 'propertyId')
        )
      )
  )
  select coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', communication_event.id,
          'supportId', coalesce(communication_event.support_id, communication_event.payload ->> 'supportId'),
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
        on communication_event.support_id = owner_support.id
          or communication_event.payload ->> 'supportId' = owner_support.id
          or communication_event.event_type = 'support:' || owner_support.id
      where communication_event.direction <> 'internal'
    ),
    '[]'::jsonb
  );
$$;

grant execute on function public.get_guest_support_events(uuid, text) to anon, authenticated, service_role;
grant execute on function public.get_owner_communication_events() to authenticated, service_role;

notify pgrst, 'reload schema';
