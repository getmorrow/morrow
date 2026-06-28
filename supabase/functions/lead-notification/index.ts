import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type LeadPayload = {
  id: string
  type: 'guest' | 'owner' | 'experience'
  name: string
  email: string
  phone?: string
  packageName?: string
  packageSlug?: string
  selectedDate?: string
  guests?: string
  adults?: string
  children?: string
  businessName?: string
  propertyLocation?: string
  experienceType?: string
  childrenAges?: string
  whatsappOptIn?: boolean
  message?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resendApiKey = Deno.env.get('RESEND_API_KEY')
const fromEmail = Deno.env.get('MORROW_EMAIL_FROM') ?? 'Morrow <hello@morrow.local>'
const internalEmail = Deno.env.get('MORROW_INTERNAL_LEAD_EMAIL') ?? ''
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey)
  : null

const leadTypeLabel = (lead: LeadPayload) => {
  if (lead.type === 'guest') return 'Gastanfrage'
  if (lead.type === 'owner') return 'Eigentümeranfrage'
  return 'Erlebnisanbieteranfrage'
}

const leadSubject = (lead: LeadPayload) => {
  if (lead.type === 'guest') return `Danke für eure Anfrage zu ${lead.packageName ?? 'eurer Auszeit'}`
  if (lead.type === 'owner') return 'Danke für deine Immobilienvorstellung'
  return 'Danke für dein Erlebnisangebot'
}

const guestSummary = (lead: LeadPayload) => {
  const parts = [
    lead.adults ? `${lead.adults} Erwachsene` : '',
    lead.children ? `${lead.children} Kinder` : '',
    lead.childrenAges ? `Alter: ${lead.childrenAges}` : '',
  ].filter(Boolean)

  if (parts.length > 0) return parts.join(' · ')
  return lead.guests
}

const escapeHtml = (value = '') =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

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

const baseHtml = (title: string, intro: string, body: string, details = '') => `
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
                  <div style="color:#756f42;font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;">Auszeiten an der Nordsee</div>
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
                  <p style="margin:26px 0 0;color:#171715;font-size:16px;line-height:1.7;">Liebe Grüße<br><strong>Morrow</strong></p>
                </td>
              </tr>
            </table>
            <p style="max-width:620px;margin:16px auto 0;color:#858074;font-size:12px;line-height:1.5;">
              Diese Nachricht wurde automatisch ausgelöst, damit eure Anfrage sicher bei uns ankommt.
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
`

const guestText = (lead: LeadPayload) => {
  if (lead.type === 'guest') {
    return [
      `Hallo ${lead.name},`,
      '',
      `danke für eure Anfrage zu ${lead.packageName ?? 'eurer Morrow-Auszeit'}.`,
      'Wir prüfen Termin, Unterkunft und Erlebnis persönlich und melden uns innerhalb von 24 Stunden mit einer klaren Rückmeldung.',
      '',
      lead.selectedDate ? `Gewünschter Termin: ${lead.selectedDate}` : '',
      guestSummary(lead) ? `Personen: ${guestSummary(lead)}` : '',
      lead.whatsappOptIn ? 'WhatsApp: Ihr habt zugestimmt, dass wir euch für wichtige Nachrichten auch per WhatsApp kontaktieren dürfen.' : '',
      '',
      'Liebe Grüße',
      'Morrow',
    ].filter(Boolean).join('\n')
  }

  if (lead.type === 'owner') {
    return [
      `Hallo ${lead.name},`,
      '',
      'danke, dass du deine Immobilie bei Morrow vorgestellt hast.',
      'Wir prüfen, ob Lage, Objektart und Verfügbarkeiten zu unseren kuratierten Auszeiten passen und melden uns persönlich.',
      '',
      'Liebe Grüße',
      'Morrow',
    ].join('\n')
  }

  return [
    `Hallo ${lead.name},`,
    '',
    `danke für dein Erlebnisangebot${lead.businessName ? ` von ${lead.businessName}` : ''}.`,
    'Wir prüfen, ob Ablauf, Zielgruppe und Ort zu unseren Morrow-Auszeiten passen und melden uns persönlich.',
    '',
    'Liebe Grüße',
    'Morrow',
  ].join('\n')
}

const guestHtml = (lead: LeadPayload) => {
  if (lead.type === 'guest') {
    return baseHtml(
      `Danke für eure Anfrage${lead.packageName ? ` zu ${lead.packageName}` : ''}.`,
      'Wir haben eure Anfrage erhalten und prüfen Termin, Unterkunft und Erlebnis persönlich.',
      'Wir melden uns innerhalb von 24 Stunden mit einer klaren Rückmeldung. Die Anfrage ist noch keine Buchung, sondern der erste Schritt zu einer Auszeit, die wirklich zu euch passt.',
      detailRows([
        ['Auszeit', lead.packageName],
        ['Termin', lead.selectedDate],
        ['Personen', guestSummary(lead)],
        ['WhatsApp', lead.whatsappOptIn ? 'zugestimmt' : undefined],
      ]),
    )
  }

  if (lead.type === 'owner') {
    return baseHtml(
      'Danke für deine Immobilienvorstellung.',
      'Wir haben deine Anfrage erhalten und prüfen, ob dein Objekt zu Morrow passt.',
      'Uns ist wichtig, dass Lage, Qualität, Verfügbarkeit und Gästerlebnis zusammenpassen. Wir melden uns persönlich mit einer Einschätzung.',
      detailRows([
        ['Objekt-Ort', lead.propertyLocation],
        ['Telefon', lead.phone],
      ]),
    )
  }

  return baseHtml(
    'Danke für dein Erlebnisangebot.',
    'Wir haben deine Nachricht erhalten und prüfen, ob das Erlebnis zu unseren Auszeiten passt.',
    'Morrow arbeitet mit ausgewählten lokalen Partnern. Entscheidend ist, dass Ablauf, Zielgruppe und Atmosphäre zu unseren Gästen passen.',
    detailRows([
      ['Anbieter', lead.businessName],
      ['Erlebnisart', lead.experienceType],
      ['Telefon', lead.phone],
    ]),
  )
}

