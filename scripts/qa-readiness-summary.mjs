import fs from 'node:fs'
import path from 'node:path'
import {
  extractAdminParityResult,
  findLatestAdminParityRun,
  validateAdminParityRun,
} from './lib/admin-parity-run.mjs'

const rootDir = process.cwd()

function exists(relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath))
}

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8')
}

function parseEnvFile(relativePath) {
  const fullPath = path.join(rootDir, relativePath)
  if (!fs.existsSync(fullPath)) return {}

  return Object.fromEntries(
    fs.readFileSync(fullPath, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=')
        const key = line.slice(0, index).trim()
        const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')
        return [key, value]
      }),
  )
}

const envFile = parseEnvFile('.env.local')

function envValue(name) {
  return process.env[name] || envFile[name] || ''
}

function envAny(names) {
  return names.some((name) => Boolean(envValue(name)))
}

function env(name) {
  return Boolean(envValue(name))
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length
}

function findLatestLaunchSnapshot() {
  const docsDir = path.join(rootDir, 'docs')
  if (!fs.existsSync(docsDir)) return null

  const snapshots = fs
    .readdirSync(docsDir)
    .filter((file) => /^LAUNCH_STATUS_SNAPSHOT_\d{4}-\d{2}-\d{2}\.md$/.test(file))
    .sort()

  return snapshots.at(-1) ? `docs/${snapshots.at(-1)}` : null
}

const requiredDocs = [
  'docs/MORROW_MASTER_FRAME.md',
  'docs/STRATEGIC_FOUNDATION_MORROW.md',
  'docs/PLATFORM_ARCHITECTURE.md',
  'docs/MIGRATION_CONSOLIDATION_AUDIT.md',
  'docs/ADMIN_CRM_PARITY_CHECKLIST.md',
  'docs/ADMIN_PARITY_QA_RUNBOOK.md',
  'docs/PRODUCTION_LAUNCH_CHECKLIST.md',
]

const legalFiles = [
  ['apps/web/app/impressum/page.tsx', 'Impressum'],
  ['apps/web/app/agb/page.tsx', 'AGB'],
  ['apps/web/app/buchungsbedingungen/page.tsx', 'Buchungsbedingungen'],
  ['apps/web/app/stornobedingungen/page.tsx', 'Stornobedingungen'],
  ['apps/web/app/zahlungsbedingungen/page.tsx', 'Zahlungsbedingungen'],
]

const legalPlaceholderPatterns = [
  /MVP-Phase/i,
  /Arbeitsfassung/i,
  /vollstaendigen Anbieterangaben|vollständigen Anbieterangaben/i,
  /Bitte hier/i,
  /final (erg[aä]nzt|hinterlegt|festgelegt|benannt|pruefen|prüfen)/i,
  /vor dem verbindlichen .* final/i,
  /konkreten Fristen, Kosten und Bedingungen .* werden im Angebot/i,
  /zentrale Kontaktadresse .* final/i,
]

const latestSnapshot = findLatestLaunchSnapshot()
const latestAdminParityRun = findLatestAdminParityRun(rootDir)
const runbookPath = 'docs/ADMIN_PARITY_QA_RUNBOOK.md'
const runbook = exists(runbookPath) ? read(runbookPath) : ''
const parityRun = latestAdminParityRun ? read(latestAdminParityRun) : ''
const parityValidation = parityRun ? validateAdminParityRun(parityRun) : null

const missingDocs = requiredDocs.filter((doc) => !exists(doc))
const openRunbookManualGates = countMatches(runbook, /\|\s*\d+\s+\|[^\n]*\|\s*Offen\s*\|/g)
const uncheckedRunbookTemplateGates = countMatches(runbook, /- \[ \]/g)
const adminParityResult = parityRun ? extractAdminParityResult(parityRun) : 'Missing'
const adminParityRunComplete = Boolean(parityValidation?.valid)
const adminParityGreen = Boolean(parityValidation?.valid && parityValidation.resultAllowsPaidGuests)
const adminParityAllowsControlledLeads = Boolean(
  parityValidation?.valid && parityValidation.resultAllowsControlledLeads,
)

const legalPlaceholders = legalFiles.flatMap(([file, label]) => {
  if (!exists(file)) return [{ file, label, issue: 'missing' }]
  const body = read(file)
  const matches = legalPlaceholderPatterns
    .filter((pattern) => pattern.test(body))
    .map((pattern) => pattern.toString())

  return matches.length > 0 ? [{ file, label, issue: 'placeholder', matches }] : []
})

