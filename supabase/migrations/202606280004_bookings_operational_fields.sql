alter table public.bookings
  add column if not exists guest_name text,
  add column if not exists guest_email text,
  add column if not exists guest_phone text,
  add column if not exists selected_date text,
  add column if not exists reservation_deadline date,
  add column if not exists payment_due_date date,
  add column if not exists payment_amount text,
  add column if not exists payment_date text,
  add column if not exists payment_method text,
  add column if not exists payment_reference text,
  add column if not exists payment_proof_url text,
  add column if not exists adults integer,
  add column if not exists children integer,
  add column if not exists children_ages text,
  add column if not exists dog text,
  add column if not exists check_in_status text,
  add column if not exists experience_status text,
  add column if not exists next_task text;

update public.bookings
set
  guest_name = coalesce(
    guest_name,
    nullif(coalesce(payload->>'guestName', payload->>'customerName', payload->>'name'), '')
  ),
  guest_email = coalesce(
    guest_email,
    nullif(coalesce(payload->>'email', payload->>'guestEmail', payload->>'customerEmail'), '')
  ),
  guest_phone = coalesce(
    guest_phone,
    nullif(coalesce(payload->>'phone', payload->>'guestPhone', payload->>'customerPhone'), '')
  ),
  selected_date = coalesce(
    selected_date,
    nullif(coalesce(payload->>'selectedDate', payload->>'dateLabel', payload->>'travelDate', payload->>'arrivalDate'), '')
  ),
  reservation_deadline = coalesce(
    reservation_deadline,
    case
      when coalesce(payload->>'reservationDeadline', payload->>'reservation_deadline') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
        then coalesce(payload->>'reservationDeadline', payload->>'reservation_deadline')::date
      else null
    end
  ),
  payment_due_date = coalesce(
    payment_due_date,
    case
      when coalesce(payload->>'paymentDueDate', payload->>'payment_due_date') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
        then coalesce(payload->>'paymentDueDate', payload->>'payment_due_date')::date
      else null
    end
  ),
  payment_amount = coalesce(
    payment_amount,
    nullif(coalesce(payload->>'paymentAmount', payload->>'amountPaid', payload->>'price'), '')
  ),
  payment_date = coalesce(
    payment_date,
    nullif(coalesce(payload->>'paymentDate', payload->>'paidAt'), '')
  ),
  payment_method = coalesce(
    payment_method,
    nullif(payload->>'paymentMethod', '')
  ),
  payment_reference = coalesce(
    payment_reference,
    nullif(coalesce(payload->>'paymentReference', payload->>'invoiceNumber', payload->>'transactionId'), '')
  ),
  payment_proof_url = coalesce(
    payment_proof_url,
    nullif(coalesce(payload->>'paymentProofUrl', payload->>'receiptUrl', payload->>'invoiceUrl'), '')
  ),
  adults = coalesce(
    adults,
    case
      when coalesce(payload->>'adults', payload->>'adultCount') ~ '^[0-9]+$'
        then coalesce(payload->>'adults', payload->>'adultCount')::integer
      else null
    end
  ),
  children = coalesce(
    children,
    case
      when coalesce(payload->>'children', payload->>'childCount', payload->>'kids') ~ '^[0-9]+$'
        then coalesce(payload->>'children', payload->>'childCount', payload->>'kids')::integer
      else null
    end
  ),
  children_ages = coalesce(
    children_ages,
    nullif(coalesce(payload->>'childrenAges', payload->>'children_ages', payload->>'kidsAges'), '')
  ),
  dog = coalesce(
    dog,
    nullif(coalesce(payload->>'dog', payload->>'dogs', payload->>'dogNote', payload->>'pet', payload->>'hund'), '')
  ),
  check_in_status = coalesce(
    check_in_status,
    nullif(coalesce(payload->>'checkInStatus', payload->>'check_in_status'), '')
  ),
  experience_status = coalesce(
    experience_status,
    nullif(coalesce(payload->>'experienceStatus', payload->>'experience_status'), '')
  ),
  next_task = coalesce(
    next_task,
    nullif(coalesce(payload->>'nextTask', payload->>'next_task'), '')
  )
where payload is not null;

create index if not exists bookings_reservation_deadline_idx
  on public.bookings (reservation_deadline)
  where reservation_deadline is not null;

create index if not exists bookings_payment_due_date_idx
  on public.bookings (payment_due_date)
  where payment_due_date is not null;

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
    'booking',
    b.payload || jsonb_strip_nulls(jsonb_build_object(
      'id', b.id,
      'leadId', b.lead_id,
      'customerId', b.customer_id,
      'packageId', b.package_id,
      'status', b.status,
      'paymentStatus', b.payment_status,
      'guestAccessCode', b.guest_access_code,
      'customerName', b.guest_name,
      'name', b.guest_name,
      'email', b.guest_email,
      'phone', b.guest_phone,
      'selectedDate', b.selected_date,
      'reservationDeadline', b.reservation_deadline,
      'paymentDueDate', b.payment_due_date,
      'paymentAmount', b.payment_amount,
      'paymentDate', b.payment_date,
      'paymentMethod', b.payment_method,
      'paymentReference', b.payment_reference,
      'paymentProofUrl', b.payment_proof_url,
      'adults', b.adults,
      'children', b.children,
      'childrenAges', b.children_ages,
      'dog', b.dog,
      'checkInStatus', b.check_in_status,
      'experienceStatus', b.experience_status,
      'nextTask', b.next_task,
      'createdAt', b.created_at,
      'updatedAt', b.updated_at
    )),
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
