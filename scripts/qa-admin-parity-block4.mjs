import { createClient } from '@supabase/supabase-js'
import { createQaEnv, isPlaceholder } from './lib/qa-env.mjs'

const rootDir = process.cwd()
const qaEnv = createQaEnv(rootDir)
const env = { ...qaEnv.values }

if (!env.SUPABASE_URL) {
  env.SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL || ''
}

if (!env.SUPABASE_ANON_KEY) {
  env.SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || ''
}

function value(name) {
  return env[name] || ''
}

function has(name) {
  return !isPlaceholder(value(name))
}

function firstUsable(names) {
  const name = names.find(has)
  return name ? value(name) : ''
}

const requiredEnvGroups = [
  {
    id: 'supabase:url',
    label: 'Supabase public URL',
    names: ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL'],
  },
  {
    id: 'supabase:anon',
    label: 'Supabase anon key',
    names: ['SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'],
  },
  {
    id: 'admin:email',
    label: 'Admin email',
    names: ['ADMIN_EMAIL'],
  },
  {
    id: 'admin:password',
    label: 'Admin password',
    names: ['ADMIN_PASSWORD'],
  },
]

const envStatus = requiredEnvGroups.map((group) => ({
  id: group.id,
  label: group.label,
  ok: group.names.some(has),
  acceptedNames: group.names,
}))
const missingEnv = envStatus.filter((group) => !group.ok)

const explicitPackageId = firstUsable(['QA_BLOCK4_PACKAGE_ID', 'TEST_PACKAGE_ID', 'PACKAGE_ID'])
const explicitPropertyId = firstUsable(['QA_BLOCK4_PROPERTY_ID', 'TEST_PROPERTY_ID', 'PROPERTY_ID'])
const explicitExperienceId = firstUsable(['QA_BLOCK4_EXPERIENCE_ID', 'TEST_EXPERIENCE_ID', 'EXPERIENCE_BLOCK_ID'])
const explicitLocalPlaceId = firstUsable(['QA_BLOCK4_LOCAL_PLACE_ID', 'TEST_LOCAL_PLACE_ID', 'LOCAL_PLACE_ID'])
const explicitEventId = firstUsable(['QA_BLOCK4_EVENT_ID', 'TEST_EVENT_ID', 'EVENT_PLACE_ID'])

const optionalSelectors = {
  packageId: {
    acceptedNames: ['QA_BLOCK4_PACKAGE_ID', 'TEST_PACKAGE_ID', 'PACKAGE_ID'],
    configured: Boolean(explicitPackageId),
  },
  propertyId: {
    acceptedNames: ['QA_BLOCK4_PROPERTY_ID', 'TEST_PROPERTY_ID', 'PROPERTY_ID'],
    configured: Boolean(explicitPropertyId),
  },
  experienceId: {
    acceptedNames: ['QA_BLOCK4_EXPERIENCE_ID', 'TEST_EXPERIENCE_ID', 'EXPERIENCE_BLOCK_ID'],
    configured: Boolean(explicitExperienceId),
  },
  localPlaceId: {
    acceptedNames: ['QA_BLOCK4_LOCAL_PLACE_ID', 'TEST_LOCAL_PLACE_ID', 'LOCAL_PLACE_ID'],
    configured: Boolean(explicitLocalPlaceId),
  },
  eventId: {
    acceptedNames: ['QA_BLOCK4_EVENT_ID', 'TEST_EVENT_ID', 'EVENT_PLACE_ID'],
    configured: Boolean(explicitEventId),
  },
}

function payloadObject(row) {
  return row?.payload && typeof row.payload === 'object' ? row.payload : {}
}

function textValue(...values) {
  for (const raw of values) {
    if (typeof raw === 'string' && raw.trim()) return raw.trim()
    if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw)
    if (typeof raw === 'boolean') return raw ? 'true' : 'false'
  }
  return ''
}

