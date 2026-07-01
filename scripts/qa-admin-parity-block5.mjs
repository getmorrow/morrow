import { createClient } from '@supabase/supabase-js'
import { createQaEnv, isPlaceholder } from './lib/qa-env.mjs'

const rootDir = process.cwd()
const qaEnv = createQaEnv(rootDir)
const env = { ...qaEnv.values }

if (!env.SUPABASE_URL) {
  env.SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL || ''
}

if (!env.SUPABASE_ANON_KEY) {
  env.SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || ''
}

function value(name) {
  return env[name] || ''
}

function has(name) {
  return !isPlaceholder(value(name))
}

function firstUsable(names) {
  const name = names.find(has)
  return name ? value(name) : ''
}

const requiredEnvGroups = [
  {
    id: 'supabase:url',
    label: 'Supabase public URL',
    names: ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL'],
  },
  {
    id: 'supabase:anon',
    label: 'Supabase anon key',
    names: ['SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'],
  },
  {
    id: 'admin:email',
    label: 'Admin email',
    names: ['ADMIN_EMAIL'],
  },
  {
    id: 'admin:password',
    label: 'Admin password',
    names: ['ADMIN_PASSWORD'],
  },
  {
    id: 'owner:email',
    label: 'Owner email',
    names: ['OWNER_EMAIL'],
  },
  {
    id: 'owner:password',
    label: 'Owner password',
    names: ['OWNER_PASSWORD'],
  },
]

const envStatus = requiredEnvGroups.map((group) => ({
  id: group.id,
  label: group.label,
  ok: group.names.some(has),
  acceptedNames: group.names,
}))
const missingEnv = envStatus.filter((group) => !group.ok)

const explicitOwnerProfileId = firstUsable(['QA_BLOCK5_OWNER_PROFILE_ID', 'TEST_OWNER_PROFILE_ID', 'OWNER_PROFILE_ID'])
const explicitPropertyId = firstUsable(['QA_BLOCK5_PROPERTY_ID', 'TEST_OWNER_PROPERTY_ID', 'OWNER_PROPERTY_ID', 'PROPERTY_ID'])
const explicitDocumentId = firstUsable(['QA_BLOCK5_DOCUMENT_ID', 'TEST_OWNER_DOCUMENT_ID', 'OWNER_DOCUMENT_ID'])
const explicitStatementId = firstUsable(['QA_BLOCK5_STATEMENT_ID', 'TEST_OWNER_STATEMENT_ID', 'OWNER_STATEMENT_ID'])
const explicitOperationId = firstUsable(['QA_BLOCK5_OPERATION_ID', 'TEST_OWNER_OPERATION_ID', 'OWNER_OPERATION_ID'])

const optionalSelectors = {
  ownerProfileId: {
    acceptedNames: ['QA_BLOCK5_OWNER_PROFILE_ID', 'TEST_OWNER_PROFILE_ID', 'OWNER_PROFILE_ID'],
    configured: Boolean(explicitOwnerProfileId),
  },
  propertyId: {
    acceptedNames: ['QA_BLOCK5_PROPERTY_ID', 'TEST_OWNER_PROPERTY_ID', 'OWNER_PROPERTY_ID', 'PROPERTY_ID'],
    configured: Boolean(explicitPropertyId),
  },
  documentId: {
    acceptedNames: ['QA_BLOCK5_DOCUMENT_ID', 'TEST_OWNER_DOCUMENT_ID', 'OWNER_DOCUMENT_ID'],
    configured: Boolean(explicitDocumentId),
  },
  statementId: {
    acceptedNames: ['QA_BLOCK5_STATEMENT_ID', 'TEST_OWNER_STATEMENT_ID', 'OWNER_STATEMENT_ID'],
    configured: Boolean(explicitStatementId),
  },
  operationId: {
    acceptedNames: ['QA_BLOCK5_OPERATION_ID', 'TEST_OWNER_OPERATION_ID', 'OWNER_OPERATION_ID'],
    configured: Boolean(explicitOperationId),
  },
}

function pass(id, label, evidence, target) {
  return { id, label, ok: true, evidence, evidenceTarget: target }
}

