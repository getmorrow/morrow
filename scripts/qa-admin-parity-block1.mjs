import { spawnSync } from 'node:child_process'

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
  const result = spawnSync(check.command[0], check.command.slice(1), {
    cwd: process.cwd(),
    encoding: 'utf8',
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
