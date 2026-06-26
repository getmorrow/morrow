create or replace function public.can_insert_owner_support_message(
  p_category text,
  p_payload jsonb
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    p_category in ('owner_general', 'owner_property', 'owner_booking', 'owner_accounting')
    and (p_payload ->> 'source') = 'next-owner'
    and exists (
      select 1
      from public.owner_profiles owner_profile
      where owner_profile.status = 'active'
        and owner_profile.id::text = (p_payload ->> 'ownerProfileId')
        and (
          owner_profile.auth_user_id = auth.uid()
          or lower(owner_profile.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
    );
$$;

grant execute on function public.can_insert_owner_support_message(text, jsonb)
  to authenticated, service_role;

drop policy if exists "owners can insert own support messages" on public.support_messages;
create policy "owners can insert own support messages"
  on public.support_messages for insert
  to authenticated
  with check (public.can_insert_owner_support_message(category, payload));

notify pgrst, 'reload schema';
