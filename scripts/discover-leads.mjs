import fs from 'node:fs/promises'

const queries = [
  {
    segment: 'Ferienimmobilien',
    query: '"Sankt Peter-Ording" "Ferienwohnung vermieten" "Eigentümer"',
  },
  {
    segment: 'Ferienimmobilien',
    query: '"Eiderstedt" "Ferienhausverwaltung"',
  },
  {
    segment: 'Erlebnisanbieter',
    query: '"Sankt Peter-Ording" "Kiteschule"',
  },
  {
    segment: 'Erlebnisanbieter',
    query: '"Sankt Peter-Ording" "Wattwanderung"',
  },
  {
    segment: 'Erlebnisanbieter',
    query: '"Sankt Peter-Ording" "Reiten am Meer"',
  },
]

const output = {
  created_at: new Date().toISOString(),
  note:
    'Discovery-Liste fuer manuelle Recherche. Ergebnisse erst nach Quellenpruefung in partner_leads uebernehmen.',
  queries,
}

await fs.mkdir(new URL('../data/raw', import.meta.url), { recursive: true })
await fs.writeFile(
  new URL('../data/raw/discovery-queries.json', import.meta.url),
  JSON.stringify(output, null, 2),
)

console.log(`Wrote ${queries.length} discovery queries to data/raw/discovery-queries.json`)
