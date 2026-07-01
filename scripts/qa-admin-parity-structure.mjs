import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const viteAdminPath = 'src/App.tsx'
const nextAdminPath = 'apps/admin/app/dashboard/AdminDashboardClient.tsx'
const parityDocPath = 'docs/ADMIN_CRM_PARITY_CHECKLIST.md'
const migrationDocPath = 'docs/MIGRATION_CONSOLIDATION_AUDIT.md'

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8')
}

function lineNumberAt(source, index) {
  return source.slice(0, index).split('\n').length
}

const viteAdmin = read(viteAdminPath)
const nextAdmin = read(nextAdminPath)
const parityDoc = read(parityDocPath)
const migrationDoc = read(migrationDocPath)

const legacySectionMatch = viteAdmin.match(/type AdminSection\s*=\s*([^\n]+)/)

if (!legacySectionMatch) {
  console.error(`Could not find AdminSection union in ${viteAdminPath}.`)
  process.exit(1)
}

const legacySections = Array.from(legacySectionMatch[1].matchAll(/'([^']+)'/g), (match) => match[1])

const expectedSections = [
  {
    legacyKey: 'overview',
    legacyLabel: 'Übersicht',
    workspace: 'overview',
    anchor: 'id="audit"',
    tables: ['admin_audit_logs'],
    docLabels: ['Admin-Shell', 'Uebersicht'],
  },
  {
    legacyKey: 'leads',
    legacyLabel: 'Anfragen',
    workspace: 'crm',
    anchor: 'id="anfragen"',
    tables: ['leads', 'communication_events'],
    docLabels: ['Leads/Anfragen'],
  },
  {
    legacyKey: 'tasks',
    legacyLabel: 'Aufgaben',
    workspace: 'tasks',
    anchor: 'id="aufgaben"',
    tables: ['admin_tasks'],
    docLabels: ['Aufgaben'],
  },
  {
    legacyKey: 'guestSupport',
    legacyLabel: 'Gästesupport',
    workspace: 'support',
    anchor: 'id="support"',
    tables: ['support_messages', 'support_status_events'],
    docLabels: ['Gaestesupport'],
  },
  {
    legacyKey: 'customers',
    legacyLabel: 'Kunden',
    workspace: 'crm',
    anchor: 'id="kunden"',
    tables: ['customers', 'leads', 'bookings'],
    docLabels: ['Kunden'],
  },
  {
    legacyKey: 'bookings',
    legacyLabel: 'Buchungen',
    workspace: 'crm',
    anchor: 'id="buchungen"',
    tables: ['bookings', 'customers'],
    docLabels: ['Buchungen'],
  },
  {
    legacyKey: 'packages',
    legacyLabel: 'Auszeiten',
    workspace: 'inventory',
    anchor: 'id="bestand"',
    tables: ['packages', 'package_dates', 'properties'],
    docLabels: ['Auszeiten'],
  },
  {
    legacyKey: 'experiences',
    legacyLabel: 'Erlebnisse',
    workspace: 'operations',
    anchor: 'id="erlebnisse"',
    tables: ['experience_blocks', 'experience_providers'],
    docLabels: ['Erlebnisbausteine'],
  },
  {
    legacyKey: 'localPlaces',
    legacyLabel: 'Vor Ort',
    workspace: 'operations',
    anchor: 'id="vor-ort"',
    tables: ['local_places'],
    docLabels: ['Vor-Ort-Orte'],
  },
  {
    legacyKey: 'owners',
    legacyLabel: 'Eigentümer',
    workspace: 'owners',
    anchor: 'id="eigentuemer"',
    tables: ['owner_profiles', 'owner_property_access', 'owner_documents', 'owner_statements', 'owner_operations'],
    docLabels: ['Owner-Daten'],
  },
  {
    legacyKey: 'agencies',
    legacyLabel: 'Agenturen',
    workspace: 'partners',
    anchor: 'id="agenturen"',
    tables: ['agencies'],
    docLabels: ['Agenturen'],
  },
  {
    legacyKey: 'experienceProviders',
    legacyLabel: 'Erlebnisanbieter',
    workspace: 'partners',
    anchor: 'id="erlebnisanbieter"',
    tables: ['experience_providers'],
    docLabels: ['Erlebnisanbieter'],
  },
  {
    legacyKey: 'activity',
    legacyLabel: 'Aktivität',
    workspace: 'activity',
    anchor: 'id="audit"',
    tables: ['admin_audit_logs', 'communication_events'],
    docLabels: ['Audit', 'Kommunikation'],
  },
]

