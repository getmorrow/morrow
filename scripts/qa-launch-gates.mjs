import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const allowBlockers = process.env.MORROW_QA_ALLOW_LAUNCH_BLOCKERS === '1'

const blockers = []
const warnings = []
const passed = []

function readFile(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8')
}

function exists(relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath))
}

function addBlocker(id, message, evidence) {
  blockers.push({ id, message, evidence })
}

function addWarning(id, message, evidence) {
  warnings.push({ id, message, evidence })
}

function addPassed(id, message) {
  passed.push({ id, message })
}

function requireFile(relativePath, label = relativePath) {
  if (exists(relativePath)) {
    addPassed(`file:${relativePath}`, `${label} exists.`)
    return true
  }

  addBlocker(`file:${relativePath}`, `${label} is missing.`, relativePath)
  return false
}

function requireEnv(name, message) {
  if (process.env[name]) {
    addPassed(`env:${name}`, `${name} is set.`)
    return true
  }

  addBlocker(`env:${name}`, message, `${name} is not set`)
  return false
}

function warnEnv(name, message) {
  if (process.env[name]) {
    addPassed(`env:${name}`, `${name} is set.`)
    return true
  }

  addWarning(`env:${name}`, message, `${name} is not set`)
  return false
}

function checkPublicRoutes() {
  const routes = [
    ['apps/web/app/page.tsx', '/'],
    ['apps/web/app/auszeiten/page.tsx', '/auszeiten'],
    ['apps/web/app/auszeiten/family-escape/page.tsx', '/auszeiten/family-escape'],
    ['apps/web/app/auszeiten/couple-reset/page.tsx', '/auszeiten/couple-reset'],
    ['apps/web/app/eigentuemer/page.tsx', '/eigentuemer'],
    ['apps/web/app/partner/erlebnisanbieter/page.tsx', '/partner/erlebnisanbieter'],
    ['apps/web/app/ratgeber/page.tsx', '/ratgeber'],
    ['apps/web/app/impressum/page.tsx', '/impressum'],
    ['apps/web/app/datenschutz/page.tsx', '/datenschutz'],
    ['apps/web/app/agb/page.tsx', '/agb'],
    ['apps/web/app/buchungsbedingungen/page.tsx', '/buchungsbedingungen'],
    ['apps/web/app/stornobedingungen/page.tsx', '/stornobedingungen'],
    ['apps/web/app/zahlungsbedingungen/page.tsx', '/zahlungsbedingungen'],
    ['apps/web/app/sitemap.ts', '/sitemap.xml'],
    ['apps/web/app/robots.ts', '/robots.txt'],
  ]

  for (const [file, route] of routes) {
    requireFile(file, `Public route ${route}`)
  }
}

function checkLegalPages() {
  const legalFiles = [
    ['apps/web/app/impressum/page.tsx', 'Impressum'],
    ['apps/web/app/datenschutz/page.tsx', 'Datenschutz'],
    ['apps/web/app/agb/page.tsx', 'AGB'],
    ['apps/web/app/buchungsbedingungen/page.tsx', 'Buchungsbedingungen'],
    ['apps/web/app/stornobedingungen/page.tsx', 'Stornobedingungen'],
    ['apps/web/app/zahlungsbedingungen/page.tsx', 'Zahlungsbedingungen'],
  ]

  const placeholderPatterns = [
    /MVP-Phase/i,
    /Arbeitsfassung/i,
    /vollstaendigen Anbieterangaben|vollständigen Anbieterangaben/i,
    /Bitte hier/i,
    /final (erg[aä]nzt|hinterlegt|festgelegt|benannt|pruefen|prüfen)/i,
    /vor dem verbindlichen .* final/i,
    /konkreten Fristen, Kosten und Bedingungen .* werden im Angebot/i,
    /zentrale Kontaktadresse .* final/i,
  ]

  for (const [file, label] of legalFiles) {
    if (!exists(file)) continue

    const body = readFile(file)
    const matches = placeholderPatterns
      .filter((pattern) => pattern.test(body))
      .map((pattern) => pattern.toString())

    if (matches.length > 0) {
      addBlocker(
        `legal:${label}`,
        `${label} still contains working-copy or placeholder language.`,
        { file, matches },
      )
    } else {
      addPassed(`legal:${label}`, `${label} has no launch-placeholder language detected.`)
    }
  }

  if (!process.env.MORROW_LEGAL_APPROVED_AT) {
    addBlocker(
      'approval:legal',
      'Legal approval timestamp is missing. Set MORROW_LEGAL_APPROVED_AT after final legal review.',
      'MORROW_LEGAL_APPROVED_AT is not set',
    )
  } else {
    addPassed('approval:legal', 'Legal approval timestamp is set.')
  }
}

