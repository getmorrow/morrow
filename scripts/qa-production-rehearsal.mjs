import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const baseUrl = (process.env.QA_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const submitLead = process.env.MORROW_QA_SUBMIT_LEAD === '1'
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const runId = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
const testEmail = `qa+${runId}@getmorrow.de`
const campaign = `production-rehearsal-${runId}`
const screenshotsDir = 'tmp/qa/production-rehearsal'

const requiredPages = [
  { path: '/', text: /Urlaub am Meer|Auszeiten/i },
  { path: '/auszeiten/family-escape', text: /Vier Tage Nordsee|Family Escape/i },
  { path: '/auszeiten/couple-reset', text: /Couple Reset|Auszeit/i },
  { path: '/eigentuemer', text: /Eigentümer|Immobilie/i },
  { path: '/erlebnispartner', text: /Erlebnispartner|Kooperation/i },
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
  { path: '/erlebnispartner', anchor: '#kooperation', submit: /Kooperation anfragen/i, minimumFields: 6 },
]

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function checkPage(page, { path, text }) {
  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' })
  assert(response?.ok(), `${path} returned ${response?.status()}`)
  await page.getByText(text).first().waitFor({ timeout: 10_000 })
}

async function checkStaticEndpoint(page, path, expectedText) {
  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' })
  assert(response?.ok(), `${path} returned ${response?.status()}`)
  const body = await page.locator('body').innerText()
  assert(body.includes(expectedText), `${path} does not include ${expectedText}`)
}

async function checkForm(page, check) {
  await page.goto(`${baseUrl}${check.path}?utm_source=qa&utm_medium=rehearsal&utm_campaign=${campaign}`, { waitUntil: 'networkidle' })
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
  await form.getByLabel('Name').fill(`QA Rehearsal ${runId}`)
  await form.getByLabel('E-Mail').fill(testEmail)
  await form.getByLabel('Telefon').fill('+491700000000')
  await form.getByLabel('Gewünschter Termin').selectOption({ index: 0 })
  await form.getByLabel('Erwachsene').fill('2')
  await form.getByLabel('Kinder', { exact: true }).fill('2')
  await form.getByLabel('Alter der Kinder').fill('4 und 8 Jahre')
  await form.getByLabel('Nachricht').fill('Automatischer Production-Rehearsal-Testlead. Bitte nach Prüfung archivieren.')
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
    .select('id,type,status,email,source,campaign,package_slug,payload,created_at')
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

  return {
    checked: true,
    leadId: data.id,
    source: data.source,
    campaign: data.campaign,
  }
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

  for (const check of formChecks) {
    await checkForm(mobile, check)
  }

  const consent = await checkConsent(mobile)

  if (submitLead) {
    await submitGuestLead(mobile)
  }
  const leadVerification = await verifyLeadInSupabase()

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
    consent,
    leadVerification,
    screenshot: `${screenshotsDir}/family-form-mobile.png`,
  }, null, 2))
} catch (error) {
  await browser.close()
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
