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
]

const envStatus = requiredEnvGroups.map((group) => ({
  id: group.id,
  label: group.label,
  ok: group.names.some(has),
  acceptedNames: group.names,
}))
const missingEnv = envStatus.filter((group) => !group.ok)

const explicitLeadId = firstUsable(['QA_BLOCK2_LEAD_ID', 'TEST_LEAD_ID', 'GUEST_LEAD_ID'])
const explicitBookingId = firstUsable(['QA_BLOCK2_BOOKING_ID', 'TEST_BOOKING_ID', 'GUEST_BOOKING_ID'])

const evidenceTargets = [
  'Runbook gate 2 Neuer Gastlead',
  'Runbook gate 3 Leadstatus ändern',
  'Runbook gate 4 Wiedervorlage setzen',
  'Runbook gate 5 Lead archivieren/reaktivieren',
  'Runbook gate 6 Lead reservieren',
  'Runbook gate 7 Kunde prüfen',
  'Runbook gate 8 Aufgabe erstellen',
  'Runbook gate 9 Aufgabenbezug öffnen',
  'Runbook gate 10 Buchung bearbeiten',
]

function buildMissingEnvOutput() {
  return {
    ok: false,
    purpose: 'Prepare admin parity Block 2 evidence: Anfrage Zu Kunde Und Buchung.',
    checkedEnvSources: {
      shell: true,
      envLocal: qaEnv.envLocalExists,
    },
    requiredEnv: envStatus,
    optionalSelectors: {
      leadId: {
        acceptedNames: ['QA_BLOCK2_LEAD_ID', 'TEST_LEAD_ID', 'GUEST_LEAD_ID'],
        configured: Boolean(explicitLeadId),
      },
      bookingId: {
        acceptedNames: ['QA_BLOCK2_BOOKING_ID', 'TEST_BOOKING_ID', 'GUEST_BOOKING_ID'],
        configured: Boolean(explicitBookingId),
      },
    },
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
        id: 'set-admin-test-login',
        label: 'Set current admin QA credentials locally',
        detail: 'Block 2 reads the live CRM state through the same admin access path that must be accepted in Block 1.',
        requiredEnv: ['ADMIN_EMAIL', 'ADMIN_PASSWORD'],
        verifyWith: 'npm run qa:admin-parity:block2',
      },
      {
        id: 'select-or-create-block2-test-flow',
        label: 'Select a current test flow for Anfrage zu Kunde und Buchung',
        detail: 'Use an existing QA guest lead or create one through the website, then reserve it in Admin before running this check again.',
        optionalEnv: ['QA_BLOCK2_LEAD_ID', 'QA_BLOCK2_BOOKING_ID'],
      },
      {
        id: 'rerun-status',
        label: 'Rerun the admin parity status report',
        verifyWith: 'npm run qa:admin-parity:status',
      },
    ],
  }
}

function pass(id, label, evidence, target) {
  return { id, label, ok: true, evidence, evidenceTarget: target }
}

function fail(id, label, summary, target) {
  return { id, label, ok: false, summary, evidenceTarget: target }
}

function payloadObject(row) {
  return row?.payload && typeof row.payload === 'object' ? row.payload : {}
}

function getPayloadText(row, keys) {
  const payload = payloadObject(row)
  for (const key of keys) {
    const raw = payload[key]
    if (typeof raw === 'string' && raw.trim()) return raw.trim()
  }
  return ''
}

async function findLead(client) {
  if (explicitLeadId) {
    const { data, error } = await client
      .from('leads')
      .select('id,type,status,name,email,phone,package_slug,follow_up_at,archived_at,created_at,payload')
      .eq('id', explicitLeadId)
      .maybeSingle()

    if (error) throw error
    return data
  }

  const { data, error } = await client
    .from('leads')
    .select('id,type,status,name,email,phone,package_slug,follow_up_at,archived_at,created_at,payload')
    .eq('type', 'guest')
    .in('status', ['Reserviert', 'Bezahlt', 'Vor Anreise', 'Aktiv', 'Abgeschlossen'])
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw error
  if (data?.[0]) return data[0]

  const fallback = await client
    .from('leads')
    .select('id,type,status,name,email,phone,package_slug,follow_up_at,archived_at,created_at,payload')
    .eq('type', 'guest')
    .order('created_at', { ascending: false })
    .limit(1)

  if (fallback.error) throw fallback.error
  return fallback.data?.[0] ?? null
}

