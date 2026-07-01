import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()

const apps = [
  {
    key: 'web',
    name: 'Website',
    packageName: '@morrow/web',
    vercelConfig: 'apps/web/vercel.json',
    healthRoute: 'apps/web/app/health/route.ts',
  },
  {
    key: 'admin',
    name: 'Admin-App',
    packageName: '@morrow/admin',
    vercelConfig: 'apps/admin/vercel.json',
    healthRoute: 'apps/admin/app/health/route.ts',
  },
  {
    key: 'guest',
    name: 'Gaeste-App',
    packageName: '@morrow/guest',
    vercelConfig: 'apps/guest/vercel.json',
    healthRoute: 'apps/guest/app/health/route.ts',
  },
  {
    key: 'owner',
    name: 'Owner-App',
    packageName: '@morrow/owner',
    vercelConfig: 'apps/owner/vercel.json',
    healthRoute: 'apps/owner/app/health/route.ts',
  },
]

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8')
}

function exists(relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath))
}

const blockers = []
const passed = []

for (const app of apps) {
  if (!exists(app.vercelConfig)) {
    blockers.push({
      id: `${app.key}:vercel-config-missing`,
      message: `${app.name} has no ${app.vercelConfig}.`,
    })
  } else {
    const config = JSON.parse(read(app.vercelConfig))
    const expectedBuildCommand = `cd ../.. && npm run -w ${app.packageName} build`

    if (config.framework !== 'nextjs') {
      blockers.push({
        id: `${app.key}:framework`,
        message: `${app.name} Vercel framework must be nextjs.`,
        evidence: config.framework,
      })
    } else {
      passed.push({ id: `${app.key}:framework`, message: `${app.name} uses Next.js preset.` })
    }

    if (config.installCommand !== 'cd ../.. && npm install') {
      blockers.push({
        id: `${app.key}:install-command`,
        message: `${app.name} installCommand must install from monorepo root.`,
        evidence: config.installCommand,
      })
    } else {
      passed.push({ id: `${app.key}:install-command`, message: `${app.name} install command is monorepo-safe.` })
    }

    if (config.buildCommand !== expectedBuildCommand) {
      blockers.push({
        id: `${app.key}:build-command`,
        message: `${app.name} buildCommand does not target ${app.packageName}.`,
        evidence: config.buildCommand,
      })
    } else {
      passed.push({ id: `${app.key}:build-command`, message: `${app.name} build command targets ${app.packageName}.` })
    }
  }

  if (!exists(app.healthRoute)) {
    blockers.push({
      id: `${app.key}:health-route-missing`,
      message: `${app.name} has no ${app.healthRoute}.`,
    })
  } else {
    const body = read(app.healthRoute)
    const appPattern = new RegExp(`app:\\s*["']${app.key}["']`)
    const statusPattern = /status:\s*["']ok["']/

    if (!appPattern.test(body) || !statusPattern.test(body)) {
      blockers.push({
        id: `${app.key}:health-route-body`,
        message: `${app.name} health route must return app=${app.key} and status=ok.`,
      })
    } else {
      passed.push({ id: `${app.key}:health-route`, message: `${app.name} health route identifies app=${app.key}.` })
    }
  }
}

const result = {
  ok: blockers.length === 0,
  checkedApps: apps.map((app) => app.key),
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
