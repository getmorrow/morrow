import { createClient } from '@supabase/supabase-js'
import { packages } from '../src/data.ts'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

for (const packageItem of packages) {
  const stay = packageItem.stay

  const propertyResult = await supabase
    .from('properties')
    .upsert({
      id: packageItem.propertyId,
      name: stay.name,
      location: packageItem.location,
      sleeps: stay.sleeps,
      bedrooms: stay.bedrooms,
      bathrooms: stay.bathrooms,
      check_in_type: stay.checkInType,
      support_type: stay.propertySupportType,
      support_name: stay.propertySupportName ?? null,
      image_rights_confirmed: stay.imageRightsConfirmed,
      status: 'active',
      payload: stay,
      updated_at: new Date().toISOString(),
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
      updated_at: new Date().toISOString(),
    })

  if (packageResult.error) throw packageResult.error

  const deleteDates = await supabase
    .from('package_dates')
    .delete()
    .eq('package_id', packageItem.id)

  if (deleteDates.error) throw deleteDates.error

  const datesResult = await supabase
    .from('package_dates')
    .insert(packageItem.dates.map((label) => ({
      package_id: packageItem.id,
      label,
      status: 'available',
      payload: { label },
    })))

  if (datesResult.error) throw datesResult.error

  console.log(`seeded ${packageItem.name}`)
}

console.log('supabase-packages-seeded')