const internalText = (lead: LeadPayload) => [
  `Neue ${leadTypeLabel(lead)}`,
  '',
  `Name: ${lead.name}`,
  `E-Mail: ${lead.email}`,
  lead.phone ? `Telefon: ${lead.phone}` : '',
  lead.packageName ? `Auszeit: ${lead.packageName}` : '',
  lead.selectedDate ? `Termin: ${lead.selectedDate}` : '',
  guestSummary(lead) ? `Personen: ${guestSummary(lead)}` : '',
  lead.propertyLocation ? `Objekt-Ort: ${lead.propertyLocation}` : '',
  lead.businessName ? `Angebot/Firma: ${lead.businessName}` : '',
  lead.experienceType ? `Erlebnisart: ${lead.experienceType}` : '',
  lead.message ? `Nachricht: ${lead.message}` : '',
].filter(Boolean).join('\n')

const internalHtml = (lead: LeadPayload) => baseHtml(
  `Neue ${leadTypeLabel(lead)}`,
  `${lead.name} hat eine neue Anfrage über Morrow gesendet.`,
  escapeHtml(lead.message ?? 'Bitte im Admin prüfen und als nächstes persönlich bearbeiten.').replaceAll('\n', '<br>'),
  detailRows([
    ['Name', lead.name],
    ['E-Mail', lead.email],
    ['Telefon', lead.phone],
    ['Auszeit', lead.packageName],
    ['Termin', lead.selectedDate],
    ['Personen', guestSummary(lead)],
    ['Objekt-Ort', lead.propertyLocation],
    ['Angebot/Firma', lead.businessName],
    ['Erlebnisart', lead.experienceType],
  ]),
)

async function logEmailEvent(lead: LeadPayload, eventType: string, recipient: string, status: string, payload: Record<string, unknown>, errorMessage?: string) {
  if (!supabase) return
  await supabase.from('email_events').insert({
    lead_id: lead.id,
    event_type: eventType,
    recipient,
    status,
    error_message: errorMessage ?? null,
    payload,
  })
}

async function logCommunicationEvent(
  lead: LeadPayload,
  eventType: string,
  recipient: string,
  subject: string,
  body: string,
  status: string,
  payload: Record<string, unknown>,
) {
  if (!supabase) return
  await supabase.from('communication_events').insert({
    lead_id: lead.id,
    channel: 'email',
    direction: eventType === 'internal_lead_notification' ? 'internal' : 'outbound',
    event_type: eventType,
    subject,
    body,
    recipient,
    actor: eventType === 'internal_lead_notification' ? 'Morrow Automation' : 'Morrow',
    status,
    provider: 'resend',
    provider_message_id: typeof payload.result === 'object' && payload.result && 'id' in payload.result
      ? String((payload.result as { id?: unknown }).id ?? '')
      : null,
    template_key: eventType,
    source: 'lead-notification',
    payload,
  })
}

async function sendEmail(lead: LeadPayload, eventType: string, to: string, subject: string, text: string, html: string) {
  if (!resendApiKey) {
    await logEmailEvent(lead, eventType, to, 'skipped', { subject, reason: 'missing_resend_api_key' })
    return
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      text,
      html,
    }),
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    await logEmailEvent(lead, eventType, to, 'failed', { subject, result }, JSON.stringify(result))
    throw new Error(`Resend failed: ${response.status}`)
  }

  await logEmailEvent(lead, eventType, to, 'sent', { subject, result })
  await logCommunicationEvent(lead, eventType, to, subject, text, 'sent', { subject, result })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  try {
    const { lead } = await request.json() as { lead?: LeadPayload }
    if (!lead?.id || !lead.email || !lead.name || !lead.type) {
      return new Response(JSON.stringify({ error: 'Missing lead payload' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    await sendEmail(lead, 'lead_confirmation', lead.email, leadSubject(lead), guestText(lead), guestHtml(lead))

    if (internalEmail) {
      await sendEmail(lead, 'internal_lead_notification', internalEmail, `Neue ${leadTypeLabel(lead)} · ${lead.name}`, internalText(lead), internalHtml(lead))
    } else {
      await logEmailEvent(lead, 'internal_lead_notification', 'missing_internal_email', 'skipped', { reason: 'missing_internal_email' })
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
