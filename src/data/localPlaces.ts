import type { ExperienceItem, MorrowPackage } from '../data'

export type LocalPlaceCategory = 'all' | 'beach' | 'food' | 'experience' | 'event' | 'weather' | 'shopping' | 'emergency' | 'service' | 'tide'

export type LocalPlaceStatus = 'candidate' | 'approved' | 'paused' | 'rejected'
export type LocalExperienceAudience = 'families' | 'couples' | 'adults' | 'kids'
export type LocalExperiencePackageFit = 'family_escape' | 'couple_reset'
export type LocalExperienceSetting = 'indoor' | 'outdoor' | 'both'
export type LocalExperienceIntensity = 'quiet' | 'active' | 'weather_dependent'
export type LocalExperienceAccess = 'free-local' | 'bookable' | 'included' | 'recommendation'
export type LocalEventAudience = 'families' | 'couples' | 'both'
export type LocalEventSetting = 'indoor' | 'outdoor' | 'both'
export type LocalFoodPriceLevel = 'moderate' | 'elevated' | 'premium'
export type LocalFoodReservationType = 'recommended' | 'direct' | 'call' | 'walk-in'

export type LocalPlaceCandidate = {
  id: string
  category: Exclude<LocalPlaceCategory, 'all'>
  label: string
  title: string
  description: string
  meta: string
  address?: string
  phone?: string
  email?: string
  websiteUrl?: string
  reservationUrl?: string
  photoUrls?: string[]
  openingHours?: string
  openingHoursSource?: string
  openingHoursCheckedAt?: string
  cuisine?: string
  menuUrl?: string
  menuNote?: string
  priceLevel?: LocalFoodPriceLevel
  bestFor?: string[]
  morrowNote?: string
  reservationType?: LocalFoodReservationType
  ratingValue?: number
  ratingCount?: number
  ratingSource?: string
  ratingSourceUrl?: string
  ratingCheckedAt?: string
  eventStartDate?: string
  eventEndDate?: string
  eventTime?: string
  eventAudience?: LocalEventAudience
  eventSetting?: LocalEventSetting
  eventFitNote?: string
  audiences?: LocalExperienceAudience[]
  ageMin?: number
  ageNote?: string
  packageFit?: LocalExperiencePackageFit[]
  setting?: LocalExperienceSetting
  intensity?: LocalExperienceIntensity
  experienceAccess?: LocalExperienceAccess
  weatherDependent?: boolean
  routeNote: string
  status: LocalPlaceStatus
  sourceUrl?: string
  lat?: number
  lng?: number
}

export type LocalPlace = {
  id: string
  category: LocalPlaceCategory
  label: string
  title: string
  description: string
  meta: string
  address?: string
  phone?: string
  websiteUrl?: string
  reservationUrl?: string
  photoUrls?: string[]
  openingHours?: string
  openingHoursSource?: string
  openingHoursCheckedAt?: string
  cuisine?: string
  menuUrl?: string
  menuNote?: string
  priceLevel?: LocalFoodPriceLevel
  bestFor?: string[]
  morrowNote?: string
  reservationType?: LocalFoodReservationType
  ratingValue?: number
  ratingCount?: number
  ratingSource?: string
  ratingSourceUrl?: string
  ratingCheckedAt?: string
  eventStartDate?: string
  eventEndDate?: string
  eventTime?: string
  eventAudience?: LocalEventAudience
  eventSetting?: LocalEventSetting
  eventFitNote?: string
  experienceAccess?: LocalExperienceAccess
  audiences?: LocalExperienceAudience[]
  ageMin?: number
  ageNote?: string
  setting?: LocalExperienceSetting
  intensity?: LocalExperienceIntensity
  weatherDependent?: boolean
  routeNote: string
  lat: number
  lng: number
}

export const localPlaceCategoryLabels: Record<LocalPlaceCategory, string> = {
  all: 'Alle',
  beach: 'Strand',
  food: 'Essen',
  experience: 'Erlebnis',
  event: 'Veranstaltungen',
  weather: 'Wetter',
  shopping: 'Einkauf',
  emergency: 'Hilfe',
  service: 'Service',
  tide: 'Gezeiten',
}

export const localEventAudienceLabels: Record<LocalEventAudience, string> = {
  families: 'Familien',
  couples: 'Paare',
  both: 'Beide',
}

export const localEventSettingLabels: Record<LocalEventSetting, string> = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  both: 'Indoor & Outdoor',
}

export const localExperienceAudienceLabels: Record<LocalExperienceAudience, string> = {
  families: 'Familien',
  couples: 'Paare',
  adults: 'Erwachsene',
  kids: 'Kinder',
}

export const localExperiencePackageFitLabels: Record<LocalExperiencePackageFit, string> = {
  family_escape: 'Family Escape',
  couple_reset: 'Couple Reset',
}

export const localExperienceSettingLabels: Record<LocalExperienceSetting, string> = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  both: 'Indoor & Outdoor',
}

export const localExperienceIntensityLabels: Record<LocalExperienceIntensity, string> = {
  quiet: 'Ruhig',
  active: 'Aktiv',
  weather_dependent: 'Wetterabhängig',
}

export const localExperienceAccessLabels: Record<LocalExperienceAccess, string> = {
  'free-local': 'Kostenfrei vor Ort',
  bookable: 'Optional buchbar',
  included: 'Enthalten',
  recommendation: 'Kuratierte Empfehlung',
}

export const localFoodPriceLevelLabels: Record<LocalFoodPriceLevel, string> = {
  moderate: 'entspannt',
  elevated: 'gehoben',
  premium: 'besonders',
}

export const localFoodReservationTypeLabels: Record<LocalFoodReservationType, string> = {
  recommended: 'Reservierung empfohlen',
  direct: 'Direkt reservieren',
  call: 'Anrufen sinnvoll',
  'walk-in': 'Spontan möglich',
}

const localPlaceCategoryValues = ['beach', 'food', 'experience', 'event', 'weather', 'shopping', 'emergency', 'service', 'tide'] satisfies Array<Exclude<LocalPlaceCategory, 'all'>>
const localPlaceStatusValues = ['candidate', 'approved', 'paused'] satisfies LocalPlaceStatus[]
const localExperienceAudienceValues = ['families', 'couples', 'adults', 'kids'] satisfies LocalExperienceAudience[]
const localExperiencePackageFitValues = ['family_escape', 'couple_reset'] satisfies LocalExperiencePackageFit[]
const localExperienceSettingValues = ['indoor', 'outdoor', 'both'] satisfies LocalExperienceSetting[]
const localExperienceIntensityValues = ['quiet', 'active', 'weather_dependent'] satisfies LocalExperienceIntensity[]
const localExperienceAccessValues = ['free-local', 'bookable', 'included', 'recommendation'] satisfies LocalExperienceAccess[]
const localEventAudienceValues = ['families', 'couples', 'both'] satisfies LocalEventAudience[]
const localEventSettingValues = ['indoor', 'outdoor', 'both'] satisfies LocalEventSetting[]
const localFoodPriceLevelValues = ['moderate', 'elevated', 'premium'] satisfies LocalFoodPriceLevel[]
const localFoodReservationTypeValues = ['recommended', 'direct', 'call', 'walk-in'] satisfies LocalFoodReservationType[]

function parseOptionalNumber(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value !== 'string' || !value.trim()) return undefined
  const parsed = Number.parseFloat(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : undefined
}

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function nonEmptyStringValue(value: unknown, fallback = '') {
  if (typeof value !== 'string') return fallback
  return value.trim() ? value : fallback
}

function stringArrayValue(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean)
  if (typeof value === 'string') return value.split('\n').map((item) => item.trim()).filter(Boolean)
  return undefined
}

function enumArrayValue<Value extends string>(value: unknown, allowedValues: readonly Value[]) {
  if (!Array.isArray(value)) return undefined
  return value.filter((item): item is Value => allowedValues.includes(item as Value))
}

function enumValue<Value extends string>(value: unknown, allowedValues: readonly Value[], fallback?: Value) {
  return allowedValues.includes(value as Value) ? value as Value : fallback
}

