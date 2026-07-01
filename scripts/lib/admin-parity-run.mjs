import fs from 'node:fs'
import path from 'node:path'

export function findLatestAdminParityRun(rootDir) {
  const runsDir = path.join(rootDir, 'docs/qa/admin-parity')
  if (!fs.existsSync(runsDir)) return null

  const runs = fs
    .readdirSync(runsDir)
    .filter((file) => /^\d{4}-\d{2}-\d{2}-admin-parity-run\.md$/.test(file))
    .sort()

  return runs.at(-1) ? `docs/qa/admin-parity/${runs.at(-1)}` : null
}

export function normalizeResult(result) {
  return result
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function extractAdminParityResult(body) {
  const match = body.match(/^Ergebnis:\s*(.+)$/im)
  return match?.[1]?.trim() || 'Missing'
}

export function countUncheckedItems(body) {
  return [...body.matchAll(/- \[ \]/g)].length
}

export function parseAutomaticGateRows(body) {
  return [...body.matchAll(/^- \[( |x|X)\]\s+(.+)$/gm)]
    .map((match) => ({
      checked: match[1].toLowerCase() === 'x',
      command: match[2].trim(),
    }))
}

export function parseManualRows(body) {
  return [...body.matchAll(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|$/gm)]
    .map((match) => ({
      number: Number(match[1]),
      flow: match[2].trim(),
      result: match[3].trim(),
      evidence: match[4].trim(),
    }))
    .filter((row) => Number.isInteger(row.number))
}

export function evidenceIsFilled(value) {
  const normalized = value.trim()
  return normalized.length > 0 && !/^[-–—]*$/.test(normalized)
}

export function sectionHasEvidence(body, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = body.match(new RegExp(`^${escapedHeading}:\\n([\\s\\S]*?)(?=\\n\\n[A-ZÄÖÜa-zäöü].*?:|\\n## |$)`, 'm'))
  if (!match) return false

  return match[1]
    .split('\n')
    .map((line) => line.replace(/^-\s*/, '').trim())
    .some(evidenceIsFilled)
}

export function validateAdminParityRun(body) {
  const issues = []
  const result = extractAdminParityResult(body)
  const normalizedResult = normalizeResult(result)
  const manualRows = parseManualRows(body)
  const uncheckedItems = countUncheckedItems(body)
  const openManualRows = manualRows.filter((row) => normalizeResult(row.result) === 'offen')
  const missingEvidenceRows = manualRows.filter((row) => {
    const rowResult = normalizeResult(row.result)
    const resultAllowsNoEvidence = ['nicht relevant', 'ersetzt'].includes(rowResult)
    return !resultAllowsNoEvidence && !evidenceIsFilled(row.evidence)
  })
  const resultAllowsControlledLeads = ['gelb', 'grun'].includes(normalizedResult)
  const resultAllowsPaidGuests = normalizedResult === 'grun'

  if (!['gelb', 'grun', 'rot'].includes(normalizedResult)) {
    issues.push({
      id: 'result:invalid',
      message: 'Ergebnis muss Gelb, Grün/Gruen oder Rot sein.',
      evidence: result,
    })
  }

  if (uncheckedItems > 0) {
    issues.push({
      id: 'automatic-gates:unchecked',
      message: 'Automatische Gates sind noch nicht vollständig abgehakt.',
      evidence: { uncheckedItems },
    })
  }

  if (manualRows.length !== 24) {
    issues.push({
      id: 'manual-gates:count',
      message: 'Es müssen genau 24 manuelle Gates dokumentiert sein.',
      evidence: { manualRows: manualRows.length },
    })
  }

  if (openManualRows.length > 0) {
    issues.push({
      id: 'manual-gates:open',
      message: 'Manuelle Gates stehen noch auf Offen.',
      evidence: openManualRows.map((row) => ({ number: row.number, flow: row.flow })),
    })
  }

  if (missingEvidenceRows.length > 0) {
    issues.push({
      id: 'manual-gates:evidence-missing',
      message: 'Manuelle Gates brauchen Evidenz direkt in der Tabelle.',
      evidence: missingEvidenceRows.map((row) => ({ number: row.number, flow: row.flow })),
    })
  }

  for (const heading of [
    'Screenshots',
    'Supabase-Datensätze',
    'E-Mail-/Communication-Events',
    'Audit-Log-Einträge',
  ]) {
    if (!sectionHasEvidence(body, heading)) {
      issues.push({
        id: `evidence-section:${heading}`,
        message: `${heading} muss mindestens einen konkreten Eintrag enthalten.`,
      })
    }
  }

  return {
    valid: issues.length === 0,
    result,
    normalizedResult,
    resultAllowsControlledLeads,
    resultAllowsPaidGuests,
    manualRows: manualRows.length,
    uncheckedItems,
    openManualRows: openManualRows.length,
    missingEvidenceRows: missingEvidenceRows.length,
    issues,
  }
}
