import fs from 'node:fs'
import path from 'node:path'
import { randomBytes, randomUUID } from 'node:crypto'
import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import { createQaEnv } from './lib/qa-env.mjs'

const qaEnv = createQaEnv(process.cwd())
const rootDir = process.cwd()
const baseUrl = (qaEnv.value('QA_BASE_URL') || 'https://www.getmorrow.de').replace(/\/$/, '')
const adminBaseUrl = (qaEnv.value('ADMIN_BASE_URL') || `${baseUrl}/admin`).replace(/\/$/, '')
const guestBaseUrl = (qaEnv.value('GUEST_BASE_URL') || `${baseUrl}/app/gast`).replace(/\/$/, '')
const ownerBaseUrl = (qaEnv.value('OWNER_BASE_URL') || `${baseUrl}/app/eigentuemer`).replace(/\/$/, '')
const adminEmail = qaEnv.value('ADMIN_EMAIL')
const adminPassword = qaEnv.value('ADMIN_PASSWORD')
const guestBookingId = qaEnv.value('GUEST_BOOKING_ID')
const guestAccessCode = qaEnv.value('GUEST_ACCESS_CODE')
const supabaseUrl = qaEnv.value('SUPABASE_URL') || qaEnv.value('VITE_SUPABASE_URL') || qaEnv.value('NEXT_PUBLIC_SUPABASE_URL')
const serviceRoleKey = qaEnv.value('SUPABASE_SERVICE_ROLE_KEY')
const outDir = qaEnv.value('MORROW_WORKFLOW_QA_DIR') || 'tmp/qa/workflow-fresh-2026-07-02'
const evidenceDir = qaEnv.value('MORROW_WORKFLOW_EVIDENCE_DIR') || 'docs/qa/workflow-ux-final-2026-07-02'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function requireEnv(value, name) {
  assert(Boolean(value), `Missing ${name}`)
}

function visibleRawFindings(text) {
  const findings = []
  const checks = [
    ['key_safe', /key_safe/i],
    ['next-owner', /next-owner/i],
    ['owner_', /owner_/i],
    ['status=active', /status=active/i],
    ['raw active', /\bactive\b/i],
    ['raw owner', /\bowner\b/i],
  ]

  for (const [label, pattern] of checks) {
    if (pattern.test(text)) findings.push(label)
  }

  return [...new Set(findings)]
}

function normalizeText(value) {
  return value.replace(/\s+/g, ' ').trim()
}

async function bodyText(page) {
  return normalizeText(await page.evaluate(() => {
    const isVisible = (element) => {
      if (!(element instanceof HTMLElement)) return false
      if (element.hidden || element.getAttribute('aria-hidden') === 'true') return false
      const style = window.getComputedStyle(element)
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false
      const rects = element.getClientRects()
      return rects.length > 0 && Array.from(rects).some((rect) => rect.width > 0 && rect.height > 0)
    }

    const texts = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node = walker.nextNode()
    while (node) {
      const value = node.textContent?.replace(/\s+/g, ' ').trim()
      const parent = node.parentElement
      if (value && parent && isVisible(parent)) texts.push(value)
      node = walker.nextNode()
    }
    return texts.join(' ')
  }))
}

async function screenshot(page, name, options = {}) {
  const target = path.join(outDir, `${name}.png`)
  await page.screenshot({ path: target, fullPage: Boolean(options.fullPage) })
  return target
}

async function clickFirst(page, locators, label) {
  for (const locator of locators) {
    const count = await locator.count().catch(() => 0)
    if (count === 0) continue
    await locator.first().scrollIntoViewIfNeeded().catch(() => undefined)
    await locator.first().click()
    return true
  }
  throw new Error(`Could not click ${label}`)
}

async function closeDrawerIfOpen(page, selector) {
  if ((await page.locator(selector).count().catch(() => 0)) === 0) return
  const close = page.getByRole('button', { name: /Schließen/i }).first()
  if ((await close.count().catch(() => 0)) > 0) {
    await close.click()
  } else {
    await page.keyboard.press('Escape')
  }
  await page.waitForTimeout(400)
}

