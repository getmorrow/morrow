create table if not exists public.owner_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  phone text,
  status text not null default 'invited' check (status in ('invited', 'active', 'paused', 'archived')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.owner_property_access (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.owner_profiles(id) on delete cascade,
  property_id text not null references public.properties(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'co_owner', 'viewer')),
  can_view_financials boolean not null default true,
  can_view_operations boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_profile_id, property_id)
);

create index if not exists owner_profiles_email_idx on public.owner_profiles (lower(email));
create index if not exists owner_property_access_owner_idx on public.owner_property_access (owner_profile_id);
create index if not exists owner_property_access_property_idx on public.owner_property_access (property_id);

alter table public.owner_profiles enable row level security;
alter table public.owner_property_access enable row level security;

create or replace function public.is_morrow_owner_for_property(p_property_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.owner_profiles owner_profile
    join public.owner_property_access owner_access
      on owner_access.owner_profile_id = owner_profile.id
    where owner_access.property_id = p_property_id
      and owner_profile.status = 'active'
      and (
        owner_profile.auth_user_id = auth.uid()
        or lower(owner_profile.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

create or replace function public.get_owner_dashboard()
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
  select case
    when not exists (select 1 from current_owner) then null::jsonb
    else jsonb_build_object(
      'profile',
        (
          select jsonb_build_object(
            'id', id,
            'email', email,
            'displayName', display_name,
            'phone', phone,
            'status', status
          )
          from current_owner
        ),
      'properties',
        coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', property.id,
                'name', property.name,
                'location', property.location,
                'sleeps', property.sleeps,
                'bedrooms', property.bedrooms,
                'bathrooms', property.bathrooms,
                'checkInType', property.check_in_type,
                'supportType', property.support_type,
                'supportName', property.support_name,
                'status', property.status,
                'payload', property.payload,
                'accessRole', owner_access.role,
                'canViewFinancials', owner_access.can_view_financials,
                'canViewOperations', owner_access.can_view_operations
              )
              order by property.name
            )
            from current_owner
            join public.owner_property_access owner_access
              on owner_access.owner_profile_id = current_owner.id
            join public.properties property
              on property.id = owner_access.property_id
          ),
          '[]'::jsonb
        ),
      'packages',
        coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', pkg.id,
                'slug', pkg.slug,
                'name', pkg.name,
                'audience', pkg.audience,
                'location', pkg.location,
                'status', pkg.status,
                'propertyId', pkg.property_id,
                'priceFrom', pkg.price_from,
                'concretePrice', pkg.concrete_price
              )
              order by pkg.name
            )
            from current_owner
            join public.owner_property_access owner_access
              on owner_access.owner_profile_id = current_owner.id
            join public.packages pkg
              on pkg.property_id = owner_access.property_id
          ),
          '[]'::jsonb
        ),
      'bookings',
        coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', booking.id,
                'status', booking.status,
                'paymentStatus', booking.payment_status,
                'packageId', pkg.id,
                'packageName', pkg.name,
                'propertyId', property.id,
                'propertyName', property.name,
                'dateLabel', package_date.label,
                'startsOn', package_date.starts_on,
                'endsOn', package_date.ends_on,
                'payload', booking.payload
              )
              order by coalesce(package_date.starts_on, booking.created_at::date), booking.created_at
            )
            from current_owner
            join public.owner_property_access owner_access
              on owner_access.owner_profile_id = current_owner.id
            join public.properties property
              on property.id = owner_access.property_id
            join public.packages pkg
              on pkg.property_id = property.id
            left join public.bookings booking
              on booking.package_id = pkg.id
            left join public.package_dates package_date
              on package_date.id = booking.package_date_id
            where booking.id is not null
          ),
          '[]'::jsonb
        )
    )
  end;
$$;

grant usage on schema public to authenticated, service_role;
grant select on table public.owner_profiles to authenticated;
grant select on table public.owner_property_access to authenticated;
grant select, insert, update, delete on table public.owner_profiles to service_role;
grant select, insert, update, delete on table public.owner_property_access to service_role;
grant execute on function public.is_morrow_owner_for_property(text) to authenticated, service_role;
grant execute on function public.get_owner_dashboard() to authenticated, service_role;

drop policy if exists "owners can read own profile" on public.owner_profiles;
create policy "owners can read own profile"
  on public.owner_profiles for select
  to authenticated
  using (
    status = 'active'
    and (
      auth_user_id = auth.uid()
      or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

drop policy if exists "admin users can manage owner profiles" on public.owner_profiles;
create policy "admin users can manage owner profiles"
  on public.owner_profiles for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

drop policy if exists "service role can manage owner profiles" on public.owner_profiles;
create policy "service role can manage owner profiles"
  on public.owner_profiles for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "owners can read own property access" on public.owner_property_access;
create policy "owners can read own property access"
  on public.owner_property_access for select
  to authenticated
  using (
    exists (
      select 1
      from public.owner_profiles owner_profile
      where owner_profile.id = owner_property_access.owner_profile_id
        and owner_profile.status = 'active'
        and (
          owner_profile.auth_user_id = auth.uid()
          or lower(owner_profile.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
    )
  );

drop policy if exists "admin users can manage owner property access" on public.owner_property_access;
create policy "admin users can manage owner property access"
  on public.owner_property_access for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

drop policy if exists "service role can manage owner property access" on public.owner_property_access;
create policy "service role can manage owner property access"
  on public.owner_property_access for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "owners can read assigned properties" on public.properties;
create policy "owners can read assigned properties"
  on public.properties for select
  to authenticated
  using (public.is_morrow_owner_for_property(id));

drop policy if exists "owners can read assigned packages" on public.packages;
create policy "owners can read assigned packages"
  on public.packages for select
  to authenticated
  using (property_id is not null and public.is_morrow_owner_for_property(property_id));

drop policy if exists "owners can read assigned package dates" on public.package_dates;
create policy "owners can read assigned package dates"
  on public.package_dates for select
  to authenticated
  using (
    exists (
      select 1
      from public.packages pkg
      where pkg.id = package_dates.package_id
        and pkg.property_id is not null
        and public.is_morrow_owner_for_property(pkg.property_id)
    )
  );

drop policy if exists "owners can read assigned bookings" on public.bookings;
create policy "owners can read assigned bookings"
  on public.bookings for select
  to authenticated
  using (
    exists (
      select 1
      from public.packages pkg
      where pkg.id = bookings.package_id
        and pkg.property_id is not null
        and public.is_morrow_owner_for_property(pkg.property_id)
    )
  );

notify pgrst, 'reload schema';
