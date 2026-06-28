alter table public.properties
  add column if not exists description text,
  add column if not exists owner_name text,
  add column if not exists owner_email text,
  add column if not exists owner_phone text,
  add column if not exists property_type text,
  add column if not exists current_rental text,
  add column if not exists address text,
  add column if not exists earliest_arrival text,
  add column if not exists latest_arrival text,
  add column if not exists check_out_time text,
  add column if not exists key_safe_code text,
  add column if not exists check_in_instructions text,
  add column if not exists amenities text[],
  add column if not exists attributes text[],
  add column if not exists experience_worlds text[],
  add column if not exists house_rules text[],
  add column if not exists media text[],
  add column if not exists media_alt_texts text[],
  add column if not exists cleaning_status text,
  add column if not exists maintenance_status text,
  add column if not exists last_check text;

update public.properties
set
  description = coalesce(description, nullif(payload->>'description', '')),
  owner_name = coalesce(owner_name, nullif(payload->>'ownerName', '')),
  owner_email = coalesce(owner_email, nullif(coalesce(payload->>'email', payload->>'ownerEmail'), '')),
  owner_phone = coalesce(owner_phone, nullif(coalesce(payload->>'phone', payload->>'ownerPhone'), '')),
  property_type = coalesce(property_type, nullif(payload->>'propertyType', '')),
  current_rental = coalesce(current_rental, nullif(payload->>'currentRental', '')),
  address = coalesce(address, nullif(payload->>'address', '')),
  earliest_arrival = coalesce(earliest_arrival, nullif(payload->>'earliestArrival', '')),
  latest_arrival = coalesce(latest_arrival, nullif(payload->>'latestArrival', '')),
  check_out_time = coalesce(check_out_time, nullif(payload->>'checkOutTime', '')),
  key_safe_code = coalesce(key_safe_code, nullif(payload->>'keySafeCode', '')),
  check_in_instructions = coalesce(check_in_instructions, nullif(payload->>'checkInInstructions', '')),
  amenities = coalesce(
    amenities,
    case
      when jsonb_typeof(payload->'amenities') = 'array'
        then array(select jsonb_array_elements_text(payload->'amenities'))
      when jsonb_typeof(payload->'features') = 'array'
        then array(select jsonb_array_elements_text(payload->'features'))
      else null
    end
  ),
  attributes = coalesce(
    attributes,
    case
      when jsonb_typeof(payload->'attributes') = 'array'
        then array(select jsonb_array_elements_text(payload->'attributes'))
      else null
    end
  ),
  experience_worlds = coalesce(
    experience_worlds,
    case
      when jsonb_typeof(payload->'experienceWorlds') = 'array'
        then array(select jsonb_array_elements_text(payload->'experienceWorlds'))
      else null
    end
  ),
  house_rules = coalesce(
    house_rules,
    case
      when jsonb_typeof(payload->'houseRules') = 'array'
        then array(select jsonb_array_elements_text(payload->'houseRules'))
      else null
    end
  ),
  media = coalesce(
    media,
    case
      when jsonb_typeof(payload->'media') = 'array'
        then array(select jsonb_array_elements_text(payload->'media'))
      else null
    end
  ),
  media_alt_texts = coalesce(
    media_alt_texts,
    case
      when jsonb_typeof(payload->'mediaAltTexts') = 'array'
        then array(select jsonb_array_elements_text(payload->'mediaAltTexts'))
      else null
    end
  ),
  cleaning_status = coalesce(cleaning_status, nullif(coalesce(payload->>'cleaningStatus', payload->>'cleaning', payload->>'housekeepingStatus'), '')),
  maintenance_status = coalesce(maintenance_status, nullif(coalesce(payload->>'maintenanceStatus', payload->>'damageStatus', payload->>'operationsStatus'), '')),
  last_check = coalesce(last_check, nullif(coalesce(payload->>'lastCheck', payload->>'lastInspection', payload->>'lastUpdated'), ''))
where payload is not null;

create index if not exists properties_current_rental_idx
  on public.properties (current_rental)
  where current_rental is not null;

create index if not exists properties_owner_email_idx
  on public.properties (lower(owner_email))
  where owner_email is not null;

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
                'description', property.description,
                'ownerName', property.owner_name,
                'ownerEmail', property.owner_email,
                'ownerPhone', property.owner_phone,
                'propertyType', property.property_type,
                'currentRental', property.current_rental,
                'address', property.address,
                'earliestArrival', property.earliest_arrival,
                'latestArrival', property.latest_arrival,
                'checkOutTime', property.check_out_time,
                'keySafeCode', property.key_safe_code,
                'checkInInstructions', property.check_in_instructions,
                'amenities', coalesce(to_jsonb(property.amenities), '[]'::jsonb),
                'attributes', coalesce(to_jsonb(property.attributes), '[]'::jsonb),
                'experienceWorlds', coalesce(to_jsonb(property.experience_worlds), '[]'::jsonb),
                'houseRules', coalesce(to_jsonb(property.house_rules), '[]'::jsonb),
                'media', coalesce(to_jsonb(property.media), '[]'::jsonb),
                'mediaAltTexts', coalesce(to_jsonb(property.media_alt_texts), '[]'::jsonb),
                'cleaningStatus', property.cleaning_status,
                'maintenanceStatus', property.maintenance_status,
                'lastCheck', property.last_check,
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
                'dateLabel', coalesce(booking.selected_date, package_date.label),
                'startsOn', package_date.starts_on,
                'endsOn', package_date.ends_on,
                'paymentAmount', booking.payment_amount,
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
      'statements',
        coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', owner_statement.id,
                'propertyId', owner_statement.property_id,
                'propertyName', property.name,
                'periodLabel', owner_statement.period_label,
                'periodStart', owner_statement.period_start,
                'periodEnd', owner_statement.period_end,
                'status', owner_statement.status,
                'currency', owner_statement.currency,
                'grossRevenue', owner_statement.gross_revenue,
                'morrowFee', owner_statement.morrow_fee,
                'otherCosts', owner_statement.other_costs,
                'ownerPayout', owner_statement.owner_payout,
                'documentUrl', owner_statement.document_url,
                'paidAt', owner_statement.paid_at,
                'payload', owner_statement.payload,
                'createdAt', owner_statement.created_at,
                'updatedAt', owner_statement.updated_at
              )
              order by coalesce(owner_statement.period_start, owner_statement.created_at::date) desc, owner_statement.created_at desc
            )
            from current_owner
            join public.owner_property_access owner_access
              on owner_access.owner_profile_id = current_owner.id
            join public.properties property
              on property.id = owner_access.property_id
            join public.owner_statements owner_statement
              on owner_statement.property_id = property.id
            where owner_access.can_view_financials = true
              and owner_statement.status in ('visible', 'paid')
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
