import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const adminEmail = process.env.ADMIN_EMAIL
const adminPassword = process.env.ADMIN_PASSWORD

function requireEnv(value, name) {
  if (!value) {
    console.error(`Missing ${name}`)
    process.exit(1)
  }
}

function fail(message, error) {
  console.error(`admin-access-check-failed: ${message}`)
  if (error) console.error(error.message ?? error)
  process.exit(1)
}

async function checkTable(client, table, columns = 'id') {
  const { error, count } = await client
    .from(table)
    .select(columns, { count: 'exact', head: true })

  if (error) fail(`Table ${table} is not readable by signed-in admin`, error)
  return { table, count: count ?? 0 }
}

requireEnv(supabaseUrl, 'SUPABASE_URL/VITE_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL')
requireEnv(anonKey, 'SUPABASE_ANON_KEY/VITE_SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY')
requireEnv(adminEmail, 'ADMIN_EMAIL')
requireEnv(adminPassword, 'ADMIN_PASSWORD')

const supabase = createClient(supabaseUrl, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const { error: signInError } = await supabase.auth.signInWithPassword({
  email: adminEmail,
  password: adminPassword,
})

if (signInError) fail('Admin login failed', signInError)

const { data: profile, error: profileError } = await supabase.rpc('get_morrow_admin_profile')
if (profileError) fail('RPC get_morrow_admin_profile failed', profileError)
if (!profile?.email || profile.status !== 'active') {
  fail('Admin profile is missing or inactive')
}

const tables = []
for (const table of [
  'leads',
  'customers',
  'bookings',
  'admin_tasks',
  'support_messages',
  'communication_events',
  'packages',
  'properties',
  'owner_profiles',
  'owner_property_access',
]) {
  tables.push(await checkTable(supabase, table))
}

await supabase.auth.signOut()

console.log(JSON.stringify({
  ok: true,
  profile: {
    email: profile.email,
    role: profile.role,
    status: profile.status,
    name: profile.name ?? null,
  },
  tables,
}, null, 2))