function fail(id, label, summary, target) {
  return { id, label, ok: false, summary, evidenceTarget: target }
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function ids(rows) {
  return rows.map((row) => String(row.id))
}

function buildMissingEnvOutput() {
  return {
    ok: false,
    purpose: 'Prepare admin parity Block 5 evidence: Owner-App.',
    checkedEnvSources: {
      shell: true,
      envLocal: qaEnv.envLocalExists,
    },
    requiredEnv: envStatus,
    optionalSelectors,
    counts: {
      checks: 0,
      passed: 0,
      blockers: missingEnv.length,
    },
    blockers: missingEnv.map((group) => ({
      id: group.id,
      label: group.label,
      acceptedNames: group.acceptedNames,
    })),
    nextActions: [
      {
        id: 'set-admin-and-owner-test-logins',
        label: 'Set current Admin and Owner QA credentials locally',
        detail: 'Block 5 compares the signed-in Owner-App view with the signed-in Admin/Supabase source of truth.',
        requiredEnv: ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'OWNER_EMAIL', 'OWNER_PASSWORD'],
        verifyWith: 'npm run qa:admin-parity:block5',
      },
      {
        id: 'select-current-owner-records',
        label: 'Select current owner records for Block 5',
        detail: 'Use an active owner with at least one property access, one visible document, one visible/paid statement and one owner-visible operation.',
        optionalEnv: [
          'QA_BLOCK5_OWNER_PROFILE_ID',
          'QA_BLOCK5_PROPERTY_ID',
          'QA_BLOCK5_DOCUMENT_ID',
          'QA_BLOCK5_STATEMENT_ID',
          'QA_BLOCK5_OPERATION_ID',
        ],
      },
      {
        id: 'rerun-status',
        label: 'Rerun the admin parity status report',
        verifyWith: 'npm run qa:admin-parity:status',
      },
    ],
  }
}

async function selectAdminOwnerProfile(adminClient) {
  let query = adminClient
    .from('owner_profiles')
    .select('id,email,display_name,phone,status,payload,created_at')

  if (explicitOwnerProfileId) {
    query = query.eq('id', explicitOwnerProfileId)
  } else {
    query = query.eq('email', env.OWNER_EMAIL)
  }

  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return data
}

