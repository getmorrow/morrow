import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const ownerProperties = [
  {
    id: 'nordlicht-lodge',
    name: 'Nordlicht Lodge',
    ownerName: 'Clara Jensen',
    email: 'clara.jensen@example.com',
    phone: '+49 170 2222222',
    location: 'Sankt Peter-Ording',
    propertyType: 'Ferienhaus',
    sleeps: 4,
    status: 'active',
    currentRental: 'agency',
    checkInType: 'agency_pickup',
    latestArrival: '18:00',
    notes: 'Startobjekt für Family Escape. Bild- und Textrechte liegen vor.',
  },
  {
    id: 'duenenruhe-suite',
    name: 'Dünenruhe Suite',
    ownerName: 'Mika Hansen',
    email: 'mika.hansen@example.com',
    phone: '+49 171 3333333',
    location: 'Sankt Peter-Ording Bad',
    propertyType: 'Apartment',
    sleeps: 2,
    status: 'active',
    currentRental: 'agency',
    checkInType: 'key_safe',
    latestArrival: '22:00',
    notes: 'Startobjekt für Couple Reset. Schlüssel per Safe möglich.',
  },
]

const agencies = [
  {
    id: 'agency-kuestenraum',
    name: 'Küstenraum Ferien',
    contactName: 'Janne Petersen',
    email: 'janne.petersen@example.com',
    phone: '+49 4863 101010',
    location: 'Sankt Peter-Ording',
    status: 'active',
    managedPropertyIds: ['nordlicht-lodge'],
    responseDueDays: 2,
    availableDatesNote: 'Freie Termine werden aktuell per E-Mail für Family Escape abgefragt.',
    notes: 'Startagentur für Familienobjekte. Bild- und Beschreibungsmaterial kommt nach Objektfreigabe.',
  },
  {
    id: 'agency-spo-hideaways',
    name: 'SPO Hideaways',
    contactName: 'Lena Martens',
    email: 'lena.martens@example.com',
    phone: '+49 4863 202020',
    location: 'Sankt Peter-Ording Bad',
    status: 'lead',
    managedPropertyIds: ['duenenruhe-suite'],
    responseDueDays: 3,
    availableDatesNote: 'Freie Termine für Couple Reset offen.',
    notes: 'Kleine hochwertige Apartments prüfen. Noch keine feste Kooperation.',
  },
]

for (const property of ownerProperties) {
  const { error } = await supabase
    .from('properties')
    .upsert({
      id: property.id,
      name: property.name,
      location: property.location,
      sleeps: property.sleeps,
      check_in_type: property.checkInType,
      support_type: property.currentRental,
      support_name: property.ownerName,
      image_rights_confirmed: false,
      status: property.status,
      payload: property,
      updated_at: new Date().toISOString(),
    })

  if (error) throw error
  console.log(`seeded owner property: ${property.name}`)
}

for (const agency of agencies) {
  const { error } = await supabase
    .from('agencies')
    .upsert({
      id: agency.id,
      name: agency.name,
      contact_name: agency.contactName,
      email: agency.email,
      phone: agency.phone,
      location: agency.location,
      status: agency.status,
      managed_property_ids: agency.managedPropertyIds,
      response_due_days: agency.responseDueDays,
      available_dates_note: agency.availableDatesNote,
      payload: agency,
      updated_at: new Date().toISOString(),
    })

  if (error) throw error
  console.log(`seeded agency: ${agency.name}`)
}

console.log('supabase-owners-agencies-seeded')