function checkEnvironment() {
  requireEnv('NEXT_PUBLIC_SUPABASE_URL', 'Production website needs NEXT_PUBLIC_SUPABASE_URL.')
  requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Production website needs NEXT_PUBLIC_SUPABASE_ANON_KEY.')

  requireEnv('MORROW_ADMIN_APP_URL', 'Website must know the deployed Admin-App URL before final launch.')
  requireEnv('MORROW_GUEST_APP_URL', 'Website must know the deployed Gäste-App URL before final launch.')
  requireEnv('MORROW_OWNER_APP_URL', 'Website must know the deployed Eigentümer-App URL before final launch.')

  warnEnv(
    'NEXT_PUBLIC_GA_MEASUREMENT_ID',
    'GA4 is not configured. This is acceptable only if tracking is intentionally delayed.',
  )
  warnEnv(
    'NEXT_PUBLIC_META_PIXEL_ID',
    'Meta Pixel is not configured. This is acceptable only if paid social tracking is intentionally delayed.',
  )

  if (!process.env.MORROW_TRACKING_APPROVED_AT) {
    addWarning(
      'approval:tracking',
      'Tracking/consent approval timestamp is missing. Set MORROW_TRACKING_APPROVED_AT after GA/Meta/Consent decision.',
      'MORROW_TRACKING_APPROVED_AT is not set',
    )
  } else {
    addPassed('approval:tracking', 'Tracking approval timestamp is set.')
  }
}

function checkSecretExposure() {
  const unsafePublicNames = Object.keys(process.env).filter((name) => {
    const isPublic = name.startsWith('NEXT_PUBLIC_') || name.startsWith('VITE_')
    const looksSensitive = /SERVICE_ROLE|RESEND|ACCESS_TOKEN|PAT|PASSWORD|SECRET/i.test(name)
    return isPublic && looksSensitive
  })

  if (unsafePublicNames.length > 0) {
    addBlocker(
      'secrets:public-env',
      'Sensitive-looking values are exposed through public frontend env names.',
      unsafePublicNames,
    )
  } else {
    addPassed('secrets:public-env', 'No sensitive-looking public frontend env names detected.')
  }

  if (process.env.RESEND_API_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) {
    addWarning(
      'secrets:server-env-present',
      'Server secrets are present in this shell. Keep them out of Vercel frontend projects; they belong in Supabase Edge Function secrets or secure automation environments.',
      ['RESEND_API_KEY', 'SUPABASE_SERVICE_ROLE_KEY'].filter((name) => process.env[name]),
    )
  } else {
    addPassed('secrets:server-env-present', 'No server secrets detected in current shell.')
  }

  if (!process.env.MORROW_SECRETS_ROTATED_AT) {
    addBlocker(
      'approval:secret-rotation',
      'Secret rotation is not confirmed. Rotate shared Supabase PAT/service role, Resend key, GitHub PAT and shared passwords, then set MORROW_SECRETS_ROTATED_AT.',
      'MORROW_SECRETS_ROTATED_AT is not set',
    )
  } else {
    addPassed('approval:secret-rotation', 'Secret rotation timestamp is set.')
  }
}

