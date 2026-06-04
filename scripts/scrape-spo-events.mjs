import { mkdir, writeFile } from 'node:fs/promises'

const sourceUrl = 'https://www.st-peter-ording.de/veranstaltungskalender/veranstaltungen'
const desklineBaseUrl = 'https://webapi.deskline.net'
const dataset = 'stpoeiderstedt'
const language = 'de'
const pageSize = 24
const scrapedAt = new Date().toISOString()

const desklineHeaders = {
  accept: 'application/json',
  'content-type': 'application/json',
  'dw-source': 'desklineweb',
  'dw-sessionid': `Z${Date.now()}`,
  referer: 'https://www.st-peter-ording.de/',
  'user-agent': 'Morrow local event research crawler; manual curation',
}

function cleanHtml(value = '') {
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&auml;/g, 'ä')
    .replace(/&ouml;/g, 'ö')
    .replace(/&uuml;/g, 'ü')
    .replace(/&Auml;/g, 'Ä')
    .replace(/&Ouml;/g, 'Ö')
    .replace(/&Uuml;/g, 'Ü')
    .replace(/&szlig;/g, 'ß')
    .replace(/\s+/g, ' ')
    .trim()
}

function absoluteUrl(value) {
  if (!value) return ''
  if (value.startsWith('//')) return `https:${value}`
  if (value.startsWith('http')) return value
  return new URL(value, sourceUrl).toString()
}

function dateLabel(event) {
  const start = event.date ? new Date(event.date) : null
  if (!start || Number.isNaN(start.getTime())) return ''

  const date = new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(start)
  const time = event.dateStartTimes?.[0] ?? event.startTimeDurations?.[0]?.time
  return time ? `${date}, ${time} Uhr` : date
}

function eventDescription(event) {
  const plain = event.plainDescriptions?.find((item) => item.description)?.description
  const html = event.descriptions?.find((item) => item.description)?.description
  return cleanHtml(plain || html || '')
}

function eventImage(event) {
  const firstImage = event.images?.[0]
  const imageUrl = firstImage?.urls?.[0]
  return {
    imageUrl: absoluteUrl(imageUrl),
    imageAlt: cleanHtml(firstImage?.description || firstImage?.name || event.name),
  }
}

function eventDetailUrl(event) {
  if (!event.dbCode || !event.id) return sourceUrl
  return `${sourceUrl}/${event.dbCode}/${event.id}`
}

function toRawCandidate(event) {
  const { imageUrl, imageAlt } = eventImage(event)
  const coordinate = event.location?.coordinate

  return {
    id: event.id,
    title: cleanHtml(event.name),
    date: event.date,
    dateLabel: dateLabel(event),
    hasMoreDates: Boolean(event.hasMoreDates),
    place: cleanHtml(event.location?.place || event.location?.town || ''),
    town: cleanHtml(event.location?.town || ''),
    groups: event.eventGroups?.map((group) => cleanHtml(group.name)).filter(Boolean) ?? [],
    themes: event.holidayThemes?.map((theme) => cleanHtml(theme.name)).filter(Boolean) ?? [],
    description: eventDescription(event),
    detailUrl: eventDetailUrl(event),
    imageUrl,
    imageAlt,
    lat: typeof coordinate?.lat === 'number' ? coordinate.lat : undefined,
    lng: typeof coordinate?.long === 'number' ? coordinate.long : undefined,
    source: 'deskline-api',
    sourceUrl,
    status: 'candidate',
    lastScrapedAt: scrapedAt,
  }
}

