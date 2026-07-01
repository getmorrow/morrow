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
    id: 'guest:test-stay',
    label: 'Guest test booking',
    names: ['GUEST_BOOKING_ID', 'GUEST_ACCESS_CODE'],
    requireAll: true,
  },
]

const envStatus = requiredEnvGroups.map((group) => {
  const missingNames = group.names.filter((name) => !has(name))
  return {
    id: group.id,
    label: group.label,
    ok: group.requireAll ? missingNames.length === 0 : group.names.some(has),
    acceptedNames: group.names,
    missingNames,
  }
})
const missingEnv = envStatus.filter((group) => !group.ok)

function pass(id, label, evidence, target) {
  return { id, label, ok: true, evidence, evidenceTarget: target }
}

function fail(id, label, summary, target) {
  return { id, label, ok: false, summary, evidenceTarget: target }
}

function bookingValue(booking, camelKey, snakeKey = camelKey) {
  return booking?.[camelKey] ?? booking?.[snakeKey] ?? null
}

function buildMissingEnvOutput() {
  return {
    ok: false,
    purpose: 'Prepare admin parity Block 3 evidence: Gaeste-App Und Kommunikation.',
    checkedEnvSources: {
      shell: true,
      envLocal: qaEnv.envLocalExists,
    },
    requiredEnv: envStatus,
    counts: {
      checks: 0,
      passed: 0,
      blockers: missingEnv.length,
    },
    blockers: missingEnv.map((group) => ({
      id: group.id,
      label: group.label,
      acceptedNames: group.acceptedNames,
      missingNames: group.missingNames,
    })),
    nextActions: [
      {
        id: 'complete-block1-and-set-guest-test-stay',
        label: 'Set admin access and current guest test booking',
        detail: 'Block 3 needs both the guest access path and the signed-in admin read path.',
        requiredEnv: ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'GUEST_BOOKING_ID', 'GUEST_ACCESS_CODE'],
        verifyWith: 'npm run qa:admin-parity:block3',
      },
      {
        id: 'rerun-status',
        label: 'Rerun the admin parity status report',
        verifyWith: 'npm run qa:admin-parity:status',
      },
    ],
  }
}

async function readGuestStay(guestClient) {
  const { data, error } = await guestClient.rpc('get_guest_stay', {
    p_booking_id: env.GUEST_BOOKING_ID,
    p_access_code: env.GUEST_ACCESS_CODE,
  })

  if (error) throw error
  return data
}

async function readGuestSupportEvents(guestClient) {
  const { data, error } = await guestClient.rpc('get_guest_support_events', {
    p_booking_id: env.GUEST_BOOKING_ID,
    p_access_code: env.GUEST_ACCESS_CODE,
  })

  if (error) throw error
  return Array.isArray(data) ? data : []
}

async function readSupportMessages(adminClient, booking, leadId) {
  const bookingId = env.GUEST_BOOKING_ID
  const filters = [`booking_id.eq.${bookingId}`, `id.eq.${bookingId}`]
  if (leadId) filters.push(`lead_id.eq.${leadId}`)

  const { data, error } = await adminClient
    .from('support_messages')
    .select('id,lead_id,booking_id,category,status,urgency,message,subject,created_at,payload')
    .or(filters.join(','))
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error

  return (data ?? []).filter((message) => {
    const payload = message.payload && typeof message.payload === 'object' ? message.payload : {}
    return (
      message.booking_id === bookingId ||
      message.lead_id === leadId ||
      payload.bookingId === bookingId ||
      payload.booking_id === bookingId ||
      payload.leadId === leadId
    )
  })
}

async function readCommunicationEvents(adminClient, booking, leadId, supportMessages) {
  const bookingId = env.GUEST_BOOKING_ID
  const supportIds = supportMessages.map((message) => message.id)
  const filters = [`booking_id.eq.${bookingId}`]
  if (leadId) filters.push(`lead_id.eq.${leadId}`)
  if (supportIds.length > 0) filters.push(`support_id.in.(${supportIds.join(',')})`)

  const { data, error } = await adminClient
    .from('communication_events')
    .select('id,lead_id,booking_id,customer_id,support_id,channel,direction,event_type,subject,status,provider,created_at,payload')
    .or(filters.join(','))
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error

  return (data ?? []).filter((event) => {
    const payload = event.payload && typeof event.payload === 'object' ? event.payload : {}
    return (
      event.booking_id === bookingId ||
      event.lead_id === leadId ||
      supportIds.includes(event.support_id) ||
      supportIds.includes(payload.supportId) ||
      payload.bookingId === bookingId ||
      payload.leadId === leadId
    )
  })
}