const appUrls = {
  admin: env('ADMIN_BASE_URL') || env('MORROW_ADMIN_APP_URL'),
  guest: env('GUEST_BASE_URL') || env('MORROW_GUEST_APP_URL'),
  owner: env('OWNER_BASE_URL') || env('MORROW_OWNER_APP_URL'),
}

const checks = {
  docsPresent: missingDocs.length === 0,
  launchSnapshotPresent: Boolean(latestSnapshot),
  adminRunbookPresent: Boolean(runbook),
  adminParityRunPresent: Boolean(latestAdminParityRun),
  adminParityRunComplete,
  adminParityAllowsControlledLeads,
  adminParityGreen,
  legalClean: legalPlaceholders.length === 0 && env('MORROW_LEGAL_APPROVED_AT'),
  supabasePublicEnv: envAny(['NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL'])
    && envAny(['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY']),
  appUrlsComplete: appUrls.admin && appUrls.guest && appUrls.owner,
  secretsRotated: env('MORROW_SECRETS_ROTATED_AT'),
  offerDataApproved: env('MORROW_OFFER_DATA_APPROVED_AT'),
  trackingApproved: env('MORROW_TRACKING_APPROVED_AT')
    && env('NEXT_PUBLIC_GA_MEASUREMENT_ID')
    && env('NEXT_PUBLIC_META_PIXEL_ID'),
}

const stageStatus = {
  internalTesting: checks.docsPresent && checks.launchSnapshotPresent ? 'green' : 'red',
  controlledRealLeads:
    checks.docsPresent
    && checks.launchSnapshotPresent
    && checks.legalClean
    && checks.supabasePublicEnv
    && checks.appUrlsComplete
    && checks.secretsRotated
    && checks.adminParityAllowsControlledLeads
      ? 'yellow'
      : 'red',
  paidGuests:
    checks.legalClean
    && checks.supabasePublicEnv
    && checks.appUrlsComplete
    && checks.secretsRotated
    && checks.offerDataApproved
    && checks.adminParityGreen
      ? 'green'
      : 'red',
  paidAds:
    checks.legalClean
    && checks.supabasePublicEnv
    && checks.appUrlsComplete
    && checks.secretsRotated
    && checks.offerDataApproved
    && checks.trackingApproved
    && checks.adminParityGreen
      ? 'green'
      : 'red',
}

const blockers = []
if (missingDocs.length > 0) blockers.push({ id: 'docs:missing', detail: missingDocs })
if (!latestSnapshot) blockers.push({ id: 'launch:snapshot-missing' })
if (!checks.adminRunbookPresent) blockers.push({ id: 'admin:runbook-missing' })
if (!checks.adminParityRunPresent) {
  blockers.push({
    id: 'admin:parity-run-missing',
    detail: {
      runbookOpenManualGates: openRunbookManualGates,
      runbookUncheckedTemplateItems: uncheckedRunbookTemplateGates,
    },
  })
} else if (!checks.adminParityRunComplete || !checks.adminParityGreen) {
  blockers.push({
    id: 'admin:parity-run-not-green',
    detail: {
      latestAdminParityRun,
      adminParityResult,
      validation: parityValidation,
    },
  })
}
if (!checks.legalClean) blockers.push({ id: 'legal:not-approved-or-placeholders', detail: legalPlaceholders })
if (!checks.supabasePublicEnv) blockers.push({ id: 'env:supabase-public-missing' })
if (!checks.appUrlsComplete) blockers.push({ id: 'env:app-urls-missing', detail: appUrls })
if (!checks.secretsRotated) blockers.push({ id: 'security:secrets-rotation-missing' })
if (!checks.offerDataApproved) blockers.push({ id: 'offer:data-approval-missing' })
if (!checks.trackingApproved) blockers.push({ id: 'tracking:not-approved-or-missing' })

const result = {
  ok: stageStatus.paidGuests === 'green' && stageStatus.paidAds === 'green',
  latestSnapshot,
  latestAdminParityRun,
  adminParityResult,
  checks,
  stageStatus,
  counts: {
    openRunbookManualGates,
    uncheckedRunbookTemplateItems: uncheckedRunbookTemplateGates,
    openParityRunManualGates: parityValidation?.openManualRows ?? null,
    uncheckedParityRunItems: parityValidation?.uncheckedItems ?? null,
    missingParityRunEvidenceRows: parityValidation?.missingEvidenceRows ?? null,
    legalPlaceholderFiles: legalPlaceholders.length,
    blockers: blockers.length,
  },
  blockers,
}

const output = JSON.stringify(result, null, 2)

if (result.ok) {
  console.log(output)
} else {
  console.error(output)
  process.exit(1)
}
