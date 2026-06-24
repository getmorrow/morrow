import { isSupabaseConfigured, supabase } from './supabase'
import type { LocalPlaceCandidate } from '../data/localPlaces'

type StoredEntity = { id: string }

export type AdminProfile = {
  email: string
  role: string
  status: string
  name?: string | null
}

export type BackendSaveResult = {
  ok: boolean
  source: 'supabase' | 'local'
  error?: string
}

const emailAutomationEnabled = import.meta.env.VITE_ENABLE_EMAIL_AUTOMATION === 'true'

const leadsTable = 'leads'
const supportMessagesTable = 'support_messages'
const adminTasksTable = 'admin_tasks'
const customersTable = 'customers'
const bookingsTable = 'bookings'
const packagesTable = 'packages'
const packageDatesTable = 'package_dates'
const propertiesTable = 'properties'
const emailEventsTable = 'email_events'
const communicationEventsTable = 'communication_events'
const guestFeedbackTable = 'guest_feedback'
const localPlacesTable = 'local_places'
const experienceProvidersTable = 'experience_providers'
const experienceBlocksTable = 'experience_blocks'
const agenciesTable = 'agencies'
const adminAuditLogsTable = 'admin_audit_logs'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const isUuid = (value: unknown): value is string => typeof value === 'string' && uuidPattern.test(value)

export type AdminAuditLogInput = {
  actorEmail?: string | null
  action: string
  entityType: string
  entityId: string
  entityLabel?: string | null
  payload?: Record<string, unknown>
}

export async function createAdminAuditLog(event: AdminAuditLogInput): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }

  const { error } = await supabase
    .from(adminAuditLogsTable)
    .insert({
      actor_email: event.actorEmail ?? null,
      action: event.action,
      entity_type: event.entityType,
      entity_id: event.entityId,
      entity_label: event.entityLabel ?? null,
      payload: event.payload ?? {},
    })

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function fetchStoredLeads<T extends StoredEntity>() {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from(leadsTable)
    .select('payload')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? [])
    .map((row) => row.payload)
    .filter(Boolean) as T[]
}

export async function fetchAdminProfile() {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase.rpc('get_morrow_admin_profile')
  if (error) throw error

  return data as AdminProfile | null
}

