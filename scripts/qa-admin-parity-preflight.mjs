import { createQaEnv } from './lib/qa-env.mjs'

const rootDir = process.cwd()
const qaEnv = createQaEnv(rootDir)

function has(name) {
  return qaEnv.has(name)
}

function hasAny(names) {
  return names.some(has)
}

function labelAny(names) {
  return names.join(' or ')
}

function firstUsableValue(names) {
  return qaEnv.firstUsableValue(names)
}

function normalizeBaseUrl(url) {
  return url.trim().replace(/\/$/, '')
}

async function checkAppHealth(names, expectedApp) {
  const rawUrl = firstUsableValue(names)

  if (!rawUrl) {
    return {
      pass: false,
      missing: labelAny(names),
    }
  }

  const baseUrl = normalizeBaseUrl(rawUrl)

  try {
    const response = await fetch(`${baseUrl}/health`, {
      headers: { accept: 'application/json' },
    })

    if (!response.ok) {
      return {
        pass: false,
        missing: `${labelAny(names)} with /health returning app=${expectedApp}`,
        detail: `${baseUrl}/health returned HTTP ${response.status}`,
      }
    }

    const body = await response.json()
    if (body?.app !== expectedApp || body?.status !== 'ok') {
      return {
        pass: false,
        missing: `${labelAny(names)} with /health returning app=${expectedApp}`,
        detail: `${baseUrl}/health returned app=${body?.app ?? 'missing'} status=${body?.status ?? 'missing'}`,
      }
    }

    return {
      pass: true,
      detail: `${baseUrl}/health returned app=${body.app} status=${body.status}`,
    }
  } catch (error) {
    return {
      pass: false,
      missing: `${labelAny(names)} with reachable /health`,
      detail: `${baseUrl}/health failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

const adminApp = await checkAppHealth(['ADMIN_BASE_URL', 'MORROW_ADMIN_APP_URL'], 'admin')
const guestApp = await checkAppHealth(['GUEST_BASE_URL', 'MORROW_GUEST_APP_URL'], 'guest')
const ownerApp = await checkAppHealth(['OWNER_BASE_URL', 'MORROW_OWNER_APP_URL'], 'owner')

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
    pass: adminApp.pass,
    missing: adminApp.missing,
    detail: adminApp.detail,
  },
  {
    id: 'apps:guest-url',
    label: 'Guest app URL',
    pass: guestApp.pass,
    missing: guestApp.missing,
    detail: guestApp.detail,
  },
  {
    id: 'apps:owner-url',
    label: 'Owner app URL',
    pass: ownerApp.pass,
    missing: ownerApp.missing,
    detail: ownerApp.detail,
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
    envLocal: qaEnv.envLocalExists,
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