async function findBooking(client, lead) {
  if (explicitBookingId) {
    const { data, error } = await client
      .from('bookings')
      .select('id,lead_id,customer_id,status,payment_status,guest_access_code,guest_name,guest_email,selected_date,adults,children,children_ages,dog,check_in_status,experience_status,next_task,created_at,payload')
      .eq('id', explicitBookingId)
      .maybeSingle()

    if (error) throw error
    return data
  }

  const { data, error } = await client
    .from('bookings')
    .select('id,lead_id,customer_id,status,payment_status,guest_access_code,guest_name,guest_email,selected_date,adults,children,children_ages,dog,check_in_status,experience_status,next_task,created_at,payload')
    .or(`lead_id.eq.${lead.id},id.eq.${lead.id}`)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw error
  return data?.[0] ?? null
}

async function findCustomer(client, lead, booking) {
  const customerIds = [
    booking?.customer_id,
    getPayloadText(booking, ['customerId']),
  ].filter(Boolean)

  if (customerIds.length > 0) {
    const { data, error } = await client
      .from('customers')
      .select('id,primary_lead_id,name,email,phone,customer_type,notes,payload,created_at')
      .in('id', customerIds)
      .limit(1)

    if (error) throw error
    if (data?.[0]) return data[0]
  }

  const { data, error } = await client
    .from('customers')
    .select('id,primary_lead_id,name,email,phone,customer_type,notes,payload,created_at')
    .or(`primary_lead_id.eq.${lead.id},email.eq.${lead.email}`)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw error
  return data?.[0] ?? null
}

async function findRelatedTask(client, lead, booking) {
  const referenceIds = [lead?.id, booking?.id].filter(Boolean)
  if (referenceIds.length === 0) return null

  const { data, error } = await client
    .from('admin_tasks')
    .select('id,title,reference_type,reference_id,reference_label,due_at,status,priority,created_at,payload')
    .in('reference_id', referenceIds)
    .in('reference_type', ['lead', 'booking'])
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw error
  return data?.[0] ?? null
}

async function findRelatedAuditLog(client, lead, booking, customer, task) {
  const entityIds = [lead?.id, booking?.id, customer?.id, task?.id].filter(Boolean)
  if (entityIds.length === 0) return null

  const { data, error } = await client
    .from('admin_audit_logs')
    .select('id,action,entity_type,entity_id,entity_label,created_at,payload')
    .in('entity_id', entityIds)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw error
  return data?.[0] ?? null
}

