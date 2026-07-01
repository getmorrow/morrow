import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()

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
const commandEnv = {
  ...envFile,
  ...process.env,
}

if (!commandEnv.SUPABASE_URL) {
  commandEnv.SUPABASE_URL = commandEnv.NEXT_PUBLIC_SUPABASE_URL || commandEnv.VITE_SUPABASE_URL || ''
}

if (!commandEnv.SUPABASE_ANON_KEY) {
  commandEnv.SUPABASE_ANON_KEY = commandEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || commandEnv.VITE_SUPABASE_ANON_KEY || ''
}

function value(name) {
  return commandEnv[name] || ''
}

function isPlaceholder(value) {
  const normalized = value.trim()
  if (!normalized) return true

  return [
    /^<.+>$/,
    /<[^>]+>/,
    /example\.com/i,
    /^https:\/\/<.+>$/i,
    /^your_/i,
    /^todo$/i,
    /^tbd$/i,
  ].some((pattern) => pattern.test(normalized))
}

function has(name) {
  return !isPlaceholder(value(name))
}

const requiredEnvGroups = [
  {
    id: 'supabase:url',
    label: 'Supabase public URL',
    names: ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL'],
  },
  {
    id: 'supabase:anon',
    label: 'Supabase anon key',
    names: ['SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'],
  },
  {
    id: 'admin:email',
    label: 'Admin email',
    names: ['ADMIN_EMAIL'],
  },
  {
    id: 'admin:password',
    label: 'Admin password',
    names: ['ADMIN_PASSWORD'],
  },
]

const envStatus = requiredEnvGroups.map((group) => ({
  id: group.id,
  label: group.label,
  ok: group.names.some(has),
  acceptedNames: group.names,
}))
const missingEnv = envStatus.filter((group) => !group.ok)

const checks = [
  {
    id: 'admin-login-rpc',
    label: 'Admin login, role and table access',
    command: ['npm', 'run', 'supabase:verify-admin'],
    evidenceTarget: 'Runbook gate 1 Admin-Login',
  },
  {
    id: 'admin-audit-static',
    label: 'Admin mutating functions write audit logs',
    command: ['npm', 'run', 'qa:admin-audit'],
    evidenceTarget: 'Runbook gate 23 Audit-Log Baseline',
  },
]

function runCheck(check) {
  if (check.id === 'admin-login-rpc' && missingEnv.length > 0) {
    return {
      id: check.id,
      label: check.label,
      command: check.command.join(' '),
      evidenceTarget: check.evidenceTarget,
      ok: false,
      skipped: true,
      exitCode: null,
      summary: {
        reason: 'Required environment for admin login check is missing.',
        missingEnv: missingEnv.map((group) => ({
          id: group.id,
          acceptedNames: group.acceptedNames,
        })),
      },
    }
  }

  const result = spawnSync(check.command[0], check.command.slice(1), {
    cwd: rootDir,
    encoding: 'utf8',
    env: commandEnv,
    shell: false,
  })

  const stdout = result.stdout.trim()
  const stderr = result.stderr.trim()
  const output = [stdout, stderr].filter(Boolean).join('\n')

  return {
    id: check.id,
    label: check.label,
    command: check.command.join(' '),
    evidenceTarget: check.evidenceTarget,
    ok: result.status === 0,
    exitCode: result.status,
    summary: summarizeOutput(output),
  }
}

function summarizeOutput(output) {
  if (!output) return ''

  const parsed = parseJsonFromOutput(output)
  if (parsed) return parsed

  return output
    .split('\n')
    .filter(Boolean)
    .slice(-8)
    .join('\n')
}

function parseJsonFromOutput(output) {
  const jsonStart = output.indexOf('{')
  if (jsonStart === -1) return null

  try {
    const parsed = JSON.parse(output.slice(jsonStart))
    if (parsed.profile) {
      return {
        ok: parsed.ok,
        profile: parsed.profile,
        tableCount: Array.isArray(parsed.tables) ? parsed.tables.length : 0,
      }
    }
    return parsed
  } catch {
    return null
  }
}

const results = checks.map(runCheck)
const blockers = results
  .filter((result) => !result.ok)
  .map((result) => ({
    id: result.id,
    command: result.command,
    evidenceTarget: result.evidenceTarget,
    summary: result.summary,
  }))

const output = {
  ok: blockers.length === 0,
  purpose: 'Prepare admin parity Block 1 evidence: Zugang Und Baseline.',
  checkedEnvSources: {
    shell: true,
    envLocal: fs.existsSync(path.join(rootDir, '.env.local')),
  },
  requiredEnv: envStatus,
  nextManualEvidence: [
    'Screenshot Admin-Dashboard with signed-in admin user.',
    'Screenshot or exported list of current admin_audit_logs before test start.',
    'Runbook rows 1 and 23 updated with concrete evidence.',
  ],
  counts: {
    checks: results.length,
    passed: results.filter((result) => result.ok).length,
    blockers: blockers.length,
  },
  results,
  blockers,
}

const serialized = JSON.stringify(output, null, 2)

if (output.ok) {
  console.log(serialized)
} else {
  console.error(serialized)
  process.exit(1)
}
