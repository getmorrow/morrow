import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const ownerEmail = process.env.OWNER_EMAIL
const ownerName = process.env.OWNER_NAME ?? null
const ownerPhone = process.env.OWNER_PHONE ?? null
const ownerAuthUserId = process.env.OWNER_AUTH_USER_ID ?? null
const propertyIds = (process.env.OWNER_PROPERTY_IDS ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean)

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

if (!ownerEmail || propertyIds.length === 0) {
  console.error('Missing OWNER_EMAIL or OWNER_PROPERTY_IDS')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const ownerProfilePayload = {
  email: ownerEmail,
  display_name: ownerName,
  phone: ownerPhone,
  status: 'active',
  updated_at: new Date().toISOString(),
}

if (ownerAuthUserId) {
  ownerProfilePayload.auth_user_id = ownerAuthUserId
}

const ownerProfileResult = await supabase
  .from('owner_profiles')
  .upsert(ownerProfilePayload, { onConflict: 'email' })
  .select('id,email')
  .single()

if (ownerProfileResult.error) throw ownerProfileResult.error

for (const propertyId of propertyIds) {
  const accessResult = await supabase.from('owner_property_access').upsert(
    {
      owner_profile_id: ownerProfileResult.data.id,
      property_id: propertyId,
      role: 'owner',
      can_view_financials: true,
      can_view_operations: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'owner_profile_id,property_id' },
  )

  if (accessResult.error) throw accessResult.error
  console.log(`linked ${ownerProfileResult.data.email} to ${propertyId}`)
}

console.log('supabase-owner-access-seeded')