export async function fetchStoredEmailEvents<T>(leadIds: string[] = []) {
  if (!isSupabaseConfigured || !supabase) return null

  let query = supabase
    .from(emailEventsTable)
    .select('id, lead_id, event_type, recipient, status, error_message, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (leadIds.length > 0) query = query.in('lead_id', leadIds)

  const { data, error } = await query
  if (error) throw error

  return (data ?? []) as T[]
}

export async function fetchStoredCommunicationEvents<T>(leadIds: string[] = []) {
  if (!isSupabaseConfigured || !supabase) return null

  let query = supabase
    .from(communicationEventsTable)
    .select('id, lead_id, booking_id, customer_id, channel, direction, event_type, subject, body, recipient, actor, status, provider, provider_message_id, payload, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(300)

  if (leadIds.length > 0) query = query.in('lead_id', leadIds)

  const { data, error } = await query
  if (error) throw error

  return (data ?? []) as T[]
}

export async function fetchAdminAuditLogs<T>(limit = 120) {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from(adminAuditLogsTable)
    .select('id, actor_email, action, entity_type, entity_id, entity_label, payload, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []) as T[]
}

export async function createStoredCommunicationEvent<T extends StoredEntity>(
  event: T,
): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }
  const payload = event as Record<string, unknown>

  const { error } = await supabase
    .from(communicationEventsTable)
    .insert({
      id: event.id,
      lead_id: isUuid(payload.leadId) ? payload.leadId : null,
      booking_id: isUuid(payload.bookingId) ? payload.bookingId : null,
      customer_id: isUuid(payload.customerId) ? payload.customerId : null,
      channel: typeof payload.channel === 'string' ? payload.channel : 'note',
      direction: typeof payload.direction === 'string' ? payload.direction : 'internal',
      event_type: typeof payload.eventType === 'string' ? payload.eventType : 'note',
      subject: typeof payload.subject === 'string' ? payload.subject : null,
      body: typeof payload.body === 'string' ? payload.body : null,
      recipient: typeof payload.recipient === 'string' ? payload.recipient : null,
      actor: typeof payload.actor === 'string' ? payload.actor : null,
      status: typeof payload.status === 'string' ? payload.status : 'recorded',
      provider: typeof payload.provider === 'string' ? payload.provider : null,
      provider_message_id: typeof payload.providerMessageId === 'string' ? payload.providerMessageId : null,
      payload: event,
    })

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function upsertStoredLead<T extends StoredEntity>(lead: T): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }
  const payload = lead as Record<string, unknown>

  const { error } = await supabase
    .from(leadsTable)
    .insert({
      id: lead.id,
      type: String(payload.type ?? 'unknown'),
      status: String(payload.status ?? 'Neu'),
      email: typeof payload.email === 'string' ? payload.email : null,
      phone: typeof payload.phone === 'string' ? payload.phone : null,
      name: typeof payload.name === 'string' ? payload.name : null,
      package_slug: typeof payload.packageSlug === 'string' ? payload.packageSlug : null,
      payload: lead,
      updated_at: new Date().toISOString(),
    })

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function sendLeadNotification<T extends StoredEntity>(lead: T): Promise<BackendSaveResult> {
  if (!emailAutomationEnabled || !isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }

  const { error } = await supabase.functions.invoke('lead-notification', {
    body: { lead },
  })

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function sendBookingStatusEmail<T extends StoredEntity>(
  lead: T,
  status: string,
  packageItem: unknown,
  baseUrl: string,
): Promise<BackendSaveResult> {
  if (!emailAutomationEnabled || !isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }

  const { error } = await supabase.functions.invoke('booking-status-email', {
    body: { lead, status, packageItem, baseUrl },
  })

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function updateStoredLead<T extends StoredEntity>(lead: T): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }
  const payload = lead as Record<string, unknown>

  const { error } = await supabase
    .from(leadsTable)
    .update({
      status: String(payload.status ?? 'Neu'),
      email: typeof payload.email === 'string' ? payload.email : null,
      phone: typeof payload.phone === 'string' ? payload.phone : null,
      name: typeof payload.name === 'string' ? payload.name : null,
      package_slug: typeof payload.packageSlug === 'string' ? payload.packageSlug : null,
      archived_at: typeof payload.archivedAt === 'string' ? payload.archivedAt : null,
      source: typeof payload.source === 'string' ? payload.source : null,
      campaign: typeof payload.campaign === 'string' ? payload.campaign : null,
      payload: lead,
      updated_at: new Date().toISOString(),
    })
    .eq('id', lead.id)

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function deleteStoredLead(id: string): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }

  const { error } = await supabase
    .from(leadsTable)
    .delete()
    .eq('id', id)

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function createStoredSupportMessage<T extends StoredEntity>(
  message: T,
): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }
  const payload = message as Record<string, unknown>

  const { error } = await supabase
    .from(supportMessagesTable)
    .insert({
      id: message.id,
      lead_id: typeof payload.leadId === 'string' ? payload.leadId : null,
      category: typeof payload.category === 'string' ? payload.category : 'general',
      message: typeof payload.message === 'string' ? payload.message : '',
      payload: message,
    })

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function createStoredGuestFeedback<T extends StoredEntity>(
  feedback: T,
): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }
  const payload = feedback as Record<string, unknown>

  const { error } = await supabase
    .from(guestFeedbackTable)
    .insert({
      id: feedback.id,
      lead_id: isUuid(payload.leadId) ? payload.leadId : null,
      booking_id: isUuid(payload.bookingId) ? payload.bookingId : null,
      rating: typeof payload.rating === 'number' ? payload.rating : null,
      return_interest: typeof payload.returnInterest === 'string' ? payload.returnInterest : null,
      payload: feedback,
    })

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function fetchStoredAdminTasks<T extends StoredEntity>() {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from(adminTasksTable)
    .select('payload')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? [])
    .map((row) => row.payload)
    .filter(Boolean) as T[]
}

export async function upsertStoredAdminTask<T extends StoredEntity>(task: T): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }
  const payload = task as Record<string, unknown>

  const { error } = await supabase
    .from(adminTasksTable)
    .upsert({
      id: task.id,
      title: typeof payload.title === 'string' ? payload.title : 'Aufgabe',
      reference_type: typeof payload.referenceType === 'string' ? payload.referenceType : 'lead',
      reference_id: typeof payload.referenceId === 'string' ? payload.referenceId : '',
      reference_label: typeof payload.referenceLabel === 'string' ? payload.referenceLabel : null,
      due_at: typeof payload.dueAt === 'string' && payload.dueAt ? payload.dueAt : null,
      status: typeof payload.status === 'string' ? payload.status : 'open',
      priority: typeof payload.priority === 'string' ? payload.priority : 'medium',
      note: typeof payload.note === 'string' ? payload.note : null,
      payload: task,
      updated_at: new Date().toISOString(),
    })

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function deleteStoredAdminTask(id: string): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }

  const { error } = await supabase
    .from(adminTasksTable)
    .delete()
    .eq('id', id)

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function fetchStoredCustomers<T extends StoredEntity>() {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from(customersTable)
    .select('payload')
    .order('updated_at', { ascending: false })

  if (error) throw error

  return (data ?? [])
    .map((row) => row.payload)
    .filter(Boolean) as T[]
}

