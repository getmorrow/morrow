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

function value(name) {
  return process.env[name] || envFile[name] || ''
}

function isPlaceholder(value) {
  const normalized = value.trim()
  if (!normalized) return true

  return [
    /^<.+>$/,
    /<[^>]+>/,
    /example\.com/i,
    /eigentuemer@example\.com/i,
    /^https:\/\/<.+>$/i,
    /^11111111-1111-4111-8111-111111111111$/i,
    /^MORROW1$/i,
    /^your_/i,
    /^todo$/i,
    /^tbd$/i,
  ].some((pattern) => pattern.test(normalized))
}

function has(name) {
  return !isPlaceholder(value(name))
}

function hasAny(names) {
  return names.some(has)
}

function labelAny(names) {
  return names.join(' or ')
}

const requiredGroups = [
  {
    id: 'website:url',
    label: 'Website base URL',
    pass: has('QA_BASE_URL') || true,
    detail: 'QA_BASE_URL is optional; defaults to https://www.getmorrow.de in docs.',
  },
  {
    id: 'supabase:url',
    label: 'Supabase public URL',
    pass: hasAny(['NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL', 'SUPABASE_URL']),
    missing: labelAny(['NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL', 'SUPABASE_URL']),
  },
  {
    id: 'supabase:anon',
    label: 'Supabase anon key',
    pass: hasAny(['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY']),
    missing: labelAny(['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY']),
  },
  {
    id: 'apps:admin-url',
    label: 'Admin app URL',
    pass: hasAny(['ADMIN_BASE_URL', 'MORROW_ADMIN_APP_URL']),
    missing: labelAny(['ADMIN_BASE_URL', 'MORROW_ADMIN_APP_URL']),
  },
  {
    id: 'apps:guest-url',
    label: 'Guest app URL',
    pass: hasAny(['GUEST_BASE_URL', 'MORROW_GUEST_APP_URL']),
    missing: labelAny(['GUEST_BASE_URL', 'MORROW_GUEST_APP_URL']),
  },
  {
    id: 'apps:owner-url',
    label: 'Owner app URL',
    pass: hasAny(['OWNER_BASE_URL', 'MORROW_OWNER_APP_URL']),
    missing: labelAny(['OWNER_BASE_URL', 'MORROW_OWNER_APP_URL']),
  },
  {
    id: 'admin:credentials',
    label: 'Admin test login',
    pass: has('ADMIN_EMAIL') && has('ADMIN_PASSWORD'),
    missing: 'ADMIN_EMAIL and ADMIN_PASSWORD',
  },
  {
    id: 'guest:test-stay',
    label: 'Guest test booking',
    pass: has('GUEST_BOOKING_ID') && has('GUEST_ACCESS_CODE'),
    missing: 'GUEST_BOOKING_ID and GUEST_ACCESS_CODE',
  },
  {
    id: 'owner:credentials',
    label: 'Owner test login',
    pass: has('OWNER_EMAIL') && has('OWNER_PASSWORD'),
    missing: 'OWNER_EMAIL and OWNER_PASSWORD',
  },
]

const warnings = []
if (!has('SUPABASE_SERVICE_ROLE_KEY')) {
  warnings.push({
    id: 'supabase:service-role',
    message: 'SUPABASE_SERVICE_ROLE_KEY is missing; live DB verification and test-data cleanup may need manual Supabase checks.',
  })
}
if (!has('QA_TESTER')) {
  warnings.push({
    id: 'qa:tester',
    message: 'QA_TESTER is not set; generated protocols can still be edited manually.',
  })
}
if (!has('QA_ENVIRONMENT')) {
  warnings.push({
    id: 'qa:environment',
    message: 'QA_ENVIRONMENT is not set; generated protocols can still be edited manually.',
  })
}

const missing = requiredGroups.filter((group) => !group.pass)

const result = {
  ok: missing.length === 0,
  checkedEnvSources: {
    shell: true,
    envLocal: fs.existsSync(path.join(rootDir, '.env.local')),
  },
  required: requiredGroups.map((group) => ({
    id: group.id,
    label: group.label,
    ok: group.pass,
    missing: group.pass ? undefined : group.missing,
    detail: group.detail,
  })),
  warnings,
}

const output = JSON.stringify(result, null, 2)

if (result.ok) {
  console.log(output)
} else {
  console.error(output)
  process.exit(1)
}
