import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const bookingId = process.env.GUEST_BOOKING_ID || '11111111-1111-4111-8111-111111111111'
const accessCode = process.env.GUEST_ACCESS_CODE || 'MORROW1'
const guestBaseUrl = process.env.GUEST_BASE_URL?.replace(/\/$/, '')
const shouldSeed = process.env.GUEST_VERIFY_SEED === '1'
const shouldVerifySupportReply = process.env.GUEST_VERIFY_SUPPORT_REPLY === '1'
const screenshotsDir = 'tmp/qa/guest-stay'

function requireEnv(value, name) {
  if (!value) {
    console.error(`Missing ${name}`)
    process.exit(1)
  }
}

function fail(message, error) {
  console.error(`guest-stay-check-failed: ${message}`)
  if (error) console.error(error.message ?? error)
  process.exit(1)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

if (shouldSeed) {
  await import('./seed-supabase-active-guest-test.mjs')
}

requireEnv(supabaseUrl, 'SUPABASE_URL/VITE_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL')
requireEnv(anonKey, 'SUPABASE_ANON_KEY/VITE_SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY')

const supabase = createClient(supabaseUrl, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const serviceClient = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  : null

const { data: stay, error: stayError } = await supabase.rpc('get_guest_stay', {
  p_booking_id: bookingId,
  p_access_code: accessCode,
})

if (stayError) fail('RPC get_guest_stay failed', stayError)
assert(stay?.booking, 'RPC get_guest_stay did not return a booking')
assert(stay?.package, 'RPC get_guest_stay did not return a package')

const booking = stay.booking
const packageItem = stay.package

assert(booking.guestAccessCode === accessCode || booking.guest_access_code === accessCode, 'Guest access code mismatch')
assert(['Bezahlt', 'Vor Anreise', 'Aktiv', 'Abgeschlossen'].includes(booking.status), `Booking status is not guest-visible: ${booking.status}`)
assert(Boolean(packageItem.name), 'Package name missing')
assert(Boolean(packageItem.stay || packageItem.propertyId), 'Package stay/property data missing')

const result = {
  rpc: {
    checked: true,
    bookingId,
    bookingStatus: booking.status,
    packageName: packageItem.name,
    guestName: booking.customerName ?? booking.name ?? null,
  },
}

const { data: supportEvents, error: supportEventsError } = await supabase.rpc('get_guest_support_events', {
  p_booking_id: bookingId,
  p_access_code: accessCode,
})

if (supportEventsError) fail('RPC get_guest_support_events failed', supportEventsError)
assert(Array.isArray(supportEvents), 'RPC get_guest_support_events did not return an array')
result.support = {
  checked: true,
  threads: supportEvents.length,
}

if (shouldVerifySupportReply) {
  if (!serviceClient) fail('GUEST_VERIFY_SUPPORT_REPLY requires SUPABASE_SERVICE_ROLE_KEY')

  const supportId = `guest-support-verify-${Date.now()}`
  let communicationEventId = null

  try {
    const { error: supportInsertError } = await supabase.from('support_messages').insert({
      id: supportId,
      lead_id: booking.leadId ?? booking.lead_id ?? null,
      category: 'general',
      message: `Guest support verification message ${supportId}`,
      urgency: 'normal',
      payload: {
        source: 'next-guest',
        bookingId,
        guestName: booking.customerName ?? booking.name ?? null,
        qaMarker: supportId,
      },
    })

    if (supportInsertError) fail('Guest support insert failed', supportInsertError)

    const { data: communicationEvent, error: communicationInsertError } = await serviceClient
      .from('communication_events')
      .insert({
        lead_id: booking.leadId ?? booking.lead_id ?? null,
        booking_id: bookingId,
        channel: 'email',
        direction: 'outbound',
        event_type: `support:${supportId}`,
        subject: 'Antwort von Morrow',
        body: 'Diese Antwort sollte im Gästebereich sichtbar sein.',
        actor: 'qa@getmorrow.de',
        status: 'sent',
        payload: {
          source: 'guest-support-verification',
          supportId,
        },
      })
      .select('id')
      .single()

    if (communicationInsertError) fail('Guest support reply insert failed', communicationInsertError)
    communicationEventId = communicationEvent.id

    const { data: supportEventsWithReply, error: supportEventsReplyError } = await supabase.rpc('get_guest_support_events', {
      p_booking_id: bookingId,
      p_access_code: accessCode,
    })

    if (supportEventsReplyError) fail('RPC get_guest_support_events failed after reply insert', supportEventsReplyError)
    const visibleThread = supportEventsWithReply?.find((thread) => thread.id === supportId)
    assert(visibleThread, 'Inserted guest support thread was not returned')
    assert(visibleThread.replies?.length === 1, 'Inserted guest support reply was not returned')

    result.support.replyChecked = true
  } finally {
    if (communicationEventId) {
      await serviceClient.from('communication_events').delete().eq('id', communicationEventId)
    }
    await serviceClient.from('support_messages').delete().eq('id', supportId)
  }
}

if (guestBaseUrl) {
  const { chromium } = await import('playwright')
  fs.mkdirSync(screenshotsDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 1 })
  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  try {
    const stayUrl = `${guestBaseUrl}/deine-auszeit/${encodeURIComponent(bookingId)}?code=${encodeURIComponent(accessCode)}`
    const response = await page.goto(stayUrl, { waitUntil: 'networkidle' })
    assert(response?.ok(), `Guest stay page returned ${response?.status()}`)

    const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim()
    assert(!/404 Diese Seite gibt es noch nicht/i.test(body), 'Guest stay page rendered soft 404')

    for (const text of ['Gästebereich', 'Auszeit', 'Buchung', 'Vor Ort', 'Hilfe']) {
      assert(body.toLowerCase().includes(text.toLowerCase()), `Guest stay page is missing ${text}`)
    }

    const screenshot = `${screenshotsDir}/mobile.png`
    await page.screenshot({ path: screenshot, fullPage: false })
    result.browser = {
      checked: true,
      url: stayUrl,
      screenshot,
    }
  } finally {
    await browser.close()
  }

  if (consoleErrors.length > 0) {
    fail(`Guest stay page has console errors:\n${consoleErrors.join('\n')}`)
  }
} else {
  result.browser = {
    checked: false,
    reason: 'GUEST_BASE_URL not set; checked RPC only.',
  }
}

console.log(JSON.stringify({
  ok: true,
  ...result,
}, null, 2))
