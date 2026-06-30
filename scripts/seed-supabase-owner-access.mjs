import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const ownerEmail = process.env.OWNER_EMAIL
const ownerName = process.env.OWNER_NAME ?? null
const ownerPhone = process.env.OWNER_PHONE ?? null
let ownerAuthUserId = process.env.OWNER_AUTH_USER_ID ?? null
let ownerPassword = process.env.OWNER_PASSWORD ?? null
const shouldCreateAuthUser = process.env.OWNER_CREATE_AUTH_USER === '1'
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

if (shouldCreateAuthUser && !ownerAuthUserId) {
  ownerPassword = ownerPassword || `Morrow-${randomBytes(18).toString('base64url')}!1`

  const authResult = await supabase.auth.admin.createUser({
    email: ownerEmail,
    password: ownerPassword,
    email_confirm: true,
    user_metadata: {
      source: 'owner-access-seed',
    },
  })

  if (authResult.error) throw authResult.error
  ownerAuthUserId = authResult.data.user.id
}

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
if (shouldCreateAuthUser) {
  console.log(`OWNER_EMAIL=${ownerEmail}`)
  console.log(`OWNER_PASSWORD=${ownerPassword}`)
}
