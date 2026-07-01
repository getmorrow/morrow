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
import { createQaEnv } from './lib/qa-env.mjs'

const rootDir = process.cwd()
const qaEnv = createQaEnv(rootDir)
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

const parityBlocks = [
  {
    id: 'block-1',
    name: 'Zugang Und Baseline',
    goal: 'Admin-Zugang, Rollen und Audit-Basis beweisen.',
    gates: [1, 23],
    stopIf: [
      'Login funktioniert nicht.',
      'Nicht freigeschaltete Nutzer bekommen Zugriff.',
      'Audit-Log ist nicht lesbar.',
    ],
  },
  {
    id: 'block-2',
    name: 'Anfrage Zu Kunde Und Buchung',
    goal: 'Gastanfrage, CRM-Bearbeitung, Buchung, Kundensatz und Aufgaben beweisen.',
    gates: [2, 3, 4, 5, 6, 7, 10, 8, 9],
    stopIf: [
      'Lead landet nicht in Supabase/Admin.',
      'Reservierung erzeugt keine Buchung oder keinen Kundensatz.',
      'Buchungsdaten werden nicht gespeichert.',
      'Aufgabenbezug führt ins Leere.',
    ],
  },
  {
    id: 'block-3',
    name: 'Gäste-App Und Kommunikation',
    goal: 'Codegeschützten Gästebereich, Support, Antwort, Feedback und Historie beweisen.',
    gates: [11, 12, 13, 14, 24],
    stopIf: [
      'Gäste-App zeigt falsche Buchungsdaten.',
      'Support kommt nicht im Admin an.',
      'Antwort ist nicht im Gästeverlauf sichtbar.',
      'Kommunikation bleibt nicht zentral nachvollziehbar.',
    ],
  },
  {
    id: 'block-4',
    name: 'Bestand Und Operationsdaten',
    goal: 'Pflege von Auszeit, Unterkunft, Erlebnis, Vor-Ort-Ort und Veranstaltung beweisen.',
    gates: [15, 16, 17, 18, 19],
    stopIf: [
      'Auszeit ist nicht ohne Code pflegbar.',
      'Unterkunftsdaten werden nicht strukturiert gespeichert.',
      'Erlebnisbaustein ist nicht eindeutig Anbieter/Auszeit zugeordnet.',
      'Vor-Ort-Freigabe wirkt nicht in der Gäste-App.',
    ],
  },
  {
    id: 'block-5',
    name: 'Owner-App',
    goal: 'Owner-Dokumente, Abrechnungen und Operationsmeldungen mit Rechtefilter beweisen.',
    gates: [20, 21, 22],
    stopIf: [
      'Owner sieht falsche Objekte.',
      'Freigaben wirken nicht.',
      'Operationsstatus läuft zwischen Admin und Owner-App auseinander.',
    ],
  },
  {
    id: 'block-6',
    name: 'Finale Bewertung',
    goal: 'Automatische Gates, Evidenzbereiche und Ergebnisbewertung abschließen.',
    gates: [],
    stopIf: [
      'Automatische Gates sind offen.',
      'Evidenzbereiche sind leer.',
      'Bewertung bleibt Rot oder unbegründet.',
    ],
  },
]

