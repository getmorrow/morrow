grant usage on schema public to anon, authenticated, service_role;

grant insert on table public.leads to anon;
grant insert on table public.support_messages to anon;

grant select, insert, update, delete on table public.leads to authenticated, service_role;
grant select, insert, update, delete on table public.customers to authenticated, service_role;
grant select, insert, update, delete on table public.properties to authenticated, service_role;
grant select, insert, update, delete on table public.packages to authenticated, service_role;
grant select, insert, update, delete on table public.package_dates to authenticated, service_role;
grant select, insert, update, delete on table public.bookings to authenticated, service_role;
grant select, insert, update, delete on table public.experience_providers to authenticated, service_role;
grant select, insert, update, delete on table public.experience_blocks to authenticated, service_role;
grant select, insert, update, delete on table public.local_places to authenticated, service_role;
grant select, insert, update, delete on table public.admin_tasks to authenticated, service_role;
grant select, insert, update, delete on table public.support_messages to authenticated, service_role;

drop policy if exists "public can insert phase1 leads" on public.leads;
drop policy if exists "public can insert support messages" on public.support_messages;

create policy "public can insert phase1 leads"
  on public.leads for insert
  to anon
  with check (type in ('guest', 'owner', 'experience'));

create policy "public can insert support messages"
  on public.support_messages for insert
  to anon
  with check (true);

drop policy if exists "service role can manage leads" on public.leads;
drop policy if exists "service role can manage support messages" on public.support_messages;

create policy "service role can manage leads"
  on public.leads for all
  to service_role
  using (true)
  with check (true);

create policy "service role can manage support messages"
  on public.support_messages for all
  to service_role
  using (true)
  with check (true);

