import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const providers = [
  {
    id: 'provider-watt-wind',
    name: 'Watt & Wind',
    contactName: 'Mara Koch',
    email: 'mara.koch@example.com',
    phone: '+49 175 6666666',
    location: 'Sankt Peter-Ording',
    category: 'Geführte Wattwanderung',
    audienceFit: 'Familien',
    status: 'in-review',
    notes: 'Für Family Escape prüfen. Kapazität und Schlechtwetterregel klären.',
  },
  {
    id: 'provider-nordsee-yoga',
    name: 'Nordsee Yoga Studio',
    contactName: 'Jonas Riedel',
    email: 'jonas.riedel@example.com',
    phone: '+49 176 7777777',
    location: 'Sankt Peter-Ording Bad',
    category: 'Private Yoga Session',
    audienceFit: 'Paare',
    status: 'in-review',
    notes: 'Passt zu Couple Reset. Preislogik und verfügbare Slots klären.',
  },
]

for (const provider of providers) {
  const { error } = await supabase
    .from('experience_providers')
    .upsert({
      id: provider.id,
      name: provider.name,
      location: provider.location,
      category: provider.category,
      status: provider.status,
      email: provider.email,
      phone: provider.phone,
      payload: provider,
      updated_at: new Date().toISOString(),
    })

  if (error) throw error
  console.log(`seeded experience provider: ${provider.name}`)
}

const { data: packages, error: packageError } = await supabase
  .from('packages')
  .select('id,payload')

if (packageError) throw packageError

for (const packageRow of packages ?? []) {
  const packageId = packageRow.id
  const experienceItems = Array.isArray(packageRow.payload?.experienceItems) ? packageRow.payload.experienceItems : []

  const { error: deleteError } = await supabase
    .from('experience_blocks')
    .delete()
    .eq('package_id', packageId)

  if (deleteError) throw deleteError

  if (experienceItems.length === 0) continue

  const { error: insertError } = await supabase
    .from('experience_blocks')
    .insert(experienceItems.map((experience) => ({
      id: experience.id,
      package_id: packageId,
      provider_id: experience.providerId ?? null,
      title: experience.title,
      role: experience.role ?? 'planned',
      included_in_price: Boolean(experience.includedInPrice),
      confirmation_status: experience.confirmationStatus ?? 'planned',
      payload: experience,
      updated_at: new Date().toISOString(),
    })))

  if (insertError) throw insertError
  console.log(`seeded ${experienceItems.length} experience blocks for package: ${packageId}`)
}

console.log('supabase-experiences-seeded')