async function readFeedback(adminClient, booking, leadId) {
  const bookingId = env.GUEST_BOOKING_ID
  const filters = [`booking_id.eq.${bookingId}`]
  if (leadId) filters.push(`lead_id.eq.${leadId}`)

  const { data, error } = await adminClient
    .from('guest_feedback')
    .select('id,lead_id,booking_id,rating,return_interest,created_at,payload')
    .or(filters.join(','))
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) throw error
  return data ?? []
}

async function main() {
  if (missingEnv.length > 0) return buildMissingEnvOutput()

  const guestClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const signIn = await adminClient.auth.signInWithPassword({
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
  })

  if (signIn.error) {
    return {
      ok: false,
      purpose: 'Prepare admin parity Block 3 evidence: Gaeste-App Und Kommunikation.',
      requiredEnv: envStatus,
      counts: { checks: 1, passed: 0, blockers: 1 },
      results: [
        fail('admin-login', 'Admin login for Block 3 read checks', 'Admin login failed. Complete Block 1 first.', 'Runbook gate 1 Admin-Login'),
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
          label: 'Complete Block 1 before Block 3',
          detail: 'Block 3 must use the same signed-in admin path that is accepted in Block 1.',
          verifyWith: 'npm run qa:admin-parity:block1',
        },
      ],
    }
  }

  try {
    const profile = await adminClient.rpc('get_morrow_admin_profile')
    if (profile.error || profile.data?.status !== 'active') {
      throw profile.error ?? new Error('Admin profile is missing or inactive.')
    }

    const stay = await readGuestStay(guestClient)
    const supportThreads = await readGuestSupportEvents(guestClient)
    const booking = stay?.booking
    const packageItem = stay?.package
    const leadId = bookingValue(booking, 'leadId', 'lead_id')
    const supportMessages = booking ? await readSupportMessages(adminClient, booking, leadId) : []
    const communicationEvents = booking ? await readCommunicationEvents(adminClient, booking, leadId, supportMessages) : []
    const feedback = booking ? await readFeedback(adminClient, booking, leadId) : []

    const results = []

    const guestStayOk = Boolean(booking && packageItem)
    results.push(guestStayOk
      ? pass('guest-stay-rpc', 'Guest stay opens with booking and package', {
        bookingId: env.GUEST_BOOKING_ID,
        bookingStatus: bookingValue(booking, 'status'),
        packageName: packageItem.name ?? null,
      }, 'Runbook gate 11 Gaestebereich oeffnen')
      : fail('guest-stay-rpc', 'Guest stay opens with booking and package', 'get_guest_stay did not return booking and package.', 'Runbook gate 11 Gaestebereich oeffnen'))

    const visibleStatus = bookingValue(booking, 'status')
    const guestVisible = ['Bezahlt', 'Vor Anreise', 'Aktiv', 'Abgeschlossen'].includes(visibleStatus)
    results.push(guestVisible
      ? pass('guest-visible-status', 'Booking status is guest-visible', { bookingId: env.GUEST_BOOKING_ID, status: visibleStatus }, 'Runbook gate 11 Gaestebereich oeffnen')
      : fail('guest-visible-status', 'Booking status is guest-visible', `Booking status is not guest-visible: ${visibleStatus || 'missing'}.`, 'Runbook gate 11 Gaestebereich oeffnen'))

    results.push(supportMessages.length > 0
      ? pass('support-message-admin', 'Guest support message is visible in Admin data', {
        count: supportMessages.length,
        latestSupportId: supportMessages[0].id,
        status: supportMessages[0].status,
      }, 'Runbook gate 12 Support senden')
      : fail('support-message-admin', 'Guest support message is visible in Admin data', 'No support message linked to this booking/lead.', 'Runbook gate 12 Support senden'))

    const threadWithReply = supportThreads.find((thread) => Array.isArray(thread.replies) && thread.replies.length > 0)
    const supportReplyEvent = communicationEvents.find((event) => (
      event.support_id ||
      String(event.event_type ?? '').startsWith('support:') ||
      (event.payload && typeof event.payload === 'object' && event.payload.supportId)
    ))
    results.push(threadWithReply && supportReplyEvent
      ? pass('support-reply-visible', 'Support reply is visible to guest and in communication events', {
        supportId: threadWithReply.id,
        replies: threadWithReply.replies.length,
        communicationEventId: supportReplyEvent.id,
      }, 'Runbook gate 13 Support beantworten')
      : fail('support-reply-visible', 'Support reply is visible to guest and in communication events', 'No guest-visible support reply plus related communication event found.', 'Runbook gate 13 Support beantworten'))

    const feedbackCommunicationEvent = communicationEvents.find((event) => event.event_type === 'guest_feedback')
    results.push(feedback.length > 0
      ? pass('guest-feedback', 'Guest feedback is stored for this booking/lead', {
        feedbackId: feedback[0].id,
        rating: feedback[0].rating,
        returnInterest: feedback[0].return_interest,
      }, 'Runbook gate 14 Feedback senden')
      : fail('guest-feedback', 'Guest feedback is stored for this booking/lead', 'No guest_feedback row linked to this booking/lead.', 'Runbook gate 14 Feedback senden'))

    results.push(feedbackCommunicationEvent
      ? pass('feedback-communication-event', 'Feedback is mirrored in communication history', {
        communicationEventId: feedbackCommunicationEvent.id,
        status: feedbackCommunicationEvent.status,
      }, 'Runbook gate 24 Kommunikationshistorie')
      : fail('feedback-communication-event', 'Feedback is mirrored in communication history', 'No guest_feedback communication event linked to this booking/lead.', 'Runbook gate 24 Kommunikationshistorie'))

    const historyChannels = new Set(communicationEvents.map((event) => event.channel).filter(Boolean))
    results.push(communicationEvents.length > 0
      ? pass('central-communication-history', 'Central communication history has linked events', {
        count: communicationEvents.length,
        channels: Array.from(historyChannels),
        latestEventId: communicationEvents[0].id,
      }, 'Runbook gate 24 Kommunikationshistorie')
      : fail('central-communication-history', 'Central communication history has linked events', 'No communication_events rows linked to this booking/lead/support flow.', 'Runbook gate 24 Kommunikationshistorie'))

    const blockers = results
      .filter((result) => !result.ok)
      .map((result) => ({
        id: result.id,
        evidenceTarget: result.evidenceTarget,
        summary: result.summary,
      }))

    return {
      ok: blockers.length === 0,
      purpose: 'Prepare admin parity Block 3 evidence: Gaeste-App Und Kommunikation.',
      checkedEnvSources: {
        shell: true,
        envLocal: qaEnv.envLocalExists,
      },
      selectors: {
        bookingId: env.GUEST_BOOKING_ID,
        leadId: leadId ?? null,
      },
      requiredEnv: envStatus,
      nextManualEvidence: [
        'Screenshot Gäste-App Start/Buchung/Hilfe for the selected booking.',
        'Support message ID from support_messages and Admin support screenshot.',
        'Communication event ID for the support reply and guest-visible reply screenshot.',
        'Feedback ID from guest_feedback and Admin feedback screenshot.',
        'Communication history screenshot showing support and feedback events.',
      ],
      counts: {
        checks: results.length,
        passed: results.filter((result) => result.ok).length,
        blockers: blockers.length,
      },
      results,
      blockers,
      nextActions: buildNextActions(blockers),
    }
  } finally {
    await adminClient.auth.signOut()
  }
}

