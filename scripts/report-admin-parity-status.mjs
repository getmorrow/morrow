import fs from 'node:fs'
import path from 'node:path'
import {
  evidenceIsFilled,
  extractAdminParityResult,
  findLatestAdminParityRun,
  normalizeResult,
  parseAutomaticGateRows,
  parseManualRows,
  sectionHasEvidence,
  validateAdminParityRun,
} from './lib/admin-parity-run.mjs'

const rootDir = process.cwd()
const requestedPath = process.argv[2]
const relativePath = requestedPath || findLatestAdminParityRun(rootDir)

if (!relativePath) {
  console.error(JSON.stringify({
    ok: false,
    reason: 'No admin parity run found. Create one with npm run qa:admin-parity:new.',
  }, null, 2))
  process.exit(1)
}

const fullPath = path.isAbsolute(relativePath)
  ? relativePath
  : path.join(rootDir, relativePath)

if (!fs.existsSync(fullPath)) {
  console.error(JSON.stringify({
    ok: false,
    file: relativePath,
    reason: 'Admin parity run file does not exist.',
  }, null, 2))
  process.exit(1)
}

const body = fs.readFileSync(fullPath, 'utf8')
const automaticGates = parseAutomaticGateRows(body)
const manualRows = parseManualRows(body)
const validation = validateAdminParityRun(body)
const evidenceSections = [
  'Screenshots',
  'Supabase-Datensätze',
  'E-Mail-/Communication-Events',
  'Audit-Log-Einträge',
]

const openManualGates = manualRows.filter((row) => normalizeResult(row.result) === 'offen')
const missingEvidenceGates = manualRows.filter((row) => {
  const rowResult = normalizeResult(row.result)
  const resultAllowsNoEvidence = ['nicht relevant', 'ersetzt'].includes(rowResult)
  return !resultAllowsNoEvidence && !evidenceIsFilled(row.evidence)
})

const output = {
  ok: true,
  file: path.relative(rootDir, fullPath),
  result: extractAdminParityResult(body),
  validation: {
    valid: validation.valid,
    allowsControlledLeads: validation.resultAllowsControlledLeads,
    allowsPaidGuests: validation.resultAllowsPaidGuests,
    issues: validation.issues.map((issue) => issue.id),
  },
  counts: {
    automaticGates: automaticGates.length,
    automaticOpen: automaticGates.filter((gate) => !gate.checked).length,
    manualGates: manualRows.length,
    manualOpen: openManualGates.length,
    manualMissingEvidence: missingEvidenceGates.length,
    evidenceSectionsFilled: evidenceSections.filter((heading) => sectionHasEvidence(body, heading)).length,
  },
  automaticOpen: automaticGates
    .filter((gate) => !gate.checked)
    .map((gate) => gate.command),
  manualOpen: openManualGates.map((row) => ({
    number: row.number,
    flow: row.flow,
  })),
  manualMissingEvidence: missingEvidenceGates.map((row) => ({
    number: row.number,
    flow: row.flow,
    result: row.result,
  })),
  evidenceSections: evidenceSections.map((heading) => ({
    heading,
    filled: sectionHasEvidence(body, heading),
  })),
  nextStep: validation.valid
    ? 'Run qa:readiness and qa:migration-consolidation, then decide launch stage.'
    : 'Fill the open automatic gates, execute the manual gates, and add concrete evidence in the run table.',
}

console.log(JSON.stringify(output, null, 2))