async function readOwnerAccess(adminClient, ownerProfileId) {
  if (!ownerProfileId) return []
  let query = adminClient
    .from('owner_property_access')
    .select('id,owner_profile_id,property_id,role,can_view_financials,can_view_operations,created_at')
    .eq('owner_profile_id', ownerProfileId)

  if (explicitPropertyId) query = query.eq('property_id', explicitPropertyId)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

async function readOwnerDocuments(adminClient, propertyIds) {
  if (explicitDocumentId) {
    const { data, error } = await adminClient
      .from('owner_documents')
      .select('id,property_id,title,document_type,status,url,period_label,payload,created_at')
      .eq('id', explicitDocumentId)
      .maybeSingle()
    if (error) throw error
    return data ? [data] : []
  }

  if (propertyIds.length === 0) return []
  const { data, error } = await adminClient
    .from('owner_documents')
    .select('id,property_id,title,document_type,status,url,period_label,payload,created_at')
    .in('property_id', propertyIds)
    .eq('status', 'visible')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data ?? []
}

async function readOwnerStatements(adminClient, propertyIds) {
  if (explicitStatementId) {
    const { data, error } = await adminClient
      .from('owner_statements')
      .select('id,property_id,period_label,period_start,period_end,status,currency,gross_revenue,morrow_fee,other_costs,owner_payout,document_url,paid_at,payload,created_at')
      .eq('id', explicitStatementId)
      .maybeSingle()
    if (error) throw error
    return data ? [data] : []
  }

  if (propertyIds.length === 0) return []
  const { data, error } = await adminClient
    .from('owner_statements')
    .select('id,property_id,period_label,period_start,period_end,status,currency,gross_revenue,morrow_fee,other_costs,owner_payout,document_url,paid_at,payload,created_at')
    .in('property_id', propertyIds)
    .in('status', ['visible', 'paid'])
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data ?? []
}

async function readOwnerOperations(adminClient, propertyIds) {
  if (explicitOperationId) {
    const { data, error } = await adminClient
      .from('owner_operations')
      .select('id,property_id,title,operation_type,status,visibility,scheduled_for,completed_at,note,payload,created_at')
      .eq('id', explicitOperationId)
      .maybeSingle()
    if (error) throw error
    return data ? [data] : []
  }

  if (propertyIds.length === 0) return []
  const { data, error } = await adminClient
    .from('owner_operations')
    .select('id,property_id,title,operation_type,status,visibility,scheduled_for,completed_at,note,payload,created_at')
    .in('property_id', propertyIds)
    .eq('visibility', 'owner_visible')
    .neq('status', 'archived')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data ?? []
}

async function readAuditLogs(adminClient, records) {
  const filters = records
    .filter((record) => record.entityType && record.entityId)
    .map((record) => `and(entity_type.eq.${record.entityType},entity_id.eq.${record.entityId})`)

  if (filters.length === 0) return []

  const { data, error } = await adminClient
    .from('admin_audit_logs')
    .select('id,actor_email,action,entity_type,entity_id,entity_label,created_at,payload')
    .or(filters.join(','))
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data ?? []
}

async function readOwnerDashboard(ownerClient) {
  const { data, error } = await ownerClient.rpc('get_owner_dashboard')
  if (error) throw error
  return data
}

function buildProfileResult(ownerProfile, dashboard) {
  if (!ownerProfile) {
    return fail(
      'owner-profile',
      'Owner profile is active and readable by Admin',
      'No owner profile found for OWNER_EMAIL or QA_BLOCK5_OWNER_PROFILE_ID.',
      'Runbook gate 20 Owner-Dokument',
    )
  }

  if (ownerProfile.status !== 'active') {
    return fail(
      'owner-profile',
      'Owner profile is active and readable by Admin',
      `Owner profile ${ownerProfile.id} has status ${ownerProfile.status}, expected active.`,
      'Runbook gate 20 Owner-Dokument',
    )
  }

  if (!dashboard?.profile?.id || dashboard.profile.id !== ownerProfile.id) {
    return fail(
      'owner-profile',
      'Owner profile is active and readable by Admin',
      'Owner dashboard did not return the same active owner profile as Admin/Supabase.',
      'Runbook gate 20 Owner-Dokument',
    )
  }

  return pass(
    'owner-profile',
    'Owner profile is active and readable by Admin',
    {
      id: ownerProfile.id,
      email: ownerProfile.email,
      displayName: ownerProfile.display_name,
      dashboardProfileId: dashboard.profile.id,
    },
    'Runbook gate 20 Owner-Dokument',
  )
}

function buildAccessResult(accessRows, dashboard) {
  const dashboardProperties = asArray(dashboard?.properties)

  if (accessRows.length === 0) {
    return fail(
      'owner-property-access',
      'Owner has property access and dashboard is rights-filtered',
      'No owner_property_access rows found for the selected owner.',
      'Runbook gate 20 Owner-Dokument',
    )
  }

  const accessPropertyIds = new Set(accessRows.map((row) => row.property_id))
  const dashboardPropertyIds = new Set(dashboardProperties.map((property) => property.id))
  const unexpected = [...dashboardPropertyIds].filter((id) => !accessPropertyIds.has(id))
  const missing = [...accessPropertyIds].filter((id) => !dashboardPropertyIds.has(id))

  if (unexpected.length > 0 || missing.length > 0) {
    return fail(
      'owner-property-access',
      'Owner has property access and dashboard is rights-filtered',
      `Owner dashboard property IDs do not match Admin access. Missing: ${missing.join(', ') || '-'}; unexpected: ${unexpected.join(', ') || '-'}.`,
      'Runbook gate 20 Owner-Dokument',
    )
  }

  return pass(
    'owner-property-access',
    'Owner has property access and dashboard is rights-filtered',
    {
      accessCount: accessRows.length,
      propertyIds: [...accessPropertyIds],
      financialAccessCount: accessRows.filter((row) => row.can_view_financials).length,
      operationsAccessCount: accessRows.filter((row) => row.can_view_operations).length,
    },
    'Runbook gate 20 Owner-Dokument',
  )
}

function buildDocumentResult(documents, dashboard) {
  const dashboardDocuments = asArray(dashboard?.documents)
  const visibleDocuments = documents.filter((document) => document.status === 'visible')
  const visibleIds = new Set(ids(visibleDocuments))
  const dashboardIds = new Set(ids(dashboardDocuments))
  const missing = [...visibleIds].filter((id) => !dashboardIds.has(id))
  const unexpected = [...dashboardIds].filter((id) => !visibleIds.has(id))

  if (visibleDocuments.length === 0) {
    return fail(
      'owner-document',
      'Visible Owner document is shown in Owner-App',
      'No visible owner_document found for the selected owner property access.',
      'Runbook gate 20 Owner-Dokument',
    )
  }

  if (missing.length > 0 || unexpected.length > 0) {
    return fail(
      'owner-document',
      'Visible Owner document is shown in Owner-App',
      `Owner dashboard documents do not match visible Admin documents. Missing: ${missing.join(', ') || '-'}; unexpected: ${unexpected.join(', ') || '-'}.`,
      'Runbook gate 20 Owner-Dokument',
    )
  }

  const firstDocument = visibleDocuments[0]
  if (!firstDocument.title || !firstDocument.url || !firstDocument.document_type) {
    return fail(
      'owner-document',
      'Visible Owner document is shown in Owner-App',
      `Owner document ${firstDocument.id} is missing title, url or document_type.`,
      'Runbook gate 20 Owner-Dokument',
    )
  }

  return pass(
    'owner-document',
    'Visible Owner document is shown in Owner-App',
    {
      count: visibleDocuments.length,
      first: {
        id: firstDocument.id,
        propertyId: firstDocument.property_id,
        title: firstDocument.title,
        documentType: firstDocument.document_type,
        status: firstDocument.status,
      },
    },
    'Runbook gate 20 Owner-Dokument',
  )
}

function buildStatementResult(statements, accessRows, dashboard) {
  const financialPropertyIds = new Set(accessRows.filter((row) => row.can_view_financials).map((row) => row.property_id))
  const visibleStatements = statements.filter((statement) => ['visible', 'paid'].includes(statement.status) && financialPropertyIds.has(statement.property_id))
  const dashboardStatements = asArray(dashboard?.statements)
  const visibleIds = new Set(ids(visibleStatements))
  const dashboardIds = new Set(ids(dashboardStatements))
  const missing = [...visibleIds].filter((id) => !dashboardIds.has(id))
  const unexpected = [...dashboardIds].filter((id) => !visibleIds.has(id))

  if (visibleStatements.length === 0) {
    return fail(
      'owner-statement',
      'Visible Owner statement is rights-filtered and shown in Owner-App',
      'No visible/paid owner_statement found for a property with can_view_financials.',
      'Runbook gate 21 Owner-Abrechnung',
    )
  }

  if (missing.length > 0 || unexpected.length > 0) {
    return fail(
      'owner-statement',
      'Visible Owner statement is rights-filtered and shown in Owner-App',
      `Owner dashboard statements do not match visible Admin statements. Missing: ${missing.join(', ') || '-'}; unexpected: ${unexpected.join(', ') || '-'}.`,
      'Runbook gate 21 Owner-Abrechnung',
    )
  }

  const firstStatement = visibleStatements[0]
  if (!firstStatement.period_label || !firstStatement.currency) {
    return fail(
      'owner-statement',
      'Visible Owner statement is rights-filtered and shown in Owner-App',
      `Owner statement ${firstStatement.id} is missing period_label or currency.`,
      'Runbook gate 21 Owner-Abrechnung',
    )
  }

  return pass(
    'owner-statement',
    'Visible Owner statement is rights-filtered and shown in Owner-App',
    {
      count: visibleStatements.length,
      first: {
        id: firstStatement.id,
        propertyId: firstStatement.property_id,
        periodLabel: firstStatement.period_label,
        status: firstStatement.status,
        ownerPayout: firstStatement.owner_payout,
      },
    },
    'Runbook gate 21 Owner-Abrechnung',
  )
}

function buildOperationResult(operations, accessRows, dashboard) {
  const operationPropertyIds = new Set(accessRows.filter((row) => row.can_view_operations).map((row) => row.property_id))
  const visibleOperations = operations.filter((operation) => operation.visibility === 'owner_visible' && operation.status !== 'archived' && operationPropertyIds.has(operation.property_id))
  const dashboardOperations = asArray(dashboard?.operations)
  const visibleIds = new Set(ids(visibleOperations))
  const dashboardIds = new Set(ids(dashboardOperations))
  const missing = [...visibleIds].filter((id) => !dashboardIds.has(id))
  const unexpected = [...dashboardIds].filter((id) => !visibleIds.has(id))

  if (visibleOperations.length === 0) {
    return fail(
      'owner-operation',
      'Owner operation is visible and status-consistent in Owner-App',
      'No owner-visible owner_operation found for a property with can_view_operations.',
      'Runbook gate 22 Owner-Operation',
    )
  }

  if (missing.length > 0 || unexpected.length > 0) {
    return fail(
      'owner-operation',
      'Owner operation is visible and status-consistent in Owner-App',
      `Owner dashboard operations do not match visible Admin operations. Missing: ${missing.join(', ') || '-'}; unexpected: ${unexpected.join(', ') || '-'}.`,
      'Runbook gate 22 Owner-Operation',
    )
  }

  const firstOperation = visibleOperations[0]
  if (!firstOperation.title || !firstOperation.operation_type || !firstOperation.status) {
    return fail(
      'owner-operation',
      'Owner operation is visible and status-consistent in Owner-App',
      `Owner operation ${firstOperation.id} is missing title, operation_type or status.`,
      'Runbook gate 22 Owner-Operation',
    )
  }

  return pass(
    'owner-operation',
    'Owner operation is visible and status-consistent in Owner-App',
    {
      count: visibleOperations.length,
      first: {
        id: firstOperation.id,
        propertyId: firstOperation.property_id,
        title: firstOperation.title,
        operationType: firstOperation.operation_type,
        status: firstOperation.status,
        visibility: firstOperation.visibility,
      },
    },
    'Runbook gate 22 Owner-Operation',
  )
}

function buildAuditResult(auditLogs, records) {
  if (auditLogs.length === 0) {
    return fail(
      'owner-audit-log',
      'Owner-facing changes are audit-visible',
      'No admin_audit_logs entries found for the selected owner profile/access/document/statement/operation records.',
      'Runbook gate 23 Audit-Log',
    )
  }

  return pass(
    'owner-audit-log',
    'Owner-facing changes are audit-visible',
    {
      count: auditLogs.length,
      latest: auditLogs.slice(0, 5).map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entity_type,
        entityId: log.entity_id,
        createdAt: log.created_at,
      })),
      checkedRecords: records,
    },
    'Runbook gate 23 Audit-Log',
  )
}