function arrayValue(...values) {
  for (const raw of values) {
    if (Array.isArray(raw) && raw.length > 0) return raw
  }
  return []
}

function pass(id, label, evidence, target) {
  return { id, label, ok: true, evidence, evidenceTarget: target }
}

function fail(id, label, summary, target) {
  return { id, label, ok: false, summary, evidenceTarget: target }
}

function buildMissingEnvOutput() {
  return {
    ok: false,
    purpose: 'Prepare admin parity Block 4 evidence: Bestand Und Operationsdaten.',
    checkedEnvSources: {
      shell: true,
      envLocal: qaEnv.envLocalExists,
    },
    requiredEnv: envStatus,
    optionalSelectors,
    counts: {
      checks: 0,
      passed: 0,
      blockers: missingEnv.length,
    },
    blockers: missingEnv.map((group) => ({
      id: group.id,
      label: group.label,
      acceptedNames: group.acceptedNames,
    })),
    nextActions: [
      {
        id: 'set-admin-test-login',
        label: 'Set current admin QA credentials locally',
        detail: 'Block 4 reads inventory and operations data through the same signed-in admin path that must be accepted in Block 1.',
        requiredEnv: ['ADMIN_EMAIL', 'ADMIN_PASSWORD'],
        verifyWith: 'npm run qa:admin-parity:block4',
      },
      {
        id: 'select-current-operations-records',
        label: 'Select current operations records for Block 4',
        detail: 'Use an Auszeit with linked Unterkunft, Termin, Erlebnisbaustein, approved local place and event candidate/approval.',
        optionalEnv: [
          'QA_BLOCK4_PACKAGE_ID',
          'QA_BLOCK4_PROPERTY_ID',
          'QA_BLOCK4_EXPERIENCE_ID',
          'QA_BLOCK4_LOCAL_PLACE_ID',
          'QA_BLOCK4_EVENT_ID',
        ],
      },
      {
        id: 'rerun-status',
        label: 'Rerun the admin parity status report',
        verifyWith: 'npm run qa:admin-parity:status',
      },
    ],
  }
}

async function selectMaybeSingle(client, table, select, column, id) {
  if (!id) return null
  const { data, error } = await client
    .from(table)
    .select(select)
    .eq(column, id)
    .maybeSingle()

  if (error) throw error
  return data
}

async function readPackages(client) {
  if (explicitPackageId) {
    const record = await selectMaybeSingle(
      client,
      'packages',
      'id,slug,name,audience,location,status,property_id,price_from,concrete_price,payload,created_at,updated_at',
      'id',
      explicitPackageId,
    )
    return record ? [record] : []
  }

  const { data, error } = await client
    .from('packages')
    .select('id,slug,name,audience,location,status,property_id,price_from,concrete_price,payload,created_at,updated_at')
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data ?? []
}

async function readPackageDates(client, packageIds) {
  if (packageIds.length === 0) return []
  const { data, error } = await client
    .from('package_dates')
    .select('id,package_id,label,starts_on,ends_on,capacity,status,payload,created_at,updated_at')
    .in('package_id', packageIds)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return data ?? []
}

async function readProperties(client, propertyIds) {
  const explicitIds = [explicitPropertyId, ...propertyIds].filter(Boolean)
  if (explicitIds.length === 0) return []

  const { data, error } = await client
    .from('properties')
    .select('id,name,location,sleeps,bedrooms,bathrooms,check_in_type,support_type,support_name,image_rights_confirmed,status,payload,created_at,updated_at')
    .in('id', [...new Set(explicitIds)])

  if (error) throw error
  return data ?? []
}