async function createDesklineFilter() {
  const response = await fetch(`${desklineBaseUrl}/filters`, {
    method: 'POST',
    headers: desklineHeaders,
    body: JSON.stringify({
      filterObject: {
        id: '00000000-0000-0000-0000-000000000000',
        _hashCode: 0,
        filterGeneral: {},
        filterAddServices: { name: '' },
        filterAccommodation: {
          name: '',
          bestPrice: false,
          specialPrice: false,
          specialOffer: false,
        },
        filterEvent: {},
        filterInfrastructure: {},
        filterBrochure: {},
        filterPackage: {},
        filterTour: {},
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Could not create Deskline filter: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function scrapeDesklineEvents() {
  const filter = await createDesklineFilter()
  const fields = [
    'id',
    'name',
    'dbCode',
    'date',
    'hasMoreDates',
    'location{place,town,coordinate{name,long,lat}}',
    'plainDescriptions(len:180){description,type}',
    'descriptions(types:[32,33]){description,type}',
    'dateStartTimes',
    'eventGroups{id,name}',
    'holidayThemes{id,name,order}',
    'images(count:1,sizes:[54]){urls,description,name}',
    'urlFriendlyName',
    'startTimeDurations{time,weekDays,duration}',
  ].join(',')
  const candidatesByKey = new Map()
  let expectedPageCount = 1

  for (let pageNo = 0; pageNo < expectedPageCount + 3; pageNo += 1) {
    const url = new URL(`${desklineBaseUrl}/${dataset}/${language}/events`)
    url.searchParams.set('filterId', filter.id)
    url.searchParams.set('fields', fields)
    url.searchParams.set('sortingFields', 'date,-topEvent,time')
    url.searchParams.set('pageNo', String(pageNo))
    url.searchParams.set('pageSize', String(pageSize))
    url.searchParams.set('hashF', '0')

    const response = await fetch(url, { headers: desklineHeaders })
    if (!response.ok) {
      throw new Error(`Could not fetch Deskline events page ${pageNo}: ${response.status} ${response.statusText}`)
    }

    const json = await response.json()
    expectedPageCount = Math.max(expectedPageCount, json.paging?.pageCount ?? 1)
    const events = Array.isArray(json.data) ? json.data : []
    if (events.length === 0) break

    events.map(toRawCandidate).forEach((candidate) => {
      if (!candidate.id || !candidate.title) return
      candidatesByKey.set(`${candidate.id}:${candidate.date ?? ''}`, candidate)
    })
  }

  return [...candidatesByKey.values()].sort((left, right) => String(left.date).localeCompare(String(right.date)))
}

async function scrapeStaticHighlights() {
  const response = await fetch(sourceUrl, {
    headers: {
      'user-agent': 'Morrow local event research crawler; manual curation',
    },
  })

  if (!response.ok) return []

  const html = await response.text()
  return [...html.matchAll(/<div class="tx-bookingemo-section-slide[\s\S]*?<a href="([^"]+)"[\s\S]*?<img src="([^"]+)" alt="([^"]*)"[\s\S]*?<div class="tx-bookingemo-section-slide-inner-date[^"]*">([\s\S]*?)<\/div>[\s\S]*?<div class="tx-bookingemo-section-slide-name">([\s\S]*?)<\/div>[\s\S]*?<div class="tx-bookingemo-section-slide-place">([\s\S]*?)<\/div>/g)]
    .map((match) => ({
      id: match[1].split('/').pop(),
      title: cleanHtml(match[5]),
      dateLabel: cleanHtml(match[4]),
      place: cleanHtml(match[6]),
      detailUrl: absoluteUrl(match[1]),
      imageUrl: absoluteUrl(match[2]),
      imageAlt: cleanHtml(match[3]),
      source: 'static-highlight',
      sourceUrl,
      status: 'candidate',
      lastScrapedAt: scrapedAt,
    }))
    .filter((event) => event.title && event.detailUrl)
}

let eventCandidates = []
try {
  eventCandidates = await scrapeDesklineEvents()
} catch (error) {
  console.warn(`Deskline API scrape failed, falling back to static highlights: ${error.message}`)
  eventCandidates = await scrapeStaticHighlights()
}

await mkdir('data/raw', { recursive: true })
await mkdir('public/data', { recursive: true })
await writeFile('data/raw/spo-events.json', `${JSON.stringify(eventCandidates, null, 2)}\n`)
await writeFile('public/data/spo-events.json', `${JSON.stringify(eventCandidates, null, 2)}\n`)

console.log(`Wrote ${eventCandidates.length} event candidates to data/raw/spo-events.json and public/data/spo-events.json`)
