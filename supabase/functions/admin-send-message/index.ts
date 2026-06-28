import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type AdminMessagePayload = {
  leadId?: string | null
  bookingId?: string | null
  customerId?: string | null
  supportId?: string | null
  recipient?: string
  subject?: string
  body?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resendApiKey = Deno.env.get('RESEND_API_KEY')
const fromEmail = Deno.env.get('MORROW_EMAIL_FROM') ?? 'Morrow <hello@morrow.local>'
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const serviceClient = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey)
  : null

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

const escapeHtml = (value = '') =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
    .replaceAll('\n', '<br />')

async function getAdminEmail(request: Request) {
  if (!serviceClient) throw new Error('Missing Supabase service client')
  const authHeader = request.headers.get('Authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return null

  const { data: userData, error: userError } = await serviceClient.auth.getUser(token)
  if (userError || !userData.user?.email) return null

  const { data, error } = await serviceClient
    .from('admin_users')
    .select('email')
    .eq('status', 'active')
    .ilike('email', userData.user.email)
    .limit(1)

  if (error) throw error
  return data?.[0]?.email ?? null
}

async function logEmailEvent({
  leadId,
  recipient,
  status,
  subject,
  payload,
  errorMessage,
}: {
  leadId: string | null
  recipient: string
  status: string
  subject: string
  payload: Record<string, unknown>
  errorMessage?: string
}) {
  if (!serviceClient) return

  await serviceClient.from('email_events').insert({
    lead_id: isUuid(leadId) ? leadId : null,
    event_type: 'admin_manual_email',
    recipient,
    status,
    error_message: errorMessage ?? null,
    payload: {
      subject,
      ...payload,
    },
  })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  try {
    const actor = await getAdminEmail(request)
    if (!actor) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const payload = await request.json() as AdminMessagePayload
    const recipient = payload.recipient?.trim()
    const subject = payload.subject?.trim()
    const body = payload.body?.trim()
    const leadId = isUuid(payload.leadId) ? payload.leadId : null
    const bookingId = isUuid(payload.bookingId) ? payload.bookingId : null
    const customerId = isUuid(payload.customerId) ? payload.customerId : null
    const supportId = typeof payload.supportId === 'string' && payload.supportId.trim()
      ? payload.supportId.trim()
      : null
    const eventType = supportId ? `support:${supportId}` : 'admin_manual_email'

    if (!recipient || !subject || !body) {
      return new Response(JSON.stringify({ error: 'Missing recipient, subject or body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!resendApiKey) {
      await logEmailEvent({
        leadId,
        recipient,
        status: 'skipped',
        subject,
        payload: { reason: 'missing_resend_api_key', bookingId, customerId, supportId },
      })
      return new Response(JSON.stringify({ error: 'Missing Resend API key' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await logEmailEvent({
      leadId,
      recipient,
      status: 'queued',
      subject,
      payload: { bookingId, customerId, supportId, actor },
    })

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipient,
        subject,
        text: body,
        html: `<p>${escapeHtml(body)}</p>`,
      }),
    })

    const result = await response.json().catch(() => ({}))

    if (!response.ok) {
      await logEmailEvent({
        leadId,
        recipient,
        status: 'failed',
        subject,
        payload: { bookingId, customerId, supportId, actor, result },
        errorMessage: JSON.stringify(result),
      })
      throw new Error(`Resend failed: ${response.status}`)
    }

    await logEmailEvent({
      leadId,
      recipient,
      status: 'sent',
      subject,
      payload: { bookingId, customerId, supportId, actor, result },
    })

    const communicationResult = await serviceClient
      ?.from('communication_events')
      .insert({
        lead_id: leadId,
        booking_id: bookingId,
        customer_id: customerId,
        support_id: supportId,
        channel: 'email',
        direction: 'outbound',
        event_type: eventType,
        subject,
        body,
        recipient,
        actor,
        status: 'sent',
        provider: 'resend',
        provider_message_id: typeof result.id === 'string' ? result.id : null,
        source: 'next-admin',
        payload: {
          source: 'next-admin',
          supportId,
          result,
        },
      })
      .select('id,lead_id,booking_id,customer_id,support_id,channel,direction,event_type,subject,body,recipient,actor,status,provider,provider_message_id,template_key,source,payload,created_at')
      .single()

    if (communicationResult?.error) throw communicationResult.error

    return new Response(JSON.stringify({
      ok: true,
      event: communicationResult?.data ?? null,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
