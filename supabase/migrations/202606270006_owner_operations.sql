create table if not exists public.owner_operations (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references public.properties(id) on delete cascade,
  title text not null,
  operation_type text not null default 'maintenance' check (operation_type in ('cleaning', 'inspection', 'maintenance', 'repair', 'handover', 'note')),
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'done', 'blocked', 'archived')),
  visibility text not null default 'owner_visible' check (visibility in ('internal', 'owner_visible')),
  scheduled_for date,
  completed_at date,
  note text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists owner_operations_property_idx
  on public.owner_operations (property_id);

create index if not exists owner_operations_status_idx
  on public.owner_operations (status);

create index if not exists owner_operations_visibility_idx
  on public.owner_operations (visibility);

create index if not exists owner_operations_schedule_idx
  on public.owner_operations (scheduled_for desc, created_at desc);

alter table public.owner_operations enable row level security;

grant select, insert, update, delete on table public.owner_operations to authenticated, service_role;

drop policy if exists "owners can read visible assigned owner operations" on public.owner_operations;
create policy "owners can read visible assigned owner operations"
  on public.owner_operations for select
  to authenticated
  using (
    visibility = 'owner_visible'
    and status <> 'archived'
    and exists (
      select 1
      from public.owner_profiles owner_profile
      join public.owner_property_access owner_access
        on owner_access.owner_profile_id = owner_profile.id
      where owner_profile.status = 'active'
        and owner_access.property_id = owner_operations.property_id
        and owner_access.can_view_operations = true
        and (
          owner_profile.auth_user_id = auth.uid()
          or lower(owner_profile.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
    )
  );

drop policy if exists "admin users can manage owner operations" on public.owner_operations;
create policy "admin users can manage owner operations"
  on public.owner_operations for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

drop policy if exists "service role can manage owner operations" on public.owner_operations;
create policy "service role can manage owner operations"
  on public.owner_operations for all
  to service_role
  using (true)
  with check (true);

create or replace function public.get_owner_operations()
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
  )
  select coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', owner_operation.id,
          'propertyId', owner_operation.property_id,
          'propertyName', property.name,
          'title', owner_operation.title,
          'operationType', owner_operation.operation_type,
          'status', owner_operation.status,
          'visibility', owner_operation.visibility,
          'scheduledFor', owner_operation.scheduled_for,
          'completedAt', owner_operation.completed_at,
          'note', owner_operation.note,
          'payload', owner_operation.payload,
          'createdAt', owner_operation.created_at,
          'updatedAt', owner_operation.updated_at
        )
        order by coalesce(owner_operation.scheduled_for, owner_operation.created_at::date) desc, owner_operation.created_at desc
      )
      from current_owner
      join public.owner_property_access owner_access
        on owner_access.owner_profile_id = current_owner.id
      join public.properties property
        on property.id = owner_access.property_id
      join public.owner_operations owner_operation
        on owner_operation.property_id = property.id
      where owner_access.can_view_operations = true
        and owner_operation.visibility = 'owner_visible'
        and owner_operation.status <> 'archived'
    ),
    '[]'::jsonb
  );
$$;

grant execute on function public.get_owner_operations() to authenticated, service_role;

notify pgrst, 'reload schema';
