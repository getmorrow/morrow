import { createClient } from '@supabase/supabase-js'
import { packages } from '../src/data.ts'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)
const now = new Date().toISOString()
const bookingId = '11111111-1111-4111-8111-111111111111'
const guestAccessCode = 'MORROW1'
const packageItem = packages.find((item) => item.slug === 'couple-reset') ?? packages[0]

if (!packageItem) {
  console.error('No package data found')
  process.exit(1)
}

const lead = {
  id: bookingId,
  type: 'guest',
  status: 'Vor Anreise',
  name: 'Sophie Krüger',
  email: 'sophie.krueger@example.com',
  phone: '+49 170 0000000',
  packageSlug: packageItem.slug,
  packageName: packageItem.name,
  selectedDate: packageItem.dates?.[0] ?? '12.–16. August',
  guests: packageItem.fixedGuests ? String(packageItem.fixedGuests) : '2',
  adults: '2',
  children: '0',
  childAges: '',
  dog: 'nein',
  preferredChannel: 'email',
  whatsappOptIn: false,
  source: 'Interner Next-Guest-Test',
  checkInStatus: 'vorbereitet',
  experienceStatus: 'vorbereitet',
  internalNote: 'Aktiver Testdatensatz für Next-Gästebereich.',
  isTest: true,
  createdAt: now,
  updatedAt: now,
}

const customer = {
  id: bookingId,
  primaryLeadId: bookingId,
  customerType: 'guest',
  name: lead.name,
  email: lead.email,
  phone: lead.phone,
  preferredChannel: 'email',
  whatsappOptIn: false,
  guestType: packageItem.audience === 'families' ? 'Familie' : 'Paar',
  requests: [lead],
  notes: lead.internalNote,
  isTest: true,
  createdAt: now,
  updatedAt: now,
}

const booking = {
  id: bookingId,
  type: 'guest',
  leadId: bookingId,
  customerId: bookingId,
  packageId: packageItem.id,
  packageSlug: packageItem.slug,
  packageName: packageItem.name,
  name: lead.name,
  customerName: lead.name,
  email: lead.email,
  phone: lead.phone,
  selectedDate: lead.selectedDate,
  status: lead.status,
  paymentStatus: 'bezahlt',
  guestAccessCode,
  guests: lead.guests,
  dog: lead.dog,
  checkInStatus: lead.checkInStatus,
  experienceStatus: lead.experienceStatus,
  internalNote: lead.internalNote,
  isTest: true,
  createdAt: now,
  updatedAt: now,
}

const propertyResult = await supabase
  .from('properties')
  .upsert({
    id: packageItem.propertyId,
    name: packageItem.stay.name,
    location: packageItem.location,
    sleeps: packageItem.stay.sleeps,
    bedrooms: packageItem.stay.bedrooms,
    bathrooms: packageItem.stay.bathrooms,
    check_in_type: packageItem.stay.checkInType,
    support_type: packageItem.stay.propertySupportType,
    support_name: packageItem.stay.propertySupportName ?? null,
    image_rights_confirmed: Boolean(packageItem.stay.imageRightsConfirmed),
    status: 'active',
    payload: packageItem.stay,
    updated_at: now,
  })

if (propertyResult.error) throw propertyResult.error

const packageResult = await supabase
  .from('packages')
  .upsert({
    id: packageItem.id,
    slug: packageItem.slug,
    name: packageItem.name,
    audience: packageItem.audience,
    location: packageItem.location,
    status: packageItem.status,
    property_id: packageItem.propertyId,
    price_from: packageItem.priceFrom,
    concrete_price: packageItem.concretePrice,
    payload: packageItem,
    updated_at: now,
  })

if (packageResult.error) throw packageResult.error

const leadResult = await supabase
  .from('leads')
  .upsert({
    id: lead.id,
    type: 'guest',
    status: lead.status,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    package_slug: lead.packageSlug,
    source: lead.source,
    payload: lead,
    updated_at: now,
  })

if (leadResult.error) throw leadResult.error

const customerResult = await supabase
  .from('customers')
  .upsert({
    id: customer.id,
    primary_lead_id: customer.primaryLeadId,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    customer_type: 'guest',
    notes: customer.notes,
    payload: customer,
    updated_at: now,
  })

if (customerResult.error) throw customerResult.error

const bookingResult = await supabase
  .from('bookings')
  .upsert({
    id: booking.id,
    lead_id: booking.leadId,
    customer_id: booking.customerId,
    package_id: booking.packageId,
    status: booking.status,
    payment_status: booking.paymentStatus,
    guest_access_code: booking.guestAccessCode,
    payload: booking,
    updated_at: now,
  })

if (bookingResult.error) throw bookingResult.error

console.log('active-next-guest-test-seeded')
console.log(`url: /deine-auszeit/${bookingId}?code=${guestAccessCode}`)
