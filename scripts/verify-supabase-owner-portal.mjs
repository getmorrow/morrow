import { createClient } from '@supabase/supabase-js'
import { randomBytes, randomUUID } from 'node:crypto'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
let ownerEmail = process.env.OWNER_EMAIL
let ownerPassword = process.env.OWNER_PASSWORD
const verifySupportInsert = process.env.OWNER_VERIFY_SUPPORT_INSERT === '1'
const verifyDocumentAccess = process.env.OWNER_VERIFY_DOCUMENT_ACCESS === '1'
const verifyStatementAccess = process.env.OWNER_VERIFY_STATEMENT_ACCESS === '1'
const verifyOperationAccess = process.env.OWNER_VERIFY_OPERATION_ACCESS === '1'
const verifyTempOwner = process.env.OWNER_VERIFY_TEMP_OWNER === '1'
const tempOwner = {
  authUserId: null,
  profileId: null,
  supportMessageIds: [],
  operationId: null,
  statementId: null,
}

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
await checkTable(serviceClient, 'owner_operations', 'id')
await checkTable(serviceClient, 'owner_statements', 'id')

const { error: rpcStructureError } = await serviceClient.rpc('get_owner_dashboard')
if (rpcStructureError) fail('RPC get_owner_dashboard is missing or not executable', rpcStructureError)
console.log('ok rpc get_owner_dashboard executable')

const { error: operationsRpcStructureError } = await serviceClient.rpc('get_owner_operations')
if (operationsRpcStructureError) fail('RPC get_owner_operations is missing or not executable', operationsRpcStructureError)
console.log('ok rpc get_owner_operations executable')