function normalizeLocalPlaceCandidate(rawPlace: Partial<LocalPlaceCandidate>, fallback?: LocalPlaceCandidate): LocalPlaceCandidate {
  const category = enumValue(rawPlace.category, localPlaceCategoryValues, fallback?.category) ?? 'food'
  const status = enumValue(rawPlace.status, localPlaceStatusValues, fallback?.status) ?? 'candidate'

  return {
    id: stringValue(rawPlace.id, fallback?.id ?? 'local-place'),
    category,
    label: stringValue(rawPlace.label, fallback?.label ?? localPlaceCategoryLabels[category]),
    title: stringValue(rawPlace.title, fallback?.title ?? 'Lokaler Ort'),
    description: stringValue(rawPlace.description, fallback?.description ?? 'Dieser Ort wird noch geprüft.'),
    meta: stringValue(rawPlace.meta, fallback?.meta ?? 'Kandidat'),
    address: stringValue(rawPlace.address, fallback?.address),
    phone: stringValue(rawPlace.phone, fallback?.phone),
    email: stringValue(rawPlace.email, fallback?.email),
    websiteUrl: stringValue(rawPlace.websiteUrl, fallback?.websiteUrl),
    reservationUrl: stringValue(rawPlace.reservationUrl, fallback?.reservationUrl),
    photoUrls: stringArrayValue(rawPlace.photoUrls) ?? fallback?.photoUrls,
    openingHours: stringValue(rawPlace.openingHours, fallback?.openingHours),
    openingHoursSource: nonEmptyStringValue(rawPlace.openingHoursSource, fallback?.openingHoursSource),
    openingHoursCheckedAt: nonEmptyStringValue(rawPlace.openingHoursCheckedAt, fallback?.openingHoursCheckedAt),
    cuisine: nonEmptyStringValue(rawPlace.cuisine, fallback?.cuisine),
    menuUrl: nonEmptyStringValue(rawPlace.menuUrl, fallback?.menuUrl),
    menuNote: nonEmptyStringValue(rawPlace.menuNote, fallback?.menuNote),
    priceLevel: enumValue(rawPlace.priceLevel, localFoodPriceLevelValues, fallback?.priceLevel),
    bestFor: stringArrayValue(rawPlace.bestFor) ?? fallback?.bestFor,
    morrowNote: stringValue(rawPlace.morrowNote, fallback?.morrowNote),
    reservationType: enumValue(rawPlace.reservationType, localFoodReservationTypeValues, fallback?.reservationType),
    ratingValue: parseOptionalNumber(rawPlace.ratingValue) ?? fallback?.ratingValue,
    ratingCount: parseOptionalNumber(rawPlace.ratingCount) ?? fallback?.ratingCount,
    ratingSource: nonEmptyStringValue(rawPlace.ratingSource, fallback?.ratingSource),
    ratingSourceUrl: nonEmptyStringValue(rawPlace.ratingSourceUrl, fallback?.ratingSourceUrl),
    ratingCheckedAt: nonEmptyStringValue(rawPlace.ratingCheckedAt, fallback?.ratingCheckedAt),
    eventStartDate: stringValue(rawPlace.eventStartDate, fallback?.eventStartDate),
    eventEndDate: stringValue(rawPlace.eventEndDate, fallback?.eventEndDate),
    eventTime: stringValue(rawPlace.eventTime, fallback?.eventTime),
    eventAudience: enumValue(rawPlace.eventAudience, localEventAudienceValues, fallback?.eventAudience),
    eventSetting: enumValue(rawPlace.eventSetting, localEventSettingValues, fallback?.eventSetting),
    eventFitNote: stringValue(rawPlace.eventFitNote, fallback?.eventFitNote),
    audiences: enumArrayValue(rawPlace.audiences, localExperienceAudienceValues) ?? fallback?.audiences,
    ageMin: parseOptionalNumber(rawPlace.ageMin) ?? fallback?.ageMin,
    ageNote: stringValue(rawPlace.ageNote, fallback?.ageNote),
    packageFit: enumArrayValue(rawPlace.packageFit, localExperiencePackageFitValues) ?? fallback?.packageFit,
    setting: enumValue(rawPlace.setting, localExperienceSettingValues, fallback?.setting),
    intensity: enumValue(rawPlace.intensity, localExperienceIntensityValues, fallback?.intensity),
    experienceAccess: enumValue(rawPlace.experienceAccess, localExperienceAccessValues, fallback?.experienceAccess),
    weatherDependent: typeof rawPlace.weatherDependent === 'boolean' ? rawPlace.weatherDependent : fallback?.weatherDependent,
    routeNote: stringValue(rawPlace.routeNote, fallback?.routeNote ?? 'Vor Freigabe prüfen.'),
    status,
    sourceUrl: stringValue(rawPlace.sourceUrl, fallback?.sourceUrl),
    lat: parseOptionalNumber(rawPlace.lat) ?? fallback?.lat,
    lng: parseOptionalNumber(rawPlace.lng) ?? fallback?.lng,
  }
}