const openManualGates = manualRows.filter((row) => normalizeResult(row.result) === 'offen')
const missingEvidenceGates = manualRows.filter((row) => {
  const rowResult = normalizeResult(row.result)
  const resultAllowsNoEvidence = ['nicht relevant', 'ersetzt'].includes(rowResult)
  return !resultAllowsNoEvidence && !evidenceIsFilled(row.evidence)
})
const manualRowsByNumber = new Map(manualRows.map((row) => [row.number, row]))
const automaticOpen = automaticGates.filter((gate) => !gate.checked)
const evidenceSectionRows = evidenceSections.map((heading) => ({
  heading,
  filled: sectionHasEvidence(body, heading),
}))
const blockStatus = parityBlocks.map((block) => {
  const rows = block.gates
    .map((number) => manualRowsByNumber.get(number))
    .filter(Boolean)
  const openRows = rows.filter((row) => normalizeResult(row.result) === 'offen')
  const missingEvidenceRows = rows.filter((row) => {
    const rowResult = normalizeResult(row.result)
    const resultAllowsNoEvidence = ['nicht relevant', 'ersetzt'].includes(rowResult)
    return !resultAllowsNoEvidence && !evidenceIsFilled(row.evidence)
  })

  const finaleOpen = block.id === 'block-6'
    ? automaticOpen.length + evidenceSectionRows.filter((section) => !section.filled).length + (validation.valid ? 0 : 1)
    : 0

  return {
    id: block.id,
    name: block.name,
    goal: block.goal,
    gates: block.gates,
    counts: {
      gates: rows.length,
      open: openRows.length + finaleOpen,
      missingEvidence: missingEvidenceRows.length,
    },
    openGates: openRows.map((row) => ({
      number: row.number,
      flow: row.flow,
    })),
    missingEvidence: missingEvidenceRows.map((row) => ({
      number: row.number,
      flow: row.flow,
      result: row.result,
    })),
    stopIf: block.stopIf,
  }
})
const nextBlock = blockStatus.find((block) => block.counts.open > 0 || block.counts.missingEvidence > 0) || null
const preflightInputGroups = [
  {
    id: 'apps:admin-url',
    label: 'Admin app URL',
    acceptedNames: ['ADMIN_BASE_URL', 'MORROW_ADMIN_APP_URL'],
  },
  {
    id: 'apps:guest-url',
    label: 'Guest app URL',
    acceptedNames: ['GUEST_BASE_URL', 'MORROW_GUEST_APP_URL'],
  },
  {
    id: 'apps:owner-url',
    label: 'Owner app URL',
    acceptedNames: ['OWNER_BASE_URL', 'MORROW_OWNER_APP_URL'],
  },
  {
    id: 'admin:credentials',
    label: 'Admin test login',
    acceptedNames: ['ADMIN_EMAIL', 'ADMIN_PASSWORD'],
    requireAll: true,
  },
  {
    id: 'guest:test-stay',
    label: 'Guest test booking',
    acceptedNames: ['GUEST_BOOKING_ID', 'GUEST_ACCESS_CODE'],
    requireAll: true,
  },
  {
    id: 'owner:credentials',
    label: 'Owner test login',
    acceptedNames: ['OWNER_EMAIL', 'OWNER_PASSWORD'],
    requireAll: true,
  },
]
const preflightInputs = preflightInputGroups.map((group) => {
  const missingNames = group.acceptedNames.filter((name) => !qaEnv.has(name))
  const ok = group.requireAll ? missingNames.length === 0 : qaEnv.hasAny(group.acceptedNames)

  return {
    id: group.id,
    label: group.label,
    ok,
    acceptedNames: group.acceptedNames,
    missingNames: ok ? [] : group.requireAll ? missingNames : group.acceptedNames,
  }
})
const missingPreflightInputs = preflightInputs.filter((group) => !group.ok)
const nextCommands = nextBlock?.id === 'block-1'
  ? [
      'npm run qa:admin-parity:preflight',
      'npm run qa:admin-parity:block1',
      'npm run qa:admin-parity:status',
    ]
  : validation.valid
    ? [
        'npm run qa:readiness',
        'npm run qa:migration-consolidation',
      ]
    : [
        'npm run qa:admin-parity:preflight',
        'npm run qa:admin-parity:status',
      ]

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
    automaticOpen: automaticOpen.length,
    manualGates: manualRows.length,
    manualOpen: openManualGates.length,
    manualMissingEvidence: missingEvidenceGates.length,
    evidenceSectionsFilled: evidenceSectionRows.filter((section) => section.filled).length,
  },
  automaticOpen: automaticOpen.map((gate) => gate.command),
  manualOpen: openManualGates.map((row) => ({
    number: row.number,
    flow: row.flow,
  })),
  manualMissingEvidence: missingEvidenceGates.map((row) => ({
    number: row.number,
    flow: row.flow,
    result: row.result,
  })),
  evidenceSections: evidenceSectionRows,
  preflightInputs: {
    envLocal: qaEnv.envLocalExists,
    missing: missingPreflightInputs.length,
    groups: preflightInputs,
  },
  blocks: blockStatus,
  nextBlock: nextBlock
    ? {
        id: nextBlock.id,
        name: nextBlock.name,
        open: nextBlock.counts.open,
        missingEvidence: nextBlock.counts.missingEvidence,
      }
    : null,
  nextStep: validation.valid
    ? 'Run qa:readiness and qa:migration-consolidation, then decide launch stage.'
    : nextBlock
      ? `Work through ${nextBlock.name} first, then rerun qa:admin-parity:status.`
      : 'Fill the open automatic gates, execute the manual gates, and add concrete evidence in the run table.',
  nextCommands,
}

console.log(JSON.stringify(output, null, 2))