function createServiceClient() {
  requireEnv(supabaseUrl, 'SUPABASE_URL/VITE_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL')
  requireEnv(serviceRoleKey, 'SUPABASE_SERVICE_ROLE_KEY')
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

async function createTemporaryLead(service) {
  const marker = `workflow-${Date.now()}`
  const lead = {
    id: randomUUID(),
    type: 'guest',
    status: 'Neu',
    name: `Workflow QA ${marker}`,
    email: `qa-${marker}@getmorrow.de`,
    phone: '+491700000000',
    package_slug: 'couple-reset',
    source: 'workflow-qa',
    campaign: 'workflow-ux-audit',
    medium: 'browser',
    content: 'admin-status-change',
    landing_path: '/auszeiten/couple-reset',
    current_path: '/auszeiten/couple-reset',
    adults: 2,
    children: 0,
    dog: false,
    payload: {
      qa: true,
      marker,
      selectedDateLabel: '12.-16. August',
      formContext: {
        formLabel: 'Auszeit anfragen',
      },
    },
  }

  const { error } = await service.from('leads').insert(lead)
  if (error) throw error
  return lead
}

async function createTemporaryOwner(service) {
  const { data: property, error: propertyError } = await service
    .from('properties')
    .select('id,name')
    .limit(1)
    .single()

  if (propertyError || !property?.id) throw propertyError || new Error('No property available for owner workflow QA')

  const marker = `qa-eigentuemer-${Date.now()}`
  const email = `${marker}@getmorrow.de`
  const password = `Morrow-${randomBytes(18).toString('base64url')}!1`

  const { data: authData, error: authError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      source: 'workflow-ux-audit',
      marker,
    },
  })
  if (authError) throw authError

  const { data: profile, error: profileError } = await service
    .from('owner_profiles')
    .insert({
      email,
      auth_user_id: authData.user.id,
      display_name: 'Workflow QA Eigentümer',
      phone: '+491700000001',
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single()
  if (profileError) throw profileError

  const { error: accessError } = await service.from('owner_property_access').insert({
    owner_profile_id: profile.id,
    property_id: property.id,
    role: 'owner',
    can_view_financials: true,
    can_view_operations: true,
    updated_at: new Date().toISOString(),
  })
  if (accessError) throw accessError

  return {
    authUserId: authData.user.id,
    email,
    password,
    profileId: profile.id,
    propertyId: property.id,
  }
}

async function cleanup(service, state) {
  const errors = []

  if (state.leadId) {
    const { error } = await service.from('leads').delete().eq('id', state.leadId)
    if (error) errors.push(error.message)
  }

  if (state.ownerProfileId) {
    const { error: accessError } = await service.from('owner_property_access').delete().eq('owner_profile_id', state.ownerProfileId)
    if (accessError) errors.push(accessError.message)
    const { error: profileError } = await service.from('owner_profiles').delete().eq('id', state.ownerProfileId)
    if (profileError) errors.push(profileError.message)
  }

  if (state.ownerAuthUserId) {
    const { error } = await service.auth.admin.deleteUser(state.ownerAuthUserId)
    if (error) errors.push(error.message)
  }

  return errors
}

async function verifyRoutes(page) {
  const checks = [
    ['website', baseUrl, /Urlaub am Meer|Auszeiten/i],
    ['guest', guestBaseUrl, /Deine Auszeit|Alles Wichtige/i],
    ['owner', ownerBaseUrl, /Morrow Eigentümer|Transparenz für Objekt/i],
    ['admin', adminBaseUrl, /Morrow Admin|Steuerung für Anfragen/i],
  ]

  const results = []
  for (const [label, url, pattern] of checks) {
    const response = await page.goto(url, { waitUntil: 'networkidle' })
    assert(response?.ok(), `${label} route returned ${response?.status()}`)
    const text = await bodyText(page)
    assert(pattern.test(text), `${label} route did not render expected text`)
    results.push({ label, url, status: response.status() })
  }

  for (const [pathName, expected] of [
    ['/app/guest', '/app/gast'],
    ['/app/owner', '/app/eigentuemer'],
  ]) {
    const response = await fetch(`${baseUrl}${pathName}`, { redirect: 'manual' })
    assert(response.status >= 300 && response.status < 400, `${pathName} expected redirect, got ${response.status}`)
    const location = response.headers.get('location')
    assert(location, `${pathName} redirect location missing`)
    const url = new URL(location, baseUrl)
    assert(url.pathname.startsWith(expected), `${pathName} expected ${expected}, got ${url.pathname}`)
    results.push({ label: pathName, url: url.toString(), status: response.status })
  }

  return results
}

async function auditGuest(browser) {
  requireEnv(guestBookingId, 'GUEST_BOOKING_ID')
  requireEnv(guestAccessCode, 'GUEST_ACCESS_CODE')

  const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 1 })
  const stayUrl = `${guestBaseUrl}/deine-auszeit/${encodeURIComponent(guestBookingId)}?code=${encodeURIComponent(guestAccessCode)}`
  const response = await page.goto(stayUrl, { waitUntil: 'networkidle' })
  assert(response?.ok(), `Guest stay returned ${response?.status()}`)
  await page.getByText(/Buchung|Vor Ort|Hilfe/i).first().waitFor({ timeout: 20_000 })

  const screenshots = []
  screenshots.push(await screenshot(page, 'guest-01-first-view-mobile'))
  const firstView = await bodyText(page)

  await clickFirst(page, [page.getByRole('button', { name: /Buchung/i })], 'Guest Buchung')
  await page.waitForTimeout(700)
  screenshots.push(await screenshot(page, 'guest-02-booking-mobile', { fullPage: true }))
  const booking = await bodyText(page)

  await clickFirst(page, [page.getByRole('button', { name: /Vor Ort/i })], 'Guest Vor Ort')
  await page.waitForTimeout(900)
  screenshots.push(await screenshot(page, 'guest-03-local-mobile'))
  await clickFirst(page, [page.getByRole('button', { name: /Essen/i })], 'Guest Essen filter')
  await page.waitForTimeout(800)
  screenshots.push(await screenshot(page, 'guest-04-local-food-mobile'))
  await clickFirst(page, [
    page.getByRole('button', { name: /Details/i }),
    page.getByText(/Arche Noah|Ahoi/i),
  ], 'Guest place drawer')
  await page.waitForTimeout(800)
  screenshots.push(await screenshot(page, 'guest-05-place-drawer-mobile'))
  const placeDrawer = await bodyText(page)
  await closeDrawerIfOpen(page, '.guest-drawer-backdrop')

  await clickFirst(page, [page.getByRole('button', { name: /Hilfe/i })], 'Guest Hilfe')
  await page.waitForTimeout(900)
  screenshots.push(await screenshot(page, 'guest-06-help-mobile-after-help-curation', { fullPage: true }))
  const help = await bodyText(page)
  await page.close()

  return {
    ok: true,
    screenshots,
    assertions: {
      appFirstView: /Buchung/i.test(firstView) && /Vor Ort/i.test(firstView) && /Hilfe/i.test(firstView),
      bookingHasCheckIn: /Anreise|Schlüssel|Check-in|Gäste/i.test(booking),
      placeDrawerHasDetails: /Reservierung|Route|Website|Küche|Öffnungszeiten|passt/i.test(placeDrawer),
      helpHasSupportFlow: /Nachricht senden|Was können wir|Morrow|Verlauf/i.test(help),
      helpHasNoMedicalEmergencyCards: !/Notruf Feuerwehr|Bereitschaftsdienst|medizinische Notfälle/i.test(help),
    },
    rawFindings: [...new Set([
      ...visibleRawFindings(firstView),
      ...visibleRawFindings(booking),
      ...visibleRawFindings(placeDrawer),
      ...visibleRawFindings(help),
    ])],
  }
}

