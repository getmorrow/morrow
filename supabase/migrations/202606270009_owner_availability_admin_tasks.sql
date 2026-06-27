create or replace function public.create_owner_availability_admin_task()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_name text;
  v_property_name text;
  v_range_label text;
  v_task_id text;
begin
  if new.category <> 'owner_availability' then
    return new;
  end if;

  v_task_id := 'owner-availability-' || new.id;
  v_owner_name := nullif(new.payload ->> 'ownerName', '');
  v_property_name := nullif(new.payload ->> 'propertyName', '');
  v_range_label := nullif(new.payload ->> 'requestedDateRangeLabel', '');

  insert into public.admin_tasks (
    id,
    title,
    reference_type,
    reference_id,
    reference_label,
    due_at,
    status,
    priority,
    note,
    payload,
    updated_at
  )
  values (
    v_task_id,
    'Eigenbelegung oder Verfügbarkeit prüfen',
    'support',
    new.id,
    coalesce(v_property_name, 'Eigentümeranfrage'),
    current_date,
    'open',
    'high',
    concat_ws(
      E'\n',
      'Eigentümeranfrage zur Verfügbarkeit prüfen.',
      case when v_property_name is not null then 'Unterkunft: ' || v_property_name end,
      case when v_owner_name is not null then 'Eigentümer: ' || v_owner_name end,
      case when v_range_label is not null then 'Zeitraum: ' || v_range_label end
    ),
    jsonb_build_object(
      'source', 'owner-availability-support-trigger',
      'supportId', new.id,
      'ownerProfileId', new.payload ->> 'ownerProfileId',
      'ownerName', v_owner_name,
      'ownerEmail', new.payload ->> 'ownerEmail',
      'ownerPhone', new.payload ->> 'ownerPhone',
      'propertyId', new.payload ->> 'propertyId',
      'propertyName', v_property_name,
      'requestedStartsOn', new.payload ->> 'requestedStartsOn',
      'requestedEndsOn', new.payload ->> 'requestedEndsOn',
      'requestedDateRangeLabel', v_range_label
    ),
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists owner_availability_admin_task_trigger on public.support_messages;
create trigger owner_availability_admin_task_trigger
after insert on public.support_messages
for each row
execute function public.create_owner_availability_admin_task();

grant execute on function public.create_owner_availability_admin_task() to service_role;

notify pgrst, 'reload schema';
