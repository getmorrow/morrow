grant usage on schema public to anon, authenticated;

grant insert on public.leads to anon;
grant insert on public.support_messages to anon;

grant select, insert, update, delete on public.leads to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.properties to authenticated;
grant select, insert, update, delete on public.packages to authenticated;
grant select, insert, update, delete on public.package_dates to authenticated;
grant select, insert, update, delete on public.bookings to authenticated;
grant select, insert, update, delete on public.experience_providers to authenticated;
grant select, insert, update, delete on public.experience_blocks to authenticated;
grant select, insert, update, delete on public.local_places to authenticated;
grant select, insert, update, delete on public.admin_tasks to authenticated;
grant select, insert, update, delete on public.support_messages to authenticated;

