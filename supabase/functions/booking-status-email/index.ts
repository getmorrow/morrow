import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type BookingStatus = 'Reserviert' | 'Bezahlt' | 'Vor Anreise'

type LeadPayload = {
  id: string
  type: 'guest'
  status: string
  name: string
  email: string
  phone?: string
  packageName?: string
  packageSlug?: string
  selectedDate?: string
  guests?: string
  adults?: string
  children?: string
  childrenAges?: string
  dog?: string
  reservationExpiresAt?: string
  paymentDueAt?: string
  followUpAt?: string
  checkInStatus?: string
  experienceStatus?: string
  bookingId?: string
  customerId?: string
}

type StayPayload = {
  name?: string
  address?: string
  checkInType?: string
  checkInInstructions?: string
  keyCode?: string
  latestArrival?: string
  checkOutTime?: string
  checkOutInstructions?: string
  houseRules?: string[]
}

type PackagePayload = {
  id?: string
  name?: string
  slug?: string
  location?: string
  stay?: StayPayload
  experienceItems?: Array<{
    title?: string
    role?: string
    providerName?: string
    confirmationStatus?: string
  }>
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resendApiKey = Deno.env.get('RESEND_API_KEY')
const fromEmail = Deno.env.get('MORROW_EMAIL_FROM') ?? 'Morrow <hello@morrow.local>'
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const defaultSiteUrl = Deno.env.get('MORROW_PUBLIC_SITE_URL') ?? 'https://www.getmorrow.de'

const serviceClient = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey)
  : null

const escapeHtml = (value = '') =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name

const guestAccessCode = ({ id, email }: Pick<LeadPayload, 'id' | 'email'>) => {
  const source = `${id}:${email.toLowerCase()}`
  let hash = 0

  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0
  }

  return Math.abs(hash).toString(36).padStart(6, '0').slice(0, 6).toUpperCase()
}

const guestAreaUrl = (lead: LeadPayload, baseUrl: string) =>
  `${baseUrl.replace(/\/$/, '')}/deine-auszeit/${lead.id}?code=${guestAccessCode(lead)}`

const eventTypeForStatus = (status: BookingStatus) => {
  if (status === 'Reserviert') return 'booking_reservation_option'
  if (status === 'Bezahlt') return 'booking_payment_confirmation'
  return 'booking_pre_arrival'
}

const guestSummary = (lead: LeadPayload) => {
  const parts = [
    lead.adults ? `${lead.adults} Erwachsene` : '',
    lead.children ? `${lead.children} Kinder` : '',
    lead.childrenAges ? `Alter: ${lead.childrenAges}` : '',
    lead.dog ? `Hund: ${lead.dog}` : '',
  ].filter(Boolean)

  if (parts.length > 0) return parts.join(' · ')
  return lead.guests
}

const dateLabel = (value?: string) => value || 'Termin nach Rücksprache'

const formatDate = (value?: string) => {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

const checkInTypeLabel = (type?: string) => {
  const labels: Record<string, string> = {
    key_safe: 'Schlüsselsafe',
    agency_pickup: 'Schlüsselabholung',
    personal_handover: 'Persönliche Übergabe',
    smartlock: 'Smartlock',
    unknown: 'Wird vorbereitet',
  }
  return labels[type ?? 'unknown'] ?? 'Wird vorbereitet'
}

const includedExperiences = (packageItem?: PackagePayload) =>
  (packageItem?.experienceItems ?? [])
    .filter((item) => item.role === 'included')
    .map((item) => item.title)
    .filter((title): title is string => Boolean(title))

const detailRows = (rows: Array<[string, string | undefined]>) =>
  rows
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `
      <tr>
        <td style="padding:10px 0;color:#6b675f;font-size:13px;letter-spacing:.08em;text-transform:uppercase;">${escapeHtml(label)}</td>
        <td style="padding:10px 0;color:#171715;font-size:16px;font-weight:700;text-align:right;">${escapeHtml(value)}</td>
      </tr>
    `)
    .join('')