if (!ownerEmail || !ownerPassword) {
  if (!verifyTempOwner) {
    console.log('owner-login-check-skipped: set OWNER_EMAIL and OWNER_PASSWORD to test real owner access')
    process.exit(0)
  }

  requireEnv(anonKey, 'SUPABASE_ANON_KEY/VITE_SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY')

  const { data: property, error: propertyError } = await serviceClient
    .from('properties')
    .select('id,name')
    .limit(1)
    .single()

  if (propertyError || !property?.id) fail('No property available for temporary owner verification', propertyError)

  const marker = `owner-verify-${Date.now()}`
  ownerEmail = `${marker}@getmorrow.de`
  ownerPassword = `Morrow-${randomBytes(18).toString('base64url')}!1`

  const { data: authData, error: authCreateError } = await serviceClient.auth.admin.createUser({
    email: ownerEmail,
    password: ownerPassword,
    email_confirm: true,
    user_metadata: {
      source: 'owner-portal-verification',
      qaMarker: marker,
    },
  })

  if (authCreateError) fail('Temporary owner auth user could not be created', authCreateError)
  tempOwner.authUserId = authData.user.id

  const { data: ownerProfile, error: ownerProfileError } = await serviceClient
    .from('owner_profiles')
    .insert({
      email: ownerEmail,
      auth_user_id: tempOwner.authUserId,
      display_name: 'Owner Portal Verification',
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (ownerProfileError) fail('Temporary owner profile could not be created', ownerProfileError)
  tempOwner.profileId = ownerProfile.id

  const { error: accessError } = await serviceClient.from('owner_property_access').insert({
    owner_profile_id: tempOwner.profileId,
    property_id: property.id,
    role: 'owner',
    can_view_financials: true,
    can_view_operations: true,
    updated_at: new Date().toISOString(),
  })

  if (accessError) fail('Temporary owner property access could not be created', accessError)

  console.log(`ok temporary owner seeded property=${property.name ?? property.id}`)
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
  tempOwner.supportMessageIds.push(supportMessageId, availabilityMessageId)
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

  const { data: dashboardWithMessages, error: messageDashboardError } = await ownerClient.rpc('get_owner_dashboard')
  if (messageDashboardError) fail('Owner dashboard RPC failed after support insert', messageDashboardError)

  const visibleMessages = dashboardWithMessages?.messages ?? []
  const visibleMessageIds = new Set(visibleMessages.map((message) => message.id))
  if (!visibleMessageIds.has(supportMessageId) || !visibleMessageIds.has(availabilityMessageId)) {
    fail('Inserted owner support messages were not returned to signed-in owner')
  }

  console.log(
    [
      'ok owner support insert',
      `count=${supportMessages.length}`,
      `categories=${supportMessages.map((message) => message.category).join(',')}`,
      `dashboardMessages=${visibleMessages.length}`,
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

if (verifyStatementAccess) {
  const property = ownerDashboard.properties?.[0]
  if (!property?.id) fail('Owner dashboard has no property for statement access verification')

  const statementId = randomUUID()
  tempOwner.statementId = statementId
  const { error: statementInsertError } = await serviceClient.from('owner_statements').insert({
    id: statementId,
    property_id: property.id,
    period_label: 'QA',
    period_start: '2026-09-01',
    period_end: '2026-09-30',
    status: 'visible',
    gross_revenue: 1990,
    morrow_fee: 298.5,
    other_costs: 120,
    owner_payout: 1571.5,
    document_url: 'https://www.getmorrow.de',
    payload: {
      source: 'owner-portal-verification',
      qaMarker: statementId,
    },
  })

  if (statementInsertError) fail('Owner statement insert failed', statementInsertError)

  const { data: dashboardWithStatement, error: statementDashboardError } = await ownerClient.rpc('get_owner_dashboard')
  if (statementDashboardError) fail('Owner dashboard RPC failed after statement insert', statementDashboardError)

  const visibleStatement = dashboardWithStatement?.statements?.find((statement) => statement.id === statementId)
  if (!visibleStatement) fail('Inserted visible owner statement was not returned to signed-in owner')
  if (Number(visibleStatement.ownerPayout) !== 1571.5) fail('Owner statement payout value mismatch')

  console.log(
    [
      'ok owner statement access',
      `id=${statementId}`,
      `property=${property.name ?? property.id}`,
      `payout=${visibleStatement.ownerPayout}`,
    ].join(' '),
  )
}

if (verifyOperationAccess) {
  const property = ownerDashboard.properties?.[0]
  if (!property?.id) fail('Owner dashboard has no property for operation access verification')

  const operationId = randomUUID()
  tempOwner.operationId = operationId
  const { error: operationInsertError } = await serviceClient.from('owner_operations').insert({
    id: operationId,
    property_id: property.id,
    title: `Owner portal verification operation ${operationId}`,
    operation_type: 'inspection',
    status: 'planned',
    visibility: 'owner_visible',
    scheduled_for: '2026-09-15',
    note: 'QA operation visibility check',
    payload: {
      source: 'owner-portal-verification',
      qaMarker: operationId,
    },
  })

  if (operationInsertError) fail('Owner operation insert failed', operationInsertError)

  const { data: ownerOperations, error: operationRpcError } = await ownerClient.rpc('get_owner_operations')
  if (operationRpcError) fail('Owner operations RPC failed after operation insert', operationRpcError)

  const visibleOperation = ownerOperations?.find((operation) => operation.id === operationId)
  if (!visibleOperation) fail('Inserted visible owner operation was not returned to signed-in owner')
  if (visibleOperation.operationType !== 'inspection') fail('Owner operation type value mismatch')

  console.log(
    [
      'ok owner operation access',
      `id=${operationId}`,
      `property=${property.name ?? property.id}`,
      `status=${visibleOperation.status}`,
    ].join(' '),
  )
}

await ownerClient.auth.signOut()

if (tempOwner.supportMessageIds.length > 0) {
  const { error: supportCleanupError } = await serviceClient
    .from('support_messages')
    .delete()
    .in('id', tempOwner.supportMessageIds)

  if (supportCleanupError) fail('Temporary owner support cleanup failed', supportCleanupError)
}

if (tempOwner.profileId) {
  const { error: accessCleanupError } = await serviceClient
    .from('owner_property_access')
    .delete()
    .eq('owner_profile_id', tempOwner.profileId)

  if (accessCleanupError) fail('Temporary owner access cleanup failed', accessCleanupError)

  const { error: profileCleanupError } = await serviceClient
    .from('owner_profiles')
    .delete()
    .eq('id', tempOwner.profileId)

  if (profileCleanupError) fail('Temporary owner profile cleanup failed', profileCleanupError)
}

if (tempOwner.statementId) {
  const { error: statementCleanupError } = await serviceClient
    .from('owner_statements')
    .delete()
    .eq('id', tempOwner.statementId)

  if (statementCleanupError) fail('Temporary owner statement cleanup failed', statementCleanupError)
}

if (tempOwner.operationId) {
  const { error: operationCleanupError } = await serviceClient
    .from('owner_operations')
    .delete()
    .eq('id', tempOwner.operationId)

  if (operationCleanupError) fail('Temporary owner operation cleanup failed', operationCleanupError)
}

if (tempOwner.authUserId) {
  const { error: authCleanupError } = await serviceClient.auth.admin.deleteUser(tempOwner.authUserId)
  if (authCleanupError) fail('Temporary owner auth cleanup failed', authCleanupError)
}