export const localPlaceCandidates: LocalPlaceCandidate[] = [
  {
    id: 'strand-ording',
    category: 'beach',
    label: 'Strand',
    title: 'Strandabschnitt Ording',
    description: 'Der weitläufige Strandbereich im Norden von SPO mit viel Weite, Dünengefühl und starkem Nordseecharakter.',
    meta: 'Strandabschnitt',
    address: 'Strandweg, 25826 Sankt Peter-Ording',
    websiteUrl: 'https://www.st-peter-ording.de/strand/',
    openingHours: 'Ganzjährig zugänglich, je nach Wetter, Saison und Strandkorb-/Baderegeln prüfen',
    morrowNote: 'Gut, wenn ihr echte Weite, lange Spaziergänge und einen sehr offenen Strandmoment sucht.',
    routeNote: 'Für längere Strandzeit, Spaziergänge und viel Weite einplanen. Wind, Wasserstand und Wege vor dem Losgehen prüfen.',
    status: 'approved',
    sourceUrl: 'https://www.st-peter-ording.de/strand/',
    lat: 54.3312,
    lng: 8.5912,
  },
  {
    id: 'strand-ording-nord-fkk',
    category: 'beach',
    label: 'Strand',
    title: 'Strandabschnitt Ording Nord / FKK',
    description: 'Ruhiger nördlicher Strandbereich mit viel Abstand, Naturgefühl und eher bewusstem Strandrhythmus.',
    meta: 'Strandabschnitt',
    address: 'Ording Nord, 25826 Sankt Peter-Ording',
    websiteUrl: 'https://www.st-peter-ording.de/strand/',
    openingHours: 'Ganzjährig zugänglich, saisonale Regeln und Beschilderung vor Ort beachten',
    morrowNote: 'Passt, wenn ihr einen ruhigeren, freieren Strandmoment sucht und euch vor Ort bewusst orientieren möchtet.',
    routeNote: 'Vor Ort auf Beschilderung, FKK-/Textilbereiche, Naturschutz und Wege achten. Für Familien vorher prüfen, ob der Abschnitt zum Tag passt.',
    status: 'approved',
    sourceUrl: 'https://www.st-peter-ording.de/strand/',
    lat: 54.3448,
    lng: 8.5872,
  },
  {
    id: 'strand-bad',
    category: 'beach',
    label: 'Strand',
    title: 'Strandabschnitt Bad',
    description: 'Zentraler, gut erreichbarer Strandbereich mit Seebrücke, Pfahlbauten und kurzen Wegen zu Restaurants und Infrastruktur.',
    meta: 'Strandabschnitt',
    address: 'An der Seebrücke, 25826 Sankt Peter-Ording',
    websiteUrl: 'https://www.st-peter-ording.de/strand/',
    openingHours: 'Ganzjährig zugänglich, saisonale Infrastruktur tagesaktuell prüfen',
    morrowNote: 'Sehr gut für den ersten Orientierungsmoment: leicht erreichbar, sichtbar SPO und praktisch mit Kindern oder kurzem Zeitfenster.',
    routeNote: 'Gut für den ersten Weg ans Wasser, Sonnenuntergang oder eine unkomplizierte Pause. Bei Andrang lieber Tageszeit bewusst wählen.',
    status: 'approved',
    sourceUrl: 'https://www.st-peter-ording.de/strand/',
    lat: 54.3119717,
    lng: 8.5880452,
  },
  {
    id: 'strand-dorf-suedstrand',
    category: 'beach',
    label: 'Strand',
    title: 'Strandabschnitt Dorf / Südstrand',
    description: 'Ruhigerer Strandbereich südlich von Bad, gut für entspannte Strandzeit, Spaziergänge und einen weniger vollen Start ans Wasser.',
    meta: 'Strandabschnitt',
    address: 'Badestelle Dorf, Südstrand, 25826 Sankt Peter-Ording',
    websiteUrl: 'https://www.st-peter-ording.de/strand/',
    openingHours: 'Ganzjährig zugänglich, saisonale Regeln und Wasserstand prüfen',
    morrowNote: 'Gut, wenn der Strandmoment unkompliziert, etwas ruhiger und nicht zu groß inszeniert sein soll.',
    routeNote: 'Als ruhige Alternative zu Bad einplanen. Wege, Parken und Gezeiten kurz prüfen, besonders mit Kindern.',
    status: 'approved',
    sourceUrl: 'https://www.st-peter-ording.de/strand/',
    lat: 54.2970734,
    lng: 8.619856,
  },
  {
    id: 'strand-boehl',
    category: 'beach',
    label: 'Strand',
    title: 'Strandabschnitt Böhl',
    description: 'Südlicher Strandabschnitt mit Leuchtturmnähe, viel Ruhe und einem weiten, naturverbundenen Gefühl.',
    meta: 'Strandabschnitt',
    address: 'Zum Böhler Strand, 25826 Sankt Peter-Ording',
    websiteUrl: 'https://www.st-peter-ording.de/strand/',
    openingHours: 'Ganzjährig zugänglich, saisonale Regeln und Gezeiten beachten',
    morrowNote: 'Stark für ruhige Momente, Weite und Spaziergänge, wenn ihr bewusst Abstand vom lebendigeren Zentrum sucht.',
    routeNote: 'Für einen ruhigeren Strandtag oder Abendmoment geeignet. Wind, Wasserstand und Rückweg vorab mitdenken.',
    status: 'approved',
    sourceUrl: 'https://www.st-peter-ording.de/strand/',
    lat: 54.2729055,
    lng: 8.6559819,
  },
  {
    id: 'lotti-suedstrand',
    category: 'food',
    label: 'Essen',
    title: 'LOTTI am Südstrand',
    description: 'Pfahlbau-Restaurant am Südstrand, als Kandidat für Strandtage und entspannte Abendoptionen.',
    meta: 'Restaurant-Kandidat',
    address: 'Badestelle Dorf, Südstrand, 25826 Sankt Peter-Ording',
    phone: '+49 4863 4747017',
    email: 'moin@lotti-am-suedstrand.de',
    websiteUrl: 'https://www.lotti-am-suedstrand.de',
    reservationUrl: 'https://www.opentable.de/r/lotti-am-sudstrand-sankt-peter-ording',
    photoUrls: [
      'https://lotti-am-suedstrand.de/wp-content/uploads/2024/02/Terrasse_Gaeste-660x470.jpg',
      'https://lotti-am-suedstrand.de/wp-content/uploads/2024/02/Pfahlbau_total_Salzwiese_2-660x470.jpg',
      'https://lotti-am-suedstrand.de/wp-content/uploads/2024/02/Lotti_am_Suedstrand-1000-3-660x470.jpg',
    ],
    openingHours: 'Mo-So 12:00-22:00 Uhr (tagesaktuell prüfen)',
    openingHoursSource: 'OpenTable / Restaurantprofil',
    openingHoursCheckedAt: '2026-05-21',
    cuisine: 'Norddeutsch, Fisch, regionale Klassiker',
    menuUrl: 'https://www.lotti-am-suedstrand.de/speisekarte',
    menuNote: 'Fisch, regionale Klassiker und entspannte Strandküche; die Tageskarte prüft ihr am besten direkt beim Restaurant.',
    priceLevel: 'elevated',
    bestFor: ['Strandtag', 'ruhiger Abend', 'Sonnenuntergang'],
    morrowNote: 'Gut, wenn ihr Strandnähe und einen etwas besonderen Abend verbinden möchtet.',
    reservationType: 'direct',
    ratingValue: 4.4,
    ratingCount: 203,
    ratingSource: 'OpenTable',
    ratingSourceUrl: 'https://www.opentable.de/r/lotti-am-sudstrand-sankt-peter-ording',
    ratingCheckedAt: '2026-05-21',
    routeNote: 'Für einen entspannten Abend lieber vorher reservieren und die aktuellen Öffnungszeiten kurz prüfen.',
    status: 'approved',
    sourceUrl: 'https://www.st-peter-ording.de/pfahlbau-restaurants/',
    lat: 54.2970734,
    lng: 8.619856,
  },
  {
    id: 'salt-silver-boehler-strand',
    category: 'food',
    label: 'Essen',
    title: 'Salt & Silver am Böhler Strand',
    description: 'Pfahlbau-Restaurant am Böhler Strand, als Kandidat für besondere Dinner- oder Sonnenuntergangsmomente.',
    meta: 'Restaurant-Kandidat',
    address: 'Zum Böhler Strand, 25826 Sankt Peter-Ording',
    phone: '+49 4863 476757',
    websiteUrl: 'https://saltandsilver.de/',
    reservationUrl: 'https://www.opentable.de/r/salt-and-silver-sankt-peter-ording-sankt-peter-ording',
    photoUrls: [
      'https://saltandsilver.de/wp-content/uploads/AAA03797.jpg',
      'https://saltandsilver.de/wp-content/uploads/AAA00376.jpg',
      'https://saltandsilver.de/wp-content/uploads/AAA00825.jpg',
    ],
    openingHours: 'Do-Di 10:00-22:00 Uhr, Mi geschlossen (tagesaktuell prüfen)',
    openingHoursSource: 'OpenTable / Restaurantprofil',
    openingHoursCheckedAt: '2026-05-21',
    cuisine: 'Seafood, Grill, Strandküche',
    menuUrl: 'https://saltandsilver.de/wp-content/uploads/20230624_AmMeer_Online_D-3.pdf',
    menuNote: 'Fisch, Grillgerichte, Sharing und Drinks für einen Abend, der sich etwas besonderer anfühlen darf.',
    priceLevel: 'premium',
    bestFor: ['Dinner', 'Sonnenuntergang', 'besonderer Anlass'],
    morrowNote: 'Stark für einen bewussten Abend zu zweit oder ein Essen, das sich nach Urlaub anfühlt.',
    reservationType: 'direct',
    ratingValue: 4.7,
    ratingCount: 788,
    ratingSource: 'OpenTable',
    ratingSourceUrl: 'https://www.opentable.de/r/salt-and-silver-sankt-peter-ording-sankt-peter-ording',
    ratingCheckedAt: '2026-05-21',
    routeNote: 'Für Dinner und Sonnenuntergang besser früh reservieren. Prüft kurz, ob Uhrzeit und Weg zu eurem Tagesplan passen.',
    status: 'approved',
    sourceUrl: 'https://www.st-peter-ording.de/pfahlbau-restaurants/',
    lat: 54.2729055,
    lng: 8.6559819,
  },
  {
    id: 'silbermoewe-ordinger-strand',
    category: 'food',
    label: 'Essen',
    title: 'Silbermöwe am Ordinger Strand',
    description: 'Pfahlbau-Restaurant am Ordinger Strand, als Kandidat für unkomplizierte Strandnähe.',
    meta: 'Restaurant-Kandidat',
    address: 'Ordinger Strand, 25826 Sankt Peter-Ording',
    websiteUrl: 'https://silbermoewe-spo.de/silbermwe-strandcafe',
    reservationUrl: 'https://silbermoewe-spo.de/silbermwe-strandcafe',
    photoUrls: [
      'https://images.squarespace-cdn.com/content/v1/6045fdac5914da03d995e027/1662113366031-BTRE3XX5HIFN9CMA09W9/WhatsApp+Image+2022-07-28+at+14.06.50.jpeg',
      'https://www.st-peter-ording.de/fileadmin/_processed_/f/c/csm_Strand_Ording__c__TZ_SPO4_08e75534a7.jpg',
      'https://images.squarespace-cdn.com/content/v1/6045fdac5914da03d995e027/ab874b53-fd42-445e-9c82-f24f7126b15f/Matjesbrot.JPG',
      'https://images.squarespace-cdn.com/content/v1/6045fdac5914da03d995e027/2f01d3e8-8b60-41a0-8f55-554e3adb861f/Nordseekrabbentu%CC%88rmchen.JPG',
    ],
    openingHours: 'März-Oktober: Mo-So 11:00-18:00 Uhr (tagesaktuell prüfen)',
    openingHoursSource: 'Restaurantseite / Strandcafé',
    openingHoursCheckedAt: '2026-05-21',
    cuisine: 'Strandcafé, warme Speisen, Kuchen',
    menuUrl: 'https://silbermoewe-spo.de/silbermwe-strandcafe',
    menuNote: 'Unkomplizierte Strandcafé-Küche mit warmen Speisen, Kuchen und Getränken für eine leichte Pause am Strand.',
    priceLevel: 'moderate',
    bestFor: ['Strandpause', 'unkompliziert', 'tagsüber'],
    morrowNote: 'Gut für eine einfache Pause am Strand, wenn der Tag nicht zu fest geplant sein soll.',
    reservationType: 'walk-in',
    routeNote: 'Eher als unkomplizierte Strandpause einplanen. Öffnungszeiten und Saison vor dem Losgehen kurz prüfen.',
    status: 'approved',
    sourceUrl: 'https://www.st-peter-ording.de/pfahlbau-restaurants/',
    lat: 54.3353925,
    lng: 8.5911774,
  },
  {
    id: 'strandbar-54-ordinger-strand',
    category: 'food',
    label: 'Essen',
    title: 'Strandbar 54° am Ordinger Strand',
    description: 'Strandnaher Kandidat für Essen und Getränke mit Nordsee-Blick.',
    meta: 'Restaurant-Kandidat',
    address: 'Strandweg 999, 25826 Sankt Peter-Ording',
    phone: '+49 4863 478175',
    email: 'strandbar@strandbar-spo.de',
    websiteUrl: 'https://www.strandbar-54grad-nord.de',
    reservationUrl: 'https://www.strandbar-54grad-nord.de/kontakt',
    photoUrls: [
      'https://www.st-peter-ording.de/fileadmin/_processed_/5/e/csm_2025-ohana-bar-tz-spo-7_d4b5cf08f5.jpg',
      'https://static.wixstatic.com/media/551e80_7546974cdba647f6a2deb9e438d4cb38~mv2.jpg',
      'https://static.wixstatic.com/media/551e80_793eb5d88d054285a48d6c33563b84b0~mv2.jpg',
      'https://static.wixstatic.com/media/551e80_bf30f2dde43d40f9b43050985547678b~mv2.jpg',
    ],
    openingHours: 'Mo-So 11:30-20:00 Uhr laut OSM, Status wegen Neubau/Saison prüfen',
    openingHoursSource: 'OSM / Restaurantseite',
    openingHoursCheckedAt: '2026-05-21',
    cuisine: 'Strandküche, Snacks, Drinks',
    menuUrl: 'https://www.strandbar-54grad-nord.de/speise-weinkarte',
    menuNote: 'Lockere Strandküche und Getränke mit Fokus auf unkomplizierte Pausen am Ordinger Strand.',
    priceLevel: 'moderate',
    bestFor: ['Strandnähe', 'Getränke', 'lockerer Stopp'],
    morrowNote: 'Ein lockerer Ort für Nordsee-Blick und eine Pause am Ordinger Strand.',
    reservationType: 'call',
    routeNote: 'Bitte vorab Status und Saison prüfen. Bei unsicherem Wetter oder großem Andrang kurz anrufen.',
    status: 'approved',
    sourceUrl: 'https://www.st-peter-ording.de/pfahlbau-restaurants/',
    lat: 54.3291413,
    lng: 8.5864438,
  },
  {
    id: 'arche-noah-bad',
    category: 'food',
    label: 'Essen',
    title: 'Arche Noah am Strandabschnitt Bad',
    description: 'Pfahlbau-Restaurant am Strandabschnitt Bad, als Kandidat für gut erreichbare Essensmomente.',
    meta: 'Restaurant-Kandidat',
    address: 'An der Seebrücke, 25826 Sankt Peter-Ording',
    phone: '+49 4863 478378',
    email: 'info@restaurant-arche-noah.de',
    websiteUrl: 'https://restaurant-arche-noah.de/',
    reservationUrl: 'https://restaurant-arche-noah.de/',
    photoUrls: [
      'https://restaurant-arche-noah.de/wp-content/uploads/2020/07/archenoah.jpg',
      'https://restaurant-arche-noah.de/wp-content/uploads/2020/07/archenoah_outdoor.jpg',
      'https://restaurant-arche-noah.de/wp-content/uploads/2020/07/20200622_arche_noah_indoor_17.jpg',
      'https://restaurant-arche-noah.de/wp-content/uploads/2020/07/20200622_arche_noah_food_32.jpg',
    ],
    openingHours: 'Mo-So/Feiertage ab 11:00 Uhr, bis mindestens 21:00 Uhr laut OSM (tagesaktuell prüfen)',
    openingHoursSource: 'OSM / Restaurantseite',
    openingHoursCheckedAt: '2026-05-21',
    cuisine: 'Fisch, regionale Küche, Café',
    menuUrl: 'https://restaurant-arche-noah.de/wp-content/uploads/2024/03/Arche_Noah_Speisekarte_2024_Ma%CC%88rz_WEB.pdf',
    menuNote: 'Pfahlbau-Küche am Strandabschnitt Bad mit Fisch, warmen Gerichten und Café-Momenten.',
    priceLevel: 'moderate',
    bestFor: ['gut erreichbar', 'Strandabschnitt Bad', 'Familien'],
    morrowNote: 'Praktisch, wenn ihr am Strandabschnitt Bad seid und ohne große Umwege essen möchtet.',
    reservationType: 'direct',
    ratingValue: 4.4,
    ratingCount: 2430,
    ratingSource: 'Google-Rezensionen über Wanderlog',
    ratingSourceUrl: 'https://wanderlog.com/place/details/2696867/arche-noah',
    ratingCheckedAt: '2026-05-21',
    routeNote: 'Reservierung und aktuelle Öffnung kurz prüfen, besonders wenn ihr mit Kindern oder zu Stoßzeiten unterwegs seid.',
    status: 'approved',
    sourceUrl: 'https://www.st-peter-ording.de/pfahlbau-restaurants/',
    lat: 54.3119717,
    lng: 8.5880452,
  },
  {
    id: 'ahoi-erlebnis-hus',
    category: 'food',
    label: 'Essen',
    title: 'Ahoi im Erlebnis-Hus',
    description: 'Restaurant im Erlebnis-Hus, als Kandidat für Familien und wetterunabhängige Tage.',
    meta: 'Restaurant-Kandidat',
    address: 'Fritz-Wischer-Straße 1, 25826 Sankt Peter-Ording',
    phone: '+49 4863 9569470',
    websiteUrl: 'https://www.ahoisteffenhenssler.de/location/st-peter-ording/',
    reservationUrl: 'https://www.opentable.de/r/ahoi-steffen-henssler-st-peter-ording-sankt-peter-ording',
    photoUrls: [
      'https://www.ahoisteffenhenssler.de/app/uploads/2024/04/SPO-Restaurant-2-400x400.png',
      'https://www.ahoisteffenhenssler.de/app/uploads/2024/04/SPO-Terrasse-400x400.png',
      'https://www.ahoisteffenhenssler.de/app/uploads/2024/04/SPO-Restaurant-400x400.png',
      'https://www.ahoisteffenhenssler.de/app/uploads/2024/02/Fish-n-Chips-Henssler-Style-400x400.jpg',
    ],
    openingHours: 'Mo-So 11:30-22:30 Uhr (tagesaktuell prüfen)',
    openingHoursSource: 'Ahoi Restaurantseite / OpenTable',
    openingHoursCheckedAt: '2026-05-21',
    cuisine: 'Ahoi-Küche, Fisch, Burger, Bowls',
    menuUrl: 'https://www.ahoisteffenhenssler.de/food/',
    menuNote: 'Unkomplizierte Ahoi-Küche mit Fisch, Burgern, Bowls und familientauglichen Klassikern.',
    priceLevel: 'moderate',
    bestFor: ['Familien', 'Erlebnis-Hus', 'wetterunabhängig'],
    morrowNote: 'Passt gut, wenn ihr Erlebnis-Hus und Essen unkompliziert verbinden möchtet.',
    reservationType: 'direct',
    routeNote: 'Gerade mit Familie lohnt sich eine Reservierung. Gut kombinierbar mit einem wetterunabhängigen Moment im Erlebnis-Hus.',
    status: 'approved',
    sourceUrl: 'https://www.st-peter-ording.de/pfahlbau-restaurants/',
    lat: 54.3070999,
    lng: 8.616771,
  },
  {
    id: 'wochenmarkt-dorf',
    category: 'shopping',
    label: 'Einkauf',
    title: 'Wochenmarkt im Ortsteil Dorf',
    description: 'Lokaler Markt-Kandidat für regionale Produkte und einen ruhigen Vormittag im Ort.',
    meta: 'Markt-Kandidat',
    address: 'Marktplatz an der Schulstraße, 25826 Sankt Peter-Ording',
    openingHours: 'Wochentag und Uhrzeit kommunal/saisonal prüfen',
    routeNote: 'Vor Anzeige für Gäste prüfen: aktueller Wochentag, Uhrzeit, Saison und ob der Markt zur Auszeit passt.',
    status: 'approved',
    sourceUrl: 'https://www.st-peter-ording.de/dorf/',
    lat: 54.3063125,
    lng: 8.6367709,
  },
  {
    id: 'erlebnis-hus',
    category: 'experience',
    label: 'Erlebnis',
    title: 'Erlebnis-Hus',
    description: 'Familiennaher Kandidat mit Indoor-Spielbereich, Outdoor-Spielplatz und wetterunabhängigen Optionen.',
    meta: 'Erlebnis-Kandidat',
    address: 'Fritz-Wischer-Straße 1, 25826 Sankt Peter-Ording',
    openingHours: 'Mo-So 10:00-17:00 Uhr (tagesaktuell prüfen)',
    audiences: ['families', 'kids'],
    ageMin: 0,
    ageNote: 'Für Familien mit Kindern geeignet, genaue Bereiche je Alter prüfen.',
    packageFit: ['family_escape'],
    setting: 'indoor',
    intensity: 'quiet',
    experienceAccess: 'free-local',
    weatherDependent: false,
    routeNote: 'Kostenfrei nutzbar und gut als wetterunabhängiger Familienmoment. Prüft vor Ort trotzdem kurz die aktuellen Öffnungszeiten und Programmpunkte.',
    status: 'approved',
    sourceUrl: 'https://www.st-peter-ording.de/erlebnis-hus/',
    lat: 54.3071805,
    lng: 8.6167182,
  },
  {
    id: 'wattwandern-spo',
    category: 'experience',
    label: 'Erlebnis',
    title: 'Geführte Wattwanderung',
    description: 'Naturerlebnis-Kandidat für Familien und Paare, abhängig von Gezeiten, Wetter und Gruppengröße.',
    meta: 'Erlebnis-Kandidat',
    openingHours: 'Nach Termin und Anbieter',
    audiences: ['families', 'couples', 'adults', 'kids'],
    ageMin: 6,
    ageNote: 'Für Kinder je nach Anbieter meist erst ab einem sinnvollen Mindestalter; Sicherheit und Strecke prüfen.',
    packageFit: ['family_escape', 'couple_reset'],
    setting: 'outdoor',
    intensity: 'weather_dependent',
    experienceAccess: 'bookable',
    weatherDependent: true,
    routeNote: 'Vor Anzeige für Gäste prüfen: Anbieter, Termin, Sicherheit, Treffpunkt und Altersfreigabe.',
    status: 'approved',
    sourceUrl: 'https://www.st-peter-ording.de/wattwandern/',
    lat: 54.2944587,
    lng: 8.6103933,
  },
  {
    id: 'gezeiten-spo',
    category: 'tide',
    label: 'Gezeiten',
    title: 'Gezeitenkalender St. Peter-Ording',
    description: 'Tagesaktueller Hinweis für Watt, Strandspaziergänge und sichere Planung am Wasser.',
    meta: 'Info-Kandidat',
    openingHours: 'Tagesaktuelle Datenquelle',
    routeNote: 'Vor Anzeige als Live-Modul prüfen: Datenquelle, Aktualisierung und Sicherheitshinweise.',
    status: 'approved',
    sourceUrl: 'https://www.st-peter-ording.de/gezeiten/',
    lat: 54.2944587,
    lng: 8.6103933,
  },
  {
    id: 'event-seebrueckenfest-2026',
    category: 'event',
    label: 'Veranstaltungen',
    title: 'Seebrückenfest',
    description: 'Lokales Fest in St. Peter-Ording. Als Kandidat für Gäste, wenn es zeitlich zur Auszeit passt und nicht den Aufenthalt überlädt.',
    meta: 'Event-Kandidat',
    address: 'Seebrücke, 25826 Sankt Peter-Ording',
    websiteUrl: 'https://www.st-peter-ording.de/veranstaltungskalender/veranstaltungen/STP/57d92430-5a27-4f90-93d8-c032f9210813',
    photoUrls: ['https://www.st-peter-ording.de/uploads/webx_bookingemo/event/57d92430-5a27-4f90-93d8-c032f9210813/seebruecke-spo.jpg'],
    openingHours: 'Sa., 23.05.2026 (Uhrzeit auf Quelle prüfen)',
    eventStartDate: '2026-05-23',
    eventEndDate: '2026-05-23',
    eventAudience: 'both',
    eventSetting: 'outdoor',
    eventFitNote: 'Kann als lokales Highlight funktionieren, wenn Gäste bewusst etwas Lebendigkeit suchen.',
    routeNote: 'Vor Freigabe prüfen: genaue Uhrzeit, Programm, Andrang, Parken und ob es zur Auszeit passt.',
    status: 'candidate',
    sourceUrl: 'https://www.st-peter-ording.de/veranstaltungskalender/veranstaltungen',
    lat: 54.3119717,
    lng: 8.5880452,
  },
  {
    id: 'event-drachenfest-spo-2026',
    category: 'event',
    label: 'Veranstaltungen',
    title: 'Drachenfest in SPO',
    description: 'Strandnahes Event mit viel Bildwirkung und Nordseegefühl. Als Kandidat besonders für Familien und Gäste, die einen lebendigen Strandmoment suchen.',
    meta: 'Event-Kandidat',
    address: 'Strand St. Peter-Ording, 25826 Sankt Peter-Ording',
    websiteUrl: 'https://www.st-peter-ording.de/veranstaltungskalender/veranstaltungen/STP/44c332b0-567f-44d4-ba96-97aa9b1d62f8',
    photoUrls: ['https://www.st-peter-ording.de/uploads/webx_bookingemo/event/44c332b0-567f-44d4-ba96-97aa9b1d62f8/pressefoto-df-spo-2022-czirkel-eventsjpg.jpg'],
    openingHours: 'Fr., 26.06.2026 - So., 28.06.2026 (Uhrzeiten auf Quelle prüfen)',
    eventStartDate: '2026-06-26',
    eventEndDate: '2026-06-28',
    eventAudience: 'families',
    eventSetting: 'outdoor',
    eventFitNote: 'Sehr passend für Family Escape, wenn es nicht als Pflichtprogramm wirkt.',
    routeNote: 'Vor Freigabe prüfen: Strandabschnitt, Wetter, Parken, Laufwege und Tageszeit.',
    status: 'candidate',
    sourceUrl: 'https://www.st-peter-ording.de/veranstaltungskalender/veranstaltungen',
    lat: 54.3291413,
    lng: 8.5864438,
  },
  {
    id: 'event-haedi-festival-2026',
    category: 'event',
    label: 'Veranstaltungen',
    title: 'HÆDI - #17Ziele unplugged',
    description: 'Festival-Kandidat in St. Peter-Ording. Kann für Paare und Erwachsene interessant sein, wenn Musik, Atmosphäre und Nachhaltigkeit zur Auszeit passen.',
    meta: 'Event-Kandidat',
    address: 'St. Peter-Ording',
    websiteUrl: 'https://www.st-peter-ording.de/veranstaltungskalender/veranstaltungen/STP/974dbaa6-0523-43b9-98a9-c188f1b39709',
    photoUrls: ['https://www.st-peter-ording.de/uploads/webx_bookingemo/event/974dbaa6-0523-43b9-98a9-c188f1b39709/haedi-festival-good-vibes.jpg'],
    openingHours: 'Do., 02.07.2026 - So., 05.07.2026 (Programm auf Quelle prüfen)',
    eventStartDate: '2026-07-02',
    eventEndDate: '2026-07-05',
    eventAudience: 'couples',
    eventSetting: 'outdoor',
    eventFitNote: 'Eher als optionaler Abend-/Atmosphäre-Tipp für Couple Reset geeignet.',
    routeNote: 'Vor Freigabe prüfen: Ticketlage, Programm, Lautstärke, Weg und ob es zur ruhigen Auszeit passt.',
    status: 'candidate',
    sourceUrl: 'https://www.st-peter-ording.de/veranstaltungskalender/veranstaltungen',
    lat: 54.3071805,
    lng: 8.6167182,
  },
  {
    id: 'event-california-windsurf-cup-2026',
    category: 'event',
    label: 'Veranstaltungen',
    title: 'California Windsurf Cup',
    description: 'Sportevent an der Nordsee. Als Kandidat für aktive Gäste und Familien, wenn ein lebendiger Strandtag gewünscht ist.',
    meta: 'Event-Kandidat',
    address: 'Strand St. Peter-Ording, 25826 Sankt Peter-Ording',
    websiteUrl: 'https://www.st-peter-ording.de/veranstaltungskalender/veranstaltungen/STP/e265ca0d-8cf9-4eaa-8b30-9b7e5f5febe3',
    photoUrls: ['https://www.st-peter-ording.de/uploads/webx_bookingemo/event/e265ca0d-8cf9-4eaa-8b30-9b7e5f5febe3/california-windsurfcup-2.jpg'],
    openingHours: 'Mi., 15.07.2026 - So., 19.07.2026 (Programm auf Quelle prüfen)',
    eventStartDate: '2026-07-15',
    eventEndDate: '2026-07-19',
    eventAudience: 'both',
    eventSetting: 'outdoor',
    eventFitNote: 'Passt als aktiver Strandimpuls, nicht als Pflichtbestandteil der Auszeit.',
    routeNote: 'Vor Freigabe prüfen: Veranstaltungsfläche, Andrang, Wetter, Parken und Tagesplan.',
    status: 'candidate',
    sourceUrl: 'https://www.st-peter-ording.de/veranstaltungskalender/veranstaltungen',
    lat: 54.3291413,
    lng: 8.5864438,
  },
  {
    id: 'event-tierparknacht-2026',
    category: 'event',
    label: 'Veranstaltungen',
    title: 'Tierparknacht',
    description: 'Abendveranstaltung im Westküstenpark. Als Kandidat für Familien, wenn Kinderalter, Uhrzeit und Energielevel passen.',
    meta: 'Event-Kandidat',
    address: 'Westküstenpark, Wohldweg 6, 25826 Sankt Peter-Ording',
    websiteUrl: 'https://www.st-peter-ording.de/veranstaltungskalender/veranstaltungen/STP/80224c0c-bb4c-4f15-ac96-fda350107355',
    photoUrls: ['https://www.st-peter-ording.de/uploads/webx_bookingemo/event/80224c0c-bb4c-4f15-ac96-fda350107355/leuchttiere-im-westkuestenpark.jpeg'],
    openingHours: 'Do., 13.08.2026 (Uhrzeit auf Quelle prüfen)',
    eventStartDate: '2026-08-13',
    eventEndDate: '2026-08-13',
    eventAudience: 'families',
    eventSetting: 'outdoor',
    eventFitNote: 'Kann für Family Escape im August relevant sein, wenn die Auszeit um diesen Termin liegt.',
    routeNote: 'Vor Freigabe prüfen: Uhrzeit, Ticket, Alter der Kinder und Rückweg am Abend.',
    status: 'approved',
    sourceUrl: 'https://www.st-peter-ording.de/veranstaltungskalender/veranstaltungen',
    lat: 54.300826,
    lng: 8.644595,
  },
  {
    id: 'event-dlrg-nivea-strandfest-2026',
    category: 'event',
    label: 'Veranstaltungen',
    title: 'DLRG-Nivea-Strandfest - Wir machen wasserfest',
    description: 'Strandfest mit Familienbezug. Als Kandidat für Gäste mit Kindern, wenn es genau in die gebuchte Auszeit fällt.',
    meta: 'Event-Kandidat',
    address: 'Strand St. Peter-Ording, 25826 Sankt Peter-Ording',
    websiteUrl: 'https://www.st-peter-ording.de/veranstaltungskalender/veranstaltungen/STP/31d8e490-8f67-4c9e-99b7-c227caf80ef8',
    photoUrls: ['https://www.st-peter-ording.de/uploads/webx_bookingemo/event/31d8e490-8f67-4c9e-99b7-c227caf80ef8/spo-dlrg-nivea-strandest-55.jpg'],
    openingHours: 'Di., 18.08.2026 (Uhrzeit auf Quelle prüfen)',
    eventStartDate: '2026-08-18',
    eventEndDate: '2026-08-18',
    eventAudience: 'families',
    eventSetting: 'outdoor',
    eventFitNote: 'Sehr passend als Familienhinweis, wenn Wetter und Tagesrhythmus stimmen.',
    routeNote: 'Vor Freigabe prüfen: Strandabschnitt, Programm, Uhrzeit, Wetter und Wege.',
    status: 'candidate',
    sourceUrl: 'https://www.st-peter-ording.de/veranstaltungskalender/veranstaltungen',
    lat: 54.3291413,
    lng: 8.5864438,
  },
  {
    id: 'event-california-kitesurf-masters-2026',
    category: 'event',
    label: 'Veranstaltungen',
    title: 'California Kitesurf Masters',
    description: 'Großes Wassersportevent mit starkem SPO-Bezug. Als Kandidat für aktive Familien und Paare mit Lust auf Strandatmosphäre.',
    meta: 'Event-Kandidat',
    address: 'Strand St. Peter-Ording, 25826 Sankt Peter-Ording',
    websiteUrl: 'https://www.st-peter-ording.de/veranstaltungskalender/veranstaltungen/STP/63239bda-e428-40eb-bf00-ee95d3a67f5a',
    photoUrls: ['https://www.st-peter-ording.de/uploads/webx_bookingemo/event/63239bda-e428-40eb-bf00-ee95d3a67f5a/kitesurf-masters-elias-ouahmid-bild-choppy-water.jpg'],
    openingHours: 'Mi., 19.08.2026 - So., 23.08.2026 (Programm auf Quelle prüfen)',
    eventStartDate: '2026-08-19',
    eventEndDate: '2026-08-23',
    eventAudience: 'both',
    eventSetting: 'outdoor',
    eventFitNote: 'Relevant für August-Auszeiten, wenn ein aktiver Strandmoment gewünscht ist.',
    routeNote: 'Vor Freigabe prüfen: Tagesprogramm, Andrang, Parken, Wetter und ob Gäste Ruhe oder Trubel wünschen.',
    status: 'approved',
    sourceUrl: 'https://www.st-peter-ording.de/veranstaltungskalender/veranstaltungen',
    lat: 54.3291413,
    lng: 8.5864438,
  },
  {
    id: 'event-familienfest-2026',
    category: 'event',
    label: 'Veranstaltungen',
    title: 'Familienfest',
    description: 'Familiennahes Event in St. Peter-Ording. Als Kandidat für Auszeiten mit Kindern, wenn Programm und Uhrzeit entspannt passen.',
    meta: 'Event-Kandidat',
    address: 'St. Peter-Ording',
    websiteUrl: 'https://www.st-peter-ording.de/veranstaltungskalender/veranstaltungen/STP/ef60d991-8647-4ea8-b635-cfddee88a32e',
    photoUrls: ['https://www.st-peter-ording.de/uploads/webx_bookingemo/event/ef60d991-8647-4ea8-b635-cfddee88a32e/bubbles-for-fun.jpg'],
    openingHours: 'Sa., 05.09.2026 (Uhrzeit auf Quelle prüfen)',
    eventStartDate: '2026-09-05',
    eventEndDate: '2026-09-05',
    eventAudience: 'families',
    eventSetting: 'outdoor',
    eventFitNote: 'Klassischer Family-Escape-Kandidat, wenn es zur Aufenthaltszeit passt.',
    routeNote: 'Vor Freigabe prüfen: genauer Ort, Uhrzeit, Alter der Kinder, Wetter und Weg.',
    status: 'candidate',
    sourceUrl: 'https://www.st-peter-ording.de/veranstaltungskalender/veranstaltungen',
    lat: 54.3071805,
    lng: 8.6167182,
  },
  {
    id: 'notruf-112',
    category: 'emergency',
    label: 'Hilfe',
    title: 'Notruf Feuerwehr und Rettungsdienst',
    description: 'Zentrale Notfallnummer für akute medizinische Notfälle, Feuer oder lebensbedrohliche Situationen.',
    meta: 'Notfall-Kandidat',
    phone: '112',
    websiteUrl: 'https://www.112.de',
    openingHours: '24/7 erreichbar',
    routeNote: 'Nur für echte Notfälle. In akuten Situationen nicht in der App suchen, sondern direkt 112 wählen.',
    status: 'approved',
    sourceUrl: 'https://www.112.de',
    lat: 54.3053654,
    lng: 8.636108,
  },
  {
    id: 'aerztlicher-bereitschaftsdienst-116117',
    category: 'emergency',
    label: 'Hilfe',
    title: 'Ärztlicher Bereitschaftsdienst',
    description: 'Telefonische Hilfe, wenn medizinische Behandlung nötig ist, aber kein lebensbedrohlicher Notfall vorliegt.',
    meta: 'Medizin-Kandidat',
    phone: '116117',
    websiteUrl: 'https://www.116117.de',
    openingHours: '24/7 telefonisch erreichbar',
    routeNote: 'Für Beschwerden außerhalb regulärer Praxiszeiten. Bei Lebensgefahr immer 112 wählen.',
    status: 'approved',
    sourceUrl: 'https://www.116117.de',
    lat: 54.3053654,
    lng: 8.636108,
  },
  {
    id: 'polizeistation-spo',
    category: 'emergency',
    label: 'Hilfe',
    title: 'Polizeistation St. Peter-Ording',
    description: 'Lokale Polizeistation für nicht-akute polizeiliche Anliegen während des Aufenthalts.',
    meta: 'Polizei-Kandidat',
    address: 'Deichgrafenweg 4, 25826 Sankt Peter-Ording',
    phone: '+49 4863 9589160',
    websiteUrl: 'https://www.polizei.schleswig-holstein.de',
    openingHours: 'Mi 10:00-12:00 Uhr, Do 15:00-17:00 Uhr (tagesaktuell prüfen)',
    routeNote: 'Bei akuter Gefahr immer 110 wählen. Für nicht-dringende Anliegen Öffnungszeiten prüfen.',
    status: 'candidate',
    sourceUrl: 'https://www.11880.com/branchenbuch/sankt-peter-ording/062474120B29186070/polizeistation-st-peter-ording.html',
    lat: 54.3071751,
    lng: 8.6264194,
  },
  {
    id: 'utholm-apotheke',
    category: 'emergency',
    label: 'Hilfe',
    title: 'Utholm-Apotheke',
    description: 'Apotheken-Kandidat für Medikamente, Beratung und schnelle Besorgungen im Ort.',
    meta: 'Apotheke-Kandidat',
    address: 'Nordergeest 6, 25826 Sankt Peter-Ording',
    phone: '+49 4863 474955',
    websiteUrl: 'https://www.utholm-apotheke.de',
    openingHours: 'Mo-Fr 08:30-18:30 Uhr, Sa 08:30-13:30 Uhr (Notdienst tagesaktuell prüfen)',
    routeNote: 'Vor dem Losgehen Öffnungszeiten und Apothekennotdienst prüfen.',
    status: 'candidate',
    sourceUrl: 'https://www.amt-eiderstedt.de/Amt-und-Gemeinden/Amt-Eiderstedt/Ansprechpartner/Utholm-Apotheke.php?FID=1840.169.1&La=1&ModID=9&object=tx%7C2706.1.1&redir=1',
    lat: 54.3064251,
    lng: 8.6478591,
  },
  {
    id: 'tourist-info-dorf',
    category: 'emergency',
    label: 'Hilfe',
    title: 'Tourist-Info Ortsteil Dorf',
    description: 'Lokale Anlaufstelle für praktische Fragen vor Ort, Gästekarte, Orientierung und touristische Hinweise.',
    meta: 'Anlaufstelle-Kandidat',
    address: 'Badallee 1, 25826 Sankt Peter-Ording',
    phone: '+49 4863 9990',
    websiteUrl: 'https://www.st-peter-ording.de',
    openingHours: 'Öffnungszeiten saisonal prüfen',
    routeNote: 'Gut für organisatorische Fragen vor Ort. Für Morrow-spezifische Anliegen bleibt der Morrow-Support zuständig.',
    status: 'candidate',
    sourceUrl: 'https://www.st-peter-ording.de/fileadmin/userdaten/pdf-dokumente/prospekte-und-flyer/SPO_2026_Online_Gastgeberverzeichnis.pdf',
    lat: 54.3053654,
    lng: 8.636108,
  },
]

