import fs from 'node:fs'
import { chromium } from 'playwright'

const screenshotsDir = 'tmp/qa/apps-production'

const targets = [
  {
    key: 'admin',
    name: 'Admin-App',
    baseUrl: process.env.ADMIN_BASE_URL,
    expectedLandingText: /Morrow Admin|Steuerung für Anfragen/i,
    login: {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      dashboardText: /Anfragen|Buchungen|Support|Morrow Admin/i,
      requiredDashboardTexts: [/Anfragen/i, /Buchungen/i, /Support/i],
    },
  },
  {
    key: 'owner',
    name: 'Eigentümer-App',
    baseUrl: process.env.OWNER_BASE_URL,
    expectedLandingText: /Morrow Eigentümer|Transparenz für Objekt/i,
    login: {
      email: process.env.OWNER_EMAIL,
      password: process.env.OWNER_PASSWORD,
      dashboardText: /Guten Überblick|Objekte|Auszeiten|Buchungen/i,
      requiredDashboardTexts: [/Objekte/i, /Buchungen/i, /Lücken/i, /Abrechnung/i, /Dokumente/i],
    },
  },
  {
    key: 'guest',
    name: 'Gäste-App',
    baseUrl: process.env.GUEST_BASE_URL,
    expectedLandingText: /Deine Auszeit|Alles Wichtige/i,
    guestStay: {
      bookingId: process.env.GUEST_BOOKING_ID,
      accessCode: process.env.GUEST_ACCESS_CODE,
      expectedText: /Anreise|Buchung|Vor Ort|Hilfe|Auszeit/i,
    },
  },
]

function normalizeBaseUrl(url) {
  return url?.replace(/\/$/, '')
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function assertNoSoft404(name, body) {
  const normalizedBody = body.replace(/\s+/g, ' ').trim()
  assert(
    !/404 Diese Seite gibt es noch nicht/i.test(normalizedBody),
    `${name} rendered the Morrow 404 page with a successful HTTP response`,
  )
}

async function readBody(page) {
  return page.locator('body').innerText()
}

async function checkLanding(page, target) {
  const response = await page.goto(target.baseUrl, { waitUntil: 'networkidle' })
  assert(response?.ok(), `${target.name} landing returned ${response?.status()}`)
  const body = await readBody(page)
  assertNoSoft404(target.name, body)
  assert(target.expectedLandingText.test(body), `${target.name} landing text did not match`)
}

async function checkHealth(target) {
  const response = await fetch(`${target.baseUrl}/health`, {
    headers: { accept: 'application/json' },
  })
  assert(response.ok, `${target.name} health returned ${response.status}`)

  const body = await response.json()
  assert(body.status === 'ok', `${target.name} health status expected ok, got ${body.status}`)
  assert(body.app === target.key, `${target.name} health app expected ${target.key}, got ${body.app}`)

  return {
    app: body.app,
    service: body.service,
    status: body.status,
  }
}

async function checkLogin(page, target) {
  if (!target.login?.email || !target.login?.password) {
    return { checked: false, reason: `${target.name} login skipped; credentials not set.` }
  }

  await page.goto(target.baseUrl, { waitUntil: 'networkidle' })
  await page.getByLabel(/E-Mail/i).fill(target.login.email)
  await page.getByLabel(/Passwort/i).fill(target.login.password)
  await page.getByRole('button', { name: /Einloggen/i }).click()
  await page.waitForURL(/\/dashboard(?:$|\?)/, { timeout: 20_000 })
  await page.waitForLoadState('networkidle')

  const body = await readBody(page)
  assertNoSoft404(`${target.name} dashboard`, body)
  assert(target.login.dashboardText.test(body), `${target.name} dashboard text did not match`)
  for (const requiredText of target.login.requiredDashboardTexts ?? []) {
    assert(requiredText.test(body), `${target.name} dashboard is missing expected section ${requiredText}`)
  }

  await page.screenshot({ path: `${screenshotsDir}/${target.key}-dashboard.png`, fullPage: false })

  return {
    checked: true,
    requiredSections: (target.login.requiredDashboardTexts ?? []).length,
    screenshot: `${screenshotsDir}/${target.key}-dashboard.png`,
  }
}

async function checkGuestStay(page, target) {
  const bookingId = target.guestStay?.bookingId
  const accessCode = target.guestStay?.accessCode

  if (!bookingId || !accessCode) {
    return { checked: false, reason: 'Gäste-App stay check skipped; GUEST_BOOKING_ID/GUEST_ACCESS_CODE not set.' }
  }

  const stayUrl = `${target.baseUrl}/deine-auszeit/${encodeURIComponent(bookingId)}?code=${encodeURIComponent(accessCode)}`
  const response = await page.goto(stayUrl, { waitUntil: 'networkidle' })
  assert(response?.ok(), `Gäste-App stay returned ${response?.status()}`)
  const body = await readBody(page)
  assertNoSoft404('Gäste-App stay', body)
  assert(target.guestStay.expectedText.test(body), 'Gäste-App stay text did not match')

  await page.screenshot({ path: `${screenshotsDir}/guest-stay.png`, fullPage: false })

  return { checked: true, screenshot: `${screenshotsDir}/guest-stay.png` }
}

const configuredTargets = targets
  .map((target) => ({ ...target, baseUrl: normalizeBaseUrl(target.baseUrl) }))
  .filter((target) => target.baseUrl)

if (configuredTargets.length === 0) {
  console.log(JSON.stringify({
    ok: true,
    checkedApps: 0,
    reason: 'No app base URLs set. Provide ADMIN_BASE_URL, OWNER_BASE_URL and/or GUEST_BASE_URL.',
  }, null, 2))
  process.exit(0)
}

fs.mkdirSync(screenshotsDir, { recursive: true })

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
  const results = []

  for (const target of configuredTargets) {
    const activePage = target.key === 'guest' ? mobile : page
    const health = await checkHealth(target)
    await checkLanding(activePage, target)

    const result = {
      app: target.key,
      baseUrl: target.baseUrl,
      health,
      landing: { checked: true },
    }

    if (target.login) {
      result.login = await checkLogin(activePage, target)
    }

    if (target.guestStay) {
      result.guestStay = await checkGuestStay(activePage, target)
    }

    results.push(result)
  }

  await browser.close()

  if (consoleErrors.length > 0) {
    console.error(consoleErrors.join('\n'))
    process.exit(1)
  }

  console.log(JSON.stringify({
    ok: true,
    checkedApps: results.length,
    results,
  }, null, 2))
} catch (error) {
  await browser.close()
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
