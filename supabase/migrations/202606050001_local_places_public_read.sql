grant select on table public.local_places to anon;

drop policy if exists "public can read approved local places" on public.local_places;
create policy "public can read approved local places"
  on public.local_places for select
  to anon
  using (status = 'approved');

notify pgrst, 'reload schema';
