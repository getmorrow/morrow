import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const adminClientPath = path.join(repoRoot, 'apps/admin/app/dashboard/AdminDashboardClient.tsx')
const source = fs.readFileSync(adminClientPath, 'utf8')

const MUTATION_PATTERN = /\.(insert|update|delete|upsert)\s*\(/
const TABLE_PATTERN = /\.from\("([^"]+)"\)/
const NON_BUSINESS_TABLES = new Set([
  'admin_audit_logs',
  'communication_events',
  'support_status_events',
])

function lineNumberAt(index) {
  return source.slice(0, index).split('\n').length
}

function findMatchingBrace(openBraceIndex) {
  let depth = 0
  for (let index = openBraceIndex; index < source.length; index += 1) {
    const char = source[index]
    if (char === '{') depth += 1
    if (char === '}') {
      depth -= 1
      if (depth === 0) return index
    }
  }
  return -1
}

function extractAsyncFunctions() {
  const functions = []
  const functionPattern = /async function\s+([A-Za-z0-9_]+)\s*\([^)]*\)\s*\{/g
  let match

  while ((match = functionPattern.exec(source)) !== null) {
    const name = match[1]
    const openBraceIndex = source.indexOf('{', match.index)
    const closeBraceIndex = findMatchingBrace(openBraceIndex)
    if (closeBraceIndex === -1) {
      throw new Error(`Could not parse async function ${name}`)
    }

    functions.push({
      name,
      line: lineNumberAt(match.index),
      body: source.slice(openBraceIndex, closeBraceIndex + 1),
    })
    functionPattern.lastIndex = closeBraceIndex + 1
  }

  return functions
}

function mutatedTables(body) {
  const tables = new Set()
  const lines = body.split('\n')

  for (let index = 0; index < lines.length; index += 1) {
    if (!MUTATION_PATTERN.test(lines[index])) continue

    for (let back = index; back >= Math.max(0, index - 8); back -= 1) {
      const tableMatch = lines[back].match(TABLE_PATTERN)
      if (tableMatch) {
        tables.add(tableMatch[1])
        break
      }
    }
  }

  return Array.from(tables)
}

const functions = extractAsyncFunctions()
const auditedMutations = []
const missingAudit = []

for (const fn of functions) {
  const tables = mutatedTables(fn.body)
    .filter((table) => !NON_BUSINESS_TABLES.has(table))

  if (tables.length === 0) continue

  if (!fn.body.includes('writeAuditLog({')) {
    missingAudit.push({ ...fn, tables })
    continue
  }

  auditedMutations.push({ ...fn, tables })
}

if (missingAudit.length > 0) {
  console.error('Admin audit coverage failed. Missing writeAuditLog in mutating functions:')
  for (const fn of missingAudit) {
    console.error(`- ${fn.name} at ${path.relative(repoRoot, adminClientPath)}:${fn.line} mutates ${fn.tables.join(', ')}`)
  }
  process.exit(1)
}

console.log(`admin-audit-coverage-ok: ${auditedMutations.length} mutating functions write audit logs`)