async function main() {
  if (missingEnv.length > 0) return buildMissingEnvOutput()

  const client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const signIn = await client.auth.signInWithPassword({
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
  })

  if (signIn.error) {
    return {
      ok: false,
      purpose: 'Prepare admin parity Block 2 evidence: Anfrage Zu Kunde Und Buchung.',
      requiredEnv: envStatus,
      counts: { checks: 1, passed: 0, blockers: 1 },
      results: [
        fail('admin-login', 'Admin login for Block 2 read checks', 'Admin login failed. Complete Block 1 first.', 'Runbook gate 1 Admin-Login'),
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
          id: 'complete-block1-first',
          label: 'Complete Block 1 before Block 2',
          detail: 'Block 2 must use the same signed-in admin path that is accepted in Block 1.',
          verifyWith: 'npm run qa:admin-parity:block1',
        },
      ],
    }
  }

  try {
    const profile = await client.rpc('get_morrow_admin_profile')
    if (profile.error || profile.data?.status !== 'active') {
      throw profile.error ?? new Error('Admin profile is missing or inactive.')
    }

    const lead = await findLead(client)
    const booking = lead ? await findBooking(client, lead) : null
    const customer = lead ? await findCustomer(client, lead, booking) : null
    const task = lead ? await findRelatedTask(client, lead, booking) : null
    const auditLog = lead ? await findRelatedAuditLog(client, lead, booking, customer, task) : null

    const results = []

    if (lead) {
      results.push(pass(
        'guest-lead',
        'Guest lead is readable in Admin',
        { id: lead.id, status: lead.status, type: lead.type, createdAt: lead.created_at },
        evidenceTargets[0],
      ))
    } else {
      results.push(fail(
        'guest-lead',
        'Guest lead is readable in Admin',
        'No guest lead candidate found. Create a QA lead through the website or set QA_BLOCK2_LEAD_ID.',
        evidenceTargets[0],
      ))
    }

    const statusShowsWork = Boolean(lead && lead.status && lead.status !== 'Neu')
    results.push(statusShowsWork
      ? pass('lead-status', 'Lead status progressed beyond Neu', { id: lead.id, status: lead.status }, evidenceTargets[1])
      : fail('lead-status', 'Lead status progressed beyond Neu', 'The selected lead has not proven a status change yet.', evidenceTargets[1]))

    const followUp = lead?.follow_up_at || getPayloadText(lead, ['followUpAt', 'follow_up_at'])
    results.push(followUp
      ? pass('lead-follow-up', 'Lead has a follow-up date', { id: lead.id, followUpAt: followUp }, evidenceTargets[2])
      : fail('lead-follow-up', 'Lead has a follow-up date', 'The selected lead has no follow_up_at evidence.', evidenceTargets[2]))

    results.push(lead && typeof lead.archived_at !== 'undefined'
      ? pass('lead-archive-field', 'Lead archive field is available for archive/reactivate flow', { id: lead.id, archivedAt: lead.archived_at ?? null }, evidenceTargets[3])
      : fail('lead-archive-field', 'Lead archive field is available for archive/reactivate flow', 'Lead archive field could not be read.', evidenceTargets[3]))

    results.push(booking
      ? pass('linked-booking', 'Lead has a linked booking/reservation', {
        id: booking.id,
        leadId: booking.lead_id,
        status: booking.status,
        paymentStatus: booking.payment_status,
        selectedDate: booking.selected_date,
      }, evidenceTargets[4])
      : fail('linked-booking', 'Lead has a linked booking/reservation', 'No booking linked to the selected lead. Reserve the lead in Admin.', evidenceTargets[4]))

    results.push(customer
      ? pass('linked-customer', 'Lead/booking has a linked customer record', {
        id: customer.id,
        primaryLeadId: customer.primary_lead_id,
        customerType: customer.customer_type,
      }, evidenceTargets[5])
      : fail('linked-customer', 'Lead/booking has a linked customer record', 'No customer linked to selected lead/booking.', evidenceTargets[5]))

    results.push(task
      ? pass('related-task', 'Lead or booking has a related task', {
        id: task.id,
        referenceType: task.reference_type,
        referenceId: task.reference_id,
        status: task.status,
        priority: task.priority,
      }, evidenceTargets[6])
      : fail('related-task', 'Lead or booking has a related task', 'No task linked to selected lead/booking.', evidenceTargets[6]))

    results.push(task?.reference_id && [lead?.id, booking?.id].includes(task.reference_id)
      ? pass('task-reference', 'Task reference points to the selected lead or booking', {
        taskId: task.id,
        referenceType: task.reference_type,
        referenceId: task.reference_id,
      }, evidenceTargets[7])
      : fail('task-reference', 'Task reference points to the selected lead or booking', 'No clickable task reference evidence found for selected lead/booking.', evidenceTargets[7]))

    const bookingEditableFields = Boolean(booking?.status && booking?.payment_status && booking?.guest_access_code)
    results.push(bookingEditableFields
      ? pass('booking-operational-fields', 'Booking has operational status, payment status and guest access code', {
        id: booking.id,
        status: booking.status,
        paymentStatus: booking.payment_status,
        guestAccessCodePresent: Boolean(booking.guest_access_code),
        checkInStatus: booking.check_in_status ?? null,
        experienceStatus: booking.experience_status ?? null,
      }, evidenceTargets[8])
      : fail('booking-operational-fields', 'Booking has operational status, payment status and guest access code', 'Booking is missing status, payment status or guest access code.', evidenceTargets[8]))

    results.push(auditLog
      ? pass('related-audit-log', 'Related admin audit log exists for the selected flow', {
        id: auditLog.id,
        action: auditLog.action,
        entityType: auditLog.entity_type,
        entityId: auditLog.entity_id,
        createdAt: auditLog.created_at,
      }, 'Runbook gate 23 Audit-Log')
      : fail('related-audit-log', 'Related admin audit log exists for the selected flow', 'No audit log found for selected lead, booking, customer or task.', 'Runbook gate 23 Audit-Log'))

    const blockers = results
      .filter((result) => !result.ok)
      .map((result) => ({
        id: result.id,
        evidenceTarget: result.evidenceTarget,
        summary: result.summary,
      }))

    return {
      ok: blockers.length === 0,
      purpose: 'Prepare admin parity Block 2 evidence: Anfrage Zu Kunde Und Buchung.',
      checkedEnvSources: {
        shell: true,
        envLocal: qaEnv.envLocalExists,
      },
      selectors: {
        explicitLeadId: explicitLeadId || null,
        explicitBookingId: explicitBookingId || null,
        selectedLeadId: lead?.id ?? null,
        selectedBookingId: booking?.id ?? null,
      },
      requiredEnv: envStatus,
      nextManualEvidence: [
        'Screenshot lead drawer after status/follow-up/archive test.',
        'Screenshot customer drawer with request and booking history.',
        'Screenshot booking drawer with status, payment, guest access code and next task.',
        'Screenshot task list/detail showing the task reference opens the correct object.',
        'Audit-log row IDs for lead_reserved, booking/task/customer updates.',
      ],
      counts: {
        checks: results.length,
        passed: results.filter((result) => result.ok).length,
        blockers: blockers.length,
      },
      results,
      blockers,
      nextActions: buildNextActions(blockers, lead, booking),
    }
  } finally {
    await client.auth.signOut()
  }
}

