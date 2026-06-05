import { createClient } from '@supabase/supabase-js'
import { localPlaceCandidates } from '../src/data/localPlaces.ts'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

for (const place of localPlaceCandidates) {
  const { error } = await supabase
    .from('local_places')
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

  if (error) throw error
  console.log(`seeded local place: ${place.title}`)
}

console.log('supabase-local-places-seeded')
