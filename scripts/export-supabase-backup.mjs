import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const outputRoot = process.env.MORROW_BACKUP_DIR || 'backups/supabase'
const pageSize = Number(process.env.MORROW_BACKUP_PAGE_SIZE || 1000)

const tables = [
  'leads',
  'customers',
  'bookings',
  'packages',
  'package_dates',
  'properties',
  'experience_providers',
  'experience_blocks',
  'local_places',
  'support_messages',
  'support_status_events',
  'guest_feedback',
  'communication_events',
  'email_events',
  'admin_tasks',
  'admin_audit_logs',
  'owner_profiles',
  'owner_property_access',
  'owner_documents',
  'owner_operations',
  'owner_statements',
  'agencies',
]

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

function backupStamp() {
  return new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
}

async function exportTable(table) {
  const rows = []
  let from = 0

  while (true) {
    const to = from + pageSize - 1
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .range(from, to)

    if (error) throw error

    rows.push(...(data ?? []))

    if (!data || data.length < pageSize) break
    from += pageSize
  }

  return rows
}

const startedAt = new Date().toISOString()
const backupDir = join(outputRoot, backupStamp())
await mkdir(backupDir, { recursive: true })

const manifest = {
  startedAt,
  finishedAt: null,
  supabaseUrl,
  backupDir,
  tables: [],
}

let hasFailures = false

for (const table of tables) {
  try {
    const rows = await exportTable(table)
    const file = `${table}.json`
    await writeFile(join(backupDir, file), `${JSON.stringify(rows, null, 2)}\n`)
    manifest.tables.push({
      table,
      file,
      rows: rows.length,
      status: 'exported',
    })
    console.log(`${table}: ${rows.length} rows`)
  } catch (error) {
    hasFailures = true
    manifest.tables.push({
      table,
      rows: 0,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    })
    console.error(`${table}: failed`)
  }
}

manifest.finishedAt = new Date().toISOString()
await writeFile(join(backupDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

console.log(`backup written to ${backupDir}`)

if (hasFailures) process.exit(1)