export const adminLocalPlaceStorageKey = 'morrow-admin-local-places'

export function getStoredLocalPlaceCandidates() {
  if (typeof localStorage === 'undefined') return localPlaceCandidates

  try {
    const saved = localStorage.getItem(adminLocalPlaceStorageKey)
    if (!saved) return localPlaceCandidates
    const parsedPlaces = JSON.parse(saved) as Array<Partial<LocalPlaceCandidate>>
    const storedPlaces = Array.isArray(parsedPlaces)
      ? parsedPlaces
        .filter((place) => place && typeof place === 'object' && typeof place.id === 'string')
        .map((place) => normalizeLocalPlaceCandidate(place))
      : []
    const storedById = new Map(storedPlaces.map((place) => [place.id, place]))
    const mergedSeeds = localPlaceCandidates.map((seedPlace) => normalizeLocalPlaceCandidate(storedById.get(seedPlace.id) ?? seedPlace, seedPlace))
    const customPlaces = storedPlaces.filter((place) => !localPlaceCandidates.some((seedPlace) => seedPlace.id === place.id))
    return [...mergedSeeds, ...customPlaces]
  } catch {
    return localPlaceCandidates
  }
}

function approvedCandidatesForGuestApp() {
  return getStoredLocalPlaceCandidates().filter((place) => place.status === 'approved' && place.lat && place.lng) as Array<LocalPlaceCandidate & { lat: number; lng: number }>
}

