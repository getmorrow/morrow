drop policy if exists "owners can insert own support messages" on public.support_messages;

create policy "owners can insert own support messages"
  on public.support_messages for insert
  to authenticated
  with check (
    category in (
      'owner_general',
      'owner_property',
      'owner_booking',
      'owner_availability',
      'owner_accounting'
    )
    and (payload ->> 'source') = 'next-owner'
    and exists (
      select 1
      from public.owner_profiles owner_profile
      where owner_profile.status = 'active'
        and owner_profile.id::text = (payload ->> 'ownerProfileId')
        and (
          owner_profile.auth_user_id = auth.uid()
          or lower(owner_profile.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
    )
  );
