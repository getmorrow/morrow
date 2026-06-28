import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type GuestLeadPayload = {
  id: string
  type: 'guest'
  status: string
  name: string
  email: string
  phone?: string
  packageName?: string
  packageSlug?: string
  selectedDate?: string
  createdAt?: string
  updatedAt?: string
  isTest?: boolean
  bookingId?: string
  customerId?: string
}

type StoredLeadRow = {
  id: string
  type: string
  status: string
  name: string | null
  email: string | null
  phone: string | null
  package_slug: string | null
  payload: Record<string, unknown> | null
  created_at: string
  updated_at: string
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
const defaultBatchLimit = Number.parseInt(Deno.env.get('MORROW_FEEDBACK_BATCH_LIMIT') ?? '50', 10)
const automationSecret = Deno.env.get('MORROW_AUTOMATION_SECRET') ?? ''

const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey)
  : null

const escapeHtml = (value = '') =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

const guestAccessCode = ({ id, email }: Pick<GuestLeadPayload, 'id' | 'email'>) => {
  const source = `${id}:${email.toLowerCase()}`
  let hash = 0

  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0
  }

  return Math.abs(hash).toString(36).padStart(6, '0').slice(0, 6).toUpperCase()
}

const feedbackUrl = (lead: GuestLeadPayload, baseUrl: string) => {
  const normalizedBase = baseUrl.replace(/\/$/, '')
  return `${normalizedBase}/deine-auszeit/${lead.id}?code=${guestAccessCode(lead)}&view=feedback`
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

const feedbackText = (lead: GuestLeadPayload, url: string) => [
  `Hallo ${firstName(lead.name)},`,
  '',
  `danke, dass ihr eure Auszeit${lead.packageName ? ` mit ${lead.packageName}` : ''} mit Morrow verbracht habt.`,
  'Wenn ihr einen kurzen Moment habt, hilft uns euer Feedback sehr, die nächsten Aufenthalte noch besser vorzubereiten.',
  '',
  `Feedback geben: ${url}`,
  '',
  'Liebe Grüße',
  'Morrow',
].join('\n')

const feedbackHtml = (lead: GuestLeadPayload, url: string) => `
  <!doctype html>
  <html lang="de">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Wie war eure Auszeit?</title>
    </head>
    <body style="margin:0;background:#eee8d8;font-family:Arial,'Helvetica Neue',sans-serif;color:#171715;">
      <div style="display:none;max-height:0;overflow:hidden;color:transparent;">Danke fuer eure Auszeit. Euer Feedback hilft uns sehr.</div>
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
                  <div style="color:#756f42;font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;">Nach eurer Auszeit</div>
                  <h1 style="margin:14px 0 16px;font-size:34px;line-height:1.06;letter-spacing:-.02em;color:#171715;">Wie war eure Zeit?</h1>
                  <p style="margin:0;color:#5f5b53;font-size:18px;line-height:1.6;">Danke, dass ihr eure Auszeit${lead.packageName ? ` mit ${escapeHtml(lead.packageName)}` : ''} mit Morrow verbracht habt.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 34px 34px;">
                  <p style="margin:0 0 24px;color:#5f5b53;font-size:16px;line-height:1.7;">Wenn ihr einen kurzen Moment habt, hilft uns eure Rückmeldung sehr: Was war gut vorbereitet, was hat euch gefehlt, und was sollten wir beim nächsten Aufenthalt besser machen?</p>
                  <a href="${escapeHtml(url)}" style="display:inline-block;background:#756f42;color:#fbf8ef;text-decoration:none;border-radius:999px;padding:15px 22px;font-size:14px;font-weight:800;">Feedback geben</a>
                  <p style="margin:26px 0 0;color:#171715;font-size:16px;line-height:1.7;">Liebe Grüße<br><strong>Morrow</strong></p>
                </td>
              </tr>
            </table>
            <p style="max-width:620px;margin:16px auto 0;color:#858074;font-size:12px;line-height:1.5;">Diese Nachricht wurde gesendet, weil euer Aufenthalt abgeschlossen wurde.</p>
          </td>
        </tr>
      </table>
    </body>
  </html>
`

async function logEmailEvent(lead: GuestLeadPayload, recipient: string, status: string, payload: Record<string, unknown>, errorMessage?: string) {
  if (!supabase) return
  await supabase.from('email_events').insert({
    lead_id: isUuid(lead.id) ? lead.id : null,
    event_type: 'post_stay_feedback_request',
    recipient,
    status,
    error_message: errorMessage ?? null,
    payload,
  })
}

async function logCommunicationEvent(lead: GuestLeadPayload, recipient: string, subject: string, body: string, payload: Record<string, unknown>) {
  if (!supabase || !isUuid(lead.id)) return
  await supabase.from('communication_events').insert({
    lead_id: lead.id,
    booking_id: isUuid(lead.bookingId) ? lead.bookingId : null,
    customer_id: isUuid(lead.customerId) ? lead.customerId : null,
    channel: 'email',
    direction: 'outbound',
    event_type: 'post_stay_feedback_request',
    subject,
    body,
    recipient,
    actor: 'Morrow Automation',
    status: 'sent',
    provider: 'resend',
    template_key: 'post_stay_feedback_request',
    source: 'post-stay-feedback',
    payload,
  })
}

async function alreadySent(leadId: string) {
  if (!supabase || !isUuid(leadId)) return false
  const { data, error } = await supabase
    .from('email_events')
    .select('id')
    .eq('lead_id', leadId)
    .eq('event_type', 'post_stay_feedback_request')
    .eq('status', 'sent')
    .limit(1)

  if (error) throw error
  return Boolean(data?.length)
}

async function sendFeedbackEmail(lead: GuestLeadPayload, baseUrl: string) {
  const url = feedbackUrl(lead, baseUrl)
  const subject = 'Wie war eure Auszeit mit Morrow?'
  const text = feedbackText(lead, url)

  if (!resendApiKey) {
    await logEmailEvent(lead, lead.email, 'skipped', { subject, reason: 'missing_resend_api_key', feedbackUrl: url })
    return 'skipped'
  }

  await logEmailEvent(lead, lead.email, 'queued', { subject, feedbackUrl: url })

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: lead.email,
      subject,
      text,
      html: feedbackHtml(lead, url),
    }),
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    await logEmailEvent(lead, lead.email, 'failed', { subject, feedbackUrl: url, result }, JSON.stringify(result))
    throw new Error(`Resend failed: ${response.status}`)
  }

  await logEmailEvent(lead, lead.email, 'sent', { subject, feedbackUrl: url, result })
  await logCommunicationEvent(lead, lead.email, subject, text, { subject, feedbackUrl: url, result })
  return 'sent'
}

