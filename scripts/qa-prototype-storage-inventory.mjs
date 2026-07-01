import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const sourceFiles = [
  'src/App.tsx',
  'src/data/localPlaces.ts',
]
const backendFile = 'src/lib/morrowBackend.ts'
const inventoryFile = 'docs/PROTOTYPE_STORAGE_INVENTORY.md'
const migrationDocFile = 'docs/MIGRATION_CONSOLIDATION_AUDIT.md'

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8')
}

const sources = sourceFiles.map((file) => ({ file, body: read(file) }))
const backend = read(backendFile)
const inventory = read(inventoryFile)
const migrationDoc = read(migrationDocFile)

const expectedStorageKeys = [
  'morrow-phase-1-leads',
  'morrow-admin-packages',
  'morrow-admin-experience-providers',
  'morrow-admin-owner-properties',
  'morrow-admin-tasks',
  'morrow-admin-agencies',
  'morrow-admin-customers',
  'morrow-admin-bookings',
  'morrow-admin-local-places',
  'morrow-feedback-submitted-<lead-id>',
  'morrow-admin-*',
]

const expectedBackendTables = [
  'leads',
  'support_messages',
  'admin_tasks',
  'customers',
  'bookings',
  'packages',
  'package_dates',
  'properties',
  'email_events',
  'communication_events',
  'guest_feedback',
  'local_places',
  'experience_providers',
  'experience_blocks',
  'agencies',
  'admin_audit_logs',
]

function hasSourceStorageKey(key) {
  if (key === 'morrow-feedback-submitted-<lead-id>') {
    return sources.some(({ body }) => body.includes('morrow-feedback-submitted-'))
  }

  if (key === 'morrow-admin-*') {
    return sources.some(({ body }) => body.includes("startsWith('morrow-admin-')") || body.includes('startsWith("morrow-admin-")'))
  }

  return sources.some(({ body }) => body.includes(key))
}

function hasDocStorageKey(key) {
  return inventory.includes(key)
}

const blockers = []
const passed = []

for (const key of expectedStorageKeys) {
  if (!hasSourceStorageKey(key)) {
    blockers.push({
      id: `storage-source:${key}`,
      message: `${key} is expected but was not found in Vite prototype sources.`,
    })
  } else {
    passed.push({
      id: `storage-source:${key}`,
      message: `${key} is present in prototype sources.`,
    })
  }

  if (!hasDocStorageKey(key)) {
    blockers.push({
      id: `storage-doc:${key}`,
      message: `${key} is not documented in ${inventoryFile}.`,
    })
  } else {
    passed.push({
      id: `storage-doc:${key}`,
      message: `${key} is documented.`,
    })
  }
}

for (const table of expectedBackendTables) {
  if (!backend.includes(`const ${camelish(table)}Table = '${table}'`) && !backend.includes(table)) {
    blockers.push({
      id: `backend-table:${table}`,
      message: `${table} is not visible in ${backendFile}.`,
    })
  } else {
    passed.push({
      id: `backend-table:${table}`,
      message: `${table} is present in Vite backend adapter.`,
    })
  }

  if (!inventory.includes(`\`${table}\``)) {
    blockers.push({
      id: `inventory-table:${table}`,
      message: `${table} is not documented in ${inventoryFile}.`,
    })
  } else {
    passed.push({
      id: `inventory-table:${table}`,
      message: `${table} is documented in prototype storage inventory.`,
    })
  }
}

if (!migrationDoc.includes('docs/PROTOTYPE_STORAGE_INVENTORY.md')) {
  blockers.push({
    id: 'migration-doc:prototype-storage-inventory',
    message: `${migrationDocFile} should reference ${inventoryFile}.`,
  })
} else {
  passed.push({
    id: 'migration-doc:prototype-storage-inventory',
    message: `${migrationDocFile} references ${inventoryFile}.`,
  })
}

function camelish(value) {
  return value.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
}

const result = {
  ok: blockers.length === 0,
  checkedFiles: [...sourceFiles, backendFile, inventoryFile, migrationDocFile],
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