async function main() {
  if (missingEnv.length > 0) return buildMissingEnvOutput()

  const adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  const ownerClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const adminSignIn = await adminClient.auth.signInWithPassword({
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
  })

  if (adminSignIn.error) {
    return {
      ok: false,
      purpose: 'Prepare admin parity Block 5 evidence: Owner-App.',
      requiredEnv: envStatus,
      optionalSelectors,
      counts: { checks: 1, passed: 0, blockers: 1 },
      results: [
        fail('admin-login', 'Admin login for Block 5 read checks', 'Admin login failed. Complete Block 1 first.', 'Runbook gate 1 Admin-Login'),
      ],
      blockers: [
        {
          id: 'admin-login',
          evidenceTarget: 'Runbook gate 1 Admin-Login',
          summary: 'Admin login failed. Complete Block 1 first.',
        },
      ],
      nextActions: [
        {
          id: 'complete-block1',
          label: 'Complete Block 1 before Block 5',
          verifyWith: 'npm run qa:admin-parity:block1',
        },
      ],
    }
  }

  const ownerSignIn = await ownerClient.auth.signInWithPassword({
    email: env.OWNER_EMAIL,
    password: env.OWNER_PASSWORD,
  })

  if (ownerSignIn.error) {
    return {
      ok: false,
      purpose: 'Prepare admin parity Block 5 evidence: Owner-App.',
      requiredEnv: envStatus,
      optionalSelectors,
      counts: { checks: 1, passed: 0, blockers: 1 },
      results: [
        fail('owner-login', 'Owner login for Block 5 read checks', 'Owner login failed. Create or repair the current Owner test account.', 'Runbook gate 20 Owner-Dokument'),
      ],
      blockers: [
        {
          id: 'owner-login',
          evidenceTarget: 'Runbook gate 20 Owner-Dokument',
          summary: 'Owner login failed. Create or repair the current Owner test account.',
        },
      ],
      nextActions: [
        {
          id: 'repair-owner-test-login',
          label: 'Create or repair active Owner test login',
          verifyWith: 'npm run qa:admin-parity:block5',
        },
      ],
    }
  }

  const [dashboard, ownerProfile] = await Promise.all([
    readOwnerDashboard(ownerClient),
    selectAdminOwnerProfile(adminClient),
  ])
  const accessRows = await readOwnerAccess(adminClient, ownerProfile?.id)
  const propertyIds = [...new Set(accessRows.map((row) => row.property_id))]
  const [documents, statements, operations] = await Promise.all([
    readOwnerDocuments(adminClient, propertyIds),
    readOwnerStatements(adminClient, propertyIds),
    readOwnerOperations(adminClient, propertyIds),
  ])

  const selectedRecords = [
    { entityType: 'owner_profile', entityId: ownerProfile?.id },
    { entityType: 'owner_profiles', entityId: ownerProfile?.id },
    ...accessRows.flatMap((row) => [
      { entityType: 'owner_property_access', entityId: row.id },
      { entityType: 'owner_access', entityId: row.id },
    ]),
    ...documents.flatMap((document) => [
      { entityType: 'owner_document', entityId: document.id },
      { entityType: 'owner_documents', entityId: document.id },
    ]),
    ...statements.flatMap((statement) => [
      { entityType: 'owner_statement', entityId: statement.id },
      { entityType: 'owner_statements', entityId: statement.id },
    ]),
    ...operations.flatMap((operation) => [
      { entityType: 'owner_operation', entityId: operation.id },
      { entityType: 'owner_operations', entityId: operation.id },
    ]),
  ].filter((record) => record.entityId)
  const auditLogs = await readAuditLogs(adminClient, selectedRecords)

  const results = [
    buildProfileResult(ownerProfile, dashboard),
    buildAccessResult(accessRows, dashboard),
    buildDocumentResult(documents, dashboard),
    buildStatementResult(statements, accessRows, dashboard),
    buildOperationResult(operations, accessRows, dashboard),
    buildAuditResult(auditLogs, selectedRecords),
  ]
  const blockers = results.filter((result) => !result.ok)

  return {
    ok: blockers.length === 0,
    purpose: 'Prepare admin parity Block 5 evidence: Owner-App.',
    requiredEnv: envStatus,
    optionalSelectors,
    selectedRecords: {
      ownerProfileId: ownerProfile?.id ?? null,
      propertyIds,
      documentIds: ids(documents),
      statementIds: ids(statements),
      operationIds: ids(operations),
    },
    counts: {
      checks: results.length,
      passed: results.filter((result) => result.ok).length,
      blockers: blockers.length,
      dashboardProperties: asArray(dashboard?.properties).length,
      dashboardDocuments: asArray(dashboard?.documents).length,
      dashboardStatements: asArray(dashboard?.statements).length,
      dashboardOperations: asArray(dashboard?.operations).length,
      adminAccessRows: accessRows.length,
      adminDocuments: documents.length,
      adminStatements: statements.length,
      adminOperations: operations.length,
      auditLogs: auditLogs.length,
    },
    results,
    blockers: blockers.map((result) => ({
      id: result.id,
      label: result.label,
      evidenceTarget: result.evidenceTarget,
      summary: result.summary,
    })),
    nextActions: blockers.length > 0
      ? [
          {
            id: 'complete-owner-data',
            label: 'Complete missing owner-facing records in Admin/Supabase',
            detail: 'Use the blocker summaries to repair active Owner profile/access, visible document, visible/paid statement, owner-visible operation and audit evidence.',
            verifyWith: 'npm run qa:admin-parity:block5',
          },
          {
            id: 'capture-manual-evidence',
            label: 'Capture Owner screenshots and Supabase IDs in the admin parity run table',
            detail: 'This script is only a read check. Manual evidence in docs/qa/admin-parity is still required.',
            verifyWith: 'npm run qa:admin-parity:status',
          },
        ]
      : [
          {
            id: 'capture-manual-evidence',
            label: 'Capture the passing Owner IDs, screenshots and audit rows in the admin parity run table',
            verifyWith: 'npm run qa:admin-parity:status',
          },
        ],
  }
}

main()
  .then((output) => {
    console.log(JSON.stringify(output, null, 2))
    if (!output.ok) process.exitCode = 1
  })
  .catch((error) => {
    console.error(JSON.stringify({
      ok: false,
      purpose: 'Prepare admin parity Block 5 evidence: Owner-App.',
      error: error.message,
    }, null, 2))
    process.exitCode = 1
  })