const isDue = (lead: GuestLeadPayload, daysAfter: number, includeTest = false) => {
  if (lead.status !== 'Abgeschlossen' || (!includeTest && lead.isTest)) return false
  const referenceValue = lead.updatedAt ?? lead.createdAt
  if (!referenceValue) return false
  const referenceDate = new Date(referenceValue)
  if (Number.isNaN(referenceDate.getTime())) return false
  const dueAt = referenceDate.getTime() + daysAfter * 24 * 60 * 60 * 1000
  return Date.now() >= dueAt
}

const stringValue = (value: unknown) => (typeof value === 'string' ? value : undefined)

const booleanValue = (value: unknown) => (typeof value === 'boolean' ? value : undefined)

const normalizeStoredLead = (row: StoredLeadRow): GuestLeadPayload | null => {
  const payload = row.payload ?? {}
  const name = row.name ?? stringValue(payload.name)
  const email = row.email ?? stringValue(payload.email)

  if (!name || !email) return null

  return {
    id: row.id,
    type: 'guest',
    status: row.status,
    name,
    email,
    phone: row.phone ?? stringValue(payload.phone),
    packageName: stringValue(payload.packageName),
    packageSlug: row.package_slug ?? stringValue(payload.packageSlug),
    selectedDate: stringValue(payload.selectedDate),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isTest: booleanValue(payload.isTest) ?? false,
    bookingId: stringValue(payload.bookingId),
    customerId: stringValue(payload.customerId),
  }
}

async function fetchDueLeads(daysAfter: number, limit: number, includeTest = false) {
  if (!supabase) throw new Error('Missing Supabase service client')

  const cutoff = new Date(Date.now() - daysAfter * 24 * 60 * 60 * 1000).toISOString()
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 200) : defaultBatchLimit

  const { data, error } = await supabase
    .from('leads')
    .select('id,type,status,name,email,phone,package_slug,payload,created_at,updated_at')
    .eq('type', 'guest')
    .eq('status', 'Abgeschlossen')
    .is('archived_at', null)
    .lte('updated_at', cutoff)
    .order('updated_at', { ascending: true })
    .limit(safeLimit)

  if (error) throw error

  return ((data ?? []) as StoredLeadRow[])
    .map(normalizeStoredLead)
    .filter((lead): lead is GuestLeadPayload => Boolean(lead))
    .filter((lead) => isDue(lead, daysAfter, includeTest))
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  if (automationSecret && request.headers.get('x-morrow-automation-secret') !== automationSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized automation request' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.json().catch(() => ({})) as {
      leads?: GuestLeadPayload[]
      baseUrl?: string
      daysAfter?: number
      limit?: number
      includeTest?: boolean
    }

    const { leads, baseUrl = defaultSiteUrl, daysAfter = 1, limit = defaultBatchLimit, includeTest = false } = body
    const sourceLeads = Array.isArray(leads) && leads.length > 0
      ? leads
      : await fetchDueLeads(daysAfter, limit, includeTest)
    const dueLeads = sourceLeads.filter((lead) => lead?.id && lead?.email && lead?.name && isDue(lead, daysAfter, includeTest))
    const results: Array<{ id: string; email: string; status: string }> = []

    for (const lead of dueLeads) {
      if (await alreadySent(lead.id)) {
        results.push({ id: lead.id, email: lead.email, status: 'already_sent' })
        continue
      }
      const status = await sendFeedbackEmail(lead, baseUrl)
      results.push({ id: lead.id, email: lead.email, status })
    }

    return new Response(JSON.stringify({ ok: true, checked: sourceLeads.length, due: dueLeads.length, sent: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
