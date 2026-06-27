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
        ),
      'messages',
        coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', support_message.id,
                'category', support_message.category,
                'status', support_message.status,
                'urgency', support_message.urgency,
                'message', support_message.message,
                'propertyId', support_message.payload ->> 'propertyId',
                'propertyName', support_message.payload ->> 'propertyName',
                'subject', support_message.payload ->> 'subject',
                'requestedStartsOn', support_message.payload ->> 'requestedStartsOn',
                'requestedEndsOn', support_message.payload ->> 'requestedEndsOn',
                'payload', support_message.payload,
                'createdAt', support_message.created_at,
                'updatedAt', support_message.updated_at
              )
              order by support_message.created_at desc
            )
            from current_owner
            join public.support_messages support_message
              on support_message.payload ->> 'ownerProfileId' = current_owner.id::text
            where support_message.category like 'owner_%'
              and (
                support_message.payload ->> 'propertyId' is null
                or exists (
                  select 1
                  from public.owner_property_access owner_access
                  where owner_access.owner_profile_id = current_owner.id
                    and owner_access.property_id = support_message.payload ->> 'propertyId'
                )
              )
          ),
          '[]'::jsonb
        )
    )
  end;
$$;

grant execute on function public.get_owner_dashboard() to authenticated, service_role;

notify pgrst, 'reload schema';