export async function upsertStoredCustomer<T extends StoredEntity>(customer: T): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }
  if (!isUuid(customer.id)) return { ok: true, source: 'local' }
  const payload = customer as Record<string, unknown>

  const { error } = await supabase
    .from(customersTable)
    .upsert({
      id: customer.id,
      primary_lead_id: isUuid(payload.primaryLeadId) ? payload.primaryLeadId : null,
      name: typeof payload.name === 'string' ? payload.name : 'Gast',
      email: typeof payload.email === 'string' ? payload.email : null,
      phone: typeof payload.phone === 'string' ? payload.phone : null,
      customer_type: typeof payload.customerType === 'string' ? payload.customerType : 'guest',
      notes: typeof payload.notes === 'string' ? payload.notes : null,
      payload: customer,
      updated_at: new Date().toISOString(),
    })

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function fetchStoredBookings<T extends StoredEntity>() {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from(bookingsTable)
    .select('payload')
    .order('updated_at', { ascending: false })

  if (error) throw error

  return (data ?? [])
    .map((row) => row.payload)
    .filter(Boolean) as T[]
}

export async function upsertStoredBooking<T extends StoredEntity>(booking: T): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }
  if (!isUuid(booking.id)) return { ok: true, source: 'local' }
  const payload = booking as Record<string, unknown>

  const { error } = await supabase
    .from(bookingsTable)
    .upsert({
      id: booking.id,
      lead_id: isUuid(payload.leadId) ? payload.leadId : null,
      customer_id: isUuid(payload.customerId) ? payload.customerId : null,
      package_id: typeof payload.packageId === 'string' ? payload.packageId : null,
      status: typeof payload.status === 'string' ? payload.status : 'Reserviert',
      payment_status: typeof payload.paymentStatus === 'string' ? payload.paymentStatus : 'offen',
      guest_access_code: typeof payload.guestAccessCode === 'string' ? payload.guestAccessCode : null,
      payload: booking,
      updated_at: new Date().toISOString(),
    })

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function fetchStoredPackages<T extends StoredEntity>() {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from(packagesTable)
    .select('payload')
    .order('updated_at', { ascending: false })

  if (error) throw error

  return (data ?? [])
    .map((row) => row.payload)
    .filter(Boolean) as T[]
}