async function readExperiences(client, packageIds) {
  if (explicitExperienceId) {
    const record = await selectMaybeSingle(
      client,
      'experience_blocks',
      'id,package_id,provider_id,title,role,included_in_price,confirmation_status,payload,created_at,updated_at',
      'id',
      explicitExperienceId,
    )
    return record ? [record] : []
  }

  if (packageIds.length === 0) return []
  const { data, error } = await client
    .from('experience_blocks')
    .select('id,package_id,provider_id,title,role,included_in_price,confirmation_status,payload,created_at,updated_at')
    .in('package_id', packageIds)
    .order('updated_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return data ?? []
}

async function readLocalPlaces(client) {
  if (explicitLocalPlaceId) {
    const record = await selectMaybeSingle(
      client,
      'local_places',
      'id,name,category,status,lat,lng,address,website,reservation_url,menu_url,rating,opening_hours,package_fit,payload,created_at,updated_at',
      'id',
      explicitLocalPlaceId,
    )
    return record ? [record] : []
  }

  const { data, error } = await client
    .from('local_places')
    .select('id,name,category,status,lat,lng,address,website,reservation_url,menu_url,rating,opening_hours,package_fit,payload,created_at,updated_at')
    .neq('category', 'event')
    .order('updated_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return data ?? []
}

async function readEvents(client) {
  if (explicitEventId) {
    const record = await selectMaybeSingle(
      client,
      'local_places',
      'id,name,category,status,lat,lng,address,website,reservation_url,menu_url,rating,opening_hours,package_fit,payload,created_at,updated_at',
      'id',
      explicitEventId,
    )
    return record ? [record] : []
  }

  const { data, error } = await client
    .from('local_places')
    .select('id,name,category,status,lat,lng,address,website,reservation_url,menu_url,rating,opening_hours,package_fit,payload,created_at,updated_at')
    .eq('category', 'event')
    .order('updated_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return data ?? []
}

async function readAuditLogs(client, records) {
  const filters = records
    .filter((record) => record.entityType && record.entityId)
    .map((record) => `and(entity_type.eq.${record.entityType},entity_id.eq.${record.entityId})`)

  if (filters.length === 0) return []

  const { data, error } = await client
    .from('admin_audit_logs')
    .select('id,actor_email,action,entity_type,entity_id,entity_label,created_at,payload')
    .or(filters.join(','))
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data ?? []
}

function scorePackage(pkg, dates, experiences) {
  let score = 0
  if (pkg.property_id) score += 3
  if (dates.some((date) => date.package_id === pkg.id)) score += 3
  if (experiences.some((experience) => experience.package_id === pkg.id)) score += 3
  if (pkg.status && pkg.status !== 'draft') score += 1
  if (pkg.concrete_price || pkg.price_from) score += 1
  return score
}

function pickPackage(packages, dates, experiences) {
  if (explicitPackageId) return packages.find((pkg) => pkg.id === explicitPackageId) ?? null
  return [...packages].sort((a, b) => scorePackage(b, dates, experiences) - scorePackage(a, dates, experiences))[0] ?? null
}

function buildPackageResult(pkg, packageDates) {
  if (!pkg) {
    return fail(
      'package-record',
      'Auszeit record is available and structured',
      'No package record found for Block 4. Create or select a current Auszeit in Admin/Supabase.',
      'Runbook gate 15 Auszeit pflegen',
    )
  }

  const payload = payloadObject(pkg)
  const missing = []
  if (!pkg.slug) missing.push('slug')
  if (!pkg.name) missing.push('name')
  if (!pkg.audience) missing.push('audience')
  if (!pkg.location) missing.push('location')
  if (!pkg.status) missing.push('status')
  if (!textValue(pkg.concrete_price, pkg.price_from, payload.price, payload.priceLabel)) missing.push('price')
  if (packageDates.length === 0) missing.push('package_dates')

  if (missing.length > 0) {
    return fail(
      'package-record',
      'Auszeit record is available and structured',
      `Package ${pkg.id} is missing required operating fields: ${missing.join(', ')}.`,
      'Runbook gate 15 Auszeit pflegen',
    )
  }

  return pass(
    'package-record',
    'Auszeit record is available and structured',
    {
      id: pkg.id,
      slug: pkg.slug,
      name: pkg.name,
      audience: pkg.audience,
      status: pkg.status,
      propertyId: pkg.property_id,
      dateCount: packageDates.length,
    },
    'Runbook gate 15 Auszeit pflegen',
  )
}

function buildDateResult(pkg, packageDates) {
  const usableDate = packageDates.find((date) => date.package_id === pkg?.id && date.label && date.starts_on && date.ends_on && date.status)

  if (!usableDate) {
    return fail(
      'package-date',
      'Auszeit has a concrete date window',
      'No package_date with label, starts_on, ends_on and status was found for the selected Auszeit.',
      'Runbook gate 15 Auszeit pflegen',
    )
  }

  return pass(
    'package-date',
    'Auszeit has a concrete date window',
    {
      id: usableDate.id,
      packageId: usableDate.package_id,
      label: usableDate.label,
      startsOn: usableDate.starts_on,
      endsOn: usableDate.ends_on,
      status: usableDate.status,
      capacity: usableDate.capacity,
    },
    'Runbook gate 15 Auszeit pflegen',
  )
}

function buildPropertyResult(pkg, properties) {
  const property = explicitPropertyId
    ? properties.find((item) => item.id === explicitPropertyId)
    : properties.find((item) => item.id === pkg?.property_id)

  if (!property) {
    return fail(
      'property-linked',
      'Linked Unterkunft is structured for guest operations',
      'No linked property found. The selected Auszeit must reference a Unterkunft or QA_BLOCK4_PROPERTY_ID must point to one.',
      'Runbook gate 16 Unterkunft pflegen',
    )
  }

  const payload = payloadObject(property)
  const amenities = arrayValue(payload.amenities, payload.features, payload.attributes)
  const media = arrayValue(payload.media, payload.images, payload.gallery)
  const rules = arrayValue(payload.houseRules, payload.house_rules, payload.rules)
  const checkInInstruction = textValue(
    property.check_in_type,
    payload.checkInType,
    payload.check_in_type,
    payload.checkInInstructions,
    payload.check_in_instructions,
  )
  const responsibility = textValue(property.support_type, property.support_name, payload.supportType, payload.supportName)
  const arrival = textValue(payload.earliestArrival, payload.latestArrival, payload.earliest_arrival, payload.latest_arrival)

  const missing = []
  if (!property.name) missing.push('name')
  if (!property.location) missing.push('location')
  if (!checkInInstruction) missing.push('check_in')
  if (!responsibility) missing.push('support_responsibility')
  if (!property.image_rights_confirmed) missing.push('image_rights_confirmed')
  if (media.length === 0) missing.push('media')
  if (amenities.length === 0) missing.push('amenities')
  if (rules.length === 0) missing.push('rules')
  if (!arrival) missing.push('arrival_window')

  if (missing.length > 0) {
    return fail(
      'property-linked',
      'Linked Unterkunft is structured for guest operations',
      `Property ${property.id} is missing operating fields: ${missing.join(', ')}.`,
      'Runbook gate 16 Unterkunft pflegen',
    )
  }

  return pass(
    'property-linked',
    'Linked Unterkunft is structured for guest operations',
    {
      id: property.id,
      name: property.name,
      status: property.status,
      sleeps: property.sleeps,
      checkInType: property.check_in_type ?? payload.checkInType ?? payload.check_in_type,
      supportType: property.support_type ?? payload.supportType,
      mediaCount: media.length,
      amenitiesCount: amenities.length,
      rulesCount: rules.length,
    },
    'Runbook gate 16 Unterkunft pflegen',
  )
}

function buildExperienceResult(pkg, experiences) {
  const experience = explicitExperienceId
    ? experiences.find((item) => item.id === explicitExperienceId)
    : experiences.find((item) => item.package_id === pkg?.id)

  if (!experience) {
    return fail(
      'experience-block-linked',
      'Erlebnisbaustein is linked to Auszeit and provider logic',
      'No experience block found for the selected Auszeit.',
      'Runbook gate 17 Erlebnisbaustein pflegen',
    )
  }

  const payload = payloadObject(experience)
  const provider = textValue(experience.provider_id, payload.providerId, payload.provider_id, payload.providerName, payload.provider_name)
  const price = textValue(payload.price, payload.priceNote, payload.price_note, payload.cost, experience.included_in_price)
  const capacity = textValue(payload.capacity, payload.capacityNote, payload.capacity_note, payload.maxGuests, payload.max_guests)
  const availability = textValue(payload.availability, payload.availabilityNote, payload.availability_note, payload.availableDates)

  const missing = []
  if (!experience.title) missing.push('title')
  if (!provider) missing.push('provider')
  if (!experience.package_id) missing.push('package_id')
  if (!price) missing.push('price_or_included_flag')
  if (!capacity) missing.push('capacity')
  if (!availability) missing.push('availability')
  if (!experience.confirmation_status) missing.push('confirmation_status')

  if (missing.length > 0) {
    return fail(
      'experience-block-linked',
      'Erlebnisbaustein is linked to Auszeit and provider logic',
      `Experience block ${experience.id} is missing operating fields: ${missing.join(', ')}.`,
      'Runbook gate 17 Erlebnisbaustein pflegen',
    )
  }

  return pass(
    'experience-block-linked',
    'Erlebnisbaustein is linked to Auszeit and provider logic',
    {
      id: experience.id,
      packageId: experience.package_id,
      providerId: experience.provider_id,
      title: experience.title,
      role: experience.role,
      includedInPrice: experience.included_in_price,
      confirmationStatus: experience.confirmation_status,
    },
    'Runbook gate 17 Erlebnisbaustein pflegen',
  )
}

function buildLocalPlaceResult(localPlaces) {
  const approvedPlace = localPlaces.find((place) => place.status === 'approved' && place.lat && place.lng) ?? localPlaces.find((place) => place.lat && place.lng)

  if (!approvedPlace) {
    return fail(
      'approved-local-place',
      'Approved Vor-Ort-Ort is ready for guest map',
      'No approved or coordinate-ready local place found outside events.',
      'Runbook gate 18 Vor-Ort-Ort freigeben',
    )
  }

  const payload = payloadObject(approvedPlace)
  const description = textValue(payload.description, payload.shortDescription, payload.summary, payload.note)
  const guestValue = textValue(description, approvedPlace.website, approvedPlace.reservation_url, approvedPlace.menu_url)

  const missing = []
  if (approvedPlace.status !== 'approved') missing.push('approved_status')
  if (!approvedPlace.name) missing.push('name')
  if (!approvedPlace.category) missing.push('category')
  if (!approvedPlace.lat || !approvedPlace.lng) missing.push('coordinates')
  if (!guestValue) missing.push('guest_value')

  if (missing.length > 0) {
    return fail(
      'approved-local-place',
      'Approved Vor-Ort-Ort is ready for guest map',
      `Local place ${approvedPlace.id} is missing guest-map fields: ${missing.join(', ')}.`,
      'Runbook gate 18 Vor-Ort-Ort freigeben',
    )
  }

  return pass(
    'approved-local-place',
    'Approved Vor-Ort-Ort is ready for guest map',
    {
      id: approvedPlace.id,
      name: approvedPlace.name,
      category: approvedPlace.category,
      status: approvedPlace.status,
      hasCoordinates: Boolean(approvedPlace.lat && approvedPlace.lng),
      hasWebsite: Boolean(approvedPlace.website),
      hasReservationUrl: Boolean(approvedPlace.reservation_url),
      packageFit: approvedPlace.package_fit,
    },
    'Runbook gate 18 Vor-Ort-Ort freigeben',
  )
}

function buildEventResult(events) {
  const event = events.find((item) => item.status === 'approved') ?? events[0]

  if (!event) {
    return fail(
      'event-place',
      'Event is separated from bookable Erlebnis logic',
      'No event category record found in local_places.',
      'Runbook gate 19 Veranstaltung prüfen',
    )
  }

  const payload = payloadObject(event)
  const date = textValue(payload.eventDate, payload.event_date, payload.date, payload.startsAt, payload.starts_at)
  const audience = textValue(payload.eventAudience, payload.event_audience, payload.audience, payload.bestFor)
  const curationKind = textValue(payload.curationKind, payload.curation_kind)

  const missing = []
  if (event.category !== 'event') missing.push('category_event')
  if (!event.name) missing.push('name')
  if (!date) missing.push('event_date')
  if (!audience) missing.push('audience')
  if (curationKind === 'bookable-experience') missing.push('not_bookable_experience')

  if (missing.length > 0) {
    return fail(
      'event-place',
      'Event is separated from bookable Erlebnis logic',
      `Event ${event.id} is missing event curation fields: ${missing.join(', ')}.`,
      'Runbook gate 19 Veranstaltung prüfen',
    )
  }

  return pass(
    'event-place',
    'Event is separated from bookable Erlebnis logic',
    {
      id: event.id,
      name: event.name,
      status: event.status,
      category: event.category,
      eventDate: date,
      audience,
      curationKind: curationKind || null,
    },
    'Runbook gate 19 Veranstaltung prüfen',
  )
}

function buildAuditResult(auditLogs, records) {
  if (auditLogs.length === 0) {
    return fail(
      'operations-audit-log',
      'Operations changes are audit-visible',
      'No admin_audit_logs entries found for the selected package/property/experience/place/event records.',
      'Runbook gate 23 Audit-Log',
    )
  }

  return pass(
    'operations-audit-log',
    'Operations changes are audit-visible',
    {
      count: auditLogs.length,
      latest: auditLogs.slice(0, 5).map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entity_type,
        entityId: log.entity_id,
        createdAt: log.created_at,
      })),
      checkedRecords: records,
    },
    'Runbook gate 23 Audit-Log',
  )
}

