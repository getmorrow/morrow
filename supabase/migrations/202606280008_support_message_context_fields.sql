alter table public.support_messages
  add column if not exists booking_id uuid references public.bookings(id) on delete set null,
  add column if not exists owner_profile_id uuid references public.owner_profiles(id) on delete set null,
  add column if not exists property_id text references public.properties(id) on delete set null,
  add column if not exists source text,
  add column if not exists subject text,
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists property_name text,
  add column if not exists package_name text,
  add column if not exists requested_starts_on date,
  add column if not exists requested_ends_on date,
  add column if not exists requested_date_range_label text;

update public.support_messages
set
  booking_id = coalesce(
    booking_id,
    case
      when coalesce(payload->>'bookingId', payload->>'booking_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        then coalesce(payload->>'bookingId', payload->>'booking_id')::uuid
      else null
    end
  ),
  owner_profile_id = coalesce(
    owner_profile_id,
    case
      when coalesce(payload->>'ownerProfileId', payload->>'owner_profile_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        then coalesce(payload->>'ownerProfileId', payload->>'owner_profile_id')::uuid
      else null
    end
  ),
  property_id = coalesce(property_id, nullif(coalesce(payload->>'propertyId', payload->>'property_id'), '')),
  source = coalesce(source, nullif(payload->>'source', '')),
  subject = coalesce(subject, nullif(coalesce(payload->>'subject', payload->>'title', payload->>'supportName'), '')),
  contact_name = coalesce(contact_name, nullif(coalesce(payload->>'ownerName', payload->>'guestName', payload->>'customerName', payload->>'name', payload->>'leadName'), '')),
  contact_email = coalesce(contact_email, nullif(coalesce(payload->>'ownerEmail', payload->>'email'), '')),
  contact_phone = coalesce(contact_phone, nullif(coalesce(payload->>'ownerPhone', payload->>'phone'), '')),
  property_name = coalesce(property_name, nullif(coalesce(payload->>'propertyName', payload->>'propertyTitle', payload->>'stayName'), '')),
  package_name = coalesce(package_name, nullif(coalesce(payload->>'packageName', payload->>'packageTitle', payload->>'packageSlug'), '')),
  requested_starts_on = coalesce(
    requested_starts_on,
    case
      when coalesce(payload->>'requestedStartsOn', payload->>'startsOn', payload->>'startDate') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
        then coalesce(payload->>'requestedStartsOn', payload->>'startsOn', payload->>'startDate')::date
      else null
    end
  ),
  requested_ends_on = coalesce(
    requested_ends_on,
    case
      when coalesce(payload->>'requestedEndsOn', payload->>'endsOn', payload->>'endDate') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
        then coalesce(payload->>'requestedEndsOn', payload->>'endsOn', payload->>'endDate')::date
      else null
    end
  ),
  requested_date_range_label = coalesce(requested_date_range_label, nullif(coalesce(payload->>'requestedDateRangeLabel', payload->>'dateRangeLabel', payload->>'dateLabel'), ''))
where payload is not null;

create index if not exists support_messages_booking_id_idx
  on public.support_messages (booking_id);

create index if not exists support_messages_owner_profile_id_idx
  on public.support_messages (owner_profile_id);

create index if not exists support_messages_property_id_idx
  on public.support_messages (property_id);

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
          where communication_event.payload ->> 'supportId' = guest_support.id
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

grant execute on function public.get_guest_support_events(uuid, text) to anon, authenticated, service_role;
grant execute on function public.get_owner_support_status_events() to authenticated, service_role;

notify pgrst, 'reload schema';