export async function upsertStoredPackage<T extends StoredEntity>(packageItem: T): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }
  const payload = packageItem as Record<string, unknown>
  const stay = payload.stay as Record<string, unknown> | undefined
  const stayId = typeof payload.propertyId === 'string'
    ? payload.propertyId
    : typeof stay?.id === 'string'
      ? stay.id
      : null

  if (stay && stayId) {
    const { error: propertyError } = await supabase
      .from(propertiesTable)
      .upsert({
        id: stayId,
        name: typeof stay.name === 'string' ? stay.name : 'Unterkunft',
        location: typeof payload.location === 'string' ? payload.location : '',
        sleeps: typeof stay.sleeps === 'number' ? stay.sleeps : null,
        bedrooms: typeof stay.bedrooms === 'number' ? stay.bedrooms : null,
        bathrooms: typeof stay.bathrooms === 'number' ? stay.bathrooms : null,
        check_in_type: typeof stay.checkInType === 'string' ? stay.checkInType : null,
        support_type: typeof stay.propertySupportType === 'string' ? stay.propertySupportType : null,
        support_name: typeof stay.propertySupportName === 'string' ? stay.propertySupportName : null,
        image_rights_confirmed: typeof stay.imageRightsConfirmed === 'boolean' ? stay.imageRightsConfirmed : false,
        status: 'active',
        payload: stay,
        updated_at: new Date().toISOString(),
      })

    if (propertyError) return { ok: false, source: 'supabase', error: propertyError.message }
  }

  const { error: packageError } = await supabase
    .from(packagesTable)
    .upsert({
      id: packageItem.id,
      slug: typeof payload.slug === 'string' ? payload.slug : packageItem.id,
      name: typeof payload.name === 'string' ? payload.name : 'Auszeit',
      audience: typeof payload.audience === 'string' ? payload.audience : 'families',
      location: typeof payload.location === 'string' ? payload.location : '',
      status: typeof payload.status === 'string' ? payload.status : 'draft',
      property_id: stayId,
      price_from: typeof payload.priceFrom === 'string' ? payload.priceFrom : null,
      concrete_price: typeof payload.concretePrice === 'string' ? payload.concretePrice : null,
      payload: packageItem,
      updated_at: new Date().toISOString(),
    })

  if (packageError) return { ok: false, source: 'supabase', error: packageError.message }

  const dates = Array.isArray(payload.dates) ? payload.dates.filter((date): date is string => typeof date === 'string') : []
  if (dates.length > 0) {
    const { error: deleteDatesError } = await supabase
      .from(packageDatesTable)
      .delete()
      .eq('package_id', packageItem.id)

    if (deleteDatesError) return { ok: false, source: 'supabase', error: deleteDatesError.message }

    const { error: datesError } = await supabase
      .from(packageDatesTable)
      .insert(dates.map((label) => ({
        package_id: packageItem.id,
        label,
        status: 'available',
        payload: { label },
      })))

    if (datesError) return { ok: false, source: 'supabase', error: datesError.message }
  }

  const experienceItems = Array.isArray(payload.experienceItems)
    ? payload.experienceItems.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    : []

  const { error: deleteExperienceBlocksError } = await supabase
    .from(experienceBlocksTable)
    .delete()
    .eq('package_id', packageItem.id)

  if (deleteExperienceBlocksError) return { ok: false, source: 'supabase', error: deleteExperienceBlocksError.message }

  if (experienceItems.length > 0) {
    const { error: experienceBlocksError } = await supabase
      .from(experienceBlocksTable)
      .insert(experienceItems.map((experience) => ({
        id: typeof experience.id === 'string' ? experience.id : `${packageItem.id}-${crypto.randomUUID()}`,
        package_id: packageItem.id,
        provider_id: typeof experience.providerId === 'string' ? experience.providerId : null,
        title: typeof experience.title === 'string' ? experience.title : 'Erlebnisbaustein',
        role: typeof experience.role === 'string' ? experience.role : 'planned',
        included_in_price: typeof experience.includedInPrice === 'boolean' ? experience.includedInPrice : false,
        confirmation_status: typeof experience.confirmationStatus === 'string' ? experience.confirmationStatus : 'planned',
        payload: experience,
        updated_at: new Date().toISOString(),
      })))

    if (experienceBlocksError) return { ok: false, source: 'supabase', error: experienceBlocksError.message }
  }

  return { ok: true, source: 'supabase' }
}

export async function deleteStoredPackage(id: string): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }

  const { error } = await supabase
    .from(packagesTable)
    .delete()
    .eq('id', id)

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function fetchStoredLocalPlaces<T extends StoredEntity>() {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from(localPlacesTable)
    .select('payload')
    .order('updated_at', { ascending: false })

  if (error) throw error

  return (data ?? [])
    .map((row) => row.payload)
    .filter(Boolean) as T[]
}

export async function fetchStoredApprovedLocalPlaces<T extends StoredEntity>() {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from(localPlacesTable)
    .select('payload')
    .eq('status', 'approved')
    .order('name', { ascending: true })

  if (error) throw error

  return (data ?? [])
    .map((row) => row.payload)
    .filter(Boolean) as T[]
}

export async function upsertStoredLocalPlace(place: LocalPlaceCandidate): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }

  const { error } = await supabase
    .from(localPlacesTable)
    .upsert({
      id: place.id,
      name: place.title,
      category: place.category,
      status: place.status,
      lat: typeof place.lat === 'number' ? place.lat : null,
      lng: typeof place.lng === 'number' ? place.lng : null,
      address: place.address ?? null,
      website: place.websiteUrl ?? null,
      reservation_url: place.reservationUrl ?? null,
      menu_url: place.menuUrl ?? null,
      rating: typeof place.ratingValue === 'number' ? place.ratingValue : null,
      opening_hours: place.openingHours
        ? {
          label: place.openingHours,
          source: place.openingHoursSource ?? null,
          checked_at: place.openingHoursCheckedAt ?? null,
        }
        : null,
      package_fit: place.packageFit ?? [],
      payload: place,
      updated_at: new Date().toISOString(),
    })

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function deleteStoredLocalPlace(id: string): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }

  const { error } = await supabase
    .from(localPlacesTable)
    .delete()
    .eq('id', id)

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function fetchStoredExperienceProviders<T extends StoredEntity>() {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from(experienceProvidersTable)
    .select('payload')
    .order('updated_at', { ascending: false })

  if (error) throw error

  return (data ?? [])
    .map((row) => row.payload)
    .filter(Boolean) as T[]
}