async function main() {
  if (missingEnv.length > 0) return buildMissingEnvOutput()

  const client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const signIn = await client.auth.signInWithPassword({
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
  })

  if (signIn.error) {
    return {
      ok: false,
      purpose: 'Prepare admin parity Block 4 evidence: Bestand Und Operationsdaten.',
      requiredEnv: envStatus,
      optionalSelectors,
      counts: { checks: 1, passed: 0, blockers: 1 },
      results: [
        fail('admin-login', 'Admin login for Block 4 read checks', 'Admin login failed. Complete Block 1 first.', 'Runbook gate 1 Admin-Login'),
      ],
      blockers: [
        {
          id: 'admin-login',
          evidenceTarget: 'Runbook gate 1 Admin-Login',
          summary: 'Admin login failed. Complete Block 1 first.',
        },
      ],
      nextActions: [
        {
          id: 'complete-block1',
          label: 'Complete Block 1 before Block 4',
          verifyWith: 'npm run qa:admin-parity:block1',
        },
      ],
    }
  }

  const packages = await readPackages(client)
  const packageIds = packages.map((pkg) => pkg.id)
  const [packageDates, experiences, localPlaces, events] = await Promise.all([
    readPackageDates(client, packageIds),
    readExperiences(client, packageIds),
    readLocalPlaces(client),
    readEvents(client),
  ])
  const pkg = pickPackage(packages, packageDates, experiences)
  const propertyIds = packages.map((item) => item.property_id).filter(Boolean)
  const properties = await readProperties(client, propertyIds)

  const selectedPackageDates = packageDates.filter((date) => date.package_id === pkg?.id)
  const selectedExperience = explicitExperienceId
    ? experiences.find((item) => item.id === explicitExperienceId)
    : experiences.find((item) => item.package_id === pkg?.id)
  const selectedProperty = explicitPropertyId
    ? properties.find((item) => item.id === explicitPropertyId)
    : properties.find((item) => item.id === pkg?.property_id)
  const selectedLocalPlace = localPlaces.find((place) => place.status === 'approved' && place.lat && place.lng) ?? localPlaces.find((place) => place.lat && place.lng)
  const selectedEvent = events.find((item) => item.status === 'approved') ?? events[0]
  const auditTargets = [
    { entityType: 'package', entityId: pkg?.id },
    { entityType: 'packages', entityId: pkg?.id },
    { entityType: 'property', entityId: selectedProperty?.id },
    { entityType: 'properties', entityId: selectedProperty?.id },
    { entityType: 'experience_block', entityId: selectedExperience?.id },
    { entityType: 'experience_blocks', entityId: selectedExperience?.id },
    { entityType: 'local_place', entityId: selectedLocalPlace?.id },
    { entityType: 'local_places', entityId: selectedLocalPlace?.id },
    { entityType: 'event', entityId: selectedEvent?.id },
    { entityType: 'events', entityId: selectedEvent?.id },
  ].filter((record) => record.entityId)
  const auditLogs = await readAuditLogs(client, auditTargets)

  const results = [
    buildPackageResult(pkg, selectedPackageDates),
    buildDateResult(pkg, selectedPackageDates),
    buildPropertyResult(pkg, properties),
    buildExperienceResult(pkg, experiences),
    buildLocalPlaceResult(localPlaces),
    buildEventResult(events),
    buildAuditResult(auditLogs, auditTargets),
  ]
  const blockers = results.filter((result) => !result.ok)

  return {
    ok: blockers.length === 0,
    purpose: 'Prepare admin parity Block 4 evidence: Bestand Und Operationsdaten.',
    requiredEnv: envStatus,
    optionalSelectors,
    selectedRecords: {
      packageId: pkg?.id ?? null,
      propertyId: selectedProperty?.id ?? null,
      experienceId: selectedExperience?.id ?? null,
      localPlaceId: selectedLocalPlace?.id ?? null,
      eventId: selectedEvent?.id ?? null,
    },
    counts: {
      checks: results.length,
      passed: results.filter((result) => result.ok).length,
      blockers: blockers.length,
      packages: packages.length,
      packageDates: selectedPackageDates.length,
      properties: properties.length,
      experiences: experiences.length,
      localPlaces: localPlaces.length,
      events: events.length,
      auditLogs: auditLogs.length,
    },
    results,
    blockers: blockers.map((result) => ({
      id: result.id,
      label: result.label,
      evidenceTarget: result.evidenceTarget,
      summary: result.summary,
    })),
    nextActions: blockers.length > 0
      ? [
          {
            id: 'complete-block4-data',
            label: 'Complete missing inventory and operations fields in Admin/Supabase',
            detail: 'Use the blocker summaries to fill the selected Auszeit, Unterkunft, Erlebnisbaustein, Vor-Ort-Ort, Veranstaltung and Audit evidence.',
            verifyWith: 'npm run qa:admin-parity:block4',
          },
          {
            id: 'capture-manual-evidence',
            label: 'Capture screenshots and Supabase IDs in the admin parity run table',
            detail: 'This script is only a read check. Manual evidence in docs/qa/admin-parity is still required.',
            verifyWith: 'npm run qa:admin-parity:status',
          },
        ]
      : [
          {
            id: 'capture-manual-evidence',
            label: 'Capture the passing IDs, screenshots and audit rows in the admin parity run table',
            verifyWith: 'npm run qa:admin-parity:status',
          },
        ],
  }
}

main()
  .then((output) => {
    console.log(JSON.stringify(output, null, 2))
    if (!output.ok) process.exitCode = 1
  })
  .catch((error) => {
    console.error(JSON.stringify({
      ok: false,
      purpose: 'Prepare admin parity Block 4 evidence: Bestand Und Operationsdaten.',
      error: error.message,
    }, null, 2))
    process.exitCode = 1
  })
