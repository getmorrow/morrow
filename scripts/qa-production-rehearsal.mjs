import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const baseUrl = (process.env.QA_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const submitLead = process.env.MORROW_QA_SUBMIT_LEAD === '1'
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const appRouteChecks = [
  {
    label: 'admin',
    path: '/admin',
    configured: Boolean(process.env.MORROW_ADMIN_APP_URL),
    text: /Morrow Admin|Steuerung für Anfragen/i,
  },
  {
    label: 'guest',
    path: '/app/gast',
    configured: Boolean(process.env.MORROW_GUEST_APP_URL),
    text: /Deine Auszeit|Alles Wichtige/i,
  },
  {
    label: 'owner',
    path: '/app/eigentuemer',
    configured: Boolean(process.env.MORROW_OWNER_APP_URL),
    text: /Morrow Eigentümer|Transparenz für Objekt/i,
  },
]
const legacyRedirects = [
  {
    label: 'legacyGuestStay',
    path: '/deine-auszeit/qa-booking?code=qa-code',
    expectedPathPrefix: '/app/gast/deine-auszeit/qa-booking',
  },
  {
    label: 'legacyOwner',
    path: '/owner',
    expectedPathPrefix: '/app/eigentuemer',
  },
  {
    label: 'legacyEnglishGuest',
    path: '/app/guest',
    expectedPathPrefix: '/app/gast',
  },
  {
    label: 'legacyEnglishOwner',
    path: '/app/owner',
    expectedPathPrefix: '/app/eigentuemer',
  },
]
const runId = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
const testEmail = `qa+${runId}@getmorrow.de`
const campaign = `production-rehearsal-${runId}`
const screenshotsDir = 'tmp/qa/production-rehearsal'

const requiredPages = [
  { path: '/', text: /Urlaub am Meer|Auszeiten/i },
  { path: '/auszeiten/family-escape', text: /Vier Tage Nordsee|Family Escape/i },
  { path: '/auszeiten/couple-reset', text: /Couple Reset|Auszeit/i },
  { path: '/eigentuemer', text: /Eigentümer|Immobilie/i },
  { path: '/partner/erlebnisanbieter', text: /Erlebnispartner|Kooperation|Lokale Erlebnisse/i },
  { path: '/ratgeber', text: /Ratgeber|Sankt Peter-Ording/i },
  { path: '/impressum', text: /Impressum/i },
  { path: '/datenschutz', text: /Datenschutz/i },
  { path: '/agb', text: /Geschäftsbedingungen|AGB/i },
  { path: '/buchungsbedingungen', text: /Buchungsbedingungen/i },
  { path: '/stornobedingungen', text: /Stornobedingungen/i },
  { path: '/zahlungsbedingungen', text: /Zahlungsbedingungen/i },
]

const formChecks = [
  { path: '/auszeiten/family-escape', anchor: '#anfrage', submit: /Auszeit anfragen/i, minimumFields: 8 },
  { path: '/auszeiten/couple-reset', anchor: '#anfrage', submit: /Auszeit anfragen/i, minimumFields: 7 },
  { path: '/eigentuemer', anchor: '#ertragspotenzial', submit: /Immobilie vorstellen/i, minimumFields: 6 },
  { path: '/partner/erlebnisanbieter', anchor: '#kooperation', submit: /Kooperation anfragen/i, minimumFields: 6 },
]

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function assertNoSoft404(path, body) {
  const normalizedBody = body.replace(/\s+/g, ' ').trim()
  assert(
    !/404 Diese Seite gibt es noch nicht/i.test(normalizedBody),
    `${path} rendered the Morrow 404 page with a successful HTTP response`,
  )
}

async function checkPage(page, { path, text }) {
  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' })
  assert(response?.ok(), `${path} returned ${response?.status()}`)
  const body = await page.locator('body').innerText()
  assertNoSoft404(path, body)
  assert(text.test(body), `${path} does not include expected text ${text}`)
}

async function checkStaticEndpoint(page, path, expectedText) {
  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' })
  assert(response?.ok(), `${path} returned ${response?.status()}`)
  const body = await page.locator('body').innerText()
  assertNoSoft404(path, body)
  assert(body.includes(expectedText), `${path} does not include ${expectedText}`)
}

async function checkAppRoutes(page) {
  const configuredRoutes = appRouteChecks.filter((item) => item.configured)

  if (configuredRoutes.length === 0) {
    return {
      checked: false,
      reason: 'No app route env vars set. Provide MORROW_ADMIN_APP_URL, MORROW_GUEST_APP_URL and/or MORROW_OWNER_APP_URL.',
    }
  }

  const checks = []
  for (const item of configuredRoutes) {
    const response = await page.goto(`${baseUrl}${item.path}`, { waitUntil: 'networkidle' })
    assert(response?.ok(), `${item.path} returned ${response?.status()}`)
    const body = await page.locator('body').innerText()
    assertNoSoft404(item.path, body)
    assert(item.text.test(body), `${item.path} did not include expected app text`)
    checks.push({ label: item.label, path: item.path, status: response.status() })
  }

  return {
    checked: true,
    count: checks.length,
    checks,
  }
}

async function checkLegacyRedirects() {
  const checks = []

  for (const item of legacyRedirects) {
    const response = await fetch(`${baseUrl}${item.path}`, { redirect: 'manual' })
    assert(
      response.status >= 300 && response.status < 400,
      `${item.path} expected redirect, got ${response.status}`,
    )

    const location = response.headers.get('location')
    assert(location, `${item.path} redirect did not include Location header`)

    const redirectUrl = new URL(location, baseUrl)
    assert(
      redirectUrl.origin === new URL(baseUrl).origin,
      `${item.path} expected same-platform redirect, got ${redirectUrl.origin}`,
    )
    assert(
      redirectUrl.pathname.startsWith(item.expectedPathPrefix),
      `${item.path} expected redirect path ${item.expectedPathPrefix}, got ${redirectUrl.pathname}`,
    )

    checks.push({
      label: item.label,
      path: item.path,
      status: response.status,
      location: redirectUrl.toString(),
    })
  }

  return {
    checked: true,
    count: checks.length,
    checks,
  }
}

async function checkForm(page, check) {
  await page.goto(`${baseUrl}${check.path}?utm_source=qa&utm_medium=rehearsal&utm_campaign=${campaign}`, { waitUntil: 'networkidle' })
  const body = await page.locator('body').innerText()
  assertNoSoft404(check.path, body)
  await page.locator(check.anchor).scrollIntoViewIfNeeded()
  const form = page.locator(`${check.anchor} .lead-form`)
  await form.waitFor({ timeout: 10_000 })
  const fields = await form.locator('input, select, textarea').count()
  assert(fields >= check.minimumFields, `${check.path} expected at least ${check.minimumFields} fields, got ${fields}`)
  await form.getByRole('button', { name: check.submit }).waitFor({ timeout: 10_000 })
  const mailtoLinks = await page.locator('a[href^="mailto:"]').count()
  assert(mailtoLinks === 0, `${check.path} still contains mailto links`)
}

async function checkConsent(page) {
  await page.goto(`${baseUrl}/?utm_source=qa&utm_campaign=${campaign}`, { waitUntil: 'networkidle' })
  const banner = page.locator('.consent-banner')
  const bannerCount = await banner.count()
  const trackingScriptsBefore = await page.locator('script[src*="googletagmanager"], script#morrow-meta-pixel').count()

  if (bannerCount === 0) {
    return {
      checked: false,
      reason: 'No consent banner rendered. This is expected when GA/Meta public IDs are not set.',
      trackingScriptsBefore,
    }
  }

  assert(trackingScriptsBefore === 0, `Tracking scripts loaded before consent: ${trackingScriptsBefore}`)
  await banner.getByRole('button', { name: /Alle akzeptieren/i }).click()
  await page.waitForTimeout(700)
  const trackingScriptsAfter = await page.locator('script[src*="googletagmanager"], script#morrow-meta-pixel').count()

  return {
    checked: true,
    trackingScriptsAfter,
    trackingScriptsBefore,
  }
}

async function submitGuestLead(page) {
  await page.goto(
    `${baseUrl}/auszeiten/family-escape?utm_source=qa&utm_medium=rehearsal&utm_campaign=${campaign}&utm_content=lead-submit`,
    { waitUntil: 'networkidle' },
  )
  await page.locator('#anfrage').scrollIntoViewIfNeeded()
  const form = page.locator('#anfrage .lead-form')
  await form.getByRole('textbox', { name: 'Name', exact: true }).fill(`QA Rehearsal ${runId}`)
  await form.getByRole('textbox', { name: 'E-Mail', exact: true }).fill(testEmail)
  await form.getByRole('textbox', { name: 'Telefon', exact: true }).fill('+491700000000')
  await form.getByRole('combobox', { name: 'Gewünschter Termin', exact: true }).selectOption({ index: 0 })
  await form.getByRole('spinbutton', { name: 'Erwachsene', exact: true }).fill('2')
  await form.getByRole('spinbutton', { name: 'Kinder', exact: true }).fill('2')
  await form.getByRole('textbox', { name: 'Alter der Kinder', exact: true }).fill('4 und 8 Jahre')
  await form.getByRole('textbox', { name: 'Nachricht', exact: true }).fill('Automatischer Production-Rehearsal-Testlead. Bitte nach Prüfung archivieren.')
  await form.getByRole('button', { name: /Auszeit anfragen/i }).click()
  await page.getByText(/Anfrage ist angekommen/i).waitFor({ timeout: 20_000 })
}

async function verifyLeadInSupabase() {
  if (!submitLead) return { checked: false, reason: 'Lead submission disabled.' }
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return {
      checked: false,
      reason: 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY not set; browser submit was checked only.',
    }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
  const { data, error } = await supabase
    .from('leads')
    .select('id,type,status,email,source,campaign,medium,content,term,referrer,landing_path,current_path,gclid,fbclid,conversion_event,conversion_label,conversion_path,package_slug,payload,created_at')
    .eq('email', testEmail)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  assert(data, `No Supabase lead found for ${testEmail}`)
  assert(data.type === 'guest', `Expected guest lead, got ${data.type}`)
  assert(data.package_slug === 'family-escape', `Expected family-escape, got ${data.package_slug}`)
  assert(data.source === 'qa', `Expected source qa, got ${data.source}`)
  assert(data.campaign === campaign, `Expected campaign ${campaign}, got ${data.campaign}`)
  assert(data.medium === 'rehearsal', `Expected normalized medium rehearsal, got ${data.medium}`)
  assert(data.content === 'lead-submit', `Expected normalized content lead-submit, got ${data.content}`)
  assert(data.landing_path === '/auszeiten/family-escape', `Expected normalized landing path /auszeiten/family-escape, got ${data.landing_path}`)
  assert(data.current_path === '/auszeiten/family-escape', `Expected normalized current path /auszeiten/family-escape, got ${data.current_path}`)
  assert(data.conversion_label, 'Expected normalized conversion label to be stored.')
  assert(data.payload?.utm?.medium === 'rehearsal', `Expected utm medium rehearsal, got ${data.payload?.utm?.medium}`)
  assert(
    data.payload?.utm?.landingPath === '/auszeiten/family-escape',
    `Expected landing path /auszeiten/family-escape, got ${data.payload?.utm?.landingPath}`,
  )
  assert(
    data.payload?.formContext?.formLabel === 'Auszeit anfragen',
    `Expected form context Auszeit anfragen, got ${data.payload?.formContext?.formLabel}`,
  )

  return {
    checked: true,
    leadId: data.id,
    source: data.source,
    campaign: data.campaign,
    medium: data.medium,
    content: data.content,
    landingPath: data.landing_path,
    form: data.payload?.formContext?.formLabel,
  }
}

async function archiveSubmittedLead() {
  if (!submitLead || !supabaseUrl || !supabaseServiceRoleKey) {
    return { checked: false, archived: 0 }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
  const { data, error } = await supabase
    .from('leads')
    .update({ archived_at: new Date().toISOString(), status: 'Archiviert' })
    .eq('email', testEmail)
    .is('archived_at', null)
    .select('id')

  if (error) throw error
  return { checked: true, archived: data?.length ?? 0 }
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const mobile = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 1 })
const consoleErrors = []

for (const targetPage of [page, mobile]) {
  targetPage.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
}

try {
  for (const item of requiredPages) {
    await checkPage(page, item)
  }

  await checkStaticEndpoint(page, '/robots.txt', 'Sitemap:')
  await checkStaticEndpoint(page, '/sitemap.xml', '<urlset')
  const appRoutes = await checkAppRoutes(page)
  const redirects = await checkLegacyRedirects()

  for (const check of formChecks) {
    await checkForm(mobile, check)
  }

  const consent = await checkConsent(mobile)

  if (submitLead) {
    await submitGuestLead(mobile)
  }
  const leadVerification = await verifyLeadInSupabase()
  const leadCleanup = await archiveSubmittedLead()

  await mobile.goto(`${baseUrl}/auszeiten/family-escape?utm_source=qa&utm_campaign=${campaign}`, { waitUntil: 'networkidle' })
  await mobile.locator('#anfrage').scrollIntoViewIfNeeded()
  await mobile.screenshot({ path: `${screenshotsDir}/family-form-mobile.png`, fullPage: false })

  await browser.close()

  if (consoleErrors.length > 0) {
    console.error(consoleErrors.join('\n'))
    process.exit(1)
  }

  console.log(JSON.stringify({
    ok: true,
    baseUrl,
    checkedPages: requiredPages.length,
    checkedForms: formChecks.length,
    appRoutes,
    redirects,
    consent,
    leadVerification,
    leadCleanup,
    screenshot: `${screenshotsDir}/family-form-mobile.png`,
  }, null, 2))
} catch (error) {
  try {
    const cleanup = await archiveSubmittedLead()
    if (cleanup.checked && cleanup.archived > 0) {
      console.error(`Archived submitted QA lead after failure: ${cleanup.archived}`)
    }
  } catch (cleanupError) {
    console.error(`Failed to archive submitted QA lead: ${cleanupError instanceof Error ? cleanupError.message : cleanupError}`)
  }
  await browser.close()
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
