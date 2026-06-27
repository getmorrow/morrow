create table if not exists public.owner_documents (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references public.properties(id) on delete cascade,
  title text not null,
  document_type text not null default 'document' check (
    document_type in ('agreement', 'statement', 'invoice', 'report', 'handover', 'document')
  ),
  status text not null default 'draft' check (status in ('draft', 'visible', 'archived')),
  url text not null,
  period_label text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists owner_documents_property_idx on public.owner_documents (property_id);
create index if not exists owner_documents_status_idx on public.owner_documents (status);
create index if not exists owner_documents_type_idx on public.owner_documents (document_type);

alter table public.owner_documents enable row level security;

grant select, insert, update, delete on table public.owner_documents to authenticated, service_role;

drop policy if exists "owners can read visible assigned owner documents" on public.owner_documents;
create policy "owners can read visible assigned owner documents"
  on public.owner_documents for select
  to authenticated
  using (
    status = 'visible'
    and public.is_morrow_owner_for_property(property_id)
  );

drop policy if exists "admin users can manage owner documents" on public.owner_documents;
create policy "admin users can manage owner documents"
  on public.owner_documents for all
  to authenticated
  using (public.is_morrow_admin())
  with check (public.is_morrow_admin());

drop policy if exists "service role can manage owner documents" on public.owner_documents;
create policy "service role can manage owner documents"
  on public.owner_documents for all
  to service_role
  using (true)
  with check (true);

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
      'dates',
        coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', package_date.id,
                'packageId', pkg.id,
                'packageName', pkg.name,
                'propertyId', pkg.property_id,
                'label', package_date.label,
                'startsOn', package_date.starts_on,
                'endsOn', package_date.ends_on,
                'capacity', package_date.capacity,
                'status', package_date.status,
                'payload', package_date.payload
              )
              order by coalesce(package_date.starts_on, package_date.created_at::date), package_date.created_at
            )
            from current_owner
            join public.owner_property_access owner_access
              on owner_access.owner_profile_id = current_owner.id
            join public.packages pkg
              on pkg.property_id = owner_access.property_id
            join public.package_dates package_date
              on package_date.package_id = pkg.id
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
        ),
      'documents',
        coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', owner_document.id,
                'propertyId', owner_document.property_id,
                'propertyName', property.name,
                'title', owner_document.title,
                'documentType', owner_document.document_type,
                'status', owner_document.status,
                'url', owner_document.url,
                'periodLabel', owner_document.period_label,
                'payload', owner_document.payload,
                'createdAt', owner_document.created_at
              )
              order by owner_document.created_at desc
            )
            from current_owner
            join public.owner_property_access owner_access
              on owner_access.owner_profile_id = current_owner.id
            join public.properties property
              on property.id = owner_access.property_id
            join public.owner_documents owner_document
              on owner_document.property_id = property.id
            where owner_document.status = 'visible'
          ),
          '[]'::jsonb
        )
    )
  end;
$$;

grant execute on function public.get_owner_dashboard() to authenticated, service_role;

notify pgrst, 'reload schema';
