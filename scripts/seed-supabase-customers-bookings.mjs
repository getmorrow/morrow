import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)
const bookingStatuses = new Set(['Reserviert', 'Bezahlt', 'Vor Anreise', 'Aktiv', 'Abgeschlossen', 'Storniert'])
const paidStatuses = new Set(['Bezahlt', 'Vor Anreise', 'Aktiv', 'Abgeschlossen'])
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const isUuid = (value) => typeof value === 'string' && uuidPattern.test(value)

const guestAccessCode = ({ id, email }) => {
  const source = `${id}:${String(email ?? '').toLowerCase()}`
  let hash = 0

  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0
  }

  return Math.abs(hash).toString(36).padStart(6, '0').slice(0, 6).toUpperCase()
}

const { data: leadRows, error: leadError } = await supabase
  .from('leads')
  .select('id, payload')
  .eq('type', 'guest')

if (leadError) throw leadError

const { data: packageRows, error: packageError } = await supabase
  .from('packages')
  .select('id, slug, name, payload')

if (packageError) throw packageError

const packages = (packageRows ?? []).map((row) => row.payload ?? row)
const leads = (leadRows ?? [])
  .map((row) => row.payload)
  .filter((lead) => lead?.type === 'guest' && bookingStatuses.has(lead.status) && isUuid(lead.id))

for (const lead of leads) {
  const packageItem = packages.find((item) => (
    item.slug === lead.packageSlug
    || item.name === lead.packageName
    || item.id === lead.packageSlug
  ))
  const guestType = lead.packageSlug === 'family-escape' ? 'Familie' : 'Paar'
  const customer = {
    id: lead.id,
    primaryLeadId: lead.id,
    customerType: 'guest',
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    preferredChannel: 'email',
    whatsappOptIn: Boolean(lead.whatsappOptIn),
    guestType,
    requests: [lead],
    notes: lead.internalNote,
    isTest: Boolean(lead.isTest),
    updatedAt: lead.updatedAt,
    createdAt: lead.createdAt,
  }
  const booking = {
    id: lead.id,
    type: 'guest',
    leadId: lead.id,
    customerId: lead.id,
    packageId: packageItem?.id ?? lead.packageSlug,
    packageSlug: lead.packageSlug,
    packageName: lead.packageName,
    name: lead.name,
    customerName: lead.name,
    email: lead.email,
    phone: lead.phone,
    selectedDate: lead.selectedDate,
    status: lead.status,
    paymentStatus: paidStatuses.has(lead.status) ? 'bezahlt' : 'offen',
    guestAccessCode: paidStatuses.has(lead.status) ? guestAccessCode(lead) : undefined,
    guests: lead.guests,
    dog: lead.dog,
    reservationExpiresAt: lead.reservationExpiresAt,
    paymentDueAt: lead.paymentDueAt,
    followUpAt: lead.followUpAt,
    checkInStatus: lead.checkInStatus,
    experienceStatus: lead.experienceStatus,
    internalNote: lead.internalNote,
    isTest: Boolean(lead.isTest),
    updatedAt: lead.updatedAt,
    createdAt: lead.createdAt,
  }

  const { error: customerError } = await supabase
    .from('customers')
    .upsert({
      id: customer.id,
      primary_lead_id: customer.primaryLeadId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      customer_type: 'guest',
      notes: customer.notes ?? null,
      payload: customer,
      updated_at: new Date().toISOString(),
    })

  if (customerError) throw customerError

  const { error: bookingError } = await supabase
    .from('bookings')
    .upsert({
      id: booking.id,
      lead_id: booking.leadId,
      customer_id: booking.customerId,
      package_id: booking.packageId,
      status: booking.status,
      payment_status: booking.paymentStatus,
      guest_access_code: booking.guestAccessCode ?? null,
      payload: booking,
      updated_at: new Date().toISOString(),
    })

  if (bookingError) throw bookingError
  console.log(`synced customer + booking: ${lead.name} · ${lead.packageName}`)
}

console.log(`supabase-customers-bookings-seeded: ${leads.length}`)
