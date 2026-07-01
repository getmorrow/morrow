import fs from 'node:fs'
import path from 'node:path'

export function parseEnvFile(rootDir, relativePath = '.env.local') {
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

export function createQaEnv(rootDir) {
  const envFile = parseEnvFile(rootDir)
  const values = {
    ...envFile,
    ...process.env,
  }

  return {
    envLocalExists: fs.existsSync(path.join(rootDir, '.env.local')),
    values,
    value(name) {
      return values[name] || ''
    },
    has(name) {
      return !isPlaceholder(values[name] || '')
    },
    hasAny(names) {
      return names.some((name) => !isPlaceholder(values[name] || ''))
    },
    firstUsableValue(names) {
      const found = names.find((name) => !isPlaceholder(values[name] || ''))
      return found ? values[found] || '' : ''
    },
  }
}

export function isPlaceholder(value) {
  const normalized = String(value ?? '').trim()
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