function buildNextActions(blockers) {
  const blockerIds = new Set(blockers.map((blocker) => blocker.id))
  const actions = []

  if (blockerIds.has('guest-stay-rpc') || blockerIds.has('guest-visible-status')) {
    actions.push({
      id: 'fix-or-seed-guest-test-booking',
      label: 'Set a guest-visible paid/current test booking',
      detail: 'Use a booking with status Bezahlt, Vor Anreise, Aktiv or Abgeschlossen and a working access code.',
      requiredEnv: ['GUEST_BOOKING_ID', 'GUEST_ACCESS_CODE'],
      prepareWith: 'npm run supabase:seed-active-guest-test',
      verifyWith: 'npm run supabase:verify-guest',
    })
  }

  if (blockerIds.has('support-message-admin')) {
    actions.push({
      id: 'send-support-from-guest-app',
      label: 'Send a support message from the selected guest stay',
      detail: 'Open the guest stay, send a help/support message, then verify it appears in Admin support.',
    })
  }

  if (blockerIds.has('support-reply-visible')) {
    actions.push({
      id: 'reply-to-support-from-admin',
      label: 'Reply to the support case from Admin',
      detail: 'The reply must create a communication event and be visible in the guest support timeline.',
    })
  }

  if (blockerIds.has('guest-feedback') || blockerIds.has('feedback-communication-event')) {
    actions.push({
      id: 'submit-guest-feedback',
      label: 'Submit feedback from the selected guest stay',
      detail: 'Feedback must create a guest_feedback row and a guest_feedback communication event.',
    })
  }

  if (blockerIds.has('central-communication-history')) {
    actions.push({
      id: 'capture-communication-history',
      label: 'Capture central communication history evidence',
      detail: 'The latest admin parity run needs linked communication_events evidence for support and feedback.',
    })
  }

  if (blockers.length === 0) {
    actions.push({
      id: 'collect-manual-block3-evidence',
      label: 'Collect manual Block 3 evidence',
      detail: 'Add screenshots, support/feedback row IDs and communication event IDs to the latest admin parity run before marking gates 11-14 and 24 complete.',
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