async function auditAdmin(browser, service, lead) {
  requireEnv(adminEmail, 'ADMIN_EMAIL')
  requireEnv(adminPassword, 'ADMIN_PASSWORD')

  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  await page.goto(adminBaseUrl, { waitUntil: 'networkidle' })
  await page.getByLabel(/E-Mail/i).fill(adminEmail)
  await page.getByLabel(/Passwort/i).fill(adminPassword)
  await page.getByRole('button', { name: /Einloggen/i }).click()
  await page.waitForURL(/\/admin\/dashboard(?:$|\?)/, { timeout: 20_000 })
  await page.getByText(/CRM|Aufgaben|Support/i).first().waitFor({ timeout: 20_000 })

  const screenshots = []
  screenshots.push(await screenshot(page, 'admin-01-dashboard-desktop'))
  const dashboard = await bodyText(page)

  await clickFirst(page, [page.getByRole('button', { name: /^CRM$/i })], 'Admin CRM')
  await page.waitForTimeout(800)
  screenshots.push(await screenshot(page, 'admin-02-crm-list-desktop'))
  const crmList = await bodyText(page)

  const search = page.locator('input[type="search"]').first()
  await search.waitFor({ timeout: 10_000 })
  await search.fill(lead.name)
  await page.waitForTimeout(800)
  screenshots.push(await screenshot(page, 'admin-03-crm-search-desktop'))

  const leadRow = page.locator('article.admin-list-item').filter({ hasText: lead.name }).first()
  await leadRow.getByRole('button', { name: /^In Prüfung$/i }).click()
  await page.waitForTimeout(1200)
  const { data: updatedLead, error: updatedLeadError } = await service
    .from('leads')
    .select('id,status')
    .eq('id', lead.id)
    .single()
  if (updatedLeadError) throw updatedLeadError
  assert(updatedLead.status === 'In Prüfung', `Expected temp lead status In Prüfung, got ${updatedLead.status}`)

  await leadRow.getByRole('button', { name: /Details/i }).click()
  await page.waitForTimeout(800)
  screenshots.push(await screenshot(page, 'admin-04-detail-drawer-desktop'))
  const drawer = await bodyText(page)

  await closeDrawerIfOpen(page, '.admin-drawer-backdrop')

  await clickFirst(page, [page.getByRole('button', { name: /Aufgaben/i })], 'Admin Aufgaben')
  await page.waitForTimeout(800)
  screenshots.push(await screenshot(page, 'admin-05-tasks-desktop'))
  const tasks = await bodyText(page)

  await clickFirst(page, [page.getByRole('button', { name: /Support/i })], 'Admin Support')
  await page.waitForTimeout(800)
  screenshots.push(await screenshot(page, 'admin-06-support-desktop'))
  const support = await bodyText(page)
  await page.close()

  return {
    ok: true,
    screenshots,
    statusChangeVerified: updatedLead.status,
    assertions: {
      cockpitSignals: /CRM/i.test(dashboard) && /Aufgaben/i.test(dashboard) && /Support/i.test(dashboard),
      crmSignals: /Status|Quelle|Termin|Kontakt|Anfrage/i.test(crmList),
      drawerSignals: /Status|Kontakt|E-Mail|Telefon|Historie|Notiz|Buchung|Auszeit/i.test(drawer),
      taskSignals: /Aufgaben|Fällig|Priorität|Status/i.test(tasks),
      supportSignals: /Support|Nachricht|Dringlichkeit|Status/i.test(support),
    },
    rawFindings: [...new Set([
      ...visibleRawFindings(dashboard),
      ...visibleRawFindings(crmList),
      ...visibleRawFindings(drawer),
      ...visibleRawFindings(tasks),
      ...visibleRawFindings(support),
    ])],
  }
}