const blockers = []
const passed = []

for (const expected of expectedSections) {
  if (!legacySections.includes(expected.legacyKey)) {
    blockers.push({
      id: `legacy:${expected.legacyKey}`,
      message: `${expected.legacyKey} is missing from Vite AdminSection union.`,
    })
  } else {
    passed.push({
      id: `legacy:${expected.legacyKey}`,
      message: `${expected.legacyKey} exists in Vite AdminSection union.`,
    })
  }

  const legacyLabelIndex = nextAdmin.indexOf(`legacySections: [`)
  const workspacePattern = new RegExp(`id:\\s*["']${expected.workspace}["'][\\s\\S]{0,500}?legacySections:\\s*\\[[^\\]]*["']${expected.legacyLabel}["']`)
  const workspaceMatch = nextAdmin.match(workspacePattern)
  if (!workspaceMatch) {
    blockers.push({
      id: `workspace:${expected.legacyKey}`,
      message: `${expected.legacyLabel} is not mapped to workspace ${expected.workspace} in adminWorkspaces.`,
    })
  } else {
    passed.push({
      id: `workspace:${expected.legacyKey}`,
      message: `${expected.legacyLabel} is mapped to workspace ${expected.workspace}.`,
    })
  }

  if (!nextAdmin.includes(expected.anchor)) {
    blockers.push({
      id: `anchor:${expected.legacyKey}`,
      message: `${expected.anchor} is missing from ${nextAdminPath}.`,
    })
  } else {
    passed.push({
      id: `anchor:${expected.legacyKey}`,
      message: `${expected.legacyLabel} has an admin section anchor.`,
    })
  }

  for (const table of expected.tables) {
    const tablePattern = `.from("${table}")`
    if (!nextAdmin.includes(tablePattern)) {
      blockers.push({
        id: `table:${expected.legacyKey}:${table}`,
        message: `${expected.legacyLabel} expects ${table} to be loaded or mutated in Next Admin.`,
      })
    } else {
      passed.push({
        id: `table:${expected.legacyKey}:${table}`,
        message: `${expected.legacyLabel} touches ${table}.`,
      })
    }
  }

  for (const docLabel of expected.docLabels) {
    if (!parityDoc.includes(docLabel) && !migrationDoc.includes(docLabel)) {
      blockers.push({
        id: `doc:${expected.legacyKey}:${docLabel}`,
        message: `${docLabel} is not documented in parity or migration docs.`,
      })
    } else {
      passed.push({
        id: `doc:${expected.legacyKey}:${docLabel}`,
        message: `${docLabel} is documented.`,
      })
    }
  }

  if (legacyLabelIndex === -1) {
    blockers.push({
      id: 'workspaces:legacy-sections',
      message: 'adminWorkspaces legacySections mapping is missing.',
    })
  }
}

const duplicateBlockerIds = new Set()
const seenBlockerIds = new Set()
for (const blocker of blockers) {
  if (seenBlockerIds.has(blocker.id)) duplicateBlockerIds.add(blocker.id)
  seenBlockerIds.add(blocker.id)
}

if (duplicateBlockerIds.size > 0) {
  throw new Error(`Duplicate blocker ids: ${Array.from(duplicateBlockerIds).join(', ')}`)
}

const result = {
  ok: blockers.length === 0,
  source: {
    viteAdminSectionLine: lineNumberAt(viteAdmin, legacySectionMatch.index ?? 0),
    nextAdmin: nextAdminPath,
    parityDoc: parityDocPath,
  },
  checkedLegacySections: legacySections,
  counts: {
    blockers: blockers.length,
    passed: passed.length,
  },
  blockers,
  passed,
}

const output = JSON.stringify(result, null, 2)

if (result.ok) {
  console.log(output)
} else {
  console.error(output)
  process.exit(1)
}
