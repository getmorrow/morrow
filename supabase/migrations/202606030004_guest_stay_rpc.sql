create or replace function public.get_guest_stay(
  p_booking_id uuid,
  p_access_code text
)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'booking', b.payload,
    'package', p.payload
  )
  from public.bookings b
  left join public.packages p on p.id = b.package_id
  where b.id = p_booking_id
    and b.guest_access_code = p_access_code
    and b.status in ('Bezahlt', 'Vor Anreise', 'Aktiv', 'Abgeschlossen')
  limit 1;
$$;

revoke all on function public.get_guest_stay(uuid, text) from public;
grant execute on function public.get_guest_stay(uuid, text) to anon, authenticated;

notify pgrst, 'reload schema';