function buildNextActions(blockers, lead, booking) {
  const blockerIds = new Set(blockers.map((blocker) => blocker.id))
  const actions = []

  if (!lead || blockerIds.has('guest-lead')) {
    actions.push({
      id: 'create-guest-lead',
      label: 'Create or select a current QA guest lead',
      detail: 'Submit a test enquiry through the public website or set QA_BLOCK2_LEAD_ID to an existing guest lead.',
      verifyWith: 'npm run qa:admin-parity:block2',
    })
  }

  if (lead && (!booking || blockerIds.has('linked-booking') || blockerIds.has('linked-customer'))) {
    actions.push({
      id: 'reserve-lead-in-admin',
      label: 'Reserve the selected lead in Admin',
      detail: 'Block 2 needs evidence that a guest lead becomes a booking and customer record.',
      selectedLeadId: lead.id,
      verifyWith: 'QA_BLOCK2_LEAD_ID=<lead-id> npm run qa:admin-parity:block2',
    })
  }

  if (blockerIds.has('lead-status') || blockerIds.has('lead-follow-up') || blockerIds.has('lead-archive-field')) {
    actions.push({
      id: 'exercise-lead-crm-fields',
      label: 'Exercise lead status, follow-up and archive/reactivate flow',
      detail: 'Update status, set a follow-up, archive and reactivate the selected lead, then capture evidence in the QA run.',
      selectedLeadId: lead?.id ?? null,
    })
  }

  if (blockerIds.has('related-task') || blockerIds.has('task-reference')) {
    actions.push({
      id: 'create-linked-task',
      label: 'Create a linked task for the selected lead or booking',
      detail: 'The task must reference the selected lead or booking and its reference click must open the correct object.',
      selectedLeadId: lead?.id ?? null,
      selectedBookingId: booking?.id ?? null,
    })
  }

  if (blockerIds.has('booking-operational-fields')) {
    actions.push({
      id: 'complete-booking-operational-fields',
      label: 'Update booking operational fields',
      detail: 'Save status, payment status, guest access code, guest group and preparation fields in the booking drawer.',
      selectedBookingId: booking?.id ?? null,
    })
  }

  if (blockerIds.has('related-audit-log')) {
    actions.push({
      id: 'capture-or-fix-audit-log',
      label: 'Capture audit-log evidence for the selected flow',
      detail: 'If no audit row exists after the manual action, fix the missing audit write before accepting Block 2.',
      verifyWith: 'npm run qa:admin-audit',
    })
  }

  if (blockers.length === 0) {
    actions.push({
      id: 'collect-manual-block2-evidence',
      label: 'Collect manual Block 2 evidence',
      detail: 'Add screenshots, Supabase row IDs and audit-log IDs to the latest admin parity run before marking gates 2-10 complete.',
      update: 'docs/qa/admin-parity/<latest>-admin-parity-run.md',
    })
  }

  actions.push({
    id: 'rerun-status',
    label: 'Rerun the admin parity status report',
    verifyWith: 'npm run qa:admin-parity:status',
  })

  return actions
}

const output = await main()
const serialized = JSON.stringify(output, null, 2)

if (output.ok) {
  console.log(serialized)
} else {
  console.error(serialized)
  process.exit(1)
}
