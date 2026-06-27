import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const ownerEmail = process.env.OWNER_EMAIL
const ownerPassword = process.env.OWNER_PASSWORD
const verifySupportInsert = process.env.OWNER_VERIFY_SUPPORT_INSERT === '1'
const verifyDocumentAccess = process.env.OWNER_VERIFY_DOCUMENT_ACCESS === '1'

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
await checkTable(serviceClient, 'owner_documents', 'id')

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
    `documents=${ownerDashboard.documents?.length ?? 0}`,
  ].join(' '),
)

if (verifySupportInsert) {
  const ownerProfile = ownerDashboard.profile
  const property = ownerDashboard.properties?.[0]

  if (!ownerProfile?.id) fail('Owner dashboard has no profile id for support insert verification')
  if (!property?.id) fail('Owner dashboard has no property for support insert verification')

  const supportMessageId = `owner-support-verify-${Date.now()}`
  const availabilityMessageId = `owner-availability-verify-${Date.now()}`
  const { error: supportInsertError } = await ownerClient.from('support_messages').insert([
    {
      id: supportMessageId,
      category: 'owner_property',
      message: `Owner portal verification message ${supportMessageId}`,
      urgency: 'normal',
      payload: {
        source: 'next-owner',
        subject: 'Objekt oder Ausstattung',
        categoryLabel: 'Eigentümeranliegen',
        ownerProfileId: ownerProfile.id,
        ownerName: ownerProfile.displayName,
        ownerEmail: ownerProfile.email,
        ownerPhone: ownerProfile.phone,
        propertyId: property.id,
        propertyName: property.name,
        supportCategory: 'property',
        qaMarker: supportMessageId,
      },
    },
    {
      id: availabilityMessageId,
      category: 'owner_availability',
      message: `Owner availability verification message ${availabilityMessageId}`,
      urgency: 'soon',
      payload: {
        source: 'next-owner',
        subject: 'Eigenbelegung oder Verfügbarkeit',
        categoryLabel: 'Eigentümeranliegen',
        ownerProfileId: ownerProfile.id,
        ownerName: ownerProfile.displayName,
        ownerEmail: ownerProfile.email,
        ownerPhone: ownerProfile.phone,
        propertyId: property.id,
        propertyName: property.name,
        supportCategory: 'availability',
        requestedStartsOn: '2026-09-10',
        requestedEndsOn: '2026-09-14',
        requestedDateRangeLabel: '2026-09-10 bis 2026-09-14',
        qaMarker: availabilityMessageId,
      },
    },
  ])

  if (supportInsertError) fail('Owner support message insert failed', supportInsertError)

  const { data: supportMessages, error: supportReadError } = await serviceClient
    .from('support_messages')
    .select('id,category,status,urgency,payload')
    .in('id', [supportMessageId, availabilityMessageId])

  if (supportReadError) fail('Inserted owner support message is not readable by service role', supportReadError)
  if ((supportMessages ?? []).length !== 2) fail('Expected owner support and availability messages to be readable')
  const availabilityMessage = supportMessages.find((message) => message.id === availabilityMessageId)
  if (availabilityMessage?.payload?.requestedStartsOn !== '2026-09-10') {
    fail('Owner availability support payload missing requested date range')
  }

  console.log(
    [
      'ok owner support insert',
      `count=${supportMessages.length}`,
      `categories=${supportMessages.map((message) => message.category).join(',')}`,
      `property=${supportMessages[0]?.payload?.propertyName ?? property.id}`,
    ].join(' '),
  )
}

if (verifyDocumentAccess) {
  const property = ownerDashboard.properties?.[0]
  if (!property?.id) fail('Owner dashboard has no property for document access verification')

  const documentId = randomUUID()
  const documentTitle = `Owner portal verification document ${documentId}`
  const { error: documentInsertError } = await serviceClient.from('owner_documents').insert({
    id: documentId,
    property_id: property.id,
    title: documentTitle,
    document_type: 'report',
    status: 'visible',
    url: 'https://www.getmorrow.de',
    period_label: 'QA',
    payload: {
      source: 'owner-portal-verification',
      qaMarker: documentId,
    },
  })

  if (documentInsertError) fail('Owner document insert failed', documentInsertError)

  const { data: dashboardWithDocument, error: documentDashboardError } = await ownerClient.rpc('get_owner_dashboard')
  if (documentDashboardError) fail('Owner dashboard RPC failed after document insert', documentDashboardError)

  const visibleDocument = dashboardWithDocument?.documents?.find((document) => document.id === documentId)
  if (!visibleDocument) {
    await serviceClient.from('owner_documents').delete().eq('id', documentId)
    fail('Inserted visible owner document was not returned to signed-in owner')
  }

  const { error: documentDeleteError } = await serviceClient
    .from('owner_documents')
    .delete()
    .eq('id', documentId)

  if (documentDeleteError) fail('Owner document cleanup failed', documentDeleteError)

  console.log(
    [
      'ok owner document access',
      `id=${documentId}`,
      `property=${property.name ?? property.id}`,
      `title=${visibleDocument.title}`,
    ].join(' '),
  )
}

await ownerClient.auth.signOut()
