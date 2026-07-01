import fs from 'node:fs'
import path from 'node:path'
import {
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

function fileContains(relativePath, patterns) {
  if (!exists(relativePath)) return false
  const body = read(relativePath)
  return patterns.every((pattern) => pattern.test(body))
}

const requiredDocs = [
  'docs/MIGRATION_CONSOLIDATION_AUDIT.md',
  'docs/ADMIN_CRM_PARITY_CHECKLIST.md',
  'docs/ADMIN_PARITY_QA_RUNBOOK.md',
  'docs/ADMIN_PARITY_EXECUTION_PLAN.md',
  'docs/ADMIN_PARITY_PREFLIGHT_FIXLIST_2026-06-30.md',
  'docs/MIGRATION_COMPLETION_AUDIT_2026-06-28.md',
  'docs/PAYLOAD_NORMALIZATION_INVENTORY.md',
  'docs/PROTOTYPE_STORAGE_INVENTORY.md',
  'docs/LAUNCH_STATUS_SNAPSHOT_2026-07-01.md',
  'docs/PLATFORM_ARCHITECTURE.md',
  'docs/STRATEGIC_FOUNDATION_MORROW.md',
  'docs/qa/admin-parity/env.template',
]

const requiredScripts = [
  'qa:admin-audit',
  'qa:admin-parity:block1',
  'qa:admin-parity:block2',
  'qa:admin-parity:block3',
  'qa:admin-parity:block4',
  'qa:admin-parity:block5',
  'qa:admin-parity:new',
  'qa:admin-parity:preflight',
  'qa:admin-parity:structure',
  'qa:admin-parity:status',
  'qa:admin-parity:validate',
  'qa:app-deployment-config',
  'qa:apps',
  'qa:launch-gates',
  'qa:production',
  'qa:prototype-storage',
  'qa:readiness',
]

const activeLaunchSnapshotRefs = [
  'docs/PRODUCTION_LAUNCH_CHECKLIST.md',
  'docs/MORROW_MVP_COMPLETION_PLAN.md',
  'docs/MIGRATION_COMPLETION_AUDIT_2026-06-28.md',
]

const blockers = []
const warnings = []
const passed = []

for (const doc of requiredDocs) {
  if (exists(doc)) {
    passed.push({ id: `doc:${doc}`, message: `${doc} exists.` })
  } else {
    blockers.push({ id: `doc:${doc}`, message: `${doc} is missing.` })
  }
}

const consolidationDoc = 'docs/MIGRATION_CONSOLIDATION_AUDIT.md'
const requiredConsolidationSections = [
  ['Bestandsaufnahme', /## Bestandsaufnahme/],
  ['Migrationsmatrix', /## Migrationsmatrix/],
  ['Admin-Funktionsparität', /## Admin-Funktionsparitaet/],
  ['Führende App pro Bereich', /## Fuehrende App Pro Bereich/],
  ['Dev- und Betriebsbasis', /## Dev- Und Betriebsbasis/],
  ['Stop-Regel', /Bis zur Admin-CRM-Paritaet werden keine neuen Produktfeatures gebaut/],
]

for (const [label, pattern] of requiredConsolidationSections) {
  if (fileContains(consolidationDoc, [pattern])) {
    passed.push({ id: `section:${label}`, message: `${label} is documented.` })
  } else {
    blockers.push({
      id: `section:${label}`,
      message: `${label} is missing in ${consolidationDoc}.`,
    })
  }
}

const packageJson = exists('package.json') ? JSON.parse(read('package.json')) : { scripts: {} }
for (const scriptName of requiredScripts) {
  if (packageJson.scripts?.[scriptName]) {
    passed.push({ id: `script:${scriptName}`, message: `${scriptName} exists.` })
  } else {
    blockers.push({ id: `script:${scriptName}`, message: `${scriptName} is missing.` })
  }
}

for (const doc of activeLaunchSnapshotRefs) {
  if (fileContains(doc, [/docs\/LAUNCH_STATUS_SNAPSHOT_2026-07-01\.md/])) {
    passed.push({
      id: `launch-snapshot-ref:${doc}`,
      message: `${doc} references the current launch snapshot.`,
    })
  } else {
    warnings.push({
      id: `launch-snapshot-ref:${doc}`,
      message: `${doc} should reference docs/LAUNCH_STATUS_SNAPSHOT_2026-07-01.md.`,
    })
  }
}

if (fileContains('docs/MIGRATION_COMPLETION_AUDIT_2026-06-28.md', [
  /Die Konsolidierung ist aber noch nicht abgeschlossen/,
  /kein (gruen |grün )?validiertes Protokoll unter `docs\/qa\/admin-parity\/`/,
])) {
  passed.push({
    id: 'completion-audit:not-complete',
    message: 'Completion audit still correctly marks consolidation as not complete.',
  })
} else {
  warnings.push({
    id: 'completion-audit:wording',
    message: 'Completion audit wording should keep the consolidation explicitly uncompleted until admin parity is validated.',
  })
}

const latestAdminParityRun = findLatestAdminParityRun(rootDir)
const parityRun = latestAdminParityRun ? read(latestAdminParityRun) : ''
const parityValidation = parityRun ? validateAdminParityRun(parityRun) : null

if (!latestAdminParityRun) {
  blockers.push({
    id: 'admin-parity:run-missing',
    message: 'No admin parity QA run exists under docs/qa/admin-parity/.',
  })
} else if (!parityValidation.valid || !parityValidation.resultAllowsPaidGuests) {
  blockers.push({
    id: 'admin-parity:not-green',
    message: 'Latest admin parity run is not a validated green run.',
    evidence: {
      latestAdminParityRun,
      validation: parityValidation,
    },
  })
} else {
  passed.push({
    id: 'admin-parity:green',
    message: `${latestAdminParityRun} is valid and green.`,
  })
}

const result = {
  ok: blockers.length === 0,
  latestAdminParityRun,
  counts: {
    blockers: blockers.length,
    warnings: warnings.length,
    passed: passed.length,
  },
  blockers,
  warnings,
  passed,
}

const output = JSON.stringify(result, null, 2)

if (result.ok) {
  console.log(output)
} else {
  console.error(output)
  process.exit(1)
}