function guestPlaceMeta(place: LocalPlaceCandidate) {
  if (place.category === 'food') return 'Restaurant'
  if (place.category === 'shopping') return 'Einkauf'
  if (place.category === 'experience') return place.experienceAccess ? localExperienceAccessLabels[place.experienceAccess] : 'Erlebnis'
  if (place.category === 'event') return place.eventStartDate ? `Veranstaltung · ${place.eventStartDate}` : 'Veranstaltung'
  if (place.category === 'tide') return 'Gezeiten'
  if (place.category === 'service') return 'Service'
  if (place.category === 'emergency') return 'Hilfe'
  return place.meta.replace(/-Kandidat/g, '')
}

function germanEventDateLabel(value?: string) {
  if (!value) return ''
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function guestEventOpeningHours(place: LocalPlaceCandidate) {
  if (place.category !== 'event') return place.openingHours
  if (!place.eventStartDate) return place.openingHours

  const start = germanEventDateLabel(place.eventStartDate)
  const end = place.eventEndDate && place.eventEndDate !== place.eventStartDate ? ` - ${germanEventDateLabel(place.eventEndDate)}` : ''
  const time = place.eventTime ? `, ${place.eventTime} Uhr` : ''
  return `${start}${end}${time}`
}

function guestPlaceDescription(place: LocalPlaceCandidate) {
  if (place.category === 'food') {
    return place.description
      .replace('Pfahlbau-Restaurant am Südstrand, als Kandidat für Strandtage und entspannte Abendoptionen.', 'Pfahlbau-Restaurant am Südstrand für einen entspannten Strandtag oder einen ruhigen Abend.')
      .replace('Pfahlbau-Restaurant am Böhler Strand, als Kandidat für besondere Dinner- oder Sonnenuntergangsmomente.', 'Pfahlbau-Restaurant am Böhler Strand für ein besonderes Essen mit Nordseegefühl.')
      .replace('Pfahlbau-Restaurant am Ordinger Strand, als Kandidat für unkomplizierte Strandnähe.', 'Pfahlbau-Restaurant am Ordinger Strand für unkomplizierte Strandnähe.')
      .replace('Strandnaher Kandidat für Essen und Getränke mit Nordsee-Blick.', 'Strandnaher Ort für Essen und Getränke mit Nordsee-Blick.')
      .replace('Pfahlbau-Restaurant am Strandabschnitt Bad, als Kandidat für gut erreichbare Essensmomente.', 'Pfahlbau-Restaurant am Strandabschnitt Bad für gut erreichbare Essensmomente.')
      .replace('Restaurant im Erlebnis-Hus, als Kandidat für Familien und wetterunabhängige Tage.', 'Restaurant im Erlebnis-Hus für Familien und wetterunabhängige Tage.')
  }
  if (place.category === 'event') return place.description.replace(/-Kandidat/g, '').replace(/als Kandidat für/g, 'für')
  return place.description
    .replace(/-Kandidat/g, '')
    .replace(/als Kandidat für/g, 'für')
}

function guestPlaceRouteNote(place: LocalPlaceCandidate) {
  if (place.category === 'food') return 'Prüft vor dem Losgehen kurz die aktuellen Öffnungszeiten und plant den Weg passend zu eurem Tag.'
  if (place.category === 'shopping') return 'Gut für einen ruhigen Vormittag, wenn der Termin zum Aufenthalt passt.'
  if (place.category === 'experience' && place.experienceAccess === 'free-local') return 'Kostenfrei vor Ort nutzbar. Prüft nur kurz Öffnungszeiten, Altersempfehlung und ob es zu eurem Tagesrhythmus passt.'
  if (place.category === 'experience' && place.experienceAccess === 'bookable') return 'Optionaler Erlebnisbaustein. Details, Treffpunkt und Uhrzeit stimmen wir nur ab, wenn ihr ihn zusätzlich nutzen möchtet.'
  if (place.category === 'experience') return 'Details, Treffpunkt und Uhrzeit stimmen wir passend zu eurer Auszeit ab.'
  if (place.category === 'event') return 'Passt nur in die App, wenn Datum, Zielgruppe, Anreiseaufwand und Stimmung wirklich zur Auszeit passen.'
  if (place.category === 'tide') return 'Watt und Wasser bitte immer mit aktuellen Gezeiten und Wetter im Blick planen.'
  return place.routeNote
}

function localExperienceFitsPackage(place: LocalPlaceCandidate, packageItem: MorrowPackage | null) {
  if (place.category !== 'experience' || !place.packageFit || place.packageFit.length === 0 || !packageItem) return true
  if (packageItem.slug === 'family-escape') return place.packageFit.includes('family_escape')
  if (packageItem.slug === 'couple-reset') return place.packageFit.includes('couple_reset')
  return true
}

function packageExperienceCoordinate(packageItem: MorrowPackage | null, index: number) {
  const familyCoordinates = [
    [54.2944587, 8.6103933],
    [54.300826, 8.644595],
    [54.3071805, 8.6167182],
  ] as const
  const coupleCoordinates = [
    [54.3115914, 8.6119723],
    [54.3071805, 8.6167182],
    [54.3119717, 8.5880452],
  ] as const
  const coordinates = packageItem?.audience === 'families' ? familyCoordinates : coupleCoordinates
  return coordinates[index % coordinates.length]
}

function packageExperienceMeta(experience: ExperienceItem) {
  if (experience.role === 'included') return experience.confirmationStatus === 'confirmed' ? 'Enthalten · bestätigt' : 'Enthalten · wird vorbereitet'
  if (experience.role === 'optional') return experience.includedInPrice ? 'Optional · inklusive möglich' : 'Optional buchbar'
  if (experience.role === 'planned') return 'Geplanter Erlebnisbaustein'
  return 'Kuratierte Empfehlung'
}

function packageExperienceRouteNote(experience: ExperienceItem) {
  if (experience.role === 'included') return 'Dieser Baustein gehört zu eurer Auszeit. Uhrzeit, Treffpunkt und letzte Hinweise werden passend zum Aufenthalt ergänzt.'
  if (experience.role === 'optional') return 'Dieser Baustein ist kuratiert, aber nicht automatisch gebucht. Wenn ihr Interesse habt, schreibt Morrow kurz dazu.'
  return 'Dieser Hinweis ist kuratiert und wird nur aufgenommen, wenn er wirklich zum Aufenthalt passt.'
}

export function getGuestLocalPlaces(packageItem: MorrowPackage | null): LocalPlace[] {
  const basePlaces: LocalPlace[] = [
    {
      id: 'stay',
      category: 'all',
      label: 'Unterkunft',
      title: packageItem?.stay.name ?? 'Eure Unterkunft',
      description: packageItem?.stay.locationNote ?? 'Der ruhige Ausgangspunkt für eure Auszeit.',
      meta: 'Ankommen',
      routeNote: 'Adresse und genaue Lage liegen mit den Check-in-Infos bereit.',
      lat: 54.304,
      lng: 8.642,
    },
    {
      id: 'weather',
      category: 'weather',
      label: 'Wetter',
      title: 'Plan B für Nordseewetter',
      description: 'Wenn Wind oder Regen drehen, bleiben kurze Wege, Rückzugsort und passende Alternativen wichtig.',
      meta: 'Ruhig bleiben',
      routeNote: 'Erst Wetter prüfen, dann einen einfachen Plan B wählen.',
      lat: 54.286,
      lng: 8.676,
    },
    {
      id: 'tide',
      category: 'tide',
      label: 'Gezeiten',
      title: 'Ebbe, Flut und Watt',
      description: 'Für Spaziergänge am Wasser und Naturmomente ist der Rhythmus der Nordsee wichtig.',
      meta: 'Vor dem Watt prüfen',
      routeNote: 'Gezeitenwerte werden später tagesaktuell ergänzt. Watt nur mit passender Sicherheit planen.',
      lat: 54.31,
      lng: 8.607,
    },
  ]
  const packageExperiencePlaces: LocalPlace[] = (packageItem?.experienceItems ?? [])
    .filter((experience) => experience.role !== 'recommendation')
    .map((experience, index) => {
      const [lat, lng] = packageExperienceCoordinate(packageItem, index)
      return {
        id: `experience-${experience.id}`,
        category: 'experience',
        label: experience.role === 'included' ? 'Enthaltenes Erlebnis' : 'Kuratierter Baustein',
        title: experience.title,
        description: experience.guestNotes,
        meta: [experience.providerName, packageExperienceMeta(experience)].filter(Boolean).join(' · '),
        experienceAccess: experience.role === 'included' ? 'included' : experience.role === 'optional' ? 'bookable' : 'recommendation',
        routeNote: packageExperienceRouteNote(experience),
        lat,
        lng,
      }
    })

  return [
    ...basePlaces,
    ...packageExperiencePlaces,
    ...approvedCandidatesForGuestApp()
      .filter((place) => localExperienceFitsPackage(place, packageItem))
      .map((place) => ({
      id: place.id,
      category: place.category,
      label: place.label,
      title: place.title,
      description: guestPlaceDescription(place),
      meta: guestPlaceMeta(place),
      address: place.address,
      phone: place.phone,
      websiteUrl: place.websiteUrl,
      reservationUrl: place.reservationUrl,
      photoUrls: place.photoUrls,
      openingHours: guestEventOpeningHours(place),
      openingHoursSource: place.openingHoursSource,
      openingHoursCheckedAt: place.openingHoursCheckedAt,
      cuisine: place.cuisine,
      menuUrl: place.menuUrl,
      menuNote: place.menuNote,
      priceLevel: place.priceLevel,
      bestFor: place.bestFor,
      morrowNote: place.morrowNote,
      reservationType: place.reservationType,
      ratingValue: place.ratingValue,
      ratingCount: place.ratingCount,
      ratingSource: place.ratingSource,
      ratingSourceUrl: place.ratingSourceUrl,
      ratingCheckedAt: place.ratingCheckedAt,
      eventStartDate: place.eventStartDate,
      eventEndDate: place.eventEndDate,
      eventTime: place.eventTime,
      eventAudience: place.eventAudience,
      eventSetting: place.eventSetting,
      eventFitNote: place.eventFitNote,
      experienceAccess: place.experienceAccess,
      audiences: place.audiences,
      ageMin: place.ageMin,
      ageNote: place.ageNote,
      setting: place.setting,
      intensity: place.intensity,
      weatherDependent: place.weatherDependent,
      routeNote: guestPlaceRouteNote(place),
      lat: place.lat,
      lng: place.lng,
    })),
  ]
}