async function auditOwner(browser, owner) {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 1 })
  await page.goto(ownerBaseUrl, { waitUntil: 'networkidle' })
  await page.getByLabel(/E-Mail/i).fill(owner.email)
  await page.getByLabel(/Passwort/i).fill(owner.password)
  await page.getByRole('button', { name: /Einloggen/i }).click()
  await page.waitForURL(/\/app\/eigentuemer\/dashboard(?:$|\?)/, { timeout: 20_000 })
  await page.getByText(/Objekte|Buchungen|Abrechnung/i).first().waitFor({ timeout: 20_000 })

  const screenshots = []
  screenshots.push(await screenshot(page, 'owner-01-dashboard-mobile'))
  const dashboard = await bodyText(page)

  await clickFirst(page, [
    page.getByRole('button', { name: /Objekt ansehen/i }),
    page.getByRole('button', { name: /Details/i }),
  ], 'Owner Objekt Drawer')
  await page.waitForTimeout(800)
  screenshots.push(await screenshot(page, 'owner-02-object-drawer-mobile'))
  const drawer = await bodyText(page)
  await closeDrawerIfOpen(page, '.owner-drawer-backdrop')

  await page.goto(`${ownerBaseUrl}/dashboard#buchungen`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  screenshots.push(await screenshot(page, 'owner-03-bookings-mobile'))
  const bookings = await bodyText(page)

  await page.goto(`${ownerBaseUrl}/dashboard#abrechnung`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  screenshots.push(await screenshot(page, 'owner-04-billing-mobile'))
  const billing = await bodyText(page)

  await page.goto(`${ownerBaseUrl}/dashboard#kontakt`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  screenshots.push(await screenshot(page, 'owner-05-contact-mobile'))
  const contact = await bodyText(page)
  await page.close()

  return {
    ok: true,
    screenshots,
    assertions: {
      portalSignals: /Objekte|Buchungen|Abrechnung|Dokumente/i.test(dashboard),
      drawerSignals: /Check-in|Betreuung|Status|Zugriff|Regeln/i.test(drawer),
      bookingSignals: /Buchungen|Reserviert|Bezahlt|Anreise|Termin/i.test(bookings),
      billingSignals: /Abrechnung|Auszahlung|Umsatz|Beleg|Morrow/i.test(billing),
      contactSignals: /Rückfrage|Nachricht|Senden|Kontakt/i.test(contact),
    },
    rawFindings: [...new Set([
      ...visibleRawFindings(dashboard),
      ...visibleRawFindings(drawer),
      ...visibleRawFindings(bookings),
      ...visibleRawFindings(billing),
      ...visibleRawFindings(contact),
    ])],
  }
}

function assertAuditResult(result) {
  const failures = []
  for (const [area, areaResult] of Object.entries(result)) {
    if (!areaResult || typeof areaResult !== 'object' || area === 'routes') continue
    for (const [key, value] of Object.entries(areaResult.assertions ?? {})) {
      if (!value) failures.push(`${area}.${key}`)
    }
    if ((areaResult.rawFindings ?? []).length > 0) {
      failures.push(`${area}.rawFindings=${areaResult.rawFindings.join(',')}`)
    }
  }
  if (failures.length > 0) {
    throw new Error(`Workflow UX assertions failed: ${failures.join('; ')}`)
  }
}

function copyEvidence(resultPath) {
  fs.mkdirSync(evidenceDir, { recursive: true })
  for (const file of fs.readdirSync(outDir)) {
    if (file.endsWith('.png')) {
      fs.copyFileSync(path.join(outDir, file), path.join(evidenceDir, file))
    }
  }
  fs.copyFileSync(resultPath, path.join(evidenceDir, 'workflow-result-current.json'))
}

fs.rmSync(outDir, { recursive: true, force: true })
fs.mkdirSync(outDir, { recursive: true })

const service = createServiceClient()
const cleanupState = {}

try {
  const tempLead = await createTemporaryLead(service)
  cleanupState.leadId = tempLead.id
  const tempOwner = await createTemporaryOwner(service)
  cleanupState.ownerProfileId = tempOwner.profileId
  cleanupState.ownerAuthUserId = tempOwner.authUserId

  const browser = await chromium.launch({ headless: true })
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const routes = await verifyRoutes(desktop)
  await desktop.close()

  const result = {
    ok: true,
    checkedAt: new Date().toISOString(),
    baseUrl,
    outDir,
    routes,
    guest: await auditGuest(browser),
    admin: await auditAdmin(browser, service, tempLead),
    owner: await auditOwner(browser, tempOwner),
  }

  await browser.close()
  assertAuditResult({ guest: result.guest, admin: result.admin, owner: result.owner })

  const cleanupErrors = await cleanup(service, cleanupState)
  result.cleanup = { ok: cleanupErrors.length === 0, errors: cleanupErrors }

  const resultPath = path.join(outDir, 'workflow-result.json')
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2))
  copyEvidence(resultPath)

  console.log(JSON.stringify(result, null, 2))
} catch (error) {
  const cleanupErrors = await cleanup(service, cleanupState).catch((cleanupError) => [cleanupError.message ?? String(cleanupError)])
  console.error(JSON.stringify({
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    cleanup: {
      ok: cleanupErrors.length === 0,
      errors: cleanupErrors,
    },
    outDir,
  }, null, 2))
  process.exit(1)
}