const baseHtml = (title: string, intro: string, body: string, details = '', cta?: { label: string; url: string }) => `
  <!doctype html>
  <html lang="de">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin:0;background:#eee8d8;font-family:Arial,'Helvetica Neue',sans-serif;color:#171715;">
      <div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(intro)}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eee8d8;padding:28px 14px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fbf8ef;border:1px solid #ddd5c2;border-radius:24px;overflow:hidden;">
              <tr>
                <td style="padding:34px 34px 18px;">
                  <div style="font-size:30px;line-height:1;font-weight:900;letter-spacing:-.02em;">morrow</div>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 34px 10px;">
                  <div style="color:#756f42;font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;">Eure Auszeit</div>
                  <h1 style="margin:14px 0 16px;font-size:34px;line-height:1.06;letter-spacing:-.02em;color:#171715;">${escapeHtml(title)}</h1>
                  <p style="margin:0;color:#5f5b53;font-size:18px;line-height:1.6;">${escapeHtml(intro)}</p>
                </td>
              </tr>
              ${details ? `
                <tr>
                  <td style="padding:18px 34px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #ddd5c2;border-bottom:1px solid #ddd5c2;">
                      ${details}
                    </table>
                  </td>
                </tr>
              ` : ''}
              <tr>
                <td style="padding:24px 34px 34px;">
                  <p style="margin:0;color:#5f5b53;font-size:16px;line-height:1.7;">${body}</p>
                  ${cta ? `<a href="${escapeHtml(cta.url)}" style="display:inline-block;margin-top:24px;background:#756f42;color:#fbf8ef;text-decoration:none;border-radius:999px;padding:15px 22px;font-size:14px;font-weight:800;">${escapeHtml(cta.label)}</a>` : ''}
                  <p style="margin:26px 0 0;color:#171715;font-size:16px;line-height:1.7;">Liebe Grüße<br><strong>Morrow</strong></p>
                </td>
              </tr>
            </table>
            <p style="max-width:620px;margin:16px auto 0;color:#858074;font-size:12px;line-height:1.5;">
              Diese Nachricht gehört zu eurer Morrow-Auszeit.
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
`

