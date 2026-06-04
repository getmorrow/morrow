create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null default 'admin',
  status text not null default 'active',
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.admin_users (email, role, status, name)
values ('auszeiten@getmorrow.de', 'owner', 'active', 'Morrow Auszeiten')
on conflict (email) do update
set role = excluded.role,
    status = excluded.status,
    updated_at = now();

create or replace function public.is_morrow_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users admin_user
    where lower(admin_user.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and admin_user.status = 'active'
  );
$$;

create or replace function public.get_morrow_admin_profile()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select jsonb_build_object(
        'email', admin_user.email,
        'role', admin_user.role,
        'status', admin_user.status,
        'name', admin_user.name
      )
      from public.admin_users admin_user
      where lower(admin_user.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        and admin_user.status = 'active'
      limit 1
    ),
    null::jsonb
  );
$$;

grant usage on schema public to anon, authenticated, service_role;
grant execute on function public.is_morrow_admin() to anon, authenticated, service_role;
grant execute on function public.get_morrow_admin_profile() to authenticated, service_role;
grant select, insert, update, delete on table public.admin_users to service_role;

alter table public.admin_users enable row level security;

drop policy if exists "service role can manage admin users" on public.admin_users;
create policy "service role can manage admin users"
  on public.admin_users for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "authenticated morrow team can manage leads" on public.leads;
drop policy if exists "authenticated morrow team can manage customers" on public.customers;
drop policy if exists "authenticated morrow team can manage properties" on public.properties;
drop policy if exists "authenticated morrow team can manage packages" on public.packages;
drop policy if exists "authenticated morrow team can manage package dates" on public.package_dates;
drop policy if exists "authenticated morrow team can manage bookings" on public.bookings;
drop policy if exists "authenticated morrow team can manage experience providers" on public.experience_providers;
drop policy if exists "authenticated morrow team can manage experience blocks" on public.experience_blocks;
drop policy if exists "authenticated morrow team can manage local places" on public.local_places;
drop policy if exists "authenticated morrow team can manage tasks" on public.admin_tasks;
drop policy if exists "authenticated morrow team can manage support messages" on public.support_messages;
drop policy if exists "authenticated morrow team can manage email events" on public.email_events;
drop policy if exists "authenticated morrow team can manage communication events" on public.communication_events;

create policy "admin users can manage leads"
  on public.leads for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

create policy "admin users can manage customers"
  on public.customers for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

create policy "admin users can manage properties"
  on public.properties for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

create policy "admin users can manage packages"
  on public.packages for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

create policy "admin users can manage package dates"
  on public.package_dates for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

create policy "admin users can manage bookings"
  on public.bookings for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

create policy "admin users can manage experience providers"
  on public.experience_providers for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

create policy "admin users can manage experience blocks"
  on public.experience_blocks for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

create policy "admin users can manage local places"
  on public.local_places for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

create policy "admin users can manage tasks"
  on public.admin_tasks for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

create policy "admin users can manage support messages"
  on public.support_messages for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

create policy "admin users can manage email events"
  on public.email_events for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

create policy "admin users can manage communication events"
  on public.communication_events for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

notify pgrst, 'reload schema';
