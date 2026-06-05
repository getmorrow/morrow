import { Fragment, lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode, TouchEvent } from 'react'
import {
  ArrowRightLine,
  CalendarLine,
  CloseLine,
  DoorLine,
  ForkKnifeLine,
  GroupLine,
  HeartHandLine,
  Home3Line,
  Key2Line,
  LocationLine,
  MenuLine,
  SafeShield2Line,
  SparklesLine,
  SunCloudyLine,
  WaveLine,
} from '@mingcute/react'
import './App.css'
import { articles, navItems, packages } from './data'
import type { Audience, ExperienceRole, LeadStatus, MorrowPackage, PackageStatus, Stay } from './data'
import {
  type AdminProfile,
  createStoredCommunicationEvent,
  createStoredSupportMessage,
  deleteStoredAgency,
  deleteStoredAdminTask,
  deleteStoredExperienceProvider,
  deleteStoredLead,
  deleteStoredLocalPlace,
  deleteStoredOwnerProperty,
  deleteStoredPackage,
  fetchStoredAgencies,
  fetchStoredAdminTasks,
  fetchStoredApprovedLocalPlaces,
  fetchStoredBookings,
  fetchStoredCustomers,
  fetchStoredExperienceProviders,
  fetchAdminProfile,
  fetchStoredCommunicationEvents,
  fetchStoredEmailEvents,
  fetchStoredLeads,
  fetchStoredLocalPlaces,
  fetchStoredOwnerProperties,
  fetchStoredPackages,
  fetchGuestStayByAccess,
  sendLeadNotification,
  updateStoredLead,
  upsertStoredAdminTask,
  upsertStoredAgency,
  upsertStoredBooking,
  upsertStoredCustomer,
  upsertStoredExperienceProvider,
  upsertStoredLead,
  upsertStoredLocalPlace,
  upsertStoredOwnerProperty,
  upsertStoredPackage,
} from './lib/morrowBackend'
import { isSupabaseConfigured, supabase, type SupabaseSession } from './lib/supabase'
import {
  adminLocalPlaceStorageKey,
  getGuestLocalPlaces,
  getStoredLocalPlaceCandidates,
  localEventAudienceLabels,
  localEventSettingLabels,
  localExperienceAccessLabels,
  localExperienceAudienceLabels,
  localExperienceIntensityLabels,
  localExperiencePackageFitLabels,
  localExperienceSettingLabels,
  localFoodPriceLevelLabels,
  localPlaceCategoryLabels,
  normalizeLocalPlaceCandidate,
} from './data/localPlaces'
import type { LocalPlace, LocalPlaceCandidate, LocalPlaceCategory, LocalPlaceStatus } from './data/localPlaces'

const GuestLocalMap = lazy(() => import('./GuestLocalMap'))

function articleSectionId(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function setMetaTag(selector: string, attribute: string, value: string) {
  let tag = document.head.querySelector(selector) as HTMLMetaElement | null

  if (!tag) {
    tag = document.createElement('meta')
    const nameMatch = selector.match(/name="([^"]+)"/)
    const propertyMatch = selector.match(/property="([^"]+)"/)
    if (nameMatch) tag.setAttribute('name', nameMatch[1])
    if (propertyMatch) tag.setAttribute('property', propertyMatch[1])
    document.head.appendChild(tag)
  }

  tag.setAttribute(attribute, value)
}

function usePageMeta(title: string, description: string, image = '/brand/generated/morrow-spo-hero.png') {
  useEffect(() => {
    document.title = title
    setMetaTag('meta[name="description"]', 'content', description)
    setMetaTag('meta[property="og:title"]', 'content', title)
    setMetaTag('meta[property="og:description"]', 'content', description)
    setMetaTag('meta[property="og:image"]', 'content', image)
    setMetaTag('meta[property="og:type"]', 'content', 'article')
    setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image')
  }, [description, image, title])
}

function formatGermanDate(value: string) {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

function formatGermanTaskDate(value: string) {
  if (!value) return 'ohne Datum'
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'long',
  }).format(new Date(`${value}T12:00:00`))
}

function todayIsoValue() {
  return new Date().toISOString().slice(0, 10)
}

function guestStayStartDate(dateLabel: string) {
  const monthMap: Record<string, number> = {
    januar: 0,
    februar: 1,
    märz: 2,
    maerz: 2,
    april: 3,
    mai: 4,
    juni: 5,
    juli: 6,
    august: 7,
    september: 8,
    oktober: 9,
    november: 10,
    dezember: 11,
  }
  const dayMatch = dateLabel.match(/(\d{1,2})\s*\./)
  const monthMatch = dateLabel.match(/([A-Za-zÄÖÜäöü]+)\s*$/)
  if (!dayMatch || !monthMatch) return null

  const month = monthMap[monthMatch[1].toLowerCase()]
  if (month === undefined) return null

  const now = new Date()
  const start = new Date(now.getFullYear(), month, Number(dayMatch[1]), 12)
  if (start.getTime() < now.getTime() - 1000 * 60 * 60 * 24 * 30) {
    start.setFullYear(start.getFullYear() + 1)
  }
  return start
}

function guestStayDateWindow(dateLabel: string) {
  const start = guestStayStartDate(dateLabel)
  if (!start) return null

  const endDayMatch = dateLabel.match(/-\s*(\d{1,2})\s*\./)
  const end = new Date(start)
  if (endDayMatch) {
    end.setDate(Number(endDayMatch[1]))
    if (end.getTime() < start.getTime()) end.setMonth(end.getMonth() + 1)
  } else {
    end.setDate(end.getDate() + 4)
  }

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

function localEventOverlapsStay(place: LocalPlace | LocalPlaceCandidate, selectedDate: string) {
  if (place.category !== 'event' || !place.eventStartDate) return true
  const stayWindow = guestStayDateWindow(selectedDate)
  if (!stayWindow) return true

  const eventEndDate = place.eventEndDate || place.eventStartDate
  return place.eventStartDate <= stayWindow.end && eventEndDate >= stayWindow.start
}

function localEventFitsPackage(place: LocalPlace | LocalPlaceCandidate, packageItem: MorrowPackage | null) {
  if (place.category !== 'event' || !place.eventAudience || place.eventAudience === 'both' || !packageItem) return true
  if (place.eventAudience === 'families') return packageItem.audience === 'families'
  if (place.eventAudience === 'couples') return packageItem.audience === 'couples'
  return true
}

function guestStayCountdownLabel(dateLabel: string) {
  const start = guestStayStartDate(dateLabel)
  if (!start) return null
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)
  const days = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (days > 1) return `Noch ${days} Tage bis zu eurer Auszeit.`
  if (days === 1) return 'Morgen beginnt eure Auszeit.'
  if (days === 0) return 'Heute beginnt eure Auszeit.'
  return null
}

function guestCountLabel(value?: string) {
  const trimmedValue = value?.trim()
  if (!trimmedValue) return '2 Personen'
  const parsedValue = Number.parseInt(trimmedValue, 10)
  if (Number.isFinite(parsedValue)) return `${parsedValue} ${parsedValue === 1 ? 'Person' : 'Personen'}`
  return trimmedValue
}

function arrivalWindowLabel(stay?: Stay) {
  if (!stay) return 'Anreise nach Absprache'
  if (stay.earliestArrival && stay.latestArrival) return `Anreise ${stay.earliestArrival} bis ${stay.latestArrival} Uhr`
  if (stay.earliestArrival) return `Anreise ab ${stay.earliestArrival} Uhr`
  if (stay.latestArrival) return `Anreise bis ${stay.latestArrival} Uhr`
  return 'Anreise nach Absprache'
}

type GuestLead = {
  id: string
  type: 'guest'
  packageSlug: string
  packageName: string
  name: string
  email: string
  phone: string
  preferredChannel: 'email'
  selectedDate: string
  guests?: string
  adults?: string
  children?: string
  childrenAges?: string
  dog?: string
  occasion?: string
  whatsappOptIn: boolean
  message?: string
  status: LeadStatus
  source?: LeadSource
  campaign?: string
  lossReason?: LeadLossReason
  conversionNote?: string
  createdAt: string
  internalNote?: string
  followUpAt?: string
  reservationExpiresAt?: string
  paymentDueAt?: string
  checkInStatus?: 'offen' | 'vorbereitet' | 'freigegeben'
  experienceStatus?: 'offen' | 'angefragt' | 'bestätigt'
  archivedAt?: string
  updatedAt?: string
  isTest?: boolean
}

type OwnerLead = {
  id: string
  type: 'owner'
  name: string
  email: string
  phone: string
  propertyLocation: string
  propertyType: string
  sleeps: string
  currentRental: 'self' | 'agency' | 'platforms' | 'not-yet'
  listingUrl?: string
  message?: string
  status: LeadStatus
  source?: LeadSource
  campaign?: string
  lossReason?: LeadLossReason
  conversionNote?: string
  createdAt: string
  internalNote?: string
  followUpAt?: string
  archivedAt?: string
  updatedAt?: string
  isTest?: boolean
}

type ExperienceLead = {
  id: string
  type: 'experience'
  name: string
  email: string
  phone: string
  businessName: string
  location: string
  experienceType: string
  link?: string
  description: string
  audienceFit: 'Familien' | 'Paare' | 'Beide'
  message?: string
  status: LeadStatus
  source?: LeadSource
  campaign?: string
  lossReason?: LeadLossReason
  conversionNote?: string
  createdAt: string
  internalNote?: string
  followUpAt?: string
  archivedAt?: string
  updatedAt?: string
  isTest?: boolean
}

type StoredLead = GuestLead | OwnerLead | ExperienceLead
type LeadSource = 'Meta Ads' | 'Google' | 'Ratgeber' | 'Direkt' | 'Empfehlung' | 'Partner' | 'Sonstiges'
type LeadLossReason = 'Termin passt nicht' | 'Preis' | 'Unterkunft passt nicht' | 'Erlebnis passt nicht' | 'Keine Rückmeldung' | 'Anders gebucht' | 'Nicht qualifiziert' | 'Sonstiges'
type AdminSection = 'overview' | 'leads' | 'tasks' | 'guestSupport' | 'customers' | 'bookings' | 'packages' | 'experiences' | 'localPlaces' | 'owners' | 'agencies' | 'experienceProviders'
type BookingStatus = 'Reserviert' | 'Bezahlt' | 'Vor Anreise' | 'Aktiv' | 'Abgeschlossen' | 'Storniert'
type GuestAppView = 'home' | 'booking' | 'local' | 'help'
type GuestSupportCategory = 'general' | 'arrival' | 'property' | 'experience' | 'local'
type CustomerTypeFilter = CustomerProfile['guestType'] | 'all'
type CustomerPhaseFilter = 'all' | 'request' | 'booking' | 'due'
type BookingStatusFilter = BookingStatus | 'all'
type BookingPackageFilter = string | 'all'
type TaskStatusFilter = AdminTaskStatus | 'all'
type TaskReferenceFilter = AdminTaskReferenceType | 'support' | 'all'
type TaskPriorityFilter = AdminTaskPriority | 'all'
type AdminTaskStatus = 'open' | 'in_progress' | 'done'
type AdminTaskPriority = 'low' | 'medium' | 'high'
type AdminTaskReferenceType = 'lead' | 'booking' | 'package' | 'experience' | 'localPlace' | 'owner' | 'experienceProvider'
type AdminTask = {
  id: string
  title: string
  referenceType: AdminTaskReferenceType
  referenceId: string
  referenceLabel: string
  dueAt: string
  status: AdminTaskStatus
  priority: AdminTaskPriority
  note?: string
  createdAt: string
  completedAt?: string
}
type TaskReferenceOption = {
  value: string
  type: AdminTaskReferenceType
  id: string
  label: string
}
type LeadTypeFilter = 'all' | StoredLead['type']
type LeadScopeFilter = 'active' | 'archived'
type LeadWorkFilter = 'all' | 'due' | 'new' | 'review'
type PackageAudienceFilter = 'all' | Audience
type PackageStatusFilter = 'all' | PackageStatus
type ExperienceRoleFilter = 'all' | ExperienceRole
type ExperienceConfirmationFilter = 'all' | MorrowPackage['experienceItems'][number]['confirmationStatus']
type ExperiencePackageFilter = 'all' | MorrowPackage['id']
type ExperienceProviderFilter = 'all' | 'none' | ExperienceProviderProfile['id']
type ExperienceProviderStatusFilter = ExperienceProviderStatus | 'all'
type LocalPlaceCategoryFilter = LocalPlaceCategory | 'all'
type LocalPlaceStatusFilter = LocalPlaceStatus | 'all'
type LocalPlaceReviewFilter = 'all' | 'needsReview' | 'ready' | 'visible' | 'rejected'
type RawSpoImportKind = 'event' | 'bookable-experience'
type RawSpoEventCandidate = {
  id: string
  title: string
  date?: string
  dateLabel?: string
  place?: string
  town?: string
  groups?: string[]
  themes?: string[]
  description?: string
  detailUrl?: string
  sourceUrl?: string
  imageUrl?: string
  imageAlt?: string
  lat?: number
  lng?: number
  hasMoreDates?: boolean
}
type ExperienceProviderStatus = 'lead' | 'in-review' | 'partner' | 'paused'
type OwnerPropertyStatusFilter = OwnerPropertyStatus | 'all'
type AgencyStatusFilter = AgencyStatus | 'all'
type ExperienceProviderProfile = {
  id: string
  name: string
  contactName: string
  email: string
  phone: string
  location: string
  category: string
  audienceFit: 'Familien' | 'Paare' | 'Beide'
  status: ExperienceProviderStatus
  notes: string
}
type OwnerPropertyStatus = 'lead' | 'in-review' | 'active' | 'paused'
type OwnerPropertyProfile = {
  id: string
  name: string
  ownerName: string
  email: string
  phone: string
  location: string
  propertyType: string
  sleeps: number
  status: OwnerPropertyStatus
  currentRental: OwnerLead['currentRental']
  checkInType: Stay['checkInType']
  latestArrival: string
  notes: string
}
type AgencyStatus = 'lead' | 'active' | 'paused'
type AgencyProfile = {
  id: string
  name: string
  contactName: string
  email: string
  phone: string
  location: string
  status: AgencyStatus
  managedPropertyIds: string[]
  responseDueDays: number
  availableDatesNote: string
  notes: string
}
type CustomerProfile = {
  id: string
  name: string
  email: string
  phone: string
  preferredChannel: 'email'
  whatsappOptIn: boolean
  guestType: 'Familie' | 'Paar'
  requests: GuestLead[]
  primaryLeadId?: string
  customerType?: 'guest'
  notes?: string
  isTest?: boolean
}
type BookingProfile = {
  id: string
  leadId?: string
  customerId?: string
  customerName: string
  email: string
  phone: string
  packageName: string
  packageSlug: string
  packageItem?: MorrowPackage
  selectedDate: string
  status: BookingStatus
  paymentStatus: 'Offen' | 'Bezahlt'
  guests?: string
  dog?: string
  reservationExpiresAt?: string
  paymentDueAt?: string
  followUpAt?: string
  internalNote?: string
  checkInStatus?: GuestLead['checkInStatus']
  experienceStatus?: GuestLead['experienceStatus']
  isTest?: boolean
}
type GuestStayAccessPayload = {
  booking?: unknown
  package?: MorrowPackage
}
type GuestPreparationItem = {
  id: string
  label: string
  detail: string
  done: boolean
  taskTitle: string
}
type DetailRow = { label: string; value?: string | boolean; kind?: 'email' | 'phone' | 'url' }

type EmailEvent = {
  id: string
  lead_id: string | null
  event_type: string
  recipient: string
  status: string
  error_message?: string | null
  created_at: string
}

type CommunicationEvent = {
  id: string
  lead_id?: string | null
  leadId?: string
  booking_id?: string | null
  bookingId?: string
  customer_id?: string | null
  customerId?: string
  channel: 'email' | 'whatsapp' | 'phone' | 'support' | 'note'
  direction: 'inbound' | 'outbound' | 'internal'
  event_type?: string
  eventType?: string
  subject?: string | null
  body?: string | null
  recipient?: string | null
  actor?: string | null
  status: string
  provider?: string | null
  provider_message_id?: string | null
  providerMessageId?: string
  payload?: Record<string, unknown>
  created_at: string
  updated_at?: string
}

const slugify = (value: string) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')

const leadStatuses: LeadStatus[] = ['Neu', 'In Prüfung', 'Kontaktiert', 'Reserviert', 'Bezahlt', 'Vor Anreise', 'Aktiv', 'Abgeschlossen', 'Storniert', 'Kein Interesse']
const storageKey = 'morrow-phase-1-leads'
const adminPackageStorageKey = 'morrow-admin-packages'
const adminExperienceProviderStorageKey = 'morrow-admin-experience-providers'
const adminOwnerPropertyStorageKey = 'morrow-admin-owner-properties'
const adminTaskStorageKey = 'morrow-admin-tasks'
const adminAgencyStorageKey = 'morrow-admin-agencies'
const adminCustomerStorageKey = 'morrow-admin-customers'
const adminBookingStorageKey = 'morrow-admin-bookings'
const guestStayUnlockedStatuses: LeadStatus[] = ['Bezahlt', 'Vor Anreise', 'Aktiv', 'Abgeschlossen']

const isGuestStayUnlocked = (status: LeadStatus) => guestStayUnlockedStatuses.includes(status)

const guestAccessCode = ({ id, email }: Pick<GuestLead, 'id' | 'email'>) => {
  const source = `${id}:${email.toLowerCase()}`
  let hash = 0

  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0
  }

  return Math.abs(hash).toString(36).padStart(6, '0').slice(0, 6).toUpperCase()
}

const guestStayHref = ({ id, email }: Pick<GuestLead, 'id' | 'email'>) => (
  `/deine-auszeit/${id}?code=${guestAccessCode({ id, email })}`
)

const bookingPaymentStatus = (status: LeadStatus | BookingStatus) => (
  ['Bezahlt', 'Vor Anreise', 'Aktiv', 'Abgeschlossen'].includes(status) ? 'Bezahlt' : 'Offen'
) as BookingProfile['paymentStatus']

const bookingSyncStatuses: LeadStatus[] = ['Reserviert', 'Bezahlt', 'Vor Anreise', 'Aktiv', 'Abgeschlossen', 'Storniert']

const shouldSyncBookingFromLead = (lead: StoredLead): lead is GuestLead => (
  lead.type === 'guest' && bookingSyncStatuses.includes(lead.status)
)

const customerPayloadFromLead = (lead: GuestLead): CustomerProfile => ({
  id: lead.id,
  primaryLeadId: lead.id,
  customerType: 'guest',
  name: lead.name,
  email: lead.email,
  phone: lead.phone,
  preferredChannel: 'email',
  whatsappOptIn: Boolean(lead.whatsappOptIn),
  guestType: lead.packageSlug === 'family-escape' ? 'Familie' : 'Paar',
  requests: [lead],
  notes: lead.internalNote,
  isTest: Boolean(lead.isTest),
})

const bookingPayloadFromLead = (lead: GuestLead, packageItem?: MorrowPackage | null) => ({
  id: lead.id,
  type: 'guest',
  leadId: lead.id,
  customerId: lead.id,
  packageId: packageItem?.id ?? lead.packageSlug,
  packageSlug: lead.packageSlug,
  packageName: lead.packageName,
  name: lead.name,
  customerName: lead.name,
  email: lead.email,
  phone: lead.phone,
  selectedDate: lead.selectedDate,
  status: lead.status,
  paymentStatus: bookingPaymentStatus(lead.status).toLowerCase(),
  guestAccessCode: isGuestStayUnlocked(lead.status) ? guestAccessCode(lead) : undefined,
  guests: lead.guests,
  dog: lead.dog,
  reservationExpiresAt: lead.reservationExpiresAt,
  paymentDueAt: lead.paymentDueAt,
  followUpAt: lead.followUpAt,
  checkInStatus: lead.checkInStatus,
  experienceStatus: lead.experienceStatus,
  internalNote: lead.internalNote,
  isTest: Boolean(lead.isTest),
  updatedAt: lead.updatedAt,
  createdAt: lead.createdAt,
})

const normalizeDateLabel = (value: string) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[–—]/g, '-')
  .replace(/[.\s]+/g, '')

const packageIncludesDate = (packageItem: MorrowPackage | undefined, selectedDate: string) => {
  if (!packageItem || !selectedDate) return false
  const normalizedSelectedDate = normalizeDateLabel(selectedDate)
  return packageItem.dates.some((date) => normalizeDateLabel(date) === normalizedSelectedDate)
}

const normalizeStoredCustomer = (customer: CustomerProfile, leads: StoredLead[]): CustomerProfile => {
  const matchingRequests = leads
    .filter((lead): lead is GuestLead => (
      lead.type === 'guest'
      && (
        lead.id === customer.primaryLeadId
        || lead.email.toLowerCase() === customer.email.toLowerCase()
      )
    ))
    .sort((a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime())

  return {
    ...customer,
    preferredChannel: 'email',
    whatsappOptIn: Boolean(customer.whatsappOptIn),
    guestType: customer.guestType ?? (matchingRequests[0]?.packageSlug === 'family-escape' ? 'Familie' : 'Paar'),
    requests: matchingRequests.length > 0 ? matchingRequests : customer.requests ?? [],
    isTest: Boolean(customer.isTest || matchingRequests.some((request) => request.isTest)),
  }
}

const normalizeStoredBooking = (
  booking: BookingProfile,
  adminPackages: MorrowPackage[],
  leads: StoredLead[],
): BookingProfile => {
  const linkedLead = leads.find((lead): lead is GuestLead => (
    lead.type === 'guest' && (lead.id === booking.leadId || lead.id === booking.id)
  ))
  const packageItem = adminPackages.find((pkg) => (
    pkg.slug === booking.packageSlug
    || pkg.name === booking.packageName
    || pkg.id === booking.packageItem?.id
  ))
  const rawPaymentStatus = String(booking.paymentStatus ?? linkedLead?.status ?? '').toLowerCase()

  return {
    ...booking,
    id: booking.id,
    leadId: booking.leadId ?? linkedLead?.id ?? booking.id,
    customerId: booking.customerId ?? linkedLead?.id,
    customerName: booking.customerName ?? linkedLead?.name ?? 'Gast',
    email: booking.email ?? linkedLead?.email ?? '',
    phone: booking.phone ?? linkedLead?.phone ?? '',
    packageName: booking.packageName ?? linkedLead?.packageName ?? packageItem?.name ?? 'Auszeit',
    packageSlug: booking.packageSlug ?? linkedLead?.packageSlug ?? packageItem?.slug ?? '',
    packageItem,
    selectedDate: booking.selectedDate ?? linkedLead?.selectedDate ?? '',
    status: (booking.status ?? linkedLead?.status ?? 'Reserviert') as BookingStatus,
    paymentStatus: rawPaymentStatus === 'bezahlt' ? 'Bezahlt' : 'Offen',
    guests: booking.guests ?? linkedLead?.guests,
    dog: booking.dog ?? linkedLead?.dog,
    reservationExpiresAt: booking.reservationExpiresAt ?? linkedLead?.reservationExpiresAt,
    paymentDueAt: booking.paymentDueAt ?? linkedLead?.paymentDueAt,
    followUpAt: booking.followUpAt ?? linkedLead?.followUpAt,
    internalNote: booking.internalNote ?? linkedLead?.internalNote,
    checkInStatus: booking.checkInStatus ?? linkedLead?.checkInStatus,
    experienceStatus: booking.experienceStatus ?? linkedLead?.experienceStatus,
    isTest: Boolean(booking.isTest || linkedLead?.isTest),
  }
}

const normalizeGuestStayAccessBooking = (
  rawBooking?: unknown,
): GuestLead | null => {
  const booking = rawBooking as (Partial<GuestLead> & Partial<BookingProfile>) | null | undefined
  if (!booking?.id) return null
  const now = new Date().toISOString()
  const status = (booking.status ?? 'Bezahlt') as LeadStatus

  return {
    id: booking.leadId ?? booking.id,
    type: 'guest',
    status,
    name: booking.name ?? booking.customerName ?? 'Gast',
    email: booking.email ?? '',
    phone: booking.phone ?? '',
    packageName: booking.packageName ?? 'Auszeit',
    packageSlug: booking.packageSlug ?? '',
    selectedDate: booking.selectedDate ?? '',
    adults: '',
    children: '',
    childAges: '',
    guests: booking.guests,
    dog: booking.dog,
    preferredChannel: 'email',
    whatsappOptIn: false,
    source: 'Direkt',
    checkInStatus: booking.checkInStatus,
    experienceStatus: booking.experienceStatus,
    internalNote: booking.internalNote,
    createdAt: booking.createdAt ?? now,
    updatedAt: booking.updatedAt ?? now,
  } as GuestLead
}

const bookingGuestPreparationItems = ({
  paymentStatus,
  selectedDate,
  checkInStatus,
  experienceStatus,
  packageItem,
}: Pick<BookingProfile, 'paymentStatus' | 'selectedDate' | 'checkInStatus' | 'experienceStatus' | 'packageItem'>): GuestPreparationItem[] => {
  const includedExperiences = packageItem?.experienceItems.filter((experience) => experience.role === 'included') ?? []
  const confirmedIncludedExperiences = includedExperiences.filter((experience) => experience.confirmationStatus === 'confirmed')
  const dateMatchesPackage = packageIncludesDate(packageItem, selectedDate)
  const experienceConfirmed = experienceStatus === 'bestätigt'

  return [
    {
      id: 'payment',
      label: 'Zahlung verbindlich',
      detail: paymentStatus === 'Bezahlt' ? 'Bezahlt oder vor Anreise bestätigt.' : 'Ohne Zahlung bleibt der Gästebereich geschlossen.',
      done: paymentStatus === 'Bezahlt',
      taskTitle: 'Zahlung für Gästebereich klären',
    },
    {
      id: 'stay',
      label: 'Unterkunft verbunden',
      detail: packageItem?.stay.name ?? 'Unterkunft fehlt noch in der Auszeit.',
      done: Boolean(packageItem?.stay.name),
      taskTitle: 'Unterkunft für Buchung final verbinden',
    },
    {
      id: 'date',
      label: 'Termin passt zur Auszeit',
      detail: dateMatchesPackage ? selectedDate : 'Termin prüfen oder in der Auszeit ergänzen.',
      done: dateMatchesPackage,
      taskTitle: 'Termin in Auszeit prüfen',
    },
    {
      id: 'checkin',
      label: 'Anreise & Schlüssel freigegeben',
      detail: checkInStatus === 'freigegeben' ? 'Gast kann die Hinweise nutzen.' : 'Check-in-Hinweise müssen noch final freigegeben werden.',
      done: checkInStatus === 'freigegeben',
      taskTitle: 'Check-in für Gast freigeben',
    },
    {
      id: 'experience',
      label: 'Erlebnis bestätigt',
      detail: experienceConfirmed
        ? confirmedIncludedExperiences.length > 0
          ? confirmedIncludedExperiences.map((experience) => experience.title).join(', ')
          : includedExperiences.length > 0
            ? includedExperiences.map((experience) => experience.title).join(', ')
            : 'In der Buchung bestätigt.'
        : 'Mindestens ein enthaltenes Erlebnis muss bestätigt sein.',
      done: experienceConfirmed,
      taskTitle: 'Erlebnis für Buchung bestätigen',
    },
    {
      id: 'local',
      label: 'Empfehlungen vorbereitet',
      detail: packageItem && packageItem.recommendations.length > 0 ? `${packageItem.recommendations.length} Empfehlungen in der Auszeit hinterlegt.` : 'Empfehlungen für den Aufenthalt fehlen noch.',
      done: Boolean(packageItem && packageItem.recommendations.length > 0),
      taskTitle: 'Empfehlungen für Gästebereich prüfen',
    },
  ]
}

const bookingMissingGuestPreparationItems = (booking: Pick<BookingProfile, 'status' | 'paymentStatus' | 'selectedDate' | 'checkInStatus' | 'experienceStatus' | 'packageItem'>) => {
  if (['Abgeschlossen', 'Storniert'].includes(booking.status)) return []
  return bookingGuestPreparationItems(booking).filter((item) => !item.done)
}

const guestSupportCategoryLabel = (category: GuestSupportCategory) => {
  const labels: Record<GuestSupportCategory, string> = {
    general: 'Allgemeine Frage',
    arrival: 'Anreise oder Schlüssel',
    property: 'Problem in der Unterkunft',
    experience: 'Erlebnis oder Termin',
    local: 'Empfehlung vor Ort',
  }

  return labels[category]
}

const guestSupportPriority = (category: GuestSupportCategory): AdminTaskPriority => (
  category === 'property' || category === 'arrival' ? 'high' : 'medium'
)

const localPlaceIcon = (category: LocalPlaceCategory, size = 18) => {
  if (category === 'food') return <ForkKnifeLine size={size} />
  if (category === 'beach' || category === 'tide') return <WaveLine size={size} />
  if (category === 'weather') return <SunCloudyLine size={size} />
  if (category === 'event') return <CalendarLine size={size} />
  if (category === 'experience') return <SparklesLine size={size} />
  if (category === 'emergency') return <HeartHandLine size={size} />
  if (category === 'service') return <SafeShield2Line size={size} />
  return <LocationLine size={size} />
}

type LiveWeatherData = {
  temperature: number
  apparentTemperature: number
  windSpeed: number
  windGusts: number
  precipitation: number
  weatherCode: number
  updatedAt: string
}

type LiveTidePoint = {
  time: string
  height: number
  type: 'Hochwasser' | 'Niedrigwasser'
}

type LiveTideData = {
  currentHeight: number
  nextPoint: LiveTidePoint | null
  points: LiveTidePoint[]
  updatedAt: string
}

type LiveWeatherDay = {
  date: string
  weatherCode: number
  minTemperature: number
  maxTemperature: number
  precipitationProbability: number
  windSpeed: number
}

type LiveLocalData = {
  weather: LiveWeatherData | null
  weatherDays: LiveWeatherDay[]
  tide: LiveTideData | null
  loading: boolean
  error: string
}

const weatherCodeLabel = (code: number) => {
  if ([0].includes(code)) return 'klar'
  if ([1, 2].includes(code)) return 'leicht bewölkt'
  if ([3].includes(code)) return 'bewölkt'
  if ([45, 48].includes(code)) return 'neblig'
  if ([51, 53, 55, 56, 57].includes(code)) return 'Nieselregen'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Regen'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Schnee'
  if ([95, 96, 99].includes(code)) return 'Gewitter'
  return 'wechselhaft'
}

const formatLiveTime = (value: string) => new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date(value))

const formatLiveDate = (value: string) => new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date(value))

const formatLiveDay = (value: string) => new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
}).format(new Date(`${value}T12:00:00`))

function extractTidePoints(times: string[], heights: number[]) {
  const now = Date.now()
  const points: LiveTidePoint[] = []

  for (let index = 1; index < heights.length - 1; index += 1) {
    const previous = heights[index - 1]
    const current = heights[index]
    const next = heights[index + 1]
    const time = times[index]
    if (typeof current !== 'number' || !time || new Date(time).getTime() < now) continue
    if (current > previous && current > next) points.push({ time, height: current, type: 'Hochwasser' })
    if (current < previous && current < next) points.push({ time, height: current, type: 'Niedrigwasser' })
  }
  return points
}

function useLiveLocalData(): LiveLocalData {
  const [liveData, setLiveData] = useState<LiveLocalData>({
    weather: null,
    weatherDays: [],
    tide: null,
    loading: true,
    error: '',
  })

  useEffect(() => {
    const controller = new AbortController()
    const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=54.31&longitude=8.61&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&forecast_days=14&timezone=Europe%2FBerlin'
    const tideUrl = 'https://marine-api.open-meteo.com/v1/marine?latitude=54.31&longitude=8.61&hourly=sea_level_height_msl&forecast_days=14&timezone=Europe%2FBerlin'

    async function loadLiveData() {
      try {
        const [weatherResponse, tideResponse] = await Promise.all([
          fetch(weatherUrl, { signal: controller.signal }),
          fetch(tideUrl, { signal: controller.signal }),
        ])
        if (!weatherResponse.ok || !tideResponse.ok) throw new Error('Live-Daten nicht erreichbar')

        const weatherJson = await weatherResponse.json()
        const tideJson = await tideResponse.json()
        const tideTimes = Array.isArray(tideJson.hourly?.time) ? tideJson.hourly.time as string[] : []
        const tideHeights = Array.isArray(tideJson.hourly?.sea_level_height_msl) ? tideJson.hourly.sea_level_height_msl as number[] : []
        const nowIndex = tideTimes.findIndex((time) => new Date(time).getTime() >= Date.now())
        const currentTideIndex = Math.max(nowIndex, 0)
        const tidePoints = extractTidePoints(tideTimes, tideHeights)
        const daily = weatherJson.daily ?? {}
        const weatherDays = Array.isArray(daily.time)
          ? (daily.time as string[]).map((date, index) => ({
            date,
            weatherCode: Number(daily.weather_code?.[index] ?? 3),
            minTemperature: Number(daily.temperature_2m_min?.[index] ?? 0),
            maxTemperature: Number(daily.temperature_2m_max?.[index] ?? 0),
            precipitationProbability: Number(daily.precipitation_probability_max?.[index] ?? 0),
            windSpeed: Number(daily.wind_speed_10m_max?.[index] ?? 0),
          }))
          : []

        setLiveData({
          weather: {
            temperature: Number(weatherJson.current?.temperature_2m ?? 0),
            apparentTemperature: Number(weatherJson.current?.apparent_temperature ?? 0),
            windSpeed: Number(weatherJson.current?.wind_speed_10m ?? 0),
            windGusts: Number(weatherJson.current?.wind_gusts_10m ?? 0),
            precipitation: Number(weatherJson.current?.precipitation ?? 0),
            weatherCode: Number(weatherJson.current?.weather_code ?? 3),
            updatedAt: String(weatherJson.current?.time ?? new Date().toISOString()),
          },
          weatherDays,
          tide: {
            currentHeight: Number(tideHeights[currentTideIndex] ?? 0),
            nextPoint: tidePoints[0] ?? null,
            points: tidePoints,
            updatedAt: String(tideTimes[currentTideIndex] ?? new Date().toISOString()),
          },
          loading: false,
          error: '',
        })
      } catch (error) {
        if (controller.signal.aborted) return
        setLiveData({ weather: null, weatherDays: [], tide: null, loading: false, error: error instanceof Error ? error.message : 'Live-Daten nicht erreichbar' })
      }
    }

    loadLiveData()
    return () => controller.abort()
  }, [])

  return liveData
}

const localEventFitSummary = (place: LocalPlaceCandidate) => {
  if (place.category !== 'event') return null

  const audience = place.eventAudience ? localEventAudienceLabels[place.eventAudience] : 'Zielgruppe offen'
  const setting = place.eventSetting ? localEventSettingLabels[place.eventSetting] : 'Setting offen'
  const date = place.eventStartDate ? `${place.eventStartDate}${place.eventEndDate && place.eventEndDate !== place.eventStartDate ? ` bis ${place.eventEndDate}` : ''}` : 'Datum offen'
  return `${date} · ${audience} · ${setting}`
}

const localPlaceReviewIssues = (place: LocalPlaceCandidate) => {
  const issues: string[] = []

  if (!place.sourceUrl) issues.push('Quelle fehlt')
  if (!place.lat || !place.lng) issues.push('Koordinaten fehlen')
  if (!place.description || place.description.trim().length < 55) issues.push('Beschreibung zu kurz')
  if (!place.routeNote || place.routeNote.trim().length < 35) issues.push('Gästehinweis fehlt')

  if (place.category === 'event') {
    if (!place.eventStartDate) issues.push('Termin fehlt')
    if (!place.eventAudience) issues.push('Zielgruppe offen')
    if (!place.eventSetting) issues.push('Indoor/Outdoor offen')
    if (!place.eventFitNote || place.eventFitNote.trim().length < 45) issues.push('Morrow-Passung fehlt')
  } else if (!place.openingHours) {
    issues.push('Öffnungszeiten fehlen')
  }

  return issues
}

const localPlaceReviewLabel = (place: LocalPlaceCandidate) => {
  const issueCount = localPlaceReviewIssues(place).length
  if (place.status === 'rejected') return 'Nicht passend'
  if (place.status === 'approved' && issueCount === 0) return 'sichtbar bereit'
  if (issueCount === 0) return 'freigabebereit'
  return `${issueCount} Punkte offen`
}

const rawEventAudienceGuess = (event: RawSpoEventCandidate): LocalPlaceCandidate['eventAudience'] => {
  const haystack = `${event.title} ${event.groups?.join(' ')} ${event.themes?.join(' ')} ${event.description}`.toLowerCase()
  if (/famil|kind|jugend|spiel|strandfest|tierpark/.test(haystack)) return 'families'
  if (/yoga|pilates|meditation|wellness|konzert|musik|kunst|lesung|abend/.test(haystack)) return 'couples'
  return 'both'
}

const rawEventSettingGuess = (event: RawSpoEventCandidate): LocalPlaceCandidate['eventSetting'] => {
  const haystack = `${event.title} ${event.groups?.join(' ')} ${event.themes?.join(' ')} ${event.place} ${event.description}`.toLowerCase()
  if (/strand|watt|outdoor|wander|führung|radtour|kite|surf|drachen|natur|park|garten/.test(haystack)) return 'outdoor'
  if (/museum|kirche|haus|hus|theater|workshop|kurs|ausstellung|sauna|therme|yoga|pilates/.test(haystack)) return 'indoor'
  return 'both'
}

const rawSpoImportKind = (event: RawSpoEventCandidate): RawSpoImportKind => {
  const haystack = `${event.title} ${event.place} ${event.groups?.join(' ')} ${event.themes?.join(' ')} ${event.description}`.toLowerCase()
  return /(yoga|kurs|workshop|seminar|reiten|pony|ausritt|fotoshooting|escape game|führung|gefuehrt|geführt|wanderung|wattwanderung|coaching|massage|wellness|kochkurs|tour|training|schule|lesson)/.test(haystack)
    ? 'bookable-experience'
    : 'event'
}

const rawSpoImportKindLabel = (kind: RawSpoImportKind) => (
  kind === 'bookable-experience' ? 'Buchbares Erlebnis' : 'Veranstaltung'
)

const rawSpoExperienceProviderName = (event: RawSpoEventCandidate) => {
  const place = event.place?.trim()
  if (place && !/^(st\.?\s*peter-ording|strand|treffpunkt|seebrücke|erlebnis-hus)$/i.test(place)) return place
  const title = event.title
    .replace(/\s+-\s+täglich.*$/i, '')
    .replace(/^yogakurse\s+(im|bei|am)\s+/i, '')
    .replace(/^(outdoor\s+)?escape game\s+-\s+/i, '')
    .replace(/^fotoshooting\s+(am|im)\s+/i, 'Fotoshooting ')
    .trim()
  return title || 'Neuer Erlebnisanbieter'
}

const rawSpoExperienceCategory = (event: RawSpoEventCandidate) => {
  const haystack = `${event.title} ${event.groups?.join(' ')} ${event.themes?.join(' ')} ${event.description}`.toLowerCase()
  if (/yoga|meditation|achtsamkeit/.test(haystack)) return 'Yoga & Achtsamkeit'
  if (/reit|pony|ausritt/.test(haystack)) return 'Reiten & Tiere'
  if (/foto|shooting/.test(haystack)) return 'Fotoshooting'
  if (/escape/.test(haystack)) return 'Outdoor Escape'
  if (/watt|wanderung|führung|gefuehrt|geführt|tour/.test(haystack)) return 'Geführte Tour'
  if (/wellness|massage|spa/.test(haystack)) return 'Wellness'
  if (/koch|küche|kueche/.test(haystack)) return 'Kochen & Genuss'
  if (/kurs|workshop|seminar|training/.test(haystack)) return 'Kurs & Workshop'
  return 'Erlebnisanbieter'
}

const rawSpoExperienceAudienceFit = (event: RawSpoEventCandidate): ExperienceProviderProfile['audienceFit'] => {
  const audience = rawEventAudienceGuess(event)
  if (audience === 'families') return 'Familien'
  if (audience === 'couples') return 'Paare'
  return 'Beide'
}

const localExperienceFitSummary = (place: LocalPlaceCandidate) => {
  if (place.category !== 'experience') return null

  const audiences = place.audiences?.map((audience) => localExperienceAudienceLabels[audience]).join(', ') || 'Zielgruppe offen'
  const packages = place.packageFit?.map((packageFit) => localExperiencePackageFitLabels[packageFit]).join(', ') || 'Auszeit offen'
  const age = typeof place.ageMin === 'number' ? `ab ${place.ageMin} J.` : 'Alter offen'
  return `${audiences} · ${age} · ${packages}`
}

const initialAgencies: AgencyProfile[] = [
  {
    id: 'agency-kuestenraum',
    name: 'Küstenraum Ferien',
    contactName: 'Janne Petersen',
    email: 'janne.petersen@example.com',
    phone: '+49 4863 101010',
    location: 'Sankt Peter-Ording',
    status: 'active',
    managedPropertyIds: ['nordlicht-lodge'],
    responseDueDays: 2,
    availableDatesNote: 'Freie Termine werden aktuell per E-Mail für Family Escape abgefragt.',
    notes: 'Startagentur für Familienobjekte. Bild- und Beschreibungsmaterial kommt nach Objektfreigabe.',
  },
  {
    id: 'agency-spo-hideaways',
    name: 'SPO Hideaways',
    contactName: 'Lena Martens',
    email: 'lena.martens@example.com',
    phone: '+49 4863 202020',
    location: 'Sankt Peter-Ording Bad',
    status: 'lead',
    managedPropertyIds: ['duenenruhe-suite'],
    responseDueDays: 3,
    availableDatesNote: 'Couple Reset Termine und Hunderegelung final klären.',
    notes: 'Interessant für Couple Reset. Noch keine exklusive Zusammenarbeit.',
  },
]

const initialAdminTasks: AdminTask[] = [
  {
    id: 'task-family-reservation-check',
    title: 'Reservierung mit Unterkunft final bestätigen',
    referenceType: 'booking',
    referenceId: 'test-guest-reserved',
    referenceLabel: 'Miriam Hoffmann · Family Escape',
    dueAt: '2026-05-16',
    status: 'open',
    priority: 'high',
    note: 'Reservierung läuft bald aus. Unterkunft und Erlebnis verbindlich klären.',
    createdAt: '2026-05-12T11:15:00.000Z',
  },
  {
    id: 'task-couple-checkin-send',
    title: 'Check-in-Informationen vorbereiten',
    referenceType: 'booking',
    referenceId: 'test-guest-paid',
    referenceLabel: 'Sophie Krüger · Couple Reset',
    dueAt: '2026-05-20',
    status: 'open',
    priority: 'medium',
    note: 'Vor Anreise Schlüsselhinweise und Dinnerempfehlung senden.',
    createdAt: '2026-05-12T14:25:00.000Z',
  },
]

const initialOwnerProperties: OwnerPropertyProfile[] = [
  {
    id: 'nordlicht-lodge',
    name: 'Nordlicht Lodge',
    ownerName: 'Clara Jensen',
    email: 'clara.jensen@example.com',
    phone: '+49 170 2222222',
    location: 'Sankt Peter-Ording',
    propertyType: 'Ferienhaus',
    sleeps: 4,
    status: 'active',
    currentRental: 'agency',
    checkInType: 'agency_pickup',
    latestArrival: '18:00',
    notes: 'Startobjekt für Family Escape. Bild- und Textrechte liegen vor.',
  },
  {
    id: 'duenenruhe-suite',
    name: 'Dünenruhe Suite',
    ownerName: 'Mika Hansen',
    email: 'mika.hansen@example.com',
    phone: '+49 171 3333333',
    location: 'Sankt Peter-Ording Bad',
    propertyType: 'Apartment',
    sleeps: 2,
    status: 'active',
    currentRental: 'agency',
    checkInType: 'key_safe',
    latestArrival: '22:00',
    notes: 'Startobjekt für Couple Reset. Schlüssel per Safe möglich.',
  },
]

const initialExperienceProviders: ExperienceProviderProfile[] = [
  {
    id: 'provider-watt-wind',
    name: 'Watt & Wind',
    contactName: 'Mara Koch',
    email: 'mara.koch@example.com',
    phone: '+49 175 6666666',
    location: 'Sankt Peter-Ording',
    category: 'Geführte Wattwanderung',
    audienceFit: 'Familien',
    status: 'in-review',
    notes: 'Für Family Escape prüfen. Kapazität und Schlechtwetterregel klären.',
  },
  {
    id: 'provider-nordsee-yoga',
    name: 'Nordsee Yoga Studio',
    contactName: 'Jonas Riedel',
    email: 'jonas.riedel@example.com',
    phone: '+49 176 7777777',
    location: 'Sankt Peter-Ording Bad',
    category: 'Private Yoga Session',
    audienceFit: 'Paare',
    status: 'in-review',
    notes: 'Passt zu Couple Reset. Preislogik und verfügbare Slots klären.',
  },
]

const normalizeExperienceProvider = (provider: Partial<ExperienceProviderProfile>, fallback?: ExperienceProviderProfile): ExperienceProviderProfile => ({
  id: provider.id || fallback?.id || `provider-${crypto.randomUUID()}`,
  name: provider.name || fallback?.name || 'Erlebnisanbieter',
  contactName: provider.contactName || fallback?.contactName || '',
  email: provider.email || fallback?.email || '',
  phone: provider.phone || fallback?.phone || '',
  location: provider.location || fallback?.location || 'Sankt Peter-Ording',
  category: provider.category || fallback?.category || 'Erlebnisanbieter',
  audienceFit: provider.audienceFit || fallback?.audienceFit || 'Beide',
  status: provider.status || fallback?.status || 'lead',
  notes: provider.notes || fallback?.notes || '',
})

const normalizeOwnerProperty = (property: Partial<OwnerPropertyProfile>, fallback?: OwnerPropertyProfile): OwnerPropertyProfile => ({
  id: property.id || fallback?.id || `property-${crypto.randomUUID()}`,
  name: property.name || fallback?.name || 'Objekt',
  ownerName: property.ownerName || fallback?.ownerName || '',
  email: property.email || fallback?.email || '',
  phone: property.phone || fallback?.phone || '',
  location: property.location || fallback?.location || 'Sankt Peter-Ording',
  propertyType: property.propertyType || fallback?.propertyType || 'Objekt',
  sleeps: typeof property.sleeps === 'number' ? property.sleeps : fallback?.sleeps ?? 2,
  status: property.status || fallback?.status || 'lead',
  currentRental: property.currentRental || fallback?.currentRental || 'agency',
  checkInType: property.checkInType || fallback?.checkInType || 'unknown',
  latestArrival: property.latestArrival || fallback?.latestArrival || '',
  notes: property.notes || fallback?.notes || '',
})

const normalizeAgency = (agency: Partial<AgencyProfile>, fallback?: AgencyProfile): AgencyProfile => ({
  id: agency.id || fallback?.id || `agency-${crypto.randomUUID()}`,
  name: agency.name || fallback?.name || 'Agentur',
  contactName: agency.contactName || fallback?.contactName || '',
  email: agency.email || fallback?.email || '',
  phone: agency.phone || fallback?.phone || '',
  location: agency.location || fallback?.location || 'Sankt Peter-Ording',
  status: agency.status || fallback?.status || 'lead',
  managedPropertyIds: Array.isArray(agency.managedPropertyIds) ? agency.managedPropertyIds : fallback?.managedPropertyIds ?? [],
  responseDueDays: typeof agency.responseDueDays === 'number' ? agency.responseDueDays : fallback?.responseDueDays ?? 2,
  availableDatesNote: agency.availableDatesNote || fallback?.availableDatesNote || '',
  notes: agency.notes || fallback?.notes || '',
})

const testLeads: StoredLead[] = [
  {
    id: 'test-guest-family-new',
    type: 'guest',
    packageSlug: 'family-escape',
    packageName: 'Family Escape',
    name: 'Anna Petersen',
    email: 'anna.petersen@example.com',
    phone: '+49 170 1111111',
    preferredChannel: 'email',
    selectedDate: '12.-16. August',
    guests: '4',
    childrenAges: '6 und 9 Jahre',
    dog: 'Nein',
    occasion: 'Familienzeit',
    whatsappOptIn: true,
    message: 'Wir suchen eine entspannte Auszeit mit den Kindern und möchten wissen, ob der Termin noch frei ist.',
    status: 'Neu',
    source: 'Meta Ads',
    campaign: 'Family Escape Hamburg Mai',
    createdAt: '2026-05-14T09:18:00.000Z',
    followUpAt: '2026-05-14',
    internalNote: 'Heute anrufen. Termin passt wahrscheinlich, Rückfrage zum Alter der Kinder.',
  },
  {
    id: 'test-guest-couple-review',
    type: 'guest',
    packageSlug: 'couple-reset',
    packageName: 'Couple Reset',
    name: 'Laura Stein',
    email: 'laura.stein@example.com',
    phone: '+49 171 2222222',
    preferredChannel: 'email',
    selectedDate: '19.-23. August',
    guests: '2',
    childrenAges: '',
    dog: 'Ja, kleiner Hund',
    occasion: 'Jahrestag',
    whatsappOptIn: false,
    message: 'Wir möchten ein paar Tage raus und suchen etwas Ruhiges mit gutem Essen und wenig Planung.',
    status: 'In Prüfung',
    source: 'Ratgeber',
    campaign: 'SPO Paar Auszeit',
    createdAt: '2026-05-13T15:42:00.000Z',
    followUpAt: '2026-05-15',
    internalNote: 'Hund klären. Unterkunft prüfen, danach Rückmeldung per E-Mail.',
  },
  {
    id: 'test-guest-reserved',
    type: 'guest',
    packageSlug: 'family-escape',
    packageName: 'Family Escape',
    name: 'Miriam Hoffmann',
    email: 'miriam.hoffmann@example.com',
    phone: '+49 172 3333333',
    preferredChannel: 'email',
    selectedDate: '19.-23. August',
    guests: '3',
    childrenAges: '4 Jahre',
    dog: 'Nein',
    occasion: 'Kurzurlaub',
    whatsappOptIn: true,
    message: 'Wir sind flexibel, möchten aber gerne eine Unterkunft mit kurzen Wegen.',
    status: 'Reserviert',
    source: 'Meta Ads',
    campaign: 'Family Escape Berlin Mai',
    createdAt: '2026-05-12T11:10:00.000Z',
    followUpAt: '2026-05-16',
    reservationExpiresAt: '2026-05-17',
    paymentDueAt: '2026-05-20',
    checkInStatus: 'offen',
    experienceStatus: 'angefragt',
    internalNote: 'Reservierung halten bis Rückmeldung der Familie.',
  },
  {
    id: 'test-guest-paid',
    type: 'guest',
    packageSlug: 'couple-reset',
    packageName: 'Couple Reset',
    name: 'Sophie Krüger',
    email: 'sophie.krueger@example.com',
    phone: '+49 172 9999999',
    preferredChannel: 'email',
    selectedDate: '12.-16. August',
    guests: '2',
    childrenAges: '',
    dog: 'Nein',
    occasion: 'Geburtstag',
    whatsappOptIn: true,
    message: 'Wir möchten die Auszeit fest machen und haben die Zahlungsinformationen erhalten.',
    status: 'Bezahlt',
    source: 'Empfehlung',
    campaign: 'Direkte Empfehlung',
    createdAt: '2026-05-12T14:20:00.000Z',
    followUpAt: '2026-05-20',
    reservationExpiresAt: '2026-05-15',
    paymentDueAt: '2026-05-18',
    checkInStatus: 'vorbereitet',
    experienceStatus: 'bestätigt',
    internalNote: 'Bezahlt. Vor Anreise Check-in-Informationen und Dinnerempfehlung senden.',
  },
  {
    id: 'test-owner-review',
    type: 'owner',
    name: 'Klaus Meier',
    email: 'klaus.meier@example.com',
    phone: '+49 173 4444444',
    propertyLocation: 'Sankt Peter-Ording Dorf',
    propertyType: 'Ferienhaus',
    sleeps: '4 bis 5 Personen',
    currentRental: 'agency',
    listingUrl: 'https://example.com/nordseehaus',
    message: 'Wir überlegen, unser Haus hochwertiger zu positionieren und suchen eine persönlichere Betreuung.',
    status: 'In Prüfung',
    source: 'Direkt',
    campaign: 'Eigentümerseite',
    createdAt: '2026-05-11T13:25:00.000Z',
    followUpAt: '2026-05-14',
    internalNote: 'Objektbilder und freie Zeiträume anfragen. Potenziell gut für Family Escape.',
  },
  {
    id: 'test-owner-contacted',
    type: 'owner',
    name: 'Sabine Kröger',
    email: 'sabine.kroeger@example.com',
    phone: '+49 174 5555555',
    propertyLocation: 'Tating',
    propertyType: 'Apartment',
    sleeps: '2 Personen',
    currentRental: 'self',
    listingUrl: '',
    message: 'Wir haben eine kleine Wohnung und möchten erstmal verstehen, wie Morrow arbeitet.',
    status: 'Kontaktiert',
    source: 'Empfehlung',
    campaign: 'Eigentümer Gespräch',
    createdAt: '2026-05-10T08:40:00.000Z',
    followUpAt: '2026-05-17',
    internalNote: 'Eher Couple Reset. Erstes Gespräch geführt, Unterlagen folgen.',
  },
  {
    id: 'test-exp-new',
    type: 'experience',
    name: 'Mara Koch',
    email: 'mara.koch@example.com',
    phone: '+49 175 6666666',
    businessName: 'Watt & Wind',
    location: 'Sankt Peter-Ording',
    experienceType: 'Geführte Wattwanderung',
    audienceFit: 'Familien',
    link: 'https://example.com/watt-und-wind',
    description: 'Geführte Touren durch Watt und Salzwiesen, auch für Familien mit Kindern geeignet.',
    message: 'Wir hätten Interesse an einer Kooperation für ausgewählte Familienangebote.',
    status: 'Neu',
    source: 'Partner',
    campaign: 'Erlebnisanbieter Footer',
    createdAt: '2026-05-14T07:50:00.000Z',
    followUpAt: '2026-05-14',
    internalNote: 'Für Family Escape prüfen. Kapazität und Schlechtwetterregel klären.',
  },
  {
    id: 'test-exp-contacted',
    type: 'experience',
    name: 'Jonas Riedel',
    email: 'jonas.riedel@example.com',
    phone: '+49 176 7777777',
    businessName: 'Nordsee Yoga Studio',
    location: 'Sankt Peter-Ording Bad',
    experienceType: 'Private Yoga Session',
    audienceFit: 'Paare',
    link: 'https://example.com/nordsee-yoga',
    description: 'Ruhige Yoga- und Atemsessions für Paare, auch als private Einheit buchbar.',
    message: 'Private Sessions wären bei frühzeitiger Planung möglich.',
    status: 'Kontaktiert',
    source: 'Partner',
    campaign: 'Erlebnisanbieter Direktkontakt',
    createdAt: '2026-05-09T16:20:00.000Z',
    followUpAt: '2026-05-18',
    internalNote: 'Passt zu Couple Reset. Preislogik und verfügbare Slots klären.',
  },
  {
    id: 'test-guest-archived',
    type: 'guest',
    packageSlug: 'couple-reset',
    packageName: 'Couple Reset',
    name: 'Thomas Brandt',
    email: 'thomas.brandt@example.com',
    phone: '+49 177 8888888',
    preferredChannel: 'email',
    selectedDate: '12.-16. August',
    guests: '2',
    childrenAges: '',
    dog: 'Nein',
    occasion: 'Geburtstag',
    whatsappOptIn: false,
    message: 'Hat sich nach Rückfrage gegen den Zeitraum entschieden.',
    status: 'Kein Interesse',
    source: 'Google',
    campaign: 'Couple Reset Geburtstag',
    lossReason: 'Termin passt nicht',
    conversionNote: 'Zeitraum passte nach Rückfrage nicht. Für spätere Termine warm halten.',
    createdAt: '2026-05-07T10:05:00.000Z',
    archivedAt: '2026-05-12T09:00:00.000Z',
    internalNote: 'Archiviert nach Absage. Für späteren Herbst erneut interessant.',
  },
]

const audienceLabel = (audience: MorrowPackage['audience']) => audience === 'families' ? 'Familien' : 'Paare'

const leadSources: LeadSource[] = ['Meta Ads', 'Google', 'Ratgeber', 'Direkt', 'Empfehlung', 'Partner', 'Sonstiges']

const leadLossReasons: LeadLossReason[] = [
  'Termin passt nicht',
  'Preis',
  'Unterkunft passt nicht',
  'Erlebnis passt nicht',
  'Keine Rückmeldung',
  'Anders gebucht',
  'Nicht qualifiziert',
  'Sonstiges',
]

const packageStatusLabel = (status: MorrowPackage['status']) => {
  const labels: Record<MorrowPackage['status'], string> = {
    draft: 'Entwurf',
    published: 'Live',
    paused: 'Pausiert',
  }

  return labels[status]
}

const experienceRoleLabel = (role: MorrowPackage['experienceItems'][number]['role']) => {
  const labels: Record<MorrowPackage['experienceItems'][number]['role'], string> = {
    included: 'Enthalten',
    optional: 'Optional',
    recommendation: 'Empfehlung',
    planned: 'Geplant',
  }

  return labels[role]
}

const experienceConfirmationLabel = (status: MorrowPackage['experienceItems'][number]['confirmationStatus']) => {
  const labels: Record<MorrowPackage['experienceItems'][number]['confirmationStatus'], string> = {
    planned: 'Geplant',
    requested: 'Angefragt',
    confirmed: 'Bestätigt',
  }

  return labels[status]
}

const experienceProviderStatusLabel = (status: ExperienceProviderStatus) => {
  const labels: Record<ExperienceProviderStatus, string> = {
    lead: 'Lead',
    'in-review': 'In Prüfung',
    partner: 'Partner',
    paused: 'Pausiert',
  }

  return labels[status]
}

const ownerPropertyStatusLabel = (status: OwnerPropertyStatus) => {
  const labels: Record<OwnerPropertyStatus, string> = {
    lead: 'Lead',
    'in-review': 'In Prüfung',
    active: 'Aktiv',
    paused: 'Pausiert',
  }

  return labels[status]
}

const currentRentalLabel = (currentRental: OwnerLead['currentRental']) => {
  const labels: Record<OwnerLead['currentRental'], string> = {
    self: 'Eigenverwaltung',
    agency: 'Agentur',
    platforms: 'Plattformen',
    'not-yet': 'Noch nicht vermietet',
  }

  return labels[currentRental]
}

const propertySupportTypeFromRental = (currentRental: OwnerLead['currentRental']): Stay['propertySupportType'] => (
  currentRental === 'agency' ? 'agency' : 'morrow'
)

const taskPriorityLabel = (priority: AdminTaskPriority) => {
  const labels: Record<AdminTaskPriority, string> = {
    low: 'Niedrig',
    medium: 'Normal',
    high: 'Hoch',
  }

  return labels[priority]
}

const taskStatusLabel = (status: AdminTaskStatus) => {
  const labels: Record<AdminTaskStatus, string> = {
    open: 'Offen',
    in_progress: 'In Klärung',
    done: 'Erledigt',
  }

  return labels[status]
}

const emailEventTypeLabel = (eventType: string) => {
  const labels: Record<string, string> = {
    lead_confirmation: 'Bestätigung an Kontakt',
    internal_lead_notification: 'Interne Benachrichtigung',
  }
  return labels[eventType] ?? eventType
}

const emailEventStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    sent: 'Gesendet',
    failed: 'Fehler',
    skipped: 'Übersprungen',
    queued: 'In Warteschlange',
  }
  return labels[status] ?? status
}

const emailEventStatusClass = (status: string) => {
  if (status === 'sent') return 'is-sent'
  if (status === 'failed') return 'is-failed'
  if (status === 'skipped') return 'is-skipped'
  return 'is-pending'
}

const communicationChannelLabel = (channel: CommunicationEvent['channel'] | string) => {
  const labels: Record<string, string> = {
    email: 'E-Mail',
    whatsapp: 'WhatsApp',
    phone: 'Telefon',
    support: 'Support',
    note: 'Notiz',
  }
  return labels[channel] ?? channel
}

const communicationDirectionLabel = (direction: CommunicationEvent['direction'] | string) => {
  const labels: Record<string, string> = {
    inbound: 'Eingang',
    outbound: 'Ausgang',
    internal: 'Intern',
  }
  return labels[direction] ?? direction
}

const formatAdminDateTime = (value: string) => (
  new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
)

const taskReferenceLabel = (referenceType: AdminTaskReferenceType) => {
  const labels: Record<AdminTaskReferenceType, string> = {
    lead: 'Anfrage',
    booking: 'Buchung',
    package: 'Auszeit',
    experience: 'Erlebnis',
    localPlace: 'Vor Ort',
    owner: 'Eigentümer',
    experienceProvider: 'Erlebnisanbieter',
  }

  return labels[referenceType]
}

const isGuestSupportTask = (task: AdminTask) => (
  task.referenceType === 'booking' && task.title.toLowerCase().startsWith('support:')
)

const guestSupportCaseType = (task: AdminTask) => {
  const content = `${task.title} ${task.note ?? ''}`.toLowerCase()
  if (content.includes('unterkunft') || content.includes('kaputt') || content.includes('defekt') || content.includes('heizung') || content.includes('wasser')) return 'Unterkunft / Partner'
  if (content.includes('anreise') || content.includes('schlüssel') || content.includes('schluessel') || content.includes('safe') || content.includes('code')) return 'Morrow Operations'
  if (content.includes('erlebnis') || content.includes('termin') || content.includes('yoga') || content.includes('watt')) return 'Erlebnispartner'
  if (content.includes('empfehlung') || content.includes('restaurant') || content.includes('vor ort')) return 'Morrow Kuration'
  return 'Morrow Support'
}

const guestSupportNextStep = (task: AdminTask) => {
  const type = guestSupportCaseType(task)
  if (task.status === 'done') return 'Fall dokumentiert'
  if (type === 'Unterkunft / Partner') return 'Partner prüfen und Gast einordnen'
  if (type === 'Erlebnispartner') return 'Erlebnispartner klären'
  if (type === 'Morrow Operations') return 'Direkt operativ lösen'
  if (type === 'Morrow Kuration') return 'Empfehlung passend einordnen'
  return 'Gast persönlich beantworten'
}

const agencyStatusLabel = (status: AgencyStatus) => {
  const labels: Record<AgencyStatus, string> = {
    lead: 'Lead',
    active: 'Aktiv',
    paused: 'Pausiert',
  }

  return labels[status]
}

const localPlaceStatusLabel = (status: LocalPlaceStatus) => {
  const labels: Record<LocalPlaceStatus, string> = {
    candidate: 'Kandidat',
    approved: 'Freigegeben',
    paused: 'Pausiert',
    rejected: 'Nicht passend',
  }

  return labels[status]
}

const localExperienceAccessRank = (place: LocalPlace) => {
  if (place.category !== 'experience') return 99
  if (place.experienceAccess === 'included') return 0
  if (place.experienceAccess === 'free-local') return 1
  if (place.experienceAccess === 'bookable') return 2
  if (place.experienceAccess === 'recommendation') return 3
  if (place.meta.toLowerCase().includes('enthalten')) return 0
  return 4
}

const localPlaceQuickFacts = (place: LocalPlace) => {
  const facts: { label: string; value: string; icon: ReactNode }[] = []

  if (place.category === 'experience') {
    if (place.experienceAccess) {
      facts.push({ label: 'Art', value: localExperienceAccessLabels[place.experienceAccess], icon: <SparklesLine size={16} /> })
    }
    if (place.audiences?.length) {
      facts.push({
        label: 'Geeignet für',
        value: place.audiences.map((audience) => localExperienceAudienceLabels[audience]).join(', '),
        icon: <GroupLine size={16} />,
      })
    }
    if (place.setting) {
      facts.push({ label: 'Setting', value: localExperienceSettingLabels[place.setting], icon: <Home3Line size={16} /> })
    }
    if (typeof place.weatherDependent === 'boolean') {
      facts.push({ label: 'Wetter', value: place.weatherDependent ? 'Wetterabhängig' : 'Wetterunabhängig', icon: <SunCloudyLine size={16} /> })
    }
    if (place.ageNote) {
      facts.push({ label: 'Alter', value: place.ageNote, icon: <HeartHandLine size={16} /> })
    } else if (typeof place.ageMin === 'number') {
      facts.push({ label: 'Alter', value: place.ageMin === 0 ? 'Für Kinder geeignet' : `ab ${place.ageMin} Jahren`, icon: <HeartHandLine size={16} /> })
    }
  }

  if (place.category === 'food' && place.priceLevel) {
    facts.push({ label: 'Preisgefühl', value: localFoodPriceLevelLabels[place.priceLevel], icon: <ForkKnifeLine size={16} /> })
  }
  if (place.category === 'food' && typeof place.ratingValue === 'number') {
    facts.push({
      label: 'Bewertung',
      value: `${place.ratingValue.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${place.ratingCount ? ` · ${place.ratingCount.toLocaleString('de-DE')}` : ''}`,
      icon: <SparklesLine size={16} />,
    })
  }
  if (place.category === 'food' && place.bestFor?.length) {
    facts.push({ label: 'Passt gut für', value: place.bestFor.slice(0, 2).join(', '), icon: <HeartHandLine size={16} /> })
  }

  return facts.slice(0, 5)
}

const checkInTypeLabel = (type: Stay['checkInType']) => {
  const labels: Record<Stay['checkInType'], string> = {
    key_safe: 'Schlüsselsafe',
    agency_pickup: 'Abholung bei Agentur',
    personal_handover: 'Persönliche Übergabe',
    smartlock: 'Smartlock',
    unknown: 'Noch offen',
  }

  return labels[type]
}

const experienceProviderName = (experience: MorrowPackage['experienceItems'][number]) => (
  experience.providerName?.trim() || 'Partner offen'
)

const emptyGuestForm = {
  name: '',
  email: '',
  phone: '',
  selectedDate: '',
  guests: '2',
  adults: '2',
  children: '0',
  childrenAges: '',
  dog: 'unknown',
  occasion: '',
  whatsappOptIn: false,
  message: '',
}

function App() {
  const [leads, setLeads] = useState<StoredLead[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) as StoredLead[] : []
    } catch {
      return []
    }
  })

  const path = window.location.pathname
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), [])
  const isAdmin = searchParams.get('admin') === '1' || path === '/admin'
  const adminDemoBypass = import.meta.env.DEV && searchParams.get('admin_demo') === '1'
  const localQaBypass = import.meta.env.DEV && searchParams.get('qa_local') === '1'
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery'))
  const [adminSession, setAdminSession] = useState<SupabaseSession | null>(null)
  const [adminSessionChecked, setAdminSessionChecked] = useState(!isSupabaseConfigured || adminDemoBypass)
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(adminDemoBypass ? { email: 'demo@morrow.local', role: 'demo', status: 'active', name: 'Lokale Demo' } : null)
  const [adminProfileChecked, setAdminProfileChecked] = useState(!isSupabaseConfigured || adminDemoBypass)

  useEffect(() => {
    if (searchParams.get('seed') !== 'test-leads') return
    setLeads(testLeads)
    localStorage.setItem(storageKey, JSON.stringify(testLeads))
    window.history.replaceState({}, '', path || '/admin')
  }, [path, searchParams])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return

    let cancelled = false

    supabase.auth.getSession()
      .then(({ data }) => {
        if (cancelled) return
        setAdminSession(data.session)
        setAdminSessionChecked(true)
        if (!data.session) {
          setAdminProfile(null)
          setAdminProfileChecked(true)
        }
      })
      .catch((error) => {
        console.warn('Morrow admin session check failed.', error)
        if (!cancelled) setAdminSessionChecked(true)
      })

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setAdminSession(session)
      setAdminSessionChecked(true)
      if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true)
      if (!session) {
        setAdminProfile(null)
        setAdminProfileChecked(true)
      } else {
        setAdminProfileChecked(false)
      }
    })

    return () => {
      cancelled = true
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || adminDemoBypass) return
    if (!adminSession) return

    let cancelled = false
    setAdminProfileChecked(false)

    fetchAdminProfile()
      .then((profile) => {
        if (cancelled) return
        setAdminProfile(profile)
        setAdminProfileChecked(true)
      })
      .catch((error) => {
        console.warn('Morrow admin profile check failed.', error)
        if (!cancelled) {
          setAdminProfile(null)
          setAdminProfileChecked(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [adminDemoBypass, adminSession])

  useEffect(() => {
    if (searchParams.get('seed') === 'test-leads') return
    if (adminDemoBypass) return
    if (!isAdmin || !adminProfile) return

    let cancelled = false

    fetchStoredLeads<StoredLead>()
      .then((remoteLeads) => {
        if (cancelled || !remoteLeads || remoteLeads.length === 0) return
        setLeads(remoteLeads)
        localStorage.setItem(storageKey, JSON.stringify(remoteLeads))
      })
      .catch((error) => {
        console.warn('Morrow backend lead sync failed. Falling back to local storage.', error)
      })

    return () => {
      cancelled = true
    }
  }, [adminDemoBypass, adminProfile, isAdmin, searchParams])

  const saveLeads = (nextLeads: StoredLead[]) => {
    setLeads(nextLeads)
    localStorage.setItem(storageKey, JSON.stringify(nextLeads))
  }

  const inferLeadSource = (): Pick<StoredLead, 'source' | 'campaign'> => {
    const rawSource = (searchParams.get('utm_source') ?? searchParams.get('source') ?? '').toLowerCase()
    const rawCampaign = searchParams.get('utm_campaign') ?? searchParams.get('campaign') ?? ''
    let source: LeadSource = 'Direkt'

    if (['meta', 'facebook', 'instagram', 'fb', 'ig'].some((value) => rawSource.includes(value))) source = 'Meta Ads'
    else if (rawSource.includes('google')) source = 'Google'
    else if (rawSource.includes('ratgeber') || rawSource.includes('blog')) source = 'Ratgeber'
    else if (rawSource.includes('partner')) source = 'Partner'
    else if (rawSource.includes('referral') || rawSource.includes('empfehlung')) source = 'Empfehlung'
    else if (rawSource) source = 'Sonstiges'

    return {
      source,
      campaign: rawCampaign || undefined,
    } as Pick<StoredLead, 'source' | 'campaign'>
  }

  const addLead = (lead: StoredLead) => {
    const nextLead = { ...inferLeadSource(), ...lead } as StoredLead
    saveLeads([nextLead, ...leads])
    if (localQaBypass) return
    void upsertStoredLead(nextLead).catch((error) => {
      console.warn('Morrow backend lead insert failed. Local state is still available.', error)
    })
    void sendLeadNotification(nextLead).catch((error) => {
      console.warn('Morrow lead email notification failed. Lead was still saved.', error)
    })
  }

  const syncAdminLeadUpdate = (lead: StoredLead) => {
    if (!adminProfile || adminDemoBypass || localQaBypass) return
    void updateStoredLead(lead).catch((error) => {
      console.warn('Morrow backend lead update failed. Local state was updated.', error)
    })
    if (shouldSyncBookingFromLead(lead)) {
      const packageItem = packages.find((pkg) => pkg.slug === lead.packageSlug || pkg.name === lead.packageName) ?? null
      void upsertStoredCustomer(customerPayloadFromLead(lead)).catch((error) => {
        console.warn('Morrow backend customer sync failed. Lead state was updated.', error)
      })
      void upsertStoredBooking(bookingPayloadFromLead(lead, packageItem)).catch((error) => {
        console.warn('Morrow backend booking sync failed. Lead state was updated.', error)
      })
    }
  }

  const updateStatus = (id: string, status: LeadStatus) => {
    let changedLead: StoredLead | null = null
    const nextLeads = leads.map((lead) => {
      if (lead.id !== id) return lead
      changedLead = { ...lead, status, updatedAt: new Date().toISOString() } as StoredLead
      return changedLead
    })
    saveLeads(nextLeads)
    if (changedLead) syncAdminLeadUpdate(changedLead)
  }
  const updateLead = (id: string, updates: Partial<StoredLead>) => {
    let changedLead: StoredLead | null = null
    const nextLeads = leads.map((lead) => {
      if (lead.id !== id) return lead
      changedLead = { ...lead, ...updates, updatedAt: new Date().toISOString() } as StoredLead
      return changedLead
    })
    saveLeads(nextLeads)
    if (changedLead) syncAdminLeadUpdate(changedLead)
  }
  const createSupportTask = (lead: GuestLead, category: GuestSupportCategory, message: string) => {
    let currentTasks: AdminTask[]
    try {
      const savedTasks = localStorage.getItem(adminTaskStorageKey)
      currentTasks = savedTasks ? JSON.parse(savedTasks) as AdminTask[] : initialAdminTasks
    } catch {
      currentTasks = initialAdminTasks
    }
    const taskId = `task-${crypto.randomUUID()}`
    const nextTask: AdminTask = {
      id: taskId,
      title: `Support: ${guestSupportCategoryLabel(category)}`,
      referenceType: 'booking',
      referenceId: lead.id,
      referenceLabel: `${lead.name} · ${lead.packageName}`,
      dueAt: todayIsoValue(),
      status: 'open',
      priority: guestSupportPriority(category),
      note: message,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem(adminTaskStorageKey, JSON.stringify([nextTask, ...currentTasks]))
    void createStoredSupportMessage({
      id: `support-${crypto.randomUUID()}`,
      leadId: lead.id,
      taskId,
      category,
      message,
      createdAt: nextTask.createdAt,
    }).catch((error) => {
      console.warn('Morrow backend support message save failed. Local task is still available.', error)
    })
  }
  const archiveLead = (id: string) => {
    let changedLead: StoredLead | null = null
    const nextLeads = leads.map((lead) => {
      if (lead.id !== id) return lead
      changedLead = { ...lead, archivedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as StoredLead
      return changedLead
    })
    saveLeads(nextLeads)
    if (changedLead) syncAdminLeadUpdate(changedLead)
  }
  const deleteLead = (id: string) => {
    saveLeads(leads.filter((lead) => lead.id !== id))
    if (!adminProfile || adminDemoBypass || localQaBypass) return
    void deleteStoredLead(id).catch((error) => {
      console.warn('Morrow backend lead delete failed. Local state was updated.', error)
    })
  }

  if (isAdmin) {
    if (!adminSessionChecked || !adminProfileChecked) return <AdminAuthLoading />
    if (isSupabaseConfigured && !adminSession && !adminDemoBypass) return <AdminLogin />
    if (isSupabaseConfigured && adminSession && isPasswordRecovery && !adminDemoBypass) {
      return <AdminPasswordUpdate onDone={() => {
        setIsPasswordRecovery(false)
        window.history.replaceState({}, '', '/admin')
      }} />
    }
    if (isSupabaseConfigured && adminSession && !adminProfile && !adminDemoBypass) {
      return <AdminAccessDenied email={adminSession.user.email} onSignOut={() => { void supabase?.auth.signOut() }} />
    }
    const activeSupabase = supabase
    const adminSignOut = isSupabaseConfigured && activeSupabase
      ? () => {
        void activeSupabase.auth.signOut()
      }
      : undefined

    return (
      <AdminPage
        leads={leads}
        onArchive={archiveLead}
        onDelete={deleteLead}
        onStatus={updateStatus}
        onUpdateLead={updateLead}
        adminEmail={adminProfile?.email ?? adminSession?.user.email}
        authMode={isSupabaseConfigured && !adminDemoBypass ? 'supabase' : 'local'}
        onSignOut={adminSignOut}
      />
    )
  }

  const guestStayMatch = path.match(/^\/deine-auszeit\/([^/]+)/)
  if (guestStayMatch) {
    const storedLead = leads.find((item): item is GuestLead => item.type === 'guest' && item.id === guestStayMatch[1])
    const demoLead = testLeads.find((item): item is GuestLead => item.type === 'guest' && item.id === guestStayMatch[1])
    const lead = storedLead ?? demoLead ?? null
    return <GuestStayPage lead={lead} accessCode={searchParams.get('code') ?? ''} onCreateSupportTask={createSupportTask} />
  }

  const packageMatch = path.match(/^\/(?:auszeiten|pakete)\/([^/]+)/)
  if (packageMatch) {
    const item = packages.find((pkg) => pkg.slug === packageMatch[1])
    return item ? <PackagePage item={item} onLead={addLead} /> : <NotFound />
  }

  if (path === '/ratgeber') return <GuideIndex />

  const articleMatch = path.match(/^\/ratgeber\/([^/]+)/)
  if (articleMatch) {
    const article = articles.find((item) => item.slug === articleMatch[1])
    return article ? <ArticlePage article={article} /> : <NotFound />
  }

  if (path === '/eigentuemer') return <OwnerPage onLead={addLead} />
  if (path === '/partner/erlebnisanbieter') return <ExperiencePartnerPage onLead={addLead} />
  if (path === '/impressum') return <ImprintPage />
  if (path === '/datenschutz') return <PrivacyPage />

  if (path === '/') return <HomePage />

  return <NotFound />
}

function Shell({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className={dark ? 'site-shell dark-shell' : 'site-shell'}>
      <Header />
      {children}
      <Footer />
    </div>
  )
}

function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Morrow Startseite">
        <img src="/brand/logos/wordmark/morrow-logomark-offblack.svg" alt="Morrow" />
      </a>
      <nav className={open ? 'site-nav open' : 'site-nav'} aria-label="Hauptnavigation">
        {navItems.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>
        ))}
      </nav>
      <a className="header-cta" href="/#auszeiten">Auszeit planen</a>
      <button className="menu-button" type="button" onClick={() => setOpen(!open)} aria-label="Navigation">
        {open ? <CloseLine size={20} /> : <MenuLine size={20} />}
      </button>
    </header>
  )
}

function HomePage() {
  return (
    <Shell>
      <main>
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="kicker">Sankt Peter-Ording</p>
            <h1>Urlaub am Meer, der sich von Anfang an vorbereitet anfühlt.</h1>
            <p>
              Ausgewählte Unterkunft, lokales Erlebnis und persönliche Betreuung.
              Damit aus wenigen Tagen in Sankt Peter-Ording eine vorbereitete Auszeit wird.
            </p>
            <div className="hero-cues" aria-label="Was Morrow vorbereitet">
              <span><Home3Line size={17} /> Unterkunft</span>
              <span><SparklesLine size={17} /> Erlebnis</span>
              <span><HeartHandLine size={17} /> Betreuung</span>
            </div>
            <div className="hero-actions">
              <a className="button primary" href="#auszeiten">Auszeit planen <ArrowRightLine size={18} /></a>
            </div>
          </div>
          <div className="hero-media">
            <img className="hero-photo-main" src="/brand/generated/morrow-spo-hero-people-boardwalk.png" alt="Menschen gehen gemeinsam durch die Dünen in Sankt Peter-Ording" />
            <figure className="hero-photo-card hero-photo-stay">
              <img src="/brand/generated/morrow-spo-arrival-detail.png" alt="Vorbereiteter Ankommensmoment in einer Unterkunft an der Nordsee" />
              <figcaption>Ankommen vorbereitet</figcaption>
            </figure>
            <figure className="hero-photo-card hero-photo-moment">
              <img src="/brand/generated/morrow-spo-hero-people-table.png" alt="Menschen teilen einen ruhigen Moment in einer Unterkunft an der Nordsee" />
              <figcaption>Zeit zusammen</figcaption>
            </figure>
            <span className="brand-mark" aria-hidden="true">
              <img src="/brand/logos/icon/morrow-icon-offwhite.svg" alt="" />
            </span>
          </div>
          <div className="hero-picks" aria-label="Auszeit-Einstiege">
            {packages.map((pkg) => (
              <a key={pkg.id} href={`/auszeiten/${pkg.slug}`}>
                <span>{pkg.audience === 'families' ? 'Für Familien' : 'Für Paare'}</span>
                <strong>{pkg.name}</strong>
                <small>{pkg.shortPromise}</small>
              </a>
            ))}
          </div>
        </section>

        <section className="section intro-grid brand-panel" id="ort">
          <div>
            <p className="kicker">Warum Morrow</p>
            <h2>Urlaub soll nicht mit Sucharbeit beginnen.</h2>
          </div>
          <div className="principles">
            <Principle icon={<Home3Line />} title="Eine Unterkunft, die wirklich passt" text="Ihr seht ein konkretes Objekt, das zu eurer Auszeit passt. Nicht irgendeine Ferienwohnung aus einer langen Liste." />
            <Principle icon={<SparklesLine />} title="Ein Erlebnis, das dazugehört" text="Ein lokaler Moment ist bereits mitgedacht, damit aus ein paar Tagen am Meer mehr wird als eine Übernachtung." />
            <Principle icon={<HeartHandLine />} title="Ein Aufenthalt, der begleitet wird" text="Nach eurer Anfrage prüfen wir Termin, Unterkunft und Erlebnis und melden uns persönlich mit dem nächsten Schritt." />
          </div>
        </section>

        <section className="section package-band" id="auszeiten">
          <div className="section-heading">
            <p className="kicker">Auszeiten</p>
            <h2>Zwei Auszeiten. Ein Ort. Alles vorbereitet.</h2>
            <p>Für Familien, die leichter gemeinsame Zeit finden wollen. Für Paare, die kurz raus möchten und länger etwas davon haben.</p>
          </div>
          <div className="package-grid">
            {packages.map((pkg) => <PackageCard key={pkg.id} item={pkg} />)}
          </div>
        </section>

        <section className="section journey-section">
          <div className="section-heading">
            <p className="kicker">Von Gefühl bis Anfrage</p>
            <h2>In wenigen Schritten zu einer vorbereiteten Auszeit.</h2>
          </div>
          <div className="journey-grid">
            <Principle icon={<SparklesLine />} title="Auszeit wählen" text="Ihr entscheidet nach dem Gefühl, das zu euch passt: gemeinsame Familienzeit oder ruhige Tage zu zweit." />
            <Principle icon={<CalendarLine />} title="Termin anfragen" text="Ihr wählt einen der vorbereiteten Termine und sendet eure Anfrage mit wenigen Angaben ab." />
            <Principle icon={<HeartHandLine />} title="Persönlich abstimmen" text="Wir prüfen Unterkunft, Erlebnis und offene Details und melden uns persönlich mit dem nächsten Schritt." />
          </div>
        </section>

        <section className="editorial-split">
          <img src="/brand/generated/morrow-spo-local-orientation.png" alt="Dünen, Strand, Pfahlbau und vorbereitete Orientierung in Sankt Peter-Ording" />
          <div>
            <p className="kicker">Lokal kuratiert</p>
            <h2>SPO soll sich vorbereitet anfühlen.</h2>
            <p>
              Der weite Strand, die Dünen, ein guter Abend, ein Plan für raues Wetter und Orte,
              die zu euch passen: Morrow verbindet lokale Entscheidungen zu einem Aufenthalt, der leichter beginnt.
            </p>
            <a className="text-link" href="/ratgeber">Ratgeber lesen <ArrowRightLine size={16} /></a>
          </div>
        </section>

        <section className="section guide-teaser brand-panel light">
          <div className="section-heading">
            <p className="kicker">Ratgeber</p>
            <h2>Erst Orientierung. Dann Vorfreude.</h2>
            <p>Unsere Ratgeber sind keine beliebigen Reisetipps. Sie helfen euch zu verstehen, welche Art von Zeit in SPO zu euch passt.</p>
          </div>
          <div className="article-grid">
            {articles.map((article) => <ArticleCard key={article.slug} article={article} compact />)}
          </div>
        </section>

        <section className="section owner-teaser">
          <div>
            <p className="kicker">Für Eigentümer</p>
            <h2>Ein gutes Objekt verdient mehr als eine Liste.</h2>
          </div>
          <div>
            <p>
              Morrow positioniert passende Unterkünfte als Teil kuratierter Aufenthalte:
              mit klarer Zielgruppe, besserer Geschichte und persönlicherem Gästeerlebnis.
            </p>
            <div className="owner-points" aria-label="Vorteile für Eigentümer">
              <span>Premium-Positionierung</span>
              <span>Passende Zielgruppen</span>
              <span>Persönliche Betreuung</span>
            </div>
            <a className="button primary" href="/eigentuemer">Immobilie vorstellen</a>
          </div>
        </section>

        <section className="final-cta">
          <img src="/brand/generated/morrow-spo-final-family.png" alt="Familie geht durch die Dünen zum Strand in Sankt Peter-Ording" />
          <div>
            <p className="kicker">Auszeit planen</p>
            <h2>Bereit für ein paar Tage, die vorbereitet beginnen?</h2>
            <p>
              Wählt die Auszeit, die zu euch passt. Wir prüfen Termin, Unterkunft und Erlebnis
              persönlich und melden uns mit dem nächsten Schritt.
            </p>
            <a className="button primary" href="/#auszeiten">Auszeit ansehen <ArrowRightLine size={18} /></a>
          </div>
        </section>
      </main>
    </Shell>
  )
}

function PackageCard({ item }: { item: MorrowPackage }) {
  return (
    <article className="package-card">
      <a href={`/auszeiten/${item.slug}`} aria-label={`${item.name} ansehen`}>
        <img src={item.heroImage} alt="" />
        <div className="package-card-content">
          <p className="kicker">{item.location}</p>
          <h3>{item.name}</h3>
          <p>{item.shortPromise}</p>
          <dl>
            <div><dt>Preis</dt><dd>{item.priceFrom}</dd></div>
            <div><dt>Termine</dt><dd>{item.dates.length}</dd></div>
          </dl>
          <span className="text-link">Auszeit ansehen <ArrowRightLine size={16} /></span>
        </div>
      </a>
    </article>
  )
}

function recommendationCategoryLabel(category: MorrowPackage['recommendations'][number]['category']) {
  const labels = {
    food: 'Essen',
    nature: 'Natur',
    weather: 'Wetter',
    family: 'Familie',
    couple: 'Paarzeit',
    service: 'Service',
  }

  return labels[category]
}

function formatSummaryDates(dates: string[]) {
  return dates.map((date) => date.replace('August', 'Aug.')).join(' / ')
}

function formatCheckInInfo(stay: Stay) {
  return `Anreise ${stay.earliestArrival}-${stay.latestArrival}. Abreise bis ${stay.checkOutTime}.`
}

function formatKeyInfo(stay: Stay) {
  const keyInfo = {
    agency_pickup: 'Schlüsselabholung über die Partneragentur. Die genaue Adresse bekommt ihr nach Bestätigung.',
    key_safe: 'Schlüsselsafe am Objekt. Den Code bekommt ihr nach bestätigter Buchung.',
    personal_handover: 'Persönliche Übergabe nach Abstimmung.',
    smartlock: 'Smartlock-Zugang. Die Freigabe bekommt ihr vor Anreise.',
    unknown: 'Die konkreten Details bekommt ihr nach bestätigter Buchung.',
  }

  return keyInfo[stay.checkInType]
}

function formatGuestKeyInfo(stay: Stay) {
  const keyInfo: Record<Stay['checkInType'], string> = {
    agency_pickup: 'Schlüsselabholung über die Partneragentur. Die genaue Adresse wird vor Anreise freigegeben.',
    key_safe: 'Schlüsselsafe am Objekt. Den Code findet ihr hier, sobald er vor Anreise freigegeben ist.',
    personal_handover: 'Persönliche Übergabe nach Abstimmung.',
    smartlock: 'Smartlock-Zugang. Die Freigabe findet ihr hier vor Anreise.',
    unknown: 'Die konkreten Schlüsselhinweise werden vor Anreise ergänzt.',
  }

  return keyInfo[stay.checkInType]
}

function guestExperienceStatus(experience?: MorrowPackage['experienceItems'][number]) {
  if (!experience) return 'Details folgen vor Anreise.'
  if (experience.confirmationStatus === 'confirmed') return `${experienceProviderName(experience)} · bestätigt`
  return `${experienceProviderName(experience)} · Details folgen vor Anreise`
}

function PackagePage({ item, onLead }: { item: MorrowPackage; onLead: (lead: StoredLead) => void }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isFamily = item.slug === 'family-escape'
  const storyImage = isFamily
    ? '/brand/generated/morrow-spo-family-plan-boardwalk.png'
    : '/brand/generated/morrow-spo-local-orientation.png'
  const regionImage = isFamily
    ? '/brand/generated/morrow-spo-local-orientation.png'
    : '/brand/generated/morrow-spo-final-boardwalk.png'
  const experienceSectionImage = isFamily
    ? '/brand/generated/morrow-spo-final-boardwalk.png'
    : '/brand/generated/morrow-spo-final-boardwalk.png'
  const heroExperienceImage = isFamily
    ? '/brand/generated/morrow-spo-final-family.png'
    : '/brand/generated/morrow-spo-final-boardwalk.png'
  const includedExperience = item.experienceItems.find((experience) => experience.role === 'included')
  const supportingExperiences = item.experienceItems.filter((experience) => experience.role !== 'included')
  const detail = isFamily
    ? {
        heroTitle: 'Vier Tage Nordsee, die sich nach echter Familienzeit anfühlen.',
        heroLead: 'Unterkunft, Naturerlebnis und Orientierung vor Ort sind vorbereitet, damit ihr ankommt und nicht erst planen müsst.',
        storyAlt: 'Familie auf dem Weg durch die Dünen in Sankt Peter-Ording',
        storyKicker: 'Das Gefühl',
        storyTitle: 'Ein paar Tage, die sich leichter anfühlen.',
        storyLead: 'Nicht alles suchen. Nicht alles abstimmen. Einfach wissen, dass Unterkunft, erster Naturmoment und Orientierung vor Ort zusammenpassen.',
        storyCues: ['Ankommen ohne Sucherei', 'Raus ans Meer', 'Zeit füreinander'],
        regionTitle: 'Der Ort gibt euch Weite. Wir machen daraus eine vorbereitete Auszeit.',
        regionLead: 'Die Region ist stark für Familien, wenn ihr nicht jeden Tag neu entscheiden müsst. Deshalb verbinden wir Strand, Wetter, Wege und passende Pausen zu einer Auszeit, die vor Ort leicht bleibt.',
        regionAlt: 'Dünen und Pfahlbau in Sankt Peter-Ording',
        regionPoints: [
          ['Weite ohne Tagesplan', 'Strand und Dünen geben euch Raum, ohne dass jeder Moment geplant sein muss.'],
          ['Kurze Entscheidungen', 'Ihr bekommt Orientierung für Wege, Pausen und Wetter, statt vor Ort neu zu suchen.'],
          ['Nordsee, wie sie ist', 'Wenn Wind oder Regen drehen, habt ihr passende Alternativen bereits im Blick.'],
        ],
        rhythmTitle: 'Kein fester Plan. Eher ein Rahmen, der euch trägt.',
        rhythmLead: 'Family Escape soll nicht jeden Moment verplanen. Es gibt euch genug Struktur, damit ihr nicht suchen müsst, und genug Freiheit, damit Familienzeit entstehen kann.',
        rhythmImage: '/brand/generated/morrow-spo-arrival-detail.png',
        rhythmAlt: 'Vorbereiteter Ankommensmoment für eine Familienauszeit in Sankt Peter-Ording',
        rhythmCaptionTitle: 'Gut vorbereitet',
        rhythmCaption: 'Wenn Wetter, Hunger oder Fragen auftauchen, habt ihr passende Hinweise bereits griffbereit.',
        rhythmSteps: [
          ['Ankommen', 'Ihr wisst, wohin ihr fahrt, wie ihr ankommt und was für den ersten Abend wichtig ist.'],
          ['Raus ans Meer', 'Strand, Dünen und ein Naturmoment geben der Auszeit den ersten gemeinsamen Rahmen.'],
          ['Zeit lassen', 'Es gibt Orientierung, aber genug Raum, damit Eltern und Kinder ihren eigenen Rhythmus finden.'],
        ],
        stayLead: 'Die Unterkunft ist bewusst als Basis für diese Auszeit gewählt: hell, ruhig und nah genug an Strand und Ortsleben, damit ihr nicht jeden Weg neu planen müsst.',
        experienceTitle: 'Ein Naturmoment, der zu euch passt.',
        experienceLead: 'Wir planen keinen vollen Stundenplan. Zur Auszeit gehört ein bewusst ausgewählter Moment draußen: Watt, Wind, Weite und genug Ruhe, damit Kinder entdecken können und Eltern nicht organisieren müssen.',
        experienceAlt: 'Blick durch die Dünen auf Strand und Pfahlbau in Sankt Peter-Ording',
        recommendationTitle: 'Damit ihr nicht erst suchen müsst, wenn ihr angekommen seid.',
        recommendationLead: 'Zur Auszeit gehören wenige, passende Hinweise für euren Familienrhythmus: Strandzeit, Wetterwechsel und ein entspannter erster Abend.',
        recommendationImage: '/brand/generated/morrow-spo-local-family-orientation.png',
        recommendationAlt: 'Familie orientiert sich an den Dünen in Sankt Peter-Ording',
        recommendationCaption: 'Wir geben euch Orientierung, ohne euren Aufenthalt mit Programmpunkten zu überladen.',
        closingStoryImage: '/brand/generated/morrow-spo-family-final-moment.png',
        closingStoryAlt: 'Familie geht durch die Dünen zurück vom Strand in Sankt Peter-Ording',
        closingStoryTitle: 'Ein paar Tage, die sich vorbereitet anfühlen und trotzdem frei bleiben.',
        closingStoryLead: 'Family Escape soll euch nicht mit Programmpunkten füllen. Es soll euch den Druck nehmen, damit aus Unterkunft, Nordsee und Erlebnis echte gemeinsame Zeit wird.',
        closingImageAlt: 'Familie erlebt Watt und Weite in Sankt Peter-Ording',
        closingImageTitle: 'Watt, Wind und weite Wege',
        closingImageCaption: 'Ein Erlebnis ist nicht der volle Plan. Es ist der Moment, der der Auszeit Richtung gibt.',
        closingTitle: 'Ein Aufenthalt, der nicht organisiert wirkt, obwohl vieles vorbereitet ist.',
        closingMoments: [
          ['Langsam starten', 'Morgens kein Programm suchen. Erst ankommen, frühstücken, Wind hören und schauen, wonach euch ist.'],
          ['Raus in die Weite', 'Strand, Dünen und Watt werden nicht zur To-do-Liste, sondern zu Momenten, die ihr gemeinsam erlebt.'],
          ['Zurück in den Rückzugsort', 'Nach draußen wartet eine Unterkunft, die nicht nur Schlafplatz ist, sondern euer ruhiger Rahmen.'],
        ],
        trustKicker: 'Was Familien sich wünschen',
        trustTitle: 'Urlaub soll nicht mit Planung beginnen.',
        trustLead: 'Für viele Familien geht es nicht um noch mehr Auswahl. Es geht um Sicherheit, dass Unterkunft, Erlebnis und Ort zusammenpassen und sich die gemeinsame Zeit leicht anfühlt.',
        requestLead: 'Erzählt uns kurz, welcher Termin zu euch passt. Wir schauen, ob Unterkunft, Erlebnis und eure Familie gut zusammenfinden.',
        testimonials: [
          ['Anna & Elias mit Mila und Theo', 'Wir wünschen uns Urlaub, bei dem wir nicht alles selbst zusammensuchen müssen. Wir wollen ankommen und wissen: Das passt für uns.'],
          ['Laura & Ben mit Frieda', 'Am schönsten ist es, wenn die Kinder etwas erleben und wir als Eltern trotzdem das Gefühl haben, runterzukommen.'],
        ],
        testimonialImages: [
          {
            src: '/brand/generated/morrow-spo-family-testimonial-dunes.png',
            alt: 'Familie läuft durch die Dünen zum Strand in Sankt Peter-Ording',
          },
          {
            src: '/brand/generated/morrow-spo-family-testimonial-family-b.png',
            alt: 'Andere Familie läuft gemeinsam durch die Dünen von Sankt Peter-Ording',
          },
        ],
      }
    : {
        heroTitle: 'Ein paar Tage raus aus dem Alltag. Nur ihr zwei und die Nordsee.',
        heroLead: 'Unterkunft, ruhiger Erlebnisbaustein und gute Empfehlungen sind vorbereitet, damit aus wenigen Tagen echte Paarzeit werden kann.',
        storyAlt: 'Paar blickt bei Sonnenuntergang auf die Nordsee in Sankt Peter-Ording',
        storyKicker: 'Das Gefühl',
        storyTitle: 'Kurz weg. Und trotzdem länger bei euch ankommen.',
        storyLead: 'Nicht noch eine Reise organisieren. Sondern Abstand bekommen, durchatmen und wieder spüren, wie gut gemeinsame Zeit sein kann.',
        storyCues: ['Abstand vom Alltag', 'Zeit zu zweit', 'Ruhig vorbereitet'],
        regionTitle: 'Sankt Peter-Ording gibt euch Abstand. Wir machen daraus eine ruhige Auszeit.',
        regionLead: 'Weite, Wind und lange Wege helfen, aus dem Alltag herauszukommen. Morrow verbindet Ort, Unterkunft und passende Momente so, dass ihr nicht erst planen müsst, bevor Erholung beginnt.',
        regionAlt: 'Sankt Peter-Ording bei warmem Abendlicht mit Blick auf Strand und Pfahlbau',
        regionPoints: [
          ['Weite für zwei', 'Strand und Horizont schaffen Abstand, ohne dass ihr euren Tag durchplanen müsst.'],
          ['Ruhige Momente', 'Spaziergang, Dinner oder Wellness werden nicht zur Liste, sondern zu einem passenden Rahmen.'],
          ['Ankommen ohne Druck', 'Ihr bekommt Orientierung für Wege, Wetter und erste Entscheidungen, damit die Auszeit leicht beginnt.'],
        ],
        rhythmTitle: 'Kein voller Plan. Eher ein paar gute Anker für euch zwei.',
        rhythmLead: 'Couple Reset soll nicht romantisch überladen wirken. Es soll euch entlasten, Raum geben und die wenigen Tage so vorbereiten, dass sie länger nachwirken.',
        rhythmImage: '/brand/generated/morrow-spo-arrival-detail.png',
        rhythmAlt: 'Vorbereiteter Ankommensmoment für eine Paarauszeit in Sankt Peter-Ording',
        rhythmCaptionTitle: 'Ankommen vorbereitet',
        rhythmCaption: 'Die wichtigsten Hinweise liegen bereit, damit euer erster Abend nicht mit Suchen beginnt.',
        rhythmSteps: [
          ['Abstand nehmen', 'Ihr kommt an, legt den Alltag ab und müsst nicht erst entscheiden, was jetzt alles passieren soll.'],
          ['Gemeinsam raus', 'Ein Spaziergang, ein ruhiger Moment am Wasser oder ein Erlebnisbaustein gibt der Auszeit Richtung.'],
          ['Zeit behalten', 'Zwischen Unterkunft, Essen und Erlebnis bleibt genug Raum, damit es sich nicht getaktet anfühlt.'],
        ],
        stayLead: 'Die Unterkunft ist bewusst als ruhige Basis gewählt: nah am Wasser, reduziert im Gefühl und passend für zwei Menschen, die ein paar Tage Abstand suchen.',
        experienceTitle: 'Ein ruhiger Baustein, der euch näher ankommen lässt.',
        experienceLead: 'Wellness, Yoga, gemeinsames Kochen oder ein besonderer Abend sollen nicht euren Aufenthalt füllen. Sie geben euch einen Anlass, bewusst Zeit miteinander zu verbringen.',
        experienceAlt: 'Paar sitzt ruhig bei Sonnenuntergang mit Blick auf die Nordsee',
        recommendationTitle: 'Weniger suchen. Mehr Zeit für den Moment.',
        recommendationLead: 'Zur Auszeit gehören wenige, passende Hinweise für Spaziergänge, Dinner und ruhige Pausen, damit ihr nicht zwischen Optionen hängen bleibt.',
        recommendationImage: '/brand/generated/morrow-spo-local-orientation.png',
        recommendationAlt: 'Vorbereitete Orientierung mit Blick auf Dünen und Pfahlbau in Sankt Peter-Ording',
        recommendationCaption: 'Wir geben euch Orientierung für schöne Momente, ohne aus der Auszeit ein Programm zu machen.',
        closingStoryImage: '/brand/generated/morrow-spo-final-boardwalk.png',
        closingStoryAlt: 'Abendlicher Holzweg durch die Dünen zum Strand in Sankt Peter-Ording',
        closingStoryTitle: 'Ein paar Tage, die nicht viel verlangen und gerade deshalb nachwirken.',
        closingStoryLead: 'Couple Reset soll euch nicht beeindrucken, sondern entlasten. Wenige gute Entscheidungen, ein ruhiger Ort und Zeit, die wieder euch gehört.',
        closingImageAlt: 'Paar erlebt einen ruhigen Moment am Wasser in Sankt Peter-Ording',
        closingImageTitle: 'Raus aus dem Alltag',
        closingImageCaption: 'Ein Erlebnis ist nicht der volle Plan. Es ist der Moment, in dem die Auszeit wirklich beginnt.',
        closingTitle: 'Eine Auszeit, die vorbereitet ist, ohne sich durchgeplant anzufühlen.',
        closingMoments: [
          ['Langsam ankommen', 'Kein Programm nach der Anreise. Erst ankommen, etwas essen, Wind hören und den Tag ausklingen lassen.'],
          ['Zeit zu zweit', 'Ein Erlebnis, ein gutes Dinner oder ein Spaziergang schaffen Nähe, ohne künstlich romantisch zu wirken.'],
          ['Wieder leichter zurück', 'Am Ende soll nicht nur der Ort schön gewesen sein, sondern das Gefühl zwischen euch ruhiger.'],
        ],
        trustKicker: 'Was Paare sich wünschen',
        trustTitle: 'Eine Auszeit soll nicht mit Abstimmung beginnen.',
        trustLead: 'Viele Paare suchen keine perfekte Liste. Sie suchen einen Ort, der Abstand schafft, und einen Rahmen, der gemeinsame Zeit wieder leicht macht.',
        requestLead: 'Erzählt uns kurz, welcher Termin zu euch passt. Wir schauen, ob Unterkunft, Erlebnis und euer Anlass gut zusammenfinden.',
        testimonials: [
          ['Mara & Jonas', 'Wir wollen nicht erst zehn Restaurants, Unterkünfte und Ideen vergleichen. Wir wollen ankommen und merken: Das passt zu uns.'],
          ['Lena & Paul', 'Wenn ein paar Tage sich nicht voll anfühlen, sondern ruhig und gut vorbereitet, bleibt davon viel mehr hängen.'],
        ],
        testimonialImages: [
          {
            src: '/brand/generated/morrow-spo-couple-testimonial-beach-a.png',
            alt: 'Mara und Jonas laufen gemeinsam durch die Dünen am Nordseestrand',
          },
          {
            src: '/brand/generated/morrow-spo-couple-testimonial-beach-b.png',
            alt: 'Lena und Paul sitzen nah beieinander auf einem Holzsteg in den Dünen',
          },
        ],
      }
  const requestSteps = [
    ['Ihr fragt euren Wunschtermin an', 'Kurz, unverbindlich und ohne Checkout. Wir brauchen nur die wichtigsten Angaben.'],
    ['Wir prüfen, ob alles zusammenpasst', 'Termin, Unterkunft und Erlebnis werden persönlich für euch abgestimmt.'],
    ['Ihr bekommt eine klare Rückmeldung', 'Danach entscheidet ihr in Ruhe, ob ihr die Auszeit verbindlich machen möchtet.'],
  ]

  return (
    <Shell>
      <main className="package-page">
        <section className="package-hero">
          <div className="package-hero-copy">
            <p className="kicker">{item.name} · {item.location}</p>
            <h1>{detail.heroTitle}</h1>
            <p>{detail.heroLead}</p>
            <div className="hero-actions">
              <button className="button primary mobile-drawer-trigger" type="button" onClick={() => setDrawerOpen(true)}>
                {item.cta} <ArrowRightLine size={18} />
              </button>
              <a className="button primary desktop-cta" href="#anfrage">{item.cta} <ArrowRightLine size={18} /></a>
              <a className="button secondary" href="#enthalten">Was ist enthalten?</a>
            </div>
          </div>
          <div className="package-hero-media">
            <img className="package-hero-main" src={item.heroImage} alt={`${item.name} in ${item.location}`} />
            <span className="package-audience-pill">{item.audience === 'families' ? 'Für Familien' : 'Für Paare'}</span>
            <figure className="package-hero-card package-hero-stay">
              <img src={item.planImage} alt="Familie kommt an einer vorbereiteten Unterkunft in Sankt Peter-Ording an" />
              <figcaption>Ankommen vorbereitet</figcaption>
            </figure>
            <figure className="package-hero-card package-hero-experience">
              <img src={heroExperienceImage} alt="Familie erlebt eine geführte Naturzeit in Sankt Peter-Ording" />
              <figcaption>Erlebnis inklusive</figcaption>
            </figure>
          </div>
        </section>

        <section className="section package-summary" id="enthalten" aria-label="Auszeit auf einen Blick">
          <p className="summary-label">Auf einen Blick</p>
          <div>
            <span>Preis</span>
            <strong>{item.concretePrice}</strong>
            <p>{item.priceNote}</p>
          </div>
          <div>
            <span>Termine</span>
            <strong>{formatSummaryDates(item.dates)}</strong>
            <p>aus kuratierten Terminen</p>
          </div>
          <div>
            <span>Unterkunft</span>
            <strong>{item.stay.name}</strong>
            <p>{item.stay.sleeps} Personen · {item.stay.bedrooms} Schlafzimmer</p>
          </div>
          <div>
            <span>Erlebnis</span>
            <strong>{item.experienceItems.find((experience) => experience.role === 'included')?.title}</strong>
            <p>in der Auszeit enthalten</p>
          </div>
        </section>

        <section className="image-story-section" aria-label="Gefühl der Auszeit">
          <img src={storyImage} alt={detail.storyAlt} />
          <div className="image-story-copy">
            <p className="kicker">{detail.storyKicker}</p>
            <h2>{detail.storyTitle}</h2>
            <p>{detail.storyLead}</p>
            <div className="story-cues">
              {detail.storyCues.map((cue) => <span key={cue}>{cue}</span>)}
            </div>
          </div>
        </section>

        <section className="section region-section">
          <div className="region-copy">
            <p className="kicker">Sankt Peter-Ording</p>
            <h2>{detail.regionTitle}</h2>
            <p>{detail.regionLead}</p>
            <div className="region-points">
              {detail.regionPoints.map(([title, text]) => (
                <article key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
          <img src={regionImage} alt={detail.regionAlt} />
        </section>

        <section className="section rhythm-section">
          <div className="section-heading">
            <p className="kicker">So könnte eure Auszeit aussehen</p>
            <h2>{detail.rhythmTitle}</h2>
            <p>{detail.rhythmLead}</p>
          </div>
          <div className="rhythm-editorial">
            <figure>
              <img src={detail.rhythmImage} alt={detail.rhythmAlt} />
              <figcaption>
                <span>{detail.rhythmCaptionTitle}</span>
                {detail.rhythmCaption}
              </figcaption>
            </figure>
            <div className="rhythm-moments">
              {detail.rhythmSteps.map(([title, text], index) => (
                <article key={title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section stay-section" id="unterkunft">
          <div className="section-heading">
            <p className="kicker">Euer Rückzugsort</p>
            <h2>{item.stay.name}: ruhig wohnen, schnell am Meer sein.</h2>
            <p>{detail.stayLead}</p>
          </div>
          <div className="stay-layout">
            <div className="image-stack">
              {item.stayImages.map((image) => <img key={image} src={image} alt="" />)}
            </div>
            <div className="stay-facts">
              <p className="stay-facts-intro">Was euch hier hilft</p>
              <Fact icon={<LocationLine />} label="Kurze Wege" value={item.stay.locationNote} />
              <Fact icon={<Home3Line />} label={isFamily ? 'Platz für Familien' : 'Raum für zwei'} value={`${item.stay.sleeps} Personen, ${item.stay.bedrooms} Schlafzimmer`} />
              <Fact icon={<DoorLine />} label="Anreise klar geregelt" value={formatCheckInInfo(item.stay)} />
              <Fact icon={<Key2Line />} label="Schlüssel vorbereitet" value={formatKeyInfo(item.stay)} />
            </div>
          </div>
        </section>

        <section className="experience-section" aria-label="Erlebnis der Auszeit">
          <img src={experienceSectionImage} alt={detail.experienceAlt} />
          <div className="experience-inner">
            <div className="experience-copy">
              <p className="kicker">Das Erlebnis</p>
              <h2>{detail.experienceTitle}</h2>
              <p>{detail.experienceLead}</p>
            </div>
            <div className="experience-panel">
              {includedExperience && (
                <article className="experience-card featured">
                  <span>Inklusive</span>
                  <h3>{includedExperience.title}</h3>
                  <p>{includedExperience.guestNotes}</p>
                </article>
              )}
              <div className="experience-notes">
                {supportingExperiences.map((experience) => (
                  <article key={experience.id}>
                    <span>{experience.role === 'optional' ? 'Optional' : experience.role === 'recommendation' ? 'Für danach' : 'Geplant'}</span>
                    <h3>{experience.title}</h3>
                    <p>{experience.guestNotes}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section recommendation-section">
          <div className="section-heading">
            <p className="kicker">Vor Ort</p>
            <h2>{detail.recommendationTitle}</h2>
            <p>{detail.recommendationLead}</p>
          </div>
          <div className="recommendation-layout">
            <figure className="recommendation-image-card">
              <img src={detail.recommendationImage} alt={detail.recommendationAlt} />
              <figcaption>
                <span>Lokal vorbereitet</span>
                {detail.recommendationCaption}
              </figcaption>
            </figure>
            <div className="recommendation-list">
              {item.recommendations.map((recommendation) => (
                <article key={recommendation.title}>
                  <span>{recommendationCategoryLabel(recommendation.category)}</span>
                  <h3>{recommendation.title}</h3>
                  <p>{recommendation.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="closing-story-section">
          <img src={detail.closingStoryImage} alt={detail.closingStoryAlt} />
          <div className="closing-story-overlay">
            <p className="kicker">Am Ende zählt das Gefühl</p>
            <h2>{detail.closingStoryTitle}</h2>
            <p>{detail.closingStoryLead}</p>
          </div>
        </section>

        <section className="section closing-moments-section">
          <figure className="closing-moments-image">
            <img src={item.experienceImage} alt={detail.closingImageAlt} />
            <figcaption>
              <span>{detail.closingImageTitle}</span>
              {detail.closingImageCaption}
            </figcaption>
          </figure>
          <div className="closing-moments-content">
            <div className="closing-moments-intro">
              <p className="kicker">So kann es sich anfühlen</p>
              <h2>{detail.closingTitle}</h2>
            </div>
            <div className="closing-moment-grid">
              {detail.closingMoments.map(([title, text]) => (
                <article key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section trust-section">
          <div className="trust-heading">
            <p className="kicker">{detail.trustKicker}</p>
            <h2>{detail.trustTitle}</h2>
            <p>{detail.trustLead}</p>
          </div>
          <div className="testimonial-grid-large">
            {detail.testimonials.map(([source, quote], index) => (
              <figure className={index === 0 ? 'featured' : undefined} key={source}>
                <img src={detail.testimonialImages[index].src} alt={detail.testimonialImages[index].alt} />
                <div className="testimonial-content">
                  <span className="testimonial-rating" aria-hidden="true">★★★★★</span>
                  <blockquote>{quote}</blockquote>
                  <figcaption>{source}</figcaption>
                </div>
              </figure>
            ))}
          </div>
        </section>

        <section className="section after-request-section">
          <div className="after-request-copy">
            <p className="kicker">Nach der Anfrage</p>
            <h2>Erst anfragen. Dann in Ruhe entscheiden.</h2>
            <p>
              Die Anfrage ist noch keine Buchung. Wir prüfen Termin, Unterkunft und Erlebnis
              persönlich und melden uns mit einem klaren Vorschlag.
            </p>
            <div className="after-request-pills" aria-label="Hinweise zur Anfrage">
              <span>Unverbindlich</span>
              <span>Persönlich geprüft</span>
              <span>Ohne Sofortzahlung</span>
            </div>
          </div>
          <div className="after-request-steps">
            <p className="after-request-card-label">So geht es weiter</p>
            {requestSteps.map(([title, text], index) => {
              const icons = [CalendarLine, SafeShield2Line, Key2Line]
              const Icon = icons[index]
              return (
                <article key={title}>
                  <Icon />
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="section faq-section">
          <div className="faq-intro">
            <p className="kicker">Fragen</p>
            <h2>Alles, was ihr wissen solltet, bevor ihr anfragt.</h2>
            <p>
              Die Auszeit soll sich leicht anfühlen. Deshalb klären wir die wichtigsten Punkte
              offen, bevor ihr den ersten Schritt macht.
            </p>
          </div>
          <div className="faq-list">
            {item.faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="request-section" id="anfrage">
          <div className="request-copy">
            <p className="kicker">Anfrage</p>
            <h2>Bereit, eure Auszeit anzufragen?</h2>
            <p>{detail.requestLead}</p>
            <div className="request-assurance" aria-label="Hinweise zur Anfrage">
              <span>Unverbindlich</span>
              <span>Persönlich abgestimmt</span>
              <span>Ohne Sofortzahlung</span>
            </div>
          </div>
          <div className="request-form-stack">
            <GuestInquiryForm item={item} onLead={onLead} />
          </div>
        </section>
      </main>
      <MobileInquiryDrawer open={drawerOpen} item={item} onClose={() => setDrawerOpen(false)} onLead={onLead} />
    </Shell>
  )
}

function GuestInquiryForm({ item, onLead, onDone }: { item: MorrowPackage; onLead: (lead: StoredLead) => void; onDone?: () => void }) {
  const isFamilyForm = item.formType === 'family'
  const maxGuests = item.maxGuests ?? item.fixedGuests ?? 8
  const [form, setForm] = useState({
    ...emptyGuestForm,
    selectedDate: item.dates[0],
    guests: item.fixedGuests ? String(item.fixedGuests) : '4',
    adults: item.formType === 'couple' ? '2' : '2',
    children: item.formType === 'couple' ? '0' : '2',
  })
  const [sent, setSent] = useState(false)
  const familyGuestTotal = Number(form.adults || 0) + Number(form.children || 0)
  const familyGuestTotalInvalid = isFamilyForm && familyGuestTotal > maxGuests

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (familyGuestTotalInvalid) {
      window.alert(`Diese Auszeit ist aktuell für maximal ${maxGuests} Personen ausgelegt.`)
      return
    }
    const totalGuests = isFamilyForm
      ? String(Number(form.adults || 0) + Number(form.children || 0))
      : item.fixedGuests ? String(item.fixedGuests) : form.guests

    onLead({
      id: crypto.randomUUID(),
      type: 'guest',
      packageSlug: item.slug,
      packageName: item.name,
      name: form.name,
      email: form.email,
      phone: form.phone,
      preferredChannel: 'email',
      selectedDate: form.selectedDate,
      guests: totalGuests,
      adults: isFamilyForm ? form.adults : '2',
      children: isFamilyForm ? form.children : '0',
      childrenAges: form.childrenAges,
      dog: form.dog,
      occasion: form.occasion,
      whatsappOptIn: form.whatsappOptIn,
      message: form.message,
      status: 'Neu',
      createdAt: new Date().toISOString(),
    })
    setSent(true)
    onDone?.()
  }

  return (
    <form className="form-panel" onSubmit={submit}>
      <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label>E-Mail<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>Telefon<input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
      <label>Termin<select value={form.selectedDate} onChange={(e) => setForm({ ...form, selectedDate: e.target.value })}>{item.dates.map((date) => <option key={date}>{date}</option>)}</select></label>
      {item.formType === 'family' && (
        <>
          <label>Erwachsene<input type="number" min="1" max={maxGuests} value={form.adults} onChange={(e) => setForm({ ...form, adults: e.target.value })} /></label>
          <label>Kinder<input type="number" min="0" max={maxGuests} value={form.children} onChange={(e) => setForm({ ...form, children: e.target.value })} /></label>
          <label>Kinderalter<input required={Number(form.children || 0) > 0} value={form.childrenAges} onChange={(e) => setForm({ ...form, childrenAges: e.target.value })} placeholder="z. B. 4 und 8 Jahre" /></label>
          {familyGuestTotalInvalid && (
            <p className="form-note wide">Diese Auszeit ist aktuell für maximal {maxGuests} Personen ausgelegt.</p>
          )}
        </>
      )}
      {item.formType === 'couple' && (
        <label>Anlass optional<select value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })}>
          <option value="">Bitte wählen</option>
          <option>Jahrestag</option>
          <option>Geburtstag</option>
          <option>Einfach raus aus dem Alltag</option>
          <option>Überraschung</option>
          <option>Anderer Anlass</option>
        </select></label>
      )}
      <label>Hund optional<select value={form.dog} onChange={(e) => setForm({ ...form, dog: e.target.value })}>
        <option value="unknown">Bitte wählen</option>
        <option value="yes">Ja</option>
        <option value="no">Nein</option>
      </select></label>
      <label className="checkbox">
        <input type="checkbox" checked={form.whatsappOptIn} onChange={(e) => setForm({ ...form, whatsappOptIn: e.target.checked })} />
        <span>Wichtige Nachrichten zur Anfrage optional auch per WhatsApp erhalten.</span>
      </label>
      <label className="wide">Nachricht optional<textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} /></label>
      <p className="form-note wide">Mit dem Absenden fragt ihr diese Auszeit unverbindlich an. Danach bekommt ihr eine persönliche Rückmeldung.</p>
      <button className="button primary wide" type="submit">Anfrage senden <ArrowRightLine size={18} /></button>
      {sent && <p className="success-message">Danke. Wir melden uns innerhalb von 24 Stunden persönlich per E-Mail.</p>}
    </form>
  )
}

function MobileInquiryDrawer({ open, item, onClose, onLead }: { open: boolean; item: MorrowPackage; onClose: () => void; onLead: (lead: StoredLead) => void }) {
  return (
    <div className={open ? 'drawer-backdrop open' : 'drawer-backdrop'} aria-hidden={!open}>
      <aside className="mobile-drawer">
        <button className="drawer-close" type="button" onClick={onClose} aria-label="Schließen"><CloseLine size={20} /></button>
        <p className="kicker">{item.name}</p>
        <h2>Auszeit anfragen</h2>
        <p className="drawer-intro">Wählt euren Termin und sendet die wichtigsten Angaben. Die Anfrage ist noch keine Buchung.</p>
        <GuestInquiryForm item={item} onLead={onLead} />
      </aside>
    </div>
  )
}

function GuideIndex() {
  const [featuredArticle, ...secondaryArticles] = articles
  const guideThemes = [
    {
      title: 'Mit Kindern in SPO',
      text: 'Strand, Watt, Wege und Pausen so denken, dass Familien nicht jeden Tag neu planen müssen.',
      icon: <GroupLine />,
    },
    {
      title: 'Zeit zu zweit',
      text: 'Ruhige Orte, gute Anlässe und wenige Entscheidungen für Paare, die Abstand vom Alltag suchen.',
      icon: <HeartHandLine />,
    },
    {
      title: 'Erlebnisse vor Ort',
      text: 'Lokale Ideen, die zu Wetter, Unterkunft und Stimmung passen, statt eine endlose Liste zu werden.',
      icon: <SparklesLine />,
    },
  ]

  return (
    <Shell>
      <main className="guide-page">
        <section className="guide-hero">
          <div className="guide-hero-copy">
            <p className="kicker">Ratgeber</p>
            <h1>Sankt Peter-Ording bewusst planen.</h1>
            <p>
              Antworten auf die Fragen, die vor und während eines Urlaubs an der Nordsee wirklich
              zählen: Ort, Wetter, Erlebnisse, Familienzeit, Paarzeit und gute Entscheidungen vor Ort.
            </p>
            <a className="button primary" href="#ratgeber-artikel">Artikel entdecken <ArrowRightLine size={18} /></a>
          </div>
          <div className="guide-hero-media" aria-label="Sankt Peter-Ording Impressionen">
            <img className="guide-hero-main" src="/brand/generated/morrow-spo-local-orientation.png" alt="Vorbereitete Orientierung mit Blick auf Dünen und Pfahlbau in Sankt Peter-Ording" />
            <img className="guide-hero-small first" src="/brand/generated/morrow-spo-family-watt.png" alt="Familie erlebt eine ruhige Naturzeit im Watt von Sankt Peter-Ording" />
            <img className="guide-hero-small second" src="/brand/generated/morrow-spo-couple-testimonial-beach-b.png" alt="Paar sitzt gemeinsam in den Dünen von Sankt Peter-Ording" />
            <div className="guide-hero-note">
              <span>Orientierung vor Ort</span>
              <p>Auszeiten, Erlebnisse und Hinweise für SPO.</p>
            </div>
          </div>
        </section>

        <section className="guide-theme-strip" aria-label="Ratgeber Themen">
          {guideThemes.map((theme) => (
            <article key={theme.title}>
              {theme.icon}
              <h2>{theme.title}</h2>
              <p>{theme.text}</p>
            </article>
          ))}
        </section>

        <section className="guide-index-section" id="ratgeber-artikel">
          <div className="section-heading">
            <p className="kicker">Aktuelle Artikel</p>
            <h2>Alles, was euren Aufenthalt in SPO leichter macht.</h2>
            <p>
              Wir sammeln Fragen, Ideen und lokale Hinweise rund um Urlaub, Auszeiten,
              Erlebnisse und Sankt Peter-Ording und führen von dort zu passenden Aufenthalten.
            </p>
          </div>
          {featuredArticle && (
            <article className="guide-featured-article">
              <img src={featuredArticle.image} alt="" />
              <div>
                <p className="kicker">Startpunkt</p>
                <h3>{featuredArticle.title}</h3>
                <p>{featuredArticle.description}</p>
                <a className="button primary" href={`/ratgeber/${featuredArticle.slug}`}>
                  Artikel lesen <ArrowRightLine size={18} />
                </a>
              </div>
            </article>
          )}
          <div className="article-grid guide-index-grid">
            {secondaryArticles.map((article) => <ArticleCard key={article.slug} article={article} />)}
          </div>
        </section>
      </main>
    </Shell>
  )
}

function ArticlePage({ article }: { article: typeof articles[number] }) {
  usePageMeta(`${article.title} | Morrow Ratgeber`, article.description, article.image)

  const related = packages.filter((pkg) => article.relatedPackageSlugs.includes(pkg.slug))
  const [quickAnswer, ...articleSections] = article.sections
  const useLongformLayout = articleSections.length > 7
  const insightSections = useLongformLayout ? [] : articleSections.slice(0, 3)
  const narrativeSections = useLongformLayout ? articleSections : articleSections.slice(3)
  const articleContext =
    article.audience === 'families'
      ? {
          image: '/brand/generated/morrow-article-family-arrival-dunes.png',
          alt: 'Familie läuft durch die Dünen von Sankt Peter-Ording Richtung Strand',
          kicker: 'Familienzeit in SPO',
          title: 'Gute Planung heißt nicht, jeden Tag vollzumachen.',
          text: 'Für Familien ist oft entscheidend, dass Unterkunft, Wege, Wetter und ein erster Naturmoment zusammenpassen. Dann bleibt mehr Raum für das, worum es eigentlich geht: gemeinsam am Meer sein.',
        }
      : article.audience === 'couples'
        ? {
            image: '/brand/generated/morrow-article-couple-beach-walk.png',
            alt: 'Paar läuft gemeinsam am Nordseestrand in Sankt Peter-Ording',
            kicker: 'Paarzeit in SPO',
            title: 'Wenige gute Entscheidungen reichen oft.',
            text: 'Für Paare entsteht Erholung nicht durch ein volles Programm, sondern durch einen Ort, der Abstand schafft, und Momente, die ohne viel Abstimmung funktionieren.',
          }
        : {
            image: '/brand/generated/morrow-spo-local-orientation.png',
            alt: 'Vorbereitete Orientierung mit Blick auf Dünen und Pfahlbau in Sankt Peter-Ording',
            kicker: 'Orientierung vor Ort',
            title: 'SPO wird leichter, wenn ihr nicht bei null startet.',
            text: 'Strand, Wetter, Wege und Erlebnisse wirken am besten, wenn sie zusammen gedacht werden. Genau dafür sammelt der Ratgeber lokale Orientierung.',
          }

  return (
    <Shell>
      <main className="article-page">
        <section className="article-hero">
          <div>
            <PageIntro kicker="Ratgeber" title={article.title} text={article.description} />
            <div className="article-meta" aria-label="Artikelinformationen">
              <span>{article.author}</span>
              <span>{formatGermanDate(article.publishedAt)}</span>
              <span>{article.readingTime}</span>
            </div>
          </div>
          <img src={article.image} alt="" />
        </section>

        <article className="article-layout">
          <aside className="article-sidebar">
            <nav className="article-toc" aria-label="Inhaltsverzeichnis">
              <p className="kicker">Inhaltsverzeichnis</p>
              <div>
                {articleSections.map((section) => (
                  <a key={section.title} href={`#${articleSectionId(section.title)}`}>
                    {section.title}
                  </a>
                ))}
              </div>
            </nav>

            <div className="article-side-card">
              <p className="kicker">Artikelinfo</p>
              <p><strong>{article.author}</strong></p>
              <p>{formatGermanDate(article.publishedAt)}</p>
              <p>{article.readingTime}</p>
            </div>
          </aside>

          <div className="article-main-flow">
            {quickAnswer && (
              <section className="article-answer">
                <p className="kicker">Kurz gesagt</p>
                <h2>{quickAnswer.title}</h2>
                <ArticleText body={quickAnswer.body} />
              </section>
            )}

            <nav className="article-toc article-toc-mobile-flow" aria-label="Inhaltsverzeichnis">
              <p className="kicker">Inhaltsverzeichnis</p>
              <div>
                {articleSections.map((section) => (
                  <a key={section.title} href={`#${articleSectionId(section.title)}`}>
                    {section.title}
                  </a>
                ))}
              </div>
            </nav>

            {insightSections.length > 0 && (
              <section className="article-insight-grid" aria-label="Wichtige Hinweise">
                {insightSections.map((section) => (
                  <article key={section.title} id={articleSectionId(section.title)}>
                    <h3>{section.title}</h3>
                    <ArticleText body={section.body} />
                  </article>
                ))}
              </section>
            )}

            <section className="article-context-panel">
              <img src={articleContext.image} alt={articleContext.alt} />
              <div>
                <p className="kicker">{articleContext.kicker}</p>
                <h2>{articleContext.title}</h2>
                <p>{articleContext.text}</p>
              </div>
            </section>

            <div className="article-body">
              {narrativeSections.map((section, index) => (
                <Fragment key={section.title}>
                  <ArticleSection
                    section={section}
                    index={index}
                    audience={article.audience}
                  />

                  {related[0] && index === 2 && (
                    <ArticleInlineCta
                      title="Nicht alles selbst zusammensuchen?"
                      text="Unsere kuratierten Auszeiten verbinden Unterkunft, Erlebnis und Orientierung vor Ort."
                      href={`/auszeiten/${related[0].slug}`}
                      label="Auszeit ansehen"
                    />
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="article-related">
            <div className="section-heading">
              <p className="kicker">Passende Auszeit</p>
              <h2>Wenn ihr nicht alles selbst zusammensuchen möchtet.</h2>
              <p>
                Morrow verbindet Unterkunft, Erlebnis und Orientierung vor Ort zu einer vorbereiteten Auszeit.
              </p>
            </div>
            <div className="package-grid small">
              {related.map((pkg) => <PackageCard key={pkg.id} item={pkg} />)}
            </div>
          </section>
        )}
      </main>
    </Shell>
  )
}

function ArticleInlineCta({
  title,
  text,
  href,
  label,
}: {
  title: string
  text: string
  href: string
  label: string
}) {
  return (
    <aside className="article-inline-cta">
      <div>
        <p className="kicker">Morrow Auszeit</p>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <a className="button primary" href={href}>{label} <ArrowRightLine /></a>
    </aside>
  )
}

function articleVisualFor(audience: typeof articles[number]['audience'], index: number) {
  const familyVisuals = [
    {
      src: '/brand/generated/morrow-article-family-arrival-dunes.png',
      alt: 'Familie kommt entspannt in Sankt Peter-Ording an',
    },
    {
      src: '/brand/generated/morrow-article-family-watt-rest.png',
      alt: 'Familie erlebt gemeinsame Zeit in den Dünen von Sankt Peter-Ording',
    },
    {
      src: '/brand/generated/morrow-article-family-stay-arrival.png',
      alt: 'Familie kommt an einer ruhigen Unterkunft in Sankt Peter-Ording an',
    },
    {
      src: '/brand/generated/morrow-article-family-wide-beach.png',
      alt: 'Ruhiger Familienmoment am Strand von Sankt Peter-Ording',
    },
  ]
  const coupleVisuals = [
    {
      src: '/brand/generated/morrow-article-couple-beach-walk.png',
      alt: 'Paar läuft gemeinsam am Strand von Sankt Peter-Ording',
    },
    {
      src: '/brand/generated/morrow-article-couple-dunes-rest.png',
      alt: 'Paar sitzt ruhig am Nordseestrand in Sankt Peter-Ording',
    },
    {
      src: '/brand/generated/morrow-article-couple-arrival-detail.png',
      alt: 'Ruhiger Ankommensmoment für eine Auszeit am Wasser',
    },
    {
      src: '/brand/generated/morrow-article-couple-table-moment.png',
      alt: 'Ruhiger gemeinsamer Moment am Tisch während einer Auszeit',
    },
  ]
  const bothVisuals = [
    {
      src: '/brand/generated/morrow-spo-local-orientation.png',
      alt: 'Lokale Orientierung mit Blick auf Sankt Peter-Ording',
    },
    {
      src: '/brand/generated/morrow-spo-image-set.png',
      alt: 'Erlebnisse und Nordseemomente in Sankt Peter-Ording',
    },
    {
      src: '/brand/generated/morrow-article-couple-beach-walk.png',
      alt: 'Paar erlebt einen ruhigen Moment am Strand von Sankt Peter-Ording',
    },
    {
      src: '/brand/generated/morrow-article-family-wide-beach.png',
      alt: 'Familienmoment am weiten Strand von Sankt Peter-Ording',
    },
  ]

  const visuals = audience === 'families' ? familyVisuals : audience === 'couples' ? coupleVisuals : bothVisuals
  return visuals[index % visuals.length]
}

function articleSectionVisualFor(
  audience: typeof articles[number]['audience'],
  sectionTitle: string,
  index: number,
) {
  if (audience !== 'both') return articleVisualFor(audience, index)

  const normalizedTitle = sectionTitle.toLowerCase()
  if (normalizedTitle.includes('paare')) return articleVisualFor('couples', 1)
  if (normalizedTitle.includes('familien') || normalizedTitle.includes('kinder')) return articleVisualFor('families', 3)
  return articleVisualFor('both', index)
}

function articleSectionKickerFor(title: string) {
  const normalizedTitle = title.toLowerCase()

  if (normalizedTitle.includes('strand')) return 'Der Strand'
  if (normalizedTitle.includes('wellness') || normalizedTitle.includes('thalasso')) return 'Wellness'
  if (normalizedTitle.includes('dinner') || normalizedTitle.includes('abend') || normalizedTitle.includes('essen')) return 'Abend & Essen'
  if (normalizedTitle.includes('wetter') || normalizedTitle.includes('regen')) return 'Wetter'
  if (normalizedTitle.includes('watt')) return 'Watt & Natur'
  if (normalizedTitle.includes('unterkunft')) return 'Unterkunft'
  if (normalizedTitle.includes('erlebnis') || normalizedTitle.includes('aktivität')) return 'Erlebnisse'
  if (normalizedTitle.includes('familie') || normalizedTitle.includes('kinder')) return 'Familienzeit'
  if (normalizedTitle.includes('paare') || normalizedTitle.includes('zweit')) return 'Paarzeit'
  if (normalizedTitle.includes('ort') || normalizedTitle.includes('spo') || normalizedTitle.includes('sankt peter-ording')) return 'Sankt Peter-Ording'
  if (normalizedTitle.includes('morrow')) return 'Kuratierte Auszeit'

  return 'Orientierung'
}

function ArticleSection({
  section,
  index,
  audience,
}: {
  section: { title: string; body: string }
  index: number
  audience: typeof articles[number]['audience']
}) {
  const id = articleSectionId(section.title)
  const isFaq = section.title.toLowerCase().startsWith('häufige fragen')
  const isChecklist = section.title.toLowerCase().includes('checkliste')
  const isMorrowBridge = section.title.toLowerCase().startsWith('wann morrow')
  const shouldFeature = !isFaq && !isChecklist && !isMorrowBridge && [0, 4].includes(index)
  const visual = articleSectionVisualFor(audience, section.title, Math.floor(index / 2) + 1)

  if (shouldFeature) {
    return (
      <section className="article-feature-section" id={id}>
        <div className="article-feature-copy">
          <p className="kicker">{articleSectionKickerFor(section.title)}</p>
          <h2>{section.title}</h2>
          <ArticleText body={section.body} />
        </div>
        <div className="article-feature-media">
          <img src={visual.src} alt={visual.alt} />
        </div>
      </section>
    )
  }

  if (isChecklist) {
    return <ArticleChecklistSection section={section} id={id} />
  }

  if (isFaq) {
    return <ArticleFaqSection section={section} id={id} />
  }

  if (isMorrowBridge) {
    return <ArticleMorrowBridgeSection section={section} id={id} audience={audience} />
  }

  return (
    <section className="article-text-section" id={id}>
      <p className="kicker">{articleSectionKickerFor(section.title)}</p>
      <h2>{section.title}</h2>
      <ArticleText body={section.body} />
    </section>
  )
}

function ArticleMorrowBridgeSection({
  id,
  audience,
}: {
  section: { title: string; body: string }
  id: string
  audience: typeof articles[number]['audience']
}) {
  const href = audience === 'couples' ? '/auszeiten/couple-reset' : audience === 'both' ? '/#auszeiten' : '/auszeiten/family-escape'
  const ctaLabel = audience === 'both' ? 'Auszeiten ansehen' : 'Auszeit ansehen'
  const visual = articleVisualFor(audience, audience === 'both' ? 0 : 3)
  const title = audience === 'couples'
    ? 'Weniger suchen. Mehr Zeit zu zweit.'
    : audience === 'both'
      ? 'Weniger suchen. Bewusster ankommen.'
      : 'Weniger suchen. Mehr Familienzeit.'
  const intro = audience === 'couples'
    ? 'Unterkunft, ruhiges Erlebnis und Empfehlungen sind bereits zusammen gedacht. Ihr kommt an, habt Orientierung und behaltet freie Zeit.'
    : audience === 'both'
      ? 'Unterkunft, Erlebnis und Empfehlungen sind bereits zusammen gedacht. So entsteht aus vielen Möglichkeiten ein Aufenthalt, der zu euch passt.'
      : 'Unterkunft, lokales Erlebnis und Empfehlungen sind bereits zusammen gedacht. Ihr kommt an, habt Orientierung und behaltet freie Zeit.'
  const points = audience === 'couples'
    ? ['Ausgewählte Unterkunft', 'Ruhiges Erlebnis', 'Orientierung vor Ort']
    : audience === 'both'
      ? ['Ausgewählte Unterkunft', 'Passendes Erlebnis', 'Orientierung vor Ort']
      : ['Ausgewählte Unterkunft', 'Lokales Erlebnis', 'Familienfreundlicher Rahmen']

  return (
    <section className="article-morrow-section" id={id}>
      <div className="article-morrow-media">
        <img src={visual.src} alt={visual.alt} />
      </div>
      <div className="article-morrow-copy">
        <p className="kicker">Kuratierte Auszeit</p>
        <h2>{title}</h2>
        <p>{intro}</p>
        <div className="article-morrow-points" aria-label="Was Morrow verbindet">
          {points.map((point, index) => (
            <span key={point}><strong>{String(index + 1).padStart(2, '0')}</strong>{point}</span>
          ))}
        </div>
        <a className="button primary light" href={href}>{ctaLabel} <ArrowRightLine /></a>
      </div>
    </section>
  )
}

function ArticleFaqSection({ section, id }: { section: { title: string; body: string }; id: string }) {
  const items = section.body.split('\n\n').map((block) => {
    const [question, ...answer] = block.split('\n')
    return { question, answer: answer.join(' ') }
  }).filter((item) => item.question && item.answer)

  return (
    <section className="article-faq-section" id={id}>
      <div className="article-faq-heading">
        <p className="kicker">Gut zu wissen</p>
        <h2>{section.title}</h2>
      </div>
      <div className="article-faq-list">
        {items.map((item) => (
          <details key={item.question} className="article-faq-item">
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function ArticleChecklistSection({ section, id }: { section: { title: string; body: string }; id: string }) {
  const blocks = section.body.split('\n\n')
  const intro = blocks[0] ?? ''
  const listBlock = blocks.find((block) => block.includes('\n- '))
  const listItems = listBlock
    ? listBlock
        .split('\n')
        .filter((line) => line.startsWith('- '))
        .map((line) => line.replace(/^- /, ''))
    : []
  const notes = checklistNotesFor(section.title, listItems)
  const closing = blocks.find((block) => block !== intro && block !== listBlock) ?? ''

  return (
    <section className="article-checklist-section" id={id}>
      <div className="article-checklist-heading">
        <p className="kicker">Kurz prüfen</p>
        <h2>{section.title}</h2>
        {intro && <p>{intro}</p>}
      </div>
      {listItems.length > 0 && (
        <ol className="article-checklist">
          {listItems.map((item) => (
            <li key={item}>
              <strong>{item}</strong>
              {notes[item] && <span>{notes[item]}</span>}
            </li>
          ))}
        </ol>
      )}
      {closing && <p className="article-checklist-note">{closing}</p>}
    </section>
  )
}

function checklistNotesFor(title: string, items: string[]) {
  const isFamilySpo = title.toLowerCase().includes('familienurlaub')
  const isCoupleSpo = title.toLowerCase().includes('paarzeit')
  const isActivities = title.toLowerCase().includes('aktivitäten')
  const isRain = title.toLowerCase().includes('regentage')
  const isWatt = title.toLowerCase().includes('watt mit kindern')

  if (isActivities) {
    return {
      'Reist ihr als Familie, Paar oder mit Hund?':
        'Die gleiche Aktivität kann je nach Reisegruppe völlig anders wirken.',
      'Soll das Erlebnis aktiv, ruhig, naturbezogen oder wetterfest sein?':
        'Wählt nach Stimmung und Wetter, nicht nur nach Bekanntheit.',
      'Wie weit ist der Weg von der Unterkunft?':
        'Kurze Wege machen aus einer guten Idee einen entspannten Tag.',
      'Passt das Erlebnis zum Alter der Kinder oder zum Anlass der Reise?':
        'Familien brauchen andere Taktung als Paare mit Jahrestag oder Auszeitwunsch.',
      'Braucht ihr Reservierung, passende Kleidung oder einen Plan B?':
        'Ein paar geklärte Details verhindern, dass vor Ort wieder Recherche beginnt.',
      'Gibt es danach genug freie Zeit?':
        'Ein gutes Erlebnis sollte Raum öffnen und nicht den ganzen Tag zuschieben.',
      'Wird der Aufenthalt dadurch leichter oder nur voller?':
        'Das ist oft die wichtigste Frage für eine wirklich kuratierte Auszeit.',
    } as Record<string, string>
  }

  if (isCoupleSpo) {
    return {
      'Warum fahrt ihr weg: Anlass, Erholung, Überraschung oder einfach Abstand?':
        'Der Anlass bestimmt, ob die Auszeit eher ruhig, besonders oder sehr frei wirken sollte.',
      'Welche Unterkunft fühlt sich nach Rückzug an?':
        'Für Paarzeit zählt Atmosphäre oft stärker als Größe oder möglichst viele Features.',
      'Welcher Strandbereich passt zu Stimmung und Jahreszeit?':
        'Ein weiter Spaziergang, ein kurzer Abendweg oder ein ruhiger Morgen brauchen unterschiedliche Orte.',
      'Wollt ihr Wellness, Thalasso, Dinner oder lieber viel freie Zeit?':
        'Ein guter Baustein reicht oft. Zu viele Pläne nehmen der Auszeit wieder Ruhe.',
      'Gibt es einen Abend, der besonders werden soll?':
        'Wenn ein Abend wichtig ist, sollte er vorbereitet sein und nicht aus spontaner Suche entstehen.',
      'Muss Hund optional mitgedacht werden?':
        'Dann müssen Unterkunft, Wege und Tagesrhythmus von Anfang an dazu passen.',
      'Was darf bewusst ungeplant bleiben?':
        'Freie Zeit ist bei Paaren kein leeres Feld, sondern oft genau der Grund der Reise.',
    } as Record<string, string>
  }

  if (isRain) {
    return {
      'Welche warme Option passt zum Alter der Kinder?':
        'Je jünger die Kinder sind, desto kürzer und einfacher sollte der Plan B bleiben.',
      'Welche Idee ist nah genug an der Unterkunft?':
        'Kurze Wege sind bei Regen oft wichtiger als die vermeintlich beste Attraktion.',
      'Was ist die einfache Essenslösung für einen nassen Tag?':
        'Eine vorbereitete Option verhindert, dass Müdigkeit und Hunger den Tag bestimmen.',
      'Gibt es Kleidung für kurzen Strand trotz Regen?':
        'Ein kurzer Moment draußen kann gut tun, wenn danach Wärme und Pause klar sind.',
      'Funktioniert die Unterkunft als Pausenort?':
        'Bei Nordseewetter wird die Unterkunft schnell zum wichtigsten Rückzugsraum.',
      'Welche Aktivität ist wirklich wetterfest?':
        'Nicht jede gute Idee funktioniert bei Wind, Regen und müden Kindern gleich gut.',
      'Was darf an diesem Tag bewusst ausfallen?':
        'Ein ruhiger Regentag muss kein verlorener Urlaubstag sein.',
    } as Record<string, string>
  }

  if (isWatt) {
    return {
      'Ist der Anbieter für Familien und Kinder geeignet?':
        'Die Führung sollte erklären, sichern und genug Raum für kindliche Neugier lassen.',
      'Passt die Dauer zum Alter der Kinder?':
        'Lieber etwas kürzer und gut gelaunt als zu lang und erschöpft.',
      'Wie kommt ihr entspannt zum Treffpunkt?':
        'Parken, Wege, Wartezeit und Rückweg gehören zur Planung dazu.',
      'Welche Kleidung wird empfohlen?':
        'Die Hinweise des Anbieters sind wichtiger als spontane Einschätzungen vor Ort.',
      'Was passiert bei Wetterwechsel?':
        'Ein klarer Plan B nimmt Druck aus dem Naturerlebnis.',
      'Gibt es danach eine einfache Essens- oder Pausenidee?':
        'Nach Watt, Wind und nasser Kleidung brauchen Familien oft einen ruhigen nächsten Schritt.',
      'Passt das Erlebnis zum restlichen Tag?':
        'Watt wirkt am besten, wenn davor und danach nicht zu viel geplant ist.',
    } as Record<string, string>
  }

  if (!isFamilySpo) return Object.fromEntries(items.map((item) => [item, '']))

  return {
    'Welcher Strandbereich passt zu Alter, Wetter und Mobilität der Kinder?':
      'Wählt den Abschnitt nach Tagesform, Wegen und Pausen, nicht nur nach Bekanntheit.',
    'Welche Schlechtwetter-Idee ist realistisch und nicht zu weit weg?':
      'Ein naher Plan B ist hilfreicher als drei gute Ideen, die alle Aufwand machen.',
    'Welches lokale Erlebnis passt wirklich zur Familie?':
      'Das Erlebnis sollte zum Alter der Kinder passen und nicht den ganzen Tag dominieren.',
    'Was ist die einfache Essenslösung für den ersten Abend?':
      'Gerade nach der Anreise nimmt eine klare Abendoption viel Druck aus dem Start.',
    'Wie weit sind Unterkunft, Strand, Einkauf und Erlebnis voneinander entfernt?':
      'Kurze, sinnvolle Wege machen Familienurlaub spürbar entspannter.',
    'Wie funktioniert Anreise und Schlüsselübergabe?':
      'Je weniger Unklarheit bei der Ankunft, desto schneller beginnt die Auszeit.',
    'Was darf bewusst ungeplant bleiben?':
      'Freie Zeit ist kein Loch im Plan, sondern oft der Moment, den Kinder am meisten nutzen.',
  } as Record<string, string>
}

function ArticleText({ body }: { body: string }) {
  return (
    <>
      {body.split('\n\n').map((block) => {
        if (block.startsWith('- ')) {
          return (
            <ul key={block}>
              {block.split('\n').map((item) => (
                <li key={item}>{item.replace(/^- /, '')}</li>
              ))}
            </ul>
          )
        }

        if (block.includes('\n')) {
          const [lead, ...rest] = block.split('\n')
          const bulletItems = rest.filter((line) => line.startsWith('- '))

          if (bulletItems.length > 0) {
            return (
              <Fragment key={block}>
                <p>
                  <strong>{lead}</strong>
                </p>
                <ul>
                  {bulletItems.map((item) => (
                    <li key={item}>{item.replace(/^- /, '')}</li>
                  ))}
                </ul>
              </Fragment>
            )
          }

          return (
            <p key={block}>
              <strong>{lead}</strong>
              {rest.length > 0 && <span>{rest.join(' ')}</span>}
            </p>
          )
        }

        return <p key={block}>{block}</p>
      })}
    </>
  )
}

function OwnerPage({ onLead }: { onLead: (lead: StoredLead) => void }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    propertyLocation: '',
    propertyType: '',
    sleeps: '',
    currentRental: 'agency' as OwnerLead['currentRental'],
    listingUrl: '',
    message: '',
  })
  const [sent, setSent] = useState(false)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onLead({ id: crypto.randomUUID(), type: 'owner', ...form, status: 'Neu', createdAt: new Date().toISOString() })
    setSent(true)
  }

  return (
    <Shell>
      <main className="plain-page owner-page">
        <section className="owner-hero">
          <div className="owner-hero-copy">
            <p className="kicker">Für Eigentümer</p>
            <h1>Deine Ferienimmobilie als Teil einer kuratierten Auszeit.</h1>
            <p>
              Morrow sucht ausgewählte Objekte in Orten am Wasser und verbindet sie mit lokaler
              Orientierung, passenden Erlebnissen und einer hochwertigeren Geschichte für Gäste.
            </p>
            <a className="button primary" href="#immobilie-vorstellen">Immobilie vorstellen <ArrowRightLine size={18} /></a>
          </div>
          <div className="owner-hero-media">
            <img src="/brand/generated/morrow-spo-interior.png" alt="Ruhige Ferienunterkunft mit Blick in die Dünen" />
            <div className="owner-hero-note">
              <span>Nicht nur gelistet</span>
              <p>Als Unterkunft sichtbar werden, die zu einer bestimmten Auszeit und Zielgruppe passt.</p>
            </div>
          </div>
        </section>

        <section className="section b2b-strip">
          <Principle icon={<Home3Line />} title="Passende Positionierung" text="Dein Objekt wird als Teil eines stimmigen Aufenthalts erzählt, nicht als austauschbare Unterkunft." />
          <Principle icon={<GroupLine />} title="Klare Zielgruppen" text="Wir denken Familien und Paare getrennt, damit Angebot, Tonalität und Aufenthalt zusammenpassen." />
          <Principle icon={<HeartHandLine />} title="Persönlicher Einstieg" text="Am Anfang steht ein Gespräch und eine kuratierte Prüfung, keine anonyme Selbstregistrierung." />
        </section>

        <section className="owner-value-section">
          <div>
            <p className="kicker">Warum Morrow</p>
            <h2>Mehr Wert entsteht nicht nur über den Preis.</h2>
            <p>
              Viele gute Ferienimmobilien werden online wie austauschbare Unterkünfte gezeigt.
              Morrow denkt zuerst darüber nach, für wen ein Objekt wirklich passt und welcher Aufenthalt daraus entstehen kann.
            </p>
          </div>
          <div className="owner-value-grid">
            <article>
              <h3>Hochwertiger erzählt</h3>
              <p>Das Objekt wird nicht nur nach Betten und Quadratmetern beschrieben, sondern als Teil eines Aufenthalts mit Gefühl, Zielgruppe und Ort.</p>
            </article>
            <article>
              <h3>Passendere Gäste</h3>
              <p>Familien und Paare kommen mit klarerer Erwartung, weil Unterkunft, Erlebnis und Rahmen bereits zusammen gedacht sind.</p>
            </article>
            <article>
              <h3>Weniger operative Reibung</h3>
              <p>Anfragen werden persönlich geprüft. Ziel ist nicht Masse, sondern Aufenthalte, die zum Objekt und zur Verfügbarkeit passen.</p>
            </article>
            <article>
              <h3>Mehr Perspektive</h3>
              <p>Aus einem einzelnen Objekt kann langfristig ein professionell geführtes Hospitality-Asset mit besserer Positionierung werden.</p>
            </article>
          </div>
        </section>

        <section className="owner-model-section">
          <div>
            <p className="kicker">Morrow Modell</p>
            <h2>Aus einem Objekt wird ein klarer Aufenthalt.</h2>
            <p>
              Wir arbeiten bewusst kuratiert: Wir prüfen, ob Objekt, Zielgruppe, Ort,
              Verfügbarkeit und Auszeitidee zusammenpassen. Erst dann wird daraus ein Angebot.
            </p>
          </div>
          <div className="owner-model-steps">
            <article>
              <span>01</span>
              <h3>Objekt verstehen</h3>
              <p>Lage, Ausstattung, Atmosphäre und Zielgruppe werden nicht getrennt betrachtet.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Auszeit kuratieren</h3>
              <p>Unterkunft, Erlebnis und Empfehlungen werden zu einem stimmigen Aufenthalt verbunden.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Anfrage persönlich prüfen</h3>
              <p>Gäste fragen an, Morrow prüft die Passung und begleitet den nächsten Schritt.</p>
            </article>
          </div>
        </section>

        <section className="owner-start-section">
          <img src="/brand/generated/morrow-spo-family-arrival.png" alt="Gäste kommen an einer vorbereiteten Unterkunft in Sankt Peter-Ording an" />
          <div>
            <p className="kicker">Zusammenarbeit</p>
            <h2>Der Einstieg bleibt bewusst persönlich.</h2>
            <p>
              Zum Start braucht es keine komplexe Integration. Entscheidend ist, ob Objekt,
              freie Termine und Auszeitidee zusammenpassen. Daraus kann ein erster kuratierter Aufenthalt entstehen.
            </p>
            <div className="owner-start-points" aria-label="Einstieg in die Zusammenarbeit">
              <span><strong>01</strong> Objekt vorstellen</span>
              <span><strong>02</strong> Passung gemeinsam prüfen</span>
              <span><strong>03</strong> Erste Auszeit testen</span>
            </div>
          </div>
        </section>

        <section className="faq-section owner-faq">
          <div className="faq-intro">
            <p className="kicker">Fragen von Eigentümern</p>
            <h2>Was vor einer Zusammenarbeit wichtig ist.</h2>
            <p>Wir starten kuratiert und persönlich. Deshalb geht es zuerst um Passung, Vertrauen und klare nächste Schritte.</p>
          </div>
          <div className="faq-list">
            <details>
              <summary>Muss ich exklusiv mit Morrow arbeiten?</summary>
              <p>Für den ersten Einstieg nicht zwingend. Wichtig ist, dass Verfügbarkeit, Qualität und Gästeerlebnis für eine konkrete Auszeit zuverlässig abgestimmt werden können.</p>
            </details>
            <details>
              <summary>Welche Objekte sucht Morrow?</summary>
              <p>Objekte in Orten am Wasser, die zu Familien oder Paaren passen: gute Atmosphäre, klare Lage, verlässliche Ausstattung und genug Qualität, um Teil einer kuratierten Auszeit zu werden.</p>
            </details>
            <details>
              <summary>Wer betreut die Gäste?</summary>
              <p>Morrow übernimmt die kuratierende Kommunikation rund um die Auszeit. Operative Details hängen davon ab, ob das Objekt über eine Agentur, selbst oder später direkt mit Morrow betreut wird.</p>
            </details>
            <details>
              <summary>Wie werden Preise und Termine abgestimmt?</summary>
              <p>Zu Beginn arbeiten wir mit festen verfügbaren Zeiträumen. Preise, Verfügbarkeit und Auszeitrahmen werden vor Veröffentlichung persönlich abgestimmt.</p>
            </details>
            <details>
              <summary>Was passiert nach dem Formular?</summary>
              <p>Wir prüfen die Angaben, schauen auf Lage, Objektart und mögliche Passung und melden uns persönlich mit einer ersten Einschätzung.</p>
            </details>
          </div>
        </section>

        <section className="request-section single" id="immobilie-vorstellen">
          <div>
            <h2>Immobilie vorstellen</h2>
            <p>Erzähle uns kurz, welches Objekt du hast und wie es aktuell vermietet wird. Wir melden uns persönlich, wenn es grundsätzlich zu Morrow passen könnte.</p>
          </div>
          <form className="form-panel" onSubmit={submit}>
            <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>E-Mail<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>Telefon<input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label>Ort der Immobilie<input required value={form.propertyLocation} onChange={(e) => setForm({ ...form, propertyLocation: e.target.value })} /></label>
            <label>Art der Immobilie<input required value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })} placeholder="z. B. Ferienhaus, Wohnung" /></label>
            <label>Anzahl Schlafplätze<input required inputMode="numeric" value={form.sleeps} onChange={(e) => setForm({ ...form, sleeps: e.target.value })} /></label>
            <label>Aktuelle Vermietung<select value={form.currentRental} onChange={(e) => setForm({ ...form, currentRental: e.target.value as OwnerLead['currentRental'] })}>
              <option value="agency">über Agentur</option>
              <option value="self">selbst</option>
              <option value="platforms">über Plattformen</option>
              <option value="not-yet">noch nicht vermietet</option>
            </select></label>
            <label>Link zum Objekt optional<input value={form.listingUrl} onChange={(e) => setForm({ ...form, listingUrl: e.target.value })} /></label>
            <label className="wide">Nachricht optional<textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
            <button className="button primary wide" type="submit">Immobilie vorstellen <ArrowRightLine size={18} /></button>
            {sent && <p className="success-message">Danke. Wir melden uns persönlich per E-Mail.</p>}
          </form>
        </section>
      </main>
    </Shell>
  )
}

function ExperiencePartnerPage({ onLead }: { onLead: (lead: StoredLead) => void }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    location: '',
    experienceType: '',
    link: '',
    description: '',
    audienceFit: 'Beide' as ExperienceLead['audienceFit'],
    message: '',
  })
  const [sent, setSent] = useState(false)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onLead({ id: crypto.randomUUID(), type: 'experience', ...form, status: 'Neu', createdAt: new Date().toISOString() })
    setSent(true)
  }

  return (
    <Shell>
      <main className="plain-page partner-page">
        <section className="partner-hero">
          <div className="partner-hero-copy">
            <p className="kicker">Erlebnisanbieter</p>
            <h1>Lokale Erlebnisse, die aus einem Aufenthalt mehr machen.</h1>
            <p>
              Morrow sucht Partner in und um Sankt Peter-Ording, die Familien und Paaren echte
              Momente ermöglichen: nah am Ort, persönlich geführt und passend zur jeweiligen Auszeit.
            </p>
            <a className="button primary" href="#erlebnis-anbieten">Erlebnis anbieten <ArrowRightLine size={18} /></a>
          </div>
          <div className="partner-hero-media">
            <img src="/brand/generated/morrow-spo-local-market.png" alt="Lokaler Markt und kleine Anbieter in Sankt Peter-Ording" />
            <div className="partner-hero-note">
              <span>Lokal eingebunden</span>
              <p>Erlebnisse werden nicht beliebig gelistet, sondern passend zu Aufenthalt und Zielgruppe kuratiert.</p>
            </div>
          </div>
        </section>

        <section className="section b2b-strip">
          <Principle icon={<SparklesLine />} title="Passende Auszeiten" text="Erlebnisse werden dort eingebunden, wo sie für Familien oder Paare wirklich Sinn ergeben." />
          <Principle icon={<LocationLine />} title="Lokaler Kontext" text="Wir suchen Anbieter, die SPO nahbar machen und nicht nur eine Aktivität verkaufen." />
          <Principle icon={<HeartHandLine />} title="Persönliche Auswahl" text="Wir prüfen jedes Angebot kuratiert und melden uns, wenn es zu einem Aufenthalt passt." />
        </section>

        <section className="partner-value-section">
          <div>
            <p className="kicker">Warum Morrow</p>
            <h2>Nicht mehr Reichweite um jeden Preis. Sondern bessere Passung.</h2>
            <p>
              Gute Anbieter brauchen nicht einfach mehr zufällige Buchungen. Sie brauchen Gäste,
              deren Aufenthalt, Erwartung und Stimmung wirklich zum Erlebnis passen.
            </p>
          </div>
          <div className="partner-value-grid">
            <article>
              <h3>Passende Gäste</h3>
              <p>Familien, Paare oder beide Zielgruppen werden bewusst zugeordnet, damit das Erlebnis nicht für alle gleich erzählt wird.</p>
            </article>
            <article>
              <h3>Stärkerer Kontext</h3>
              <p>Dein Angebot steht nicht allein, sondern wird Teil eines Aufenthalts mit Unterkunft, Ort und konkretem Reisegefühl.</p>
            </article>
            <article>
              <h3>Weniger Streuverlust</h3>
              <p>Morrow prüft Anfragen und Auszeiten persönlich, statt Erlebnisse in eine beliebige Liste zu stellen.</p>
            </article>
            <article>
              <h3>Lokale Sichtbarkeit</h3>
              <p>Gute Anbieter werden dort sichtbar, wo Gäste bereits bereit sind, eine besondere Zeit vor Ort zu erleben.</p>
            </article>
          </div>
        </section>

        <section className="partner-model-section">
          <div>
            <p className="kicker">Morrow Modell</p>
            <h2>Aus einer Aktivität wird ein passender Moment.</h2>
            <p>
              Wir prüfen, für welche Auszeit ein Erlebnis Sinn ergibt: Familie, Paarzeit,
              Wetter, Saison, Dauer, Wege und Erwartung müssen zusammenpassen.
            </p>
          </div>
          <div className="partner-model-steps">
            <article>
              <span>01</span>
              <h3>Angebot verstehen</h3>
              <p>Wir schauen auf Ablauf, Zielgruppe, Ort, Kapazität und das Gefühl, das entsteht.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Auszeit verbinden</h3>
              <p>Das Erlebnis wird dort eingebunden, wo es den Aufenthalt wirklich stimmiger macht.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Kooperation testen</h3>
              <p>Ein erster kuratierter Aufenthalt zeigt, ob Zusammenarbeit und Gästeerwartung passen.</p>
            </article>
          </div>
        </section>

        <section className="partner-start-section">
          <img src="/brand/generated/morrow-spo-local-orientation.png" alt="Vorbereitete Orientierung mit Blick auf Dünen und Pfahlbau in Sankt Peter-Ording" />
          <div>
            <p className="kicker">Zusammenarbeit</p>
            <h2>Der Einstieg bleibt klein und persönlich.</h2>
            <p>
              Für den Start reicht eine kurze Vorstellung deines Angebots. Wenn es grundsätzlich
              passt, besprechen wir Verfügbarkeit, Zielgruppe, Ablauf und mögliche Einbindung in eine Auszeit.
            </p>
            <div className="partner-start-points" aria-label="Einstieg in die Zusammenarbeit">
              <span><strong>01</strong> Erlebnis vorstellen</span>
              <span><strong>02</strong> Passung gemeinsam prüfen</span>
              <span><strong>03</strong> Erste Kooperation testen</span>
            </div>
          </div>
        </section>

        <section className="faq-section partner-faq">
          <div className="faq-intro">
            <p className="kicker">Fragen von Erlebnispartnern</p>
            <h2>Was vor einer Kooperation wichtig ist.</h2>
            <p>Wir suchen keine lange Liste an Aktivitäten, sondern Anbieter, die zu Morrow-Auszeiten und Gästen passen.</p>
          </div>
          <div className="faq-list">
            <details>
              <summary>Welche Erlebnisse sucht Morrow?</summary>
              <p>Natur, Watt, Reiten, Yoga, Wellness, Kochen, besondere Abende, lokale Führungen und weitere Angebote, die Familien oder Paaren eine gute Zeit vor Ort ermöglichen.</p>
            </details>
            <details>
              <summary>Muss mein Angebot exklusiv sein?</summary>
              <p>Nein. Für den Start ist wichtiger, dass Ablauf, Qualität, Verfügbarkeit und Kommunikation zuverlässig zu einer kuratierten Auszeit passen.</p>
            </details>
            <details>
              <summary>Wie wird entschieden, ob ein Erlebnis passt?</summary>
              <p>Wir prüfen Zielgruppe, Dauer, Wege, Wetterabhängigkeit, Saison, Kapazität und das Gefühl, das der Aufenthalt dadurch bekommt.</p>
            </details>
            <details>
              <summary>Wie kommen Gäste zu meinem Erlebnis?</summary>
              <p>Erlebnisse werden nicht isoliert verkauft, sondern als Teil einer Auszeit oder als passende Empfehlung eingebunden.</p>
            </details>
            <details>
              <summary>Was passiert nach dem Formular?</summary>
              <p>Wir prüfen die Angaben und melden uns persönlich, wenn dein Angebot grundsätzlich zu Morrow passen könnte.</p>
            </details>
          </div>
        </section>

        <section className="request-section single" id="erlebnis-anbieten">
          <div>
            <h2>Erlebnis anbieten</h2>
            <p>Erzähle uns kurz, was du anbietest, wo es stattfindet und für wen es besonders gut passt. Wir melden uns persönlich mit einer ersten Einschätzung.</p>
          </div>
          <form className="form-panel" onSubmit={submit}>
            <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>E-Mail<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>Telefon<input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label>Name des Angebots / Unternehmens<input required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} /></label>
            <label>Ort<input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
            <label>Art des Erlebnisses<input required value={form.experienceType} onChange={(e) => setForm({ ...form, experienceType: e.target.value })} placeholder="z. B. Yoga, Reiten, Kochen" /></label>
            <label>Geeignet für<select value={form.audienceFit} onChange={(e) => setForm({ ...form, audienceFit: e.target.value as ExperienceLead['audienceFit'] })}>
              <option>Beide</option>
              <option>Familien</option>
              <option>Paare</option>
            </select></label>
            <label>Website / Instagram optional<input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></label>
            <label className="wide">Kurze Beschreibung<textarea required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label className="wide">Nachricht optional<textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
            <button className="button primary wide" type="submit">Erlebnis anbieten <ArrowRightLine size={18} /></button>
            {sent && <p className="success-message">Danke. Wir melden uns persönlich per E-Mail.</p>}
          </form>
        </section>
      </main>
    </Shell>
  )
}

function AdminAuthLoading() {
  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <img src="/brand/logos/wordmark/morrow-logomark-offblack.svg" alt="Morrow" />
        <p className="kicker">Admin</p>
        <h1>Zugang wird geprüft.</h1>
        <p>Wir schauen kurz, ob eine aktive Admin-Sitzung vorhanden ist.</p>
      </section>
    </main>
  )
}

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return

    setLoading(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }
  }

  const sendPasswordReset = async () => {
    if (!supabase || !email.trim()) {
      setError('Bitte zuerst die freigegebene Admin-E-Mail eintragen.')
      return
    }

    setLoading(true)
    setError('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/admin',
    })

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setResetSent(true)
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <img src="/brand/logos/wordmark/morrow-logomark-offblack.svg" alt="Morrow" />
        <p className="kicker">Admin CRM</p>
        <h1>Einloggen, bevor Kundendaten sichtbar werden.</h1>
        <p>Nur freigegebene Morrow-Admin-E-Mails können sich anmelden. Danach schützt Supabase die CRM-Daten zusätzlich über Rollenrechte.</p>

        <form onSubmit={submit}>
          <label>
            E-Mail
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="auszeiten@getmorrow.de" />
          </label>
          <label>
            Passwort
            <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Passwort" />
          </label>
          <button className="admin-action primary" type="submit" disabled={loading}>
            {loading ? 'Wird geprüft' : 'Einloggen'}
          </button>
        </form>

        <button className="admin-row-action" type="button" onClick={sendPasswordReset} disabled={loading}>
          Passwort setzen oder zurücksetzen
        </button>

        {resetSent && <p className="admin-login-success">Wenn diese E-Mail als Admin-Account existiert, ist ein Passwort-Link unterwegs.</p>}
        {error && <p className="admin-login-error">{error}</p>}
      </section>
    </main>
  )
}

function AdminAccessDenied({ email, onSignOut }: { email?: string; onSignOut: () => void }) {
  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <img src="/brand/logos/wordmark/morrow-logomark-offblack.svg" alt="Morrow" />
        <p className="kicker">Admin CRM</p>
        <h1>Dieser Account ist nicht freigegeben.</h1>
        <p>{email ? `${email} ist aktuell nicht als Morrow-Admin hinterlegt.` : 'Diese Sitzung ist nicht als Morrow-Admin freigegeben.'}</p>
        <button className="admin-action primary" type="button" onClick={onSignOut}>Abmelden</button>
      </section>
    </main>
  )
}

function AdminPasswordUpdate({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    if (password.length < 8) {
      setError('Das Passwort sollte mindestens 8 Zeichen haben.')
      return
    }
    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }

    setLoading(true)
    setError('')

    const { error: updateError } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccess(true)
    onDone()
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <img src="/brand/logos/wordmark/morrow-logomark-offblack.svg" alt="Morrow" />
        <p className="kicker">Admin CRM</p>
        <h1>Neues Passwort vergeben.</h1>
        <p>Wähle ein Passwort für deinen freigegebenen Morrow-Adminzugang.</p>
        <form onSubmit={submit}>
          <label>
            Neues Passwort
            <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} />
          </label>
          <label>
            Passwort wiederholen
            <input required type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} />
          </label>
          <button className="admin-action primary" type="submit" disabled={loading}>
            {loading ? 'Wird gespeichert' : 'Passwort speichern'}
          </button>
        </form>
        {success && <p className="admin-login-success">Passwort gespeichert.</p>}
        {error && <p className="admin-login-error">{error}</p>}
      </section>
    </main>
  )
}

function AdminPage({
  leads,
  onArchive,
  onDelete,
  onStatus,
  onUpdateLead,
  adminEmail,
  authMode,
  onSignOut,
}: {
  leads: StoredLead[]
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onStatus: (id: string, status: LeadStatus) => void
  onUpdateLead: (id: string, updates: Partial<StoredLead>) => void
  adminEmail?: string
  authMode: 'local' | 'supabase'
  onSignOut?: () => void
}) {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')
  const [emailEvents, setEmailEvents] = useState<EmailEvent[]>([])
  const [communicationEvents, setCommunicationEvents] = useState<CommunicationEvent[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [leadScope, setLeadScope] = useState<LeadScopeFilter>('active')
  const [leadTypeFilter, setLeadTypeFilter] = useState<LeadTypeFilter>('all')
  const [leadStatusFilter, setLeadStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [leadWorkFilter, setLeadWorkFilter] = useState<LeadWorkFilter>('all')
  const [customerTypeFilter, setCustomerTypeFilter] = useState<CustomerTypeFilter>('all')
  const [customerPhaseFilter, setCustomerPhaseFilter] = useState<CustomerPhaseFilter>('all')
  const [bookingStatusFilter, setBookingStatusFilter] = useState<BookingStatusFilter>('all')
  const [bookingPackageFilter, setBookingPackageFilter] = useState<BookingPackageFilter>('all')
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatusFilter>('open')
  const [taskReferenceFilter, setTaskReferenceFilter] = useState<TaskReferenceFilter>('all')
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<TaskPriorityFilter>('all')
  const [supportStatusFilter, setSupportStatusFilter] = useState<TaskStatusFilter>('open')
  const [taskCreateDraft, setTaskCreateDraft] = useState({
    title: '',
    referenceValue: '',
    dueAt: todayIsoValue(),
    priority: 'medium' as AdminTaskPriority,
    note: '',
  })
  const [adminPackages, setAdminPackages] = useState<MorrowPackage[]>(() => {
    try {
      const saved = localStorage.getItem(adminPackageStorageKey)
      return saved ? JSON.parse(saved) as MorrowPackage[] : packages
    } catch {
      return packages
    }
  })
  useEffect(() => {
    if (authMode !== 'supabase') return

    let cancelled = false

    fetchStoredPackages<MorrowPackage>()
      .then((remotePackages) => {
        if (cancelled || !remotePackages || remotePackages.length === 0) return
        setAdminPackages(remotePackages)
        localStorage.setItem(adminPackageStorageKey, JSON.stringify(remotePackages))
      })
      .catch((error) => {
        console.warn('Morrow backend package sync failed. Falling back to local packages.', error)
      })

    return () => {
      cancelled = true
    }
  }, [authMode])
  const [packageAudienceFilter, setPackageAudienceFilter] = useState<PackageAudienceFilter>('all')
  const [packageStatusFilter, setPackageStatusFilter] = useState<PackageStatusFilter>('all')
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [experiencePackageFilter, setExperiencePackageFilter] = useState<ExperiencePackageFilter>('all')
  const [experienceRoleFilter, setExperienceRoleFilter] = useState<ExperienceRoleFilter>('all')
  const [experienceConfirmationFilter, setExperienceConfirmationFilter] = useState<ExperienceConfirmationFilter>('all')
  const [experienceProviderFilter, setExperienceProviderFilter] = useState<ExperienceProviderFilter>('all')
  const [experienceProviderStatusFilter, setExperienceProviderStatusFilter] = useState<ExperienceProviderStatusFilter>('all')
  const [selectedExperience, setSelectedExperience] = useState<{ packageId: string; experienceId: string } | null>(null)
  const [localPlaceCategoryFilter, setLocalPlaceCategoryFilter] = useState<LocalPlaceCategoryFilter>('all')
  const [localPlaceStatusFilter, setLocalPlaceStatusFilter] = useState<LocalPlaceStatusFilter>('all')
  const [localPlaceReviewFilter, setLocalPlaceReviewFilter] = useState<LocalPlaceReviewFilter>('all')
  const [selectedLocalPlaceCandidateId, setSelectedLocalPlaceCandidateId] = useState<string | null>(null)
  const [rawSpoEvents, setRawSpoEvents] = useState<RawSpoEventCandidate[]>([])
  const [eventImportSearch, setEventImportSearch] = useState('')
  const [eventImportTown, setEventImportTown] = useState('all')
  const [eventImportDateFrom, setEventImportDateFrom] = useState('')
  const [eventImportDateTo, setEventImportDateTo] = useState('')
  const [experienceProviders, setExperienceProviders] = useState<ExperienceProviderProfile[]>(() => {
    try {
      const saved = localStorage.getItem(adminExperienceProviderStorageKey)
      return saved ? JSON.parse(saved) as ExperienceProviderProfile[] : initialExperienceProviders
    } catch {
      return initialExperienceProviders
    }
  })
  useEffect(() => {
    if (authMode !== 'supabase') return

    let cancelled = false

    fetchStoredExperienceProviders<ExperienceProviderProfile>()
      .then((remoteProviders) => {
        if (cancelled || !remoteProviders || remoteProviders.length === 0) return
        const normalizedProviders = remoteProviders.map((provider) => normalizeExperienceProvider(provider))
        setExperienceProviders(normalizedProviders)
        localStorage.setItem(adminExperienceProviderStorageKey, JSON.stringify(normalizedProviders))
      })
      .catch((error) => {
        console.warn('Morrow backend experience provider sync failed. Falling back to local providers.', error)
      })

    return () => {
      cancelled = true
    }
  }, [authMode])
  const [selectedExperienceProviderId, setSelectedExperienceProviderId] = useState<string | null>(null)
  const [ownerProperties, setOwnerProperties] = useState<OwnerPropertyProfile[]>(() => {
    try {
      const saved = localStorage.getItem(adminOwnerPropertyStorageKey)
      return saved ? JSON.parse(saved) as OwnerPropertyProfile[] : initialOwnerProperties
    } catch {
      return initialOwnerProperties
    }
  })
  useEffect(() => {
    if (authMode !== 'supabase') return

    let cancelled = false

    fetchStoredOwnerProperties<OwnerPropertyProfile>()
      .then((remoteProperties) => {
        if (cancelled || !remoteProperties || remoteProperties.length === 0) return
        const normalizedProperties = remoteProperties.map((property) => normalizeOwnerProperty(property))
        setOwnerProperties(normalizedProperties)
        localStorage.setItem(adminOwnerPropertyStorageKey, JSON.stringify(normalizedProperties))
      })
      .catch((error) => {
        console.warn('Morrow backend owner property sync failed. Falling back to local owner properties.', error)
      })

    return () => {
      cancelled = true
    }
  }, [authMode])
  const [selectedOwnerPropertyId, setSelectedOwnerPropertyId] = useState<string | null>(null)
  const [ownerStatusFilter, setOwnerStatusFilter] = useState<OwnerPropertyStatusFilter>('all')
  const [adminTasks, setAdminTasks] = useState<AdminTask[]>(() => {
    try {
      const saved = localStorage.getItem(adminTaskStorageKey)
      return saved ? JSON.parse(saved) as AdminTask[] : initialAdminTasks
    } catch {
      return initialAdminTasks
    }
  })
  useEffect(() => {
    if (authMode !== 'supabase') return

    let cancelled = false

    fetchStoredAdminTasks<AdminTask>()
      .then((remoteTasks) => {
        if (cancelled || !remoteTasks || remoteTasks.length === 0) return
        setAdminTasks(remoteTasks)
        localStorage.setItem(adminTaskStorageKey, JSON.stringify(remoteTasks))
      })
      .catch((error) => {
        console.warn('Morrow backend task sync failed. Falling back to local tasks.', error)
      })

    return () => {
      cancelled = true
    }
  }, [authMode])
  const [agencies, setAgencies] = useState<AgencyProfile[]>(() => {
    try {
      const saved = localStorage.getItem(adminAgencyStorageKey)
      return saved ? JSON.parse(saved) as AgencyProfile[] : initialAgencies
    } catch {
      return initialAgencies
    }
  })
  useEffect(() => {
    if (authMode !== 'supabase') return

    let cancelled = false

    fetchStoredAgencies<AgencyProfile>()
      .then((remoteAgencies) => {
        if (cancelled || !remoteAgencies || remoteAgencies.length === 0) return
        const normalizedAgencies = remoteAgencies.map((agency) => normalizeAgency(agency))
        setAgencies(normalizedAgencies)
        localStorage.setItem(adminAgencyStorageKey, JSON.stringify(normalizedAgencies))
      })
      .catch((error) => {
        console.warn('Morrow backend agency sync failed. Falling back to local agencies.', error)
      })

    return () => {
      cancelled = true
    }
  }, [authMode])
  const [adminLocalPlaces, setAdminLocalPlaces] = useState<LocalPlaceCandidate[]>(() => {
    try {
      return getStoredLocalPlaceCandidates()
    } catch {
      return getStoredLocalPlaceCandidates()
    }
  })
  useEffect(() => {
    if (authMode !== 'supabase') return

    let cancelled = false

    fetchStoredLocalPlaces<LocalPlaceCandidate>()
      .then((remotePlaces) => {
        if (cancelled || !remotePlaces || remotePlaces.length === 0) return
        const normalizedPlaces = remotePlaces.map((place) => normalizeLocalPlaceCandidate(place))
        setAdminLocalPlaces(normalizedPlaces)
        localStorage.setItem(adminLocalPlaceStorageKey, JSON.stringify(normalizedPlaces))
      })
      .catch((error) => {
        console.warn('Morrow backend local place sync failed. Falling back to local places.', error)
      })

    return () => {
      cancelled = true
    }
  }, [authMode])
  useEffect(() => {
    let ignore = false

    fetch('/data/spo-events.json')
      .then((response) => response.ok ? response.json() as Promise<RawSpoEventCandidate[]> : [])
      .then((events) => {
        if (!ignore && Array.isArray(events)) setRawSpoEvents(events)
      })
      .catch(() => {
        if (!ignore) setRawSpoEvents([])
      })

    return () => {
      ignore = true
    }
  }, [])
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null)
  const [agencyStatusFilter, setAgencyStatusFilter] = useState<AgencyStatusFilter>('all')
  const [storedCustomers, setStoredCustomers] = useState<CustomerProfile[]>(() => {
    try {
      const saved = localStorage.getItem(adminCustomerStorageKey)
      return saved ? JSON.parse(saved) as CustomerProfile[] : []
    } catch {
      return []
    }
  })
  const [storedBookings, setStoredBookings] = useState<BookingProfile[]>(() => {
    try {
      const saved = localStorage.getItem(adminBookingStorageKey)
      return saved ? JSON.parse(saved) as BookingProfile[] : []
    } catch {
      return []
    }
  })
  useEffect(() => {
    if (authMode !== 'supabase') return

    let cancelled = false

    fetchStoredCustomers<CustomerProfile>()
      .then((remoteCustomers) => {
        if (cancelled || !remoteCustomers) return
        const normalizedCustomers = remoteCustomers.map((customer) => normalizeStoredCustomer(customer, leads))
        setStoredCustomers(normalizedCustomers)
        localStorage.setItem(adminCustomerStorageKey, JSON.stringify(normalizedCustomers))
      })
      .catch((error) => {
        console.warn('Morrow backend customer sync failed. Falling back to derived customers.', error)
      })

    return () => {
      cancelled = true
    }
  }, [authMode, leads])
  useEffect(() => {
    if (authMode !== 'supabase') return

    let cancelled = false

    fetchStoredBookings<BookingProfile>()
      .then((remoteBookings) => {
        if (cancelled || !remoteBookings) return
        const normalizedBookings = remoteBookings.map((booking) => normalizeStoredBooking(booking, adminPackages, leads))
        setStoredBookings(normalizedBookings)
        localStorage.setItem(adminBookingStorageKey, JSON.stringify(normalizedBookings))
      })
      .catch((error) => {
        console.warn('Morrow backend booking load failed. Falling back to derived bookings.', error)
      })

    return () => {
      cancelled = true
    }
  }, [adminPackages, authMode, leads])
  const leadIdsForEmailEvents = useMemo(() => leads.map((lead) => lead.id).sort().join('|'), [leads])
  useEffect(() => {
    if (authMode !== 'supabase') {
      setEmailEvents([])
      return
    }
    if (!leadIdsForEmailEvents) {
      setEmailEvents([])
      return
    }

    let cancelled = false
    const leadIds = leadIdsForEmailEvents.split('|').filter(Boolean)

    fetchStoredEmailEvents<EmailEvent>(leadIds)
      .then((events) => {
        if (cancelled) return
        setEmailEvents(events ?? [])
      })
      .catch((error) => {
        console.warn('Morrow backend email event sync failed.', error)
        if (!cancelled) setEmailEvents([])
      })

    return () => {
      cancelled = true
    }
  }, [authMode, leadIdsForEmailEvents])
  useEffect(() => {
    if (authMode !== 'supabase') {
      setCommunicationEvents([])
      return
    }
    if (!leadIdsForEmailEvents) {
      setCommunicationEvents([])
      return
    }

    let cancelled = false
    const leadIds = leadIdsForEmailEvents.split('|').filter(Boolean)

    fetchStoredCommunicationEvents<CommunicationEvent>(leadIds)
      .then((events) => {
        if (cancelled) return
        setCommunicationEvents(events ?? [])
      })
      .catch((error) => {
        console.warn('Morrow backend communication event sync failed.', error)
        if (!cancelled) setCommunicationEvents([])
      })

    return () => {
      cancelled = true
    }
  }, [authMode, leadIdsForEmailEvents])
  const activeLeads = leads.filter((lead) => !lead.archivedAt)
  const realActiveLeads = activeLeads.filter((lead) => !lead.isTest)
  const archivedLeads = leads.filter((lead) => lead.archivedAt)
  const selectedLead = selectedLeadId ? leads.find((lead) => lead.id === selectedLeadId) ?? null : null
  const selectedLeadEmailEvents = selectedLead ? emailEvents.filter((event) => event.lead_id === selectedLead.id) : []
  const selectedLeadCommunicationEvents = selectedLead ? communicationEvents.filter((event) => (event.lead_id ?? event.leadId) === selectedLead.id) : []
  const selectedBookingProfile = selectedBookingId
    ? storedBookings.find((booking) => booking.id === selectedBookingId || booking.leadId === selectedBookingId) ?? null
    : null
  const selectedBookingLead = selectedBookingId
    ? leads.find((lead): lead is GuestLead => lead.type === 'guest' && (lead.id === selectedBookingId || lead.id === selectedBookingProfile?.leadId)) ?? null
    : null
  const selectedPackage = selectedPackageId ? adminPackages.find((pkg) => pkg.id === selectedPackageId) ?? null : null
  const selectedExperiencePackage = selectedExperience ? adminPackages.find((pkg) => pkg.id === selectedExperience.packageId) ?? null : null
  const selectedExperienceItem = selectedExperiencePackage && selectedExperience
    ? selectedExperiencePackage.experienceItems.find((item) => item.id === selectedExperience.experienceId) ?? null
    : null
  const selectedExperienceProvider = selectedExperienceProviderId
    ? experienceProviders.find((provider) => provider.id === selectedExperienceProviderId) ?? null
    : null
  const selectedOwnerProperty = selectedOwnerPropertyId
    ? ownerProperties.find((property) => property.id === selectedOwnerPropertyId) ?? null
    : null
  const selectedAgency = selectedAgencyId ? agencies.find((agency) => agency.id === selectedAgencyId) ?? null : null
  const selectedLocalPlaceCandidate = selectedLocalPlaceCandidateId
    ? adminLocalPlaces.find((place) => place.id === selectedLocalPlaceCandidateId) ?? null
    : null
  const todayIso = new Date().toISOString().slice(0, 10)
  const isLeadDue = (lead: StoredLead) => Boolean(lead.followUpAt && lead.followUpAt <= todayIso)
  const leadWorkLabel = (lead: StoredLead) => {
    if (lead.archivedAt) return 'Archiviert'
    if (isLeadDue(lead)) return 'Heute nachfassen'
    if (lead.status === 'Neu') return 'Erstkontakt'
    if (lead.status === 'In Prüfung') return 'Prüfen'
    if (lead.status === 'Kontaktiert') return 'Rückmeldung'
    if (lead.status === 'Reserviert') return 'Reservierung sichern'
    if (lead.status === 'Bezahlt') return 'Zur Buchung'
    if (lead.status === 'Vor Anreise') return 'Vor Anreise'
    if (lead.status === 'Aktiv') return 'Aktiv begleiten'
    if (lead.status === 'Abgeschlossen') return 'Nachfassen'
    if (lead.status === 'Kein Interesse') return 'Verlustgrund prüfen'
    return 'Klären'
  }
  const leadWorkMeta = (lead: StoredLead) => {
    if (lead.followUpAt) return formatFollowUpDate(lead.followUpAt)
    if (lead.status === 'Neu') return 'noch ohne Wiedervorlage'
    if (lead.status === 'In Prüfung') return 'Prüfung offen'
    return lead.source ?? 'Quelle offen'
  }
  const filteredLeads = (leadScope === 'archived' ? archivedLeads : activeLeads)
    .filter((lead) => leadTypeFilter === 'all' || lead.type === leadTypeFilter)
    .filter((lead) => leadStatusFilter === 'all' || lead.status === leadStatusFilter)
    .filter((lead) => {
      if (leadWorkFilter === 'all') return true
      if (leadWorkFilter === 'due') return isLeadDue(lead)
      if (leadWorkFilter === 'new') return lead.status === 'Neu'
      return lead.status === 'In Prüfung'
    })
    .sort((a, b) => Number(isLeadDue(b)) - Number(isLeadDue(a)) || new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime())
  const guestLeads = realActiveLeads.filter((lead) => lead.type === 'guest')
  const ownerLeads = realActiveLeads.filter((lead) => lead.type === 'owner')
  const experienceProviderLeads = realActiveLeads.filter((lead) => lead.type === 'experience')
  const leadLabel = (lead: StoredLead) => {
    if (lead.type === 'guest') return lead.packageName
    if (lead.type === 'owner') return `${lead.propertyLocation} · ${lead.propertyType}`
    return `${lead.businessName} · ${lead.experienceType}`
  }
  const leadTypeLabel = (lead: StoredLead) => {
    if (lead.type === 'guest') return 'Gastanfrage'
    if (lead.type === 'owner') return 'Eigentümeranfrage'
    return 'Erlebnisanbieteranfrage'
  }
  const leadReferenceLabel = (lead: StoredLead) => `${leadTypeLabel(lead)} · ${leadLabel(lead)}`
  const saveAdminPackages = (nextPackages: MorrowPackage[]) => {
    setAdminPackages(nextPackages)
    localStorage.setItem(adminPackageStorageKey, JSON.stringify(nextPackages))
  }
  const syncAdminPackage = (packageItem: MorrowPackage) => {
    if (authMode !== 'supabase') return
    void upsertStoredPackage(packageItem).catch((error) => {
      console.warn('Morrow backend package save failed. Local state was updated.', error)
    })
  }
  const updatePackage = (id: string, updater: (pkg: MorrowPackage) => MorrowPackage) => {
    let changedPackage: MorrowPackage | null = null
    const nextPackages = adminPackages.map((pkg) => {
      if (pkg.id !== id) return pkg
      changedPackage = updater(pkg)
      return changedPackage
    })
    saveAdminPackages(nextPackages)
    if (changedPackage) syncAdminPackage(changedPackage)
  }
  const createPackageFromTemplate = (template = adminPackages[0]) => {
    if (!template) return
    const id = `pkg-${crypto.randomUUID()}`
    const name = 'Neue Auszeit'
    const slug = `${slugify(name)}-${crypto.randomUUID().slice(0, 8)}`
    const nextPackage: MorrowPackage = {
      ...template,
      id,
      slug,
      name,
      status: 'draft',
      headline: 'Neue Auszeit vorbereiten.',
      subline: 'Unterkunft, Erlebnis und Zielgruppe im Admin ausarbeiten.',
      shortPromise: 'Neue Auszeit als Entwurf vorbereiten.',
      story: 'Dieser Entwurf dient dazu, eine neue Auszeit strukturiert aufzubauen.',
      concretePrice: 'Preis offen',
      priceFrom: 'Preis offen',
      priceNote: 'Preislogik ergänzen',
      dates: ['Termin ergänzen'],
      included: ['Leistung ergänzen'],
      experienceItems: [],
    }

    saveAdminPackages([nextPackage, ...adminPackages])
    syncAdminPackage(nextPackage)
    setSelectedPackageId(id)
  }
  const duplicatePackage = (pkg: MorrowPackage) => {
    const id = `pkg-${crypto.randomUUID()}`
    const name = `${pkg.name} Kopie`
    const suffix = crypto.randomUUID().slice(0, 8)
    const duplicatedPackage: MorrowPackage = {
      ...pkg,
      id,
      slug: `${slugify(name)}-${suffix}`,
      name,
      status: 'draft',
      experienceItems: pkg.experienceItems.map((item) => ({ ...item, id: `${item.id}-${crypto.randomUUID().slice(0, 8)}` })),
    }

    saveAdminPackages([duplicatedPackage, ...adminPackages])
    syncAdminPackage(duplicatedPackage)
    setSelectedPackageId(id)
  }
  const togglePackagePaused = (id: string) => {
    updatePackage(id, (pkg) => ({ ...pkg, status: pkg.status === 'paused' ? 'published' : 'paused' }))
  }
  const deletePackage = (id: string) => {
    const pkg = adminPackages.find((item) => item.id === id)
    if (!pkg) return
    const linkedLeads = leads.filter((lead) => lead.type === 'guest' && (lead.packageSlug === pkg.slug || lead.packageName === pkg.name))
    if (linkedLeads.length > 0) {
      window.alert('Diese Auszeit ist mit Anfragen oder Buchungen verbunden. Pausiere sie stattdessen, damit keine Historie verloren geht.')
      return
    }
    const confirmed = window.confirm('Diese Auszeit wirklich entfernen? Das sollte nur für Entwürfe oder Testdaten genutzt werden.')
    if (!confirmed) return
    saveAdminPackages(adminPackages.filter((item) => item.id !== id))
    if (authMode === 'supabase') {
      void deleteStoredPackage(id).catch((error) => {
        console.warn('Morrow backend package delete failed. Local state was updated.', error)
      })
    }
    setSelectedPackageId(null)
  }
  const saveExperienceProviders = (nextProviders: ExperienceProviderProfile[]) => {
    setExperienceProviders(nextProviders)
    localStorage.setItem(adminExperienceProviderStorageKey, JSON.stringify(nextProviders))
  }
  const syncExperienceProvider = (provider: ExperienceProviderProfile) => {
    if (authMode !== 'supabase') return
    void upsertStoredExperienceProvider(provider).catch((error) => {
      console.warn('Morrow backend experience provider save failed. Local state was updated.', error)
    })
  }
  const updateExperienceProvider = (id: string, updates: Partial<ExperienceProviderProfile>) => {
    let changedProvider: ExperienceProviderProfile | null = null
    const nextProviders = experienceProviders.map((provider) => {
      if (provider.id !== id) return provider
      changedProvider = normalizeExperienceProvider({ ...provider, ...updates }, provider)
      return changedProvider
    })
    saveExperienceProviders(nextProviders)
    if (changedProvider) syncExperienceProvider(changedProvider)
  }
  const createExperienceProvider = () => {
    const id = `provider-${crypto.randomUUID()}`
    const nextProvider: ExperienceProviderProfile = {
      id,
      name: 'Neuer Erlebnisanbieter',
      contactName: '',
      email: '',
      phone: '',
      location: 'Sankt Peter-Ording',
      category: 'Kategorie ergänzen',
      audienceFit: 'Beide',
      status: 'lead',
      notes: 'Profil ergänzen und Passung zu Auszeiten prüfen.',
    }

    saveExperienceProviders([nextProvider, ...experienceProviders])
    syncExperienceProvider(nextProvider)
    setSelectedExperienceProviderId(id)
  }
  const toggleExperienceProviderPaused = (id: string) => {
    updateExperienceProvider(id, {
      status: experienceProviders.find((provider) => provider.id === id)?.status === 'paused' ? 'in-review' : 'paused',
    })
  }
  const deleteExperienceProvider = (id: string) => {
    const provider = experienceProviders.find((item) => item.id === id)
    if (!provider) return
    if (linkedExperienceCount(id) > 0) {
      window.alert('Dieser Anbieter ist mit Erlebnisbausteinen verbunden. Entferne zuerst die Verknüpfungen in den Auszeiten oder pausiere den Anbieter.')
      return
    }
    const confirmed = window.confirm('Diesen Erlebnisanbieter wirklich entfernen? Das sollte nur für Dubletten oder Testdaten genutzt werden.')
    if (!confirmed) return
    saveExperienceProviders(experienceProviders.filter((item) => item.id !== id))
    if (authMode === 'supabase') {
      void deleteStoredExperienceProvider(id).catch((error) => {
        console.warn('Morrow backend experience provider delete failed. Local state was updated.', error)
      })
    }
    setSelectedExperienceProviderId(null)
  }
  const importRawSpoExperienceProvider = (event: RawSpoEventCandidate) => {
    const providerName = rawSpoExperienceProviderName(event)
    const id = `provider-${slugify(providerName)}`
    const existingProvider = experienceProviders.find((provider) => provider.id === id || provider.name.toLowerCase() === providerName.toLowerCase())
    if (existingProvider) {
      setActiveSection('experienceProviders')
      setExperienceProviderStatusFilter('all')
      setSelectedExperienceProviderId(existingProvider.id)
      return
    }

    const nextProvider: ExperienceProviderProfile = {
      id,
      name: providerName,
      contactName: '',
      email: '',
      phone: '',
      location: event.town || event.place || 'Sankt Peter-Ording',
      category: rawSpoExperienceCategory(event),
      audienceFit: rawSpoExperienceAudienceFit(event),
      status: 'in-review',
      notes: [
        `Aus Rohkalender übernommen: ${event.title}`,
        event.dateLabel ? `Termin/Quelle: ${event.dateLabel}` : '',
        event.description ? `Beschreibung: ${event.description}` : '',
        event.detailUrl ? `Quelle: ${event.detailUrl}` : event.sourceUrl ? `Quelle: ${event.sourceUrl}` : '',
        'Nächster Schritt: Anbieter recherchieren, Kontakt-/Buchungsdaten pflegen und danach entscheiden, ob daraus ein Erlebnisbaustein für eine Auszeit wird.',
      ].filter(Boolean).join('\n'),
    }

    saveExperienceProviders([nextProvider, ...experienceProviders])
    syncExperienceProvider(nextProvider)
    setActiveSection('experienceProviders')
    setExperienceProviderStatusFilter('in-review')
    setSelectedExperienceProviderId(id)
  }
  const saveAdminLocalPlaces = (nextPlaces: LocalPlaceCandidate[]) => {
    setAdminLocalPlaces(nextPlaces)
    localStorage.setItem(adminLocalPlaceStorageKey, JSON.stringify(nextPlaces))
  }
  const syncAdminLocalPlace = (place: LocalPlaceCandidate) => {
    if (authMode !== 'supabase') return
    void upsertStoredLocalPlace(place).catch((error) => {
      console.warn('Morrow backend local place save failed. Local state was updated.', error)
    })
  }
  const updateLocalPlaceCandidate = (id: string, updates: Partial<LocalPlaceCandidate>) => {
    let changedPlace: LocalPlaceCandidate | null = null
    const nextPlaces = adminLocalPlaces.map((place) => {
      if (place.id !== id) return place
      changedPlace = normalizeLocalPlaceCandidate({ ...place, ...updates }, place)
      return changedPlace
    })
    saveAdminLocalPlaces(nextPlaces)
    if (changedPlace) syncAdminLocalPlace(changedPlace)
  }
  const importRawSpoEvent = (event: RawSpoEventCandidate) => {
    const eventDate = event.date ? event.date.slice(0, 10) : undefined
    const id = `event-${event.id}-${eventDate ?? 'date-open'}`
    const existingPlace = adminLocalPlaces.find((place) => place.id === id)
    if (existingPlace) {
      setSelectedLocalPlaceCandidateId(existingPlace.id)
      return
    }

    const nextPlace: LocalPlaceCandidate = {
      id,
      category: 'event',
      label: 'Veranstaltungen',
      title: event.title,
      description: event.description || 'Veranstaltung aus dem offiziellen SPO-Kalender. Vor Freigabe auf Passung zur Auszeit prüfen.',
      meta: 'Event-Kandidat',
      address: [event.place, event.town].filter(Boolean).join(', '),
      websiteUrl: event.detailUrl,
      photoUrls: event.imageUrl ? [event.imageUrl] : undefined,
      openingHours: event.dateLabel || 'Termin auf Quelle prüfen',
      eventStartDate: eventDate,
      eventEndDate: eventDate,
      eventTime: event.date?.slice(11, 16) ?? undefined,
      eventAudience: rawEventAudienceGuess(event),
      eventSetting: rawEventSettingGuess(event),
      eventFitNote: 'Bitte kuratieren: Passt dieses Event wirklich zur Auszeit, zur Zielgruppe und zum gewünschten Tagesrhythmus?',
      packageFit: rawEventAudienceGuess(event) === 'families'
        ? ['family_escape']
        : rawEventAudienceGuess(event) === 'couples'
          ? ['couple_reset']
          : ['family_escape', 'couple_reset'],
      routeNote: 'Vor Freigabe prüfen: Datum, Uhrzeit, Ticket/Anmeldung, Andrang, Wetter, Wege und ob es den Aufenthalt bereichert.',
      status: 'candidate',
      sourceUrl: event.detailUrl || event.sourceUrl,
      lat: event.lat,
      lng: event.lng,
    }

    saveAdminLocalPlaces([nextPlace, ...adminLocalPlaces])
    syncAdminLocalPlace(nextPlace)
    setLocalPlaceCategoryFilter('event')
    setLocalPlaceStatusFilter('candidate')
    setSelectedLocalPlaceCandidateId(id)
  }
  const createLocalPlaceCandidate = () => {
    const id = `local-${crypto.randomUUID()}`
    const nextPlace: LocalPlaceCandidate = {
      id,
      category: 'food',
      label: 'Essen',
      title: 'Neuer Ort',
      description: 'Kurz beschreiben, warum dieser Ort für eine Morrow-Auszeit relevant sein könnte.',
      meta: 'Kandidat',
      address: '',
      phone: '',
      email: '',
      websiteUrl: '',
      openingHours: 'Bitte tagesaktuell prüfen',
      routeNote: 'Vor Freigabe prüfen: Qualität, Öffnungszeiten, Reservierung, Zielgruppenfit und genaue Lage.',
      status: 'candidate',
    }

    saveAdminLocalPlaces([nextPlace, ...adminLocalPlaces])
    syncAdminLocalPlace(nextPlace)
    setSelectedLocalPlaceCandidateId(id)
  }
  const toggleLocalPlaceCandidatePaused = (id: string) => {
    updateLocalPlaceCandidate(id, {
      status: adminLocalPlaces.find((place) => place.id === id)?.status === 'paused' ? 'candidate' : 'paused',
    })
  }
  const deleteLocalPlaceCandidate = (id: string) => {
    const place = adminLocalPlaces.find((item) => item.id === id)
    if (!place) return
    const confirmed = window.confirm('Diesen Vor-Ort-Kandidaten wirklich entfernen? Für kuratierte, aber aktuell nicht passende Orte ist „Nicht passend“ meist besser.')
    if (!confirmed) return
    saveAdminLocalPlaces(adminLocalPlaces.filter((item) => item.id !== id))
    if (authMode === 'supabase') {
      void deleteStoredLocalPlace(id).catch((error) => {
        console.warn('Morrow backend local place delete failed. Local state was updated.', error)
      })
    }
    setSelectedLocalPlaceCandidateId(null)
  }
  const saveOwnerProperties = (nextProperties: OwnerPropertyProfile[]) => {
    setOwnerProperties(nextProperties)
    localStorage.setItem(adminOwnerPropertyStorageKey, JSON.stringify(nextProperties))
  }
  const syncOwnerProperty = (property: OwnerPropertyProfile) => {
    if (authMode !== 'supabase') return
    void upsertStoredOwnerProperty(property).catch((error) => {
      console.warn('Morrow backend owner property save failed. Local state was updated.', error)
    })
  }
  const updateOwnerProperty = (id: string, updates: Partial<OwnerPropertyProfile>) => {
    let changedProperty: OwnerPropertyProfile | null = null
    const nextProperties = ownerProperties.map((property) => {
      if (property.id !== id) return property
      changedProperty = normalizeOwnerProperty({ ...property, ...updates }, property)
      return changedProperty
    })
    saveOwnerProperties(nextProperties)
    if (changedProperty) syncOwnerProperty(changedProperty)
  }
  const createOwnerProperty = () => {
    const id = `property-${crypto.randomUUID()}`
    const nextProperty: OwnerPropertyProfile = {
      id,
      name: 'Neues Objekt',
      ownerName: '',
      email: '',
      phone: '',
      location: 'Sankt Peter-Ording',
      propertyType: 'Objekttyp ergänzen',
      sleeps: 2,
      status: 'lead',
      currentRental: 'agency',
      checkInType: 'unknown',
      latestArrival: '',
      notes: 'Objektprofil ergänzen und Passung zu Auszeiten prüfen.',
    }

    saveOwnerProperties([nextProperty, ...ownerProperties])
    syncOwnerProperty(nextProperty)
    setSelectedOwnerPropertyId(id)
  }
  const openOrCreateOwnerPropertyFromLead = (lead: OwnerLead) => {
    const existingProperty = ownerProperties.find((property) => (
      property.email.toLowerCase() === lead.email.toLowerCase()
      || (
        property.ownerName.toLowerCase() === lead.name.toLowerCase()
        && property.location.toLowerCase() === lead.propertyLocation.toLowerCase()
      )
    ))

    if (existingProperty) {
      setActiveSection('owners')
      setSelectedOwnerPropertyId(existingProperty.id)
      setSelectedLeadId(null)
      return
    }

    const id = `property-${crypto.randomUUID()}`
    const sleeps = Number.parseInt(lead.sleeps, 10)
    const nextProperty: OwnerPropertyProfile = {
      id,
      name: `${lead.propertyType || 'Objekt'} ${lead.propertyLocation ? `· ${lead.propertyLocation}` : ''}`.trim(),
      ownerName: lead.name,
      email: lead.email,
      phone: lead.phone,
      location: lead.propertyLocation || 'Sankt Peter-Ording',
      propertyType: lead.propertyType || 'Objekttyp ergänzen',
      sleeps: Number.isNaN(sleeps) ? 2 : sleeps,
      status: 'in-review',
      currentRental: lead.currentRental,
      checkInType: 'unknown',
      latestArrival: '',
      notes: [
        'Aus Eigentümeranfrage angelegt.',
        lead.listingUrl ? `Inserat: ${lead.listingUrl}` : '',
        lead.message ? `Nachricht: ${lead.message}` : '',
      ].filter(Boolean).join('\n'),
    }

    saveOwnerProperties([nextProperty, ...ownerProperties])
    syncOwnerProperty(nextProperty)
    onUpdateLead(lead.id, {
      status: lead.status === 'Neu' ? 'In Prüfung' : lead.status,
      internalNote: [lead.internalNote, 'Objektprofil im Admin angelegt.'].filter(Boolean).join('\n'),
    } as Partial<StoredLead>)
    setActiveSection('owners')
    setSelectedOwnerPropertyId(id)
    setSelectedLeadId(null)
  }
  const toggleOwnerPropertyPaused = (id: string) => {
    updateOwnerProperty(id, {
      status: ownerProperties.find((property) => property.id === id)?.status === 'paused' ? 'in-review' : 'paused',
    })
  }
  const deleteOwnerProperty = (id: string) => {
    const property = ownerProperties.find((item) => item.id === id)
    if (!property) return
    if (linkedPackageCount(id) > 0) {
      window.alert('Dieses Objekt ist mit einer Auszeit verbunden. Entferne zuerst die Verknüpfung in der Auszeit oder pausiere das Objekt.')
      return
    }
    const confirmed = window.confirm('Dieses Objekt wirklich entfernen? Das sollte nur für Dubletten oder Testdaten genutzt werden.')
    if (!confirmed) return
    saveOwnerProperties(ownerProperties.filter((item) => item.id !== id))
    const nextAgencies = agencies.map((agency) => ({
      ...agency,
      managedPropertyIds: agency.managedPropertyIds.filter((propertyId) => propertyId !== id),
    }))
    saveAgencies(nextAgencies)
    nextAgencies.forEach(syncAgency)
    if (authMode === 'supabase') {
      void deleteStoredOwnerProperty(id).catch((error) => {
        console.warn('Morrow backend owner property delete failed. Local state was updated.', error)
      })
    }
    setSelectedOwnerPropertyId(null)
  }
  const openOrCreateExperienceProviderFromLead = (lead: ExperienceLead) => {
    const existingProvider = experienceProviders.find((provider) => (
      provider.email.toLowerCase() === lead.email.toLowerCase()
      || provider.name.toLowerCase() === lead.businessName.toLowerCase()
    ))

    if (existingProvider) {
      setActiveSection('experienceProviders')
      setSelectedExperienceProviderId(existingProvider.id)
      setSelectedLeadId(null)
      return
    }

    const id = `provider-${crypto.randomUUID()}`
    const nextProvider: ExperienceProviderProfile = {
      id,
      name: lead.businessName || lead.name,
      contactName: lead.name,
      email: lead.email,
      phone: lead.phone,
      location: lead.location || 'Sankt Peter-Ording',
      category: lead.experienceType || 'Kategorie ergänzen',
      audienceFit: lead.audienceFit,
      status: 'in-review',
      notes: [
        'Aus Erlebnisanbieteranfrage angelegt.',
        lead.link ? `Link: ${lead.link}` : '',
        lead.description ? `Beschreibung: ${lead.description}` : '',
        lead.message ? `Nachricht: ${lead.message}` : '',
      ].filter(Boolean).join('\n'),
    }

    saveExperienceProviders([nextProvider, ...experienceProviders])
    syncExperienceProvider(nextProvider)
    onUpdateLead(lead.id, {
      status: lead.status === 'Neu' ? 'In Prüfung' : lead.status,
      internalNote: [lead.internalNote, 'Erlebnisanbieterprofil im Admin angelegt.'].filter(Boolean).join('\n'),
    } as Partial<StoredLead>)
    setActiveSection('experienceProviders')
    setSelectedExperienceProviderId(id)
    setSelectedLeadId(null)
  }
  const createCommunicationEvent = (event: Omit<CommunicationEvent, 'id' | 'created_at' | 'status'> & { status?: string }) => {
    const now = new Date().toISOString()
    const nextEvent: CommunicationEvent = {
      ...event,
      id: crypto.randomUUID(),
      status: event.status ?? 'recorded',
      created_at: now,
      updated_at: now,
    }

    setCommunicationEvents((current) => [nextEvent, ...current])
    if (authMode !== 'supabase') return

    void createStoredCommunicationEvent({
      ...nextEvent,
      leadId: nextEvent.leadId ?? nextEvent.lead_id ?? undefined,
      bookingId: nextEvent.bookingId ?? nextEvent.booking_id ?? undefined,
      customerId: nextEvent.customerId ?? nextEvent.customer_id ?? undefined,
      eventType: nextEvent.eventType ?? nextEvent.event_type ?? 'note',
      providerMessageId: nextEvent.providerMessageId ?? nextEvent.provider_message_id ?? undefined,
    }).catch((error) => {
      console.warn('Morrow backend communication event save failed. Local state was updated.', error)
    })
  }
  const saveAdminTasks = (nextTasks: AdminTask[]) => {
    setAdminTasks(nextTasks)
    localStorage.setItem(adminTaskStorageKey, JSON.stringify(nextTasks))
  }
  const syncAdminTask = (task: AdminTask) => {
    if (authMode !== 'supabase') return
    void upsertStoredAdminTask(task).catch((error) => {
      console.warn('Morrow backend task save failed. Local state was updated.', error)
    })
  }
  const createAdminTask = (task: Omit<AdminTask, 'id' | 'status' | 'createdAt'>) => {
    const nextTask: AdminTask = {
      ...task,
      id: `task-${crypto.randomUUID()}`,
      status: 'open',
      createdAt: new Date().toISOString(),
    }

    saveAdminTasks([nextTask, ...adminTasks])
    syncAdminTask(nextTask)
  }
  const updateAdminTask = (id: string, updates: Partial<AdminTask>) => {
    let changedTask: AdminTask | null = null
    const nextTasks = adminTasks.map((task) => {
      if (task.id !== id) return task
      changedTask = { ...task, ...updates }
      return changedTask
    })
    saveAdminTasks(nextTasks)
    if (changedTask) syncAdminTask(changedTask)
  }
  const deleteAdminTask = (id: string) => {
    saveAdminTasks(adminTasks.filter((task) => task.id !== id))
    if (authMode !== 'supabase') return
    void deleteStoredAdminTask(id).catch((error) => {
      console.warn('Morrow backend task delete failed. Local state was updated.', error)
    })
  }
  const toggleAdminTaskStatus = (id: string) => {
    const currentTask = adminTasks.find((task) => task.id === id)
    if (!currentTask) return
    updateAdminTask(id, currentTask.status === 'done'
      ? { status: 'open', completedAt: undefined }
      : { status: 'done', completedAt: new Date().toISOString() })
  }
  const moveAdminTaskInProgress = (id: string) => {
    updateAdminTask(id, { status: 'in_progress', completedAt: undefined })
  }
  const saveAgencies = (nextAgencies: AgencyProfile[]) => {
    setAgencies(nextAgencies)
    localStorage.setItem(adminAgencyStorageKey, JSON.stringify(nextAgencies))
  }
  const syncAgency = (agency: AgencyProfile) => {
    if (authMode !== 'supabase') return
    void upsertStoredAgency(agency).catch((error) => {
      console.warn('Morrow backend agency save failed. Local state was updated.', error)
    })
  }
  const updateAgency = (id: string, updates: Partial<AgencyProfile>) => {
    let changedAgency: AgencyProfile | null = null
    const nextAgencies = agencies.map((agency) => {
      if (agency.id !== id) return agency
      changedAgency = normalizeAgency({ ...agency, ...updates }, agency)
      return changedAgency
    })
    saveAgencies(nextAgencies)
    if (changedAgency) syncAgency(changedAgency)
  }
  const createAgency = () => {
    const id = `agency-${crypto.randomUUID()}`
    const nextAgency: AgencyProfile = {
      id,
      name: 'Neue Agentur',
      contactName: '',
      email: '',
      phone: '',
      location: 'Sankt Peter-Ording',
      status: 'lead',
      managedPropertyIds: [],
      responseDueDays: 2,
      availableDatesNote: 'Freie Termine und Objektzugang klären.',
      notes: 'Agenturprofil ergänzen und Startpotenzial prüfen.',
    }

    saveAgencies([nextAgency, ...agencies])
    syncAgency(nextAgency)
    setSelectedAgencyId(id)
  }
  const toggleAgencyPaused = (id: string) => {
    updateAgency(id, {
      status: agencies.find((agency) => agency.id === id)?.status === 'paused' ? 'active' : 'paused',
    })
  }
  const deleteAgency = (id: string) => {
    const agency = agencies.find((item) => item.id === id)
    if (!agency) return
    if (agency.managedPropertyIds.length > 0) {
      window.alert('Diese Agentur betreut noch Objekte. Entferne zuerst die Objektverknüpfungen oder pausiere die Agentur.')
      return
    }
    const confirmed = window.confirm('Diese Agentur wirklich entfernen? Das sollte nur für Dubletten oder Testdaten genutzt werden.')
    if (!confirmed) return
    saveAgencies(agencies.filter((item) => item.id !== id))
    if (authMode === 'supabase') {
      void deleteStoredAgency(id).catch((error) => {
        console.warn('Morrow backend agency delete failed. Local state was updated.', error)
      })
    }
    setSelectedAgencyId(null)
  }
  const upcomingDates = adminPackages.map((pkg) => ({
    id: pkg.id,
    packageName: pkg.name,
    stayName: pkg.stay.name,
    dates: pkg.dates,
  }))
  const reviewCount = realActiveLeads.filter((lead) => lead.status === 'In Prüfung').length
  const dueFollowUps = realActiveLeads
    .filter((lead) => lead.followUpAt && lead.followUpAt <= todayIso)
    .sort((a, b) => (a.followUpAt ?? '').localeCompare(b.followUpAt ?? ''))
  const activeAdminTasks = adminTasks.filter((task) => task.status !== 'done')
  const supportTasks = activeAdminTasks.filter(isGuestSupportTask)
  const allSupportTasks = adminTasks.filter(isGuestSupportTask)
  const filteredSupportTasks = allSupportTasks
    .filter((task) => supportStatusFilter === 'all' || task.status === supportStatusFilter)
    .sort((a, b) => Number(a.status === 'done') - Number(b.status === 'done') || a.dueAt.localeCompare(b.dueAt) || b.createdAt.localeCompare(a.createdAt))
  const dueTasks = activeAdminTasks
    .filter((task) => task.dueAt && task.dueAt <= todayIso)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
  const upcomingTasks = activeAdminTasks.filter((task) => task.dueAt && task.dueAt > todayIso)
  const taskReferenceFilters: { value: TaskReferenceFilter; label: string }[] = [
    { value: 'all', label: 'Alle' },
    { value: 'support', label: 'Gästesupport' },
    { value: 'lead', label: 'Anfragen' },
    { value: 'booking', label: 'Buchungen' },
    { value: 'package', label: 'Auszeiten' },
    { value: 'experience', label: 'Erlebnisse' },
    { value: 'localPlace', label: 'Vor Ort' },
    { value: 'owner', label: 'Eigentümer' },
    { value: 'experienceProvider', label: 'Erlebnisanbieter' },
  ]
  const taskReferenceOptions: TaskReferenceOption[] = [
    ...realActiveLeads.map((lead) => ({
      value: `lead:${lead.id}`,
      type: 'lead' as AdminTaskReferenceType,
      id: lead.id,
      label: `${lead.name} · ${leadReferenceLabel(lead)}`,
    })),
    ...leads
      .filter((lead): lead is GuestLead => lead.type === 'guest' && ['Reserviert', 'Bezahlt', 'Vor Anreise', 'Aktiv', 'Abgeschlossen', 'Storniert'].includes(lead.status))
      .map((lead) => ({
      value: `booking:${lead.id}`,
      type: 'booking' as AdminTaskReferenceType,
      id: lead.id,
      label: `${lead.name} · ${lead.packageName}`,
    })),
    ...adminPackages.map((pkg) => ({
      value: `package:${pkg.id}`,
      type: 'package' as AdminTaskReferenceType,
      id: pkg.id,
      label: `${pkg.name} · ${pkg.location}`,
    })),
    ...adminPackages.flatMap((pkg) => pkg.experienceItems.map((item) => ({
      value: `experience:${pkg.id}:${item.id}`,
      type: 'experience' as AdminTaskReferenceType,
      id: `${pkg.id}:${item.id}`,
      label: `${item.title} · ${pkg.name}`,
    }))),
    ...adminLocalPlaces.map((place) => ({
      value: `localPlace:${place.id}`,
      type: 'localPlace' as AdminTaskReferenceType,
      id: place.id,
      label: `${place.title} · ${localPlaceCategoryLabels[place.category]}`,
    })),
    ...ownerProperties.map((property) => ({
      value: `owner:${property.id}`,
      type: 'owner' as AdminTaskReferenceType,
      id: property.id,
      label: `${property.name} · ${property.ownerName || 'Eigentümer offen'}`,
    })),
    ...experienceProviders.map((provider) => ({
      value: `experienceProvider:${provider.id}`,
      type: 'experienceProvider' as AdminTaskReferenceType,
      id: provider.id,
      label: `${provider.name} · ${provider.category}`,
    })),
  ]
  const selectedTaskReference = taskReferenceOptions.find((option) => option.value === taskCreateDraft.referenceValue) ?? taskReferenceOptions[0]
  const filteredTasks = [...adminTasks]
    .filter((task) => taskStatusFilter === 'all' || task.status === taskStatusFilter)
    .filter((task) => {
      if (taskReferenceFilter === 'all') return true
      if (taskReferenceFilter === 'support') return isGuestSupportTask(task)
      return task.referenceType === taskReferenceFilter
    })
    .filter((task) => taskPriorityFilter === 'all' || task.priority === taskPriorityFilter)
    .sort((a, b) => Number(a.status === 'done') - Number(b.status === 'done') || a.dueAt.localeCompare(b.dueAt))
  const newLeads = realActiveLeads
    .filter((lead) => lead.status === 'Neu')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const bookingStatusValues: LeadStatus[] = ['Reserviert', 'Bezahlt', 'Vor Anreise', 'Aktiv', 'Abgeschlossen', 'Storniert']
  const guestCustomerMap = leads
    .filter((lead): lead is GuestLead => lead.type === 'guest' && !lead.archivedAt && lead.status !== 'Kein Interesse')
    .reduce((map, lead) => {
      const key = lead.email.toLowerCase()
      const existing = map.get(key)
      map.set(key, {
        id: key,
        name: existing?.name ?? lead.name,
        email: lead.email,
        phone: existing?.phone ?? lead.phone,
        preferredChannel: 'email',
        whatsappOptIn: Boolean(existing?.whatsappOptIn || lead.whatsappOptIn),
        guestType: lead.packageSlug === 'family-escape' ? 'Familie' : 'Paar',
        requests: [...(existing?.requests ?? []), lead],
      })
      return map
    }, new Map<string, CustomerProfile>())
  const derivedCustomerRows = [...guestCustomerMap.values()]
    .map((customer) => ({
      ...customer,
      requests: [...customer.requests].sort((a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime()),
    }))
    .sort((a, b) => {
      const aDue = a.requests.some((request) => request.followUpAt && request.followUpAt <= todayIso)
      const bDue = b.requests.some((request) => request.followUpAt && request.followUpAt <= todayIso)
      const aBooked = a.requests.some((request) => bookingStatusValues.includes(request.status))
      const bBooked = b.requests.some((request) => bookingStatusValues.includes(request.status))
      return Number(bDue) - Number(aDue)
        || Number(bBooked) - Number(aBooked)
        || new Date(b.requests[0]?.updatedAt ?? b.requests[0]?.createdAt ?? 0).getTime() - new Date(a.requests[0]?.updatedAt ?? a.requests[0]?.createdAt ?? 0).getTime()
        || a.name.localeCompare(b.name)
    })
  const customerRows = (storedCustomers.length > 0 ? storedCustomers : derivedCustomerRows)
    .map((customer) => ({
      ...customer,
      requests: [...customer.requests].sort((a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime()),
    }))
    .sort((a, b) => {
      const aDue = a.requests.some((request) => request.followUpAt && request.followUpAt <= todayIso)
      const bDue = b.requests.some((request) => request.followUpAt && request.followUpAt <= todayIso)
      const aBooked = a.requests.some((request) => bookingStatusValues.includes(request.status))
      const bBooked = b.requests.some((request) => bookingStatusValues.includes(request.status))
      return Number(bDue) - Number(aDue)
        || Number(bBooked) - Number(aBooked)
        || new Date(b.requests[0]?.updatedAt ?? b.requests[0]?.createdAt ?? 0).getTime() - new Date(a.requests[0]?.updatedAt ?? a.requests[0]?.createdAt ?? 0).getTime()
        || a.name.localeCompare(b.name)
    })
  const selectedCustomer = selectedCustomerId ? customerRows.find((customer) => customer.id === selectedCustomerId) ?? null : null
  const derivedBookingRows: BookingProfile[] = leads
    .filter((lead): lead is GuestLead => lead.type === 'guest' && bookingStatusValues.includes(lead.status))
    .map((lead) => {
      const packageItem = adminPackages.find((pkg) => pkg.slug === lead.packageSlug || pkg.name === lead.packageName)

      return {
        id: lead.id,
        customerName: lead.name,
        email: lead.email,
        phone: lead.phone,
        packageName: lead.packageName,
        packageSlug: lead.packageSlug,
        packageItem,
        selectedDate: lead.selectedDate,
        status: lead.status as BookingStatus,
        paymentStatus: bookingPaymentStatus(lead.status),
        guests: lead.guests,
        dog: lead.dog,
        reservationExpiresAt: lead.reservationExpiresAt,
        paymentDueAt: lead.paymentDueAt,
        followUpAt: lead.followUpAt,
        internalNote: lead.internalNote,
        checkInStatus: lead.checkInStatus,
        experienceStatus: lead.experienceStatus,
      }
    })
    .sort((a, b) => a.selectedDate.localeCompare(b.selectedDate))
  const bookingRows: BookingProfile[] = (storedBookings.length > 0 ? storedBookings : derivedBookingRows)
    .map((booking) => normalizeStoredBooking(booking, adminPackages, leads))
    .sort((a, b) => a.selectedDate.localeCompare(b.selectedDate))
  const realCustomerRows = customerRows.filter((customer) => !customer.isTest)
  const realBookingRows = bookingRows.filter((booking) => !booking.isTest)
  const customerHasBooking = (customer: CustomerProfile) => customer.requests.some((request) => bookingStatusValues.includes(request.status))
  const customerHasDueFollowUp = (customer: CustomerProfile) => customer.requests.some((request) => request.followUpAt && request.followUpAt <= todayIso)
  const customerLatestRequest = (customer: CustomerProfile) => customer.requests[0]
  const customerLifecycleLabel = (customer: CustomerProfile) => {
    const bookedRequest = customer.requests.find((request) => bookingStatusValues.includes(request.status))
    if (bookedRequest) return bookedRequest.status
    return customerLatestRequest(customer)?.status ?? 'Offen'
  }
  const customerNextStepLabel = (customer: CustomerProfile) => {
    const latestRequest = customerLatestRequest(customer)
    if (!latestRequest) return 'Kontakt prüfen'
    if (customerHasDueFollowUp(customer)) return 'Heute nachfassen'
    if (latestRequest.status === 'Neu') return 'Erstkontakt vorbereiten'
    if (latestRequest.status === 'In Prüfung') return 'Auszeit prüfen'
    if (latestRequest.status === 'Kontaktiert') return 'Rückmeldung abwarten'
    if (latestRequest.status === 'Reserviert') return 'Reservierung sichern'
    if (['Bezahlt', 'Vor Anreise', 'Aktiv'].includes(latestRequest.status)) return 'Aufenthalt begleiten'
    if (latestRequest.status === 'Abgeschlossen') return 'Nachfassen'
    return 'Kontakt prüfen'
  }
  const customerSourceLabel = (customer: CustomerProfile) => customerLatestRequest(customer)?.source ?? 'Quelle offen'
  const customerBookings = (customer: CustomerProfile) => bookingRows.filter((booking) => booking.email.toLowerCase() === customer.email.toLowerCase())
  const customerOpenRequests = (customer: CustomerProfile) => customer.requests.filter((request) => !bookingStatusValues.includes(request.status))
  const filteredCustomerRows = customerRows
    .filter((customer) => customerTypeFilter === 'all' || customer.guestType === customerTypeFilter)
    .filter((customer) => {
      if (customerPhaseFilter === 'all') return true
      if (customerPhaseFilter === 'booking') return customerHasBooking(customer)
      if (customerPhaseFilter === 'request') return !customerHasBooking(customer)
      return customerHasDueFollowUp(customer)
    })
  const bookingOpenItems = (booking: BookingProfile) => {
    if (['Abgeschlossen', 'Storniert'].includes(booking.status)) return []
    const items: string[] = []
    if (booking.paymentStatus === 'Offen') items.push('Zahlung offen')
    const checkInStatus = booking.checkInStatus ?? 'offen'
    if (checkInStatus === 'offen') items.push('Check-in vorbereiten')
    if (checkInStatus === 'vorbereitet') items.push('Check-in freigeben')
    const experienceStatus = booking.experienceStatus ?? 'offen'
    if (experienceStatus === 'offen') items.push('Erlebnis klären')
    if (experienceStatus === 'angefragt') items.push('Erlebnis bestätigen')
    if (booking.reservationExpiresAt && booking.reservationExpiresAt <= todayIso && booking.paymentStatus === 'Offen') items.push('Reservierung prüfen')
    if (booking.followUpAt && booking.followUpAt <= todayIso) items.push('Heute fällig')
    const guestPrepOpenCount = bookingMissingGuestPreparationItems(booking).filter((item) => item.id !== 'payment' && item.id !== 'checkin' && item.id !== 'experience').length
    if (guestPrepOpenCount > 0) items.push('Gästebereich vorbereiten')
    return items
  }
  const bookingPriorityScore = (booking: BookingProfile) => {
    const openItems = bookingOpenItems(booking)
    const urgentBonus = openItems.includes('Heute fällig') || openItems.includes('Reservierung prüfen') ? 10 : 0
    return urgentBonus + openItems.length
  }
  const filteredBookingRows = bookingRows
    .filter((booking) => bookingStatusFilter === 'all' || booking.status === bookingStatusFilter)
    .filter((booking) => bookingPackageFilter === 'all' || booking.packageSlug === bookingPackageFilter || booking.packageName === bookingPackageFilter)
    .sort((a, b) => bookingPriorityScore(b) - bookingPriorityScore(a) || a.selectedDate.localeCompare(b.selectedDate))
  const bookingPrimaryAction = (booking: BookingProfile) => {
    const missingPrep = bookingMissingGuestPreparationItems(booking)
    const supportCount = activeAdminTasks.filter((task) => (
      task.referenceType === 'booking' && task.referenceId === booking.id && isGuestSupportTask(task)
    )).length

    if (supportCount > 0) return 'Gästesupport klären'
    if (booking.paymentStatus === 'Offen') return 'Zahlung klären'
    if ((booking.checkInStatus ?? 'offen') !== 'freigegeben') return 'Check-in freigeben'
    if ((booking.experienceStatus ?? 'offen') !== 'bestätigt') return 'Erlebnis bestätigen'
    if (missingPrep.length > 0) return 'Gästebereich vervollständigen'
    if (booking.status === 'Aktiv') return 'Aufenthalt begleiten'
    if (booking.status === 'Abgeschlossen') return 'Nachbereitung prüfen'
    return 'Bereit für den Gast'
  }
  const bookingUrgencyLabel = (booking: BookingProfile) => {
    const openItems = bookingOpenItems(booking)
    const supportCount = activeAdminTasks.filter((task) => (
      task.referenceType === 'booking' && task.referenceId === booking.id && isGuestSupportTask(task)
    )).length
    if (supportCount > 0) return 'Support'
    if (openItems.includes('Reservierung prüfen') || openItems.includes('Heute fällig')) return 'Heute'
    if (openItems.length > 0) return 'Offen'
    return 'Bereit'
  }
  const bookingUrgencyClass = (booking: BookingProfile) => {
    const label = bookingUrgencyLabel(booking)
    if (label === 'Support') return 'is-support'
    if (label === 'Heute') return 'is-critical'
    if (label === 'Offen') return 'is-open'
    return 'is-ready'
  }
  const bookingsWithOpenOps = realBookingRows.filter((booking) => bookingOpenItems(booking).length > 0)
  const bookingsWithGuestPrepOpen = realBookingRows.filter((booking) => bookingMissingGuestPreparationItems(booking).length > 0)
  const bookingsDueToday = realBookingRows.filter((booking) => booking.followUpAt && booking.followUpAt <= todayIso)
  const countByValue = <T extends string>(items: T[]) => items.reduce((map, item) => {
    map.set(item, (map.get(item) ?? 0) + 1)
    return map
  }, new Map<T, number>())
  const topEntryLabel = <T extends string>(entries: Map<T, number>, fallback: string) => {
    const topEntry = [...entries.entries()].sort((a, b) => b[1] - a[1])[0]
    return topEntry ? `${topEntry[0]} · ${topEntry[1]}` : fallback
  }
  const leadSourceCounts = countByValue(realActiveLeads.map((lead) => lead.source ?? 'Direkt'))
  const lostLeadReasonCounts = countByValue(realActiveLeads
    .filter((lead) => ['Kein Interesse', 'Storniert'].includes(lead.status))
    .map((lead) => lead.lossReason ?? 'Nicht gepflegt'))
  const bookedGuestLeads = realBookingRows.filter((booking) => booking.status !== 'Storniert').length
  const taskTimingLabel = (task: AdminTask) => {
    if (task.status === 'done') return 'erledigt'
    if (!task.dueAt) return 'ohne Datum'
    if (task.dueAt < todayIso) return 'überfällig'
    if (task.dueAt === todayIso) return 'heute'
    return 'demnächst'
  }
  const taskTimingClass = (task: AdminTask) => {
    const label = taskTimingLabel(task)
    if (label === 'überfällig') return 'is-overdue'
    if (label === 'heute') return 'is-today'
    if (label === 'erledigt') return 'is-done'
    return 'is-upcoming'
  }
  const submitTaskFromAdmin = () => {
    const reference = selectedTaskReference
    if (!taskCreateDraft.title.trim() || !reference) return
    createAdminTask({
      title: taskCreateDraft.title.trim(),
      referenceType: reference.type,
      referenceId: reference.id,
      referenceLabel: reference.label,
      dueAt: taskCreateDraft.dueAt || todayIso,
      priority: taskCreateDraft.priority,
      note: taskCreateDraft.note.trim() || undefined,
    })
    setTaskCreateDraft({
      title: '',
      referenceValue: reference.value,
      dueAt: todayIso,
      priority: 'medium',
      note: '',
    })
  }
  const createLocalPlaceCurationTask = (place: LocalPlaceCandidate) => {
    const existingTask = adminTasks.find((task) => (
      task.status === 'open' && task.referenceType === 'localPlace' && task.referenceId === place.id
    ))
    if (existingTask) {
      setTaskStatusFilter('open')
      setTaskReferenceFilter('localPlace')
      setActiveSection('tasks')
      return
    }

    const issues = localPlaceReviewIssues(place)
    createAdminTask({
      title: place.category === 'event' ? `Event kuratieren: ${place.title}` : `Ort kuratieren: ${place.title}`,
      referenceType: 'localPlace',
      referenceId: place.id,
      referenceLabel: `${place.title} · ${localPlaceCategoryLabels[place.category]}`,
      dueAt: todayIso,
      priority: place.category === 'event' || issues.length > 0 ? 'high' : 'medium',
      note: issues.length > 0 ? `Offen: ${issues.join(', ')}` : 'Freigabebereiten Kandidaten final prüfen.',
    })
    setTaskStatusFilter('open')
    setTaskReferenceFilter('localPlace')
    setActiveSection('tasks')
  }
  const openTaskReference = (task: AdminTask) => {
    if (task.referenceType === 'booking') {
      setSelectedBookingId(task.referenceId)
      return
    }
    if (task.referenceType === 'lead') {
      setSelectedLeadId(task.referenceId)
      return
    }
    if (task.referenceType === 'package') {
      setSelectedPackageId(task.referenceId)
      return
    }
    if (task.referenceType === 'owner') {
      setSelectedOwnerPropertyId(task.referenceId)
      return
    }
    if (task.referenceType === 'experienceProvider') {
      setSelectedExperienceProviderId(task.referenceId)
      return
    }
    if (task.referenceType === 'experience') {
      const [packageId, experienceId] = task.referenceId.split(':')
      if (packageId && experienceId) setSelectedExperience({ packageId, experienceId })
      return
    }
    if (task.referenceType === 'localPlace') {
      setActiveSection('localPlaces')
      setSelectedLocalPlaceCandidateId(task.referenceId)
      return
    }
    setActiveSection('tasks')
  }
  const providerForExperience = (item: MorrowPackage['experienceItems'][number]) => {
    if (item.providerId) return experienceProviders.find((provider) => provider.id === item.providerId)
    const providerName = item.providerName?.trim().toLowerCase()
    if (providerName) {
      const providerByName = experienceProviders.find((provider) => provider.name.toLowerCase() === providerName)
      if (providerByName) return providerByName
    }

    const haystack = `${item.title} ${item.guestNotes}`.toLowerCase()
    const genericProviderTokens = new Set(['private', 'session', 'studio', 'geführte', 'gefuehrte', 'anbieter'])
    return experienceProviders.find((provider) => {
      const tokens = `${provider.name} ${provider.category}`
        .toLowerCase()
        .split(/[^a-zäöüß0-9]+/i)
        .filter((token) => token.length >= 4)
        .filter((token) => !genericProviderTokens.has(token))

      return tokens.some((token) => haystack.includes(token))
    })
  }
  const experienceRows = adminPackages.flatMap((pkg) => pkg.experienceItems.map((item) => ({
    ...item,
    packageId: pkg.id,
    packageName: pkg.name,
    packageAudience: pkg.audience,
    providerProfile: providerForExperience(item),
  })))
  const filteredExperienceRows = experienceRows
    .filter((item) => experiencePackageFilter === 'all' || item.packageId === experiencePackageFilter)
    .filter((item) => experienceRoleFilter === 'all' || item.role === experienceRoleFilter)
    .filter((item) => experienceConfirmationFilter === 'all' || item.confirmationStatus === experienceConfirmationFilter)
    .filter((item) => {
      if (experienceProviderFilter === 'all') return true
      if (experienceProviderFilter === 'none') return !item.providerId && !item.providerName
      return item.providerProfile?.id === experienceProviderFilter
    })
    .sort((a, b) => {
      const score = (item: typeof experienceRows[number]) => {
        if (!item.providerProfile && !item.providerName) return 0
        if (item.confirmationStatus === 'planned') return 1
        if (item.confirmationStatus === 'requested') return 2
        return 3
      }
      return score(a) - score(b)
    })
  const filteredExperienceProviders = experienceProviders.filter((provider) => (
    experienceProviderStatusFilter === 'all' || provider.status === experienceProviderStatusFilter
  ))
  const filteredLocalPlaceCandidates = adminLocalPlaces
    .filter((place) => localPlaceCategoryFilter === 'all' || place.category === localPlaceCategoryFilter)
    .filter((place) => localPlaceStatusFilter === 'all' || place.status === localPlaceStatusFilter)
    .filter((place) => {
      if (localPlaceReviewFilter === 'all') return true
      const issueCount = localPlaceReviewIssues(place).length
      if (localPlaceReviewFilter === 'needsReview') return place.status === 'candidate' && issueCount > 0
      if (localPlaceReviewFilter === 'ready') return place.status === 'candidate' && issueCount === 0
      if (localPlaceReviewFilter === 'visible') return place.status === 'approved' && Boolean(place.lat && place.lng)
      if (localPlaceReviewFilter === 'rejected') return place.status === 'rejected'
      return true
    })
    .sort((a, b) => {
      const statusScore = (status: LocalPlaceStatus) => status === 'candidate' ? 0 : status === 'approved' ? 1 : status === 'paused' ? 2 : 3
      return statusScore(a.status) - statusScore(b.status)
        || localPlaceReviewIssues(b).length - localPlaceReviewIssues(a).length
        || a.category.localeCompare(b.category)
        || a.title.localeCompare(b.title)
    })
  const importedEventIds = new Set(adminLocalPlaces.filter((place) => place.category === 'event').map((place) => place.id))
  const eventImportTowns = Array.from(new Set(rawSpoEvents.map((event) => event.town || event.place).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b))
  const filteredRawSpoEvents = rawSpoEvents
    .filter((event) => {
      const query = eventImportSearch.trim().toLowerCase()
      if (!query) return true
      return `${event.title} ${event.place} ${event.town} ${event.groups?.join(' ')} ${event.themes?.join(' ')} ${event.description}`.toLowerCase().includes(query)
    })
    .filter((event) => eventImportTown === 'all' || event.town === eventImportTown || event.place === eventImportTown)
    .filter((event) => !eventImportDateFrom || !event.date || event.date.slice(0, 10) >= eventImportDateFrom)
    .filter((event) => !eventImportDateTo || !event.date || event.date.slice(0, 10) <= eventImportDateTo)
  const localPlacesReadyForGuest = adminLocalPlaces.filter((place) => place.status === 'approved' && place.lat && place.lng)
  const localPlacesMissingLocation = adminLocalPlaces.filter((place) => !place.lat || !place.lng)
  const eventCandidates = adminLocalPlaces.filter((place) => place.category === 'event')
  const eventReadyForReview = eventCandidates.filter((place) => place.status === 'candidate' && localPlaceReviewIssues(place).length === 0)
  const eventNeedsCuration = eventCandidates.filter((place) => place.status === 'candidate' && localPlaceReviewIssues(place).length > 0)
  const rawBookableExperienceCount = rawSpoEvents.filter((event) => rawSpoImportKind(event) === 'bookable-experience').length
  const rawPublicEventCount = rawSpoEvents.length - rawBookableExperienceCount
  const filteredPackages = adminPackages
    .filter((pkg) => packageAudienceFilter === 'all' || pkg.audience === packageAudienceFilter)
    .filter((pkg) => packageStatusFilter === 'all' || pkg.status === packageStatusFilter)
  const filteredOwnerProperties = ownerProperties.filter((property) => (
    ownerStatusFilter === 'all' || property.status === ownerStatusFilter
  ))
  const filteredAgencies = agencies.filter((agency) => agencyStatusFilter === 'all' || agency.status === agencyStatusFilter)
  const agencyForProperty = (propertyId: string) => agencies.find((agency) => agency.managedPropertyIds.includes(propertyId))
  const formatLeadDate = (value: string) => new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
  const formatFollowUpDate = (value: string) => new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'long',
  }).format(new Date(`${value}T12:00:00`))
  const adminSections: { id: AdminSection; label: string }[] = [
    { id: 'overview', label: 'Übersicht' },
    { id: 'leads', label: 'Anfragen' },
    { id: 'tasks', label: 'Aufgaben' },
    { id: 'guestSupport', label: 'Gästesupport' },
    { id: 'customers', label: 'Kunden' },
    { id: 'bookings', label: 'Buchungen' },
    { id: 'packages', label: 'Auszeiten' },
    { id: 'experiences', label: 'Erlebnisse' },
    { id: 'localPlaces', label: 'Vor Ort' },
    { id: 'owners', label: 'Eigentümer' },
    { id: 'agencies', label: 'Agenturen' },
    { id: 'experienceProviders', label: 'Erlebnisanbieter' },
  ]
  const sectionIntro: Record<AdminSection, { title: string; text: string }> = {
    overview: {
      title: 'Übersicht',
      text: 'Was heute Aufmerksamkeit braucht: neue Anfragen, offene Prüfungen, aktive Auszeiten und kommende Termine.',
    },
    leads: {
      title: 'Anfragen',
      text: 'Alle eingehenden Leads prüfen, einordnen und in den nächsten sinnvollen Status bewegen.',
    },
    tasks: {
      title: 'Aufgaben',
      text: 'Operative To-dos aus Anfragen, Buchungen, Auszeiten und Partnerarbeit an einem Ort steuern.',
    },
    guestSupport: {
      title: 'Gästesupport',
      text: 'Nachrichten aus dem privaten Gästebereich prüfen, einordnen und direkt mit der passenden Buchung verbinden.',
    },
    customers: {
      title: 'Kunden',
      text: 'Menschen hinter den Gastanfragen sehen: Kontakt, Reisegruppe, Anfragehistorie und spätere Buchungen.',
    },
    bookings: {
      title: 'Buchungen',
      text: 'Verbindliche Aufenthalte operativ im Blick behalten: Reservierung, Zahlung, Auszeit, Termin und Reisegruppe.',
    },
    packages: {
      title: 'Auszeiten',
      text: 'Live-Angebote, Termine, Preise, Unterkunft und Erlebnisbausteine in einer Arbeitsansicht prüfen.',
    },
    experiences: {
      title: 'Erlebnisse',
      text: 'Verfügbare Erlebnisbausteine prüfen, nach Auszeit einordnen und später konkreten Partnern zuordnen.',
    },
    localPlaces: {
      title: 'Vor Ort',
      text: 'Restaurants, Märkte, Veranstaltungen, Strände, Hilfe und lokale Empfehlungen als Kandidaten sammeln und nur kuratiert freigeben.',
    },
    owners: {
      title: 'Eigentümer',
      text: 'Objekte und Eigentümerbeziehungen pflegen, damit klar bleibt, welche Unterkunft mit welcher Auszeit verbunden ist.',
    },
    agencies: {
      title: 'Agenturen',
      text: 'Ferienagenturen als Startpartner verwalten: Ansprechpartner, betreute Objekte, freie Termine und Rückmeldefristen.',
    },
    experienceProviders: {
      title: 'Erlebnisanbieter',
      text: 'Anbieterprofile pflegen und sehen, welche lokalen Erlebnisse bereits mit Auszeiten verbunden sind.',
    },
  }
  const renderLeadTable = (items: StoredLead[], emptyText: string) => (
    <div className="lead-table">
      <div className="lead-row lead-row-head">
        <span>Kontakt</span>
        <span>Anfrage</span>
        <span>Status</span>
        <span>Nächster Schritt</span>
        <span>Aktionen</span>
      </div>
      {items.length === 0 && <p className="muted">{emptyText}</p>}
      {items.map((lead) => (
        <article key={lead.id} className={`lead-row${isLeadDue(lead) ? ' is-due' : ''}`}>
          <div>
            <strong>{lead.name}{lead.isTest ? ' · TEST' : ''}</strong>
            <span>{formatLeadDate(lead.createdAt)}</span>
            <span className="admin-contact-links">
              <a href={`mailto:${lead.email}`}>{lead.email}</a>
              <a href={`tel:${lead.phone.replace(/\s/g, '')}`}>{lead.phone}</a>
            </span>
          </div>
          <div>
            <span>{leadReferenceLabel(lead)}</span>
            <span>{lead.source ?? 'Quelle offen'}{lead.campaign ? ` · ${lead.campaign}` : ''}</span>
          </div>
          <select value={lead.status} onChange={(e) => onStatus(lead.id, e.target.value as LeadStatus)}>
            {leadStatuses.map((status) => <option key={status}>{status}</option>)}
          </select>
          <div className="lead-work-status">
            <strong>{leadWorkLabel(lead)}</strong>
            <span>{leadWorkMeta(lead)}</span>
          </div>
          <button className="admin-row-action" type="button" onClick={() => setSelectedLeadId(lead.id)}>Öffnen</button>
        </article>
      ))}
    </div>
  )
  const renderLeadLane = (
    title: string,
    description: string,
    items: StoredLead[],
    emptyLabel: string,
    onShowAll: () => void,
  ) => (
    <article className="admin-task-lane admin-lead-lane">
      <header>
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <span>{items.length}</span>
      </header>
      <div className="admin-task-items">
        {items.length === 0 && <p className="admin-empty-note">{emptyLabel}</p>}
        {items.slice(0, 3).map((lead) => (
          <button key={lead.id} type="button" onClick={() => setSelectedLeadId(lead.id)}>
            <strong>{lead.name}</strong>
            <span>{leadWorkLabel(lead)} · {leadReferenceLabel(lead)}</span>
          </button>
        ))}
      </div>
      {items.length > 3 && (
        <button className="admin-task-lane-link" type="button" onClick={onShowAll}>
          Alle {items.length} anzeigen
        </button>
      )}
    </article>
  )
  const livePackageCount = adminPackages.filter((pkg) => pkg.status === 'published').length
  const packageDateCount = adminPackages.reduce((sum, pkg) => sum + pkg.dates.length, 0)
  const packageStayCount = new Set(adminPackages.map((pkg) => pkg.propertyId)).size
  const includedExperienceCount = adminPackages.reduce(
    (sum, pkg) => sum + pkg.experienceItems.filter((item) => item.role === 'included').length,
    0,
  )
  const openExperienceCount = experienceRows.filter((item) => item.confirmationStatus !== 'confirmed').length
  const unlinkedExperienceCount = experienceRows.filter((item) => !item.providerId && !item.providerName).length
  const linkedExperienceCount = (providerId: string) => experienceRows.filter((item) => item.providerProfile?.id === providerId).length
  const linkedPackageCount = (propertyId: string) => adminPackages.filter((pkg) => pkg.propertyId === propertyId).length
  const ownerLeadHasProfile = (lead: OwnerLead) => ownerProperties.some((property) => (
    property.email.toLowerCase() === lead.email.toLowerCase()
    || (
      property.ownerName.toLowerCase() === lead.name.toLowerCase()
      && property.location.toLowerCase() === lead.propertyLocation.toLowerCase()
    )
  ))
  const experienceLeadHasProvider = (lead: ExperienceLead) => experienceProviders.some((provider) => (
    provider.email.toLowerCase() === lead.email.toLowerCase()
    || provider.name.toLowerCase() === lead.businessName.toLowerCase()
  ))
  const partnerLeadsNeedingProfile = [
    ...ownerLeads.filter((lead) => !['Kein Interesse', 'Storniert', 'Abgeschlossen'].includes(lead.status) && !ownerLeadHasProfile(lead)),
    ...experienceProviderLeads.filter((lead) => !['Kein Interesse', 'Storniert', 'Abgeschlossen'].includes(lead.status) && !experienceLeadHasProvider(lead)),
  ]
  const compactLeadTypeLabel = (lead: StoredLead) => {
    if (lead.type === 'guest') return 'Gast'
    if (lead.type === 'owner') return 'Eigentümer'
    return 'Anbieter'
  }
  const localCurationBacklog = adminLocalPlaces
    .filter((place) => place.status === 'candidate')
    .map((place) => ({ place, issues: localPlaceReviewIssues(place) }))
    .sort((a, b) => b.issues.length - a.issues.length || a.place.title.localeCompare(b.place.title))
  const overviewWorkCandidates = [
    ...dueTasks.map((task) => ({
      id: `task-${task.id}`,
      dedupeKey: isGuestSupportTask(task)
        ? `support-${task.referenceId}-${task.title}-${task.note ?? ''}`
        : `task-${task.id}`,
      label: taskReferenceLabel(task.referenceType),
      title: task.title,
      meta: `${taskTimingLabel(task)} · ${task.referenceLabel}`,
      action: () => openTaskReference(task),
    })),
    ...dueFollowUps.map((lead) => ({
      id: `lead-${lead.id}`,
      dedupeKey: `lead-${lead.id}`,
      label: compactLeadTypeLabel(lead),
      title: lead.name,
      meta: `${leadWorkLabel(lead)} · ${leadReferenceLabel(lead)}`,
      action: () => setSelectedLeadId(lead.id),
    })),
    ...newLeads.map((lead) => ({
      id: `new-${lead.id}`,
      dedupeKey: `lead-${lead.id}`,
      label: compactLeadTypeLabel(lead),
      title: lead.name,
      meta: `Neu · ${leadReferenceLabel(lead)}`,
      action: () => setSelectedLeadId(lead.id),
    })),
    ...bookingsWithGuestPrepOpen.slice(0, 4).map((booking) => ({
      id: `booking-prep-${booking.id}`,
      dedupeKey: `booking-prep-${booking.id}`,
      label: 'Gästebereich',
      title: `${booking.customerName} vorbereiten`,
      meta: `${bookingMissingGuestPreparationItems(booking).length} Punkte offen · ${booking.packageName}`,
      action: () => {
        setActiveSection('bookings')
        setSelectedBookingId(booking.id)
      },
    })),
    ...partnerLeadsNeedingProfile.slice(0, 4).map((lead) => ({
      id: `partner-profile-${lead.id}`,
      dedupeKey: `partner-profile-${lead.id}`,
      label: lead.type === 'owner' ? 'Objekt' : 'Anbieter',
      title: lead.type === 'owner' ? `${lead.name} übergeben` : `${lead.businessName} übergeben`,
      meta: lead.type === 'owner'
        ? `${lead.propertyLocation} · Objektprofil anlegen`
        : `${lead.location} · Anbieterprofil anlegen`,
      action: () => setSelectedLeadId(lead.id),
    })),
    ...localCurationBacklog.slice(0, 4).map(({ place, issues }) => ({
      id: `local-${place.id}`,
      dedupeKey: `local-${place.id}`,
      label: 'Vor Ort',
      title: place.category === 'event' ? `Event prüfen: ${place.title}` : `Ort prüfen: ${place.title}`,
      meta: issues.length > 0 ? `${issues.length} Punkte offen · ${localPlaceCategoryLabels[place.category]}` : `freigabebereit · ${localPlaceCategoryLabels[place.category]}`,
      action: () => {
        setActiveSection('localPlaces')
        setSelectedLocalPlaceCandidateId(place.id)
      },
    })),
  ]
  const overviewWorkItems = overviewWorkCandidates
    .filter((item, index, list) => list.findIndex((candidate) => candidate.dedupeKey === item.dedupeKey) === index)
    .slice(0, 6)
  const packageCards = (
    <div className="admin-package-cards">
      {filteredPackages.length === 0 && <p className="admin-empty-note">Keine Auszeit passt zu den aktuellen Filtern.</p>}
      {filteredPackages.map((pkg) => {
        const includedItems = pkg.experienceItems.filter((item) => item.role === 'included')
        const optionalItems = pkg.experienceItems.filter((item) => item.role !== 'included')
        const plannedItems = pkg.experienceItems.filter((item) => item.confirmationStatus !== 'confirmed')
        const guestCapacity = pkg.fixedGuests ? `${pkg.fixedGuests} Personen` : `bis ${pkg.maxGuests ?? pkg.stay.sleeps} Personen`
        const linkedProperty = ownerProperties.find((property) => property.id === pkg.propertyId)
        const packageRequests = guestLeads.filter((lead) => lead.packageSlug === pkg.slug || lead.packageName === pkg.name).length
        const hasUsableDates = pkg.dates.some((date) => !date.toLowerCase().includes('ergänzen'))

        return (
          <article key={pkg.id} className="admin-package-card">
            <header className="admin-package-card-header">
              <div>
                <span className="admin-package-kicker">{audienceLabel(pkg.audience)} · {pkg.location}</span>
                <h3>{pkg.name}</h3>
              </div>
              <span className="status-pill">{packageStatusLabel(pkg.status)}</span>
            </header>

            <p className="admin-package-promise">{pkg.shortPromise}</p>

            <div className="admin-package-readiness" aria-label={`${pkg.name} Arbeitsstatus`}>
              <span className={linkedProperty ? 'is-ready' : 'is-open'}>
                <strong>Objekt</strong>{linkedProperty ? 'verbunden' : 'offen'}
              </span>
              <span className={plannedItems.length === 0 ? 'is-ready' : 'is-open'}>
                <strong>Erlebnis</strong>{plannedItems.length === 0 ? 'bestätigt' : `${plannedItems.length} offen`}
              </span>
              <span className={pkg.status === 'published' && hasUsableDates ? 'is-ready' : 'is-open'}>
                <strong>Seite</strong>{pkg.status === 'published' && hasUsableDates ? 'prüfbar' : 'vorbereiten'}
              </span>
              <span>
                <strong>Anfragen</strong>{packageRequests}
              </span>
            </div>

            <div className="admin-package-facts" aria-label={`${pkg.name} Kerndaten`}>
              <span><strong>Preis</strong>{pkg.concretePrice}<small>{pkg.priceNote}</small></span>
              <span><strong>Termine</strong>{pkg.dates.length} aktiv<small>{pkg.dates.join(' / ')}</small></span>
              <span><strong>Unterkunft</strong>{pkg.stay.name}<small>{guestCapacity}{pkg.dogOptional ? ' · Hund optional' : ''}</small></span>
              <span><strong>Erlebnis</strong>{includedItems.length} enthalten<small>{optionalItems.length} optional/Empfehlung</small></span>
            </div>

            <div className="admin-package-detail-grid">
              <section>
                <h4>Enthalten</h4>
                <ul>
                  {pkg.included.slice(0, 4).map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
              <section>
                <h4>Erlebnisstand</h4>
                <ul>
                  {pkg.experienceItems.slice(0, 3).map((item) => (
                    <li key={item.id}>
                      <strong>{item.title}</strong>
                      <span>{experienceRoleLabel(item.role)} · {experienceConfirmationLabel(item.confirmationStatus)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <footer className="admin-package-card-footer">
              <span>{plannedItems.length > 0 ? `${plannedItems.length} Erlebnisbausteine noch zu bestätigen` : 'Alle Erlebnisbausteine bestätigt'}</span>
              <div className="admin-package-actions">
                <button className="admin-row-action" type="button" onClick={() => setSelectedPackageId(pkg.id)}>Bearbeiten</button>
                <button className="admin-row-action" type="button" onClick={() => duplicatePackage(pkg)}>Duplizieren</button>
                <button className="admin-row-action" type="button" onClick={() => togglePackagePaused(pkg.id)}>{pkg.status === 'paused' ? 'Live setzen' : 'Pausieren'}</button>
                <a className="admin-row-action" href={`/auszeiten/${pkg.slug}`}>Öffentliche Seite</a>
              </div>
            </footer>
          </article>
        )
      })}
    </div>
  )
  const renderOverview = () => (
    <>
      <section className="admin-overview-layout">
        <section className="admin-command-strip" aria-label="Admin Kennzahlen">
          <article><span>{dueFollowUps.length + dueTasks.length}</span><p>Heute fällig</p></article>
          <article><span>{newLeads.length}</span><p>Neue Anfragen</p></article>
          <article><span>{bookingsWithOpenOps.length}</span><p>Buchungs-Ops</p></article>
          <article><span>{partnerLeadsNeedingProfile.length}</span><p>Partnerübergaben</p></article>
        </section>

        <aside className="admin-overview-right">
          <section className="admin-panel admin-upcoming-panel">
            <h2>Kommende Termine</h2>
            <div className="admin-upcoming-list">
              {upcomingDates.length === 0 && <p className="admin-empty-note">Noch keine Termine angelegt.</p>}
              {upcomingDates.map((item) => (
                <button key={item.id} type="button" onClick={() => setActiveSection('packages')}>
                  <strong>{item.packageName}</strong>
                  <span>{item.dates.length} Termine · {item.stayName}</span>
                  <p>{item.dates.join(' / ')}</p>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <div className="admin-overview-left">
          <section className="admin-overview-grid">
            <section className="admin-panel admin-today-panel admin-command-center">
              <div className="admin-panel-heading">
                <div>
                  <h2>Heute zuerst</h2>
                  <p>Ein komprimierter Arbeitsblick: nur Dinge, die eine Entscheidung oder Aktion brauchen.</p>
                </div>
                <button className="admin-row-action" type="button" onClick={() => setActiveSection('tasks')}>Aufgaben öffnen</button>
              </div>
              <div className="admin-overview-worklist admin-overview-worklist-primary">
                {overviewWorkItems.length === 0 && <p className="admin-empty-note">Für den Moment ist nichts fällig.</p>}
                {overviewWorkItems.map((item) => (
                  <button key={item.id} type="button" onClick={item.action}>
                    <span>{item.label}</span>
                    <strong>{item.title}</strong>
                    <small>{item.meta}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="admin-panel admin-overview-health">
              <div className="admin-panel-heading">
                <div>
                  <h2>Arbeitsbereiche</h2>
                  <p>Der schnelle Zustand des Systems, ohne in jede Seite springen zu müssen.</p>
                </div>
              </div>
              <section className="admin-overview-status" aria-label="Betriebsstatus">
                <button type="button" onClick={() => setActiveSection('leads')}>
                  <span>Anfragen</span>
                  <strong>{newLeads.length}</strong>
                  <small>neu · {reviewCount} in Prüfung</small>
                </button>
                <button type="button" onClick={() => setActiveSection('bookings')}>
                  <span>Buchungen</span>
                  <strong>{bookingsWithOpenOps.length}</strong>
                  <small>offene Ops</small>
                </button>
                <button type="button" onClick={() => setActiveSection('guestSupport')}>
                  <span>Support</span>
                  <strong>{supportTasks.length}</strong>
                  <small>offene Gastthemen</small>
                </button>
                <button type="button" onClick={() => setActiveSection('bookings')}>
                  <span>Gästebereich</span>
                  <strong>{bookingsWithGuestPrepOpen.length}</strong>
                  <small>vorbereiten</small>
                </button>
                <button type="button" onClick={() => setActiveSection('packages')}>
                  <span>Auszeiten</span>
                  <strong>{livePackageCount}</strong>
                  <small>{packageDateCount} Termine · {packageStayCount} Objekte</small>
                </button>
                <button type="button" onClick={() => setActiveSection('experiences')}>
                  <span>Erlebnisse</span>
                  <strong>{openExperienceCount}</strong>
                  <small>{unlinkedExperienceCount} ohne Anbieter</small>
                </button>
                <button type="button" onClick={() => {
                  setLocalPlaceStatusFilter('candidate')
                  setLocalPlaceReviewFilter('needsReview')
                  setActiveSection('localPlaces')
                }}>
                  <span>Vor Ort</span>
                  <strong>{localCurationBacklog.length}</strong>
                  <small>zu prüfen</small>
                </button>
                <button type="button" onClick={() => setActiveSection('customers')}>
                  <span>Kunden</span>
                  <strong>{realCustomerRows.length}</strong>
                  <small>{realBookingRows.length} Buchungen</small>
                </button>
              </section>
            </section>
          </section>
        </div>
      </section>
    </>
  )
  const renderLeads = () => {
    const partnerLeads = realActiveLeads.filter((lead) => lead.type === 'owner' || lead.type === 'experience')
    const requestReviewLeads = realActiveLeads.filter((lead) => lead.status === 'In Prüfung')

    return (
      <section className="admin-leads-layout">
        <section className="admin-command-strip admin-lead-metrics" aria-label="Anfragen Kennzahlen">
            <article><span>{newLeads.length}</span><p>Neu</p></article>
            <article><span>{reviewCount}</span><p>In Prüfung</p></article>
            <article><span>{dueFollowUps.length}</span><p>Heute fällig</p></article>
            <article><span>{guestLeads.length}</span><p>Gastanfragen</p></article>
            <article><span>{ownerLeads.length + experienceProviderLeads.length}</span><p>Partneranfragen</p></article>
        </section>
        <AdminPanel title="Anfragenarbeit">
          <p className="admin-panel-intro">Der erste operative Filter: Was muss heute raus, welche Gastanfrage ist neu, und welche Partnerkontakte brauchen Einordnung?</p>
          <section className="admin-task-grid" aria-label="Anfragenarbeit">
            {renderLeadLane(
              'Heute nachfassen',
              'Wiedervorlagen und Entscheidungen, die nicht liegen bleiben sollen.',
              dueFollowUps,
              'Heute ist keine Anfrage fällig.',
              () => {
                setLeadScope('active')
                setLeadWorkFilter('due')
                setLeadTypeFilter('all')
                setLeadStatusFilter('all')
              },
            )}
            {renderLeadLane(
              'Neue Gastanfragen',
              'Erstkontakt, Terminwunsch und Auszeit schnell prüfen.',
              newLeads.filter((lead) => lead.type === 'guest'),
              'Keine neue Gastanfrage offen.',
              () => {
                setLeadScope('active')
                setLeadWorkFilter('new')
                setLeadTypeFilter('guest')
                setLeadStatusFilter('all')
              },
            )}
            {renderLeadLane(
              'Partnerkontakte',
              'Eigentümer und Erlebnisanbieter separat einordnen.',
              partnerLeads,
              'Keine aktiven Partneranfragen offen.',
              () => {
                setLeadScope('active')
                setLeadWorkFilter('all')
                setLeadTypeFilter('owner')
                setLeadStatusFilter('all')
              },
            )}
          </section>
        </AdminPanel>
        <section className="admin-learning-strip" aria-label="MVP Lernen">
          <article>
            <span>Top Quelle</span>
            <strong>{topEntryLabel(leadSourceCounts, 'Noch offen')}</strong>
          </article>
          <article>
            <span>Gast zu Buchung</span>
            <strong>{bookedGuestLeads}/{guestLeads.length || 0}</strong>
          </article>
          <article>
            <span>In Prüfung</span>
            <strong>{requestReviewLeads.length}</strong>
          </article>
          <article>
            <span>Verlustgrund</span>
            <strong>{topEntryLabel(lostLeadReasonCounts, 'Noch offen')}</strong>
          </article>
        </section>
        <AdminPanel title={leadScope === 'archived' ? 'Archivierte Anfragen' : 'Alle Anfragen'}>
          <p className="admin-panel-intro">Vollständige Leadliste zum Filtern, Status setzen und Detailkontakt öffnen.</p>
            <div className="admin-filter-bar admin-filter-bar-four" aria-label="Anfragen filtern">
              <label>Ansicht
                <select value={leadScope} onChange={(event) => setLeadScope(event.target.value as LeadScopeFilter)}>
                  <option value="active">Aktiv</option>
                  <option value="archived">Archiv</option>
                </select>
              </label>
              <label>Typ
                <select value={leadTypeFilter} onChange={(event) => setLeadTypeFilter(event.target.value as LeadTypeFilter)}>
                  <option value="all">Alle</option>
                  <option value="guest">Gastanfragen</option>
                  <option value="owner">Eigentümer</option>
                  <option value="experience">Erlebnisanbieter</option>
                </select>
              </label>
              <label>Status
                <select value={leadStatusFilter} onChange={(event) => setLeadStatusFilter(event.target.value as LeadStatus | 'all')}>
                  <option value="all">Alle</option>
                  {leadStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label>Arbeitsstand
                <select value={leadWorkFilter} onChange={(event) => setLeadWorkFilter(event.target.value as LeadWorkFilter)}>
                  <option value="all">Alle</option>
                  <option value="due">Heute fällig</option>
                  <option value="new">Neu</option>
                  <option value="review">In Prüfung</option>
                </select>
              </label>
            </div>
            {renderLeadTable(filteredLeads, leadScope === 'archived' ? 'Keine archivierten Anfragen gefunden.' : 'Keine passenden aktiven Anfragen gefunden.')}
        </AdminPanel>
      </section>
    )
  }
  const renderTaskLane = (
    title: string,
    description: string,
    tasks: AdminTask[],
    emptyLabel: string,
    onShowAll: () => void,
  ) => (
    <article className="admin-task-lane">
      <header>
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <span>{tasks.length}</span>
      </header>
      <div className="admin-task-items">
        {tasks.length === 0 && <p className="admin-empty-note">{emptyLabel}</p>}
        {tasks.slice(0, 3).map((task) => (
          <button key={task.id} type="button" onClick={() => openTaskReference(task)}>
            <strong>{task.title}</strong>
            <span>{isGuestSupportTask(task) ? guestSupportNextStep(task) : task.referenceLabel}</span>
          </button>
        ))}
      </div>
      {tasks.length > 3 && (
        <button className="admin-task-lane-link" type="button" onClick={onShowAll}>
          Alle {tasks.length} anzeigen
        </button>
      )}
    </article>
  )
  const renderTasks = () => {
    const todayTasks = dueTasks
    const inProgressTasks = activeAdminTasks
      .filter((task) => task.status === 'in_progress')
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt) || b.createdAt.localeCompare(a.createdAt))
    const nextTasks = upcomingTasks
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt) || b.createdAt.localeCompare(a.createdAt))
    const bookingTaskCount = activeAdminTasks.filter((task) => task.referenceType === 'booking').length

    return (
      <section className="admin-leads-layout">
        <section className="admin-command-strip admin-package-metrics" aria-label="Aufgaben Kennzahlen">
          <article><span>{todayTasks.length}</span><p>Heute / überfällig</p></article>
          <article><span>{inProgressTasks.length}</span><p>In Klärung</p></article>
          <article><span>{supportTasks.length}</span><p>Gästesupport</p></article>
          <article><span>{bookingTaskCount}</span><p>Buchungen</p></article>
        </section>
        <AdminPanel title="Heute arbeiten">
          <p className="admin-panel-intro">Die wichtigsten offenen Punkte nach Arbeitslogik sortiert. Von hier springst du direkt in den passenden Datensatz.</p>
          <section className="admin-task-grid" aria-label="Operative Aufgaben">
            {renderTaskLane(
              'Heute zuerst',
              'Fällige und überfällige Aufgaben, die den Tag bestimmen.',
              todayTasks,
              'Für heute ist nichts fällig.',
              () => {
                setTaskStatusFilter('open')
                setTaskReferenceFilter('all')
                setTaskPriorityFilter('all')
              },
            )}
            {renderTaskLane(
              'In Klärung',
              'Alles, was bereits aufgenommen wurde und aktiv nachgehalten wird.',
              inProgressTasks,
              'Nichts ist gerade in Klärung.',
              () => {
                setTaskStatusFilter('in_progress')
                setTaskReferenceFilter('all')
                setTaskPriorityFilter('all')
              },
            )}
            {renderTaskLane(
              'Demnächst',
              'Nächste Aufgaben nach heute, sortiert nach Fälligkeit.',
              nextTasks,
              'Keine kommenden Aufgaben angelegt.',
              () => {
                setTaskStatusFilter('open')
                setTaskReferenceFilter('all')
                setTaskPriorityFilter('all')
              },
            )}
          </section>
        </AdminPanel>
        <AdminPanel title="Neue Aufgabe">
          <p className="admin-panel-intro">Kurze operative Aufgabe an Anfrage, Buchung, Auszeit, Erlebnis oder Partner hängen.</p>
          <div className="admin-task-create">
            <label>Titel
              <input value={taskCreateDraft.title} onChange={(event) => setTaskCreateDraft((current) => ({ ...current, title: event.target.value }))} placeholder="z. B. Erlebnispartner nachfassen" />
            </label>
            <label>Bezug
              <select value={taskCreateDraft.referenceValue || selectedTaskReference?.value || ''} onChange={(event) => setTaskCreateDraft((current) => ({ ...current, referenceValue: event.target.value }))}>
                {taskReferenceOptions.map((option) => <option key={option.value} value={option.value}>{taskReferenceLabel(option.type)} · {option.label}</option>)}
              </select>
            </label>
            <label>Fällig
              <input type="date" value={taskCreateDraft.dueAt} onChange={(event) => setTaskCreateDraft((current) => ({ ...current, dueAt: event.target.value }))} />
            </label>
            <label>Priorität
              <select value={taskCreateDraft.priority} onChange={(event) => setTaskCreateDraft((current) => ({ ...current, priority: event.target.value as AdminTaskPriority }))}>
                <option value="high">Hoch</option>
                <option value="medium">Normal</option>
                <option value="low">Niedrig</option>
              </select>
            </label>
            <label>Notiz
              <textarea rows={2} value={taskCreateDraft.note} onChange={(event) => setTaskCreateDraft((current) => ({ ...current, note: event.target.value }))} placeholder="Kurze interne Notiz" />
            </label>
            <button className="admin-action primary" type="button" onClick={submitTaskFromAdmin}>Aufgabe anlegen</button>
          </div>
        </AdminPanel>
        <AdminPanel title="Alle Aufgaben">
          <p className="admin-panel-intro">Vollständige Liste zum Filtern, Öffnen und Abschließen.</p>
          <div className="admin-filter-bar" aria-label="Aufgaben filtern">
            <label>Status
              <select value={taskStatusFilter} onChange={(event) => setTaskStatusFilter(event.target.value as TaskStatusFilter)}>
                <option value="all">Alle</option>
                <option value="open">Offen</option>
                <option value="in_progress">In Klärung</option>
                <option value="done">Erledigt</option>
              </select>
            </label>
            <label>Bezug
              <select value={taskReferenceFilter} onChange={(event) => setTaskReferenceFilter(event.target.value as TaskReferenceFilter)}>
                {taskReferenceFilters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
              </select>
            </label>
            <label>Priorität
              <select value={taskPriorityFilter} onChange={(event) => setTaskPriorityFilter(event.target.value as TaskPriorityFilter)}>
                <option value="all">Alle</option>
                <option value="high">Hoch</option>
                <option value="medium">Normal</option>
                <option value="low">Niedrig</option>
              </select>
            </label>
          </div>
          <div className="admin-provider-grid">
            {filteredTasks.length === 0 && <p className="admin-empty-note">Keine Aufgabe passt zu den aktuellen Filtern.</p>}
            {filteredTasks.map((task) => (
                <article key={task.id} className={`admin-provider-card admin-task-card ${task.status === 'done' ? 'is-done' : ''}`}>
                  <header>
                    <div>
                      <span className="admin-package-kicker">{taskReferenceLabel(task.referenceType)} · {taskPriorityLabel(task.priority)}</span>
                      <h3>{task.title}</h3>
                    </div>
                    <span className="status-pill">{taskStatusLabel(task.status)}</span>
                  </header>
                  <div className={`admin-task-timing ${taskTimingClass(task)}`}>
                    <strong>{taskTimingLabel(task)}</strong>
                    <span>{task.dueAt ? formatGermanTaskDate(task.dueAt) : 'Kein Datum gesetzt'}</span>
                  </div>
                  <div className="admin-experience-card-facts">
                    <span><strong>Bezug</strong>{task.referenceLabel}</span>
                    <span><strong>Fällig</strong>{task.dueAt ? formatFollowUpDate(task.dueAt) : 'Offen'}</span>
                    <span><strong>Priorität</strong>{taskPriorityLabel(task.priority)}</span>
                  </div>
                  {isGuestSupportTask(task) && (
                    <div className="admin-support-routing compact" aria-label="Support Einordnung">
                      <article>
                        <span>Zuständigkeit</span>
                        <strong>{guestSupportCaseType(task)}</strong>
                      </article>
                      <article>
                        <span>Nächster Schritt</span>
                        <strong>{guestSupportNextStep(task)}</strong>
                      </article>
                    </div>
                  )}
                  {task.note && <p>{task.note}</p>}
                  <footer className="admin-package-card-footer">
                    <span>{task.completedAt ? `Erledigt am ${formatFollowUpDate(task.completedAt.slice(0, 10))}` : taskStatusLabel(task.status)}</span>
                    <div className="admin-package-actions">
                      <button className="admin-row-action" type="button" onClick={() => openTaskReference(task)}>{taskReferenceLabel(task.referenceType)} öffnen</button>
                      {task.status === 'open' && (
                        <button
                          className="admin-row-action"
                          type="button"
                          onClick={() => {
                            moveAdminTaskInProgress(task.id)
                            setTaskStatusFilter('in_progress')
                          }}
                        >
                          In Klärung
                        </button>
                      )}
                      <button className="admin-row-action" type="button" onClick={() => toggleAdminTaskStatus(task.id)}>{task.status === 'done' ? 'Wieder öffnen' : 'Erledigen'}</button>
                      <button className="admin-row-action danger" type="button" onClick={() => deleteAdminTask(task.id)}>Löschen</button>
                    </div>
                  </footer>
                </article>
              ))}
          </div>
        </AdminPanel>
      </section>
    )
  }
  const renderGuestSupport = () => (
    <section className="admin-leads-layout">
      <section className="admin-command-strip admin-package-metrics" aria-label="Gästesupport Kennzahlen">
        <article><span>{allSupportTasks.filter((task) => task.status === 'open').length}</span><p>Offen</p></article>
        <article><span>{allSupportTasks.filter((task) => task.status === 'in_progress').length}</span><p>In Klärung</p></article>
        <article><span>{allSupportTasks.filter((task) => task.priority === 'high' && task.status !== 'done').length}</span><p>Hoch</p></article>
        <article><span>{allSupportTasks.filter((task) => guestSupportCaseType(task) === 'Unterkunft / Partner' && task.status !== 'done').length}</span><p>Partner</p></article>
      </section>
      <AdminPanel title="Support-Fälle">
        <div className="admin-panel-heading">
          <p className="admin-panel-intro">Hier landen Nachrichten aus dem Gästebereich. Jede Nachricht bleibt mit der Buchung verbunden, damit du sofort weißt, wen die Anfrage betrifft.</p>
          <div className="admin-filter-bar compact" aria-label="Gästesupport filtern">
            <label>Status
              <select value={supportStatusFilter} onChange={(event) => setSupportStatusFilter(event.target.value as TaskStatusFilter)}>
                <option value="open">Offen</option>
                <option value="in_progress">In Klärung</option>
                <option value="done">Erledigt</option>
                <option value="all">Alle</option>
              </select>
            </label>
          </div>
        </div>
        <div className="admin-support-list">
          {filteredSupportTasks.length === 0 && <p className="admin-empty-note">Keine Support-Nachricht in diesem Status.</p>}
          {filteredSupportTasks.map((task) => (
            <article key={task.id} className={`admin-support-case ${task.priority === 'high' ? 'is-high' : ''} ${task.status === 'done' ? 'is-done' : ''}`}>
              <header>
                <div>
                  <span>{task.title.replace('Support: ', '')} · {taskPriorityLabel(task.priority)}</span>
                  <h3>{task.referenceLabel}</h3>
                </div>
                <strong>{taskStatusLabel(task.status)}</strong>
              </header>
              <div className="admin-support-routing" aria-label="Support Einordnung">
                <article>
                  <span>Zuständigkeit</span>
                  <strong>{guestSupportCaseType(task)}</strong>
                </article>
                <article>
                  <span>Nächster Schritt</span>
                  <strong>{guestSupportNextStep(task)}</strong>
                </article>
              </div>
              {task.note && <p>{task.note}</p>}
              <div className="admin-support-meta">
                <span><strong>Eingang</strong>{formatFollowUpDate(task.createdAt.slice(0, 10))}</span>
                <span><strong>Fällig</strong>{task.dueAt ? formatFollowUpDate(task.dueAt) : 'Offen'}</span>
                <span><strong>Priorität</strong>{taskPriorityLabel(task.priority)}</span>
              </div>
              <footer>
                <button className="admin-row-action" type="button" onClick={() => openTaskReference(task)}>Buchung öffnen</button>
                {task.status === 'open' && <button className="admin-row-action" type="button" onClick={() => moveAdminTaskInProgress(task.id)}>In Klärung</button>}
                <button className="admin-row-action" type="button" onClick={() => toggleAdminTaskStatus(task.id)}>{task.status === 'done' ? 'Wieder öffnen' : 'Erledigen'}</button>
                <button className="admin-row-action danger" type="button" onClick={() => deleteAdminTask(task.id)}>Löschen</button>
              </footer>
            </article>
          ))}
        </div>
      </AdminPanel>
    </section>
  )
  const renderCustomerLane = (
    title: string,
    description: string,
    customers: CustomerProfile[],
    emptyLabel: string,
    onShowAll: () => void,
  ) => (
    <article className="admin-task-lane admin-customer-lane">
      <header>
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <span>{customers.length}</span>
      </header>
      <div className="admin-task-items">
        {customers.length === 0 && <p className="admin-empty-note">{emptyLabel}</p>}
        {customers.slice(0, 3).map((customer) => (
          <button key={customer.id} type="button" onClick={() => setSelectedCustomerId(customer.id)}>
            <strong>{customer.name}</strong>
            <span>{customerNextStepLabel(customer)} · {customerLatestRequest(customer)?.packageName ?? customer.guestType}</span>
          </button>
        ))}
      </div>
      {customers.length > 3 && (
        <button className="admin-task-lane-link" type="button" onClick={onShowAll}>
          Alle {customers.length} anzeigen
        </button>
      )}
    </article>
  )
  const renderCustomers = () => {
    const dueCustomers = realCustomerRows.filter(customerHasDueFollowUp)
    const bookedCustomers = realCustomerRows.filter(customerHasBooking)
    const requestCustomers = realCustomerRows.filter((customer) => !customerHasBooking(customer))
    return (
      <section className="admin-leads-layout">
        <section className="admin-command-strip admin-package-metrics" aria-label="Kunden Kennzahlen">
          <article><span>{realCustomerRows.length}</span><p>Kunden</p></article>
          <article><span>{requestCustomers.length}</span><p>Anfragephase</p></article>
          <article><span>{bookedCustomers.length}</span><p>Mit Buchung</p></article>
          <article><span>{dueCustomers.length}</span><p>Heute handeln</p></article>
        </section>
        <AdminPanel title="Kundenarbeit">
          <p className="admin-panel-intro">CRM-Blick auf Menschen, nicht nur auf einzelne Anfragen. Wichtig sind nächster Schritt, Buchungsbezug und bevorzugter Kontakt.</p>
          <section className="admin-task-grid" aria-label="Kundenarbeit">
            {renderCustomerLane(
              'Heute nachfassen',
              'Kunden mit fälliger Wiedervorlage oder offener Entscheidung.',
              dueCustomers,
              'Heute ist kein Kunde fällig.',
              () => setCustomerPhaseFilter('due'),
            )}
            {renderCustomerLane(
              'Aktive Buchungen',
              'Kunden, bei denen aus einer Anfrage ein konkreter Aufenthalt geworden ist.',
              bookedCustomers,
              'Noch keine verbindliche Buchung.',
              () => setCustomerPhaseFilter('booking'),
            )}
            {renderCustomerLane(
              'Neue Kontakte',
              'Anfragephase ohne verbindliche Buchung.',
              requestCustomers,
              'Keine offenen Anfragekontakte.',
              () => setCustomerPhaseFilter('request'),
            )}
          </section>
        </AdminPanel>
        <AdminPanel title="Alle Kunden">
          <p className="admin-panel-intro">Kontakt, Verlauf und nächster Schritt pro Kunde. Von hier öffnest du Detailprofil, Anfrage oder Buchung.</p>
          <div className="admin-filter-bar" aria-label="Kunden filtern">
            <label>Typ
              <select value={customerTypeFilter} onChange={(event) => setCustomerTypeFilter(event.target.value as CustomerTypeFilter)}>
                <option value="all">Alle</option>
                <option value="Familie">Familien</option>
                <option value="Paar">Paare</option>
              </select>
            </label>
            <label>Phase
              <select value={customerPhaseFilter} onChange={(event) => setCustomerPhaseFilter(event.target.value as CustomerPhaseFilter)}>
                <option value="all">Alle</option>
                <option value="request">Anfragephase</option>
                <option value="booking">Mit Buchung</option>
                <option value="due">Heute fällig</option>
              </select>
            </label>
          </div>
          <div className="admin-provider-grid">
            {filteredCustomerRows.length === 0 && <p className="admin-empty-note">Keine Kunden passen zu den aktuellen Filtern.</p>}
            {filteredCustomerRows.map((customer) => {
              const latestRequest = customerLatestRequest(customer)
              const bookings = customerBookings(customer)
              const openRequests = customerOpenRequests(customer)

              return (
                <article key={customer.id} className="admin-provider-card admin-customer-card">
                  <header>
                    <div>
                      <span className="admin-package-kicker">{customer.guestType} · {customer.requests.length} Anfrage{customer.requests.length === 1 ? '' : 'n'}{customer.isTest ? ' · TEST' : ''}</span>
                      <h3>{customer.name}</h3>
                    </div>
                    <span className="status-pill">{customerLifecycleLabel(customer)}</span>
                  </header>
                  <div className="admin-booking-next-action" aria-label="Nächster Kundenschritt">
                    <span>Nächster Schritt</span>
                    <strong>{customerNextStepLabel(customer)}</strong>
                    <p>{latestRequest?.followUpAt ? `Fällig ${formatFollowUpDate(latestRequest.followUpAt)}` : `${customer.whatsappOptIn ? 'WhatsApp möglich' : 'E-Mail als Standard'} · ${customerSourceLabel(customer)}`}</p>
                  </div>
                  <div className="admin-booking-readiness admin-booking-readiness-soft" aria-label="Kundenstatus">
                    <strong>{customerHasDueFollowUp(customer) ? 'fällig' : bookings.length > 0 ? 'gebucht' : 'anfrage'}</strong>
                    <div>
                      <span>{bookings.length > 0 ? `${bookings.length} Buchung${bookings.length === 1 ? '' : 'en'}` : `${openRequests.length} offene Anfrage${openRequests.length === 1 ? '' : 'n'}`}</span>
                      <span>{customer.whatsappOptIn ? 'WhatsApp OK' : 'E-Mail'}</span>
                    </div>
                  </div>
                  <div className="admin-experience-card-facts">
                    <span><strong>Reisegruppe</strong>{customer.guestType}</span>
                    <span><strong>Aktuelle Auszeit</strong>{latestRequest?.packageName ?? 'Offen'}</span>
                    <span><strong>Quelle</strong>{customerSourceLabel(customer)}</span>
                  </div>
                  <div className="admin-contact-links">
                    <a href={`mailto:${customer.email}`}>{customer.email}</a>
                    <a href={`tel:${customer.phone.replace(/\s/g, '')}`}>{customer.phone}</a>
                  </div>
                  <div className="admin-linked-list">
                    {customer.requests.slice(0, 3).map((request) => (
                      <article key={request.id}>
                        <strong>{request.packageName}</strong>
                        <span>{request.selectedDate} · {request.status}</span>
                      </article>
                    ))}
                  </div>
                  <footer className="admin-package-card-footer">
                    <span>{bookings.length > 0 ? `${bookings.length} Buchung${bookings.length === 1 ? '' : 'en'}` : customerNextStepLabel(customer)}</span>
                    <div className="admin-package-actions">
                      <button className="admin-row-action" type="button" onClick={() => setSelectedCustomerId(customer.id)}>Profil öffnen</button>
                      {latestRequest && <button className="admin-row-action" type="button" onClick={() => setSelectedLeadId(latestRequest.id)}>Anfrage öffnen</button>}
                      {bookings[0] && <button className="admin-row-action" type="button" onClick={() => setSelectedBookingId(bookings[0].id)}>Buchung öffnen</button>}
                    </div>
                  </footer>
                </article>
              )
            })}
          </div>
        </AdminPanel>
      </section>
    )
  }
  const renderBookingLane = (
    title: string,
    description: string,
    bookings: BookingProfile[],
    emptyLabel: string,
    onShowAll: () => void,
  ) => (
    <article className="admin-task-lane admin-booking-lane">
      <header>
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <span>{bookings.length}</span>
      </header>
      <div className="admin-task-items">
        {bookings.length === 0 && <p className="admin-empty-note">{emptyLabel}</p>}
        {bookings.slice(0, 3).map((booking) => (
          <button key={booking.id} type="button" onClick={() => setSelectedBookingId(booking.id)}>
            <strong>{booking.customerName}</strong>
            <span>{bookingPrimaryAction(booking)} · {booking.packageName}</span>
          </button>
        ))}
      </div>
      {bookings.length > 3 && (
        <button className="admin-task-lane-link" type="button" onClick={onShowAll}>
          Alle {bookings.length} anzeigen
        </button>
      )}
    </article>
  )
  const packageOpenExperienceItems = (pkg: MorrowPackage) => (
    pkg.experienceItems.filter((experience) => experience.confirmationStatus !== 'confirmed')
  )
  const packageHasUsableDates = (pkg: MorrowPackage) => pkg.dates.some((date) => !date.toLowerCase().includes('ergänzen'))
  const renderPackageLane = (
    title: string,
    description: string,
    items: MorrowPackage[],
    emptyLabel: string,
    onShowAll: () => void,
  ) => (
    <article className="admin-task-lane admin-package-lane">
      <header>
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <span>{items.length}</span>
      </header>
      <div className="admin-task-items">
        {items.length === 0 && <p className="admin-empty-note">{emptyLabel}</p>}
        {items.slice(0, 3).map((pkg) => (
          <button key={pkg.id} type="button" onClick={() => setSelectedPackageId(pkg.id)}>
            <strong>{pkg.name}</strong>
            <span>{packageStatusLabel(pkg.status)} · {packageOpenExperienceItems(pkg).length} Erlebnis offen · {pkg.dates.length} Termine</span>
          </button>
        ))}
      </div>
      {items.length > 3 && (
        <button className="admin-task-lane-link" type="button" onClick={onShowAll}>
          Alle {items.length} anzeigen
        </button>
      )}
    </article>
  )
  const renderExperienceLane = (
    title: string,
    description: string,
    items: typeof experienceRows,
    emptyLabel: string,
    onShowAll: () => void,
  ) => (
    <article className="admin-task-lane admin-experience-lane">
      <header>
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <span>{items.length}</span>
      </header>
      <div className="admin-task-items">
        {items.length === 0 && <p className="admin-empty-note">{emptyLabel}</p>}
        {items.slice(0, 3).map((item) => (
          <button key={`${item.packageId}-${item.id}`} type="button" onClick={() => setSelectedExperience({ packageId: item.packageId, experienceId: item.id })}>
            <strong>{item.title}</strong>
            <span>{item.packageName} · {experienceConfirmationLabel(item.confirmationStatus)}</span>
          </button>
        ))}
      </div>
      {items.length > 3 && (
        <button className="admin-task-lane-link" type="button" onClick={onShowAll}>
          Alle {items.length} anzeigen
        </button>
      )}
    </article>
  )
  const renderExperienceProviderLane = (
    title: string,
    description: string,
    items: ExperienceProviderProfile[],
    emptyLabel: string,
    onShowAll: () => void,
  ) => (
    <article className="admin-task-lane admin-provider-lane">
      <header>
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <span>{items.length}</span>
      </header>
      <div className="admin-task-items">
        {items.length === 0 && <p className="admin-empty-note">{emptyLabel}</p>}
        {items.slice(0, 3).map((provider) => (
          <button key={provider.id} type="button" onClick={() => setSelectedExperienceProviderId(provider.id)}>
            <strong>{provider.name}</strong>
            <span>{experienceProviderStatusLabel(provider.status)} · {linkedExperienceCount(provider.id)} Bausteine</span>
          </button>
        ))}
      </div>
      {items.length > 3 && (
        <button className="admin-task-lane-link" type="button" onClick={onShowAll}>
          Alle {items.length} anzeigen
        </button>
      )}
    </article>
  )
  const renderOwnerLane = (
    title: string,
    description: string,
    items: OwnerPropertyProfile[],
    emptyLabel: string,
    onShowAll: () => void,
  ) => (
    <article className="admin-task-lane admin-owner-lane">
      <header>
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <span>{items.length}</span>
      </header>
      <div className="admin-task-items">
        {items.length === 0 && <p className="admin-empty-note">{emptyLabel}</p>}
        {items.slice(0, 3).map((property) => {
          const packageCount = linkedPackageCount(property.id)
          const agency = agencyForProperty(property.id)

          return (
            <button key={property.id} type="button" onClick={() => setSelectedOwnerPropertyId(property.id)}>
              <strong>{property.name}</strong>
              <span>{ownerPropertyStatusLabel(property.status)} · {packageCount} Auszeiten · {agency?.name ?? 'direkt / offen'}</span>
            </button>
          )
        })}
      </div>
      {items.length > 3 && (
        <button className="admin-task-lane-link" type="button" onClick={onShowAll}>
          Alle {items.length} anzeigen
        </button>
      )}
    </article>
  )
  const renderAgencyLane = (
    title: string,
    description: string,
    items: AgencyProfile[],
    emptyLabel: string,
    onShowAll: () => void,
  ) => (
    <article className="admin-task-lane admin-agency-lane">
      <header>
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <span>{items.length}</span>
      </header>
      <div className="admin-task-items">
        {items.length === 0 && <p className="admin-empty-note">{emptyLabel}</p>}
        {items.slice(0, 3).map((agency) => {
          const linkedPackagesForAgency = adminPackages.filter((pkg) => agency.managedPropertyIds.includes(pkg.propertyId)).length

          return (
            <button key={agency.id} type="button" onClick={() => setSelectedAgencyId(agency.id)}>
              <strong>{agency.name}</strong>
              <span>{agencyStatusLabel(agency.status)} · {agency.managedPropertyIds.length} Objekte · {linkedPackagesForAgency} Auszeiten</span>
            </button>
          )
        })}
      </div>
      {items.length > 3 && (
        <button className="admin-task-lane-link" type="button" onClick={onShowAll}>
          Alle {items.length} anzeigen
        </button>
      )}
    </article>
  )
  const renderBookings = () => {
    const criticalBookings = realBookingRows.filter((booking) => ['Support', 'Heute'].includes(bookingUrgencyLabel(booking)))
    const prepBookings = realBookingRows.filter((booking) => (
      !criticalBookings.some((critical) => critical.id === booking.id)
      && bookingOpenItems(booking).length > 0
      && !['Abgeschlossen', 'Storniert'].includes(booking.status)
    ))
    const readyBookings = realBookingRows.filter((booking) => (
      bookingOpenItems(booking).length === 0
      && !activeAdminTasks.some((task) => task.referenceType === 'booking' && task.referenceId === booking.id && isGuestSupportTask(task))
      && !['Storniert'].includes(booking.status)
    ))

    return (
      <section className="admin-leads-layout">
        <section className="admin-booking-ops-strip is-primary" aria-label="Buchungen operative Signale">
          <article>
            <span>Buchungen</span>
            <strong>{realBookingRows.length}</strong>
          </article>
          <article>
            <span>Zahlung offen</span>
            <strong>{realBookingRows.filter((booking) => booking.paymentStatus === 'Offen').length}</strong>
          </article>
          <article>
            <span>Check-in klären</span>
            <strong>{realBookingRows.filter((booking) => (booking.checkInStatus ?? 'offen') !== 'freigegeben' && !['Abgeschlossen', 'Storniert'].includes(booking.status)).length}</strong>
          </article>
          <article>
            <span>Erlebnis klären</span>
            <strong>{realBookingRows.filter((booking) => (booking.experienceStatus ?? 'offen') !== 'bestätigt' && !['Abgeschlossen', 'Storniert'].includes(booking.status)).length}</strong>
          </article>
          <article>
            <span>Heute fällig</span>
            <strong>{bookingsDueToday.length}</strong>
          </article>
          <article>
            <span>Gästebereich</span>
            <strong>{bookingsWithGuestPrepOpen.length}</strong>
          </article>
        </section>
        <AdminPanel title="Buchungsarbeit">
          <p className="admin-panel-intro">Der tägliche Blick auf verbindliche Aufenthalte: Was braucht Entscheidung, was Vorbereitung, was ist bereit für den Gast?</p>
          <section className="admin-task-grid" aria-label="Buchungsarbeit">
            {renderBookingLane(
              'Heute sichern',
              'Support, fällige Reservierungen und operative Risiken zuerst.',
              criticalBookings,
              'Keine kritische Buchung offen.',
              () => setBookingStatusFilter('all'),
            )}
            {renderBookingLane(
              'Vor Anreise vorbereiten',
              'Zahlung, Check-in, Erlebnis und Gästebereich fertigstellen.',
              prepBookings,
              'Keine offene Vorbereitung.',
              () => setBookingStatusFilter('all'),
            )}
            {renderBookingLane(
              'Gastbereit',
              'Aufenthalte ohne operative Blocker.',
              readyBookings,
              'Noch kein Aufenthalt ist vollständig bereit.',
              () => setBookingStatusFilter('all'),
            )}
          </section>
        </AdminPanel>
        <AdminPanel title="Alle Buchungen">
          <p className="admin-panel-intro">Reservierung, Zahlung, Vor-Anreise und operative Vorbereitung pro Aufenthalt.</p>
          <div className="admin-filter-bar" aria-label="Buchungen filtern">
            <label>Auszeit
              <select value={bookingPackageFilter} onChange={(event) => setBookingPackageFilter(event.target.value)}>
                <option value="all">Alle</option>
                {adminPackages.map((pkg) => <option key={pkg.id} value={pkg.slug}>{pkg.name}</option>)}
              </select>
            </label>
            <label>Status
              <select value={bookingStatusFilter} onChange={(event) => setBookingStatusFilter(event.target.value as BookingStatusFilter)}>
                <option value="all">Alle</option>
                {bookingStatusValues.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
          </div>
          <div className="admin-provider-grid">
            {filteredBookingRows.length === 0 && <p className="admin-empty-note">Keine Buchung passt zu den aktuellen Filtern.</p>}
            {filteredBookingRows.map((booking) => {
            const missingGuestPrep = bookingMissingGuestPreparationItems(booking)
            const openItems = bookingOpenItems(booking)
            const supportCount = activeAdminTasks.filter((task) => (
              task.referenceType === 'booking' && task.referenceId === booking.id && isGuestSupportTask(task)
            )).length
            const bookingCustomer = customerRows.find((customer) => customer.email.toLowerCase() === booking.email.toLowerCase())
            const visibleBlockers = [
              ...openItems,
              ...(supportCount > 0 ? [`${supportCount} Supportthema${supportCount === 1 ? '' : 'en'}`] : []),
            ]
            return (
            <article key={booking.id} className={`admin-provider-card admin-booking-card ${bookingUrgencyClass(booking)}`}>
              <header>
                <div>
                  <span className="admin-package-kicker">{booking.packageName} · {booking.selectedDate}{booking.isTest ? ' · TEST' : ''}</span>
                  <h3>{booking.customerName}</h3>
                </div>
                <div className="admin-booking-card-status">
                  <span className={`admin-booking-urgency ${bookingUrgencyClass(booking)}`}>{bookingUrgencyLabel(booking)}</span>
                  <span className="status-pill">{booking.status}</span>
                </div>
              </header>
              <div className="admin-booking-next-action" aria-label="Nächster Arbeitsschritt">
                <span>Nächster Schritt</span>
                <strong>{bookingPrimaryAction(booking)}</strong>
                <p>{booking.followUpAt ? `Fällig ${formatFollowUpDate(booking.followUpAt)}` : 'Kein Fälligkeitsdatum gesetzt'}</p>
              </div>
              <div className="admin-booking-blockers" aria-label="Blocker">
                {visibleBlockers.length === 0
                  ? <span className="is-ready">Keine Blocker</span>
                  : visibleBlockers.slice(0, 5).map((item) => <span key={item}>{item}</span>)}
              </div>
              <div className="admin-booking-readiness admin-booking-readiness-soft admin-booking-guest-state" aria-label="Gästebereich Status">
                <strong>{missingGuestPrep.length === 0 ? 'gastbereit' : `${missingGuestPrep.length} offen`}</strong>
                <div>
                  {missingGuestPrep.length === 0
                    ? <span>Gästebereich vollständig</span>
                    : missingGuestPrep.slice(0, 3).map((item) => <span key={item.id}>{item.label}</span>)}
                </div>
              </div>
              <div className="admin-experience-card-facts">
                <span><strong>Zahlung</strong>{booking.paymentStatus}</span>
                <span><strong>Personen</strong>{booking.guests ?? 'Offen'}</span>
                <span><strong>Nächster Schritt</strong>{booking.followUpAt ? formatFollowUpDate(booking.followUpAt) : openItems.length === 0 && supportCount === 0 ? 'Aufenthalt bereit' : 'Offen'}</span>
                <span><strong>Unterkunft</strong>{booking.packageItem?.stay.name ?? 'Offen'}</span>
                <span><strong>Check-in</strong>{booking.checkInStatus ?? 'offen'}</span>
                <span><strong>Erlebnis</strong>{booking.experienceStatus ?? 'offen'}</span>
              </div>
              <div className="admin-contact-links">
                <a href={`mailto:${booking.email}`}>{booking.email}</a>
                <a href={`tel:${booking.phone.replace(/\s/g, '')}`}>{booking.phone}</a>
              </div>
              <footer className="admin-package-card-footer">
                <span>{openItems.length === 0 && supportCount === 0 ? 'Aufenthalt operativ bereit' : `${openItems.length + supportCount} Punkt${openItems.length + supportCount === 1 ? '' : 'e'} vor Anreise offen`}</span>
                <div className="admin-package-actions">
                  <button className="admin-row-action" type="button" onClick={() => setSelectedBookingId(booking.id)}>Öffnen</button>
                  {bookingCustomer && <button className="admin-row-action" type="button" onClick={() => setSelectedCustomerId(bookingCustomer.id)}>Kunde öffnen</button>}
                  <a className="admin-row-action" href={`/auszeiten/${booking.packageSlug}`}>Auszeit prüfen</a>
                  {isGuestStayUnlocked(booking.status) && (
                    <a className="admin-row-action" href={guestStayHref({ id: booking.id, email: booking.email })}>Gästebereich</a>
                  )}
                </div>
              </footer>
            </article>
            )
          })}
          </div>
        </AdminPanel>
      </section>
    )
  }
  const renderPackages = () => {
    const liveReadyPackages = adminPackages.filter((pkg) => (
      pkg.status === 'published'
      && packageHasUsableDates(pkg)
      && ownerProperties.some((property) => property.id === pkg.propertyId)
    ))
    const packagesWithOpenExperience = adminPackages.filter((pkg) => packageOpenExperienceItems(pkg).length > 0)
    const draftPackages = adminPackages.filter((pkg) => pkg.status !== 'published' || !packageHasUsableDates(pkg))

    return (
      <section className="admin-leads-layout">
        <section className="admin-command-strip admin-package-metrics" aria-label="Auszeiten Kennzahlen">
          <article><span>{livePackageCount}</span><p>Live-Auszeiten</p></article>
          <article><span>{packageDateCount}</span><p>Aktive Termine</p></article>
          <article><span>{packageStayCount}</span><p>Verbundene Unterkünfte</p></article>
          <article><span>{includedExperienceCount}</span><p>Enthaltene Erlebnisse</p></article>
        </section>
        <AdminPanel title="Auszeitenarbeit">
          <div className="admin-panel-heading">
            <p className="admin-panel-intro">Pakete als Produkt steuern: marktfähig, erlebnisoffen oder noch im Aufbau.</p>
            <button className="admin-row-action" type="button" onClick={() => createPackageFromTemplate()}>Neue Auszeit</button>
          </div>
          <section className="admin-task-grid" aria-label="Auszeitenarbeit">
            {renderPackageLane(
              'Live prüfbar',
              'Auszeiten mit Objekt, Terminen und veröffentlichter Seite.',
              liveReadyPackages,
              'Keine Auszeit ist vollständig live prüfbar.',
              () => {
                setPackageAudienceFilter('all')
                setPackageStatusFilter('published')
              },
            )}
            {renderPackageLane(
              'Erlebnis offen',
              'Pakete, bei denen Erlebnisbausteine noch nicht bestätigt sind.',
              packagesWithOpenExperience,
              'Alle Erlebnisbausteine sind bestätigt.',
              () => {
                setPackageAudienceFilter('all')
                setPackageStatusFilter('all')
              },
            )}
            {renderPackageLane(
              'Im Aufbau',
              'Entwürfe, pausierte Auszeiten oder Pakete ohne saubere Termine.',
              draftPackages,
              'Keine Auszeit im Aufbau.',
              () => {
                setPackageAudienceFilter('all')
                setPackageStatusFilter('draft')
              },
            )}
          </section>
        </AdminPanel>
        <AdminPanel title="Alle Auszeiten">
          <div className="admin-panel-heading">
            <p className="admin-panel-intro">Jede Auszeit muss als Einheit aus Zielgruppe, Termin, Unterkunft und Erlebnis prüfbar sein.</p>
            <button className="admin-row-action" type="button" onClick={() => createPackageFromTemplate()}>Neue Auszeit</button>
          </div>
          <div className="admin-filter-bar" aria-label="Auszeiten filtern">
            <label>Zielgruppe
              <select value={packageAudienceFilter} onChange={(event) => setPackageAudienceFilter(event.target.value as PackageAudienceFilter)}>
                <option value="all">Alle</option>
                <option value="families">Familien</option>
                <option value="couples">Paare</option>
              </select>
            </label>
            <label>Status
              <select value={packageStatusFilter} onChange={(event) => setPackageStatusFilter(event.target.value as PackageStatusFilter)}>
                <option value="all">Alle</option>
                <option value="published">Live</option>
                <option value="draft">Entwurf</option>
                <option value="paused">Pausiert</option>
              </select>
            </label>
          </div>
          {packageCards}
        </AdminPanel>
      </section>
    )
  }
  const experienceCards = (
    <div className="admin-experience-cards">
      {filteredExperienceRows.length === 0 && <p className="admin-empty-note">Kein Erlebnis passt zu den aktuellen Filtern.</p>}
      {filteredExperienceRows.map((item) => (
        <article key={`${item.packageId}-${item.id}`} className={`admin-experience-card ${item.confirmationStatus !== 'confirmed' ? 'is-open' : 'is-ready'}`}>
          <header className="admin-experience-card-header">
            <div>
              <span className="admin-package-kicker">{item.packageName} · {audienceLabel(item.packageAudience)}</span>
              <h3>{item.title}</h3>
            </div>
            <span className="status-pill">{experienceConfirmationLabel(item.confirmationStatus)}</span>
          </header>
          <p>{item.guestNotes}</p>
          <div className="admin-experience-readiness" aria-label={`${item.title} Arbeitsstatus`}>
            <span className={item.providerProfile || item.providerName ? 'is-ready' : 'is-open'}>
              <strong>Anbieter</strong>{item.providerProfile?.name ?? item.providerName ?? 'offen'}
            </span>
            <span className={item.confirmationStatus === 'confirmed' ? 'is-ready' : 'is-open'}>
              <strong>Bestätigung</strong>{experienceConfirmationLabel(item.confirmationStatus)}
            </span>
            <span>
              <strong>Auszeit</strong>{item.packageName}
            </span>
          </div>
          <div className="admin-experience-card-facts">
            <span><strong>Rolle</strong>{experienceRoleLabel(item.role)}</span>
            <span><strong>Preislogik</strong>{item.includedInPrice ? 'im Preis enthalten' : 'nicht enthalten'}</span>
            <span><strong>Anbieterprofil</strong>{item.providerProfile ? 'verbunden' : 'nicht verbunden'}</span>
          </div>
          <footer className="admin-package-card-footer">
            <span>{item.confirmationStatus === 'confirmed' ? 'Für diese Auszeit bestätigt' : item.providerProfile || item.providerName ? 'Bestätigung und Details klären' : 'Passenden Anbieter auswählen'}</span>
            <div className="admin-package-actions">
              {item.providerProfile && (
                <button className="admin-row-action" type="button" onClick={() => item.providerProfile && setSelectedExperienceProviderId(item.providerProfile.id)}>Anbieter öffnen</button>
              )}
              <button className="admin-row-action" type="button" onClick={() => setSelectedExperience({ packageId: item.packageId, experienceId: item.id })}>Bearbeiten</button>
            </div>
          </footer>
        </article>
      ))}
    </div>
  )
  const renderExperiences = () => {
    const unlinkedExperiences = experienceRows.filter((item) => !item.providerProfile && !item.providerName)
    const requestedExperiences = experienceRows.filter((item) => item.confirmationStatus === 'requested' || item.confirmationStatus === 'planned')
    const confirmedExperiences = experienceRows.filter((item) => item.confirmationStatus === 'confirmed')

    return (
      <section className="admin-leads-layout">
        <section className="admin-command-strip admin-package-metrics" aria-label="Erlebnis Kennzahlen">
          <article><span>{experienceRows.length}</span><p>Erlebnisbausteine</p></article>
          <article><span>{includedExperienceCount}</span><p>Enthalten</p></article>
          <article><span>{openExperienceCount}</span><p>Offen</p></article>
          <article><span>{unlinkedExperienceCount}</span><p>Ohne Anbieter</p></article>
        </section>
        <AdminPanel title="Erlebnisarbeit">
          <p className="admin-panel-intro">Erlebnisse werden erst paketfähig, wenn Anbieter, Rolle und Bestätigung klar sind.</p>
          <section className="admin-task-grid" aria-label="Erlebnisarbeit">
            {renderExperienceLane(
              'Ohne Anbieter',
              'Bausteine, die noch mit einem echten Anbieter verbunden werden müssen.',
              unlinkedExperiences,
              'Alle Erlebnisbausteine haben einen Anbieter.',
              () => {
                setExperienceProviderFilter('none')
                setExperienceConfirmationFilter('all')
                setExperienceRoleFilter('all')
              },
            )}
            {renderExperienceLane(
              'Anfrage offen',
              'Geplante oder angefragte Bausteine, die noch nicht bestätigt sind.',
              requestedExperiences,
              'Keine offene Erlebnisanfrage.',
              () => {
                setExperienceProviderFilter('all')
                setExperienceConfirmationFilter('requested')
                setExperienceRoleFilter('all')
              },
            )}
            {renderExperienceLane(
              'Bestätigt',
              'Bausteine, die für Auszeiten belastbar genutzt werden können.',
              confirmedExperiences,
              'Noch kein Erlebnis ist bestätigt.',
              () => {
                setExperienceProviderFilter('all')
                setExperienceConfirmationFilter('confirmed')
                setExperienceRoleFilter('all')
              },
            )}
          </section>
        </AdminPanel>
        <AdminPanel title="Alle Erlebnisse">
          <p className="admin-panel-intro">Erlebnisbausteine nach Auszeit, Rolle und Bestätigungsstand prüfen und operativ pflegen.</p>
          <div className="admin-filter-bar" aria-label="Erlebnisse filtern">
            <label>Auszeit
              <select value={experiencePackageFilter} onChange={(event) => setExperiencePackageFilter(event.target.value as ExperiencePackageFilter)}>
                <option value="all">Alle</option>
                {adminPackages.map((pkg) => <option key={pkg.id} value={pkg.id}>{pkg.name}</option>)}
              </select>
            </label>
            <label>Rolle
              <select value={experienceRoleFilter} onChange={(event) => setExperienceRoleFilter(event.target.value as ExperienceRoleFilter)}>
                <option value="all">Alle</option>
                <option value="included">Enthalten</option>
                <option value="optional">Optional</option>
                <option value="recommendation">Empfehlung</option>
                <option value="planned">Geplant</option>
              </select>
            </label>
            <label>Status
              <select value={experienceConfirmationFilter} onChange={(event) => setExperienceConfirmationFilter(event.target.value as ExperienceConfirmationFilter)}>
                <option value="all">Alle</option>
                <option value="planned">Geplant</option>
                <option value="requested">Angefragt</option>
                <option value="confirmed">Bestätigt</option>
              </select>
            </label>
            <label>Anbieter
              <select value={experienceProviderFilter} onChange={(event) => setExperienceProviderFilter(event.target.value as ExperienceProviderFilter)}>
                <option value="all">Alle</option>
                <option value="none">Ohne Anbieter</option>
                {experienceProviders.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
              </select>
            </label>
          </div>
          {experienceCards}
        </AdminPanel>
      </section>
    )
  }
  const renderOwners = () => {
    const reviewProperties = ownerProperties.filter((property) => property.status === 'lead' || property.status === 'in-review')
    const activeProperties = ownerProperties.filter((property) => property.status === 'active')
    const linkedProperties = ownerProperties.filter((property) => linkedPackageCount(property.id) > 0)

    return (
      <section className="admin-leads-layout">
        <section className="admin-command-strip admin-package-metrics" aria-label="Eigentümer Kennzahlen">
          <article><span>{ownerProperties.length}</span><p>Objektprofile</p></article>
          <article><span>{activeProperties.length}</span><p>Aktiv</p></article>
          <article><span>{ownerProperties.reduce((sum, property) => sum + linkedPackageCount(property.id), 0)}</span><p>Verknüpfte Auszeiten</p></article>
          <article><span>{reviewProperties.length}</span><p>In Prüfung</p></article>
        </section>
        <AdminPanel title="Objektarbeit">
          <div className="admin-panel-heading">
            <p className="admin-panel-intro">Objekte werden erst wertvoll, wenn Status, Anreise, Schlüssel und Auszeit-Verknüpfung sauber gepflegt sind.</p>
            <button className="admin-row-action" type="button" onClick={createOwnerProperty}>Neues Objekt</button>
          </div>
          <section className="admin-task-grid" aria-label="Objektarbeit">
            {renderOwnerLane(
              'In Prüfung',
              'Neue oder noch nicht final freigegebene Objektprofile.',
              reviewProperties,
              'Keine Objektprüfung offen.',
              () => setOwnerStatusFilter('in-review'),
            )}
            {renderOwnerLane(
              'Aktive Objekte',
              'Unterkünfte, die grundsätzlich für Auszeiten nutzbar sind.',
              activeProperties,
              'Noch kein Objekt ist aktiv.',
              () => setOwnerStatusFilter('active'),
            )}
            {renderOwnerLane(
              'Mit Auszeiten',
              'Objekte, die bereits mit konkreten Morrow-Auszeiten verbunden sind.',
              linkedProperties,
              'Noch kein Objekt ist mit einer Auszeit verbunden.',
              () => setOwnerStatusFilter('all'),
            )}
          </section>
        </AdminPanel>
        <AdminPanel title="Alle Objekte">
        <div className="admin-panel-heading">
          <p className="admin-panel-intro">Objektprofile pflegen und sehen, welche Auszeiten bereits mit welcher Unterkunft verbunden sind.</p>
          <button className="admin-row-action" type="button" onClick={createOwnerProperty}>Neues Objekt</button>
        </div>
        <div className="admin-filter-bar" aria-label="Eigentümerobjekte filtern">
          <label>Status
            <select value={ownerStatusFilter} onChange={(event) => setOwnerStatusFilter(event.target.value as OwnerPropertyStatusFilter)}>
              <option value="all">Alle</option>
              <option value="lead">Lead</option>
              <option value="in-review">In Prüfung</option>
              <option value="active">Aktiv</option>
              <option value="paused">Pausiert</option>
            </select>
          </label>
        </div>
        <div className="admin-provider-grid">
          {filteredOwnerProperties.length === 0 && <p className="admin-empty-note">Kein Objekt passt zu den aktuellen Filtern.</p>}
          {filteredOwnerProperties.map((property) => {
            const agency = agencyForProperty(property.id)
            const packageCount = linkedPackageCount(property.id)

            return (
            <article key={property.id} className="admin-provider-card">
              <header>
                <div>
                  <span className="admin-package-kicker">{property.propertyType} · {property.location}</span>
                  <h3>{property.name}</h3>
                </div>
                <span className="status-pill">{ownerPropertyStatusLabel(property.status)}</span>
              </header>
              <p>{property.notes}</p>
              <div className="admin-experience-readiness" aria-label={`${property.name} Objektstatus`}>
                <span className={packageCount > 0 ? 'is-ready' : 'is-open'}>
                  <strong>Auszeit</strong>{packageCount > 0 ? `${packageCount} verbunden` : 'offen'}
                </span>
                <span className={agency ? 'is-ready' : 'is-open'}>
                  <strong>Agentur</strong>{agency?.name ?? 'direkt / offen'}
                </span>
                <span>
                  <strong>Check-in</strong>{checkInTypeLabel(property.checkInType)}
                </span>
              </div>
              <div className="admin-experience-card-facts">
                <span><strong>Eigentümer</strong>{property.ownerName}</span>
                <span><strong>Schlafplätze</strong>{property.sleeps} Personen</span>
                <span><strong>Anreise bis</strong>{property.latestArrival}</span>
                <span><strong>Vermietung</strong>{currentRentalLabel(property.currentRental)}</span>
              </div>
              <div className="admin-contact-links">
                <a href={`mailto:${property.email}`}>{property.email}</a>
                <a href={`tel:${property.phone.replace(/\s/g, '')}`}>{property.phone}</a>
              </div>
              <footer className="admin-package-card-footer">
                <span>{packageCount > 0 ? 'Objekt ist operativ mit einer Auszeit verbunden' : 'Noch keiner Auszeit zugeordnet'}</span>
                <div className="admin-package-actions">
                  {agency && <button className="admin-row-action" type="button" onClick={() => setSelectedAgencyId(agency.id)}>Agentur öffnen</button>}
                  <button className="admin-row-action" type="button" onClick={() => setSelectedOwnerPropertyId(property.id)}>Bearbeiten</button>
                  <button className="admin-row-action" type="button" onClick={() => toggleOwnerPropertyPaused(property.id)}>{property.status === 'paused' ? 'Reaktivieren' : 'Pausieren'}</button>
                </div>
              </footer>
            </article>
          )})}
        </div>
      </AdminPanel>
    </section>
    )
  }
  const renderAgencies = () => {
    const activeAgencies = agencies.filter((agency) => agency.status === 'active')
    const agenciesWithoutDates = agencies.filter((agency) => agency.status !== 'paused' && agency.availableDatesNote.trim().length === 0)
    const agenciesWithProperties = agencies.filter((agency) => agency.managedPropertyIds.length > 0)

    return (
      <section className="admin-leads-layout">
        <section className="admin-command-strip admin-package-metrics" aria-label="Agentur Kennzahlen">
          <article><span>{agencies.length}</span><p>Agenturen</p></article>
          <article><span>{activeAgencies.length}</span><p>Aktiv</p></article>
          <article><span>{agencies.reduce((sum, agency) => sum + agency.managedPropertyIds.length, 0)}</span><p>Objekte</p></article>
          <article><span>{Math.round(agencies.reduce((sum, agency) => sum + agency.responseDueDays, 0) / Math.max(agencies.length, 1))}</span><p>Ø Rückmeldung Tage</p></article>
        </section>
        <AdminPanel title="Agenturarbeit">
          <div className="admin-panel-heading">
            <p className="admin-panel-intro">Agenturen sind im Start der Zugang zu Objekten, freien Terminen und Nutzungsfreigaben.</p>
            <button className="admin-row-action" type="button" onClick={createAgency}>Neue Agentur</button>
          </div>
          <section className="admin-task-grid" aria-label="Agenturarbeit">
            {renderAgencyLane(
              'Aktive Startpartner',
              'Agenturen, mit denen Phase 1 operativ laufen kann.',
              activeAgencies,
              'Noch keine aktive Agentur.',
              () => setAgencyStatusFilter('active'),
            )}
            {renderAgencyLane(
              'Termine klären',
              'Partner, bei denen freie Termine oder Verfügbarkeitslogik fehlen.',
              agenciesWithoutDates,
              'Bei allen aktiven Agenturen sind Termine notiert.',
              () => setAgencyStatusFilter('all'),
            )}
            {renderAgencyLane(
              'Mit Objekten',
              'Agenturen, die bereits konkrete Unterkunftsprofile betreuen.',
              agenciesWithProperties,
              'Noch keine Agentur ist mit Objekten verbunden.',
              () => setAgencyStatusFilter('all'),
            )}
          </section>
        </AdminPanel>
        <AdminPanel title="Alle Agenturen">
        <div className="admin-panel-heading">
          <p className="admin-panel-intro">Agenturen liefern in Phase 1 Objektzugang, freie Termine und Nutzungsfreigaben. Sie sind Startpartner, nicht direkte Eigentümerprofile.</p>
          <button className="admin-row-action" type="button" onClick={createAgency}>Neue Agentur</button>
        </div>
        <div className="admin-filter-bar" aria-label="Agenturen filtern">
          <label>Status
            <select value={agencyStatusFilter} onChange={(event) => setAgencyStatusFilter(event.target.value as AgencyStatusFilter)}>
              <option value="all">Alle</option>
              <option value="lead">Lead</option>
              <option value="active">Aktiv</option>
              <option value="paused">Pausiert</option>
            </select>
          </label>
        </div>
        <div className="admin-provider-grid">
          {filteredAgencies.length === 0 && <p className="admin-empty-note">Keine Agentur passt zu den aktuellen Filtern.</p>}
          {filteredAgencies.map((agency) => {
            const linkedProperties = ownerProperties.filter((property) => agency.managedPropertyIds.includes(property.id))
            const linkedPackagesForAgency = adminPackages.filter((pkg) => agency.managedPropertyIds.includes(pkg.propertyId))
            const hasAvailabilityNote = agency.availableDatesNote.trim().length > 0

            return (
              <article key={agency.id} className="admin-provider-card">
                <header>
                  <div>
                    <span className="admin-package-kicker">{agency.location} · {linkedProperties.length} Objekt{linkedProperties.length === 1 ? '' : 'e'}</span>
                    <h3>{agency.name}</h3>
                  </div>
                  <span className="status-pill">{agencyStatusLabel(agency.status)}</span>
                </header>
                <p>{agency.notes}</p>
                <div className="admin-experience-readiness" aria-label={`${agency.name} Agenturstatus`}>
                  <span className={linkedProperties.length > 0 ? 'is-ready' : 'is-open'}>
                    <strong>Objekte</strong>{linkedProperties.length}
                  </span>
                  <span className={linkedPackagesForAgency.length > 0 ? 'is-ready' : 'is-open'}>
                    <strong>Auszeiten</strong>{linkedPackagesForAgency.length}
                  </span>
                  <span className={hasAvailabilityNote ? 'is-ready' : 'is-open'}>
                    <strong>Termine</strong>{hasAvailabilityNote ? 'Notiz da' : 'offen'}
                  </span>
                </div>
                <div className="admin-experience-card-facts">
                  <span><strong>Ansprechpartner</strong>{agency.contactName || 'Offen'}</span>
                  <span><strong>Rückmeldung</strong>{agency.responseDueDays} Tage</span>
                  <span><strong>Freie Termine</strong>{agency.availableDatesNote}</span>
                </div>
                <div className="admin-contact-links">
                  <a href={`mailto:${agency.email}`}>{agency.email}</a>
                  <a href={`tel:${agency.phone.replace(/\s/g, '')}`}>{agency.phone}</a>
                </div>
                <div className="admin-linked-list">
                  {linkedProperties.length === 0 && <p className="admin-empty-note">Noch kein Objekt verbunden.</p>}
                  {linkedProperties.map((property) => (
                    <article key={property.id}>
                      <strong>{property.name}</strong>
                      <span>{property.propertyType} · {property.location} · {property.sleeps} Personen</span>
                      <button className="admin-row-action" type="button" onClick={() => setSelectedOwnerPropertyId(property.id)}>Objekt öffnen</button>
                    </article>
                  ))}
                </div>
                <footer className="admin-package-card-footer">
                  <span>{agency.status === 'active' ? 'Aktiver Startpartner' : agency.status === 'paused' ? 'Aktuell pausiert' : 'Kontakt prüfen'}</span>
                  <div className="admin-package-actions">
                    <button className="admin-row-action" type="button" onClick={() => setSelectedAgencyId(agency.id)}>Bearbeiten</button>
                    <button className="admin-row-action" type="button" onClick={() => toggleAgencyPaused(agency.id)}>{agency.status === 'paused' ? 'Reaktivieren' : 'Pausieren'}</button>
                  </div>
                </footer>
              </article>
            )
          })}
        </div>
      </AdminPanel>
    </section>
    )
  }
  const renderExperienceProviders = () => {
    const partnerProviders = experienceProviders.filter((provider) => provider.status === 'partner')
    const reviewProviders = experienceProviders.filter((provider) => provider.status === 'lead' || provider.status === 'in-review')
    const linkedProviders = experienceProviders.filter((provider) => linkedExperienceCount(provider.id) > 0)

    return (
      <section className="admin-leads-layout">
        <section className="admin-command-strip admin-package-metrics" aria-label="Erlebnisanbieter Kennzahlen">
          <article><span>{experienceProviders.length}</span><p>Anbieterprofile</p></article>
          <article><span>{partnerProviders.length}</span><p>Partner</p></article>
          <article><span>{experienceProviders.filter((provider) => provider.status === 'in-review').length}</span><p>In Prüfung</p></article>
          <article><span>{experienceProviders.reduce((sum, provider) => sum + linkedExperienceCount(provider.id), 0)}</span><p>Verknüpfte Erlebnisse</p></article>
        </section>
        <AdminPanel title="Anbieterarbeit">
          <div className="admin-panel-heading">
            <p className="admin-panel-intro">Partnerkontakte, geprüfte Anbieter und verknüpfte Erlebnisbausteine in einem Arbeitsblick.</p>
            <button className="admin-row-action" type="button" onClick={createExperienceProvider}>Neuer Anbieter</button>
          </div>
          <section className="admin-task-grid" aria-label="Erlebnisanbieterarbeit">
            {renderExperienceProviderLane(
              'In Prüfung',
              'Neue oder noch nicht final entschiedene Anbieterprofile.',
              reviewProviders,
              'Keine Anbieterprüfung offen.',
              () => setExperienceProviderStatusFilter('in-review'),
            )}
            {renderExperienceProviderLane(
              'Partner',
              'Anbieter, die grundsätzlich nutzbar sind.',
              partnerProviders,
              'Noch kein Anbieter ist als Partner markiert.',
              () => setExperienceProviderStatusFilter('partner'),
            )}
            {renderExperienceProviderLane(
              'Mit Bausteinen',
              'Anbieter, die bereits mit Auszeiten verbunden sind.',
              linkedProviders,
              'Noch kein Anbieter ist mit Erlebnisbausteinen verbunden.',
              () => setExperienceProviderStatusFilter('all'),
            )}
          </section>
        </AdminPanel>
        <AdminPanel title="Alle Erlebnisanbieter">
          <div className="admin-panel-heading">
            <p className="admin-panel-intro">Anbieterprofile pflegen und sehen, welche Erlebnisbausteine bereits mit ihnen verbunden sind.</p>
            <button className="admin-row-action" type="button" onClick={createExperienceProvider}>Neuer Anbieter</button>
          </div>
          <div className="admin-provider-grid">
            <div className="admin-filter-bar" aria-label="Erlebnisanbieter filtern">
              <label>Status
                <select value={experienceProviderStatusFilter} onChange={(event) => setExperienceProviderStatusFilter(event.target.value as ExperienceProviderStatusFilter)}>
                  <option value="all">Alle</option>
                  <option value="lead">Lead</option>
                  <option value="in-review">In Prüfung</option>
                  <option value="partner">Partner</option>
                  <option value="paused">Pausiert</option>
                </select>
              </label>
            </div>
            {filteredExperienceProviders.length === 0 && <p className="admin-empty-note">Kein Erlebnisanbieter passt zu den aktuellen Filtern.</p>}
            {filteredExperienceProviders.map((provider) => {
            const linkedExperiencesForProvider = experienceRows.filter((item) => item.providerProfile?.id === provider.id)
            const openLinkedExperiences = linkedExperiencesForProvider.filter((item) => item.confirmationStatus !== 'confirmed')

            return (
              <article key={provider.id} className="admin-provider-card">
                <header>
                  <div>
                    <span className="admin-package-kicker">{provider.category} · {provider.location}</span>
                    <h3>{provider.name}</h3>
                  </div>
                  <span className="status-pill">{experienceProviderStatusLabel(provider.status)}</span>
                </header>
                <p>{provider.notes}</p>
                <div className="admin-experience-readiness" aria-label={`${provider.name} Anbieterstatus`}>
                  <span className={provider.status === 'partner' ? 'is-ready' : 'is-open'}>
                    <strong>Status</strong>{experienceProviderStatusLabel(provider.status)}
                  </span>
                  <span>
                    <strong>Zielgruppe</strong>{provider.audienceFit}
                  </span>
                  <span className={linkedExperiencesForProvider.length > 0 ? 'is-ready' : 'is-open'}>
                    <strong>Bausteine</strong>{linkedExperiencesForProvider.length}
                  </span>
                </div>
                <div className="admin-experience-card-facts">
                  <span><strong>Kontakt</strong>{provider.contactName}</span>
                  <span><strong>Ort</strong>{provider.location}</span>
                  <span><strong>Kategorie</strong>{provider.category}</span>
                </div>
                <div className="admin-contact-links">
                  <a href={`mailto:${provider.email}`}>{provider.email}</a>
                  <a href={`tel:${provider.phone.replace(/\s/g, '')}`}>{provider.phone}</a>
                </div>
                <div className="admin-linked-list">
                  {linkedExperiencesForProvider.length === 0 && <p className="admin-empty-note">Noch kein Erlebnisbaustein verbunden.</p>}
                  {linkedExperiencesForProvider.map((experience) => (
                    <article key={`${experience.packageId}-${experience.id}`}>
                      <strong>{experience.title}</strong>
                      <span>{experience.packageName} · {experienceRoleLabel(experience.role)} · {experienceConfirmationLabel(experience.confirmationStatus)}</span>
                      <button className="admin-row-action" type="button" onClick={() => setSelectedExperience({ packageId: experience.packageId, experienceId: experience.id })}>Erlebnis öffnen</button>
                    </article>
                  ))}
                </div>
                <footer className="admin-package-card-footer">
                  <span>{linkedExperiencesForProvider.length > 0 ? `${openLinkedExperiences.length} Bausteine noch zu bestätigen` : 'Noch keinem Erlebnis zugeordnet'}</span>
                  <div className="admin-package-actions">
                    <button className="admin-row-action" type="button" onClick={() => setSelectedExperienceProviderId(provider.id)}>Bearbeiten</button>
                    <button className="admin-row-action" type="button" onClick={() => toggleExperienceProviderPaused(provider.id)}>{provider.status === 'paused' ? 'Reaktivieren' : 'Pausieren'}</button>
                  </div>
                </footer>
              </article>
            )
          })}
          </div>
        </AdminPanel>
      </section>
    )
  }
  const renderLocalPlaces = () => (
    <section className="admin-leads-layout">
      <section className="admin-command-strip admin-package-metrics" aria-label="Vor Ort Kennzahlen">
        <article><span>{adminLocalPlaces.length}</span><p>Kandidaten</p></article>
        <article><span>{localPlacesReadyForGuest.length}</span><p>sichtbar</p></article>
        <article><span>{adminLocalPlaces.filter((place) => place.status === 'candidate').length}</span><p>zu prüfen</p></article>
        <article><span>{localPlacesMissingLocation.length}</span><p>Koordinaten offen</p></article>
        <article><span>{eventReadyForReview.length}</span><p>Events bereit</p></article>
      </section>
      <AdminPanel title="Lokale Empfehlungen">
        <div className="admin-panel-heading">
          <p className="admin-panel-intro">Hier sammelst du echte Orte pro Kategorie. In der Gästeseite erscheinen nur Einträge mit Status „Freigegeben“ und Koordinaten.</p>
          <button className="admin-row-action" type="button" onClick={createLocalPlaceCandidate}>Neuer Ort</button>
        </div>
        <section className="admin-event-import" aria-label="Veranstaltungen importieren">
          <div className="admin-panel-heading">
            <div>
              <h3>Veranstaltungen importieren</h3>
              <p className="admin-panel-intro">{rawSpoEvents.length} Rohkandidaten aus dem offiziellen SPO-Veranstaltungskalender. Übernimm nur Events, die wirklich zu Morrow passen.</p>
            </div>
            <button className="admin-row-action" type="button" onClick={() => {
              setLocalPlaceCategoryFilter('event')
              setLocalPlaceStatusFilter('candidate')
            }}>Event-Kandidaten anzeigen</button>
          </div>
          <div className="admin-event-curation-strip" aria-label="Event-Kuratierung">
            <article>
              <strong>{eventCandidates.length}</strong>
              <span>übernommen</span>
            </article>
            <article>
              <strong>{rawSpoEvents.length}</strong>
              <span>Rohkalender</span>
            </article>
            <article>
              <strong>{rawPublicEventCount}</strong>
              <span>Veranstaltungen</span>
            </article>
            <article>
              <strong>{rawBookableExperienceCount}</strong>
              <span>buchbare Erlebnisse</span>
            </article>
            <article>
              <strong>{eventNeedsCuration.length}</strong>
              <span>noch zu kuratieren</span>
            </article>
            <article>
              <strong>{eventReadyForReview.length}</strong>
              <span>freigabebereit</span>
            </article>
          </div>
          <section className="admin-event-import-details" aria-label="Gescrapte Veranstaltungskandidaten">
            <div className="admin-event-import-title">
              <div>
                <span>Gescrapte Kandidaten</span>
                <strong>{filteredRawSpoEvents.length} Treffer im Rohkalender</strong>
              </div>
              <p>Öffentliche Veranstaltungen werden zu Vor-Ort-Kandidaten. Buchbare Erlebnisse wie Yoga, Reiten, Fotoshooting oder Kurse werden als Erlebnisanbieter-Kandidat übernommen und später gezielt einer Auszeit zugeordnet.</p>
            </div>
            <div className="admin-filter-bar admin-filter-bar-four" aria-label="Veranstaltungen filtern">
              <label>Suche
                <input value={eventImportSearch} onChange={(event) => setEventImportSearch(event.target.value)} placeholder="z. B. Familie, Yoga, Watt" />
              </label>
              <label>Ort
                <select value={eventImportTown} onChange={(event) => setEventImportTown(event.target.value)}>
                  <option value="all">Alle Orte</option>
                  {eventImportTowns.map((town) => <option key={town} value={town}>{town}</option>)}
                </select>
              </label>
              <label>Von
                <input type="date" value={eventImportDateFrom} onChange={(event) => setEventImportDateFrom(event.target.value)} />
              </label>
              <label>Bis
                <input type="date" value={eventImportDateTo} onChange={(event) => setEventImportDateTo(event.target.value)} />
              </label>
            </div>
            <div className="admin-event-import-list">
              {filteredRawSpoEvents.length === 0 && <p className="admin-empty-note">Keine Veranstaltung passt zu den aktuellen Filtern.</p>}
              {filteredRawSpoEvents.map((event) => {
                const alreadyImported = importedEventIds.has(`event-${event.id}-${event.date ? event.date.slice(0, 10) : 'date-open'}`)
                const importKind = rawSpoImportKind(event)
                const providerName = rawSpoExperienceProviderName(event)
                const existingProvider = experienceProviders.find((provider) => provider.id === `provider-${slugify(providerName)}` || provider.name.toLowerCase() === providerName.toLowerCase())
                return (
                  <article key={`${event.id}-${event.date ?? ''}`}>
                    {event.imageUrl && <img src={event.imageUrl} alt="" loading="lazy" />}
                    <div>
                      <span className="admin-package-kicker">{rawSpoImportKindLabel(importKind)} · {event.dateLabel || 'Termin offen'} · {event.town || event.place || 'Ort offen'}</span>
                      <strong>{event.title}</strong>
                      <p>{event.description || 'Keine Kurzbeschreibung in den Rohdaten.'}</p>
                      <small>{[...(event.groups ?? []), ...(event.themes ?? [])].slice(0, 4).join(' · ') || 'Noch nicht eingeordnet'}</small>
                    </div>
                    <div className="admin-event-import-actions">
                      {importKind === 'bookable-experience' ? (
                        <>
                          <button className="admin-row-action" type="button" onClick={() => importRawSpoExperienceProvider(event)}>
                            {existingProvider ? 'Anbieter öffnen' : 'Als Anbieter übernehmen'}
                          </button>
                          <small>{providerName}</small>
                        </>
                      ) : (
                        <button className="admin-row-action" type="button" onClick={() => importRawSpoEvent(event)}>
                          {alreadyImported ? 'Event öffnen' : 'Als Event übernehmen'}
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        </section>
        <div className="admin-filter-bar admin-filter-bar-four" aria-label="Vor Ort Kandidaten filtern">
          <label>Kategorie
            <select value={localPlaceCategoryFilter} onChange={(event) => setLocalPlaceCategoryFilter(event.target.value as LocalPlaceCategoryFilter)}>
              <option value="all">Alle</option>
              {Object.entries(localPlaceCategoryLabels)
                .filter(([value]) => value !== 'all')
                .map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>Status
            <select value={localPlaceStatusFilter} onChange={(event) => setLocalPlaceStatusFilter(event.target.value as LocalPlaceStatusFilter)}>
              <option value="all">Alle</option>
              <option value="candidate">Kandidat</option>
              <option value="approved">Freigegeben</option>
              <option value="paused">Pausiert</option>
              <option value="rejected">Nicht passend</option>
            </select>
          </label>
          <label>Arbeitsstand
            <select value={localPlaceReviewFilter} onChange={(event) => setLocalPlaceReviewFilter(event.target.value as LocalPlaceReviewFilter)}>
              <option value="all">Alle</option>
              <option value="needsReview">Offene Prüfpunkte</option>
              <option value="ready">Freigabebereit</option>
              <option value="visible">Sichtbar in App</option>
              <option value="rejected">Nicht passend</option>
            </select>
          </label>
        </div>
        <div className="admin-local-place-list">
          {filteredLocalPlaceCandidates.length === 0 && <p className="admin-empty-note">Kein Ort passt zu den aktuellen Filtern.</p>}
          {filteredLocalPlaceCandidates.map((place) => {
            const isVisible = place.status === 'approved' && place.lat && place.lng
            const isBlocked = place.status === 'approved' && (!place.lat || !place.lng)
            const reviewIssues = localPlaceReviewIssues(place)
            const canApprove = reviewIssues.length === 0

            return (
              <article key={place.id} className="admin-provider-card">
                <header>
                  <div>
                    <span className="admin-package-kicker">{localPlaceCategoryLabels[place.category]} · {place.meta}</span>
                    <h3>{place.title}</h3>
                  </div>
                  <span className="status-pill">{localPlaceStatusLabel(place.status)}</span>
                </header>
                <p>{place.description}</p>
                <div className="admin-experience-readiness" aria-label={`${place.title} Freigabestatus`}>
                  <span className={isVisible ? 'is-ready' : 'is-open'}>
                    <strong>Gast-App</strong>{isVisible ? 'sichtbar' : isBlocked ? 'Koordinaten offen' : 'intern'}
                  </span>
                  <span className={place.sourceUrl ? 'is-ready' : 'is-open'}>
                    <strong>Quelle</strong>{place.sourceUrl ? 'hinterlegt' : 'offen'}
                  </span>
                  <span className={place.openingHours ? 'is-ready' : 'is-open'}>
                    <strong>Öffnungszeiten</strong>{place.openingHours ? 'gepflegt' : 'offen'}
                  </span>
                  <span className={place.lat && place.lng ? 'is-ready' : 'is-open'}>
                    <strong>Karte</strong>{place.lat && place.lng ? 'bereit' : 'offen'}
                  </span>
                  <span className={canApprove ? 'is-ready' : 'is-open'}>
                    <strong>Prüfung</strong>{localPlaceReviewLabel(place)}
                  </span>
                  {place.category === 'experience' && (
                    <span className={place.audiences?.length && place.packageFit?.length ? 'is-ready' : 'is-open'}>
                      <strong>Passung</strong>{place.audiences?.length && place.packageFit?.length ? 'gepflegt' : 'offen'}
                    </span>
                  )}
                  {place.category === 'event' && (
                    <span className={place.eventStartDate ? 'is-ready' : 'is-open'}>
                      <strong>Termin</strong>{place.eventStartDate ? 'gepflegt' : 'offen'}
                    </span>
                  )}
                </div>
                <div className="admin-experience-card-facts">
                  <span><strong>Kategorie</strong>{localPlaceCategoryLabels[place.category]}</span>
                  <span><strong>Adresse</strong>{place.address ?? 'Offen'}</span>
                  <span><strong>Öffnungszeiten</strong>{place.openingHours ?? 'Offen'}</span>
                  <span><strong>Telefon</strong>{place.phone ?? 'Offen'}</span>
                  {place.category === 'experience' && <span><strong>Zielgruppe</strong>{localExperienceFitSummary(place)}</span>}
                  {place.category === 'experience' && <span><strong>Setting</strong>{place.setting ? localExperienceSettingLabels[place.setting] : 'Offen'}</span>}
                  {place.category === 'event' && <span><strong>Event</strong>{localEventFitSummary(place)}</span>}
                  <span><strong>Latitude</strong>{place.lat ?? 'Offen'}</span>
                  <span><strong>Longitude</strong>{place.lng ?? 'Offen'}</span>
                </div>
                <footer className="admin-package-card-footer">
                  <span>{place.routeNote}</span>
                  <div className="admin-package-actions">
                    {place.sourceUrl && <a className="admin-row-action" href={place.sourceUrl} target="_blank" rel="noreferrer">Quelle</a>}
                    <button className="admin-row-action" type="button" onClick={() => setSelectedLocalPlaceCandidateId(place.id)}>Bearbeiten</button>
                    <button className="admin-row-action" type="button" onClick={() => createLocalPlaceCurationTask(place)}>Aufgabe</button>
                    <button className="admin-row-action" type="button" disabled={!canApprove} title={canApprove ? 'Für Gäste freigeben' : reviewIssues.join(', ')} onClick={() => updateLocalPlaceCandidate(place.id, { status: 'approved' })}>Freigeben</button>
                    <button className="admin-row-action" type="button" onClick={() => updateLocalPlaceCandidate(place.id, { status: 'rejected' })}>Nicht passend</button>
                    <button className="admin-row-action" type="button" onClick={() => toggleLocalPlaceCandidatePaused(place.id)}>{place.status === 'paused' ? 'Reaktivieren' : 'Pausieren'}</button>
                  </div>
                </footer>
              </article>
            )
          })}
        </div>
      </AdminPanel>
    </section>
  )
  const renderAdminContent = () => {
    if (activeSection === 'leads') return renderLeads()
    if (activeSection === 'tasks') return renderTasks()
    if (activeSection === 'guestSupport') return renderGuestSupport()
    if (activeSection === 'customers') return renderCustomers()
    if (activeSection === 'bookings') return renderBookings()
    if (activeSection === 'packages') return renderPackages()
    if (activeSection === 'experiences') return renderExperiences()
    if (activeSection === 'localPlaces') return renderLocalPlaces()
    if (activeSection === 'owners') return renderOwners()
    if (activeSection === 'agencies') return renderAgencies()
    if (activeSection === 'experienceProviders') return renderExperienceProviders()
    return renderOverview()
  }

  return (
    <main className="admin-page">
      <aside className="admin-sidebar" aria-label="Admin Navigation">
        <img src="/brand/logos/wordmark/morrow-logomark-offwhite.svg" alt="Morrow" />
        <nav>
          {adminSections.map((section) => (
            <button key={section.id} className={activeSection === section.id ? 'active' : ''} type="button" onClick={() => setActiveSection(section.id)}>
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>{sectionIntro[activeSection].title}</h1>
            <p>{sectionIntro[activeSection].text}</p>
          </div>
          <div className="admin-topbar-actions">
            <span className="admin-auth-pill">
              {authMode === 'supabase' ? adminEmail ?? 'Eingeloggt' : 'Lokale Demo'}
            </span>
            <a className="admin-action" href="/">Website öffnen</a>
            {onSignOut && <button className="admin-action" type="button" onClick={onSignOut}>Abmelden</button>}
          </div>
        </header>
        {renderAdminContent()}
      </section>
      <LeadDetailDrawer
        lead={selectedLead}
        emailEvents={selectedLeadEmailEvents}
        communicationEvents={selectedLeadCommunicationEvents}
        leadLabel={leadReferenceLabel}
        onArchive={(id) => {
          onArchive(id)
          setSelectedLeadId(null)
        }}
        onClose={() => setSelectedLeadId(null)}
        onDelete={(id) => {
          onDelete(id)
          setSelectedLeadId(null)
        }}
        onUpdateLead={onUpdateLead}
        onCreateCommunicationEvent={createCommunicationEvent}
        onOpenPartnerProfile={(lead) => {
          if (lead.type === 'owner') openOrCreateOwnerPropertyFromLead(lead)
          if (lead.type === 'experience') openOrCreateExperienceProviderFromLead(lead)
        }}
      />
      <CustomerDetailDrawer
        customer={selectedCustomer}
        bookings={selectedCustomer ? bookingRows.filter((booking) => booking.email.toLowerCase() === selectedCustomer.email.toLowerCase()) : []}
        onClose={() => setSelectedCustomerId(null)}
        onOpenLead={(id) => {
          setSelectedLeadId(id)
          setSelectedCustomerId(null)
        }}
        onOpenBooking={(id) => {
          setSelectedBookingId(id)
          setSelectedCustomerId(null)
        }}
      />
      <BookingDetailDrawer
        lead={selectedBookingLead}
        packageItem={selectedBookingLead ? adminPackages.find((pkg) => pkg.slug === selectedBookingLead.packageSlug || pkg.name === selectedBookingLead.packageName) ?? null : null}
        tasks={selectedBookingLead ? adminTasks.filter((task) => task.referenceType === 'booking' && task.referenceId === selectedBookingLead.id) : []}
        onClose={() => setSelectedBookingId(null)}
        onCreateTask={createAdminTask}
        onToggleTask={toggleAdminTaskStatus}
        onMoveTaskInProgress={moveAdminTaskInProgress}
        onUpdateLead={onUpdateLead}
        onUpdatePackage={updatePackage}
      />
      <PackageDetailDrawer
        item={selectedPackage}
        properties={ownerProperties}
        providers={experienceProviders}
        onClose={() => setSelectedPackageId(null)}
        onDeletePackage={deletePackage}
        onUpdatePackage={updatePackage}
      />
      <ExperienceDetailDrawer
        item={selectedExperienceItem}
        packageItem={selectedExperiencePackage}
        providers={experienceProviders}
        onClose={() => setSelectedExperience(null)}
        onUpdateExperience={(packageId, experienceId, updater) => updatePackage(packageId, (pkg) => ({
          ...pkg,
          experienceItems: pkg.experienceItems.map((experience) => (
            experience.id === experienceId ? updater(experience) : experience
          )),
        }))}
      />
      <ExperienceProviderDrawer
        provider={selectedExperienceProvider}
        linkedExperiences={selectedExperienceProvider ? experienceRows.filter((item) => item.providerProfile?.id === selectedExperienceProvider.id) : []}
        onClose={() => setSelectedExperienceProviderId(null)}
        onDeleteProvider={deleteExperienceProvider}
        onOpenExperience={(packageId, experienceId) => {
          setSelectedExperience({ packageId, experienceId })
          setSelectedExperienceProviderId(null)
        }}
        onUpdateProvider={updateExperienceProvider}
      />
      <OwnerPropertyDrawer
        property={selectedOwnerProperty}
        linkedPackages={selectedOwnerProperty ? adminPackages.filter((pkg) => pkg.propertyId === selectedOwnerProperty.id) : []}
        onClose={() => setSelectedOwnerPropertyId(null)}
        onDeleteProperty={deleteOwnerProperty}
        onOpenPackage={(id) => {
          setSelectedPackageId(id)
          setSelectedOwnerPropertyId(null)
        }}
        onUpdateProperty={updateOwnerProperty}
      />
      <AgencyDrawer
        agency={selectedAgency}
        properties={ownerProperties}
        onClose={() => setSelectedAgencyId(null)}
        onDeleteAgency={deleteAgency}
        onOpenProperty={(id) => {
          setSelectedOwnerPropertyId(id)
          setSelectedAgencyId(null)
        }}
        onUpdateAgency={updateAgency}
      />
      <LocalPlaceDrawer
        place={selectedLocalPlaceCandidate}
        onClose={() => setSelectedLocalPlaceCandidateId(null)}
        onDeletePlace={deleteLocalPlaceCandidate}
        onUpdatePlace={updateLocalPlaceCandidate}
      />
    </main>
  )
}

function GuestStayPage({
  lead,
  accessCode,
  onCreateSupportTask,
}: {
  lead: GuestLead | null
  accessCode: string
  onCreateSupportTask: (lead: GuestLead, category: GuestSupportCategory, message: string) => void
}) {
  const [emailDraft, setEmailDraft] = useState('')
  const [codeDraft, setCodeDraft] = useState('')
  const [manualAccess, setManualAccess] = useState(false)
  const [accessError, setAccessError] = useState('')
  const [supportMessage, setSupportMessage] = useState('')
  const [supportCategory, setSupportCategory] = useState<GuestSupportCategory>('general')
  const [supportSent, setSupportSent] = useState(false)
  const [activeView, setActiveView] = useState<GuestAppView>('home')
  const [localFilter, setLocalFilter] = useState<LocalPlaceCategory>('all')
  const [weatherForecastRange, setWeatherForecastRange] = useState<'today' | '3' | '14'>('3')
  const [selectedLocalPlaceId, setSelectedLocalPlaceId] = useState('stay')
  const [localAreaPlaceIds, setLocalAreaPlaceIds] = useState<string[]>([])
  const [localOverviewDrawerOpen, setLocalOverviewDrawerOpen] = useState(false)
  const [localPlaceDrawerOpen, setLocalPlaceDrawerOpen] = useState(false)
  const [compactGuestNav, setCompactGuestNav] = useState(false)
  const [remoteLead, setRemoteLead] = useState<GuestLead | null>(null)
  const [remotePackage, setRemotePackage] = useState<MorrowPackage | null>(null)
  const [remoteLocalPlaces, setRemoteLocalPlaces] = useState<LocalPlaceCandidate[] | null>(null)
  const [remoteAccessChecked, setRemoteAccessChecked] = useState(Boolean(lead))
  const liveLocalData = useLiveLocalData()
  const localDrawerRef = useRef<HTMLElement | null>(null)
  const localDrawerTouchStart = useRef<{ x: number; y: number; scrollTop: number } | null>(null)
  useEffect(() => {
    if (lead) {
      setRemoteAccessChecked(true)
      return
    }

    const bookingId = window.location.pathname.match(/^\/deine-auszeit\/([^/]+)/)?.[1] ?? ''
    let cancelled = false

    setRemoteAccessChecked(false)
    fetchGuestStayByAccess<GuestStayAccessPayload>(bookingId, accessCode)
      .then((payload) => {
        if (cancelled) return
        setRemoteLead(normalizeGuestStayAccessBooking(payload?.booking))
        setRemotePackage(payload?.package ?? null)
      })
      .catch((error) => {
        console.warn('Morrow guest stay access failed.', error)
      })
      .finally(() => {
        if (!cancelled) setRemoteAccessChecked(true)
      })

    return () => {
      cancelled = true
    }
  }, [accessCode, lead])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setRemoteLocalPlaces(null)
      return
    }

    let cancelled = false

    fetchStoredApprovedLocalPlaces<LocalPlaceCandidate>()
      .then((places) => {
        if (cancelled) return
        setRemoteLocalPlaces((places ?? []).map((place) => normalizeLocalPlaceCandidate(place)))
      })
      .catch((error) => {
        console.warn('Morrow guest local places sync failed. Falling back to local curated places.', error)
        if (!cancelled) setRemoteLocalPlaces(null)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const activeLead = lead ?? remoteLead
  const packageItem = activeLead ? remotePackage ?? packages.find((pkg) => pkg.slug === activeLead.packageSlug) ?? null : null
  const propertySupportType = packageItem?.stay.propertySupportType ?? 'morrow'
  const propertySupportName = packageItem?.stay.propertySupportName ?? (propertySupportType === 'hotel' ? 'das Hotel' : 'die Partneragentur')
  const propertyIsMorrowHandled = propertySupportType === 'morrow'
  const expectedCode = activeLead ? guestAccessCode(activeLead) : ''
  const queryAccess = Boolean(activeLead && accessCode.toUpperCase() === expectedCode)
  const unlocked = Boolean(activeLead && isGuestStayUnlocked(activeLead.status) && (queryAccess || manualAccess))
  const includedExperiences = packageItem?.experienceItems.filter((experience) => experience.role === 'included') ?? []
  const primaryExperience = includedExperiences[0]
  const firstName = activeLead?.name.split(' ')[0] ?? ''
  const isFamily = packageItem?.audience === 'families'
  const countdownLabel = activeLead ? guestStayCountdownLabel(activeLead.selectedDate) : null
  const guestLocalPlaces = getGuestLocalPlaces(packageItem, remoteLocalPlaces ?? undefined)
    .filter((place) => !activeLead || localEventOverlapsStay(place, activeLead.selectedDate))
    .filter((place) => localEventFitsPackage(place, packageItem))
  const localFilterOrder: LocalPlaceCategory[] = ['all', 'weather', 'tide', 'beach', 'food', 'experience', 'event', 'shopping', 'emergency']
  const defaultGuestLocalFilters: LocalPlaceCategory[] = ['all', 'weather', 'tide', 'beach', 'food', 'experience', 'event', 'shopping', 'emergency']
  const availableCategorySet = new Set<LocalPlaceCategory>([
    ...defaultGuestLocalFilters,
    ...guestLocalPlaces.filter((place) => place.category !== 'all').map((place) => place.category),
  ])
  const availableLocalFilters = [
    ...localFilterOrder.filter((filter) => availableCategorySet.has(filter)),
    ...Array.from(availableCategorySet).filter((filter) => !localFilterOrder.includes(filter)),
  ]
  const rawVisibleLocalPlaces = guestLocalPlaces
    .filter((place) => place.id !== 'weather')
    .filter((place) => localFilter === 'all' || place.category === localFilter)
  const visibleLocalPlaces = localFilter === 'experience'
    ? [...rawVisibleLocalPlaces].sort((a, b) => localExperienceAccessRank(a) - localExperienceAccessRank(b))
    : rawVisibleLocalPlaces
  const stayLocalPlace = guestLocalPlaces.find((place) => place.id === 'stay')
  const mappableLocalPlaces = visibleLocalPlaces.filter((place) => place.category !== 'emergency' || Boolean(place.address))
  const visibleMapPlaces = localFilter === 'all'
    ? mappableLocalPlaces
    : localFilter === 'event' && mappableLocalPlaces.length === 0 && stayLocalPlace
      ? [stayLocalPlace]
    : mappableLocalPlaces.length === 0
      ? []
      : !stayLocalPlace || mappableLocalPlaces.some((place) => place.id === stayLocalPlace.id)
        ? mappableLocalPlaces
        : [stayLocalPlace, ...mappableLocalPlaces]
  const isLiveOnlyLocalFilter = localFilter === 'weather' || localFilter === 'tide'
  const showLocalMap = !isLiveOnlyLocalFilter && visibleMapPlaces.length > 0
  const useCompactMapMarkers = localFilter === 'all' || localFilter === 'event'
  const selectedLocalPlace = guestLocalPlaces.find((place) => place.id === selectedLocalPlaceId) ?? visibleLocalPlaces[0] ?? guestLocalPlaces[0]
  const selectedLocalPlaceFacts = selectedLocalPlace ? localPlaceQuickFacts(selectedLocalPlace) : []
  const localAreaPlaces = localAreaPlaceIds
    .map((placeId) => visibleMapPlaces.find((place) => place.id === placeId))
    .filter(Boolean) as typeof visibleMapPlaces
  const visibleLocalPlaceCount = localFilter === 'all'
    ? `${mappableLocalPlaces.length} Orte`
    : isLiveOnlyLocalFilter ? 'Live'
    : localFilter === 'event' && visibleLocalPlaces.length === 0 ? '0 Termine'
    : visibleLocalPlaces.length === 1 ? '1 Ort' : `${visibleLocalPlaces.length} Orte`
  const localListCopy = localFilter === 'all'
    ? 'Alle freigegebenen Orte auf der Karte. Nutzt die Filter, wenn ihr Strand, Essen, Erlebnisse oder Hilfe gezielt ansehen möchtet.'
    : localFilter === 'experience'
      ? `${visibleLocalPlaces.length === 1 ? 'Ein Erlebnisbaustein' : `${visibleLocalPlaces.length} Erlebnisbausteine`}, die zu eurer Auszeit passen. Enthaltene Bausteine und optionale Ideen bleiben klar getrennt.`
      : localFilter === 'emergency'
        ? `${visibleLocalPlaces.length === 1 ? 'Ein wichtiger Hinweis' : `${visibleLocalPlaces.length} wichtige Hinweise`} für Situationen, in denen ihr schnell die richtige Nummer braucht.`
      : visibleLocalPlaces.length === 0
        ? localFilter === 'event'
          ? 'Für eure Reisedaten ist gerade nichts Passendes eingetragen. Sobald ein Termin wirklich passt, erscheint er hier.'
          : 'Diese Kategorie bleibt leer, bis ein geprüfter Ort wirklich zu eurer Auszeit passt.'
        : visibleLocalPlaces.length === 1
          ? 'Ein ausgewählter Ort, der zu eurer Auszeit passt und euch vor Ort Zeit spart.'
          : `${visibleLocalPlaces.length} ausgewählte Orte, die zu eurer Auszeit passen und euch vor Ort Zeit sparen.`
  const localSelectionNote = localFilter === 'experience'
    ? 'Tippt auf Details, um Inhalt, Status und Hinweise zu öffnen.'
    : localFilter === 'event'
      ? 'Tippt auf Details, um Termin, Ort und Passung zu öffnen.'
      : localFilter === 'emergency'
        ? 'Tippt auf Details, um Telefonnummern und wichtige Hinweise zu öffnen.'
        : 'Tippt auf Details, um Adresse, Öffnungszeiten und Route zu öffnen.'
  const beachLocalPlace = guestLocalPlaces.find((place) => place.category === 'beach')
  const tideLocalPlace = guestLocalPlaces.find((place) => place.id === 'tide')
  const liveWeatherTitle = liveLocalData.weather
    ? `${Math.round(liveLocalData.weather.temperature)} °C · ${weatherCodeLabel(liveLocalData.weather.weatherCode)}`
    : liveLocalData.loading ? 'Wetter wird geladen' : 'Wetter später prüfen'
  const liveWeatherCopy = liveLocalData.weather
    ? `Gefühlt ${Math.round(liveLocalData.weather.apparentTemperature)} °C, Wind ${Math.round(liveLocalData.weather.windSpeed)} km/h, Böen ${Math.round(liveLocalData.weather.windGusts)} km/h.`
    : liveLocalData.error || 'Live-Daten sind gerade nicht erreichbar.'
  const liveTideTitle = liveLocalData.tide?.nextPoint
    ? `${liveLocalData.tide.nextPoint.type} ${formatLiveTime(liveLocalData.tide.nextPoint.time)}`
    : liveLocalData.loading ? 'Gezeiten werden geladen' : 'Gezeiten später prüfen'
  const liveTideCopy = liveLocalData.tide
    ? `Aktueller Wasserstand ca. ${liveLocalData.tide.currentHeight.toLocaleString('de-DE', { maximumFractionDigits: 2 })} m. Werte dienen der Orientierung.`
    : liveLocalData.error || 'Live-Daten sind gerade nicht erreichbar.'
  const homeRecommendation = guestLocalPlaces.find((place) => place.category === 'food')
    ?? guestLocalPlaces.find((place) => place.category === 'beach')
    ?? guestLocalPlaces.find((place) => place.category === 'experience')
  const visibleWeatherDays = liveLocalData.weatherDays.slice(0, weatherForecastRange === 'today' ? 1 : weatherForecastRange === '3' ? 3 : 14)
  const liveForecastContent = (
    <>
      {localFilter === 'weather' && (
        <article className="guest-live-local-card guest-forecast-card">
          <div className="guest-local-place-icon"><SunCloudyLine size={18} /></div>
          <span>Live</span>
          <strong>{liveWeatherTitle}</strong>
          <p>{liveWeatherCopy}</p>
          {liveLocalData.weather && <small>Aktualisiert {formatLiveDate(liveLocalData.weather.updatedAt)} · Open-Meteo</small>}
          {liveLocalData.weatherDays.length > 0 && (
            <>
              <div className="guest-forecast-tabs" aria-label="Wetter Zeitraum wählen">
                <button type="button" className={weatherForecastRange === 'today' ? 'active' : ''} onClick={() => setWeatherForecastRange('today')}>Heute</button>
                <button type="button" className={weatherForecastRange === '3' ? 'active' : ''} onClick={() => setWeatherForecastRange('3')}>3 Tage</button>
                <button type="button" className={weatherForecastRange === '14' ? 'active' : ''} onClick={() => setWeatherForecastRange('14')}>14 Tage</button>
              </div>
              <div className="guest-forecast-list" aria-label="Wettervorschau">
                {visibleWeatherDays.map((day) => (
                  <article key={day.date}>
                    <span>{formatLiveDay(day.date)}</span>
                    <strong>{Math.round(day.maxTemperature)}° / {Math.round(day.minTemperature)}°</strong>
                    <p>{weatherCodeLabel(day.weatherCode)} · Regen {Math.round(day.precipitationProbability)}% · Wind {Math.round(day.windSpeed)} km/h</p>
                  </article>
                ))}
              </div>
            </>
          )}
        </article>
      )}
      {localFilter === 'tide' && (
        <article className="guest-live-local-card guest-forecast-card">
          <div className="guest-local-place-icon"><WaveLine size={18} /></div>
          <span>Live</span>
          <strong>{liveTideTitle}</strong>
          <p>{liveTideCopy}</p>
          {liveLocalData.tide && <small>Meereshöhe aktualisiert {formatLiveDate(liveLocalData.tide.updatedAt)} · Open-Meteo Marine</small>}
          {liveLocalData.tide?.points.length ? (
            <div className="guest-forecast-list is-tide" aria-label="14 Tage Gezeitenvorschau">
              {liveLocalData.tide.points.slice(0, 28).map((point) => (
                <article key={`${point.time}-${point.type}`}>
                  <span>{formatLiveDate(point.time)}</span>
                  <strong>{point.type}</strong>
                  <p>ca. {point.height.toLocaleString('de-DE', { maximumFractionDigits: 2 })} m Meereshöhe</p>
                </article>
              ))}
            </div>
          ) : null}
        </article>
      )}
    </>
  )
  const experiencePlaceGroups = [
    {
      key: 'included',
      title: 'In eurer Auszeit enthalten',
      copy: 'Diese Bausteine gehören direkt zu eurem gebuchten Aufenthalt.',
      places: visibleLocalPlaces.filter((place) => place.category === 'experience' && place.experienceAccess === 'included'),
    },
    {
      key: 'free-local',
      title: 'Kostenfrei vor Ort',
      copy: 'Gute Optionen, wenn ihr spontan und ohne zusätzliche Buchung etwas machen möchtet.',
      places: visibleLocalPlaces.filter((place) => place.category === 'experience' && place.experienceAccess === 'free-local'),
    },
    {
      key: 'bookable',
      title: 'Optional buchbar',
      copy: 'Kuratierte Ideen, die ihr zusätzlich anfragen oder später über Morrow einplanen könnt.',
      places: visibleLocalPlaces.filter((place) => place.category === 'experience' && place.experienceAccess === 'bookable'),
    },
    {
      key: 'recommendation',
      title: 'Weitere Empfehlungen',
      copy: 'Ruhige Ideen, wenn sie wirklich zu eurem Tag passen.',
      places: visibleLocalPlaces.filter((place) => (
        place.category === 'experience'
        && (!place.experienceAccess || place.experienceAccess === 'recommendation')
      )),
    },
  ].filter((group) => group.places.length > 0)
  const renderLocalPlaceCard = (place: LocalPlace) => {
    return (
      <article key={place.id} className={`${selectedLocalPlace.id === place.id ? 'active' : ''}${place.category === 'food' ? ' is-food-card' : ''}`.trim()}>
        <div className="guest-local-place-icon">
          {localPlaceIcon(place.category)}
        </div>
        {place.category !== 'food' && <span>{place.label}</span>}
        <strong>{place.title}</strong>
        <p>{place.description}</p>
        {place.category !== 'food' && (
          <small>{place.meta}</small>
        )}
        <button type="button" onClick={() => openLocalPlaceDrawer(place.id)}>{place.category === 'food' ? 'Details ansehen' : 'Details'}</button>
      </article>
    )
  }
  const selectLocalFilter = (filter: LocalPlaceCategory) => {
    const nextPlaces = guestLocalPlaces.filter((place) => filter === 'all' || place.category === filter)
    setLocalFilter(filter)
    setSelectedLocalPlaceId(nextPlaces[0]?.id ?? 'stay')
    setLocalAreaPlaceIds([])
    setLocalOverviewDrawerOpen(false)
    setLocalPlaceDrawerOpen(false)
  }
  const closeLocalDrawers = () => {
    setLocalOverviewDrawerOpen(false)
    setLocalPlaceDrawerOpen(false)
    setLocalAreaPlaceIds([])
  }
  const openLocalPlaceDrawer = (placeId: string) => {
    if (placeId.startsWith('cluster:')) {
      const areaPlaceIds = placeId
        .replace('cluster:', '')
        .split(',')
        .filter((id) => visibleMapPlaces.some((place) => place.id === id))
      const firstPlaceId = areaPlaceIds[0] ?? 'stay'
      setSelectedLocalPlaceId(firstPlaceId)
      setLocalAreaPlaceIds(areaPlaceIds)
      setLocalPlaceDrawerOpen(false)
      setLocalOverviewDrawerOpen(true)
      return
    }

    setLocalAreaPlaceIds([])
    setLocalOverviewDrawerOpen(false)
    setSelectedLocalPlaceId(placeId)
    setLocalPlaceDrawerOpen(true)
  }
  const openLocalPlaceDetail = (placeId: string) => {
    setLocalAreaPlaceIds([])
    setLocalOverviewDrawerOpen(false)
    setSelectedLocalPlaceId(placeId)
    setLocalPlaceDrawerOpen(true)
  }
  const startLocalDrawerSwipe = (event: TouchEvent<HTMLElement>) => {
    const touch = event.touches[0]
    if (!touch) return
    localDrawerTouchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      scrollTop: localDrawerRef.current?.scrollTop ?? 0,
    }
  }
  const finishLocalDrawerSwipe = (event: TouchEvent<HTMLElement>) => {
    const start = localDrawerTouchStart.current
    const touch = event.changedTouches[0]
    localDrawerTouchStart.current = null
    if (!start || !touch) return

    const deltaY = touch.clientY - start.y
    const deltaX = Math.abs(touch.clientX - start.x)
    if (start.scrollTop <= 6 && deltaY > 82 && deltaX < 90) {
      closeLocalDrawers()
    }
  }
  const homePhase =
    activeLead?.status === 'Aktiv'
      ? 'during'
      : activeLead?.status === 'Abgeschlossen'
        ? 'after'
        : 'before'
  const homeStep = homePhase === 'during'
    ? {
        kicker: 'Heute wichtig',
        title: 'Orientierung vor Ort.',
        copy: 'Karte, Empfehlungen und schnelle Hilfe sind bereit, falls ihr unterwegs etwas braucht.',
        buttonLabel: 'Vor Ort öffnen',
        icon: <LocationLine size={17} />,
        view: 'local' as GuestAppView,
      }
    : homePhase === 'after'
      ? {
          kicker: 'Nach der Auszeit',
          title: 'Alles bleibt griffbereit.',
          copy: 'Ihr findet eure Buchungsdetails weiterhin hier und könnt uns bei Rückfragen direkt erreichen.',
          buttonLabel: 'Hilfe öffnen',
          icon: <HeartHandLine size={17} />,
          view: 'help' as GuestAppView,
        }
      : {
          kicker: 'Jetzt wichtig',
          title: 'Vorfreude statt Planung.',
          copy: 'Bis zur Anreise bleibt es ruhig: Verbindliches liegt in der Buchung, alles für den Ort wächst im Vor-Ort-Bereich zusammen.',
          buttonLabel: 'Buchung öffnen',
          icon: <Key2Line size={17} />,
          view: 'booking' as GuestAppView,
        }
  const guestNavigation: { id: GuestAppView; label: string; icon: ReactNode }[] = [
    { id: 'home', label: 'Start', icon: <Home3Line size={19} /> },
    { id: 'booking', label: 'Buchung', icon: <CalendarLine size={19} /> },
    { id: 'local', label: 'Vor Ort', icon: <LocationLine size={19} /> },
    { id: 'help', label: 'Hilfe', icon: <HeartHandLine size={19} /> },
  ]
  useEffect(() => {
    const updateCompactNav = () => {
      const visualViewport = window.visualViewport
      const visualWidth = visualViewport?.width ?? window.innerWidth
      const visualHeight = visualViewport?.height ?? window.innerHeight
      const visualOffsetTop = visualViewport?.offsetTop ?? 0

      document.documentElement.style.setProperty('--morrow-visual-viewport-height', `${visualHeight}px`)
      document.documentElement.style.setProperty('--morrow-visual-viewport-top', `${visualOffsetTop}px`)
      setCompactGuestNav(visualWidth <= 1180)
    }

    updateCompactNav()
    window.addEventListener('resize', updateCompactNav)
    window.addEventListener('orientationchange', updateCompactNav)
    window.visualViewport?.addEventListener('resize', updateCompactNav)
    window.visualViewport?.addEventListener('scroll', updateCompactNav)

    return () => {
      window.removeEventListener('resize', updateCompactNav)
      window.removeEventListener('orientationchange', updateCompactNav)
      window.visualViewport?.removeEventListener('resize', updateCompactNav)
      window.visualViewport?.removeEventListener('scroll', updateCompactNav)
    }
  }, [])

  usePageMeta(
    activeLead ? `Auszeit · ${activeLead.packageName} · Morrow` : 'Zugang zur Auszeit · Morrow',
    'Der persönliche Morrow-Bereich für Anreise, Unterkunft, Erlebnis, Empfehlungen und Support nach der Buchung.',
    packageItem?.heroImage,
  )

  const submitAccess = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeLead) return
    const emailMatches = emailDraft.trim().toLowerCase() === activeLead.email.toLowerCase()
    const codeMatches = codeDraft.trim().toUpperCase() === expectedCode

    if (!emailMatches || !codeMatches) {
      setAccessError('Bitte prüfe E-Mail-Adresse und Zugangscode.')
      return
    }

    setAccessError('')
    setManualAccess(true)
  }

  const sendSupport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeLead || !supportMessage.trim()) return
    onCreateSupportTask(activeLead, supportCategory, supportMessage.trim())
    setSupportSent(true)
    setSupportMessage('')
    setSupportCategory('general')
  }

  if (!remoteAccessChecked) {
    return (
      <Shell>
        <main className="guest-stay-page">
          <section className="guest-access-card">
            <p className="kicker">Auszeit</p>
            <h1>Wir prüfen euren Zugang.</h1>
            <p>Einen kurzen Moment, wir laden die vorbereitete Buchung.</p>
          </section>
        </main>
      </Shell>
    )
  }

  if (!activeLead) {
    return (
      <Shell>
        <main className="guest-stay-page">
          <section className="guest-access-card">
            <p className="kicker">Auszeit</p>
            <h1>Wir finden diese Buchung gerade nicht.</h1>
            <p>Bitte öffne den persönlichen Link aus deiner Morrow-Bestätigung oder melde dich direkt bei uns.</p>
            <a className="button primary" href="/">Zur Startseite</a>
          </section>
        </main>
      </Shell>
    )
  }

  if (!isGuestStayUnlocked(activeLead.status)) {
    return (
      <Shell>
        <main className="guest-stay-page">
          <section className="guest-access-card">
            <p className="kicker">{activeLead.packageName}</p>
            <h1>Der persönliche Bereich wird nach der Buchung freigeschaltet.</h1>
            <p>Wir bereiten ihn vor, sobald Termin, Unterkunft und Zahlung verbindlich bestätigt sind.</p>
            <a className="button primary" href={`/auszeiten/${activeLead.packageSlug}`}>Auszeit ansehen</a>
          </section>
        </main>
      </Shell>
    )
  }

  if (!unlocked) {
    return (
      <main className={`guest-app-page is-locked${compactGuestNav ? ' has-bottom-nav' : ''}`}>
        <header className="guest-app-topbar">
          <img src="/brand/logos/wordmark/morrow-logomark-offblack.svg" alt="Morrow" />
          <span>Auszeit</span>
          <button className="guest-app-menu-button" type="button" aria-label="Menü öffnen"><MenuLine size={20} /></button>
        </header>
        <nav className="guest-app-bottom-nav is-preview" aria-label="Gästebereich Navigation Vorschau">
          {guestNavigation.map((item, index) => (
            <button key={item.id} className={index === 0 ? 'active' : ''} type="button" disabled>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <section className="guest-app-login">
          <div className="guest-app-login-copy">
            <p className="kicker">Privater Bereich</p>
              <h1>Zugang zur Auszeit.</h1>
            <p>Nach der Buchung findet ihr hier alles, was den Aufenthalt leichter macht: Anreise, Unterkunft, Erlebnis, Empfehlungen vor Ort und direkte Hilfe.</p>
            <div className="guest-app-preview-nav" aria-label="Bereiche Vorschau">
              {guestNavigation.map((item) => (
                <span key={item.id}>{item.icon}{item.label}</span>
              ))}
            </div>
          </div>
          <form className="guest-login-form" onSubmit={submitAccess}>
            <label>E-Mail
              <input type="email" value={emailDraft} onChange={(event) => setEmailDraft(event.target.value)} placeholder="name@example.com" required />
            </label>
            <label>Zugangscode
              <input value={codeDraft} onChange={(event) => setCodeDraft(event.target.value)} placeholder="z. B. A1B2C3" required />
            </label>
            {accessError && <p className="guest-form-error">{accessError}</p>}
            <button className="button primary" type="submit">Auszeit öffnen</button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className={`guest-app-page${compactGuestNav ? ' has-bottom-nav' : ''}`}>
      <header className="guest-app-topbar">
        <img src="/brand/logos/wordmark/morrow-logomark-offblack.svg" alt="Morrow" />
        <div>
          <span>{activeLead.packageName}</span>
          <strong>{firstName ? `Hallo ${firstName}` : 'Auszeit'}</strong>
        </div>
        <button className="guest-app-menu-button" type="button" aria-label="Menü öffnen"><MenuLine size={20} /></button>
      </header>

      <nav className="guest-app-bottom-nav" aria-label="Gästebereich Navigation">
        {guestNavigation.map((item) => (
          <button key={item.id} className={activeView === item.id ? 'active' : ''} type="button" onClick={() => setActiveView(item.id)}>
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <section className="guest-app-shell">
        {activeView === 'home' && (
          <div className="guest-app-view">
            <section className="guest-app-hero">
              <div>
                <p className="kicker">Moin {firstName || 'und willkommen'}</p>
                <h1>Eure Auszeit beginnt hier.</h1>
                {countdownLabel && homePhase === 'before' && (
                  <p className="guest-home-countdown"><CalendarLine size={16} />{countdownLabel}</p>
                )}
                <p>Wir bereiten eure {activeLead.packageName} Schritt für Schritt vor. Ihr müsst nicht alles im Kopf behalten.</p>
              </div>
              <figure>
                <img src={packageItem?.heroImage ?? '/brand/morrow-hero-home.jpg'} alt="" />
                <figcaption>{activeLead.selectedDate}</figcaption>
              </figure>
            </section>
            {homePhase === 'during' && (
              <section className="guest-live-strip" aria-label="Live vor Ort">
                <button type="button" onClick={() => { setActiveView('local'); selectLocalFilter('weather') }}>
                  <SunCloudyLine size={19} />
                  <span>Wetter jetzt</span>
                  <strong>{liveWeatherTitle}</strong>
                  <p>{liveWeatherCopy}</p>
                </button>
                <button type="button" onClick={() => { setActiveView('local'); selectLocalFilter('tide') }}>
                  <WaveLine size={19} />
                  <span>Gezeiten</span>
                  <strong>{liveTideTitle}</strong>
                  <p>{liveTideCopy}</p>
                </button>
              </section>
            )}
            <section className="guest-home-next-card">
              <div>
                <p className="kicker">{homeStep.kicker}</p>
                <h2>{homeStep.title}</h2>
                <p>{homeStep.copy}</p>
              </div>
            </section>
            <div className="guest-home-section-title">
              <h2>Heute für euch</h2>
              <span>Leicht orientiert</span>
            </div>
            <section className="guest-home-insight-grid" aria-label="Aktuelle Orientierung">
              <article>
                <span><SunCloudyLine size={18} /></span>
                <small>Wetter</small>
                <strong>{liveWeatherTitle}</strong>
                <p>{liveWeatherCopy}</p>
              </article>
              <article>
                <span><WaveLine size={18} /></span>
                <small>Gezeiten</small>
                <strong>{liveTideTitle}</strong>
                <p>{liveTideCopy}</p>
              </article>
              {homeRecommendation && (
                <article>
                  <span>{localPlaceIcon(homeRecommendation.category, 18)}</span>
                  <small>Empfehlung</small>
                  <strong>{homeRecommendation.title}</strong>
                  <p>{homeRecommendation.description}</p>
                </article>
              )}
            </section>
            <section className="guest-home-rhythm" aria-label="Auszeit Rhythmus">
              <p className="kicker">Euer Rhythmus</p>
              <h2>So darf sich die Auszeit anfühlen.</h2>
              <div>
                <article>
                  <span>01</span>
                  <strong>Ankommen</strong>
                  <p>Erst in Ruhe landen. Keine Liste, die direkt erledigt werden muss.</p>
                </article>
                <article>
                  <span>02</span>
                  <strong>Nordsee spüren</strong>
                  <p>Wetter, Wasser und Wege geben euch den Takt, nicht ein voller Plan.</p>
                </article>
                <article>
                  <span>03</span>
                  <strong>Zeit teilen</strong>
                  <p>Ein gutes Erlebnis, ein schöner Ort und genug Raum dazwischen.</p>
                </article>
              </div>
            </section>
          </div>
        )}

        {activeView === 'booking' && (
          <div className="guest-app-view">
            <section className="guest-app-section-head guest-help-head">
              <p className="kicker">Buchung</p>
              <h1>Eure Auszeit im Überblick.</h1>
              <p>Alles Wichtige zu Unterkunft, Anreise, Schlüssel und Erlebnis.</p>
            </section>
            <section className="guest-booking-detail">
              <img src={packageItem?.stayImages[0] ?? packageItem?.images[0] ?? '/brand/generated/morrow-spo-interior.png'} alt="" />
              <div className="guest-booking-detail-copy">
                <p className="kicker">{packageItem?.location ?? 'Sankt Peter-Ording'}</p>
                <h2>{packageItem?.stay.name ?? 'Ausgewählte Unterkunft'}</h2>
                <p>{packageItem?.stay.description}</p>
                <div className="guest-booking-icons" aria-label="Buchungsdetails">
                  <span><GroupLine size={20} />{guestCountLabel(activeLead.guests ?? (isFamily ? '4' : '2'))}</span>
                  <span><DoorLine size={20} />{packageItem?.stay.bedrooms ?? 1} Schlafzimmer</span>
                  <span><Key2Line size={20} />{packageItem ? checkInTypeLabel(packageItem.stay.checkInType) : 'Check-in offen'}</span>
                  <span><SparklesLine size={20} />{primaryExperience ? 'Erlebnis inklusive' : 'Erlebnis folgt'}</span>
                </div>
              </div>
            </section>
            <section className="guest-booking-hub" aria-label="Aufenthaltszentrale">
              <article className="guest-booking-hub-primary">
                <p className="kicker">Anreise & Schlüssel</p>
                <h2>Alles, was ihr für den Start braucht.</h2>
                <div className="guest-booking-hub-steps">
                  <span><strong>01</strong> {arrivalWindowLabel(packageItem?.stay)}</span>
                  <span><strong>02</strong> {packageItem ? formatGuestKeyInfo(packageItem.stay) : 'Schlüsselhinweise werden vorbereitet.'}</span>
                  <span><strong>03</strong> Abreise bis {packageItem?.stay.checkOutTime ?? '10:00'} Uhr</span>
                </div>
              </article>
              <article>
                <span>Termin</span>
                <strong>{activeLead.selectedDate}</strong>
                <p>Die Auszeit ist für diesen Zeitraum vorbereitet.</p>
              </article>
              <article>
                <span>Lage</span>
                <strong>{packageItem?.stay.locationNote ?? 'Sankt Peter-Ording'}</strong>
                <p>{packageItem?.stay.features.slice(0, 3).join(' · ') ?? 'WLAN · Küche · Rückzugsort'}</p>
              </article>
            </section>
            <section className="guest-booking-feature-card">
              <img src={packageItem?.experienceImage ?? '/brand/generated/morrow-spo-family-watt.png'} alt="" />
              <div>
                <p className="kicker">Enthaltenes Erlebnis</p>
                <h2>{primaryExperience?.title ?? 'Lokales Erlebnis'}</h2>
                <p>{primaryExperience?.guestNotes ?? 'Ein lokales Erlebnis wird so vorbereitet, dass es zum Aufenthalt passt.'}</p>
                <strong>{guestExperienceStatus(primaryExperience)}</strong>
              </div>
            </section>
          </div>
        )}

        {activeView === 'local' && (
          <div className="guest-app-view">
            <section className="guest-app-section-head">
              <p className="kicker">Vor Ort</p>
              <h1>Alles vor Ort, ohne lange zu suchen.</h1>
              <p>Karte, Wasser, Essen, Gezeiten und schnelle Hilfe. So vorbereitet, dass ihr vor Ort leichter entscheiden könnt.</p>
            </section>
            {showLocalMap && (
              <section className="guest-map-card">
                <div className="guest-map-visual" aria-label="Interaktive Karte Sankt Peter-Ording">
                  <Suspense fallback={<div className="guest-map-loading">Karte wird geladen</div>}>
                    <GuestLocalMap places={visibleMapPlaces} compactMarkers={useCompactMapMarkers} onSelectPlace={openLocalPlaceDrawer} />
                  </Suspense>
                  <div className="guest-map-overlay">
                    <span>In eurer Nähe</span>
                    <strong>{visibleLocalPlaceCount}</strong>
                  </div>
                </div>
                <div className="guest-map-caption">
                  <strong>{localFilter === 'all' ? 'Tippt Gruppen-Pins an, um Orte aufzulösen.' : localFilter === 'event' && visibleLocalPlaces.length === 0 ? 'Karte bleibt zur Orientierung.' : 'Tippt einen Ort für Details.'}</strong>
                  <span>{localFilter === 'all' ? 'Der Drawer öffnet erst, wenn ihr einen konkreten Ort auswählt.' : localFilter === 'event' && visibleLocalPlaces.length === 0 ? 'Sobald passende Veranstaltungen freigegeben sind, erscheinen sie hier.' : 'Route, Öffnungszeiten und Kontakt liegen im Drawer.'}</span>
                </div>
              </section>
            )}
            <section className="guest-local-filter" aria-label="Vor Ort Filter">
              {availableLocalFilters.map((filter) => (
                <button key={filter} type="button" className={localFilter === filter ? 'active' : ''} onClick={() => selectLocalFilter(filter)}>
                  {localPlaceCategoryLabels[filter]}
                </button>
              ))}
            </section>
            {(localFilter === 'weather' || localFilter === 'tide') && (
              <section className="guest-live-filter-panel" aria-label={localFilter === 'weather' ? 'Wettervorschau' : 'Gezeitenvorschau'}>
                {liveForecastContent}
              </section>
            )}
            {!isLiveOnlyLocalFilter && (
              <section className="guest-local-list-head">
                <span>{localFilter === 'all' ? 'Auf einen Blick' : localPlaceCategoryLabels[localFilter]}</span>
                <p>{localListCopy}</p>
              </section>
            )}
            {isLiveOnlyLocalFilter ? null : localFilter === 'all' ? (
              <section className="guest-local-overview-list" aria-label="Auf einen Blick vor Ort">
                {stayLocalPlace && (
                  <article className="active">
                    <div><LocationLine size={18} /></div>
                    <span>Auszeit</span>
                    <strong>{stayLocalPlace.title}</strong>
                    <p>{stayLocalPlace.description}</p>
                    <button type="button" onClick={() => openLocalPlaceDrawer(stayLocalPlace.id)}>Details</button>
                  </article>
                )}
                {beachLocalPlace && (
                  <article>
                    <div><HeartHandLine size={18} /></div>
                    <span>Erster Weg</span>
                    <strong>Ans Wasser kommen.</strong>
                    <p>{beachLocalPlace.description}</p>
                    <button type="button" onClick={() => selectLocalFilter('beach')}>Strand ansehen</button>
                  </article>
                )}
                {tideLocalPlace && (
                  <article>
                    <div><SparklesLine size={18} /></div>
                    <span>Heute wichtig</span>
                    <strong>{liveWeatherTitle}</strong>
                    <p>{liveTideTitle}. Ein kurzer Blick hilft, den Tag ruhig und passend zu planen.</p>
                    <button type="button" onClick={() => selectLocalFilter('tide')}>Gezeiten ansehen</button>
                  </article>
                )}
              </section>
            ) : localFilter === 'experience' && visibleLocalPlaces.length > 0 ? (
              <section className="guest-local-experience-groups" aria-label="Erlebnisse vor Ort">
                {experiencePlaceGroups.map((group) => (
                  <div key={group.key} className="guest-local-experience-group">
                    <header>
                      <span>{group.title}</span>
                      <p>{group.copy}</p>
                    </header>
                    <div className="guest-local-place-list">
                      {group.places.map((place) => renderLocalPlaceCard(place))}
                    </div>
                  </div>
                ))}
              </section>
            ) : (
              <section className="guest-local-place-list" aria-label="Gefilterte Orte und Hinweise">
                {visibleLocalPlaces.map((place) => renderLocalPlaceCard(place))}
                {visibleLocalPlaces.length === 0 && (
                  <article className="guest-local-empty">
                    <div><LocationLine size={18} /></div>
                    <span>{localPlaceCategoryLabels[localFilter] ?? 'Kategorie'}</span>
                    <strong>{localFilter === 'event' ? 'Für eure Reisedaten ist gerade nichts Passendes eingetragen.' : localFilter === 'experience' ? 'Noch kein Erlebnisbaustein freigegeben.' : 'Noch keine kuratierte Empfehlung.'}</strong>
                    <p>{localFilter === 'event' ? 'Wir zeigen euch nur Veranstaltungen, die zeitlich passen und den Aufenthalt wirklich leichter oder besonderer machen.' : localFilter === 'experience' ? 'Hier erscheinen nur Erlebnisse, die zu eurer Auszeit passen und von Morrow kuratiert wurden.' : 'Diese Kategorie wird bewusst leer gelassen, bis wir passende Orte geprüft und freigegeben haben.'}</p>
                    <small>Qualität vor Menge</small>
                  </article>
                )}
              </section>
            )}
            {localFilter !== 'all' && !isLiveOnlyLocalFilter && visibleLocalPlaces.length > 0 && (
              <p className="guest-local-selection-note">{localSelectionNote}</p>
            )}
            {localOverviewDrawerOpen && (
              <section className="guest-local-drawer-shell" aria-label="Orte in diesem Bereich">
                <button className="guest-local-drawer-backdrop" type="button" aria-label="Details schließen" onClick={closeLocalDrawers} />
                <aside
                  className="guest-local-drawer guest-local-overview-drawer"
                  ref={localDrawerRef}
                  onTouchStart={startLocalDrawerSwipe}
                  onTouchEnd={finishLocalDrawerSwipe}
                  onTouchCancel={() => { localDrawerTouchStart.current = null }}
                >
                  <div className="guest-local-drawer-handle" aria-hidden="true" />
                  <header>
                    <div>
                      <p className="kicker">In diesem Bereich</p>
                      <h2>{localAreaPlaces.length === 1 ? 'Welcher Ort liegt hier?' : 'Welche Orte liegen hier?'}</h2>
                    </div>
                    <button type="button" aria-label="Details schließen" onClick={closeLocalDrawers}><CloseLine size={18} /></button>
                  </header>
                  <p>{localAreaPlaces.length === 1
                    ? 'Dieser Pin führt zu einem kuratierten Ort. Öffnet die Details, wenn ihr Adresse, Route oder Hinweise sehen möchtet.'
                    : 'Im Überblick liegen mehrere Pins nah beieinander. Wählt den Ort aus, zu dem ihr Details, Route oder Öffnungszeiten sehen möchtet.'}</p>
                  <div className="guest-local-overview-drawer-list">
                    {localAreaPlaces.map((place, index) => (
                      <article key={place.id}>
                        <span>{index + 1}</span>
                        <div>
                          <p className="kicker">{place.label}</p>
                          <h3>{place.title}</h3>
                          <p>{place.description}</p>
                          <button type="button" onClick={() => openLocalPlaceDetail(place.id)}>Details öffnen</button>
                        </div>
                      </article>
                    ))}
                  </div>
                </aside>
              </section>
            )}
            {localPlaceDrawerOpen && (
              <section className="guest-local-drawer-shell" aria-label="Ort Details">
                <button className="guest-local-drawer-backdrop" type="button" aria-label="Details schließen" onClick={closeLocalDrawers} />
                <aside
                  className="guest-local-drawer"
                  ref={localDrawerRef}
                  onTouchStart={startLocalDrawerSwipe}
                  onTouchEnd={finishLocalDrawerSwipe}
                  onTouchCancel={() => { localDrawerTouchStart.current = null }}
                >
                  <div className="guest-local-drawer-handle" aria-hidden="true" />
                  <header>
                    <div>
                      <p className="kicker">{selectedLocalPlace.label}</p>
                      <h2>{selectedLocalPlace.title}</h2>
                    </div>
                    <button type="button" aria-label="Details schließen" onClick={closeLocalDrawers}><CloseLine size={18} /></button>
                  </header>
                  {selectedLocalPlace.photoUrls && selectedLocalPlace.photoUrls.length > 0 && (
                    <div className="guest-local-drawer-gallery" aria-label={`Bilder von ${selectedLocalPlace.title}`}>
                      {selectedLocalPlace.photoUrls.map((photoUrl, index) => (
                        <img key={photoUrl} src={photoUrl} alt={`${selectedLocalPlace.title} Eindruck ${index + 1}`} loading="lazy" />
                      ))}
                    </div>
                  )}
                  <p>{selectedLocalPlace.description}</p>
                  {selectedLocalPlace.category === 'food' && selectedLocalPlace.morrowNote && (
                    <section className="guest-local-morrow-note" aria-label="Morrow Einschätzung">
                      <span>Morrow Einschätzung</span>
                      <strong>{selectedLocalPlace.morrowNote}</strong>
                    </section>
                  )}
                  {selectedLocalPlaceFacts.length > 0 && (
                    <section className="guest-local-drawer-facts" aria-label="Kurzinfos">
                      {selectedLocalPlaceFacts.map((fact) => (
                        <article key={`${fact.label}-${fact.value}`}>
                          <span>{fact.icon}</span>
                          <small>{fact.label}</small>
                          <strong>{fact.value}</strong>
                        </article>
                      ))}
                    </section>
                  )}
                  <div className="guest-local-drawer-details">
                    {selectedLocalPlace.category === 'food' && selectedLocalPlace.cuisine && (
                      <article>
                        <span>Küche</span>
                        <strong>{selectedLocalPlace.cuisine}</strong>
                      </article>
                    )}
                    {selectedLocalPlace.category === 'food' && selectedLocalPlace.menuNote && (
                      <article className="guest-local-drawer-detail-note">
                        <span>Auf der Karte</span>
                        <p>
                          {selectedLocalPlace.menuNote}
                          {selectedLocalPlace.menuUrl && (
                            <a className="guest-local-inline-link" href={selectedLocalPlace.menuUrl} target="_blank" rel="noreferrer">Speisekarte ansehen</a>
                          )}
                        </p>
                      </article>
                    )}
                    {selectedLocalPlace.address && (
                      <article>
                        <span>Adresse</span>
                        <strong>{selectedLocalPlace.address}</strong>
                      </article>
                    )}
                    {selectedLocalPlace.openingHours && (
                      <article>
                        <span>{selectedLocalPlace.category === 'event' ? 'Termin' : 'Öffnungszeiten'}</span>
                        <strong>{selectedLocalPlace.openingHours}</strong>
                      </article>
                    )}
                    {selectedLocalPlace.category === 'food' && selectedLocalPlace.ratingSource && (
                      <article>
                        <span>Bewertung</span>
                        {selectedLocalPlace.ratingSourceUrl ? (
                          <a href={selectedLocalPlace.ratingSourceUrl} target="_blank" rel="noreferrer">
                            {selectedLocalPlace.ratingValue
                              ? `${selectedLocalPlace.ratingValue.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${selectedLocalPlace.ratingCount ? ` bei ${selectedLocalPlace.ratingCount.toLocaleString('de-DE')} Bewertungen` : ''}`
                              : 'Quelle öffnen'} · {selectedLocalPlace.ratingSource}
                          </a>
                        ) : (
                          <strong>{selectedLocalPlace.ratingSource}</strong>
                        )}
                      </article>
                    )}
                    {selectedLocalPlace.category === 'food' && (selectedLocalPlace.openingHoursCheckedAt || selectedLocalPlace.ratingCheckedAt) && (
                      <article className="guest-local-drawer-detail-note">
                        <span>Datenstand</span>
                        <p>
                          {selectedLocalPlace.openingHoursCheckedAt && `Öffnungszeiten geprüft: ${formatGermanDate(selectedLocalPlace.openingHoursCheckedAt)}${selectedLocalPlace.openingHoursSource ? ` (${selectedLocalPlace.openingHoursSource})` : ''}.`}
                          {selectedLocalPlace.ratingCheckedAt && ` Bewertung geprüft: ${formatGermanDate(selectedLocalPlace.ratingCheckedAt)}.`}
                        </p>
                      </article>
                    )}
                    {selectedLocalPlace.category === 'event' && selectedLocalPlace.eventFitNote && (
                      <article>
                        <span>Passt, wenn</span>
                        <strong>{selectedLocalPlace.eventFitNote}</strong>
                      </article>
                    )}
                    {selectedLocalPlace.phone && (
                      <article>
                        <span>Telefon</span>
                        <a href={`tel:${selectedLocalPlace.phone.replace(/\s/g, '')}`}>{selectedLocalPlace.phone}</a>
                      </article>
                    )}
                  </div>
                  <p className="guest-local-drawer-note">{selectedLocalPlace.routeNote}</p>
                  <footer>
                    {selectedLocalPlace.reservationUrl && (
                      <a href={selectedLocalPlace.reservationUrl} target="_blank" rel="noreferrer">
                        {selectedLocalPlace.category === 'food'
                          ? selectedLocalPlace.reservationType === 'call' ? 'Reservierung prüfen' : 'Tisch reservieren'
                          : 'Reservieren'}
                      </a>
                    )}
                    {selectedLocalPlace.phone && (
                      <a href={`tel:${selectedLocalPlace.phone.replace(/\s/g, '')}`}>Anrufen</a>
                    )}
                    {selectedLocalPlace.address && (
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocalPlace.lat},${selectedLocalPlace.lng}`} target="_blank" rel="noreferrer"><LocationLine size={17} /> Route starten</a>
                    )}
                    {selectedLocalPlace.websiteUrl && !(selectedLocalPlace.category === 'food' && selectedLocalPlace.reservationUrl) && <a href={selectedLocalPlace.websiteUrl} target="_blank" rel="noreferrer">{selectedLocalPlace.category === 'emergency' ? 'Info öffnen' : 'Website öffnen'}</a>}
                  </footer>
                </aside>
              </section>
            )}
          </div>
        )}

        {activeView === 'help' && (
          <div className="guest-app-view">
            <section className="guest-app-section-head">
              <p className="kicker">Hilfe</p>
              <h1>Schreibt uns, wenn ihr Unterstützung braucht.</h1>
              <p>Wählt kurz aus, worum es geht. Wir kümmern uns um eure Auszeit und helfen euch beim Einordnen.</p>
            </section>
            <section className="guest-help-panel">
              <form className="guest-support-form" onSubmit={sendSupport}>
                <label>Worum geht es?
                  <select value={supportCategory} onChange={(event) => setSupportCategory(event.target.value as GuestSupportCategory)}>
                    <option value="general">Allgemeine Frage</option>
                    <option value="arrival">Anreise oder Schlüssel</option>
                    <option value="property">{propertyIsMorrowHandled ? 'Problem in der Unterkunft' : 'Frage zur Unterkunft'}</option>
                    <option value="experience">Erlebnis oder Termin</option>
                    <option value="local">Empfehlung vor Ort</option>
                  </select>
                </label>
                <label>Nachricht an Morrow
                  <textarea rows={3} value={supportMessage} onChange={(event) => setSupportMessage(event.target.value)} placeholder="Was können wir für euch klären?" />
                </label>
                {supportCategory === 'property' && (
                  <p className="guest-support-context-note">
                    {propertyIsMorrowHandled
                      ? 'Beschreibt kurz, was nicht funktioniert und seit wann es auffällt.'
                      : `Bei Unterkunftsthemen ist ${propertySupportName} der direkte Ansprechpartner. Morrow hilft euch hier, wenn ihr unsicher seid oder etwas zur Auszeit einordnen möchtet.`}
                  </p>
                )}
                {supportSent && <p className="guest-success-note">Danke, wir haben eure Nachricht aufgenommen.</p>}
                <button className="button primary" type="submit">Nachricht senden</button>
              </form>
            </section>
          </div>
        )}
      </section>

    </main>
  )
}

function BookingDetailDrawer({
  lead,
  packageItem,
  tasks,
  onClose,
  onCreateTask,
  onToggleTask,
  onMoveTaskInProgress,
  onUpdateLead,
  onUpdatePackage,
}: {
  lead: GuestLead | null
  packageItem: MorrowPackage | null
  tasks: AdminTask[]
  onClose: () => void
  onCreateTask: (task: Omit<AdminTask, 'id' | 'status' | 'createdAt'>) => void
  onToggleTask: (id: string) => void
  onMoveTaskInProgress: (id: string) => void
  onUpdateLead: (id: string, updates: Partial<StoredLead>) => void
  onUpdatePackage: (id: string, updater: (pkg: MorrowPackage) => MorrowPackage) => void
}) {
  const [draft, setDraft] = useState({
    status: 'Reserviert' as BookingStatus,
    selectedDate: '',
    guests: '',
    dog: '',
    reservationExpiresAt: '',
    paymentDueAt: '',
    followUpAt: '',
    checkInStatus: 'offen' as NonNullable<GuestLead['checkInStatus']>,
    experienceStatus: 'offen' as NonNullable<GuestLead['experienceStatus']>,
    internalNote: '',
    message: '',
  })
  const [taskDraft, setTaskDraft] = useState({
    title: '',
    dueAt: '',
    priority: 'medium' as AdminTaskPriority,
    note: '',
  })
  const [guestLinkCopied, setGuestLinkCopied] = useState(false)
  const [guestMessageCopied, setGuestMessageCopied] = useState<'email' | 'whatsapp' | null>(null)

  useEffect(() => {
    if (!lead) return
    setDraft({
      status: lead.status as BookingStatus,
      selectedDate: lead.selectedDate,
      guests: lead.guests ?? '',
      dog: lead.dog ?? '',
      reservationExpiresAt: lead.reservationExpiresAt ?? '',
      paymentDueAt: lead.paymentDueAt ?? '',
      followUpAt: lead.followUpAt ?? '',
      checkInStatus: lead.checkInStatus ?? 'offen',
      experienceStatus: lead.experienceStatus ?? 'offen',
      internalNote: lead.internalNote ?? '',
      message: lead.message ?? '',
    })
    setTaskDraft({
      title: '',
      dueAt: lead.followUpAt ?? '',
      priority: 'medium',
      note: '',
    })
  }, [lead])

  if (!lead) return null

  const updateDraft = (key: keyof typeof draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }
  const updateTaskDraft = (key: keyof typeof taskDraft, value: string) => {
    setTaskDraft((current) => ({ ...current, [key]: value }))
  }
  const paymentStatus = bookingPaymentStatus(draft.status)
  const includedExperiences = packageItem?.experienceItems.filter((experience) => experience.role === 'included') ?? []
  const guestAreaUnlocked = isGuestStayUnlocked(draft.status as LeadStatus)
  const guestAreaPath = guestStayHref(lead)
  const guestPreparationItems = bookingGuestPreparationItems({
    paymentStatus,
    selectedDate: draft.selectedDate,
    checkInStatus: draft.checkInStatus,
    experienceStatus: draft.experienceStatus,
    packageItem: packageItem ?? undefined,
  })
  const missingPreparationItems = guestPreparationItems.filter((item) => !item.done)
  const guestAreaReady = guestAreaUnlocked && missingPreparationItems.length === 0
  const paymentPreparationItem = guestPreparationItems.find((item) => item.id === 'payment')
  const checkInPreparationItem = guestPreparationItems.find((item) => item.id === 'checkin')
  const experiencePreparationItem = guestPreparationItems.find((item) => item.id === 'experience')
  const existingOpenTaskTitles = new Set(tasks.filter((task) => task.status === 'open').map((task) => task.title.toLowerCase()))
  const openOperationalTasks = tasks
    .filter((task) => task.status !== 'done')
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
  const bookingSupportTasks = tasks
    .filter((task) => isGuestSupportTask(task) && task.status !== 'done')
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
  const nextPreparationItem = missingPreparationItems[0]
  const nextOperationalTask = openOperationalTasks[0]
  const nextActionTitle = nextPreparationItem
    ? nextPreparationItem.taskTitle
    : nextOperationalTask
      ? nextOperationalTask.title
      : guestAreaReady
        ? 'Gästebereich bereit halten'
        : guestAreaUnlocked
          ? 'Aufenthalt prüfen'
          : 'Zahlung abwarten'
  const nextActionDetail = nextPreparationItem
    ? nextPreparationItem.detail
    : nextOperationalTask
      ? `${formatGermanTaskDate(nextOperationalTask.dueAt)} · ${taskPriorityLabel(nextOperationalTask.priority)}`
      : guestAreaReady
        ? 'Der private Bereich kann an den Gast gesendet und vor Anreise aktuell gehalten werden.'
        : guestAreaUnlocked
          ? 'Der Aufenthalt ist freigeschaltet. Prüft, ob die nächsten operativen Hinweise vollständig sind.'
          : 'Der private Bereich wird erst nach verbindlicher Buchung oder Zahlung geöffnet.'
  const bookingProgressSteps = [
    { label: 'Reservierung', done: ['Reserviert', 'Bezahlt', 'Vor Anreise', 'Aktiv', 'Abgeschlossen'].includes(draft.status) },
    { label: 'Zahlung', done: paymentStatus === 'Bezahlt' },
    { label: 'Vor Anreise', done: guestAreaReady || draft.status === 'Vor Anreise' || draft.status === 'Aktiv' || draft.status === 'Abgeschlossen' },
    { label: 'Aufenthalt', done: draft.status === 'Aktiv' || draft.status === 'Abgeschlossen' },
  ]
  const copyGuestLink = async () => {
    const origin = window.location.origin
    await navigator.clipboard.writeText(`${origin}${guestAreaPath}`)
    setGuestLinkCopied(true)
  }
  const guestAccessMessage = (channel: 'email' | 'whatsapp') => {
    const origin = window.location.origin
    const guestUrl = `${origin}${guestAreaPath}`
    const firstName = lead.name.split(' ')[0] || lead.name
    if (channel === 'whatsapp') {
      return [
        `Hallo ${firstName}, euer privater Morrow-Bereich ist vorbereitet:`,
        guestUrl,
        `Zugangscode: ${guestAccessCode(lead)}`,
        '',
        'Dort findet ihr Anreise, Unterkunft, Erlebnis, Empfehlungen vor Ort und direkte Hilfe.',
        'Liebe Grüße, Morrow',
      ].join('\n')
    }

    return [
      `Hallo ${firstName},`,
      '',
      `euer privater Morrow-Bereich für ${lead.packageName} in Sankt Peter-Ording ist vorbereitet.`,
      'Dort findet ihr alles, was euren Aufenthalt leichter macht: Anreise, Unterkunft, Erlebnis, Empfehlungen vor Ort und direkte Hilfe an einem Ort.',
      '',
      `Link: ${guestUrl}`,
      `Zugangscode: ${guestAccessCode(lead)}`,
      '',
      'Liebe Grüße',
      'Morrow',
    ].join('\n')
  }
  const copyGuestAccessMessage = async (channel: 'email' | 'whatsapp') => {
    await navigator.clipboard.writeText(guestAccessMessage(channel))
    setGuestMessageCopied(channel)
  }
  const save = () => {
    onUpdateLead(lead.id, {
      status: draft.status,
      selectedDate: draft.selectedDate,
      guests: draft.guests,
      dog: draft.dog,
      reservationExpiresAt: draft.reservationExpiresAt,
      paymentDueAt: draft.paymentDueAt,
      followUpAt: draft.followUpAt,
      checkInStatus: draft.checkInStatus,
      experienceStatus: draft.experienceStatus,
      internalNote: draft.internalNote,
      message: draft.message,
    } as Partial<StoredLead>)
    onClose()
  }
  const createTask = () => {
    if (!taskDraft.title.trim()) return
    onCreateTask({
      title: taskDraft.title.trim(),
      referenceType: 'booking',
      referenceId: lead.id,
      referenceLabel: `${lead.name} · ${lead.packageName}`,
      dueAt: taskDraft.dueAt || todayIsoValue(),
      priority: taskDraft.priority,
      note: taskDraft.note.trim() || undefined,
    })
    setTaskDraft({ title: '', dueAt: '', priority: 'medium', note: '' })
  }
  const createPreparationTask = (item: (typeof guestPreparationItems)[number]) => {
    if (existingOpenTaskTitles.has(item.taskTitle.toLowerCase())) return
    onCreateTask({
      title: item.taskTitle,
      referenceType: 'booking',
      referenceId: lead.id,
      referenceLabel: `${lead.name} · ${lead.packageName}`,
      dueAt: draft.followUpAt || todayIsoValue(),
      priority: item.id === 'payment' || item.id === 'checkin' ? 'high' : 'medium',
      note: item.detail,
    })
  }
  const quickResolvePreparationItem = (item: (typeof guestPreparationItems)[number]) => {
    if (item.id === 'payment') {
      const nextStatus = draft.status === 'Reserviert' ? 'Bezahlt' : draft.status
      setDraft((current) => ({
        ...current,
        status: nextStatus,
      }))
      onUpdateLead(lead.id, { status: nextStatus } as Partial<StoredLead>)
      return
    }

    if (item.id === 'checkin') {
      updateDraft('checkInStatus', 'freigegeben')
      onUpdateLead(lead.id, { checkInStatus: 'freigegeben' } as Partial<StoredLead>)
      return
    }

    if (item.id === 'experience' && packageItem) {
      updateDraft('experienceStatus', 'bestätigt')
      onUpdateLead(lead.id, { experienceStatus: 'bestätigt' } as Partial<StoredLead>)
      onUpdatePackage(packageItem.id, (pkg) => ({
        ...pkg,
        experienceItems: pkg.experienceItems.map((experience) => (
          experience.role === 'included'
            ? { ...experience, confirmationStatus: 'confirmed' }
            : experience
        )),
      }))
    }
  }
  const quickResolveLabel = (item: (typeof guestPreparationItems)[number]) => {
    if (item.id === 'payment') return 'Bezahlt'
    if (item.id === 'checkin') return 'Freigeben'
    if (item.id === 'experience') return 'Bestätigen'
    return ''
  }

  return (
    <aside className="admin-drawer-shell" aria-label="Buchung bearbeiten">
      <button className="admin-drawer-backdrop" type="button" aria-label="Schließen" onClick={onClose} />
      <section className="admin-drawer">
        <header className="admin-drawer-header">
          <div>
            <span>{lead.packageName} · {lead.selectedDate}</span>
            <h2>{lead.name}</h2>
            <p>Buchung, Zahlung, Unterkunft, Erlebnis und nächste operative Schritte prüfen.</p>
          </div>
          <button className="admin-icon-button" type="button" aria-label="Schließen" onClick={onClose}><CloseLine size={18} /></button>
        </header>

        <div className="admin-drawer-body">
          <section className="admin-booking-command" aria-label="Operations-Zentrale">
            <header>
              <div>
                <span>Operations-Zentrale</span>
                <h3>{nextActionTitle}</h3>
                <p>{nextActionDetail}</p>
              </div>
              <strong className={guestAreaReady ? 'is-ready' : missingPreparationItems.length > 0 ? 'is-open' : ''}>
                {guestAreaReady ? 'gastbereit' : missingPreparationItems.length > 0 ? `${missingPreparationItems.length} offen` : 'im Blick'}
              </strong>
            </header>
            <div className="admin-booking-progress" aria-label="Buchungsfortschritt">
              {bookingProgressSteps.map((step) => (
                <span key={step.label} className={step.done ? 'is-done' : ''}>{step.label}</span>
              ))}
            </div>
            <div className="admin-booking-command-actions">
              {paymentStatus === 'Offen' && paymentPreparationItem && (
                <button className="admin-row-action" type="button" onClick={() => quickResolvePreparationItem(paymentPreparationItem)}>
                  Zahlung als bezahlt markieren
                </button>
              )}
              {draft.checkInStatus !== 'freigegeben' && checkInPreparationItem && (
                <button className="admin-row-action" type="button" onClick={() => quickResolvePreparationItem(checkInPreparationItem)}>
                  Check-in freigeben
                </button>
              )}
              {missingPreparationItems.some((item) => item.id === 'experience') && experiencePreparationItem && (
                <button className="admin-row-action" type="button" onClick={() => quickResolvePreparationItem(experiencePreparationItem)}>
                  Erlebnis bestätigen
                </button>
              )}
              {guestAreaUnlocked && <a className="admin-row-action" href={guestAreaPath}>Gästebereich prüfen</a>}
            </div>
          </section>

          <section className="admin-booking-summary" aria-label="Buchungsüberblick">
            <article>
              <span>Status</span>
              <strong>{draft.status}</strong>
            </article>
            <article>
              <span>Zahlung</span>
              <strong>{paymentStatus}</strong>
            </article>
            <article>
              <span>Unterkunft</span>
              <strong>{packageItem?.stay.name ?? 'Noch nicht verbunden'}</strong>
            </article>
            <article>
              <span>Erlebnis</span>
              <strong>{draft.experienceStatus}</strong>
            </article>
            <article>
              <span>Gästebereich</span>
              <strong>{isGuestStayUnlocked(draft.status as LeadStatus) ? guestAccessCode(lead) : 'nach Zahlung'}</strong>
            </article>
          </section>

          {bookingSupportTasks.length > 0 && (
            <section className="admin-guest-support-card" aria-label="Aktueller Gästesupport">
              <header>
                <div>
                  <span>Gästesupport</span>
                  <h3>{bookingSupportTasks.length === 1 ? '1 Thema offen' : `${bookingSupportTasks.length} Themen offen`}</h3>
                </div>
                <strong>{bookingSupportTasks.some((task) => task.priority === 'high') ? 'hoch' : 'normal'}</strong>
              </header>
              <div className="admin-guest-support-list">
                {bookingSupportTasks.map((task) => (
                  <article key={task.id}>
                    <div>
                      <span>{taskPriorityLabel(task.priority)} · {taskStatusLabel(task.status)}</span>
                      <strong>{task.title.replace('Support: ', '')}</strong>
                      {task.note && <p>{task.note}</p>}
                    </div>
                    <div className="admin-linked-actions">
                      {task.status === 'open' && <button className="admin-row-action" type="button" onClick={() => onMoveTaskInProgress(task.id)}>In Klärung</button>}
                      <button className="admin-row-action" type="button" onClick={() => onToggleTask(task.id)}>Erledigen</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="admin-guest-prep-card" aria-label="Gästebereich Vorbereitung">
            <header>
              <div>
                <span>Gästebereich</span>
                <h3>{guestAreaReady ? 'Bereit für den Gast' : guestAreaUnlocked ? 'Noch nicht vollständig vorbereitet' : 'Nach Zahlung freischalten'}</h3>
                <p>{guestAreaReady ? 'Zugang, Unterkunft, Check-in, Erlebnis und Empfehlungen sind vollständig.' : 'Diese Punkte entscheiden, ob der private Bereich wirklich Komfort liefert.'}</p>
              </div>
              <strong className={guestAreaReady ? 'is-ready' : 'is-open'}>{guestAreaReady ? 'bereit' : `${missingPreparationItems.length} offen`}</strong>
            </header>
            <div className="admin-guest-access-row">
              <article>
                <span>Zugangscode</span>
                <strong>{guestAreaUnlocked ? guestAccessCode(lead) : 'nach Zahlung'}</strong>
              </article>
              <article>
                <span>Link</span>
                <strong>{guestAreaUnlocked ? 'verfügbar' : 'gesperrt'}</strong>
              </article>
            </div>
            <div className="admin-guest-prep-list">
              {guestPreparationItems.map((item) => (
                <article key={item.id} className={item.done ? 'is-done' : 'is-open'}>
                  <i>{item.done ? 'OK' : '!'}</i>
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                  </div>
                  {!item.done && (
                    <div className="admin-guest-prep-actions">
                      {quickResolveLabel(item) && (
                        <button className="admin-row-action" type="button" onClick={() => quickResolvePreparationItem(item)}>
                          {quickResolveLabel(item)}
                        </button>
                      )}
                      <button
                        className="admin-row-action"
                        type="button"
                        disabled={existingOpenTaskTitles.has(item.taskTitle.toLowerCase())}
                        onClick={() => createPreparationTask(item)}
                      >
                        {existingOpenTaskTitles.has(item.taskTitle.toLowerCase()) ? 'Aufgabe offen' : 'Aufgabe'}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
            {guestAreaUnlocked && (
              <footer>
                <button className="admin-row-action" type="button" onClick={copyGuestLink}>{guestLinkCopied ? 'Link kopiert' : 'Link kopieren'}</button>
                <button className="admin-row-action" type="button" onClick={() => copyGuestAccessMessage('email')}>{guestMessageCopied === 'email' ? 'E-Mail kopiert' : 'E-Mail'}</button>
                <button className="admin-row-action" type="button" onClick={() => copyGuestAccessMessage('whatsapp')}>{guestMessageCopied === 'whatsapp' ? 'WhatsApp kopiert' : 'WhatsApp'}</button>
                <a className="admin-row-action" href={guestAreaPath}>Öffnen</a>
              </footer>
            )}
          </section>

          <section className="admin-drawer-form" aria-label="Buchungsstatus bearbeiten">
            <h3>Buchung</h3>
            <label>Status
              <select value={draft.status} onChange={(event) => updateDraft('status', event.target.value)}>
                <option value="Reserviert">Reserviert</option>
                <option value="Bezahlt">Bezahlt</option>
                <option value="Vor Anreise">Vor Anreise</option>
                <option value="Aktiv">Aktiv</option>
                <option value="Abgeschlossen">Abgeschlossen</option>
                <option value="Storniert">Storniert</option>
              </select>
            </label>
            <label>Termin
              <input value={draft.selectedDate} onChange={(event) => updateDraft('selectedDate', event.target.value)} />
            </label>
            <label>Personen
              <input value={draft.guests} onChange={(event) => updateDraft('guests', event.target.value)} />
            </label>
            <label>Hund
              <input value={draft.dog} onChange={(event) => updateDraft('dog', event.target.value)} />
            </label>
            <label>Reservierung halten bis
              <input type="date" value={draft.reservationExpiresAt} onChange={(event) => updateDraft('reservationExpiresAt', event.target.value)} />
            </label>
            <label>Zahlung fällig bis
              <input type="date" value={draft.paymentDueAt} onChange={(event) => updateDraft('paymentDueAt', event.target.value)} />
            </label>
            <label>Nächste Aufgabe
              <input type="date" value={draft.followUpAt} onChange={(event) => updateDraft('followUpAt', event.target.value)} />
            </label>
            <label>Check-in-Status
              <select value={draft.checkInStatus} onChange={(event) => updateDraft('checkInStatus', event.target.value)}>
                <option value="offen">Offen</option>
                <option value="vorbereitet">Vorbereitet</option>
                <option value="freigegeben">Freigegeben</option>
              </select>
            </label>
            <label>Erlebnisstatus
              <select value={draft.experienceStatus} onChange={(event) => updateDraft('experienceStatus', event.target.value)}>
                <option value="offen">Offen</option>
                <option value="angefragt">Angefragt</option>
                <option value="bestätigt">Bestätigt</option>
              </select>
            </label>
            <label>Interne Notiz
              <textarea rows={5} value={draft.internalNote} onChange={(event) => updateDraft('internalNote', event.target.value)} />
            </label>
          </section>

          <section className="admin-drawer-section" aria-label="Aufenthalt">
            <h3>Aufenthalt</h3>
            <div className="admin-detail-grid">
              <article>
                <span>Schlüsselübergabe</span>
                <strong>{packageItem ? checkInTypeLabel(packageItem.stay.checkInType) : 'Offen'}</strong>
              </article>
              <article>
                <span>Anreise möglich bis</span>
                <strong>{packageItem?.stay.latestArrival || 'Offen'}</strong>
              </article>
              <article>
                <span>Check-out</span>
                <strong>{packageItem?.stay.checkOutTime || 'Offen'}</strong>
              </article>
              <article>
                <span>Hund in Auszeit</span>
                <strong>{packageItem?.dogOptional ? 'optional möglich' : 'nicht vorgesehen'}</strong>
              </article>
            </div>
          </section>

          <section className="admin-drawer-section" aria-label="Erlebnisbausteine">
            <h3>Erlebnisbausteine</h3>
            <div className="admin-linked-list">
              {includedExperiences.length === 0 && <p className="admin-empty-note">Noch kein enthaltenes Erlebnis verbunden.</p>}
              {includedExperiences.map((experience) => (
                <article key={experience.id}>
                  <strong>{experience.title}</strong>
                  <span>{experienceProviderName(experience)} · {experienceConfirmationLabel(experience.confirmationStatus)}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-drawer-section" aria-label="Aufgaben">
            <h3>Aufgaben</h3>
            <div className="admin-linked-list admin-task-list">
              {tasks.length === 0 && <p className="admin-empty-note">Noch keine Aufgabe für diese Buchung.</p>}
              {tasks.map((task) => (
                <article key={task.id} className={task.status === 'done' ? 'is-done' : ''}>
                  <strong>{task.title}</strong>
                  <span>{formatGermanTaskDate(task.dueAt)} · {taskPriorityLabel(task.priority)} · {taskStatusLabel(task.status)}</span>
                  {task.note && <p>{task.note}</p>}
                  <div className="admin-linked-actions">
                    {task.status === 'open' && <button className="admin-row-action" type="button" onClick={() => onMoveTaskInProgress(task.id)}>In Klärung</button>}
                    <button className="admin-row-action" type="button" onClick={() => onToggleTask(task.id)}>{task.status === 'done' ? 'Wieder öffnen' : 'Erledigen'}</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-drawer-form" aria-label="Neue Aufgabe">
            <h3>Neue Aufgabe</h3>
            <label>Aufgabe
              <input value={taskDraft.title} onChange={(event) => updateTaskDraft('title', event.target.value)} placeholder="z. B. Check-in-Infos senden" />
            </label>
            <label>Fällig
              <input type="date" value={taskDraft.dueAt} onChange={(event) => updateTaskDraft('dueAt', event.target.value)} />
            </label>
            <label>Priorität
              <select value={taskDraft.priority} onChange={(event) => updateTaskDraft('priority', event.target.value)}>
                <option value="low">Niedrig</option>
                <option value="medium">Normal</option>
                <option value="high">Hoch</option>
              </select>
            </label>
            <label>Notiz
              <textarea rows={3} value={taskDraft.note} onChange={(event) => updateTaskDraft('note', event.target.value)} />
            </label>
            <button className="admin-row-action" type="button" onClick={createTask}>Aufgabe anlegen</button>
          </section>

          <section className="admin-drawer-form" aria-label="Gastnachricht bearbeiten">
            <h3>Kontext</h3>
            <label>Ursprüngliche Nachricht / Kontext
              <textarea rows={4} value={draft.message} onChange={(event) => updateDraft('message', event.target.value)} />
            </label>
          </section>

          <section className="admin-drawer-form" aria-label="Kontakt">
            <h3>Kontakt</h3>
            <div className="admin-contact-actions">
              <a href={`mailto:${lead.email}`}>E-Mail öffnen</a>
              <a href={`tel:${lead.phone.replace(/\s/g, '')}`}>Anrufen</a>
            </div>
          </section>
        </div>

        <footer className="admin-drawer-actions">
          <button className="admin-action primary" type="button" onClick={save}>Speichern</button>
          <a className="admin-action" href={`/auszeiten/${lead.packageSlug}`}>Auszeit prüfen</a>
          {isGuestStayUnlocked(draft.status as LeadStatus) && (
            <a className="admin-action" href={guestStayHref(lead)}>Gästebereich öffnen</a>
          )}
        </footer>
      </section>
    </aside>
  )
}

function CustomerDetailDrawer({
  customer,
  bookings,
  onClose,
  onOpenBooking,
  onOpenLead,
}: {
  customer: CustomerProfile | null
  bookings: BookingProfile[]
  onClose: () => void
  onOpenBooking: (id: string) => void
  onOpenLead: (id: string) => void
}) {
  if (!customer) return null

  const latestRequest = customer.requests[0]

  return (
    <aside className="admin-drawer-shell" aria-label="Kunde Detail">
      <button className="admin-drawer-backdrop" type="button" aria-label="Schließen" onClick={onClose} />
      <section className="admin-drawer">
        <header className="admin-drawer-header">
          <div>
            <span>{customer.guestType} · {customer.requests.length} Anfrage{customer.requests.length === 1 ? '' : 'n'}</span>
            <h2>{customer.name}</h2>
            <p>Kontakt, Anfragehistorie und gebuchte Aufenthalte an einem Ort.</p>
          </div>
          <button className="admin-icon-button" type="button" aria-label="Schließen" onClick={onClose}><CloseLine size={18} /></button>
        </header>

        <div className="admin-drawer-body">
          <section className="admin-booking-summary" aria-label="Kundenüberblick">
            <article>
              <span>Anfragen</span>
              <strong>{customer.requests.length}</strong>
            </article>
            <article>
              <span>Buchungen</span>
              <strong>{bookings.length}</strong>
            </article>
            <article>
              <span>Kommunikation</span>
              <strong>{customer.whatsappOptIn ? 'E-Mail + WhatsApp OK' : 'E-Mail'}</strong>
            </article>
            <article>
              <span>Letzte Auszeit</span>
              <strong>{latestRequest?.packageName ?? 'Offen'}</strong>
            </article>
          </section>

          <section className="admin-drawer-form" aria-label="Kontakt">
            <h3>Kontakt</h3>
            <div className="admin-customer-contact">
              <a href={`mailto:${customer.email}`}>{customer.email}</a>
              <a href={`tel:${customer.phone.replace(/\s/g, '')}`}>{customer.phone}</a>
            </div>
            <div className="admin-contact-actions">
              <a href={`mailto:${customer.email}`}>E-Mail öffnen</a>
              <a href={`tel:${customer.phone.replace(/\s/g, '')}`}>Anrufen</a>
            </div>
          </section>

          <section className="admin-drawer-section" aria-label="Anfragehistorie">
            <h3>Anfragehistorie</h3>
            <div className="admin-linked-list">
              {customer.requests.map((request) => (
                <article key={request.id}>
                  <strong>{request.packageName}</strong>
                  <span>{request.selectedDate} · {request.status} · {request.source ?? 'Quelle offen'}{request.campaign ? ` · ${request.campaign}` : ''}</span>
                  {request.message && <p>{request.message}</p>}
                  <button className="admin-row-action" type="button" onClick={() => onOpenLead(request.id)}>Anfrage öffnen</button>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-drawer-section" aria-label="Buchungen">
            <h3>Buchungen</h3>
            <div className="admin-linked-list">
              {bookings.length === 0 && <p className="admin-empty-note">Noch keine verbindliche Buchung für diesen Kunden.</p>}
              {bookings.map((booking) => (
                <article key={booking.id}>
                  <strong>{booking.packageName}</strong>
                  <span>{booking.selectedDate} · {booking.status} · Zahlung {booking.paymentStatus}</span>
                  <button className="admin-row-action" type="button" onClick={() => onOpenBooking(booking.id)}>Buchung öffnen</button>
                </article>
              ))}
            </div>
          </section>
        </div>

        <footer className="admin-drawer-actions">
          <button className="admin-action primary" type="button" onClick={onClose}>Schließen</button>
        </footer>
      </section>
    </aside>
  )
}

function PackageDetailDrawer({
  item,
  properties,
  providers,
  onClose,
  onDeletePackage,
  onUpdatePackage,
}: {
  item: MorrowPackage | null
  properties: OwnerPropertyProfile[]
  providers: ExperienceProviderProfile[]
  onClose: () => void
  onDeletePackage: (id: string) => void
  onUpdatePackage: (id: string, updater: (pkg: MorrowPackage) => MorrowPackage) => void
}) {
  const [draft, setDraft] = useState({
    name: '',
    status: 'draft' as PackageStatus,
    shortPromise: '',
    concretePrice: '',
    priceNote: '',
    dates: '',
    propertyId: '',
    stayName: '',
    stayLocationNote: '',
    sleeps: '',
    bedrooms: '',
    bathrooms: '',
    latestArrival: '',
    checkOutTime: '',
    checkInType: 'unknown' as Stay['checkInType'],
    propertySupportType: 'morrow' as Stay['propertySupportType'],
    propertySupportName: '',
    dogOptional: false,
    included: '',
  })
  const [experienceDrafts, setExperienceDrafts] = useState<MorrowPackage['experienceItems']>([])

  useEffect(() => {
    if (!item) return
    setDraft({
      name: item.name,
      status: item.status,
      shortPromise: item.shortPromise,
      concretePrice: item.concretePrice,
      priceNote: item.priceNote,
      dates: item.dates.join('\n'),
      propertyId: item.propertyId,
      stayName: item.stay.name,
      stayLocationNote: item.stay.locationNote,
      sleeps: String(item.stay.sleeps),
      bedrooms: String(item.stay.bedrooms),
      bathrooms: String(item.stay.bathrooms),
      latestArrival: item.stay.latestArrival,
      checkOutTime: item.stay.checkOutTime,
      checkInType: item.stay.checkInType,
      propertySupportType: item.stay.propertySupportType ?? 'morrow',
      propertySupportName: item.stay.propertySupportName ?? '',
      dogOptional: item.dogOptional,
      included: item.included.join('\n'),
    })
    setExperienceDrafts(item.experienceItems)
  }, [item])

  if (!item) return null

  const updateDraft = (key: keyof typeof draft, value: string | boolean) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }
  const updateExperienceDraft = (
    id: string,
    key: keyof MorrowPackage['experienceItems'][number],
    value: string | boolean,
  ) => {
    setExperienceDrafts((current) => current.map((experience) => (
      experience.id === id ? { ...experience, [key]: value } : experience
    )))
  }
  const addExperienceDraft = () => {
    setExperienceDrafts((current) => ([
      ...current,
      {
        id: `exp-${crypto.randomUUID()}`,
        title: 'Neuer Erlebnisbaustein',
        role: 'planned',
        includedInPrice: false,
        confirmationStatus: 'planned',
        guestNotes: '',
      },
    ]))
  }
  const removeExperienceDraft = (id: string) => {
    setExperienceDrafts((current) => current.filter((experience) => experience.id !== id))
  }
  const applyPropertyToDraft = (propertyId: string) => {
    updateDraft('propertyId', propertyId)
    const property = properties.find((item) => item.id === propertyId)
    if (!property) return
    setDraft((current) => ({
      ...current,
      propertyId,
      stayName: property.name,
      stayLocationNote: property.location,
      sleeps: String(property.sleeps),
      latestArrival: property.latestArrival,
      checkInType: property.checkInType,
      propertySupportType: propertySupportTypeFromRental(property.currentRental),
      propertySupportName: property.currentRental === 'agency' ? 'die Partneragentur' : '',
    }))
  }
  const applyProviderToExperience = (experienceId: string, providerId: string) => {
    const provider = providers.find((item) => item.id === providerId)
    setExperienceDrafts((current) => current.map((experience) => (
      experience.id === experienceId
        ? {
            ...experience,
            providerId: providerId || undefined,
            providerName: provider?.name ?? experience.providerName,
          }
        : experience
    )))
  }
  const save = () => {
    const nextDates = draft.dates.split('\n').map((value) => value.trim()).filter(Boolean)
    const nextIncluded = draft.included.split('\n').map((value) => value.trim()).filter(Boolean)
    const sleeps = Number.parseInt(draft.sleeps, 10)
    const bedrooms = Number.parseInt(draft.bedrooms, 10)
    const bathrooms = Number.parseInt(draft.bathrooms, 10)

    onUpdatePackage(item.id, (pkg) => ({
      ...pkg,
      name: draft.name,
      status: draft.status,
      shortPromise: draft.shortPromise,
      concretePrice: draft.concretePrice,
      priceNote: draft.priceNote,
      dates: nextDates.length > 0 ? nextDates : pkg.dates,
      dogOptional: draft.dogOptional,
      propertyId: draft.propertyId || pkg.propertyId,
      included: nextIncluded.length > 0 ? nextIncluded : pkg.included,
      experienceItems: experienceDrafts,
      stay: {
        ...pkg.stay,
        name: draft.stayName,
        locationNote: draft.stayLocationNote,
        sleeps: Number.isNaN(sleeps) ? pkg.stay.sleeps : sleeps,
        bedrooms: Number.isNaN(bedrooms) ? pkg.stay.bedrooms : bedrooms,
        bathrooms: Number.isNaN(bathrooms) ? pkg.stay.bathrooms : bathrooms,
        latestArrival: draft.latestArrival,
        checkOutTime: draft.checkOutTime,
        checkInType: draft.checkInType,
        propertySupportType: draft.propertySupportType,
        propertySupportName: draft.propertySupportName || undefined,
      },
    }))
    onClose()
  }

  return (
    <aside className="admin-drawer-shell" aria-label="Auszeit bearbeiten">
      <button className="admin-drawer-backdrop" type="button" aria-label="Schließen" onClick={onClose} />
      <section className="admin-drawer">
        <header className="admin-drawer-header">
          <div>
            <span>{audienceLabel(item.audience)} · {item.location}</span>
            <h2>{item.name}</h2>
            <p>Preis, Termine, Unterkunft und sichtbare Kerninfos der Auszeit bearbeiten.</p>
          </div>
          <button className="admin-icon-button" type="button" aria-label="Schließen" onClick={onClose}><CloseLine size={18} /></button>
        </header>

        <div className="admin-drawer-body">
          <section className="admin-drawer-form" aria-label="Auszeit bearbeiten">
            <h3>Auszeit</h3>
            <label>Name
              <input value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} />
            </label>
            <label>Status
              <select value={draft.status} onChange={(event) => updateDraft('status', event.target.value as PackageStatus)}>
                <option value="published">Live</option>
                <option value="draft">Entwurf</option>
                <option value="paused">Pausiert</option>
              </select>
            </label>
            <label>Kurzversprechen
              <textarea rows={3} value={draft.shortPromise} onChange={(event) => updateDraft('shortPromise', event.target.value)} />
            </label>
          </section>

          <section className="admin-drawer-form" aria-label="Preis und Termine bearbeiten">
            <h3>Preis und Termine</h3>
            <label>Preis
              <input value={draft.concretePrice} onChange={(event) => updateDraft('concretePrice', event.target.value)} />
            </label>
            <label>Preisnotiz
              <input value={draft.priceNote} onChange={(event) => updateDraft('priceNote', event.target.value)} />
            </label>
            <label>Termine
              <textarea rows={4} value={draft.dates} onChange={(event) => updateDraft('dates', event.target.value)} placeholder="Ein Termin pro Zeile" />
            </label>
          </section>

          <section className="admin-drawer-form" aria-label="Unterkunft bearbeiten">
            <h3>Unterkunft</h3>
            <label>Verbundenes Objekt
              <select value={draft.propertyId} onChange={(event) => applyPropertyToDraft(event.target.value)}>
                <option value="">Nicht verbunden</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>{property.name} · {property.location}</option>
                ))}
              </select>
            </label>
            <label>Unterkunft
              <input value={draft.stayName} onChange={(event) => updateDraft('stayName', event.target.value)} />
            </label>
            <label>Schlafplätze
              <input inputMode="numeric" value={draft.sleeps} onChange={(event) => updateDraft('sleeps', event.target.value)} />
            </label>
            <label>Schlafzimmer
              <input inputMode="numeric" value={draft.bedrooms} onChange={(event) => updateDraft('bedrooms', event.target.value)} />
            </label>
            <label>Badezimmer
              <input inputMode="numeric" value={draft.bathrooms} onChange={(event) => updateDraft('bathrooms', event.target.value)} />
            </label>
            <label>Anreise möglich bis
              <input value={draft.latestArrival} onChange={(event) => updateDraft('latestArrival', event.target.value)} />
            </label>
            <label>Check-out
              <input value={draft.checkOutTime} onChange={(event) => updateDraft('checkOutTime', event.target.value)} />
            </label>
            <label>Schlüsselübergabe
              <select value={draft.checkInType} onChange={(event) => updateDraft('checkInType', event.target.value as Stay['checkInType'])}>
                <option value="key_safe">Schlüsselsafe</option>
                <option value="agency_pickup">Abholung bei Agentur</option>
                <option value="personal_handover">Persönliche Übergabe</option>
                <option value="smartlock">Smartlock</option>
                <option value="unknown">Noch offen</option>
              </select>
            </label>
            <label>Hund optional
              <select value={draft.dogOptional ? 'yes' : 'no'} onChange={(event) => updateDraft('dogOptional', event.target.value === 'yes')}>
                <option value="yes">Ja</option>
                <option value="no">Nein</option>
              </select>
            </label>
            <label>Lagehinweis
              <textarea rows={3} value={draft.stayLocationNote} onChange={(event) => updateDraft('stayLocationNote', event.target.value)} />
            </label>
          </section>

          <section className="admin-drawer-form admin-drawer-form-wide" aria-label="Erlebnisse bearbeiten">
            <div className="admin-drawer-heading-row">
              <h3>Erlebnisbausteine</h3>
              <button className="admin-row-action" type="button" onClick={addExperienceDraft}>Erlebnis hinzufügen</button>
            </div>
            <div className="admin-experience-editor">
              {experienceDrafts.map((experience) => (
                <article key={experience.id}>
                  <label>Titel
                    <input value={experience.title} onChange={(event) => updateExperienceDraft(experience.id, 'title', event.target.value)} />
                  </label>
                  <label>Rolle
                    <select value={experience.role} onChange={(event) => updateExperienceDraft(experience.id, 'role', event.target.value)}>
                      <option value="included">Enthalten</option>
                      <option value="optional">Optional</option>
                      <option value="recommendation">Empfehlung</option>
                      <option value="planned">Geplant</option>
                    </select>
                  </label>
                  <label>Status
                    <select value={experience.confirmationStatus} onChange={(event) => updateExperienceDraft(experience.id, 'confirmationStatus', event.target.value)}>
                      <option value="planned">Geplant</option>
                      <option value="requested">Angefragt</option>
                      <option value="confirmed">Bestätigt</option>
                    </select>
                  </label>
                  <label>Im Preis enthalten
                    <select value={experience.includedInPrice ? 'yes' : 'no'} onChange={(event) => updateExperienceDraft(experience.id, 'includedInPrice', event.target.value === 'yes')}>
                      <option value="yes">Ja</option>
                      <option value="no">Nein</option>
                    </select>
                  </label>
                  <label>Partnerprofil
                    <select value={experience.providerId ?? ''} onChange={(event) => applyProviderToExperience(experience.id, event.target.value)}>
                      <option value="">Noch nicht verbunden</option>
                      {providers.map((provider) => (
                        <option key={provider.id} value={provider.id}>{provider.name} · {provider.category}</option>
                      ))}
                    </select>
                  </label>
                  <label>Anbieter
                    <input value={experience.providerName ?? ''} onChange={(event) => updateExperienceDraft(experience.id, 'providerName', event.target.value)} />
                  </label>
                  <label>Gastnotiz
                    <textarea rows={3} value={experience.guestNotes} onChange={(event) => updateExperienceDraft(experience.id, 'guestNotes', event.target.value)} />
                  </label>
                  <button className="admin-row-action danger-soft" type="button" onClick={() => removeExperienceDraft(experience.id)}>Entfernen</button>
                </article>
              ))}
              {experienceDrafts.length === 0 && <p className="admin-empty-note">Noch kein Erlebnisbaustein angelegt.</p>}
            </div>
          </section>

          <section className="admin-drawer-form" aria-label="Leistungen bearbeiten">
            <h3>Enthaltene Leistungen</h3>
            <label>Leistungen
              <textarea rows={6} value={draft.included} onChange={(event) => updateDraft('included', event.target.value)} placeholder="Eine Leistung pro Zeile" />
            </label>
          </section>
        </div>

        <footer className="admin-drawer-actions">
          <button className="admin-action primary" type="button" onClick={save}>Speichern</button>
          <a className="admin-action" href={`/auszeiten/${item.slug}`}>Öffentliche Seite prüfen</a>
          <button className="admin-action danger" type="button" onClick={() => onDeletePackage(item.id)}>Entfernen</button>
        </footer>
      </section>
    </aside>
  )
}

function ExperienceDetailDrawer({
  item,
  packageItem,
  providers,
  onClose,
  onUpdateExperience,
}: {
  item: MorrowPackage['experienceItems'][number] | null
  packageItem: MorrowPackage | null
  providers: ExperienceProviderProfile[]
  onClose: () => void
  onUpdateExperience: (
    packageId: string,
    experienceId: string,
    updater: (experience: MorrowPackage['experienceItems'][number]) => MorrowPackage['experienceItems'][number],
  ) => void
}) {
  const [draft, setDraft] = useState({
    title: '',
    role: 'planned' as ExperienceRole,
    confirmationStatus: 'planned' as MorrowPackage['experienceItems'][number]['confirmationStatus'],
    includedInPrice: false,
    providerId: '',
    providerName: '',
    guestNotes: '',
  })

  useEffect(() => {
    if (!item) return
    setDraft({
      title: item.title,
      role: item.role,
      confirmationStatus: item.confirmationStatus,
      includedInPrice: item.includedInPrice,
      providerId: item.providerId ?? '',
      providerName: item.providerName ?? '',
      guestNotes: item.guestNotes,
    })
  }, [item])

  if (!item || !packageItem) return null

  const updateDraft = (key: keyof typeof draft, value: string | boolean) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }
  const save = () => {
    onUpdateExperience(packageItem.id, item.id, (experience) => ({
      ...experience,
      title: draft.title,
      role: draft.role,
      confirmationStatus: draft.confirmationStatus,
      includedInPrice: draft.includedInPrice,
      providerId: draft.providerId || undefined,
      providerName: draft.providerId
        ? providers.find((provider) => provider.id === draft.providerId)?.name
        : draft.providerName.trim() || undefined,
      guestNotes: draft.guestNotes,
    }))
    onClose()
  }

  return (
    <aside className="admin-drawer-shell" aria-label="Erlebnis bearbeiten">
      <button className="admin-drawer-backdrop" type="button" aria-label="Schließen" onClick={onClose} />
      <section className="admin-drawer">
        <header className="admin-drawer-header">
          <div>
            <span>{packageItem.name} · {audienceLabel(packageItem.audience)}</span>
            <h2>{item.title}</h2>
            <p>Erlebnisbaustein, Anbieterbezug und operativen Status bearbeiten.</p>
          </div>
          <button className="admin-icon-button" type="button" aria-label="Schließen" onClick={onClose}><CloseLine size={18} /></button>
        </header>

        <div className="admin-drawer-body">
          <section className="admin-drawer-form" aria-label="Erlebnisdaten bearbeiten">
            <h3>Erlebnis</h3>
            <label>Titel
              <input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} />
            </label>
            <label>Anbieter
              <select value={draft.providerId} onChange={(event) => updateDraft('providerId', event.target.value)}>
                <option value="">Noch nicht verbunden</option>
                {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
              </select>
            </label>
            {!draft.providerId && (
              <label>Anbietername ohne Profil
                <input value={draft.providerName} onChange={(event) => updateDraft('providerName', event.target.value)} placeholder="z. B. Watt & Wind" />
              </label>
            )}
            <label>Rolle in der Auszeit
              <select value={draft.role} onChange={(event) => updateDraft('role', event.target.value as ExperienceRole)}>
                <option value="included">Enthalten</option>
                <option value="optional">Optional</option>
                <option value="recommendation">Empfehlung</option>
                <option value="planned">Geplant</option>
              </select>
            </label>
            <label>Status
              <select value={draft.confirmationStatus} onChange={(event) => updateDraft('confirmationStatus', event.target.value as MorrowPackage['experienceItems'][number]['confirmationStatus'])}>
                <option value="planned">Geplant</option>
                <option value="requested">Angefragt</option>
                <option value="confirmed">Bestätigt</option>
              </select>
            </label>
            <label>Im Preis enthalten
              <select value={draft.includedInPrice ? 'yes' : 'no'} onChange={(event) => updateDraft('includedInPrice', event.target.value === 'yes')}>
                <option value="yes">Ja</option>
                <option value="no">Nein</option>
              </select>
            </label>
            <label>Hinweis für Gäste
              <textarea rows={5} value={draft.guestNotes} onChange={(event) => updateDraft('guestNotes', event.target.value)} />
            </label>
          </section>
        </div>

        <footer className="admin-drawer-actions">
          <button className="admin-action primary" type="button" onClick={save}>Speichern</button>
          <button className="admin-action" type="button" onClick={onClose}>Schließen</button>
        </footer>
      </section>
    </aside>
  )
}

function ExperienceProviderDrawer({
  provider,
  linkedExperiences,
  onClose,
  onDeleteProvider,
  onOpenExperience,
  onUpdateProvider,
}: {
  provider: ExperienceProviderProfile | null
  linkedExperiences: Array<MorrowPackage['experienceItems'][number] & {
    packageId: string
    packageName: string
    packageAudience: Audience
  }>
  onClose: () => void
  onDeleteProvider: (id: string) => void
  onOpenExperience: (packageId: string, experienceId: string) => void
  onUpdateProvider: (id: string, updates: Partial<ExperienceProviderProfile>) => void
}) {
  const [draft, setDraft] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    location: '',
    category: '',
    audienceFit: 'Beide' as ExperienceProviderProfile['audienceFit'],
    status: 'lead' as ExperienceProviderStatus,
    notes: '',
  })

  useEffect(() => {
    if (!provider) return
    setDraft({
      name: provider.name,
      contactName: provider.contactName,
      email: provider.email,
      phone: provider.phone,
      location: provider.location,
      category: provider.category,
      audienceFit: provider.audienceFit,
      status: provider.status,
      notes: provider.notes,
    })
  }, [provider])

  if (!provider) return null

  const updateDraft = (key: keyof typeof draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }
  const save = () => {
    onUpdateProvider(provider.id, draft)
    onClose()
  }

  return (
    <aside className="admin-drawer-shell" aria-label="Erlebnisanbieter bearbeiten">
      <button className="admin-drawer-backdrop" type="button" aria-label="Schließen" onClick={onClose} />
      <section className="admin-drawer">
        <header className="admin-drawer-header">
          <div>
            <span>{provider.category} · {provider.location}</span>
            <h2>{provider.name}</h2>
            <p>Anbieterprofil und verbundene Erlebnisbausteine pflegen.</p>
          </div>
          <button className="admin-icon-button" type="button" aria-label="Schließen" onClick={onClose}><CloseLine size={18} /></button>
        </header>

        <div className="admin-drawer-body">
          <section className="admin-drawer-form" aria-label="Anbieterprofil bearbeiten">
            <h3>Anbieterprofil</h3>
            <label>Name
              <input value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} />
            </label>
            <label>Status
              <select value={draft.status} onChange={(event) => updateDraft('status', event.target.value)}>
                <option value="lead">Lead</option>
                <option value="in-review">In Prüfung</option>
                <option value="partner">Partner</option>
                <option value="paused">Pausiert</option>
              </select>
            </label>
            <label>Ansprechpartner
              <input value={draft.contactName} onChange={(event) => updateDraft('contactName', event.target.value)} />
            </label>
            <label>Geeignet für
              <select value={draft.audienceFit} onChange={(event) => updateDraft('audienceFit', event.target.value)}>
                <option value="Familien">Familien</option>
                <option value="Paare">Paare</option>
                <option value="Beide">Beide</option>
              </select>
            </label>
            <label>E-Mail
              <input type="email" value={draft.email} onChange={(event) => updateDraft('email', event.target.value)} />
            </label>
            <label>Telefon
              <input type="tel" value={draft.phone} onChange={(event) => updateDraft('phone', event.target.value)} />
            </label>
            <label>Ort
              <input value={draft.location} onChange={(event) => updateDraft('location', event.target.value)} />
            </label>
            <label>Kategorie
              <input value={draft.category} onChange={(event) => updateDraft('category', event.target.value)} />
            </label>
            <label>Interne Notiz
              <textarea rows={5} value={draft.notes} onChange={(event) => updateDraft('notes', event.target.value)} />
            </label>
          </section>

          <section className="admin-drawer-section" aria-label="Verknüpfte Erlebnisse">
            <h3>Verknüpfte Erlebnisse</h3>
            <div className="admin-linked-list">
              {linkedExperiences.length === 0 && <p className="admin-empty-note">Noch kein Erlebnisbaustein verbunden.</p>}
              {linkedExperiences.map((experience) => (
                <article key={experience.id}>
                  <strong>{experience.title}</strong>
                  <span>{experience.packageName} · {experienceRoleLabel(experience.role)} · {experienceConfirmationLabel(experience.confirmationStatus)}</span>
                  <button className="admin-row-action" type="button" onClick={() => onOpenExperience(experience.packageId, experience.id)}>Erlebnis öffnen</button>
                </article>
              ))}
            </div>
          </section>
        </div>

        <footer className="admin-drawer-actions">
          <button className="admin-action primary" type="button" onClick={save}>Speichern</button>
          <a className="admin-action" href={`mailto:${draft.email}`}>E-Mail öffnen</a>
          <button className="admin-action danger" type="button" onClick={() => onDeleteProvider(provider.id)}>Entfernen</button>
        </footer>
      </section>
    </aside>
  )
}

function OwnerPropertyDrawer({
  property,
  linkedPackages,
  onClose,
  onDeleteProperty,
  onOpenPackage,
  onUpdateProperty,
}: {
  property: OwnerPropertyProfile | null
  linkedPackages: MorrowPackage[]
  onClose: () => void
  onDeleteProperty: (id: string) => void
  onOpenPackage: (id: string) => void
  onUpdateProperty: (id: string, updates: Partial<OwnerPropertyProfile>) => void
}) {
  const [draft, setDraft] = useState({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    location: '',
    propertyType: '',
    sleeps: '',
    status: 'lead' as OwnerPropertyStatus,
    currentRental: 'agency' as OwnerLead['currentRental'],
    checkInType: 'unknown' as Stay['checkInType'],
    latestArrival: '',
    notes: '',
  })

  useEffect(() => {
    if (!property) return
    setDraft({
      name: property.name,
      ownerName: property.ownerName,
      email: property.email,
      phone: property.phone,
      location: property.location,
      propertyType: property.propertyType,
      sleeps: String(property.sleeps),
      status: property.status,
      currentRental: property.currentRental,
      checkInType: property.checkInType,
      latestArrival: property.latestArrival,
      notes: property.notes,
    })
  }, [property])

  if (!property) return null

  const updateDraft = (key: keyof typeof draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }
  const save = () => {
    const sleeps = Number.parseInt(draft.sleeps, 10)
    onUpdateProperty(property.id, {
      ...draft,
      sleeps: Number.isNaN(sleeps) ? property.sleeps : sleeps,
    })
    onClose()
  }

  return (
    <aside className="admin-drawer-shell" aria-label="Eigentümerobjekt bearbeiten">
      <button className="admin-drawer-backdrop" type="button" aria-label="Schließen" onClick={onClose} />
      <section className="admin-drawer">
        <header className="admin-drawer-header">
          <div>
            <span>{property.propertyType} · {property.location}</span>
            <h2>{property.name}</h2>
            <p>Objektprofil, Eigentümerkontakt und Anreiseinformationen pflegen.</p>
          </div>
          <button className="admin-icon-button" type="button" aria-label="Schließen" onClick={onClose}><CloseLine size={18} /></button>
        </header>

        <div className="admin-drawer-body">
          <section className="admin-drawer-form" aria-label="Objektprofil bearbeiten">
            <h3>Objektprofil</h3>
            <label>Objektname
              <input value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} />
            </label>
            <label>Status
              <select value={draft.status} onChange={(event) => updateDraft('status', event.target.value)}>
                <option value="lead">Lead</option>
                <option value="in-review">In Prüfung</option>
                <option value="active">Aktiv</option>
                <option value="paused">Pausiert</option>
              </select>
            </label>
            <label>Eigentümer
              <input value={draft.ownerName} onChange={(event) => updateDraft('ownerName', event.target.value)} />
            </label>
            <label>Objekttyp
              <input value={draft.propertyType} onChange={(event) => updateDraft('propertyType', event.target.value)} />
            </label>
            <label>E-Mail
              <input type="email" value={draft.email} onChange={(event) => updateDraft('email', event.target.value)} />
            </label>
            <label>Telefon
              <input type="tel" value={draft.phone} onChange={(event) => updateDraft('phone', event.target.value)} />
            </label>
            <label>Ort
              <input value={draft.location} onChange={(event) => updateDraft('location', event.target.value)} />
            </label>
            <label>Schlafplätze
              <input inputMode="numeric" value={draft.sleeps} onChange={(event) => updateDraft('sleeps', event.target.value)} />
            </label>
            <label>Aktuelle Vermietung
              <select value={draft.currentRental} onChange={(event) => updateDraft('currentRental', event.target.value)}>
                <option value="self">Selbst</option>
                <option value="agency">Agentur</option>
                <option value="platforms">Plattformen</option>
                <option value="not-yet">Noch nicht</option>
              </select>
            </label>
            <label>Schlüsselübergabe
              <select value={draft.checkInType} onChange={(event) => updateDraft('checkInType', event.target.value)}>
                <option value="key_safe">Schlüsselsafe</option>
                <option value="agency_pickup">Abholung bei Agentur</option>
                <option value="personal_handover">Persönliche Übergabe</option>
                <option value="smartlock">Smartlock</option>
                <option value="unknown">Noch offen</option>
              </select>
            </label>
            <label>Anreise möglich bis
              <input value={draft.latestArrival} onChange={(event) => updateDraft('latestArrival', event.target.value)} />
            </label>
            <label>Interne Notiz
              <textarea rows={5} value={draft.notes} onChange={(event) => updateDraft('notes', event.target.value)} />
            </label>
          </section>

          <section className="admin-drawer-section" aria-label="Verknüpfte Auszeiten">
            <h3>Verknüpfte Auszeiten</h3>
            <div className="admin-linked-list">
              {linkedPackages.length === 0 && <p className="admin-empty-note">Noch keine Auszeit verbunden.</p>}
              {linkedPackages.map((pkg) => (
                <article key={pkg.id}>
                  <strong>{pkg.name}</strong>
                  <span>{audienceLabel(pkg.audience)} · {pkg.concretePrice} · {pkg.dates.length} Termine</span>
                  <button className="admin-row-action" type="button" onClick={() => onOpenPackage(pkg.id)}>Auszeit öffnen</button>
                </article>
              ))}
            </div>
          </section>
        </div>

        <footer className="admin-drawer-actions">
          <button className="admin-action primary" type="button" onClick={save}>Speichern</button>
          <a className="admin-action" href={`mailto:${draft.email}`}>E-Mail öffnen</a>
          <button className="admin-action danger" type="button" onClick={() => onDeleteProperty(property.id)}>Entfernen</button>
        </footer>
      </section>
    </aside>
  )
}

function AgencyDrawer({
  agency,
  properties,
  onClose,
  onDeleteAgency,
  onOpenProperty,
  onUpdateAgency,
}: {
  agency: AgencyProfile | null
  properties: OwnerPropertyProfile[]
  onClose: () => void
  onDeleteAgency: (id: string) => void
  onOpenProperty: (id: string) => void
  onUpdateAgency: (id: string, updates: Partial<AgencyProfile>) => void
}) {
  const [draft, setDraft] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    location: '',
    status: 'lead' as AgencyStatus,
    managedPropertyIds: [] as string[],
    responseDueDays: '2',
    availableDatesNote: '',
    notes: '',
  })

  useEffect(() => {
    if (!agency) return
    setDraft({
      name: agency.name,
      contactName: agency.contactName,
      email: agency.email,
      phone: agency.phone,
      location: agency.location,
      status: agency.status,
      managedPropertyIds: agency.managedPropertyIds,
      responseDueDays: String(agency.responseDueDays),
      availableDatesNote: agency.availableDatesNote,
      notes: agency.notes,
    })
  }, [agency])

  if (!agency) return null

  const updateDraft = (key: keyof typeof draft, value: string | string[]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }
  const toggleProperty = (propertyId: string) => {
    updateDraft('managedPropertyIds', draft.managedPropertyIds.includes(propertyId)
      ? draft.managedPropertyIds.filter((id) => id !== propertyId)
      : [...draft.managedPropertyIds, propertyId])
  }
  const save = () => {
    const responseDueDays = Number.parseInt(draft.responseDueDays, 10)
    onUpdateAgency(agency.id, {
      ...draft,
      responseDueDays: Number.isNaN(responseDueDays) ? agency.responseDueDays : responseDueDays,
    })
    onClose()
  }

  return (
    <aside className="admin-drawer-shell" aria-label="Agentur bearbeiten">
      <button className="admin-drawer-backdrop" type="button" aria-label="Schließen" onClick={onClose} />
      <section className="admin-drawer">
        <header className="admin-drawer-header">
          <div>
            <span>{agency.location} · {agencyStatusLabel(agency.status)}</span>
            <h2>{agency.name}</h2>
            <p>Agenturkontakt, Objektzugang, freie Termine und Rückmeldefristen pflegen.</p>
          </div>
          <button className="admin-icon-button" type="button" aria-label="Schließen" onClick={onClose}><CloseLine size={18} /></button>
        </header>

        <div className="admin-drawer-body">
          <section className="admin-drawer-form" aria-label="Agenturprofil bearbeiten">
            <h3>Agenturprofil</h3>
            <label>Name
              <input value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} />
            </label>
            <label>Status
              <select value={draft.status} onChange={(event) => updateDraft('status', event.target.value)}>
                <option value="lead">Lead</option>
                <option value="active">Aktiv</option>
                <option value="paused">Pausiert</option>
              </select>
            </label>
            <label>Ansprechpartner
              <input value={draft.contactName} onChange={(event) => updateDraft('contactName', event.target.value)} />
            </label>
            <label>Ort
              <input value={draft.location} onChange={(event) => updateDraft('location', event.target.value)} />
            </label>
            <label>E-Mail
              <input type="email" value={draft.email} onChange={(event) => updateDraft('email', event.target.value)} />
            </label>
            <label>Telefon
              <input type="tel" value={draft.phone} onChange={(event) => updateDraft('phone', event.target.value)} />
            </label>
            <label>Rückmeldung in Tagen
              <input inputMode="numeric" value={draft.responseDueDays} onChange={(event) => updateDraft('responseDueDays', event.target.value)} />
            </label>
            <label>Freie Termine / Verfügbarkeit
              <textarea rows={4} value={draft.availableDatesNote} onChange={(event) => updateDraft('availableDatesNote', event.target.value)} />
            </label>
            <label>Interne Notiz
              <textarea rows={5} value={draft.notes} onChange={(event) => updateDraft('notes', event.target.value)} />
            </label>
          </section>

          <section className="admin-drawer-section" aria-label="Betreute Objekte">
            <h3>Betreute Objekte</h3>
            <div className="admin-checkbox-list">
              {properties.length === 0 && <p className="admin-empty-note">Noch keine Objektprofile vorhanden.</p>}
              {properties.map((property) => (
                <article key={property.id}>
                  <label>
                    <input type="checkbox" checked={draft.managedPropertyIds.includes(property.id)} onChange={() => toggleProperty(property.id)} />
                    <span>
                      <strong>{property.name}</strong>
                      {property.propertyType} · {property.location} · {property.sleeps} Personen
                    </span>
                  </label>
                  <button className="admin-row-action" type="button" onClick={() => onOpenProperty(property.id)}>Öffnen</button>
                </article>
              ))}
            </div>
          </section>
        </div>

        <footer className="admin-drawer-actions">
          <button className="admin-action primary" type="button" onClick={save}>Speichern</button>
          <a className="admin-action" href={`mailto:${draft.email}`}>E-Mail öffnen</a>
          <button className="admin-action danger" type="button" onClick={() => onDeleteAgency(agency.id)}>Entfernen</button>
        </footer>
      </section>
    </aside>
  )
}

function LocalPlaceDrawer({
  place,
  onClose,
  onDeletePlace,
  onUpdatePlace,
}: {
  place: LocalPlaceCandidate | null
  onClose: () => void
  onDeletePlace: (id: string) => void
  onUpdatePlace: (id: string, updates: Partial<LocalPlaceCandidate>) => void
}) {
  const [draft, setDraft] = useState({
    category: 'food' as Exclude<LocalPlaceCategory, 'all'>,
    label: 'Essen',
    title: '',
    description: '',
    meta: '',
    address: '',
    phone: '',
    email: '',
    websiteUrl: '',
    reservationUrl: '',
    photoUrls: '',
    openingHours: '',
    eventStartDate: '',
    eventEndDate: '',
    eventTime: '',
    eventAudience: '' as LocalPlaceCandidate['eventAudience'] | '',
    eventSetting: '' as LocalPlaceCandidate['eventSetting'] | '',
    eventFitNote: '',
    audiences: [] as LocalPlaceCandidate['audiences'],
    ageMin: '',
    ageNote: '',
    packageFit: [] as LocalPlaceCandidate['packageFit'],
    setting: '' as LocalPlaceCandidate['setting'] | '',
    intensity: '' as LocalPlaceCandidate['intensity'] | '',
    experienceAccess: '' as LocalPlaceCandidate['experienceAccess'] | '',
    weatherDependent: false,
    routeNote: '',
    status: 'candidate' as LocalPlaceStatus,
    sourceUrl: '',
    lat: '',
    lng: '',
  })

  useEffect(() => {
    if (!place) return
    setDraft({
      category: place.category,
      label: place.label,
      title: place.title,
      description: place.description,
      meta: place.meta,
      address: place.address ?? '',
      phone: place.phone ?? '',
      email: place.email ?? '',
      websiteUrl: place.websiteUrl ?? '',
      reservationUrl: place.reservationUrl ?? '',
      photoUrls: place.photoUrls?.join('\n') ?? '',
      openingHours: place.openingHours ?? '',
      eventStartDate: place.eventStartDate ?? '',
      eventEndDate: place.eventEndDate ?? '',
      eventTime: place.eventTime ?? '',
      eventAudience: place.eventAudience ?? '',
      eventSetting: place.eventSetting ?? '',
      eventFitNote: place.eventFitNote ?? '',
      audiences: place.audiences ?? [],
      ageMin: typeof place.ageMin === 'number' ? String(place.ageMin) : '',
      ageNote: place.ageNote ?? '',
      packageFit: place.packageFit ?? [],
      setting: place.setting ?? '',
      intensity: place.intensity ?? '',
      experienceAccess: place.experienceAccess ?? '',
      weatherDependent: Boolean(place.weatherDependent),
      routeNote: place.routeNote,
      status: place.status,
      sourceUrl: place.sourceUrl ?? '',
      lat: place.lat ? String(place.lat) : '',
      lng: place.lng ? String(place.lng) : '',
    })
  }, [place])

  if (!place) return null

  const updateDraft = (key: keyof typeof draft, value: string) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
      ...(key === 'category' ? { label: localPlaceCategoryLabels[value as LocalPlaceCategory] ?? current.label } : {}),
    }))
  }
  const toggleDraftAudience = (value: NonNullable<LocalPlaceCandidate['audiences']>[number]) => {
    setDraft((current) => {
      const currentValues = current.audiences ?? []
      return {
        ...current,
        audiences: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      }
    })
  }
  const toggleDraftPackageFit = (value: NonNullable<LocalPlaceCandidate['packageFit']>[number]) => {
    setDraft((current) => {
      const currentValues = current.packageFit ?? []
      return {
        ...current,
        packageFit: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      }
    })
  }
  const save = () => {
    const lat = Number.parseFloat(draft.lat.replace(',', '.'))
    const lng = Number.parseFloat(draft.lng.replace(',', '.'))
    const ageMin = Number.parseInt(draft.ageMin, 10)
    onUpdatePlace(place.id, {
      category: draft.category,
      label: draft.label,
      title: draft.title,
      description: draft.description,
      meta: draft.meta,
      address: draft.address.trim() || undefined,
      phone: draft.phone.trim() || undefined,
      email: draft.email.trim() || undefined,
      websiteUrl: draft.websiteUrl.trim() || undefined,
      reservationUrl: draft.reservationUrl.trim() || undefined,
      photoUrls: draft.photoUrls.split('\n').map((url) => url.trim()).filter(Boolean),
      openingHours: draft.openingHours.trim() || undefined,
      eventStartDate: draft.category === 'event' ? draft.eventStartDate.trim() || undefined : undefined,
      eventEndDate: draft.category === 'event' ? draft.eventEndDate.trim() || undefined : undefined,
      eventTime: draft.category === 'event' ? draft.eventTime.trim() || undefined : undefined,
      eventAudience: draft.category === 'event' ? draft.eventAudience || undefined : undefined,
      eventSetting: draft.category === 'event' ? draft.eventSetting || undefined : undefined,
      eventFitNote: draft.category === 'event' ? draft.eventFitNote.trim() || undefined : undefined,
      audiences: draft.category === 'experience' ? draft.audiences : undefined,
      ageMin: draft.category === 'experience' && !Number.isNaN(ageMin) ? ageMin : undefined,
      ageNote: draft.category === 'experience' ? draft.ageNote.trim() || undefined : undefined,
      packageFit: ['experience', 'event'].includes(draft.category) ? draft.packageFit : undefined,
      setting: draft.category === 'experience' ? draft.setting || undefined : undefined,
      intensity: draft.category === 'experience' ? draft.intensity || undefined : undefined,
      experienceAccess: draft.category === 'experience' ? draft.experienceAccess || undefined : undefined,
      weatherDependent: draft.category === 'experience' ? draft.weatherDependent : undefined,
      routeNote: draft.routeNote,
      status: draft.status === 'approved' && draftReviewIssues.length > 0 ? 'candidate' : draft.status,
      sourceUrl: draft.sourceUrl.trim() || undefined,
      lat: Number.isNaN(lat) ? undefined : lat,
      lng: Number.isNaN(lng) ? undefined : lng,
    })
    onClose()
  }
  const draftLat = Number.parseFloat(draft.lat.replace(',', '.'))
  const draftLng = Number.parseFloat(draft.lng.replace(',', '.'))
  const draftReviewPlace: LocalPlaceCandidate = {
    ...place,
    category: draft.category,
    title: draft.title,
    description: draft.description,
    routeNote: draft.routeNote,
    sourceUrl: draft.sourceUrl || undefined,
    openingHours: draft.openingHours || undefined,
    eventStartDate: draft.eventStartDate || undefined,
    eventAudience: draft.eventAudience as LocalPlaceCandidate['eventAudience'],
    eventSetting: draft.eventSetting as LocalPlaceCandidate['eventSetting'],
    eventFitNote: draft.eventFitNote || undefined,
    experienceAccess: draft.experienceAccess as LocalPlaceCandidate['experienceAccess'],
    lat: Number.isNaN(draftLat) ? undefined : draftLat,
    lng: Number.isNaN(draftLng) ? undefined : draftLng,
  }
  const draftReviewIssues = localPlaceReviewIssues(draftReviewPlace)

  return (
    <aside className="admin-drawer-shell" aria-label="Lokalen Ort bearbeiten">
      <button className="admin-drawer-backdrop" type="button" aria-label="Schließen" onClick={onClose} />
      <section className="admin-drawer">
        <header className="admin-drawer-header">
          <div>
            <span>{localPlaceCategoryLabels[place.category]} · {localPlaceStatusLabel(place.status)}</span>
            <h2>{place.title}</h2>
            <p>Kandidat prüfen, Quelle sichern und erst nach Kuratierung für Gäste freigeben.</p>
          </div>
          <button className="admin-icon-button" type="button" aria-label="Schließen" onClick={onClose}><CloseLine size={18} /></button>
        </header>

        <div className="admin-drawer-body">
          <section className="admin-drawer-form" aria-label="Lokalen Ort bearbeiten">
            <h3>Ort</h3>
            <label>Name
              <input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} />
            </label>
            <label>Kategorie
              <select value={draft.category} onChange={(event) => updateDraft('category', event.target.value)}>
                {Object.entries(localPlaceCategoryLabels)
                  .filter(([value]) => value !== 'all')
                  .map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>Status
              <select value={draft.status} onChange={(event) => updateDraft('status', event.target.value)}>
                <option value="candidate">Kandidat</option>
                <option value="approved" disabled={draftReviewIssues.length > 0}>Freigegeben</option>
                <option value="paused">Pausiert</option>
                <option value="rejected">Nicht passend</option>
              </select>
            </label>
            <label>Kurzlabel
              <input value={draft.label} onChange={(event) => updateDraft('label', event.target.value)} />
            </label>
            <label>Meta
              <input value={draft.meta} onChange={(event) => updateDraft('meta', event.target.value)} />
            </label>
            <label>Adresse
              <input value={draft.address} onChange={(event) => updateDraft('address', event.target.value)} />
            </label>
            <label>Telefon
              <input type="tel" value={draft.phone} onChange={(event) => updateDraft('phone', event.target.value)} />
            </label>
            <label>E-Mail
              <input type="email" value={draft.email} onChange={(event) => updateDraft('email', event.target.value)} />
            </label>
            <label>Website
              <input type="url" value={draft.websiteUrl} onChange={(event) => updateDraft('websiteUrl', event.target.value)} />
            </label>
            <label>Reservierungslink
              <input type="url" value={draft.reservationUrl} onChange={(event) => updateDraft('reservationUrl', event.target.value)} placeholder="z. B. OpenTable, Formitable oder eigene Reservierungsseite" />
            </label>
            <label>Bild-URLs
              <textarea rows={4} value={draft.photoUrls} onChange={(event) => updateDraft('photoUrls', event.target.value)} placeholder="Eine Bild-URL pro Zeile, idealerweise von der offiziellen Partnerseite" />
            </label>
            <label>Öffnungszeiten
              <textarea rows={3} value={draft.openingHours} onChange={(event) => updateDraft('openingHours', event.target.value)} placeholder="z. B. täglich 12:00-21:00 Uhr oder saisonal prüfen" />
            </label>
            {draft.category === 'event' && (
              <section className="admin-drawer-form-wide admin-drawer-note admin-experience-fit-editor" aria-label="Veranstaltungs-Passung">
                <h3>Veranstaltungs-Passung</h3>
                <div className="admin-drawer-form admin-drawer-form-wide">
                  <label>Startdatum
                    <input type="date" value={draft.eventStartDate} onChange={(event) => updateDraft('eventStartDate', event.target.value)} />
                  </label>
                  <label>Enddatum
                    <input type="date" value={draft.eventEndDate} onChange={(event) => updateDraft('eventEndDate', event.target.value)} />
                  </label>
                  <label>Uhrzeit / Zeitraum
                    <input value={draft.eventTime} onChange={(event) => updateDraft('eventTime', event.target.value)} placeholder="z. B. 14:00-18:00 Uhr" />
                  </label>
                  <label>Zielgruppe
                    <select value={draft.eventAudience} onChange={(event) => updateDraft('eventAudience', event.target.value)}>
                      <option value="">Offen</option>
                      {Object.entries(localEventAudienceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                  <label>Indoor / Outdoor
                    <select value={draft.eventSetting} onChange={(event) => updateDraft('eventSetting', event.target.value)}>
                      <option value="">Offen</option>
                      {Object.entries(localEventSettingLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                  <label>Warum passend?
                    <textarea rows={3} value={draft.eventFitNote} onChange={(event) => updateDraft('eventFitNote', event.target.value)} placeholder="Kurze Morrow-Einschätzung, wann dieses Event wirklich zur Auszeit passt." />
                  </label>
                </div>
                <div className="admin-checkbox-list">
                  <article>
                    <span>
                      <strong>Passende Auszeiten</strong>
                      Leer bedeutet: Das Event kann für alle Auszeiten erscheinen, sofern Datum und Zielgruppe passen.
                    </span>
                    {Object.entries(localExperiencePackageFitLabels).map(([value, label]) => (
                      <label key={value}>
                        <input
                          type="checkbox"
                          checked={draft.packageFit?.includes(value as NonNullable<typeof draft.packageFit>[number])}
                          onChange={() => toggleDraftPackageFit(value as NonNullable<typeof draft.packageFit>[number])}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </article>
                </div>
              </section>
            )}
            {draft.category === 'experience' && (
              <section className="admin-drawer-form-wide admin-drawer-note admin-experience-fit-editor" aria-label="Erlebnis-Passung">
                <h3>Erlebnis-Passung</h3>
                <div className="admin-checkbox-list">
                  <article>
                    <span>
                      <strong>Zielgruppen</strong>
                      Für wen dieses Erlebnis grundsätzlich geeignet ist.
                    </span>
                    {Object.entries(localExperienceAudienceLabels).map(([value, label]) => (
                      <label key={value}>
                        <input
                          type="checkbox"
                          checked={draft.audiences?.includes(value as NonNullable<typeof draft.audiences>[number])}
                          onChange={() => toggleDraftAudience(value as NonNullable<typeof draft.audiences>[number])}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </article>
                  <article>
                    <span>
                      <strong>Passende Auszeiten</strong>
                      Für welche Pakete der Kandidat kuratiert werden kann.
                    </span>
                    {Object.entries(localExperiencePackageFitLabels).map(([value, label]) => (
                      <label key={value}>
                        <input
                          type="checkbox"
                          checked={draft.packageFit?.includes(value as NonNullable<typeof draft.packageFit>[number])}
                          onChange={() => toggleDraftPackageFit(value as NonNullable<typeof draft.packageFit>[number])}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </article>
                </div>
                <div className="admin-drawer-form admin-drawer-form-wide">
                  <label>Mindestalter
                    <input inputMode="numeric" value={draft.ageMin} onChange={(event) => updateDraft('ageMin', event.target.value)} placeholder="z. B. 6" />
                  </label>
                  <label>Altershinweis
                    <input value={draft.ageNote} onChange={(event) => updateDraft('ageNote', event.target.value)} placeholder="z. B. ab 6 Jahren sinnvoll" />
                  </label>
                  <label>Indoor / Outdoor
                    <select value={draft.setting} onChange={(event) => updateDraft('setting', event.target.value)}>
                      <option value="">Offen</option>
                      {Object.entries(localExperienceSettingLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                  <label>Aktivität
                    <select value={draft.intensity} onChange={(event) => updateDraft('intensity', event.target.value)}>
                      <option value="">Offen</option>
                      {Object.entries(localExperienceIntensityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                  <label>Art für Gäste
                    <select value={draft.experienceAccess} onChange={(event) => updateDraft('experienceAccess', event.target.value)}>
                      <option value="">Offen</option>
                      {Object.entries(localExperienceAccessLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                  <label className="admin-checkbox-inline">
                    <input type="checkbox" checked={draft.weatherDependent} onChange={(event) => setDraft((current) => ({ ...current, weatherDependent: event.target.checked }))} />
                    <span>Wetterabhängig</span>
                  </label>
                </div>
              </section>
            )}
            <label>Beschreibung für Gäste
              <textarea rows={4} value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} />
            </label>
            <label>Hinweis / Route
              <textarea rows={4} value={draft.routeNote} onChange={(event) => updateDraft('routeNote', event.target.value)} />
            </label>
            <label>Quelle
              <input type="url" value={draft.sourceUrl} onChange={(event) => updateDraft('sourceUrl', event.target.value)} />
            </label>
            <label>Latitude
              <input inputMode="decimal" value={draft.lat} onChange={(event) => updateDraft('lat', event.target.value)} />
            </label>
            <label>Longitude
              <input inputMode="decimal" value={draft.lng} onChange={(event) => updateDraft('lng', event.target.value)} />
            </label>
          </section>

          <section className="admin-drawer-section" aria-label="Freigabeprüfung">
            <h3>Freigabeprüfung</h3>
            {draftReviewIssues.length > 0 && (
              <div className="admin-review-issues" aria-label="Offene Prüfpunkte">
                {draftReviewIssues.map((issue) => <span key={issue}>{issue}</span>)}
              </div>
            )}
            {draftReviewIssues.length > 0 && <p className="admin-empty-note">Freigabe ist erst möglich, wenn diese Prüfpunkte gepflegt sind.</p>}
            <div className="admin-detail-grid">
              <article>
                <span>Gast-App</span>
                <strong>{draft.status === 'approved' && draft.lat && draft.lng ? 'Wird sichtbar' : 'Bleibt intern'}</strong>
              </article>
              <article>
                <span>Koordinaten</span>
                <strong>{draft.lat && draft.lng ? 'vorhanden' : 'offen'}</strong>
              </article>
              <article>
                <span>Adresse</span>
                <strong>{draft.address ? 'vorhanden' : 'offen'}</strong>
              </article>
              <article>
                <span>Quelle</span>
                <strong>{draft.sourceUrl ? 'vorhanden' : 'offen'}</strong>
              </article>
              <article>
                <span>Öffnungszeiten</span>
                <strong>{draft.openingHours ? 'vorhanden' : 'offen'}</strong>
              </article>
              <article>
                <span>Reservierung</span>
                <strong>{draft.reservationUrl ? 'vorhanden' : 'offen'}</strong>
              </article>
              <article>
                <span>Bilder</span>
                <strong>{draft.photoUrls.split('\n').filter((url) => url.trim()).length || 'offen'}</strong>
              </article>
            </div>
          </section>

          <section className="admin-drawer-section" aria-label="Gast-Vorschau">
            <h3>Gast-Vorschau</h3>
            <article className="admin-local-preview-card">
              {draft.photoUrls.split('\n').map((url) => url.trim()).filter(Boolean)[0] && (
                <img src={draft.photoUrls.split('\n').map((url) => url.trim()).filter(Boolean)[0]} alt="" loading="lazy" />
              )}
              <div>
                <span>{draft.label || localPlaceCategoryLabels[draft.category]}</span>
                <h4>{draft.title || 'Titel fehlt'}</h4>
                <p>{draft.description || 'Beschreibung für Gäste ergänzen.'}</p>
                <dl>
                  <div>
                    <dt>{draft.category === 'event' ? 'Termin' : 'Öffnungszeiten'}</dt>
                    <dd>{draft.openingHours || 'Noch offen'}</dd>
                  </div>
                  {draft.address && (
                    <div>
                      <dt>Adresse</dt>
                      <dd>{draft.address}</dd>
                    </div>
                  )}
                  {draft.category === 'event' && draft.eventFitNote && (
                    <div>
                      <dt>Passt, wenn</dt>
                      <dd>{draft.eventFitNote}</dd>
                    </div>
                  )}
                </dl>
                <small>{draft.routeNote || 'Hinweis für Gäste ergänzen.'}</small>
              </div>
            </article>
          </section>
        </div>

        <footer className="admin-drawer-actions">
          <button className="admin-action primary" type="button" onClick={save}>Speichern</button>
          <button className="admin-action" type="button" onClick={() => {
            onUpdatePlace(place.id, { status: 'approved' })
            onClose()
          }} disabled={draftReviewIssues.length > 0} title={draftReviewIssues.length > 0 ? draftReviewIssues.join(', ') : 'Für Gäste freigeben'}>Freigeben</button>
          <button className="admin-action" type="button" onClick={() => {
            onUpdatePlace(place.id, { status: 'rejected' })
            onClose()
          }}>Nicht passend</button>
          {draft.sourceUrl && <a className="admin-action" href={draft.sourceUrl} target="_blank" rel="noreferrer">Quelle öffnen</a>}
          <button className="admin-action danger" type="button" onClick={() => onDeletePlace(place.id)}>Entfernen</button>
        </footer>
      </section>
    </aside>
  )
}

function LeadDetailDrawer({
  lead,
  emailEvents,
  communicationEvents,
  leadLabel,
  onArchive,
  onClose,
  onCreateCommunicationEvent,
  onDelete,
  onOpenPartnerProfile,
  onUpdateLead,
}: {
  lead: StoredLead | null
  emailEvents: EmailEvent[]
  communicationEvents: CommunicationEvent[]
  leadLabel: (lead: StoredLead) => string
  onArchive: (id: string) => void
  onClose: () => void
  onCreateCommunicationEvent: (event: Omit<CommunicationEvent, 'id' | 'created_at' | 'status'> & { status?: string }) => void
  onDelete: (id: string) => void
  onOpenPartnerProfile: (lead: OwnerLead | ExperienceLead) => void
  onUpdateLead: (id: string, updates: Partial<StoredLead>) => void
}) {
  const [status, setStatus] = useState<LeadStatus>('Neu')
  const [internalNote, setInternalNote] = useState('')
  const [followUpAt, setFollowUpAt] = useState('')
  const [message, setMessage] = useState('')
  const [contactDraft, setContactDraft] = useState({ name: '', email: '', phone: '' })
  const [learningDraft, setLearningDraft] = useState<{
    source: LeadSource
    campaign: string
    lossReason: LeadLossReason | ''
    conversionNote: string
  }>({ source: 'Direkt', campaign: '', lossReason: '', conversionNote: '' })
  const [requestDraft, setRequestDraft] = useState<Record<string, string | boolean>>({})
  const [communicationDraft, setCommunicationDraft] = useState<{
    channel: CommunicationEvent['channel']
    direction: CommunicationEvent['direction']
    subject: string
    body: string
  }>({
    channel: 'phone',
    direction: 'outbound',
    subject: '',
    body: '',
  })

  useEffect(() => {
    if (!lead) return
    setStatus(lead.status)
    setInternalNote(lead.internalNote ?? '')
    setFollowUpAt(lead.followUpAt ?? '')
    setMessage(lead.message ?? '')
    setContactDraft({ name: lead.name, email: lead.email, phone: lead.phone })
    setLearningDraft({
      source: lead.source ?? 'Direkt',
      campaign: lead.campaign ?? '',
      lossReason: lead.lossReason ?? '',
      conversionNote: lead.conversionNote ?? '',
    })
    if (lead.type === 'guest') {
      setRequestDraft({
        selectedDate: lead.selectedDate,
        guests: lead.guests ?? '',
        adults: lead.adults ?? '',
        children: lead.children ?? '',
        childrenAges: lead.childrenAges ?? '',
        dog: lead.dog ?? '',
        occasion: lead.occasion ?? '',
        whatsappOptIn: lead.whatsappOptIn,
      })
    }
    if (lead.type === 'owner') {
      setRequestDraft({
        propertyLocation: lead.propertyLocation,
        propertyType: lead.propertyType,
        sleeps: lead.sleeps,
        currentRental: lead.currentRental,
        listingUrl: lead.listingUrl ?? '',
      })
    }
    if (lead.type === 'experience') {
      setRequestDraft({
        businessName: lead.businessName,
        location: lead.location,
        experienceType: lead.experienceType,
        audienceFit: lead.audienceFit,
        link: lead.link ?? '',
        description: lead.description,
      })
    }
  }, [lead])

  if (!lead) return null

  const emailTimelineEvents: CommunicationEvent[] = emailEvents.map((event) => ({
    id: `email-${event.id}`,
    lead_id: event.lead_id,
    channel: 'email',
    direction: event.event_type === 'internal_lead_notification' ? 'internal' : 'outbound',
    event_type: event.event_type,
    subject: emailEventTypeLabel(event.event_type),
    body: event.error_message,
    recipient: event.recipient,
    actor: event.event_type === 'internal_lead_notification' ? 'Morrow System' : 'Morrow',
    status: event.status,
    provider: 'resend',
    created_at: event.created_at,
  }))
  const communicationTimelineEvents = [...communicationEvents, ...emailTimelineEvents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const updateDraft = (key: string, value: string | boolean) => {
    setRequestDraft((current) => ({ ...current, [key]: value }))
  }
  const updateContactDraft = (key: keyof typeof contactDraft, value: string) => {
    setContactDraft((current) => ({ ...current, [key]: value }))
  }
  const updateLearningDraft = (key: keyof typeof learningDraft, value: string) => {
    setLearningDraft((current) => ({ ...current, [key]: value }))
  }
  const updateCommunicationDraft = (key: keyof typeof communicationDraft, value: string) => {
    setCommunicationDraft((current) => ({ ...current, [key]: value }))
  }
  const createManualCommunicationEvent = () => {
    const subject = communicationDraft.subject.trim()
    const body = communicationDraft.body.trim()
    if (!subject && !body) return

    const recipient = communicationDraft.channel === 'email'
      ? contactDraft.email
      : communicationDraft.channel === 'whatsapp' || communicationDraft.channel === 'phone'
        ? contactDraft.phone
        : undefined

    onCreateCommunicationEvent({
      lead_id: lead.id,
      leadId: lead.id,
      channel: communicationDraft.channel,
      direction: communicationDraft.direction,
      event_type: communicationDraft.channel === 'phone' ? 'call' : communicationDraft.channel === 'note' ? 'note' : 'manual',
      eventType: communicationDraft.channel === 'phone' ? 'call' : communicationDraft.channel === 'note' ? 'note' : 'manual',
      subject: subject || communicationChannelLabel(communicationDraft.channel),
      body,
      recipient,
      actor: 'Morrow Admin',
      status: 'recorded',
      payload: { source: 'admin_lead_drawer' },
    })
    setCommunicationDraft({ channel: 'phone', direction: 'outbound', subject: '', body: '' })
  }
  const save = () => {
    onUpdateLead(lead.id, {
      ...contactDraft,
      ...learningDraft,
      lossReason: learningDraft.lossReason || undefined,
      conversionNote: learningDraft.conversionNote || undefined,
      status,
      internalNote,
      followUpAt,
      message,
      ...requestDraft,
    } as Partial<StoredLead>)
  }
  const remove = () => {
    const confirmed = window.confirm('Diesen Lead wirklich löschen? Das sollte nur für Testdaten, Spam oder Dubletten genutzt werden.')
    if (confirmed) onDelete(lead.id)
  }
  const leadTypeLabel = lead.type === 'guest' ? 'Gastanfrage' : lead.type === 'owner' ? 'Eigentümeranfrage' : 'Erlebnisanbieteranfrage'
  const contactRows: DetailRow[] = [
    { label: 'Erstellt', value: new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(lead.createdAt)) },
  ]
  const requestTitle = lead.type === 'guest' ? 'Anfrage bearbeiten' : lead.type === 'owner' ? 'Objekt bearbeiten' : 'Erlebnis bearbeiten'
  const renderRequestForm = () => {
    if (lead.type === 'guest') {
      return (
        <>
          <label>Termin
            <input value={String(requestDraft.selectedDate ?? '')} onChange={(event) => updateDraft('selectedDate', event.target.value)} />
          </label>
          <label>Gesamtpersonen
            <input value={String(requestDraft.guests ?? '')} onChange={(event) => updateDraft('guests', event.target.value)} />
          </label>
          <label>Erwachsene
            <input value={String(requestDraft.adults ?? '')} onChange={(event) => updateDraft('adults', event.target.value)} />
          </label>
          <label>Kinder
            <input value={String(requestDraft.children ?? '')} onChange={(event) => updateDraft('children', event.target.value)} />
          </label>
          <label>Kinderalter
            <input value={String(requestDraft.childrenAges ?? '')} onChange={(event) => updateDraft('childrenAges', event.target.value)} />
          </label>
          <label>Hund
            <input value={String(requestDraft.dog ?? '')} onChange={(event) => updateDraft('dog', event.target.value)} />
          </label>
          <label>Anlass
            <input value={String(requestDraft.occasion ?? '')} onChange={(event) => updateDraft('occasion', event.target.value)} />
          </label>
          <label>WhatsApp Zustimmung
            <select value={requestDraft.whatsappOptIn ? 'yes' : 'no'} onChange={(event) => updateDraft('whatsappOptIn', event.target.value === 'yes')}>
              <option value="yes">Ja</option>
              <option value="no">Nein</option>
            </select>
          </label>
        </>
      )
    }
    if (lead.type === 'owner') {
      return (
        <>
          <label>Objektort
            <input value={String(requestDraft.propertyLocation ?? '')} onChange={(event) => updateDraft('propertyLocation', event.target.value)} />
          </label>
          <label>Objekttyp
            <input value={String(requestDraft.propertyType ?? '')} onChange={(event) => updateDraft('propertyType', event.target.value)} />
          </label>
          <label>Schlafplätze
            <input value={String(requestDraft.sleeps ?? '')} onChange={(event) => updateDraft('sleeps', event.target.value)} />
          </label>
          <label>Aktuelle Vermietung
            <select value={String(requestDraft.currentRental ?? 'self')} onChange={(event) => updateDraft('currentRental', event.target.value)}>
              <option value="self">Selbst</option>
              <option value="agency">Agentur</option>
              <option value="platforms">Plattformen</option>
              <option value="not-yet">Noch nicht</option>
            </select>
          </label>
          <label>Inserat
            <input value={String(requestDraft.listingUrl ?? '')} onChange={(event) => updateDraft('listingUrl', event.target.value)} />
          </label>
        </>
      )
    }
    return (
      <>
        <label>Angebot / Unternehmen
          <input value={String(requestDraft.businessName ?? '')} onChange={(event) => updateDraft('businessName', event.target.value)} />
        </label>
        <label>Ort
          <input value={String(requestDraft.location ?? '')} onChange={(event) => updateDraft('location', event.target.value)} />
        </label>
        <label>Art des Erlebnisses
          <input value={String(requestDraft.experienceType ?? '')} onChange={(event) => updateDraft('experienceType', event.target.value)} />
        </label>
        <label>Geeignet für
          <select value={String(requestDraft.audienceFit ?? 'Beide')} onChange={(event) => updateDraft('audienceFit', event.target.value)}>
            <option value="Familien">Familien</option>
            <option value="Paare">Paare</option>
            <option value="Beide">Beide</option>
          </select>
        </label>
        <label>Link
          <input value={String(requestDraft.link ?? '')} onChange={(event) => updateDraft('link', event.target.value)} />
        </label>
        <label>Beschreibung
          <textarea rows={4} value={String(requestDraft.description ?? '')} onChange={(event) => updateDraft('description', event.target.value)} />
        </label>
      </>
    )
  }

  return (
    <aside className="admin-drawer-shell" aria-label="Lead Detail">
      <button className="admin-drawer-backdrop" type="button" aria-label="Schließen" onClick={onClose} />
      <section className="admin-drawer">
        <header className="admin-drawer-header">
          <div>
            <span>{leadTypeLabel}</span>
            <h2>{lead.name}</h2>
            <p>{leadLabel(lead)}</p>
          </div>
          <button className="admin-icon-button" type="button" aria-label="Schließen" onClick={onClose}><CloseLine size={18} /></button>
        </header>

        <div className="admin-drawer-body">
          <section className="admin-drawer-form" aria-label="CRM Bearbeitung">
            <h3>Bearbeitung</h3>
            <label>Status
              <select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)}>
                {leadStatuses.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>Wiedervorlage
              <input type="date" value={followUpAt} onChange={(e) => setFollowUpAt(e.target.value)} />
            </label>
            <label>Interne Notiz
              <textarea rows={5} value={internalNote} onChange={(e) => setInternalNote(e.target.value)} placeholder="Gespräch, nächster Schritt oder wichtige Einschätzung festhalten." />
            </label>
          </section>

          <section className="admin-drawer-form" aria-label="Anfrage bearbeiten">
            <h3>{requestTitle}</h3>
            {renderRequestForm()}
            <label>Nachricht
              <textarea rows={4} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Nachricht oder Kontext aus der Anfrage." />
            </label>
          </section>

          <section className="admin-drawer-form" aria-label="MVP Lernen">
            <h3>MVP-Lernen</h3>
            <label>Leadquelle
              <select value={learningDraft.source} onChange={(event) => updateLearningDraft('source', event.target.value)}>
                {leadSources.map((source) => <option key={source} value={source}>{source}</option>)}
              </select>
            </label>
            <label>Kampagne / Kontext
              <input value={learningDraft.campaign} onChange={(event) => updateLearningDraft('campaign', event.target.value)} placeholder="z. B. Meta Hamburg Familien Mai" />
            </label>
            <label>Verlustgrund
              <select value={learningDraft.lossReason} onChange={(event) => updateLearningDraft('lossReason', event.target.value)}>
                <option value="">Noch offen</option>
                {leadLossReasons.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
              </select>
            </label>
            <label>Conversion-Notiz
              <textarea rows={3} value={learningDraft.conversionNote} onChange={(event) => updateLearningDraft('conversionNote', event.target.value)} placeholder="Warum wurde gebucht, reserviert oder abgesagt?" />
            </label>
          </section>

          {lead.type !== 'guest' && (
            <section className="admin-drawer-section" aria-label="Partnerprofil">
              <h3>{lead.type === 'owner' ? 'Objektprofil' : 'Anbieterprofil'}</h3>
              <p className="admin-empty-note">
                Diese Anfrage bleibt als Eingang dokumentiert. Die laufende Partnerarbeit pflegst du danach im passenden Admin-Bereich.
              </p>
              <button className="admin-row-action" type="button" onClick={() => onOpenPartnerProfile(lead)}>
                {lead.type === 'owner' ? 'Objektprofil öffnen / anlegen' : 'Anbieterprofil öffnen / anlegen'}
              </button>
            </section>
          )}

          <section className="admin-drawer-form" aria-label="Kontakt bearbeiten">
            <h3>Kontakt</h3>
            <label>Name
              <input value={contactDraft.name} onChange={(event) => updateContactDraft('name', event.target.value)} />
            </label>
            <label>E-Mail
              <input type="email" value={contactDraft.email} onChange={(event) => updateContactDraft('email', event.target.value)} />
            </label>
            <label>Telefon
              <input type="tel" value={contactDraft.phone} onChange={(event) => updateContactDraft('phone', event.target.value)} />
            </label>
            <div className="admin-contact-actions">
              <a href={`mailto:${contactDraft.email}`}>E-Mail öffnen</a>
              <a href={`tel:${contactDraft.phone.replace(/\s/g, '')}`}>Anrufen</a>
            </div>
          </section>

          <section className="admin-drawer-section" aria-label="Systemdaten">
            <h3>Systemdaten</h3>
            <div className="admin-detail-grid">
              {contactRows.filter((row) => row.value !== undefined && row.value !== '').map((row) => (
                <article key={row.label}>
                  <span>{row.label}</span>
                  <strong>{String(row.value)}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-drawer-section" aria-label="Kommunikationshistorie">
            <h3>Kommunikationshistorie</h3>
            <div className="admin-communication-composer">
              <label>Kanal
                <select value={communicationDraft.channel} onChange={(event) => updateCommunicationDraft('channel', event.target.value)}>
                  <option value="phone">Telefon</option>
                  <option value="email">E-Mail</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="support">Support</option>
                  <option value="note">Notiz</option>
                </select>
              </label>
              <label>Richtung
                <select value={communicationDraft.direction} onChange={(event) => updateCommunicationDraft('direction', event.target.value)}>
                  <option value="outbound">Ausgang</option>
                  <option value="inbound">Eingang</option>
                  <option value="internal">Intern</option>
                </select>
              </label>
              <label>Betreff
                <input value={communicationDraft.subject} onChange={(event) => updateCommunicationDraft('subject', event.target.value)} placeholder="z. B. Rückruf zur Anfrage" />
              </label>
              <label className="wide">Notiz
                <textarea rows={3} value={communicationDraft.body} onChange={(event) => updateCommunicationDraft('body', event.target.value)} placeholder="Was wurde besprochen, gesendet oder vereinbart?" />
              </label>
              <button className="admin-row-action" type="button" onClick={createManualCommunicationEvent}>Eintrag speichern</button>
              <p>V2: E-Mails und WhatsApp-Templates werden direkt aus dieser Historie verschickt.</p>
            </div>
            {communicationTimelineEvents.length > 0 ? (
              <div className="admin-communication-events">
                {communicationTimelineEvents.map((event) => {
                  const eventType = event.event_type ?? event.eventType ?? 'note'
                  return (
                    <article key={event.id} className={`admin-communication-event ${event.provider === 'resend' ? emailEventStatusClass(event.status) : 'is-recorded'}`}>
                      <header>
                        <div>
                          <span>{communicationChannelLabel(event.channel)} · {communicationDirectionLabel(event.direction)}</span>
                          <strong>{event.provider === 'resend' ? emailEventTypeLabel(eventType) : event.subject || communicationChannelLabel(event.channel)}</strong>
                        </div>
                        <time>{formatAdminDateTime(event.created_at)}</time>
                      </header>
                      <p>{event.recipient || event.actor || emailEventStatusLabel(event.status)}</p>
                      {event.body && <small>{event.body}</small>}
                    </article>
                  )
                })}
              </div>
            ) : (
              <p className="admin-empty-note">Noch keine Kommunikation zu dieser Anfrage gespeichert.</p>
            )}
          </section>

        </div>

        <footer className="admin-drawer-actions">
          <button className="admin-action primary" type="button" onClick={save}>Speichern</button>
          {lead.archivedAt
            ? <button className="admin-action" type="button" onClick={() => onUpdateLead(lead.id, { archivedAt: undefined } as Partial<StoredLead>)}>Reaktivieren</button>
            : <button className="admin-action" type="button" onClick={() => onArchive(lead.id)}>Archivieren</button>}
          <button className="admin-action danger" type="button" onClick={remove}>Löschen</button>
        </footer>
      </section>
    </aside>
  )
}

function AdminPanel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="admin-panel"><h2>{title}</h2>{children}</section>
}

function PageIntro({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return <section className="page-intro"><p className="kicker">{kicker}</p><h1>{title}</h1><p>{text}</p></section>
}

function Principle({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <article>{icon}<h3>{title}</h3><p>{text}</p></article>
}

function Fact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="fact">{icon}<div><strong>{label}</strong><p>{value}</p></div></div>
}

function ArticleCard({ article, compact = false }: { article: typeof articles[number]; compact?: boolean }) {
  return <article className={compact ? 'article-card compact' : 'article-card'}><img src={article.image} alt="" /><div><p className="kicker">{article.audience === 'both' ? 'Familien & Paare' : article.audience === 'families' ? 'Familien' : 'Paare'}</p><h3>{article.title}</h3><p>{article.description}</p><a className="text-link" href={`/ratgeber/${article.slug}`}>Lesen <ArrowRightLine size={16} /></a></div></article>
}

function ImprintPage() {
  return (
    <Shell>
      <main className="plain-page legal-page">
        <PageIntro
          kicker="Rechtliches"
          title="Impressum"
          text="Angaben nach § 5 DDG. Diese Seite ist als Arbeitsfassung angelegt und muss vor Livegang mit den finalen Unternehmensdaten geprüft werden."
        />
        <section className="legal-content">
          <article>
            <h2>Anbieter</h2>
            <p><strong>Morrow</strong></p>
            <p>[Rechtsform und vollständiger Name ergänzen]</p>
            <p>[Straße und Hausnummer ergänzen]</p>
            <p>[PLZ und Ort ergänzen]</p>
          </article>
          <article>
            <h2>Kontakt</h2>
            <p>E-Mail: <a href="mailto:hello@getmorrow.de">hello@getmorrow.de</a></p>
            <p>Anfragen zu Auszeiten: <a href="mailto:auszeiten@getmorrow.de">auszeiten@getmorrow.de</a></p>
            <p>Support für bestätigte Gäste: <a href="mailto:support@getmorrow.de">support@getmorrow.de</a></p>
          </article>
          <article>
            <h2>Vertreten durch</h2>
            <p>[Vertretungsberechtigte Person ergänzen]</p>
          </article>
          <article>
            <h2>Register und Umsatzsteuer</h2>
            <p>[Registergericht und Registernummer ergänzen, falls vorhanden]</p>
            <p>[Umsatzsteuer-ID ergänzen, falls vorhanden]</p>
          </article>
          <article>
            <h2>Verantwortlich für Inhalte</h2>
            <p>[Name und Anschrift ergänzen]</p>
          </article>
          <article>
            <h2>Hinweis</h2>
            <p>Diese Impressumsseite ist eine technische Arbeitsfassung. Vor Veröffentlichung mit echten Unternehmensdaten und rechtlicher Prüfung finalisieren.</p>
          </article>
        </section>
      </main>
    </Shell>
  )
}

function PrivacyPage() {
  return (
    <Shell>
      <main className="plain-page legal-page privacy-page">
        <PageIntro
          kicker="Rechtliches"
          title="Datenschutz"
          text="Diese Datenschutzerklärung beschreibt die aktuelle MVP-Datenverarbeitung von Morrow. Sie ist vor Livegang rechtlich zu prüfen und mit finalen Anbieterangaben zu ergänzen."
        />
        <section className="legal-content">
          <article>
            <h2>Verantwortlicher</h2>
            <p><strong>Morrow</strong></p>
            <p>[Rechtsform, Name und Anschrift ergänzen]</p>
            <p>E-Mail: <a href="mailto:hello@getmorrow.de">hello@getmorrow.de</a></p>
          </article>
          <article>
            <h2>Welche Daten wir verarbeiten</h2>
            <p>Wenn du eine Auszeit anfragst, speichern wir die Angaben aus dem Formular: Name, E-Mail, Telefonnummer, gewünschte Auszeit, Termin, Anzahl Erwachsene, Kinder, Kinderalter, Hund, optionale Nachricht und optionale WhatsApp-Zustimmung.</p>
            <p>Bei Eigentümer- und Erlebnisanbieteranfragen speichern wir die Angaben aus dem jeweiligen Formular, damit wir die Zusammenarbeit prüfen und beantworten können.</p>
          </article>
          <article>
            <h2>Zweck der Verarbeitung</h2>
            <p>Wir nutzen die Daten, um Anfragen zu prüfen, persönlich zu beantworten, passende Auszeiten vorzubereiten, Buchungen und Gästebetreuung zu organisieren und die Kommunikation nachvollziehbar im Morrow Admin zu dokumentieren.</p>
          </article>
          <article>
            <h2>Rechtsgrundlage</h2>
            <p>Die Verarbeitung erfolgt zur Bearbeitung deiner Anfrage und zur Durchführung vorvertraglicher Maßnahmen. Soweit du optional einer Kontaktaufnahme per WhatsApp zustimmst, erfolgt diese Kommunikation auf Grundlage deiner Einwilligung.</p>
          </article>
          <article>
            <h2>Dienstleister</h2>
            <p>Für Datenbank, Authentifizierung und Backend-Funktionen nutzen wir Supabase. Für transaktionale E-Mails nutzen wir Resend. Beide Dienste werden eingesetzt, um Anfragen sicher zu speichern und Bestätigungen sowie interne Benachrichtigungen zu versenden.</p>
          </article>
          <article>
            <h2>E-Mail-Kommunikation</h2>
            <p>Nach dem Absenden eines Formulars senden wir eine automatische Bestätigung an die angegebene E-Mail-Adresse und eine interne Benachrichtigung an Morrow. Versandereignisse werden zur Nachvollziehbarkeit protokolliert.</p>
          </article>
          <article>
            <h2>WhatsApp</h2>
            <p>WhatsApp wird nur genutzt, wenn du der optionalen Kontaktaufnahme für wichtige Nachrichten zustimmst. E-Mail bleibt der Standardkanal. Details zum späteren WhatsApp-Business-Prozess werden vor Livegang final ergänzt.</p>
          </article>
          <article>
            <h2>Gästebereich und Support</h2>
            <p>Nach verbindlicher Buchung kann ein privater Gästebereich bereitgestellt werden. Supportnachrichten aus diesem Bereich werden gespeichert, damit Morrow die Anfrage bearbeiten und intern zuordnen kann.</p>
          </article>
          <article>
            <h2>Speicherdauer</h2>
            <p>Wir speichern personenbezogene Daten nur so lange, wie sie für Anfragebearbeitung, Buchungsabwicklung, Gästebetreuung, gesetzliche Pflichten oder berechtigte interne Nachvollziehbarkeit erforderlich sind.</p>
          </article>
          <article>
            <h2>Deine Rechte</h2>
            <p>Du kannst Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch verlangen. Eine erteilte Einwilligung kannst du mit Wirkung für die Zukunft widerrufen.</p>
          </article>
          <article>
            <h2>Kontakt zum Datenschutz</h2>
            <p>Für Datenschutzfragen erreichst du uns unter <a href="mailto:hello@getmorrow.de">hello@getmorrow.de</a>.</p>
          </article>
          <article>
            <h2>Tracking und Cookies</h2>
            <p>Aktuell ist kein produktives Tracking als Live-Voraussetzung aktiviert. Sobald Analytics, Meta Pixel, Google Ads Conversion Tracking oder vergleichbare Dienste genutzt werden, ergänzen wir diese Erklärung und die notwendige Consent-Lösung.</p>
          </article>
        </section>
      </main>
    </Shell>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <img src="/brand/logos/wordmark/morrow-logomark-offwhite.svg" alt="Morrow" />
      <div>
        <a href="/#auszeiten">Auszeiten</a>
        <a href="/ratgeber">Ratgeber</a>
        <a href="/eigentuemer">Für Eigentümer</a>
        <a href="/partner/erlebnisanbieter">Erlebnis anbieten</a>
        <a href="/impressum">Impressum</a>
        <a href="/datenschutz">Datenschutz</a>
      </div>
      <p>Kuratierte Aufenthalte in besonderen Orten am Wasser.</p>
    </footer>
  )
}

function NotFound() {
  return <Shell><main className="plain-page"><PageIntro kicker="404" title="Diese Seite gibt es noch nicht." text="Zurück zur Morrow Startseite." /><a className="button primary" href="/">Zur Startseite</a></main></Shell>
}

export default App
