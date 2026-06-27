create index if not exists support_messages_payload_booking_id_idx
  on public.support_messages ((payload ->> 'bookingId'));

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

revoke all on function public.get_guest_support_events(uuid, text) from public;
grant execute on function public.get_guest_support_events(uuid, text) to anon, authenticated, service_role;

notify pgrst, 'reload schema';
