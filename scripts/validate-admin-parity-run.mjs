import fs from 'node:fs'
import path from 'node:path'
import {
  findLatestAdminParityRun,
  validateAdminParityRun,
} from './lib/admin-parity-run.mjs'

const rootDir = process.cwd()
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
const validation = validateAdminParityRun(body)
const output = {
  ok: validation.valid,
  file: path.relative(rootDir, fullPath),
  validation,
}

if (validation.valid) {
  console.log(JSON.stringify(output, null, 2))
} else {
  console.error(JSON.stringify(output, null, 2))
  process.exit(1)
}
