import { chromium } from 'playwright'

const baseUrl = process.env.QA_BASE_URL ?? 'http://127.0.0.1:5173'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
const consoleErrors = []

page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text())
})

await page.goto(`${baseUrl}/?qa_local=1`, { waitUntil: 'networkidle' })
await page.getByText(/Urlaub am Meer, der sich von Anfang an vorbereitet anfühlt/).waitFor()
await page.goto(`${baseUrl}/auszeiten/family-escape?qa_local=1`, { waitUntil: 'networkidle' })
await page.getByText(/Vier Tage Nordsee/).waitFor()
await page.screenshot({ path: 'data/desktop.png', fullPage: false })

await page.locator('a[href="#anfrage"]').first().click()
const request = page.locator('#anfrage')
await request.getByLabel('Name').fill('Max Mustermann')
await request.getByLabel('E-Mail').fill('max@example.com')
await request.getByLabel('Telefon').fill('+491701234567')
await request.getByLabel('Termin').selectOption('12.-16. August')
await request.getByLabel('Erwachsene').fill('2')
await request.getByLabel('Kinder', { exact: true }).fill('2')
await request.getByLabel('Kinderalter').fill('4 und 8 Jahre')
await request.getByRole('button', { name: /Anfrage senden/ }).click()
await page.getByText(/Wir melden uns innerhalb von 24 Stunden/).waitFor()

await page.goto(`${baseUrl}/ratgeber`, { waitUntil: 'networkidle' })
await page.getByText(/Sankt Peter-Ording bewusst planen/).waitFor()

await page.goto(`${baseUrl}/eigentuemer?qa_local=1`, { waitUntil: 'networkidle' })
await page.getByText(/Deine Ferienimmobilie als Teil einer kuratierten Auszeit/).waitFor()
await page.getByLabel('Name', { exact: true }).fill('Erika Eigentum')
await page.getByLabel('E-Mail').fill('erika@example.com')
await page.getByLabel('Telefon').fill('+49170111222')
await page.getByLabel('Ort der Immobilie').fill('Sankt Peter-Ording')
await page.getByLabel('Art der Immobilie').fill('Ferienhaus')
await page.getByLabel('Anzahl Schlafplätze').fill('4')
await page.getByRole('button', { name: /Immobilie vorstellen/ }).click()

await page.goto(`${baseUrl}/partner/erlebnisanbieter?qa_local=1`, { waitUntil: 'networkidle' })
await page.getByText(/Lokale Erlebnisse, die aus einem Aufenthalt mehr machen/).waitFor()
await page.getByLabel('Name', { exact: true }).fill('Paul Partner')
await page.getByLabel('E-Mail').fill('paul@example.com')
await page.getByLabel('Telefon').fill('+49170333444')
await page.getByLabel('Name des Angebots / Unternehmens').fill('Yoga am Meer')
await page.getByLabel('Ort').fill('Sankt Peter-Ording')
await page.getByLabel('Art des Erlebnisses').fill('Yoga')
await page.getByLabel('Kurze Beschreibung').fill('Ruhige Yoga-Einheiten für Paare und Familien.')
await page.getByRole('button', { name: /Erlebnis anbieten/ }).click()

await page.goto(`${baseUrl}/?admin=1&admin_demo=1`, { waitUntil: 'networkidle' })
await page.getByText('Max Mustermann').first().waitFor()
await page.getByText('Erika Eigentum').first().waitFor()
await page.getByText('Paul Partner').first().waitFor()
await page.getByRole('button', { name: 'Anfragen', exact: true }).click()
await page.getByLabel('Status').selectOption('Neu')
await page.locator('.lead-row:not(.lead-row-head)').first().locator('select').selectOption('Kontaktiert')
await page.screenshot({ path: 'data/admin.png', fullPage: false })

await page.goto(`${baseUrl}/admin?seed=test-leads&admin_demo=1`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: 'Buchungen', exact: true }).click()
await page.getByLabel('Buchungen operative Signale').getByText('Gästebereich').waitFor()
await page.goto(`${baseUrl}/deine-auszeit/test-guest-paid?code=EC0T8A`, { waitUntil: 'networkidle' })
await page.getByText(/Eure Auszeit beginnt hier/).waitFor()
await page.getByRole('button', { name: 'Hilfe', exact: true }).click()
await page.getByText(/Schreibt uns, wenn ihr Unterstützung braucht/).waitFor()

const mobile = await browser.newPage({ viewport: { width: 390, height: 1000 } })
await mobile.goto(`${baseUrl}/pakete/couple-reset`, { waitUntil: 'networkidle' })
await mobile.getByRole('button', { name: /Auszeit planen/ }).click()
await mobile.getByText(/Auszeit anfragen/).waitFor()
await mobile.screenshot({ path: 'data/mobile.png', fullPage: false })

await browser.close()

if (consoleErrors.length > 0) {
  console.error(consoleErrors.join('\n'))
  process.exit(1)
}

console.log('qa-flow-ok')