const templateForStatus = (status: BookingStatus, lead: LeadPayload, packageItem: PackagePayload | undefined, baseUrl: string) => {
  const packageName = lead.packageName ?? packageItem?.name ?? 'eure Auszeit'
  const stay = packageItem?.stay
  const experiences = includedExperiences(packageItem)
  const guestUrl = guestAreaUrl(lead, baseUrl)

  if (status === 'Reserviert') {
    const subject = `Eure Auszeit ist für euch vorgemerkt`
    const text = [
      `Hallo ${firstName(lead.name)},`,
      '',
      `wir haben ${packageName} für euch vorgemerkt und prüfen die letzten Details persönlich.`,
      lead.reservationExpiresAt ? `Die Vormerkung halten wir bis ${formatDate(lead.reservationExpiresAt)}.` : 'Wir melden uns mit dem nächsten klaren Schritt.',
      lead.paymentDueAt ? `Zahlung / Bestätigung bis: ${formatDate(lead.paymentDueAt)}` : '',
      '',
      `Auszeit: ${packageName}`,
      `Termin: ${dateLabel(lead.selectedDate)}`,
      guestSummary(lead) ? `Reisegruppe: ${guestSummary(lead)}` : '',
      '',
      'Liebe Grüße',
      'Morrow',
    ].filter(Boolean).join('\n')

    return {
      subject,
      text,
      html: baseHtml(
        'Eure Auszeit ist vorgemerkt.',
        'Wir halten den Rahmen für euch und prüfen Unterkunft, Termin und Erlebnis final.',
        'Die Anfrage wird jetzt verbindlicher, bleibt aber persönlich begleitet. Wir melden uns mit dem nächsten klaren Schritt, damit ihr in Ruhe entscheiden und bestätigen könnt.',
        detailRows([
          ['Auszeit', packageName],
          ['Termin', dateLabel(lead.selectedDate)],
          ['Reisegruppe', guestSummary(lead)],
          ['Vormerkung bis', formatDate(lead.reservationExpiresAt)],
          ['Bestätigung bis', formatDate(lead.paymentDueAt)],
        ]),
      ),
    }
  }

  if (status === 'Bezahlt') {
    const subject = `Eure Morrow-Auszeit ist bestätigt`
    const text = [
      `Hallo ${firstName(lead.name)},`,
      '',
      `eure Auszeit ${packageName} ist bestätigt.`,
      'Euer privater Morrow-Bereich ist freigeschaltet. Dort findet ihr nach und nach alles Wichtige zu Unterkunft, Anreise, Erlebnis und Empfehlungen vor Ort.',
      '',
      `Gästebereich: ${guestUrl}`,
      `Zugangscode: ${guestAccessCode(lead)}`,
      '',
      `Termin: ${dateLabel(lead.selectedDate)}`,
      stay?.name ? `Unterkunft: ${stay.name}` : '',
      experiences.length > 0 ? `Erlebnis: ${experiences.join(', ')}` : '',
      '',
      'Liebe Grüße',
      'Morrow',
    ].filter(Boolean).join('\n')

    return {
      subject,
      text,
      html: baseHtml(
        'Eure Auszeit ist bestätigt.',
        'Der Rahmen steht. Ab jetzt findet ihr die wichtigsten Informationen in eurem privaten Morrow-Bereich.',
        `Wir bereiten die letzten Details weiter für euch vor. Im Gästebereich liegen Unterkunft, Anreise, Erlebnis und Empfehlungen an einem Ort. Zugangscode: ${guestAccessCode(lead)}.`,
        detailRows([
          ['Auszeit', packageName],
          ['Termin', dateLabel(lead.selectedDate)],
          ['Unterkunft', stay?.name],
          ['Erlebnis', experiences.join(', ') || undefined],
          ['Zugangscode', guestAccessCode(lead)],
        ]),
        { label: 'Gästebereich öffnen', url: guestUrl },
      ),
    }
  }

  const subject = `Alles Wichtige vor eurer Anreise`
  const text = [
    `Hallo ${firstName(lead.name)},`,
    '',
    `eure Auszeit ${packageName} rückt näher. Wir haben die wichtigsten Hinweise für euch zusammengelegt.`,
    '',
    `Gästebereich: ${guestUrl}`,
    `Zugangscode: ${guestAccessCode(lead)}`,
    '',
    stay?.address ? `Adresse: ${stay.address}` : '',
    stay?.latestArrival ? `Anreise möglich bis: ${stay.latestArrival}` : '',
    `Schlüssel: ${checkInTypeLabel(stay?.checkInType)}`,
    stay?.checkInInstructions ? `Hinweis: ${stay.checkInInstructions}` : '',
    stay?.keyCode ? `Code: ${stay.keyCode}` : '',
    stay?.checkOutTime ? `Check-out: ${stay.checkOutTime}` : '',
    experiences.length > 0 ? `Erlebnis: ${experiences.join(', ')}` : '',
    '',
    'Liebe Grüße',
    'Morrow',
  ].filter(Boolean).join('\n')

  return {
    subject,
    text,
    html: baseHtml(
      'Alles Wichtige vor eurer Anreise.',
      'Anreise, Schlüssel und erste Orientierung liegen für euch bereit.',
      `Öffnet vor der Fahrt am besten noch einmal euren Gästebereich. Dort findet ihr Unterkunft, Schlüsselhinweise, Empfehlungen vor Ort und direkte Hilfe, falls etwas unklar ist. Zugangscode: ${guestAccessCode(lead)}.`,
      detailRows([
        ['Auszeit', packageName],
        ['Termin', dateLabel(lead.selectedDate)],
        ['Adresse', stay?.address],
        ['Anreise bis', stay?.latestArrival],
        ['Schlüssel', checkInTypeLabel(stay?.checkInType)],
        ['Check-out', stay?.checkOutTime],
        ['Erlebnis', experiences.join(', ') || undefined],
      ]),
      { label: 'Gästebereich öffnen', url: guestUrl },
    ),
  }
}

