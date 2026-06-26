import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const ownerEmail = process.env.OWNER_EMAIL
const ownerPassword = process.env.OWNER_PASSWORD

function requireEnv(value, name) {
  if (!value) {
    console.error(`Missing ${name}`)
    process.exit(1)
  }
}

function fail(message, error) {
  console.error(`owner-portal-check-failed: ${message}`)
  if (error) console.error(error.message ?? error)
  process.exit(1)
}

async function checkTable(client, table, columns = '*') {
  const { error, count } = await client
    .from(table)
    .select(columns, { count: 'exact', head: true })

  if (error) fail(`Table ${table} is not readable`, error)
  console.log(`ok table ${table} count=${count ?? 0}`)
}

requireEnv(supabaseUrl, 'SUPABASE_URL/VITE_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL')
requireEnv(serviceRoleKey, 'SUPABASE_SERVICE_ROLE_KEY')

const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

await checkTable(serviceClient, 'owner_profiles', 'id')
await checkTable(serviceClient, 'owner_property_access', 'id')
await checkTable(serviceClient, 'properties', 'id')
await checkTable(serviceClient, 'packages', 'id')
await checkTable(serviceClient, 'package_dates', 'id')
await checkTable(serviceClient, 'bookings', 'id')

const { error: rpcStructureError } = await serviceClient.rpc('get_owner_dashboard')
if (rpcStructureError) fail('RPC get_owner_dashboard is missing or not executable', rpcStructureError)
console.log('ok rpc get_owner_dashboard executable')

if (!ownerEmail || !ownerPassword) {
  console.log('owner-login-check-skipped: set OWNER_EMAIL and OWNER_PASSWORD to test real owner access')
  process.exit(0)
}

requireEnv(anonKey, 'SUPABASE_ANON_KEY/VITE_SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY')

const ownerClient = createClient(supabaseUrl, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const { error: signInError } = await ownerClient.auth.signInWithPassword({
  email: ownerEmail,
  password: ownerPassword,
})

if (signInError) fail('Owner login failed', signInError)

const { data: ownerDashboard, error: ownerDashboardError } = await ownerClient.rpc('get_owner_dashboard')
if (ownerDashboardError) fail('Owner dashboard RPC failed for signed-in owner', ownerDashboardError)
if (!ownerDashboard) fail('Signed-in owner has no active owner profile or property access')

console.log(
  [
    'ok owner dashboard',
    `properties=${ownerDashboard.properties?.length ?? 0}`,
    `packages=${ownerDashboard.packages?.length ?? 0}`,
    `dates=${ownerDashboard.dates?.length ?? 0}`,
    `bookings=${ownerDashboard.bookings?.length ?? 0}`,
  ].join(' '),
)

await ownerClient.auth.signOut()