function checkLeadAndConsentImplementation() {
  const leadFormFile = 'apps/web/app/_components/LeadForm.tsx'
  const analyticsFile = 'apps/web/app/_components/Analytics.tsx'

  if (requireFile(leadFormFile, 'Lead form component')) {
    const body = readFile(leadFormFile)
    const whatsappInputBlock = body.match(
      /<input[\s\S]{0,500}onChange=\{\(event\) => updateField\("whatsappOptIn", event\.target\.checked\)\}[\s\S]{0,120}\/>/,
    )?.[0] ?? ''
    const whatsappIsOptional =
      /whatsappOptIn:\s*false/.test(body)
      && /type="checkbox"/.test(whatsappInputBlock)
      && !/\brequired\b/.test(whatsappInputBlock)
      && !/\bdefaultChecked\b/.test(whatsappInputBlock)

    if (whatsappIsOptional) {
      addPassed('form:whatsapp-opt-in', 'WhatsApp opt-in is optional and not preselected.')
    } else {
      addBlocker(
        'form:whatsapp-opt-in',
        'WhatsApp opt-in must be optional and not preselected.',
        leadFormFile,
      )
    }

    if (/Erwachsene/.test(body) && /Kinder/.test(body) && /Alter der Kinder/.test(body)) {
      addPassed('form:guest-party-fields', 'Guest forms capture adults, children and children ages.')
    } else {
      addBlocker(
        'form:guest-party-fields',
        'Guest inquiry must capture adults, children and children ages.',
        leadFormFile,
      )
    }
  }

  if (requireFile(analyticsFile, 'Analytics component')) {
    const body = readFile(analyticsFile)
    if (/consent === "accepted"/.test(body) && /googletagmanager/.test(body) && /morrow-meta-pixel/.test(body)) {
      addPassed('tracking:consent-gate', 'GA/Meta tracking is consent-gated in the web app.')
    } else {
      addBlocker(
        'tracking:consent-gate',
        'GA/Meta tracking must be behind explicit consent.',
        analyticsFile,
      )
    }
  }
}

function checkOfferDataApproval() {
  const domainFile = 'packages/domain/src/index.ts'
  if (!requireFile(domainFile, 'Domain content model')) return

  const body = readFile(domainFile)
  const hasFamily = /slug:\s*"family-escape"/.test(body)
  const hasCouple = /slug:\s*"couple-reset"/.test(body)
  const hasPrices = /price:\s*"[^"]+"/.test(body)
  const hasDates = /dates:\s*\[[^\]]+"[^"]+"/s.test(body)

  if (hasFamily && hasCouple && hasPrices && hasDates) {
    addPassed('offer:basic-data', 'Family and Couple offers have visible prices and dates in the domain model.')
  } else {
    addBlocker(
      'offer:basic-data',
      'Family and Couple offers need visible price and date data before launch.',
      domainFile,
    )
  }

  if (!process.env.MORROW_OFFER_DATA_APPROVED_AT) {
    addBlocker(
      'approval:offer-data',
      'Final offer data approval is missing. Set MORROW_OFFER_DATA_APPROVED_AT after real dates, price, included experience, image rights and support responsibility are checked.',
      'MORROW_OFFER_DATA_APPROVED_AT is not set',
    )
  } else {
    addPassed('approval:offer-data', 'Offer data approval timestamp is set.')
  }
}

function checkAppProjectFiles() {
  const appFiles = [
    ['apps/web/vercel.json', 'Web Vercel config'],
    ['apps/admin/vercel.json', 'Admin Vercel config'],
    ['apps/guest/vercel.json', 'Guest Vercel config'],
    ['apps/owner/vercel.json', 'Owner Vercel config'],
    ['apps/web/app/health/route.ts', 'Web health endpoint'],
    ['apps/admin/app/health/route.ts', 'Admin health endpoint'],
    ['apps/guest/app/health/route.ts', 'Guest health endpoint'],
    ['apps/owner/app/health/route.ts', 'Owner health endpoint'],
  ]

  for (const [file, label] of appFiles) {
    requireFile(file, label)
  }
}

checkPublicRoutes()
checkLegalPages()
checkEnvironment()
checkSecretExposure()
checkLeadAndConsentImplementation()
checkOfferDataApproval()
checkAppProjectFiles()

const result = {
  ok: blockers.length === 0,
  allowBlockers,
  summary: {
    blockers: blockers.length,
    warnings: warnings.length,
    passed: passed.length,
  },
  blockers,
  warnings,
  passed,
}

const output = JSON.stringify(result, null, 2)

if (blockers.length > 0 && !allowBlockers) {
  console.error(output)
  process.exit(1)
}

console.log(output)