async function assertMorrowAdmin(request: Request) {
  if (!serviceClient) throw new Error('Missing Supabase service client')
  const authHeader = request.headers.get('Authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return false

  const { data: userData, error: userError } = await serviceClient.auth.getUser(token)
  if (userError || !userData.user?.email) return false

  const { data, error } = await serviceClient
    .from('admin_users')
    .select('id')
    .eq('status', 'active')
    .ilike('email', userData.user.email)
    .limit(1)

  if (error) throw error
  return Boolean(data?.length)
}

async function alreadySent(leadId: string, eventType: string) {
  if (!serviceClient || !isUuid(leadId)) return false
  const { data, error } = await serviceClient
    .from('email_events')
    .select('id')
    .eq('lead_id', leadId)
    .eq('event_type', eventType)
    .eq('status', 'sent')
    .limit(1)

  if (error) throw error
  return Boolean(data?.length)
}

async function logEmailEvent(lead: LeadPayload, eventType: string, recipient: string, status: string, payload: Record<string, unknown>, errorMessage?: string) {
  if (!serviceClient) return
  await serviceClient.from('email_events').insert({
    lead_id: isUuid(lead.id) ? lead.id : null,
    event_type: eventType,
    recipient,
    status,
    error_message: errorMessage ?? null,
    payload,
  })
}

async function logCommunicationEvent(lead: LeadPayload, eventType: string, recipient: string, subject: string, body: string, payload: Record<string, unknown>) {
  if (!serviceClient || !isUuid(lead.id)) return
  await serviceClient.from('communication_events').insert({
    lead_id: lead.id,
    booking_id: isUuid(lead.bookingId) ? lead.bookingId : null,
    customer_id: isUuid(lead.customerId) ? lead.customerId : null,
    channel: 'email',
    direction: 'outbound',
    event_type: eventType,
    subject,
    body,
    recipient,
    actor: 'Morrow Automation',
    status: 'sent',
    provider: 'resend',
    payload,
  })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  try {
    const allowed = await assertMorrowAdmin(request)
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { lead, status, packageItem, baseUrl = defaultSiteUrl } = await request.json() as {
      lead?: LeadPayload
      status?: BookingStatus
      packageItem?: PackagePayload
      baseUrl?: string
    }

    if (!lead?.id || !lead.email || !lead.name || lead.type !== 'guest' || !status) {
      return new Response(JSON.stringify({ error: 'Missing booking email payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!['Reserviert', 'Bezahlt', 'Vor Anreise'].includes(status)) {
      return new Response(JSON.stringify({ ok: true, skipped: 'unsupported_status' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const eventType = eventTypeForStatus(status)
    if (await alreadySent(lead.id, eventType)) {
      return new Response(JSON.stringify({ ok: true, status: 'already_sent', eventType }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const email = templateForStatus(status, lead, packageItem, baseUrl)

    if (!resendApiKey) {
      await logEmailEvent(lead, eventType, lead.email, 'skipped', { subject: email.subject, reason: 'missing_resend_api_key' })
      return new Response(JSON.stringify({ ok: true, status: 'skipped', eventType }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await logEmailEvent(lead, eventType, lead.email, 'queued', { subject: email.subject })

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: lead.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
    })

    const result = await response.json().catch(() => ({}))

    if (!response.ok) {
      await logEmailEvent(lead, eventType, lead.email, 'failed', { subject: email.subject, result }, JSON.stringify(result))
      throw new Error(`Resend failed: ${response.status}`)
    }

    await logEmailEvent(lead, eventType, lead.email, 'sent', { subject: email.subject, result })
    await logCommunicationEvent(lead, eventType, lead.email, email.subject, email.text, { subject: email.subject, result })

    return new Response(JSON.stringify({ ok: true, status: 'sent', eventType }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