export async function upsertStoredExperienceProvider<T extends StoredEntity>(provider: T): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }
  const payload = provider as Record<string, unknown>

  const { error } = await supabase
    .from(experienceProvidersTable)
    .upsert({
      id: provider.id,
      name: typeof payload.name === 'string' ? payload.name : 'Erlebnisanbieter',
      location: typeof payload.location === 'string' ? payload.location : null,
      category: typeof payload.category === 'string' ? payload.category : null,
      status: typeof payload.status === 'string' ? payload.status : 'lead',
      website: typeof payload.website === 'string' ? payload.website : null,
      email: typeof payload.email === 'string' ? payload.email : null,
      phone: typeof payload.phone === 'string' ? payload.phone : null,
      payload: provider,
      updated_at: new Date().toISOString(),
    })

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function deleteStoredExperienceProvider(id: string): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }

  const { error } = await supabase
    .from(experienceProvidersTable)
    .delete()
    .eq('id', id)

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function fetchStoredOwnerProperties<T extends StoredEntity>() {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from(propertiesTable)
    .select('payload')
    .order('updated_at', { ascending: false })

  if (error) throw error

  return (data ?? [])
    .map((row) => row.payload)
    .filter(Boolean) as T[]
}

export async function upsertStoredOwnerProperty<T extends StoredEntity>(property: T): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }
  const payload = property as Record<string, unknown>

  const { error } = await supabase
    .from(propertiesTable)
    .upsert({
      id: property.id,
      name: typeof payload.name === 'string' ? payload.name : 'Objekt',
      location: typeof payload.location === 'string' ? payload.location : '',
      sleeps: typeof payload.sleeps === 'number' ? payload.sleeps : null,
      check_in_type: typeof payload.checkInType === 'string' ? payload.checkInType : null,
      support_type: typeof payload.propertySupportType === 'string'
        ? payload.propertySupportType
        : typeof payload.currentRental === 'string' ? payload.currentRental : null,
      support_name: typeof payload.propertySupportName === 'string' && payload.propertySupportName
        ? payload.propertySupportName
        : typeof payload.ownerName === 'string' ? payload.ownerName : null,
      image_rights_confirmed: typeof payload.imageRightsConfirmed === 'boolean' ? payload.imageRightsConfirmed : false,
      status: typeof payload.status === 'string' ? payload.status : 'lead',
      payload: property,
      updated_at: new Date().toISOString(),
    })

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function deleteStoredOwnerProperty(id: string): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }

  const { error } = await supabase
    .from(propertiesTable)
    .delete()
    .eq('id', id)

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function fetchStoredAgencies<T extends StoredEntity>() {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from(agenciesTable)
    .select('payload')
    .order('updated_at', { ascending: false })

  if (error) throw error

  return (data ?? [])
    .map((row) => row.payload)
    .filter(Boolean) as T[]
}

export async function upsertStoredAgency<T extends StoredEntity>(agency: T): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }
  const payload = agency as Record<string, unknown>

  const { error } = await supabase
    .from(agenciesTable)
    .upsert({
      id: agency.id,
      name: typeof payload.name === 'string' ? payload.name : 'Agentur',
      contact_name: typeof payload.contactName === 'string' ? payload.contactName : null,
      email: typeof payload.email === 'string' ? payload.email : null,
      phone: typeof payload.phone === 'string' ? payload.phone : null,
      location: typeof payload.location === 'string' ? payload.location : null,
      status: typeof payload.status === 'string' ? payload.status : 'lead',
      managed_property_ids: Array.isArray(payload.managedPropertyIds) ? payload.managedPropertyIds : [],
      response_due_days: typeof payload.responseDueDays === 'number' ? payload.responseDueDays : null,
      available_dates_note: typeof payload.availableDatesNote === 'string' ? payload.availableDatesNote : null,
      payload: agency,
      updated_at: new Date().toISOString(),
    })

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function deleteStoredAgency(id: string): Promise<BackendSaveResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true, source: 'local' }

  const { error } = await supabase
    .from(agenciesTable)
    .delete()
    .eq('id', id)

  if (error) return { ok: false, source: 'supabase', error: error.message }
  return { ok: true, source: 'supabase' }
}

export async function fetchGuestStayByAccess<T>(bookingId: string, accessCode: string) {
  if (!isSupabaseConfigured || !supabase || !bookingId || !accessCode) return null

  const { data, error } = await supabase.rpc('get_guest_stay', {
    p_booking_id: bookingId,
    p_access_code: accessCode,
  })

  if (error) throw error
  return data as T | null
}
