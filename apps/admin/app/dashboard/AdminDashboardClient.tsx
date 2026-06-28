"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type AdminAuditLogRow,
  createSupabaseBrowserClient,
  type CommunicationEventRowBase,
  communicationEventSelectColumns,
  type ExperienceBlockRowBase,
  experienceBlockSelectColumns,
  type ExperienceProviderRowBase,
  experienceProviderSelectColumns,
  insertAdminAuditLog,
  localPlaceAdminSelectColumns,
  type JsonRecord,
  type LocalPlaceRowBase,
  type SupportMessageRowBase,
  supportMessageSelectColumns,
} from "@morrow/supabase";

type AdminProfile = {
  email: string;
  role: string;
  status: string;
  name: string | null;
};

type LeadRow = {
  id: string;
  type: "guest" | "owner" | "experience";
  status: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  package_slug: string | null;
  source?: string | null;
  campaign?: string | null;
  follow_up_at?: string | null;
  whatsapp_opt_in?: boolean | null;
  whatsapp_consent_at?: string | null;
  adults?: number | null;
  children?: number | null;
  children_ages?: string | null;
  dog?: string | null;
  archived_at: string | null;
  created_at: string;
  payload: Record<string, unknown>;
};

type BookingRow = {
  id: string;
  lead_id?: string | null;
  customer_id?: string | null;
  package_id?: string | null;
  status: string;
  payment_status: string;
  guest_access_code?: string | null;
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  selected_date?: string | null;
  reservation_deadline?: string | null;
  payment_due_date?: string | null;
  payment_amount?: string | null;
  payment_date?: string | null;
  payment_method?: string | null;
  payment_reference?: string | null;
  payment_proof_url?: string | null;
  adults?: number | null;
  children?: number | null;
  children_ages?: string | null;
  dog?: string | null;
  check_in_status?: string | null;
  experience_status?: string | null;
  next_task?: string | null;
  created_at: string;
  payload: Record<string, unknown>;
};

type CustomerRecordRow = {
  id: string;
  primary_lead_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  customer_type: string;
  notes: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

type SimpleRow = {
  id: string;
  name?: string;
  slug?: string;
  status?: string;
  location?: string;
  payload?: Record<string, unknown>;
  audience?: string;
  property_id?: string | null;
  price_from?: string | null;
  concrete_price?: string | null;
  sleeps?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  check_in_type?: string | null;
  support_type?: string | null;
  support_name?: string | null;
  image_rights_confirmed?: boolean | null;
  description?: string | null;
  owner_name?: string | null;
  owner_email?: string | null;
  owner_phone?: string | null;
  property_type?: string | null;
  current_rental?: string | null;
  address?: string | null;
  earliest_arrival?: string | null;
  latest_arrival?: string | null;
  check_out_time?: string | null;
  key_safe_code?: string | null;
  check_in_instructions?: string | null;
  amenities?: string[] | null;
  attributes?: string[] | null;
  experience_worlds?: string[] | null;
  house_rules?: string[] | null;
  media?: string[] | null;
  media_alt_texts?: string[] | null;
  cleaning_status?: string | null;
  maintenance_status?: string | null;
  last_check?: string | null;
};

type AdminTaskRow = {
  id: string;
  title: string;
  reference_type: string;
  reference_id: string;
  reference_label: string | null;
  due_at: string | null;
  status: string;
  priority: string;
  note: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

type SupportRow = SupportMessageRowBase;

type ExperienceProviderRow = ExperienceProviderRowBase;

type ExperienceBlockRow = ExperienceBlockRowBase;

type LocalPlaceRow = LocalPlaceRowBase & {
  created_at: string;
};

type PackageDateRow = {
  id: string;
  package_id: string;
  label: string;
  starts_on: string | null;
  ends_on: string | null;
  capacity: number | null;
  status: string;
  payload: Record<string, unknown>;
  created_at: string;
};

type OwnerProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  status: string;
  payload: Record<string, unknown>;
  created_at: string;
};

type OwnerAccessRow = {
  id: string;
  owner_profile_id: string;
  property_id: string;
  role: string;
  can_view_financials: boolean;
  can_view_operations: boolean;
  created_at: string;
};

type OwnerDocumentRow = {
  id: string;
  property_id: string;
  title: string;
  document_type: string;
  status: string;
  url: string;
  period_label: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

type OwnerStatementRow = {
  id: string;
  property_id: string;
  period_label: string;
  period_start: string | null;
  period_end: string | null;
  status: string;
  currency: string;
  gross_revenue: number;
  morrow_fee: number;
  other_costs: number;
  owner_payout: number;
  document_url: string | null;
  paid_at: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

type OwnerOperationRow = {
  id: string;
  property_id: string;
  title: string;
  operation_type: string;
  status: string;
  visibility: string;
  scheduled_for: string | null;
  completed_at: string | null;
  note: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

type AgencyRow = {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  status: string;
  managed_property_ids: string[];
  response_due_days: number | null;
  available_dates_note: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

type CommunicationEventRow = CommunicationEventRowBase;

type GuestFeedbackRow = {
  id: string;
  lead_id: string | null;
  booking_id: string | null;
  rating: number | null;
  return_interest: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

type AuditLogRow = AdminAuditLogRow;

type DashboardData = {
  profile: AdminProfile;
  customers: CustomerRecordRow[];
  leads: LeadRow[];
  bookings: BookingRow[];
  communicationEvents: CommunicationEventRow[];
  packages: SimpleRow[];
  properties: SimpleRow[];
  tasks: AdminTaskRow[];
  supportMessages: SupportRow[];
  experienceProviders: ExperienceProviderRow[];
  experienceBlocks: ExperienceBlockRow[];
  localPlaces: LocalPlaceRow[];
  packageDates: PackageDateRow[];
  ownerProfiles: OwnerProfileRow[];
  ownerAccess: OwnerAccessRow[];
  ownerDocuments: OwnerDocumentRow[];
  ownerStatements: OwnerStatementRow[];
  ownerOperations: OwnerOperationRow[];
  agencies: AgencyRow[];
  guestFeedback: GuestFeedbackRow[];
  auditLogs: AuditLogRow[];
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: DashboardData }
  | { status: "error"; message: string };

type DetailSelection =
  | { type: "lead"; id: string }
  | { type: "booking"; id: string }
  | { type: "support"; id: string }
  | null;

type CustomerPhaseFilter = "all" | "request" | "booking" | "due";
type CommunicationChannelFilter = "all" | "email" | "note" | "inbound" | "outbound" | "internal";
type SupportStatusFilter = "all" | "open" | "in_progress" | "closed";
type SupportUrgencyFilter = "all" | "normal" | "medium" | "urgent";
type LeadScopeFilter = "active" | "archived";
type LeadTypeFilter = "all" | LeadRow["type"];
type LeadStatusFilter = "all" | string;
type LeadWorkFilter = "all" | "due" | "new" | "review";
type AdminWorkspace =
  | "overview"
  | "crm"
  | "tasks"
  | "support"
  | "operations"
  | "inventory"
  | "partners"
  | "owners"
  | "activity";

type CustomerRow = {
  id: string;
  customerRecord: CustomerRecordRow | null;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  source: string;
  latestStatus: string;
  latestCreatedAt: string | null;
  nextStep: string;
  due: boolean;
  isTest: boolean;
  leads: LeadRow[];
  bookings: BookingRow[];
};

type TaskStatusFilter = "all" | "open" | "in_progress" | "done";
type TaskReferenceFilter =
  | "all"
  | "lead"
  | "booking"
  | "support"
  | "package"
  | "property"
  | "experience"
  | "experienceProvider"
  | "localPlace"
  | "owner";
type TaskPriorityFilter = "all" | "low" | "medium" | "high";

type TaskReferenceOption = {
  value: string;
  type: string;
  id: string;
  label: string;
};

type TaskDraft = {
  title: string;
  referenceValue: string;
  dueAt: string;
  priority: "low" | "medium" | "high";
  note: string;
};

type InventorySelection =
  | { mode: "create"; type: "package" | "property" }
  | { mode: "edit"; type: "package"; id: string }
  | { mode: "edit"; type: "property"; id: string }
  | null;

type InventoryDraft = Record<string, string | boolean | string[]>;

type OutboundDraft = {
  subject: string;
  body: string;
};

type PaymentDraft = {
  payment_status: string;
  payment_amount: string;
  payment_date: string;
  payment_method: string;
  payment_reference: string;
  payment_proof_url: string;
};

type BookingOperationsDraft = {
  package_id: string;
  guest_name: string;
  email: string;
  phone: string;
  selected_date: string;
  guest_access_code: string;
  reservation_deadline: string;
  payment_due_date: string;
  adults: string;
  children: string;
  children_ages: string;
  dog: string;
  check_in_status: string;
  experience_status: string;
  next_task: string;
};

type LeadDetailsDraft = {
  name: string;
  email: string;
  phone: string;
  type: LeadRow["type"];
  status: string;
  package_slug: string;
  source: string;
  campaign: string;
  follow_up_at: string;
  selected_date: string;
  adults: string;
  children: string;
  children_ages: string;
  dog: string;
  occasion: string;
  whatsapp_opt_in: string;
};

type OwnerProfileDraft = {
  email: string;
  display_name: string;
  phone: string;
  status: string;
};

type OwnerAccessDraft = {
  owner_profile_id: string;
  property_id: string;
  role: string;
  can_view_financials: boolean;
  can_view_operations: boolean;
};

type OwnerDocumentDraft = {
  property_id: string;
  title: string;
  document_type: string;
  status: string;
  url: string;
  period_label: string;
};

type OwnerStatementDraft = {
  property_id: string;
  period_label: string;
  period_start: string;
  period_end: string;
  status: string;
  gross_revenue: string;
  morrow_fee: string;
  other_costs: string;
  owner_payout: string;
  document_url: string;
  paid_at: string;
};

type OwnerOperationDraft = {
  property_id: string;
  title: string;
  operation_type: string;
  status: string;
  visibility: string;
  scheduled_for: string;
  completed_at: string;
  note: string;
};

type AgencyDraft = {
  id: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  location: string;
  status: string;
  managed_property_ids: string[];
  response_due_days: string;
  available_dates_note: string;
  next_follow_up_at: string;
  notes: string;
};

type ProviderDraft = {
  id: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  location: string;
  category: string;
  status: string;
  website: string;
  audience_fit: string;
  collaboration_note: string;
  pricing_note: string;
  availability_note: string;
  notes: string;
};

type ExperienceSelection =
  | { mode: "create" }
  | { mode: "edit"; id: string }
  | null;

type ExperienceDraft = Record<string, string | boolean>;

type LocalPlaceSelection =
  | { mode: "create" }
  | { mode: "edit"; id: string }
  | null;

type LocalPlaceDraft = Record<string, string | boolean>;

type DateSelection =
  | { mode: "create" }
  | { mode: "edit"; id: string }
  | null;

type DateDraft = Record<string, string>;

const leadQuickStatuses = ["In Prüfung", "Kontaktiert", "Kein Interesse"] as const;
const bookingStatuses = ["Bezahlt", "Vor Anreise", "Aktiv", "Abgeschlossen", "Storniert"] as const;
const supportStatuses = ["open", "in_progress", "closed"] as const;
const taskStatuses = ["open", "in_progress", "done"] as const;
const experienceRoles = ["included", "optional", "recommendation", "planned"] as const;
const experienceConfirmationStatuses = ["planned", "requested", "confirmed", "cancelled"] as const;
const localPlaceStatuses = ["candidate", "approved", "paused", "rejected"] as const;
const localPlaceCurationKinds = ["local_event", "local_tip", "bookable_experience"] as const;
const localPlaceCategories = [
  "food",
  "beach",
  "experience",
  "event",
  "shopping",
  "emergency",
] as const;
const packageDateStatuses = ["available", "reserved", "sold_out", "paused"] as const;
const ownerDocumentTypes = ["agreement", "statement", "invoice", "report", "handover", "document"] as const;
const ownerDocumentStatuses = ["draft", "visible", "archived"] as const;
const ownerStatementStatuses = ["draft", "visible", "paid", "archived"] as const;
const ownerOperationTypes = ["cleaning", "inspection", "maintenance", "repair", "handover", "note"] as const;
const ownerOperationStatuses = ["planned", "in_progress", "done", "blocked", "archived"] as const;
const ownerOperationVisibilities = ["owner_visible", "internal"] as const;
const ownerDocumentTypeLabels: Record<string, string> = {
  agreement: "Vereinbarung",
  statement: "Abrechnung",
  invoice: "Beleg",
  report: "Report",
  handover: "Übergabe",
  document: "Dokument",
};
const ownerStatementStatusLabels: Record<string, string> = {
  archived: "Archiviert",
  draft: "Entwurf",
  paid: "Ausgezahlt",
  visible: "Sichtbar",
};
const ownerOperationTypeLabels: Record<string, string> = {
  cleaning: "Reinigung",
  handover: "Übergabe",
  inspection: "Kontrolle",
  maintenance: "Objektstatus",
  note: "Hinweis",
  repair: "Mangel",
};
const ownerOperationStatusLabels: Record<string, string> = {
  archived: "Archiviert",
  blocked: "Klärung nötig",
  done: "Erledigt",
  in_progress: "In Arbeit",
  planned: "Geplant",
};
const ownerOperationVisibilityLabels: Record<string, string> = {
  internal: "Intern",
  owner_visible: "Eigentümer sichtbar",
};
const adminWorkspaces: Array<{
  id: AdminWorkspace;
  label: string;
  title: string;
  text: string;
  legacySections: string[];
}> = [
  {
    id: "overview",
    label: "Übersicht",
    title: "Guten Überblick.",
    text: "Tagessteuerung mit Kennzahlen, Monitoring und aktuellen Änderungen.",
    legacySections: ["Übersicht"],
  },
  {
    id: "crm",
    label: "CRM",
    title: "Anfragen, Kunden und Buchungen.",
    text: "Gastkontakte von der ersten Anfrage bis zur verbindlichen Buchung führen.",
    legacySections: ["Anfragen", "Kunden", "Buchungen"],
  },
  {
    id: "tasks",
    label: "Aufgaben",
    title: "Operative To-dos steuern.",
    text: "Aufgaben mit Bezug, Fälligkeit und Priorität anlegen und abarbeiten.",
    legacySections: ["Aufgaben"],
  },
  {
    id: "support",
    label: "Support",
    title: "Gäste begleiten und Feedback prüfen.",
    text: "Supportfälle, Nachrichten aus dem Gästebereich und Rückmeldungen nach dem Aufenthalt.",
    legacySections: ["Gästesupport", "Feedback"],
  },
  {
    id: "operations",
    label: "Operations",
    title: "Vor Ort, Erlebnisse und Termine.",
    text: "Kuratierte Orte, Erlebnisbausteine und buchbare Zeiträume pflegen.",
    legacySections: ["Erlebnisse", "Vor Ort", "Termine"],
  },
  {
    id: "inventory",
    label: "Bestand",
    title: "Auszeiten und Unterkünfte.",
    text: "Paket- und Objektbestand als Grundlage der Plattform pflegen.",
    legacySections: ["Auszeiten", "Unterkünfte"],
  },
  {
    id: "partners",
    label: "Partner",
    title: "Agenturen und Startpartner.",
    text: "Phase-1-Partner, Objektzugang und Verfügbarkeitsabsprachen steuern.",
    legacySections: ["Agenturen", "Erlebnisanbieter"],
  },
  {
    id: "owners",
    label: "Eigentümer",
    title: "Eigentümerdaten und Freigaben.",
    text: "Profile, Objektzugriffe, Dokumente, Abrechnungen und Objektarbeit verwalten.",
    legacySections: ["Eigentümer"],
  },
  {
    id: "activity",
    label: "Aktivität",
    title: "Änderungen nachvollziehen.",
    text: "Audit-Log und letzte operative Änderungen prüfen.",
    legacySections: ["Aktivität", "Kommunikation"],
  },
];
const propertyAttributeOptions = [
  { value: "sea_near", label: "Nähe zum Wasser" },
  { value: "quiet_location", label: "Ruhige Lage" },
  { value: "family_friendly", label: "Familienfreundlich" },
  { value: "couple_retreat", label: "Rückzug für Paare" },
  { value: "dog_allowed", label: "Hund möglich" },
  { value: "sauna", label: "Sauna" },
  { value: "fireplace", label: "Kamin" },
  { value: "garden", label: "Garten" },
  { value: "terrace", label: "Terrasse" },
  { value: "workation", label: "Workation-tauglich" },
  { value: "premium_interior", label: "Hochwertige Einrichtung" },
  { value: "bad_weather_ready", label: "Stark bei Schietwetter" },
] as const;
const experienceWorldOptions = [
  { value: "family_escape", label: "Family Escape" },
  { value: "couple_reset", label: "Couple Reset" },
  { value: "dog_holiday", label: "Hundeurlaub" },
  { value: "wellness_escape", label: "Wellness-Auszeit" },
  { value: "fireplace_season", label: "Kaminzeit" },
  { value: "workation", label: "Workation am Meer" },
  { value: "last_minute", label: "Last Minute" },
  { value: "offseason_nordsee", label: "Nebensaison Nordsee" },
] as const;

function paymentStatusForBooking(status: string) {
  return ["Bezahlt", "Vor Anreise", "Aktiv", "Abgeschlossen"].includes(status)
    ? "bezahlt"
    : "offen";
}

function isGuestAreaUnlocked(status: string) {
  return ["Bezahlt", "Vor Anreise", "Aktiv", "Abgeschlossen"].includes(status);
}

function paymentDraftFromBooking(booking: BookingRow | null): PaymentDraft {
  const payload = booking?.payload ?? {};

  return {
    payment_status: booking?.payment_status || getPayloadText(payload, ["paymentStatus"]) || "offen",
    payment_amount: booking?.payment_amount || getPayloadText(payload, ["paymentAmount", "amountPaid", "price"]) || "",
    payment_date: booking?.payment_date || getPayloadText(payload, ["paymentDate", "paidAt"]) || "",
    payment_method: booking?.payment_method || getPayloadText(payload, ["paymentMethod"]) || "",
    payment_reference: booking?.payment_reference || getPayloadText(payload, ["paymentReference", "invoiceNumber", "transactionId"]) || "",
    payment_proof_url: booking?.payment_proof_url || getPayloadText(payload, ["paymentProofUrl", "receiptUrl", "invoiceUrl"]) || "",
  };
}

function bookingOperationsDraftFromBooking(booking: BookingRow | null): BookingOperationsDraft {
  const payload = booking?.payload ?? {};
  const email = booking?.guest_email || getPayloadText(payload, ["email", "guestEmail", "customerEmail"]) || "";

  return {
    package_id: booking?.package_id || getPayloadText(payload, ["packageId", "package_id"]) || "",
    guest_name: booking?.guest_name || getPayloadText(payload, ["guestName", "customerName", "name"]) || "",
    email,
    phone: booking?.guest_phone || getPayloadText(payload, ["phone", "guestPhone", "customerPhone"]) || "",
    selected_date: booking?.selected_date || getPayloadText(payload, ["selectedDate", "dateLabel", "travelDate", "arrivalDate"]) || "",
    guest_access_code: booking
      ? booking.guest_access_code || getPayloadText(payload, ["guestAccessCode", "guest_access_code"]) || generatedGuestAccessCode(booking.id, email)
      : "",
    reservation_deadline: booking?.reservation_deadline || getPayloadText(payload, ["reservationDeadline", "reservation_deadline"]) || "",
    payment_due_date: booking?.payment_due_date || getPayloadText(payload, ["paymentDueDate", "payment_due_date"]) || "",
    adults: booking?.adults != null ? String(booking.adults) : getPayloadText(payload, ["adults", "adultCount"]) || "",
    children: booking?.children != null ? String(booking.children) : getPayloadText(payload, ["children", "childCount", "kids"]) || "",
    children_ages: booking?.children_ages || getPayloadText(payload, ["childrenAges", "children_ages", "kidsAges"]) || "",
    dog: booking?.dog || getPayloadText(payload, ["dog", "dogNote", "hasDog"]) || "",
    check_in_status: booking?.check_in_status || getPayloadText(payload, ["checkInStatus", "check_in_status"]) || "offen",
    experience_status: booking?.experience_status || getPayloadText(payload, ["experienceStatus", "experience_status"]) || "offen",
    next_task: booking?.next_task || getPayloadText(payload, ["nextTask", "next_task"]) || "",
  };
}

function generatedGuestAccessCode(id: string, email?: string | null) {
  const source = `${id}:${(email || "").toLowerCase()}`;
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
  }

  return Math.abs(hash).toString(36).padStart(6, "0").slice(0, 6).toUpperCase();
}

function guestAccessCodeForBooking(booking: BookingRow) {
  return booking.guest_access_code ||
    getPayloadText(booking.payload ?? {}, ["guestAccessCode", "guest_access_code"]) ||
    generatedGuestAccessCode(booking.id, getPayloadText(booking.payload ?? {}, ["email", "guestEmail", "customerEmail"]));
}

function guestAreaHref(booking: BookingRow) {
  return `/deine-auszeit/${booking.id}?code=${guestAccessCodeForBooking(booking)}`;
}

function leadDetailsDraftFromLead(lead: LeadRow | null): LeadDetailsDraft {
  const payload = lead?.payload ?? {};
  const whatsappValue = lead?.whatsapp_opt_in ?? payload.whatsappOptIn ?? payload.whatsapp_opt_in ?? payload.whatsappConsent;

  return {
    name: lead?.name || getPayloadText(payload, ["name", "fullName", "customerName"]) || "",
    email: lead?.email || getPayloadText(payload, ["email"]) || "",
    phone: lead?.phone || getPayloadText(payload, ["phone", "phoneNumber"]) || "",
    type: lead?.type || "guest",
    status: lead?.status || "Neu",
    package_slug: lead?.package_slug || getPayloadText(payload, ["packageSlug", "packageName", "packageId"]) || "",
    source: lead?.source || getPayloadText(payload, ["source", "leadSource"]) || "",
    campaign: lead?.campaign || getPayloadText(payload, ["campaign", "utm_campaign"]) || "",
    follow_up_at: lead ? getLeadFollowUpAt(lead) || "" : "",
    selected_date: getPayloadText(payload, ["selectedDate", "dateLabel", "travelDate", "arrivalDate"]) || "",
    adults: lead?.adults != null ? String(lead.adults) : getPayloadText(payload, ["adults", "adultCount"]) || "",
    children: lead?.children != null ? String(lead.children) : getPayloadText(payload, ["children", "childCount", "kids"]) || "",
    children_ages: lead?.children_ages || getPayloadText(payload, ["childrenAges", "children_ages", "kidsAges"]) || "",
    dog: lead?.dog || getPayloadText(payload, ["dog", "dogs", "dogNote", "pet", "hund"]) || "",
    occasion: getPayloadText(payload, ["occasion", "reason", "anlass"]) || "",
    whatsapp_opt_in: typeof whatsappValue === "boolean"
      ? whatsappValue ? "yes" : "no"
      : getPayloadText(payload, ["whatsappOptIn", "whatsapp_opt_in", "whatsappConsent"]) || "",
  };
}

function consentDraftValueToBool(value: string) {
  if (value === "yes") return true;
  if (value === "no") return false;
  return null;
}

function getPayloadText(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value;
  }

  return null;
}

function getPayloadBool(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "boolean") return value;
  }

  return false;
}

function getPayloadLines(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string").join("\n");
    }
    if (typeof value === "string" && value.trim()) return value;
  }

  return "";
}

function getPayloadStringArray(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string");
    }
  }

  return [];
}

function draftStringArray(value: string | boolean | string[] | undefined) {
  return Array.isArray(value) ? value : [];
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function getInventoryPropertyIssues(draft: InventoryDraft) {
  const issues: string[] = [];

  if (!String(draft.name || "").trim()) issues.push("Objektname fehlt");
  if (!String(draft.location || "").trim()) issues.push("Ort fehlt");
  if (!String(draft.address || "").trim()) issues.push("Adresse fehlt");
  if (!String(draft.property_type || "").trim()) issues.push("Objekttyp fehlt");
  if (!String(draft.owner_name || "").trim() || !String(draft.owner_email || "").trim()) {
    issues.push("Eigentümerkontakt unvollständig");
  }
  if (!String(draft.description || "").trim()) issues.push("Beschreibung fehlt");
  if (!String(draft.check_in_type || "").trim() || String(draft.check_in_type) === "unknown") {
    issues.push("Schlüsselübergabe offen");
  }
  if (
    !String(draft.earliest_arrival || "").trim() ||
    !String(draft.latest_arrival || "").trim() ||
    !String(draft.check_out_time || "").trim()
  ) {
    issues.push("Anreise und Abreise unvollständig");
  }
  if (!String(draft.check_in_instructions || "").trim()) issues.push("Check-in-Hinweise fehlen");
  if (splitLines(String(draft.amenities || "")).length < 3) issues.push("Ausstattung ergänzen");
  if (draftStringArray(draft.attributes).length < 2) issues.push("Objektattribute ergänzen");
  if (draftStringArray(draft.experience_worlds).length === 0) issues.push("Erlebniswelten ergänzen");
  if (splitLines(String(draft.house_rules || "")).length < 2) issues.push("Unterkunftsregeln ergänzen");
  if (splitLines(String(draft.media || "")).length === 0) issues.push("Medien fehlen");
  if (!draft.image_rights_confirmed) issues.push("Bildrechte offen");
  if (!String(draft.support_type || "").trim() || !String(draft.support_name || "").trim()) {
    issues.push("Support-Zuständigkeit benennen");
  }

  return issues;
}

function getExperienceIssues(draft: ExperienceDraft) {
  const issues: string[] = [];

  if (!String(draft.title || "").trim()) issues.push("Titel fehlt");
  if (!String(draft.package_id || "").trim()) issues.push("Auszeit fehlt");
  if (!String(draft.provider_id || "").trim()) issues.push("Anbieterprofil fehlt");
  if (!String(draft.price_note || "").trim()) issues.push("Preislogik fehlt");
  if (!String(draft.capacity_note || "").trim()) issues.push("Kapazität fehlt");
  if (!String(draft.availability_note || "").trim()) issues.push("Verfügbarkeit fehlt");
  if (!String(draft.guest_note || "").trim()) issues.push("Gastnotiz fehlt");
  if (String(draft.role || "") === "included" && String(draft.confirmation_status || "") !== "confirmed") {
    issues.push("Enthaltenes Erlebnis nicht bestätigt");
  }

  return issues;
}

function getLocalPlaceIssues(draft: LocalPlaceDraft) {
  const issues: string[] = [];
  const category = String(draft.category || "food");
  const status = String(draft.status || "candidate");
  const curationKind = String(draft.curation_kind || (category === "event" ? "local_event" : "local_tip"));
  const hasCoordinates = Boolean(String(draft.lat || "").trim() && String(draft.lng || "").trim());
  const hasActionLink = Boolean(
    String(draft.website || "").trim() ||
    String(draft.reservation_url || "").trim() ||
    String(draft.menu_url || "").trim(),
  );

  if (!String(draft.name || "").trim()) issues.push("Name fehlt");
  if (!category.trim()) issues.push("Kategorie fehlt");
  if (!status.trim()) issues.push("Status fehlt");
  if (!String(draft.description || "").trim()) issues.push("Gastbeschreibung fehlt");
  if (splitLines(String(draft.images || "")).length === 0) issues.push("Bildmaterial fehlt");
  if (status === "approved" && !hasCoordinates) issues.push("Koordinaten für Karte fehlen");

  if (category === "food") {
    if (!String(draft.cuisine || "").trim()) issues.push("Küche oder Restauranttyp fehlt");
    if (!String(draft.opening_hours || "").trim()) issues.push("Öffnungszeiten/Hinweis fehlen");
    if (!String(draft.rating || "").trim()) issues.push("Bewertung fehlt");
    if (!hasActionLink) issues.push("Reservierung, Speisekarte oder Website fehlt");
  }

  if (category === "event") {
    if (curationKind === "bookable_experience") issues.push("Als Erlebnisbaustein/Anbieter führen, nicht als Veranstaltung");
    if (!String(draft.event_date || "").trim()) issues.push("Veranstaltungsdatum fehlt");
    if (!String(draft.event_time || "").trim()) issues.push("Veranstaltungszeit fehlt");
    if (!String(draft.event_audience || "").trim()) issues.push("Event-Zielgruppe fehlt");
    if (!String(draft.event_setting || "").trim()) issues.push("Indoor/Outdoor-Einschätzung fehlt");
    if (!String(draft.event_fit_note || "").trim()) issues.push("Morrow-Fit für Gäste fehlt");
    if (!hasActionLink) issues.push("Programm- oder Website-Link fehlt");
  }

  if (category === "experience") {
    if (splitLines(String(draft.best_for || "")).length === 0) issues.push("Zielgruppe/Nutzen fehlt");
    if (splitLines(String(draft.package_fit || "")).length === 0) issues.push("Auszeit-Zuordnung prüfen");
  }

  if (category === "emergency" && !hasActionLink && !String(draft.address || "").trim()) {
    issues.push("Kontakt, Adresse oder Link fehlt");
  }

  return issues;
}

function numberOrNull(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function integerOrNull(value: string) {
  const trimmed = value.trim();
  if (!/^[0-9]+$/.test(trimmed)) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function decimalOrZero(value: string) {
  const normalized = value
    .trim()
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function leadSourceLabel(lead: LeadRow) {
  const payload = lead.payload ?? {};
  const utm = typeof payload.utm === "object" && payload.utm !== null
    ? payload.utm as Record<string, unknown>
    : {};
  const source =
    lead.source ||
    getPayloadText(utm, ["source", "utm_source"]) ||
    getPayloadText(payload, ["source", "leadSource"]) ||
    "Quelle offen";
  const campaign =
    lead.campaign ||
    getPayloadText(utm, ["campaign", "utm_campaign"]) ||
    getPayloadText(payload, ["campaign"]);

  return campaign ? `${source} · ${campaign}` : source;
}

function leadIntentLabel(lead: LeadRow) {
  if (lead.type === "owner") return "Eigentümer";
  if (lead.type === "experience") return "Erlebnispartner";
  return lead.package_slug || getPayloadText(lead.payload ?? {}, ["packageName", "packageSlug"]) || "Gastanfrage";
}

function formatShortDate(value: string | null) {
  if (!value) return "ohne Datum";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function supportStatusLabel(status: string) {
  const labels: Record<string, string> = {
    open: "Offen",
    in_progress: "In Klärung",
    closed: "Erledigt",
  };

  return labels[status] || status;
}

function auditActionLabel(action: string) {
  const labels: Record<string, string> = {
    admin_email_sent: "E-Mail gesendet",
    agency_deleted: "Agentur entfernt",
    agency_status_updated: "Agenturstatus geändert",
    agency_upserted: "Agentur gespeichert",
    booking_payment_documented: "Zahlung dokumentiert",
    booking_operations_updated: "Buchungsdetails aktualisiert",
    booking_status_updated: "Buchungsstatus geändert",
    date_created: "Termin angelegt",
    date_updated: "Termin geändert",
    drawer_note_saved: "Interne Notiz gespeichert",
    internal_note_updated: "Interne Notiz gespeichert",
    experience_created: "Erlebnis angelegt",
    experience_updated: "Erlebnis geändert",
    experience_provider_deleted: "Erlebnisanbieter entfernt",
    experience_provider_status_updated: "Erlebnisanbieterstatus geändert",
    experience_provider_upserted: "Erlebnisanbieter gespeichert",
    lead_reserved: "Reservierung angelegt",
    lead_archived: "Anfrage archiviert",
    lead_follow_up_updated: "Wiedervorlage geändert",
    lead_reactivated: "Anfrage reaktiviert",
    lead_details_updated: "Anfrage bearbeitet",
    lead_status_updated: "Anfragestatus geändert",
    lead_test_deleted: "Testanfrage gelöscht",
    local_place_created: "Vor-Ort-Ort angelegt",
    local_place_updated: "Vor-Ort-Ort geändert",
    owner_profile_upserted: "Eigentümerprofil gespeichert",
    owner_property_access_upserted: "Objektzugriff gespeichert",
    package_created: "Auszeit angelegt",
    package_date_created: "Termin angelegt",
    package_date_updated: "Termin geändert",
    package_updated: "Auszeit geändert",
    property_created: "Unterkunft angelegt",
    property_updated: "Unterkunft geändert",
    support_status_updated: "Supportstatus geändert",
    task_created: "Aufgabe angelegt",
    task_deleted: "Aufgabe gelöscht",
    task_status_updated: "Aufgabe aktualisiert",
    task_updated: "Aufgabe bearbeitet",
  };

  return labels[action] || action.replace(/_/g, " ");
}

function localPlaceCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    food: "Essen",
    beach: "Strand",
    experience: "Kuratierte Erlebnisse",
    event: "Veranstaltungen",
    shopping: "Praktisch",
    emergency: "Hilfe",
  };

  return labels[category] || category;
}

function localPlaceStatusLabel(status: string) {
  const labels: Record<string, string> = {
    candidate: "Kandidat",
    approved: "Freigegeben",
    paused: "Pausiert",
    rejected: "Verworfen",
  };

  return labels[status] || status;
}

function localPlaceCurationKindLabel(kind: string) {
  const labels: Record<string, string> = {
    local_event: "Öffentliche Veranstaltung",
    local_tip: "Lokaler Tipp",
    bookable_experience: "Buchbares Erlebnis",
  };

  return labels[kind] || kind;
}

function getLocalPlaceSummary(place: LocalPlaceRow) {
  return place.description ||
    getPayloadText(place.payload, ["description", "guestDescription", "morrowNote", "routeNote"]) ||
    place.address ||
    "Noch keine Gastbeschreibung hinterlegt.";
}

function getAuditPayloadValue(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return null;
}

function auditPayloadSummary(log: AuditLogRow) {
  const from = getAuditPayloadValue(log.payload, "from");
  const to = getAuditPayloadValue(log.payload, "to");
  const paymentStatus = getAuditPayloadValue(log.payload, "paymentStatus");
  const noteLength = getAuditPayloadValue(log.payload, "noteLength");
  const subject = getAuditPayloadValue(log.payload, "subject");
  const title = getAuditPayloadValue(log.payload, "title") || getAuditPayloadValue(log.payload, "name");

  if (from || to) {
    return `${from || "vorher offen"} → ${to || "nachher offen"}${paymentStatus ? ` · Zahlung: ${paymentStatus}` : ""}`;
  }
  if (subject) return subject;
  if (noteLength) return `${noteLength} Zeichen interne Notiz`;
  if (title) return title;
  return log.entity_label || `${log.entity_type} · ${log.entity_id}`;
}

function communicationChannelLabel(channel: string) {
  if (channel === "email") return "E-Mail";
  if (channel === "note") return "Notiz";
  if (channel === "whatsapp") return "WhatsApp";
  if (channel === "support") return "Support";
  return channel || "Kommunikation";
}

function communicationDirectionLabel(direction: string) {
  if (direction === "outbound") return "ausgehend";
  if (direction === "inbound") return "eingehend";
  if (direction === "internal") return "intern";
  return direction || "offen";
}

function communicationContextLabel(event: CommunicationEventRow, data: DashboardData) {
  if (event.lead_id) {
    const lead = data.leads.find((item) => item.id === event.lead_id);
    if (lead) return `Anfrage · ${getLeadLabel(lead)}`;
  }

  if (event.booking_id) {
    const booking = data.bookings.find((item) => item.id === event.booking_id);
    if (booking) return `Buchung · ${getBookingLabel(booking)}`;
  }

  if (event.customer_id) {
    const customer = data.customers.find((item) => item.id === event.customer_id);
    if (customer) return `Kunde · ${customer.name}`;
  }

  const supportId = event.support_id || (event.payload ? getPayloadText(event.payload, ["supportId", "support_id"]) : "");
  if (supportId) {
    const support = data.supportMessages.find((item) => item.id === supportId);
    return support ? `Support · ${getSupportContactLabel(support)}` : "Support";
  }

  return "Ohne direkten Bezug";
}

function supportUrgencyLabel(urgency: string | null) {
  const labels: Record<string, string> = {
    low: "Normal",
    normal: "Normal",
    medium: "Mittel",
    high: "Dringend",
    urgent: "Dringend",
  };

  return urgency ? labels[urgency] || urgency : "Normal";
}

function supportUrgencyGroup(urgency: string | null): SupportUrgencyFilter {
  if (urgency === "high" || urgency === "urgent") return "urgent";
  if (urgency === "medium") return "medium";
  return "normal";
}

function supportUrgencyRank(urgency: string | null) {
  const group = supportUrgencyGroup(urgency);
  if (group === "urgent") return 0;
  if (group === "medium") return 1;
  return 2;
}

function supportCategoryLabel(category: string | null) {
  const labels: Record<string, string> = {
    general: "Allgemein",
    property: "Objekt oder Ausstattung",
    booking: "Buchung oder Zeitraum",
    accounting: "Abrechnung",
    owner_general: "Eigentümer · Allgemeine Rückfrage",
    owner_property: "Eigentümer · Objekt oder Ausstattung",
    owner_booking: "Eigentümer · Buchung oder Zeitraum",
    owner_availability: "Eigentümer · Eigenbelegung oder Verfügbarkeit",
    owner_accounting: "Eigentümer · Abrechnung",
  };

  return category ? labels[category] || category.replace(/_/g, " ") : "Allgemein";
}

function taskStatusLabel(status: string) {
  const labels: Record<string, string> = {
    open: "Offen",
    in_progress: "In Arbeit",
    done: "Erledigt",
  };

  return labels[status] || status;
}

function taskPriorityLabel(priority: string) {
  const labels: Record<string, string> = {
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch",
  };

  return labels[priority] || priority;
}

function taskReferenceLabel(type: string) {
  const labels: Record<string, string> = {
    lead: "Anfrage",
    booking: "Buchung",
    package: "Auszeit",
    property: "Unterkunft",
    owner: "Eigentümer",
    experience: "Erlebnis",
    experienceProvider: "Erlebnisanbieter",
    localPlace: "Vor Ort",
    support: "Support",
  };

  return labels[type] || type;
}

function taskReferenceFilterLabel(value: TaskReferenceFilter) {
  const labels: Record<TaskReferenceFilter, string> = {
    all: "Alle",
    lead: "Anfragen",
    booking: "Buchungen",
    support: "Support",
    package: "Auszeiten",
    property: "Unterkünfte",
    experience: "Erlebnisse",
    experienceProvider: "Erlebnisanbieter",
    localPlace: "Vor Ort",
    owner: "Eigentümer",
  };

  return labels[value];
}

function taskPriorityFilterLabel(value: TaskPriorityFilter) {
  if (value === "all") return "Alle Prioritäten";
  return taskPriorityLabel(value);
}

function buildTaskReferenceOptions(data: DashboardData): TaskReferenceOption[] {
  return [
    ...data.leads.slice(0, 60).map((lead) => ({
      value: `lead:${lead.id}`,
      type: "lead",
      id: lead.id,
      label: `${getLeadLabel(lead)} · ${leadIntentLabel(lead)}`,
    })),
    ...data.bookings.slice(0, 60).map((booking) => ({
      value: `booking:${booking.id}`,
      type: "booking",
      id: booking.id,
      label: `${getBookingLabel(booking)} · ${booking.status}`,
    })),
    ...data.supportMessages.slice(0, 60).map((support) => ({
      value: `support:${support.id}`,
      type: "support",
      id: support.id,
      label: `${getSupportLabel(support)} · ${supportStatusLabel(support.status)}`,
    })),
    ...data.packages.map((item) => ({
      value: `package:${item.id}`,
      type: "package",
      id: item.id,
      label: `${item.name || item.id} · ${item.location || "Ort offen"}`,
    })),
    ...data.properties.map((item) => ({
      value: `property:${item.id}`,
      type: "property",
      id: item.id,
      label: `${item.name || item.id} · ${item.location || "Ort offen"}`,
    })),
    ...data.experienceBlocks.map((item) => ({
      value: `experience:${item.id}`,
      type: "experience",
      id: item.id,
      label: `${item.title} · ${experienceConfirmationLabel(item.confirmation_status)}`,
    })),
    ...data.localPlaces.map((item) => ({
      value: `localPlace:${item.id}`,
      type: "localPlace",
      id: item.id,
      label: `${item.name} · ${localPlaceCategoryLabel(item.category)}`,
    })),
    ...data.ownerProfiles.map((item) => ({
      value: `owner:${item.id}`,
      type: "owner",
      id: item.id,
      label: `${item.display_name || item.email} · ${item.status}`,
    })),
    ...data.experienceProviders.map((item) => ({
      value: `experienceProvider:${item.id}`,
      type: "experienceProvider",
      id: item.id,
      label: `${item.name} · ${item.category || "Kategorie offen"}`,
    })),
  ];
}

function experienceRoleLabel(role: string) {
  const labels: Record<string, string> = {
    included: "Enthalten",
    optional: "Optional",
    recommendation: "Empfehlung",
    planned: "Geplant",
  };

  return labels[role] || role;
}

function experienceConfirmationLabel(status: string) {
  const labels: Record<string, string> = {
    planned: "Geplant",
    requested: "Angefragt",
    confirmed: "Bestätigt",
    cancelled: "Abgesagt",
  };

  return labels[status] || status;
}

function packageDateStatusLabel(status: string) {
  const labels: Record<string, string> = {
    available: "Verfügbar",
    reserved: "Reserviert",
    sold_out: "Ausgebucht",
    paused: "Pausiert",
  };

  return labels[status] || status;
}

function getOpenLeads(leads: LeadRow[]) {
  return leads.filter((lead) => !lead.archived_at && !["Bezahlt", "Abgeschlossen", "Kein Interesse"].includes(lead.status));
}

function getLeadFollowUpAt(lead: LeadRow) {
  return lead.follow_up_at || getPayloadText(lead.payload ?? {}, ["followUpAt", "follow_up_at", "nextContactAt"]);
}

function isLeadDue(lead: LeadRow) {
  const followUpAt = getLeadFollowUpAt(lead);
  return Boolean(followUpAt && followUpAt.slice(0, 10) <= todayIsoDate());
}

function isLeadTest(lead: LeadRow) {
  return isTestPayload(lead.payload ?? {}) ||
    lead.id.startsWith("test-") ||
    getLeadLabel(lead).toLowerCase().includes("test");
}

function leadWorkLabel(lead: LeadRow) {
  if (lead.archived_at) return "Archiviert";
  if (isLeadDue(lead)) return "Heute nachfassen";
  if (lead.status === "Neu") return "Erstkontakt";
  if (lead.status === "In Prüfung") return "Prüfen";
  if (lead.status === "Kontaktiert") return "Rückmeldung";
  if (lead.status === "Reserviert") return "Reservierung sichern";
  if (lead.status === "Kein Interesse") return "Verlustgrund prüfen";
  return "Klären";
}

function leadWorkMeta(lead: LeadRow) {
  const followUpAt = getLeadFollowUpAt(lead);
  if (followUpAt) return `Wiedervorlage ${formatShortDate(followUpAt)}`;
  if (lead.archived_at) return `Archiviert ${formatDate(lead.archived_at)}`;
  if (lead.status === "Neu") return "noch ohne Wiedervorlage";
  return leadSourceLabel(lead);
}

function getContactEmail(payload: Record<string, unknown>, fallback?: string | null) {
  return fallback || getPayloadText(payload, ["email", "customerEmail", "guestEmail"]);
}

function getContactPhone(payload: Record<string, unknown>, fallback?: string | null) {
  return fallback || getPayloadText(payload, ["phone", "telefon", "customerPhone", "guestPhone"]);
}

function isTestPayload(payload: Record<string, unknown>) {
  return getPayloadBool(payload, ["isTest", "test", "is_test"]) ||
    getPayloadText(payload, ["source", "campaign", "utm_campaign"])?.toLowerCase().includes("test") ||
    false;
}

function contactKey(email: string | null, phone: string | null, fallback: string) {
  if (email) return `email:${email.trim().toLowerCase()}`;
  if (phone) return `phone:${phone.replace(/\s+/g, "")}`;
  return `id:${fallback}`;
}

function compareNewest(a: string | null, b: string | null) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return new Date(b).getTime() - new Date(a).getTime();
}

function getBookingLeadId(booking: BookingRow) {
  return booking.lead_id || getPayloadText(booking.payload ?? {}, ["leadId", "lead_id"]);
}

function getCustomerLatestDate(leads: LeadRow[], bookings: BookingRow[]) {
  return [...leads.map((lead) => lead.created_at), ...bookings.map((booking) => booking.created_at)]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null;
}

function customerIsDue(leads: LeadRow[], bookings: BookingRow[]) {
  const today = todayIsoDate();
  const leadDue = leads.some((lead) => {
    const due = getLeadFollowUpAt(lead);
    return Boolean(due && due.slice(0, 10) <= today);
  });
  const bookingDue = bookings.some((booking) => {
    const due = booking.payment_due_date || getPayloadText(booking.payload ?? {}, ["nextTaskDueAt", "next_task_due_at", "paymentDueDate"]);
    return Boolean(due && due.slice(0, 10) <= today);
  });

  return leadDue || bookingDue;
}

function getCustomerName(leads: LeadRow[], bookings: BookingRow[]) {
  const lead = leads.find((item) => getLeadLabel(item));
  if (lead) return getLeadLabel(lead);

  const booking = bookings.find((item) => item.guest_name || getPayloadText(item.payload ?? {}, ["guestName", "customerName", "name"]));
  return booking ? booking.guest_name || getPayloadText(booking.payload ?? {}, ["guestName", "customerName", "name"]) || "Gastkontakt" : "Gastkontakt";
}

function getCustomerLatestStatus(leads: LeadRow[], bookings: BookingRow[]) {
  const all = [
    ...leads.map((lead) => ({ createdAt: lead.created_at, status: lead.status })),
    ...bookings.map((booking) => ({ createdAt: booking.created_at, status: `${booking.status} · ${booking.payment_status}` })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return all[0]?.status || "Kontakt";
}

function getCustomerSource(leads: LeadRow[]) {
  const newestLead = [...leads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  return newestLead ? leadSourceLabel(newestLead) : "Buchung";
}

function getCustomerNextStep(leads: LeadRow[], bookings: BookingRow[], due: boolean) {
  if (due) return "Heute nachfassen";
  const openBooking = bookings.find((booking) => booking.payment_status !== "bezahlt");
  if (openBooking) return "Zahlung oder Reservierung prüfen";
  if (bookings.some((booking) => booking.status === "Abgeschlossen")) return "Feedback oder Wiederbuchung prüfen";
  if (bookings.length) return "Aufenthalt vorbereiten";
  if (leads.length) return "Anfrage qualifizieren";
  return "Kontakt prüfen";
}

function buildCustomerRows(leads: LeadRow[], bookings: BookingRow[], customerRecords: CustomerRecordRow[]) {
  const customers = new Map<string, CustomerRow>();

  function ensureCustomer(
    key: string,
    email: string | null,
    phone: string | null,
    fallbackId: string,
    customerRecord: CustomerRecordRow | null = null,
  ) {
    const existing = customers.get(key);
    if (existing) {
      if (customerRecord && !existing.customerRecord) {
        existing.customerRecord = customerRecord;
        existing.id = customerRecord.id;
        existing.notes = customerRecord.notes;
      }
      existing.email ||= email;
      existing.phone ||= phone;
      return existing;
    }

    const row: CustomerRow = {
      id: customerRecord?.id ?? key,
      customerRecord,
      name: customerRecord?.name || fallbackId,
      email,
      phone,
      notes: customerRecord?.notes ?? null,
      source: "Quelle offen",
      latestStatus: "Kontakt",
      latestCreatedAt: null,
      nextStep: "Kontakt prüfen",
      due: false,
      isTest: false,
      leads: [],
      bookings: [],
    };
    customers.set(key, row);
    return row;
  }

  const leadKeyById = new Map<string, string>();
  const customerKeyById = new Map<string, string>();

  customerRecords.forEach((record) => {
    const key = record.primary_lead_id
      ? `lead:${record.primary_lead_id}`
      : contactKey(record.email, record.phone, record.id);
    customerKeyById.set(record.id, key);
    ensureCustomer(key, record.email, record.phone, record.id, record);
  });

  leads
    .filter((lead) => lead.type === "guest")
    .forEach((lead) => {
      const email = getContactEmail(lead.payload ?? {}, lead.email);
      const phone = getContactPhone(lead.payload ?? {}, lead.phone);
      const linkedCustomer = customerRecords.find((record) => record.primary_lead_id === lead.id);
      const key = linkedCustomer
        ? customerKeyById.get(linkedCustomer.id) ?? `lead:${lead.id}`
        : contactKey(email, phone, lead.id);
      leadKeyById.set(lead.id, key);
      const customer = ensureCustomer(key, email, phone, lead.id, linkedCustomer ?? null);
      customer.email ||= email;
      customer.phone ||= phone;
      customer.leads.push(lead);
    });

  bookings.forEach((booking) => {
    const linkedLeadKey = getBookingLeadId(booking);
    const email = getContactEmail(booking.payload ?? {});
    const phone = getContactPhone(booking.payload ?? {});
    const key = booking.customer_id && customerKeyById.has(booking.customer_id)
      ? customerKeyById.get(booking.customer_id) as string
      : linkedLeadKey && leadKeyById.has(linkedLeadKey)
      ? leadKeyById.get(linkedLeadKey) as string
      : contactKey(email, phone, booking.id);
    const customerRecord = booking.customer_id
      ? customerRecords.find((record) => record.id === booking.customer_id) ?? null
      : null;
    const customer = ensureCustomer(key, email, phone, booking.id, customerRecord);
    customer.email ||= email;
    customer.phone ||= phone;
    customer.bookings.push(booking);
  });

  return Array.from(customers.values())
    .map((customer) => {
      const due = customerIsDue(customer.leads, customer.bookings);
      const isTest =
        customer.leads.some((lead) => isTestPayload(lead.payload ?? {})) ||
        customer.bookings.some((booking) => isTestPayload(booking.payload ?? {}));

      return {
        ...customer,
        name: customer.customerRecord?.name || getCustomerName(customer.leads, customer.bookings),
        notes: customer.customerRecord?.notes ?? customer.notes,
        source: getCustomerSource(customer.leads),
        latestStatus: getCustomerLatestStatus(customer.leads, customer.bookings),
        latestCreatedAt: getCustomerLatestDate(customer.leads, customer.bookings),
        nextStep: getCustomerNextStep(customer.leads, customer.bookings, due),
        due,
        isTest,
      };
    })
    .sort((a, b) => {
      if (a.due !== b.due) return a.due ? -1 : 1;
      return compareNewest(a.latestCreatedAt, b.latestCreatedAt);
    });
}

function customerPhaseLabel(customer: CustomerRow) {
  if (customer.bookings.length) return "Buchung";
  if (customer.leads.length) return "Anfrage";
  return "Kontakt";
}

function getLeadLabel(lead: LeadRow) {
  return (
    lead.name ||
    getPayloadText(lead.payload, ["name", "fullName", "email"]) ||
    lead.email ||
    lead.type
  );
}

function getBookingLabel(booking: BookingRow) {
  return (
    booking.guest_name ||
    getPayloadText(booking.payload, ["packageName", "stayName", "guestName", "customerName"]) ||
    booking.status
  );
}

function getSupportLabel(support: SupportRow) {
  return (
    support.subject ||
    getPayloadText(support.payload, ["subject", "title", "supportName", "categoryLabel"]) ||
    supportCategoryLabel(support.category) ||
    "Supportfall"
  );
}

function getSupportContactLabel(support: SupportRow) {
  return (
    support.contact_name ||
    getPayloadText(support.payload, ["ownerName", "guestName", "customerName", "name", "leadName"]) ||
    support.contact_email ||
    support.contact_phone ||
    getPayloadText(support.payload, ["email", "phone"]) ||
    getPayloadText(support.payload, ["ownerEmail", "ownerPhone"]) ||
    "Kontakt"
  );
}

function getSupportRelationId(support: SupportRow, kind: "lead" | "booking") {
  const keys = kind === "lead" ? ["leadId", "lead_id"] : ["bookingId", "booking_id"];
  if (kind === "booking" && support.booking_id) return support.booking_id;
  return getPayloadText(support.payload, keys) || (kind === "lead" ? support.lead_id : null);
}

function supportDateRangeLabel(payload: Record<string, unknown>, support?: SupportRow) {
  if (support?.requested_date_range_label) return support.requested_date_range_label;
  if (support?.requested_starts_on && support.requested_ends_on) {
    return `${support.requested_starts_on} bis ${support.requested_ends_on}`;
  }
  if (support?.requested_starts_on) return `ab ${support.requested_starts_on}`;
  if (support?.requested_ends_on) return `bis ${support.requested_ends_on}`;

  const explicitLabel = getPayloadText(payload, ["requestedDateRangeLabel", "dateRangeLabel", "dateLabel"]);
  if (explicitLabel) return explicitLabel;

  const startsOn = getPayloadText(payload, ["requestedStartsOn", "startsOn", "startDate"]);
  const endsOn = getPayloadText(payload, ["requestedEndsOn", "endsOn", "endDate"]);

  if (startsOn && endsOn) return `${startsOn} bis ${endsOn}`;
  if (startsOn) return `ab ${startsOn}`;
  if (endsOn) return `bis ${endsOn}`;
  return null;
}

function getSupportContextItems(support: SupportRow) {
  const payload = support.payload ?? {};
  const items = [
    ["Objekt", support.property_name || getPayloadText(payload, ["propertyName", "propertyTitle", "stayName"])],
    ["Auszeit", support.package_name || getPayloadText(payload, ["packageName", "packageTitle", "packageSlug"])],
    ["Zeitraum", supportDateRangeLabel(payload, support)],
    ["Eigentümer", support.contact_name || support.contact_email || getPayloadText(payload, ["ownerName", "ownerEmail"])],
    ["Telefon", support.contact_phone || getPayloadText(payload, ["ownerPhone", "phone"])],
  ];

  return items.filter((item): item is [string, string] => Boolean(item[1]));
}

function getFeedbackText(feedback: GuestFeedbackRow) {
  const loved = getPayloadText(feedback.payload, ["loved", "message", "feedback", "text", "note"]);
  const improve = getPayloadText(feedback.payload, ["improve", "improvement", "better"]);
  const parts = [
    loved ? `Gut: ${loved}` : "",
    improve ? `Besser vorbereiten: ${improve}` : "",
  ].filter(Boolean);

  return parts.length ? parts.join("\n") : "Kein Freitext hinterlegt.";
}

function getFeedbackPackageLabel(feedback: GuestFeedbackRow, bookings: BookingRow[]) {
  const booking = feedback.booking_id
    ? bookings.find((item) => item.id === feedback.booking_id)
    : null;

  return (
    getPayloadText(feedback.payload, ["packageName", "stayName"]) ||
    (booking ? getBookingLabel(booking) : null) ||
    "Auszeit"
  );
}

function feedbackReturnInterestLabel(value: string | null) {
  const labels: Record<string, string> = {
    yes: "möchte wiederkommen",
    maybe: "vielleicht wieder",
    no: "aktuell kein Interesse",
  };

  return value ? labels[value] || value : "nicht angegeben";
}

function averageFeedbackRating(feedback: GuestFeedbackRow[]) {
  const ratings = feedback
    .map((item) => item.rating)
    .filter((rating): rating is number => typeof rating === "number");

  if (!ratings.length) return null;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}

function agencyStatusLabel(status: string) {
  const labels: Record<string, string> = {
    lead: "Kontakt prüfen",
    active: "Aktiv",
    paused: "Pausiert",
  };

  return labels[status] || status;
}

function providerStatusLabel(status: string) {
  const labels: Record<string, string> = {
    "in-review": "In Prüfung",
    lead: "Kontakt prüfen",
    partner: "Partner",
    paused: "Pausiert",
  };

  return labels[status] || status;
}

function getInternalNote(payload: Record<string, unknown>) {
  return getPayloadText(payload, ["internalNote", "note", "notes"]) || "";
}

function getPackageName(packages: SimpleRow[], packageId: string | null) {
  if (!packageId) return "Auszeit offen";
  return packages.find((item) => item.id === packageId)?.name || packageId;
}

function getPropertyName(properties: SimpleRow[], propertyId: string | null) {
  if (!propertyId) return "Unterkunft offen";
  return properties.find((item) => item.id === propertyId)?.name || propertyId;
}

function getProviderName(providers: ExperienceProviderRow[], providerId: string | null) {
  if (!providerId) return "Anbieter offen";
  return providers.find((item) => item.id === providerId)?.name || providerId;
}

function getPackageDateRange(date: PackageDateRow) {
  if (date.starts_on && date.ends_on) {
    return `${formatShortDate(date.starts_on)} bis ${formatShortDate(date.ends_on)}`;
  }
  if (date.starts_on) return `ab ${formatShortDate(date.starts_on)}`;
  return "Zeitraum offen";
}

function taskTimingLabel(task: AdminTaskRow) {
  if (task.status === "done") return "erledigt";
  if (!task.due_at) return "ohne Datum";
  if (task.due_at < todayIsoDate()) return "überfällig";
  if (task.due_at === todayIsoDate()) return "heute";
  return formatShortDate(task.due_at);
}

function monitoringItems(data: DashboardData) {
  const items: Array<{
    id: string;
    label: string;
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
  }> = [];

  data.packages.forEach((item) => {
    const dates = data.packageDates.filter((date) => date.package_id === item.id);
    if (!item.status || item.status === "draft") {
      items.push({
        id: `package-status-${item.id}`,
        label: "Auszeit",
        title: item.name || item.id,
        description: "Status, Veröffentlichung und Gastansicht prüfen.",
        severity: "medium",
      });
    }
    if (dates.length === 0) {
      items.push({
        id: `package-dates-${item.id}`,
        label: "Termin",
        title: item.name || item.id,
        description: "Noch kein buchbarer Zeitraum in Supabase gepflegt.",
        severity: "high",
      });
    }
  });

  data.properties.forEach((item) => {
    const propertyPayload = item.payload ?? {};
    if (!item.status || item.status === "draft") {
      items.push({
        id: `property-status-${item.id}`,
        label: "Unterkunft",
        title: item.name || item.id,
        description: "Objektdaten, Regeln, Check-in und Rechte prüfen.",
        severity: "medium",
      });
    }
    if (!(item.address || getPayloadText(propertyPayload, ["address"])) || !(item.check_in_instructions || getPayloadText(propertyPayload, ["checkInInstructions"]))) {
      items.push({
        id: `property-checkin-${item.id}`,
        label: "Check-in",
        title: item.name || item.id,
        description: "Adresse und Check-in-Hinweise fehlen oder sind unvollständig.",
        severity: "high",
      });
    }
    if ((item.house_rules ?? splitLines(getPayloadLines(propertyPayload, ["houseRules"]))).length < 2) {
      items.push({
        id: `property-rules-${item.id}`,
        label: "Regeln",
        title: item.name || item.id,
        description: "Mindestens zwei Unterkunftsregeln pflegen.",
        severity: "medium",
      });
    }
    if ((item.amenities ?? splitLines(getPayloadLines(propertyPayload, ["amenities", "features"]))).length < 3) {
      items.push({
        id: `property-amenities-${item.id}`,
        label: "Ausstattung",
        title: item.name || item.id,
        description: "Mindestens drei relevante Ausstattungsmerkmale ergänzen.",
        severity: "medium",
      });
    }
    if (getPayloadStringArray(propertyPayload, ["attributes"]).length < 2) {
      items.push({
        id: `property-attributes-${item.id}`,
        label: "Attribute",
        title: item.name || item.id,
        description: "Objektattribute für Erlebniswelten und Vermarktung ergänzen.",
        severity: "medium",
      });
    }
    if (getPayloadStringArray(propertyPayload, ["experienceWorlds"]).length === 0) {
      items.push({
        id: `property-worlds-${item.id}`,
        label: "Erlebniswelt",
        title: item.name || item.id,
        description: "Mindestens eine passende Erlebniswelt zuordnen.",
        severity: "medium",
      });
    }
    if (splitLines(getPayloadLines(propertyPayload, ["media"])).length === 0 || !item.image_rights_confirmed) {
      items.push({
        id: `property-media-${item.id}`,
        label: "Medien",
        title: item.name || item.id,
        description: "Bilder und bestätigte Bildrechte ergänzen.",
        severity: "high",
      });
    }
  });

  data.bookings.forEach((booking) => {
    if (booking.status === "Reserviert" || booking.payment_status !== "bezahlt") {
      items.push({
        id: `booking-payment-${booking.id}`,
        label: "Buchung",
        title: getBookingLabel(booking),
        description: "Zahlung, Bestätigung und Gästebereich-Freigabe prüfen.",
        severity: "high",
      });
    }
  });

  data.supportMessages
    .filter((support) => support.status !== "closed")
    .forEach((support) => {
      items.push({
        id: `support-${support.id}`,
        label: "Support",
        title: getSupportContactLabel(support),
        description: `${getSupportLabel(support)} · ${supportUrgencyLabel(support.urgency)}`,
        severity: support.urgency === "high" || support.urgency === "urgent" ? "high" : "medium",
      });
    });

  data.experienceBlocks.forEach((experience) => {
    if (!experience.provider_id || experience.confirmation_status !== "confirmed") {
      items.push({
        id: `experience-${experience.id}`,
        label: "Erlebnis",
        title: experience.title,
        description: `${experience.provider_id ? "Bestätigung prüfen" : "Anbieter verbinden"} · ${experienceRoleLabel(experience.role)}`,
        severity: experience.role === "included" ? "high" : "medium",
      });
    }
  });

  return items.sort((a, b) => {
    const weight = { high: 0, medium: 1, low: 2 };
    return weight[a.severity] - weight[b.severity] || a.title.localeCompare(b.title);
  });
}

export function AdminDashboardClient() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData.session) {
          router.replace("/");
          return;
        }

        const profileResult = await supabase.rpc("get_morrow_admin_profile");

        if (profileResult.error || !profileResult.data) {
          await supabase.auth.signOut();
          router.replace("/");
          return;
        }

        const [
          customersResult,
          leadsResult,
          bookingsResult,
          communicationEventsResult,
          packagesResult,
          propertiesResult,
          tasksResult,
          supportResult,
          providersResult,
          experiencesResult,
          localPlacesResult,
          datesResult,
          ownersResult,
          ownerAccessResult,
          ownerDocumentsResult,
          ownerStatementsResult,
          ownerOperationsResult,
          agenciesResult,
          feedbackResult,
          auditResult,
        ] =
          await Promise.all([
            supabase
              .from("customers")
              .select("id,primary_lead_id,name,email,phone,customer_type,notes,payload,created_at")
              .order("updated_at", { ascending: false })
              .limit(160),
            supabase
              .from("leads")
              .select("id,type,status,name,email,phone,package_slug,source,campaign,follow_up_at,whatsapp_opt_in,whatsapp_consent_at,adults,children,children_ages,dog,archived_at,created_at,payload")
              .order("created_at", { ascending: false })
              .limit(120),
            supabase
              .from("bookings")
              .select("id,lead_id,customer_id,package_id,status,payment_status,guest_access_code,guest_name,guest_email,guest_phone,selected_date,reservation_deadline,payment_due_date,payment_amount,payment_date,payment_method,payment_reference,payment_proof_url,adults,children,children_ages,dog,check_in_status,experience_status,next_task,created_at,payload")
              .order("created_at", { ascending: false })
              .limit(30),
            supabase
              .from("communication_events")
              .select(communicationEventSelectColumns)
              .order("created_at", { ascending: false })
              .limit(120),
            supabase
              .from("packages")
              .select("id,name,slug,audience,location,status,property_id,price_from,concrete_price,payload")
              .order("name"),
            supabase
              .from("properties")
              .select("id,name,location,sleeps,bedrooms,bathrooms,check_in_type,support_type,support_name,image_rights_confirmed,description,owner_name,owner_email,owner_phone,property_type,current_rental,address,earliest_arrival,latest_arrival,check_out_time,key_safe_code,check_in_instructions,amenities,attributes,experience_worlds,house_rules,media,media_alt_texts,cleaning_status,maintenance_status,last_check,status,payload")
              .order("name"),
            supabase
              .from("admin_tasks")
              .select("id,title,reference_type,reference_id,reference_label,due_at,status,priority,note,payload,created_at")
              .order("due_at", { ascending: true, nullsFirst: false })
              .order("created_at", { ascending: false })
              .limit(40),
            supabase
              .from("support_messages")
              .select(supportMessageSelectColumns)
              .order("created_at", { ascending: false })
              .limit(20),
            supabase
              .from("experience_providers")
              .select(experienceProviderSelectColumns)
              .order("name"),
            supabase
              .from("experience_blocks")
              .select(experienceBlockSelectColumns)
              .order("created_at", { ascending: false }),
            supabase
              .from("local_places")
              .select(localPlaceAdminSelectColumns)
              .order("updated_at", { ascending: false })
              .limit(120),
            supabase
              .from("package_dates")
              .select("id,package_id,label,starts_on,ends_on,capacity,status,payload,created_at")
              .order("starts_on", { ascending: true, nullsFirst: false })
              .order("created_at", { ascending: false }),
            supabase
              .from("owner_profiles")
              .select("id,email,display_name,phone,status,payload,created_at")
              .order("created_at", { ascending: false }),
            supabase
              .from("owner_property_access")
              .select("id,owner_profile_id,property_id,role,can_view_financials,can_view_operations,created_at")
              .order("created_at", { ascending: false }),
            supabase
              .from("owner_documents")
              .select("id,property_id,title,document_type,status,url,period_label,payload,created_at")
              .order("created_at", { ascending: false }),
            supabase
              .from("owner_statements")
              .select("id,property_id,period_label,period_start,period_end,status,currency,gross_revenue,morrow_fee,other_costs,owner_payout,document_url,paid_at,payload,created_at")
              .order("period_start", { ascending: false, nullsFirst: false })
              .order("created_at", { ascending: false }),
            supabase
              .from("owner_operations")
              .select("id,property_id,title,operation_type,status,visibility,scheduled_for,completed_at,note,payload,created_at")
              .order("scheduled_for", { ascending: false, nullsFirst: false })
              .order("created_at", { ascending: false }),
            supabase
              .from("agencies")
              .select("id,name,contact_name,email,phone,location,status,managed_property_ids,response_due_days,available_dates_note,payload,created_at")
              .order("name"),
            supabase
              .from("guest_feedback")
              .select("id,lead_id,booking_id,rating,return_interest,payload,created_at")
              .order("created_at", { ascending: false })
              .limit(40),
            supabase
              .from("admin_audit_logs")
              .select("id,actor_email,action,entity_type,entity_id,entity_label,payload,created_at")
              .order("created_at", { ascending: false })
              .limit(80),
          ]);

        if (!isMounted) return;

        const firstError =
          customersResult.error ||
          leadsResult.error ||
          bookingsResult.error ||
          communicationEventsResult.error ||
          packagesResult.error ||
          propertiesResult.error ||
          tasksResult.error ||
          supportResult.error ||
          providersResult.error ||
          experiencesResult.error ||
          localPlacesResult.error ||
          datesResult.error;

        if (firstError) {
          setState({
            status: "error",
            message: "Die Admin-Daten konnten nicht geladen werden.",
          });
          return;
        }

        setState({
          status: "ready",
          data: {
            profile: profileResult.data as AdminProfile,
            customers: (customersResult.data ?? []) as CustomerRecordRow[],
            leads: (leadsResult.data ?? []) as LeadRow[],
            bookings: (bookingsResult.data ?? []) as BookingRow[],
            communicationEvents: (communicationEventsResult.data ?? []) as CommunicationEventRow[],
            packages: (packagesResult.data ?? []) as SimpleRow[],
            properties: (propertiesResult.data ?? []) as SimpleRow[],
            tasks: (tasksResult.data ?? []) as AdminTaskRow[],
            supportMessages: (supportResult.data ?? []) as SupportRow[],
            experienceProviders: (providersResult.data ?? []) as ExperienceProviderRow[],
            experienceBlocks: (experiencesResult.data ?? []) as ExperienceBlockRow[],
            localPlaces: (localPlacesResult.data ?? []) as LocalPlaceRow[],
            packageDates: (datesResult.data ?? []) as PackageDateRow[],
            ownerProfiles: ownersResult.error ? [] : (ownersResult.data ?? []) as OwnerProfileRow[],
            ownerAccess: ownerAccessResult.error ? [] : (ownerAccessResult.data ?? []) as OwnerAccessRow[],
            ownerDocuments: ownerDocumentsResult.error ? [] : (ownerDocumentsResult.data ?? []) as OwnerDocumentRow[],
            ownerStatements: ownerStatementsResult.error ? [] : (ownerStatementsResult.data ?? []) as OwnerStatementRow[],
            ownerOperations: ownerOperationsResult.error ? [] : (ownerOperationsResult.data ?? []) as OwnerOperationRow[],
            agencies: agenciesResult.error ? [] : (agenciesResult.data ?? []) as AgencyRow[],
            guestFeedback: feedbackResult.error ? [] : (feedbackResult.data ?? []) as GuestFeedbackRow[],
            auditLogs: auditResult.error ? [] : (auditResult.data ?? []) as AuditLogRow[],
          },
        });
      } catch {
        if (!isMounted) return;
        setState({
          status: "error",
          message: "Die Admin-Daten konnten nicht geladen werden.",
        });
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (state.status === "loading") {
    return (
      <main className="admin-shell">
        <div className="admin-center-state">
          <p className="admin-eyebrow">Morrow Admin</p>
          <h1>Zugang wird geprüft.</h1>
        </div>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="admin-shell">
        <div className="admin-center-state">
          <p className="admin-eyebrow">Morrow Admin</p>
          <h1>{state.message}</h1>
          <button className="admin-button secondary" onClick={handleLogout} type="button">
            Zurück zum Login
          </button>
        </div>
      </main>
    );
  }

  return <AdminDashboardView data={state.data} onLogout={handleLogout} />;
}

function AdminDashboardView({
  data: initialData,
  onLogout,
}: {
  data: DashboardData;
  onLogout: () => void;
}) {
  const [dataState, setDataState] = useState(initialData);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<AdminWorkspace>("overview");
  const [selection, setSelection] = useState<DetailSelection>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerPhaseFilter, setCustomerPhaseFilter] = useState<CustomerPhaseFilter>("all");
  const [communicationChannelFilter, setCommunicationChannelFilter] = useState<CommunicationChannelFilter>("all");
  const [communicationSearch, setCommunicationSearch] = useState("");
  const [supportStatusFilter, setSupportStatusFilter] = useState<SupportStatusFilter>("all");
  const [supportUrgencyFilter, setSupportUrgencyFilter] = useState<SupportUrgencyFilter>("all");
  const [supportCategoryFilter, setSupportCategoryFilter] = useState("all");
  const [leadScopeFilter, setLeadScopeFilter] = useState<LeadScopeFilter>("active");
  const [leadTypeFilter, setLeadTypeFilter] = useState<LeadTypeFilter>("all");
  const [leadStatusFilter, setLeadStatusFilter] = useState<LeadStatusFilter>("all");
  const [leadWorkFilter, setLeadWorkFilter] = useState<LeadWorkFilter>("all");
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatusFilter>("open");
  const [taskReferenceFilter, setTaskReferenceFilter] = useState<TaskReferenceFilter>("all");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<TaskPriorityFilter>("all");
  const [taskDraft, setTaskDraft] = useState<TaskDraft>({
    title: "",
    referenceValue: "",
    dueAt: todayIsoDate(),
    priority: "medium",
    note: "",
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [inventorySelection, setInventorySelection] = useState<InventorySelection>(null);
  const [inventoryDraft, setInventoryDraft] = useState<InventoryDraft>({});
  const [inventoryMessage, setInventoryMessage] = useState<string | null>(null);
  const [experienceSelection, setExperienceSelection] = useState<ExperienceSelection>(null);
  const [experienceDraft, setExperienceDraft] = useState<ExperienceDraft>({});
  const [experienceMessage, setExperienceMessage] = useState<string | null>(null);
  const [localPlaceSelection, setLocalPlaceSelection] = useState<LocalPlaceSelection>(null);
  const [localPlaceDraft, setLocalPlaceDraft] = useState<LocalPlaceDraft>({});
  const [localPlaceMessage, setLocalPlaceMessage] = useState<string | null>(null);
  const [dateSelection, setDateSelection] = useState<DateSelection>(null);
  const [dateDraft, setDateDraft] = useState<DateDraft>({});
  const [dateMessage, setDateMessage] = useState<string | null>(null);
  const [ownerProfileDraft, setOwnerProfileDraft] = useState<OwnerProfileDraft>({
    email: "",
    display_name: "",
    phone: "",
    status: "active",
  });
  const [ownerAccessDraft, setOwnerAccessDraft] = useState<OwnerAccessDraft>({
    owner_profile_id: "",
    property_id: "",
    role: "owner",
    can_view_financials: true,
    can_view_operations: true,
  });
  const [ownerDocumentDraft, setOwnerDocumentDraft] = useState<OwnerDocumentDraft>({
    property_id: "",
    title: "",
    document_type: "document",
    status: "visible",
    url: "",
    period_label: "",
  });
  const [ownerStatementDraft, setOwnerStatementDraft] = useState<OwnerStatementDraft>({
    property_id: "",
    period_label: "",
    period_start: "",
    period_end: "",
    status: "draft",
    gross_revenue: "",
    morrow_fee: "",
    other_costs: "",
    owner_payout: "",
    document_url: "",
    paid_at: "",
  });
  const [ownerOperationDraft, setOwnerOperationDraft] = useState<OwnerOperationDraft>({
    property_id: "",
    title: "",
    operation_type: "maintenance",
    status: "planned",
    visibility: "owner_visible",
    scheduled_for: "",
    completed_at: "",
    note: "",
  });
  const [agencyDraft, setAgencyDraft] = useState<AgencyDraft>({
    id: "",
    name: "",
    contact_name: "",
    email: "",
    phone: "",
    location: "Sankt Peter-Ording",
    status: "lead",
    managed_property_ids: [],
    response_due_days: "2",
    available_dates_note: "",
    next_follow_up_at: "",
    notes: "",
  });
  const [providerDraft, setProviderDraft] = useState<ProviderDraft>({
    id: "",
    name: "",
    contact_name: "",
    email: "",
    phone: "",
    location: "Sankt Peter-Ording",
    category: "",
    status: "lead",
    website: "",
    audience_fit: "both",
    collaboration_note: "",
    pricing_note: "",
    availability_note: "",
    notes: "",
  });
  const [ownerMessage, setOwnerMessage] = useState<string | null>(null);
  const [agencyMessage, setAgencyMessage] = useState<string | null>(null);
  const [providerMessage, setProviderMessage] = useState<string | null>(null);
  const [communicationEvents, setCommunicationEvents] = useState<CommunicationEventRow[]>([]);
  const [drawerAuditLogs, setDrawerAuditLogs] = useState<AuditLogRow[]>([]);
  const [customerCommunicationEvents, setCustomerCommunicationEvents] = useState<CommunicationEventRow[]>([]);
  const [customerAuditLogs, setCustomerAuditLogs] = useState<AuditLogRow[]>([]);
  const [customerDrawerMessage, setCustomerDrawerMessage] = useState<string | null>(null);
  const [customerNoteDraft, setCustomerNoteDraft] = useState("");
  const [isCustomerDrawerLoading, setIsCustomerDrawerLoading] = useState(false);
  const [drawerNote, setDrawerNote] = useState("");
  const [outboundDraft, setOutboundDraft] = useState<OutboundDraft>({ subject: "", body: "" });
  const [leadDetailsDraft, setLeadDetailsDraft] = useState<LeadDetailsDraft>(leadDetailsDraftFromLead(null));
  const [paymentDraft, setPaymentDraft] = useState<PaymentDraft>(paymentDraftFromBooking(null));
  const [bookingOperationsDraft, setBookingOperationsDraft] = useState<BookingOperationsDraft>(
    bookingOperationsDraftFromBooking(null),
  );
  const [drawerMessage, setDrawerMessage] = useState<string | null>(null);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const data = dataState;
  const openLeads = useMemo(() => getOpenLeads(data.leads), [data.leads]);
  const activeLeads = data.leads.filter((lead) => !lead.archived_at);
  const archivedLeads = data.leads.filter((lead) => lead.archived_at);
  const filteredLeads = data.leads
    .filter((lead) => leadScopeFilter === "archived" ? Boolean(lead.archived_at) : !lead.archived_at)
    .filter((lead) => leadTypeFilter === "all" || lead.type === leadTypeFilter)
    .filter((lead) => leadStatusFilter === "all" || lead.status === leadStatusFilter)
    .filter((lead) => {
      if (leadWorkFilter === "due") return isLeadDue(lead);
      if (leadWorkFilter === "new") return lead.status === "Neu";
      if (leadWorkFilter === "review") return lead.status === "In Prüfung";
      return true;
    })
    .sort((a, b) => Number(isLeadDue(b)) - Number(isLeadDue(a)) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const customerRows = useMemo(
    () => buildCustomerRows(data.leads, data.bookings, data.customers),
    [data.leads, data.bookings, data.customers],
  );
  const activeCustomerRows = customerRows.filter((customer) => !customer.isTest);
  const filteredCustomerRows = activeCustomerRows.filter((customer) => {
    if (customerPhaseFilter === "request") return customer.leads.length > 0 && customer.bookings.length === 0;
    if (customerPhaseFilter === "booking") return customer.bookings.length > 0;
    if (customerPhaseFilter === "due") return customer.due;
    return true;
  });
  const selectedCustomer = selectedCustomerId
    ? customerRows.find((customer) => customer.id === selectedCustomerId) ?? null
    : null;
  const paidBookings = data.bookings.filter((booking) => booking.payment_status === "bezahlt");
  const openSupport = data.supportMessages.filter((message) => message.status !== "closed");
  const supportCategoryOptions = useMemo(() => (
    Array.from(new Set(data.supportMessages.map((support) => support.category || "general")))
      .sort((a, b) => supportCategoryLabel(a).localeCompare(supportCategoryLabel(b)))
  ), [data.supportMessages]);
  const filteredSupportMessages = useMemo(() => (
    data.supportMessages
      .filter((support) => supportStatusFilter === "all" || support.status === supportStatusFilter)
      .filter((support) => supportUrgencyFilter === "all" || supportUrgencyGroup(support.urgency) === supportUrgencyFilter)
      .filter((support) => supportCategoryFilter === "all" || support.category === supportCategoryFilter)
      .sort((a, b) => {
        if (a.status !== b.status) {
          if (a.status === "closed") return 1;
          if (b.status === "closed") return -1;
        }
        const urgencyDiff = supportUrgencyRank(a.urgency) - supportUrgencyRank(b.urgency);
        if (urgencyDiff !== 0) return urgencyDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
  ), [data.supportMessages, supportCategoryFilter, supportStatusFilter, supportUrgencyFilter]);
  const activeTasks = data.tasks.filter((task) => task.status !== "done");
  const dueTasks = activeTasks.filter((task) => task.due_at && task.due_at <= todayIsoDate());
  const taskReferenceOptions = useMemo(() => buildTaskReferenceOptions(data), [data]);
  const taskReferenceSelectOptions = useMemo(() => {
    if (!taskDraft.referenceValue || taskReferenceOptions.some((option) => option.value === taskDraft.referenceValue)) {
      return taskReferenceOptions;
    }

    const editingTask = editingTaskId ? data.tasks.find((task) => task.id === editingTaskId) : null;
    if (!editingTask) return taskReferenceOptions;

    return [
      {
        value: taskDraft.referenceValue,
        type: editingTask.reference_type,
        id: editingTask.reference_id,
        label: editingTask.reference_label || editingTask.reference_id,
      },
      ...taskReferenceOptions,
    ];
  }, [data.tasks, editingTaskId, taskDraft.referenceValue, taskReferenceOptions]);
  const filteredTasks = useMemo(() => (
    [...data.tasks]
      .filter((task) => taskStatusFilter === "all" || task.status === taskStatusFilter)
      .filter((task) => {
        if (taskReferenceFilter === "all") return true;
        if (taskReferenceFilter === "support") return task.reference_type === "support" ||
          task.title.toLowerCase().startsWith("support:");
        return task.reference_type === taskReferenceFilter;
      })
      .filter((task) => taskPriorityFilter === "all" || task.priority === taskPriorityFilter)
      .sort((a, b) => {
        if (a.status !== b.status) return Number(a.status === "done") - Number(b.status === "done");
        if (a.due_at && b.due_at) return a.due_at.localeCompare(b.due_at);
        if (a.due_at) return -1;
        if (b.due_at) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
  ), [data.tasks, taskPriorityFilter, taskReferenceFilter, taskStatusFilter]);
  const approvedLocalPlaces = data.localPlaces.filter((place) => place.status === "approved");
  const candidateLocalPlaces = data.localPlaces.filter((place) => place.status === "candidate");
  const monitoring = monitoringItems(data);
  const averageRating = averageFeedbackRating(data.guestFeedback);
  const lowFeedback = data.guestFeedback.filter((feedback) => typeof feedback.rating === "number" && feedback.rating <= 3);
  const overviewWorkItems = [
    ...dueTasks.slice(0, 4).map((task) => ({
      id: `task-${task.id}`,
      label: taskReferenceLabel(task.reference_type),
      title: task.title,
      meta: `${taskTimingLabel(task)} · ${task.reference_label || task.reference_id}`,
      action: () => openTaskReference(task),
    })),
    ...activeLeads.filter(isLeadDue).slice(0, 3).map((lead) => ({
      id: `lead-${lead.id}`,
      label: "Anfrage",
      title: getLeadLabel(lead),
      meta: `${leadWorkLabel(lead)} · ${lead.status}`,
      action: () => {
        setActiveWorkspace("crm");
        setSelection({ type: "lead", id: lead.id });
      },
    })),
    ...[...openSupport]
      .sort((a, b) => supportUrgencyRank(a.urgency) - supportUrgencyRank(b.urgency) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
      .map((support) => ({
        id: `support-${support.id}`,
        label: "Support",
        title: getSupportLabel(support),
        meta: `${supportUrgencyLabel(support.urgency)} · ${supportCategoryLabel(support.category)}`,
        action: () => {
          setActiveWorkspace("support");
          setSelection({ type: "support", id: support.id });
        },
      })),
    ...lowFeedback.slice(0, 2).map((feedback) => {
      const booking = feedback.booking_id
        ? data.bookings.find((item) => item.id === feedback.booking_id)
        : null;

      return {
        id: `feedback-${feedback.id}`,
        label: "Feedback",
        title: getFeedbackPackageLabel(feedback, data.bookings),
        meta: `${feedback.rating}/5 · ${feedbackReturnInterestLabel(feedback.return_interest)}`,
        action: () => {
          if (booking) {
            setActiveWorkspace("crm");
            setSelection({ type: "booking", id: booking.id });
            return;
          }
          setActiveWorkspace("support");
        },
      };
    }),
  ].slice(0, 8);
  const filteredCommunicationEvents = useMemo(() => {
    const search = communicationSearch.trim().toLowerCase();

    return data.communicationEvents.filter((event) => {
      if (communicationChannelFilter === "email" && event.channel !== "email") return false;
      if (communicationChannelFilter === "note" && event.channel !== "note") return false;
      if (
        ["inbound", "outbound", "internal"].includes(communicationChannelFilter) &&
        event.direction !== communicationChannelFilter
      ) return false;

      if (!search) return true;

      const context = communicationContextLabel(event, data);
      const searchable = [
        context,
        communicationChannelLabel(event.channel),
        communicationDirectionLabel(event.direction),
        event.subject,
        event.body,
        event.recipient,
        event.actor,
        event.status,
      ].filter(Boolean).join(" ").toLowerCase();

      return searchable.includes(search);
    });
  }, [communicationChannelFilter, communicationSearch, data]);
  const displayName = data.profile.name || data.profile.email;
  const selectedLead = selection?.type === "lead"
    ? data.leads.find((lead) => lead.id === selection.id) ?? null
    : null;
  const selectedBooking = selection?.type === "booking"
    ? data.bookings.find((booking) => booking.id === selection.id) ?? null
    : null;
  const selectedSupport = selection?.type === "support"
    ? data.supportMessages.find((support) => support.id === selection.id) ?? null
    : null;
  const selectedDrawerPayload = selectedLead?.payload ?? selectedBooking?.payload ?? selectedSupport?.payload ?? {};
  const selectedDrawerEmail = selectedLead?.email || getPayloadText(selectedDrawerPayload, ["email"]);
  const selectedPackage = inventorySelection?.mode === "edit" && inventorySelection.type === "package"
    ? data.packages.find((item) => item.id === inventorySelection.id) ?? null
    : null;
  const selectedProperty = inventorySelection?.mode === "edit" && inventorySelection.type === "property"
    ? data.properties.find((item) => item.id === inventorySelection.id) ?? null
    : null;
  const selectedExperience = experienceSelection?.mode === "edit"
    ? data.experienceBlocks.find((item) => item.id === experienceSelection.id) ?? null
    : null;
  const selectedLocalPlace = localPlaceSelection?.mode === "edit"
    ? data.localPlaces.find((item) => item.id === localPlaceSelection.id) ?? null
    : null;
  const selectedDate = dateSelection?.mode === "edit"
    ? data.packageDates.find((item) => item.id === dateSelection.id) ?? null
    : null;
  const workspace = adminWorkspaces.find((item) => item.id === activeWorkspace) ?? adminWorkspaces[0];
  const activeAgencies = data.agencies.filter((agency) => agency.status === "active");
  const agenciesWithoutDates = data.agencies.filter((agency) =>
    agency.status !== "paused" && !String(agency.available_dates_note || "").trim(),
  );
  const agenciesWithProperties = data.agencies.filter((agency) => agency.managed_property_ids.length > 0);
  const agencyFollowUpsDue = data.agencies.filter((agency) => {
    const followUpAt = getPayloadText(agency.payload ?? {}, ["nextFollowUpAt", "next_follow_up_at"]);
    return Boolean(agency.status !== "paused" && followUpAt && followUpAt.slice(0, 10) <= todayIsoDate());
  });

  useEffect(() => {
    setInventoryMessage(null);

    if (inventorySelection?.mode === "create" && inventorySelection.type === "package") {
      setInventoryDraft({
        name: "",
        slug: "",
        status: "draft",
        audience: "families",
        location: "Sankt Peter-Ording",
        property_id: "",
        price_from: "",
        concrete_price: "",
        headline: "",
        subheadline: "",
        short_description: "",
        experience_feeling: "",
        included_items: "",
        highlights: "",
        recommendations: "",
        faq: "",
        launch_note: "",
        hero_image: "",
        gallery_images: "",
      });
      return;
    }

    if (inventorySelection?.mode === "create" && inventorySelection.type === "property") {
      setInventoryDraft({
        name: "",
        status: "draft",
        location: "Sankt Peter-Ording",
        sleeps: "",
        bedrooms: "",
        bathrooms: "",
        description: "",
        owner_name: "",
        owner_email: "",
        owner_phone: "",
        property_type: "",
        current_rental: "agency",
        check_in_type: "",
        support_type: "",
        support_name: "",
        address: "",
        earliest_arrival: "",
        latest_arrival: "",
        check_out_time: "",
        key_safe_code: "",
        check_in_instructions: "",
        amenities: "",
        attributes: [],
        experience_worlds: [],
        house_rules: "",
        media: "",
        media_alt_texts: "",
        image_rights_confirmed: false,
      });
      return;
    }

    if (inventorySelection?.mode === "edit" && inventorySelection.type === "package") {
      const item = data.packages.find((packageItem) => packageItem.id === inventorySelection.id);
      setInventoryDraft(item ? {
        name: item.name || "",
        slug: item.slug || "",
        status: item.status || "draft",
        audience: item.audience || "",
        location: item.location || "",
        property_id: item.property_id || "",
        price_from: item.price_from || "",
        concrete_price: item.concrete_price || "",
        headline: getPayloadText(item.payload ?? {}, ["headline", "heroHeadline"]) || "",
        subheadline: getPayloadText(item.payload ?? {}, ["subheadline", "heroSubheadline"]) || "",
        short_description: getPayloadText(item.payload ?? {}, ["shortDescription", "short_description", "description"]) || "",
        experience_feeling: getPayloadText(item.payload ?? {}, ["experienceFeeling", "experience_feeling", "feeling"]) || "",
        included_items: getPayloadLines(item.payload ?? {}, ["includedItems", "included_items", "included"]) || "",
        highlights: getPayloadLines(item.payload ?? {}, ["highlights", "moments"]) || "",
        recommendations: getPayloadLines(item.payload ?? {}, ["recommendations", "localRecommendations"]) || "",
        faq: getPayloadLines(item.payload ?? {}, ["faq", "faqs"]) || "",
        launch_note: getPayloadText(item.payload ?? {}, ["launchNote", "launch_note", "internalLaunchNote"]) || "",
        hero_image: getPayloadText(item.payload ?? {}, ["heroImage", "hero_image"]) || "",
        gallery_images: getPayloadLines(item.payload ?? {}, ["galleryImages", "gallery_images", "images"]) || "",
      } : {});
      return;
    }

    if (inventorySelection?.mode === "edit" && inventorySelection.type === "property") {
      const item = data.properties.find((property) => property.id === inventorySelection.id);
      setInventoryDraft(item ? {
        name: item.name || "",
        status: item.status || "draft",
        location: item.location || "",
        sleeps: item.sleeps?.toString() || "",
        bedrooms: item.bedrooms?.toString() || "",
        bathrooms: item.bathrooms?.toString() || "",
        description: item.description || getPayloadText(item.payload ?? {}, ["description"]) || "",
        owner_name: item.owner_name || getPayloadText(item.payload ?? {}, ["ownerName"]) || "",
        owner_email: item.owner_email || getPayloadText(item.payload ?? {}, ["email", "ownerEmail"]) || "",
        owner_phone: item.owner_phone || getPayloadText(item.payload ?? {}, ["phone", "ownerPhone"]) || "",
        property_type: item.property_type || getPayloadText(item.payload ?? {}, ["propertyType"]) || "",
        current_rental: item.current_rental || getPayloadText(item.payload ?? {}, ["currentRental"]) || "agency",
        check_in_type: item.check_in_type || "",
        support_type: item.support_type || "",
        support_name: item.support_name || "",
        address: item.address || getPayloadText(item.payload ?? {}, ["address"]) || "",
        earliest_arrival: item.earliest_arrival || getPayloadText(item.payload ?? {}, ["earliestArrival"]) || "",
        latest_arrival: item.latest_arrival || getPayloadText(item.payload ?? {}, ["latestArrival"]) || "",
        check_out_time: item.check_out_time || getPayloadText(item.payload ?? {}, ["checkOutTime"]) || "",
        key_safe_code: item.key_safe_code || getPayloadText(item.payload ?? {}, ["keySafeCode"]) || "",
        check_in_instructions: item.check_in_instructions || getPayloadText(item.payload ?? {}, ["checkInInstructions"]) || "",
        amenities: item.amenities?.join("\n") || getPayloadLines(item.payload ?? {}, ["amenities", "features"]),
        attributes: item.attributes ?? getPayloadStringArray(item.payload ?? {}, ["attributes"]),
        experience_worlds: item.experience_worlds ?? getPayloadStringArray(item.payload ?? {}, ["experienceWorlds"]),
        house_rules: item.house_rules?.join("\n") || getPayloadLines(item.payload ?? {}, ["houseRules"]),
        media: item.media?.join("\n") || getPayloadLines(item.payload ?? {}, ["media"]),
        media_alt_texts: item.media_alt_texts?.join("\n") || getPayloadLines(item.payload ?? {}, ["mediaAltTexts"]),
        image_rights_confirmed: Boolean(item.image_rights_confirmed) || getPayloadBool(item.payload ?? {}, ["imageRightsConfirmed"]),
      } : {});
      return;
    }

    setInventoryDraft({});
  }, [inventorySelection, data.packages, data.properties]);

  useEffect(() => {
    setExperienceMessage(null);

    if (!experienceSelection) {
      setExperienceDraft({});
      return;
    }

    if (experienceSelection.mode === "create") {
      setExperienceDraft({
        title: "",
        package_id: data.packages[0]?.id || "",
        provider_id: "",
        role: "planned",
        confirmation_status: "planned",
        included_in_price: false,
        guest_note: "",
        price_note: "",
        capacity_note: "",
        availability_note: "",
        quality_score: "",
        quality_note: "",
      });
      return;
    }

    const item = data.experienceBlocks.find((experience) => experience.id === experienceSelection.id);
    setExperienceDraft(item ? {
      title: item.title,
      package_id: item.package_id || "",
      provider_id: item.provider_id || "",
      role: item.role || "planned",
      confirmation_status: item.confirmation_status || "planned",
      included_in_price: Boolean(item.included_in_price),
      guest_note: item.guest_note || getPayloadText(item.payload, ["guestNote", "guestNotes", "description"]) || "",
      price_note: item.price_note || getPayloadText(item.payload, ["priceNote", "price", "cost"]) || "",
      capacity_note: item.capacity_note || getPayloadText(item.payload, ["capacityNote", "capacity"]) || "",
      availability_note: item.availability_note || getPayloadText(item.payload, ["availabilityNote", "availability"]) || "",
      quality_score: item.quality_score ? String(item.quality_score) : getPayloadText(item.payload, ["qualityScore", "quality_score"]) || "",
      quality_note: item.quality_note || getPayloadText(item.payload, ["qualityNote", "quality_note"]) || "",
    } : {});
  }, [experienceSelection, data.experienceBlocks, data.packages]);

  useEffect(() => {
    setLocalPlaceMessage(null);

    if (!localPlaceSelection) {
      setLocalPlaceDraft({});
      return;
    }

    if (localPlaceSelection.mode === "create") {
      setLocalPlaceDraft({
        name: "",
        category: "food",
        status: "candidate",
        lat: "",
        lng: "",
        address: "",
        website: "",
        reservation_url: "",
        menu_url: "",
        rating: "",
        opening_hours: "",
        package_fit: "",
        curation_kind: "local_tip",
        event_date: "",
        event_time: "",
        event_audience: "",
        event_setting: "",
        event_fit_note: "",
        description: "",
        cuisine: "",
        best_for: "",
        images: "",
      });
      return;
    }

    const item = data.localPlaces.find((place) => place.id === localPlaceSelection.id);
    setLocalPlaceDraft(item ? {
      name: item.name,
      category: item.category || "food",
      status: item.status || "candidate",
      lat: item.lat?.toString() || "",
      lng: item.lng?.toString() || "",
      address: item.address || "",
      website: item.website || "",
      reservation_url: item.reservation_url || "",
      menu_url: item.menu_url || "",
      rating: item.rating?.toString() || "",
      opening_hours: getPayloadText(item.payload, ["openingHours", "openingHoursNote", "hours"]) ||
        (typeof item.opening_hours?.note === "string" ? item.opening_hours.note : ""),
      package_fit: Array.isArray(item.package_fit) && item.package_fit.length
        ? item.package_fit.join("\n")
        : getPayloadLines(item.payload, ["packageFit"]),
      curation_kind: item.curation_kind || getPayloadText(item.payload, ["curationKind", "curation_kind"]) ||
        (item.category === "event" ? "local_event" : "local_tip"),
      event_date: item.event_date || getPayloadText(item.payload, ["eventDate", "startsOn", "date"]) || "",
      event_time: item.event_time || getPayloadText(item.payload, ["eventTime", "time"]) || "",
      event_audience: item.event_audience || getPayloadText(item.payload, ["eventAudience", "audience"]) || "",
      event_setting: item.event_setting || getPayloadText(item.payload, ["eventSetting", "setting"]) || "",
      event_fit_note: item.event_fit_note || getPayloadText(item.payload, ["eventFitNote", "fitNote", "morrowFit"]) || "",
      description: item.description || getPayloadText(item.payload, ["description", "guestDescription", "morrowNote", "routeNote"]) || "",
      cuisine: item.cuisine || getPayloadText(item.payload, ["cuisine"]) || "",
      best_for: item.best_for?.join("\n") || item.audiences?.join("\n") || getPayloadLines(item.payload, ["bestFor", "audiences"]),
      images: item.images?.join("\n") || getPayloadLines(item.payload, ["images"]),
    } : {});
  }, [localPlaceSelection, data.localPlaces]);

  useEffect(() => {
    setDateMessage(null);

    if (!dateSelection) {
      setDateDraft({});
      return;
    }

    if (dateSelection.mode === "create") {
      setDateDraft({
        label: "",
        package_id: data.packages[0]?.id || "",
        starts_on: "",
        ends_on: "",
        capacity: "",
        status: "available",
        note: "",
      });
      return;
    }

    const item = data.packageDates.find((date) => date.id === dateSelection.id);
    setDateDraft(item ? {
      label: item.label || "",
      package_id: item.package_id || "",
      starts_on: item.starts_on || "",
      ends_on: item.ends_on || "",
      capacity: item.capacity?.toString() || "",
      status: item.status || "available",
      note: getPayloadText(item.payload, ["note", "internalNote", "availabilityNote"]) || "",
    } : {});
  }, [dateSelection, data.packageDates, data.packages]);

  useEffect(() => {
    if (!selection) {
      setCommunicationEvents([]);
      setDrawerAuditLogs([]);
      setDrawerNote("");
      setOutboundDraft({ subject: "", body: "" });
      setLeadDetailsDraft(leadDetailsDraftFromLead(null));
      setPaymentDraft(paymentDraftFromBooking(null));
      setBookingOperationsDraft(bookingOperationsDraftFromBooking(null));
      setDrawerMessage(null);
      return;
    }

    const currentPayload = selection.type === "lead"
      ? data.leads.find((lead) => lead.id === selection.id)?.payload
      : selection.type === "booking"
        ? data.bookings.find((booking) => booking.id === selection.id)?.payload
        : data.supportMessages.find((support) => support.id === selection.id)?.payload;

    setDrawerNote(currentPayload ? getInternalNote(currentPayload) : "");
    setOutboundDraft({
      subject: selection.type === "lead"
        ? "Rückmeldung zu eurer Morrow Anfrage"
        : selection.type === "booking"
          ? "Zu eurer Morrow Auszeit"
          : "Rückmeldung zu eurer Nachricht",
      body: "",
    });
    setPaymentDraft(selection.type === "booking"
      ? paymentDraftFromBooking(data.bookings.find((booking) => booking.id === selection.id) ?? null)
      : paymentDraftFromBooking(null));
    setLeadDetailsDraft(selection.type === "lead"
      ? leadDetailsDraftFromLead(data.leads.find((lead) => lead.id === selection.id) ?? null)
      : leadDetailsDraftFromLead(null));
    setBookingOperationsDraft(selection.type === "booking"
      ? bookingOperationsDraftFromBooking(data.bookings.find((booking) => booking.id === selection.id) ?? null)
      : bookingOperationsDraftFromBooking(null));
    setDrawerMessage(null);

    let isMounted = true;
    const activeSelection = selection;

    async function loadEvents() {
      setIsDrawerLoading(true);
      try {
        const supabase = createSupabaseBrowserClient();
        const query = supabase
          .from("communication_events")
          .select(communicationEventSelectColumns)
          .order("created_at", { ascending: false })
          .limit(40);
        const selectedSupportCase = activeSelection.type === "support"
          ? data.supportMessages.find((support) => support.id === activeSelection.id)
          : null;
        const supportLeadId = selectedSupportCase
          ? getSupportRelationId(selectedSupportCase, "lead")
          : null;
        const supportBookingId = selectedSupportCase
          ? getSupportRelationId(selectedSupportCase, "booking")
          : null;
        const { data: events, error } = activeSelection.type === "lead"
          ? await query.eq("lead_id", activeSelection.id)
          : activeSelection.type === "booking"
            ? await query.eq("booking_id", activeSelection.id)
            : supportLeadId && supportBookingId
              ? await query.or(`lead_id.eq.${supportLeadId},booking_id.eq.${supportBookingId}`)
              : supportLeadId
                ? await query.eq("lead_id", supportLeadId)
                : supportBookingId
                  ? await query.eq("booking_id", supportBookingId)
                  : await query.eq("support_id", activeSelection.id);

        if (!isMounted) return;
        if (error) {
          setDrawerMessage("Historie konnte nicht geladen werden.");
          setCommunicationEvents([]);
          setDrawerAuditLogs([]);
          return;
        }

        const { data: auditLogs } = await supabase
          .from("admin_audit_logs")
          .select("id,actor_email,action,entity_type,entity_id,entity_label,payload,created_at")
          .eq("entity_type", activeSelection.type)
          .eq("entity_id", activeSelection.id)
          .order("created_at", { ascending: false })
          .limit(30);

        setCommunicationEvents((events ?? []) as CommunicationEventRow[]);
        setDrawerAuditLogs((auditLogs ?? []) as AuditLogRow[]);
      } catch {
        if (!isMounted) return;
        setDrawerMessage("Historie konnte nicht geladen werden.");
        setCommunicationEvents([]);
        setDrawerAuditLogs([]);
      } finally {
        if (isMounted) setIsDrawerLoading(false);
      }
    }

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, [selection, data.leads, data.bookings, data.supportMessages]);

  useEffect(() => {
    if (!selectedCustomer) {
      setCustomerCommunicationEvents([]);
      setCustomerAuditLogs([]);
      setCustomerDrawerMessage(null);
      setCustomerNoteDraft("");
      setIsCustomerDrawerLoading(false);
      return;
    }

    setCustomerNoteDraft(selectedCustomer.notes || "");

    let isMounted = true;
    const activeCustomer = selectedCustomer;

    async function loadCustomerHistory() {
      setIsCustomerDrawerLoading(true);
      setCustomerDrawerMessage(null);

      try {
        const supabase = createSupabaseBrowserClient();
        const leadIds = activeCustomer.leads.map((lead) => lead.id);
        const bookingIds = activeCustomer.bookings.map((booking) => booking.id);

        const [leadEventsResult, bookingEventsResult, leadAuditResult, bookingAuditResult, customerAuditResult] = await Promise.all([
          leadIds.length
            ? supabase
                .from("communication_events")
                .select(communicationEventSelectColumns)
                .in("lead_id", leadIds)
                .order("created_at", { ascending: false })
                .limit(40)
            : Promise.resolve({ data: [], error: null }),
          bookingIds.length
            ? supabase
                .from("communication_events")
                .select(communicationEventSelectColumns)
                .in("booking_id", bookingIds)
                .order("created_at", { ascending: false })
                .limit(40)
            : Promise.resolve({ data: [], error: null }),
          leadIds.length
            ? supabase
                .from("admin_audit_logs")
                .select("id,actor_email,action,entity_type,entity_id,entity_label,payload,created_at")
                .eq("entity_type", "lead")
                .in("entity_id", leadIds)
                .order("created_at", { ascending: false })
                .limit(30)
            : Promise.resolve({ data: [], error: null }),
          bookingIds.length
            ? supabase
                .from("admin_audit_logs")
                .select("id,actor_email,action,entity_type,entity_id,entity_label,payload,created_at")
                .eq("entity_type", "booking")
                .in("entity_id", bookingIds)
                .order("created_at", { ascending: false })
                .limit(30)
            : Promise.resolve({ data: [], error: null }),
          activeCustomer.customerRecord
            ? supabase
                .from("admin_audit_logs")
                .select("id,actor_email,action,entity_type,entity_id,entity_label,payload,created_at")
                .eq("entity_type", "customer")
                .eq("entity_id", activeCustomer.customerRecord.id)
                .order("created_at", { ascending: false })
                .limit(30)
            : Promise.resolve({ data: [], error: null }),
        ]);

        if (!isMounted) return;
        if (
          leadEventsResult.error ||
          bookingEventsResult.error ||
          leadAuditResult.error ||
          bookingAuditResult.error ||
          customerAuditResult.error
        ) {
          setCustomerDrawerMessage("Kundenhistorie konnte nicht vollständig geladen werden.");
        }

        const eventsById = new Map(
          [
            ...((leadEventsResult.data ?? []) as CommunicationEventRow[]),
            ...((bookingEventsResult.data ?? []) as CommunicationEventRow[]),
          ].map((event) => [event.id, event]),
        );
        const auditsById = new Map(
          [
            ...((leadAuditResult.data ?? []) as AuditLogRow[]),
            ...((bookingAuditResult.data ?? []) as AuditLogRow[]),
            ...((customerAuditResult.data ?? []) as AuditLogRow[]),
          ].map((auditLog) => [auditLog.id, auditLog]),
        );
        const events = Array.from(eventsById.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        const audits = Array.from(auditsById.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        setCustomerCommunicationEvents(events.slice(0, 50));
        setCustomerAuditLogs(audits.slice(0, 40));
      } catch {
        if (!isMounted) return;
        setCustomerDrawerMessage("Kundenhistorie konnte nicht geladen werden.");
        setCustomerCommunicationEvents([]);
        setCustomerAuditLogs([]);
      } finally {
        if (isMounted) setIsCustomerDrawerLoading(false);
      }
    }

    void loadCustomerHistory();

    return () => {
      isMounted = false;
    };
  }, [selectedCustomer]);

  async function saveCustomerNote() {
    if (!selectedCustomer) return;

    const actionKey = `customer-note-${selectedCustomer.id}`;
    setPendingAction(actionKey);
    setCustomerDrawerMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const now = new Date().toISOString();
      const notes = customerNoteDraft.trim() || null;
      const leadIds = selectedCustomer.leads.map((lead) => lead.id);
      const bookingIds = selectedCustomer.bookings.map((booking) => booking.id);
      const payload = {
        ...(selectedCustomer.customerRecord?.payload ?? {}),
        linkedLeadIds: leadIds,
        linkedBookingIds: bookingIds,
        source: "next-admin",
        updatedAt: now,
      };

      const customerPayload = {
        primary_lead_id: selectedCustomer.customerRecord?.primary_lead_id ?? selectedCustomer.leads[0]?.id ?? null,
        name: selectedCustomer.name || "Gastkontakt",
        email: selectedCustomer.email,
        phone: selectedCustomer.phone,
        customer_type: "guest",
        notes,
        payload,
        updated_at: now,
      };

      const customerResult = selectedCustomer.customerRecord
        ? await supabase
          .from("customers")
          .update(customerPayload)
          .eq("id", selectedCustomer.customerRecord.id)
          .select("id,primary_lead_id,name,email,phone,customer_type,notes,payload,created_at")
          .single()
        : await supabase
          .from("customers")
          .insert(customerPayload)
          .select("id,primary_lead_id,name,email,phone,customer_type,notes,payload,created_at")
          .single();

      if (customerResult.error) throw customerResult.error;

      const savedCustomer = customerResult.data as CustomerRecordRow;

      if (bookingIds.length) {
        const bookingResult = await supabase
          .from("bookings")
          .update({ customer_id: savedCustomer.id, updated_at: now })
          .in("id", bookingIds);

        if (bookingResult.error) throw bookingResult.error;
      }

      setDataState((current) => ({
        ...current,
        customers: current.customers.some((item) => item.id === savedCustomer.id)
          ? current.customers.map((item) => item.id === savedCustomer.id ? savedCustomer : item)
          : [savedCustomer, ...current.customers],
        bookings: current.bookings.map((booking) =>
          bookingIds.includes(booking.id) ? { ...booking, customer_id: savedCustomer.id } : booking,
        ),
      }));

      await writeAuditLog({
        action: selectedCustomer.customerRecord ? "customer_note_updated" : "customer_created",
        entityType: "customer",
        entityId: savedCustomer.id,
        entityLabel: savedCustomer.name,
        payload: {
          from: selectedCustomer.customerRecord?.notes ?? null,
          to: savedCustomer.notes,
          leadIds,
          bookingIds,
        },
      });

      setSelectedCustomerId(savedCustomer.id);
      setCustomerDrawerMessage("Kundennotiz gespeichert.");
    } catch {
      setCustomerDrawerMessage("Die Kundennotiz konnte nicht gespeichert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function writeAuditLog({
    action,
    entityType,
    entityId,
    entityLabel,
    payload,
  }: {
    action: string;
    entityType: string;
    entityId: string;
    entityLabel: string;
    payload: JsonRecord;
  }) {
    const supabase = createSupabaseBrowserClient();
    const inserted = await insertAdminAuditLog(supabase, {
      actorEmail: data.profile.email,
      action,
      entityType,
      entityId,
      entityLabel,
      payload,
    });

    if (inserted) {
      setDataState((current) => ({
        ...current,
        auditLogs: [inserted as AuditLogRow, ...current.auditLogs].slice(0, 80),
      }));
      if (selection?.type === entityType && selection.id === entityId) {
        setDrawerAuditLogs((current) => [inserted as AuditLogRow, ...current].slice(0, 30));
      }
    }
  }

  async function createOwnerProfile() {
    const email = ownerProfileDraft.email.trim().toLowerCase();
    if (!email) {
      setOwnerMessage("Bitte eine Eigentümer-E-Mail eintragen.");
      return;
    }

    setPendingAction("owner-profile-create");
    setOwnerMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        source: "next-admin",
        updatedAt: new Date().toISOString(),
      };
      const insertPayload = {
        email,
        display_name: ownerProfileDraft.display_name.trim() || null,
        phone: ownerProfileDraft.phone.trim() || null,
        status: ownerProfileDraft.status || "active",
        payload,
      };
      const { data: inserted, error } = await supabase
        .from("owner_profiles")
        .upsert(insertPayload, { onConflict: "email" })
        .select("id,email,display_name,phone,status,payload,created_at")
        .single();

      if (error) throw error;

      setDataState((current) => {
        const nextProfile = inserted as OwnerProfileRow;
        return {
          ...current,
          ownerProfiles: current.ownerProfiles.some((profile) => profile.id === nextProfile.id)
            ? current.ownerProfiles.map((profile) => profile.id === nextProfile.id ? nextProfile : profile)
            : [nextProfile, ...current.ownerProfiles],
        };
      });

      await writeAuditLog({
        action: "owner_profile_upserted",
        entityType: "owner_profile",
        entityId: (inserted as OwnerProfileRow).id,
        entityLabel: email,
        payload: insertPayload,
      });

      setOwnerProfileDraft({ email: "", display_name: "", phone: "", status: "active" });
      setOwnerAccessDraft((current) => ({
        ...current,
        owner_profile_id: (inserted as OwnerProfileRow).id,
      }));
      setOwnerMessage("Eigentümerprofil gespeichert.");
    } catch {
      setOwnerMessage("Das Eigentümerprofil konnte nicht gespeichert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  function editAgency(agency: AgencyRow) {
    setAgencyDraft({
      id: agency.id,
      name: agency.name || "",
      contact_name: agency.contact_name || "",
      email: agency.email || "",
      phone: agency.phone || "",
      location: agency.location || "Sankt Peter-Ording",
      status: agency.status || "lead",
      managed_property_ids: agency.managed_property_ids ?? [],
      response_due_days: agency.response_due_days?.toString() || "2",
      available_dates_note: agency.available_dates_note || "",
      next_follow_up_at: getPayloadText(agency.payload ?? {}, ["nextFollowUpAt", "next_follow_up_at"]) || "",
      notes: getPayloadText(agency.payload ?? {}, ["notes", "note", "internalNote"]) || "",
    });
    setAgencyMessage("Agentur zum Bearbeiten geladen.");
  }

  async function saveAgency() {
    const name = agencyDraft.name.trim();
    if (!name) {
      setAgencyMessage("Bitte einen Agenturnamen eintragen.");
      return;
    }

    const agencyId = agencyDraft.id || `agency-${slugify(name) || crypto.randomUUID()}`;
    setPendingAction(`agency-save-${agencyId}`);
    setAgencyMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        source: "next-admin",
        nextFollowUpAt: agencyDraft.next_follow_up_at || null,
        notes: agencyDraft.notes.trim(),
        updatedAt: new Date().toISOString(),
      };
      const upsertPayload = {
        id: agencyId,
        name,
        contact_name: agencyDraft.contact_name.trim() || null,
        email: agencyDraft.email.trim() || null,
        phone: agencyDraft.phone.trim() || null,
        location: agencyDraft.location.trim() || null,
        status: agencyDraft.status || "lead",
        managed_property_ids: agencyDraft.managed_property_ids,
        response_due_days: numberOrNull(agencyDraft.response_due_days),
        available_dates_note: agencyDraft.available_dates_note.trim() || null,
        payload,
        updated_at: new Date().toISOString(),
      };

      const { data: saved, error } = await supabase
        .from("agencies")
        .upsert(upsertPayload)
        .select("id,name,contact_name,email,phone,location,status,managed_property_ids,response_due_days,available_dates_note,payload,created_at")
        .single();

      if (error) throw error;

      setDataState((current) => {
        const nextAgency = saved as AgencyRow;
        return {
          ...current,
          agencies: current.agencies.some((agency) => agency.id === nextAgency.id)
            ? current.agencies.map((agency) => agency.id === nextAgency.id ? nextAgency : agency)
            : [nextAgency, ...current.agencies],
        };
      });

      await writeAuditLog({
        action: "agency_upserted",
        entityType: "agency",
        entityId: (saved as AgencyRow).id,
        entityLabel: name,
        payload: upsertPayload,
      });

      setAgencyDraft({
        id: "",
        name: "",
        contact_name: "",
        email: "",
        phone: "",
        location: "Sankt Peter-Ording",
        status: "lead",
        managed_property_ids: [],
        response_due_days: "2",
        available_dates_note: "",
        next_follow_up_at: "",
        notes: "",
      });
      setAgencyMessage("Agentur gespeichert.");
    } catch {
      setAgencyMessage("Die Agentur konnte nicht gespeichert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function updateAgencyStatus(agency: AgencyRow, status: string) {
    setPendingAction(`agency-status-${agency.id}`);
    setAgencyMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        ...(agency.payload ?? {}),
        statusUpdatedAt: new Date().toISOString(),
        source: "next-admin",
      };
      const { data: updated, error } = await supabase
        .from("agencies")
        .update({
          status,
          payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", agency.id)
        .select("id,name,contact_name,email,phone,location,status,managed_property_ids,response_due_days,available_dates_note,payload,created_at")
        .single();

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        agencies: current.agencies.map((item) =>
          item.id === agency.id ? updated as AgencyRow : item,
        ),
      }));

      await writeAuditLog({
        action: "agency_status_updated",
        entityType: "agency",
        entityId: agency.id,
        entityLabel: agency.name,
        payload: { from: agency.status, to: status },
      });

      setAgencyMessage(status === "active" ? "Agentur aktiviert." : "Agentur pausiert.");
    } catch {
      setAgencyMessage("Der Agenturstatus konnte nicht geändert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function deleteAgency(agency: AgencyRow) {
    if (agency.managed_property_ids.length > 0) {
      setAgencyMessage("Agenturen mit verbundenen Objekten erst bearbeiten, nicht löschen.");
      return;
    }

    setPendingAction(`agency-delete-${agency.id}`);
    setAgencyMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("agencies")
        .delete()
        .eq("id", agency.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        agencies: current.agencies.filter((item) => item.id !== agency.id),
      }));

      await writeAuditLog({
        action: "agency_deleted",
        entityType: "agency",
        entityId: agency.id,
        entityLabel: agency.name,
        payload: {
          status: agency.status,
          location: agency.location,
        },
      });

      setAgencyMessage("Agentur entfernt.");
    } catch {
      setAgencyMessage("Die Agentur konnte nicht entfernt werden.");
    } finally {
      setPendingAction(null);
    }
  }

  function editProvider(provider: ExperienceProviderRow) {
    setProviderDraft({
      id: provider.id,
      name: provider.name || "",
      contact_name: provider.contact_name || getPayloadText(provider.payload ?? {}, ["contactName", "contact_name"]) || "",
      email: provider.email || "",
      phone: provider.phone || "",
      location: provider.location || "Sankt Peter-Ording",
      category: provider.category || "",
      status: provider.status || "lead",
      website: provider.website || "",
      audience_fit: provider.audience_fit || getPayloadText(provider.payload ?? {}, ["audienceFit", "audience_fit"]) || "both",
      collaboration_note: provider.collaboration_note || getPayloadText(provider.payload ?? {}, ["collaborationNote", "collaboration_note"]) || "",
      pricing_note: provider.pricing_note || getPayloadText(provider.payload ?? {}, ["pricingNote", "pricing_note"]) || "",
      availability_note: provider.availability_note || getPayloadText(provider.payload ?? {}, ["availabilityNote", "availability_note"]) || "",
      notes: provider.notes || getPayloadText(provider.payload ?? {}, ["notes", "note", "internalNote"]) || "",
    });
    setProviderMessage("Erlebnisanbieter zum Bearbeiten geladen.");
  }

  async function saveProvider() {
    const name = providerDraft.name.trim();
    if (!name) {
      setProviderMessage("Bitte einen Anbieternamen eintragen.");
      return;
    }

    const providerId = providerDraft.id || `provider-${slugify(name) || crypto.randomUUID()}`;
    setPendingAction(`provider-save-${providerId}`);
    setProviderMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        source: "next-admin",
        contactName: providerDraft.contact_name.trim(),
        audienceFit: providerDraft.audience_fit,
        collaborationNote: providerDraft.collaboration_note.trim(),
        pricingNote: providerDraft.pricing_note.trim(),
        availabilityNote: providerDraft.availability_note.trim(),
        notes: providerDraft.notes.trim(),
        updatedAt: new Date().toISOString(),
      };
      const upsertPayload = {
        id: providerId,
        name,
        location: providerDraft.location.trim() || null,
        category: providerDraft.category.trim() || null,
        status: providerDraft.status || "lead",
        website: providerDraft.website.trim() || null,
        email: providerDraft.email.trim() || null,
        phone: providerDraft.phone.trim() || null,
        contact_name: providerDraft.contact_name.trim() || null,
        audience_fit: providerDraft.audience_fit || null,
        collaboration_note: providerDraft.collaboration_note.trim() || null,
        pricing_note: providerDraft.pricing_note.trim() || null,
        availability_note: providerDraft.availability_note.trim() || null,
        notes: providerDraft.notes.trim() || null,
        payload,
        updated_at: new Date().toISOString(),
      };

      const { data: saved, error } = await supabase
        .from("experience_providers")
        .upsert(upsertPayload)
        .select(experienceProviderSelectColumns)
        .single();

      if (error) throw error;

      setDataState((current) => {
        const nextProvider = saved as ExperienceProviderRow;
        return {
          ...current,
          experienceProviders: current.experienceProviders.some((provider) => provider.id === nextProvider.id)
            ? current.experienceProviders.map((provider) => provider.id === nextProvider.id ? nextProvider : provider)
            : [nextProvider, ...current.experienceProviders],
        };
      });

      await writeAuditLog({
        action: "experience_provider_upserted",
        entityType: "experienceProvider",
        entityId: (saved as ExperienceProviderRow).id,
        entityLabel: name,
        payload: upsertPayload,
      });

      setProviderDraft({
        id: "",
        name: "",
        contact_name: "",
        email: "",
        phone: "",
        location: "Sankt Peter-Ording",
        category: "",
        status: "lead",
        website: "",
        audience_fit: "both",
        collaboration_note: "",
        pricing_note: "",
        availability_note: "",
        notes: "",
      });
      setProviderMessage("Erlebnisanbieter gespeichert.");
    } catch {
      setProviderMessage("Der Erlebnisanbieter konnte nicht gespeichert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function updateProviderStatus(provider: ExperienceProviderRow, status: string) {
    setPendingAction(`provider-status-${provider.id}`);
    setProviderMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        ...(provider.payload ?? {}),
        source: "next-admin",
        statusUpdatedAt: new Date().toISOString(),
      };
      const { data: updated, error } = await supabase
        .from("experience_providers")
        .update({
          status,
          payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", provider.id)
        .select(experienceProviderSelectColumns)
        .single();

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        experienceProviders: current.experienceProviders.map((item) =>
          item.id === provider.id ? updated as ExperienceProviderRow : item,
        ),
      }));

      await writeAuditLog({
        action: "experience_provider_status_updated",
        entityType: "experienceProvider",
        entityId: provider.id,
        entityLabel: provider.name,
        payload: { from: provider.status, to: status },
      });

      setProviderMessage(status === "partner" ? "Erlebnisanbieter als Partner markiert." : "Erlebnisanbieter pausiert.");
    } catch {
      setProviderMessage("Der Anbieterstatus konnte nicht geändert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function deleteProvider(provider: ExperienceProviderRow) {
    const linkedExperiences = data.experienceBlocks.filter((experience) => experience.provider_id === provider.id);
    if (linkedExperiences.length > 0) {
      setProviderMessage("Anbieter mit verbundenen Erlebnissen erst bearbeiten, nicht löschen.");
      return;
    }

    setPendingAction(`provider-delete-${provider.id}`);
    setProviderMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("experience_providers")
        .delete()
        .eq("id", provider.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        experienceProviders: current.experienceProviders.filter((item) => item.id !== provider.id),
      }));

      await writeAuditLog({
        action: "experience_provider_deleted",
        entityType: "experienceProvider",
        entityId: provider.id,
        entityLabel: provider.name,
        payload: {
          category: provider.category,
          location: provider.location,
          status: provider.status,
        },
      });

      setProviderMessage("Erlebnisanbieter entfernt.");
    } catch {
      setProviderMessage("Der Erlebnisanbieter konnte nicht entfernt werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function createOwnerAccess() {
    if (!ownerAccessDraft.owner_profile_id || !ownerAccessDraft.property_id) {
      setOwnerMessage("Bitte Eigentümer und Unterkunft auswählen.");
      return;
    }

    setPendingAction("owner-access-create");
    setOwnerMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const insertPayload = {
        owner_profile_id: ownerAccessDraft.owner_profile_id,
        property_id: ownerAccessDraft.property_id,
        role: ownerAccessDraft.role || "owner",
        can_view_financials: ownerAccessDraft.can_view_financials,
        can_view_operations: ownerAccessDraft.can_view_operations,
      };
      const { data: inserted, error } = await supabase
        .from("owner_property_access")
        .upsert(insertPayload, { onConflict: "owner_profile_id,property_id" })
        .select("id,owner_profile_id,property_id,role,can_view_financials,can_view_operations,created_at")
        .single();

      if (error) throw error;

      setDataState((current) => {
        const nextAccess = inserted as OwnerAccessRow;
        return {
          ...current,
          ownerAccess: current.ownerAccess.some((access) => access.id === nextAccess.id)
            ? current.ownerAccess.map((access) => access.id === nextAccess.id ? nextAccess : access)
            : [nextAccess, ...current.ownerAccess],
        };
      });

      await writeAuditLog({
        action: "owner_property_access_upserted",
        entityType: "owner_property_access",
        entityId: (inserted as OwnerAccessRow).id,
        entityLabel: getPropertyName(data.properties, ownerAccessDraft.property_id),
        payload: insertPayload,
      });

      setOwnerMessage("Objektzugriff gespeichert.");
    } catch {
      setOwnerMessage("Der Objektzugriff konnte nicht gespeichert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  function editOwnerProfile(profile: OwnerProfileRow) {
    setOwnerProfileDraft({
      email: profile.email,
      display_name: profile.display_name || "",
      phone: profile.phone || "",
      status: profile.status || "active",
    });
    setOwnerMessage("Eigentümerprofil zum Bearbeiten geladen.");
  }

  function editOwnerAccess(access: OwnerAccessRow) {
    setOwnerAccessDraft({
      owner_profile_id: access.owner_profile_id,
      property_id: access.property_id,
      role: access.role || "owner",
      can_view_financials: access.can_view_financials,
      can_view_operations: access.can_view_operations,
    });
    setOwnerMessage("Objektzugriff zum Bearbeiten geladen.");
  }

  async function updateOwnerProfileStatus(profile: OwnerProfileRow, status: string) {
    setPendingAction(`owner-profile-status-${profile.id}`);
    setOwnerMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: updated, error } = await supabase
        .from("owner_profiles")
        .update({
          status,
          payload: {
            ...(profile.payload ?? {}),
            statusUpdatedAt: new Date().toISOString(),
            source: "next-admin",
          },
        })
        .eq("id", profile.id)
        .select("id,email,display_name,phone,status,payload,created_at")
        .single();

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        ownerProfiles: current.ownerProfiles.map((item) =>
          item.id === profile.id ? updated as OwnerProfileRow : item,
        ),
      }));

      await writeAuditLog({
        action: "owner_profile_status_updated",
        entityType: "owner_profile",
        entityId: profile.id,
        entityLabel: profile.display_name || profile.email,
        payload: { from: profile.status, to: status },
      });

      setOwnerMessage(status === "active" ? "Eigentümerzugang aktiviert." : "Eigentümerzugang pausiert.");
    } catch {
      setOwnerMessage("Der Eigentümerstatus konnte nicht geändert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function deleteOwnerAccess(access: OwnerAccessRow) {
    setPendingAction(`owner-access-delete-${access.id}`);
    setOwnerMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("owner_property_access")
        .delete()
        .eq("id", access.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        ownerAccess: current.ownerAccess.filter((item) => item.id !== access.id),
      }));

      await writeAuditLog({
        action: "owner_property_access_deleted",
        entityType: "owner_property_access",
        entityId: access.id,
        entityLabel: getPropertyName(data.properties, access.property_id),
        payload: {
          ownerProfileId: access.owner_profile_id,
          propertyId: access.property_id,
          role: access.role,
        },
      });

      setOwnerMessage("Objektzugriff entfernt.");
    } catch {
      setOwnerMessage("Der Objektzugriff konnte nicht entfernt werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function createOwnerDocument() {
    const propertyId = ownerDocumentDraft.property_id;
    const title = ownerDocumentDraft.title.trim();
    const url = ownerDocumentDraft.url.trim();

    if (!propertyId || !title || !url) {
      setOwnerMessage("Bitte Unterkunft, Titel und Dokument-Link eintragen.");
      return;
    }

    setPendingAction("owner-document-create");
    setOwnerMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const insertPayload = {
        property_id: propertyId,
        title,
        document_type: ownerDocumentDraft.document_type || "document",
        status: ownerDocumentDraft.status || "visible",
        url,
        period_label: ownerDocumentDraft.period_label.trim() || null,
        payload: {
          source: "next-admin",
          updatedAt: new Date().toISOString(),
        },
      };
      const { data: inserted, error } = await supabase
        .from("owner_documents")
        .insert(insertPayload)
        .select("id,property_id,title,document_type,status,url,period_label,payload,created_at")
        .single();

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        ownerDocuments: [inserted as OwnerDocumentRow, ...current.ownerDocuments],
      }));

      await writeAuditLog({
        action: "owner_document_created",
        entityType: "owner_document",
        entityId: (inserted as OwnerDocumentRow).id,
        entityLabel: title,
        payload: insertPayload,
      });

      setOwnerDocumentDraft({
        property_id: propertyId,
        title: "",
        document_type: "document",
        status: "visible",
        url: "",
        period_label: "",
      });
      setOwnerMessage("Eigentümerdokument gespeichert.");
    } catch {
      setOwnerMessage("Das Eigentümerdokument konnte nicht gespeichert werden. Ist die Owner-Dokumente-Migration live?");
    } finally {
      setPendingAction(null);
    }
  }

  async function updateOwnerDocumentStatus(document: OwnerDocumentRow, status: string) {
    setPendingAction(`owner-document-status-${document.id}`);
    setOwnerMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: updated, error } = await supabase
        .from("owner_documents")
        .update({
          status,
          updated_at: new Date().toISOString(),
          payload: {
            ...(document.payload ?? {}),
            statusUpdatedAt: new Date().toISOString(),
            source: "next-admin",
          },
        })
        .eq("id", document.id)
        .select("id,property_id,title,document_type,status,url,period_label,payload,created_at")
        .single();

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        ownerDocuments: current.ownerDocuments.map((item) =>
          item.id === document.id ? updated as OwnerDocumentRow : item,
        ),
      }));

      await writeAuditLog({
        action: "owner_document_status_updated",
        entityType: "owner_document",
        entityId: document.id,
        entityLabel: document.title,
        payload: { from: document.status, to: status },
      });

      setOwnerMessage(status === "visible" ? "Dokument ist im Eigentümerbereich sichtbar." : "Dokumentstatus aktualisiert.");
    } catch {
      setOwnerMessage("Der Dokumentstatus konnte nicht aktualisiert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function createOwnerStatement() {
    const propertyId = ownerStatementDraft.property_id;
    const periodLabel = ownerStatementDraft.period_label.trim();

    if (!propertyId || !periodLabel) {
      setOwnerMessage("Bitte Unterkunft und Zeitraum eintragen.");
      return;
    }

    setPendingAction("owner-statement-create");
    setOwnerMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const insertPayload = {
        property_id: propertyId,
        period_label: periodLabel,
        period_start: ownerStatementDraft.period_start || null,
        period_end: ownerStatementDraft.period_end || null,
        status: ownerStatementDraft.status || "draft",
        currency: "EUR",
        gross_revenue: decimalOrZero(ownerStatementDraft.gross_revenue),
        morrow_fee: decimalOrZero(ownerStatementDraft.morrow_fee),
        other_costs: decimalOrZero(ownerStatementDraft.other_costs),
        owner_payout: decimalOrZero(ownerStatementDraft.owner_payout),
        document_url: ownerStatementDraft.document_url.trim() || null,
        paid_at: ownerStatementDraft.paid_at || null,
        payload: {
          source: "next-admin",
          updatedAt: new Date().toISOString(),
        },
      };
      const { data: inserted, error } = await supabase
        .from("owner_statements")
        .insert(insertPayload)
        .select("id,property_id,period_label,period_start,period_end,status,currency,gross_revenue,morrow_fee,other_costs,owner_payout,document_url,paid_at,payload,created_at")
        .single();

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        ownerStatements: [inserted as OwnerStatementRow, ...current.ownerStatements],
      }));

      await writeAuditLog({
        action: "owner_statement_created",
        entityType: "owner_statement",
        entityId: (inserted as OwnerStatementRow).id,
        entityLabel: periodLabel,
        payload: insertPayload,
      });

      setOwnerStatementDraft({
        property_id: propertyId,
        period_label: "",
        period_start: "",
        period_end: "",
        status: "draft",
        gross_revenue: "",
        morrow_fee: "",
        other_costs: "",
        owner_payout: "",
        document_url: "",
        paid_at: "",
      });
      setOwnerMessage("Eigentümerabrechnung gespeichert.");
    } catch {
      setOwnerMessage("Die Eigentümerabrechnung konnte nicht gespeichert werden. Ist die Owner-Abrechnungs-Migration live?");
    } finally {
      setPendingAction(null);
    }
  }

  async function updateOwnerStatementStatus(statement: OwnerStatementRow, status: string) {
    setPendingAction(`owner-statement-status-${statement.id}`);
    setOwnerMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: updated, error } = await supabase
        .from("owner_statements")
        .update({
          status,
          paid_at: status === "paid" ? (statement.paid_at || todayIsoDate()) : statement.paid_at,
          updated_at: new Date().toISOString(),
          payload: {
            ...(statement.payload ?? {}),
            statusUpdatedAt: new Date().toISOString(),
            source: "next-admin",
          },
        })
        .eq("id", statement.id)
        .select("id,property_id,period_label,period_start,period_end,status,currency,gross_revenue,morrow_fee,other_costs,owner_payout,document_url,paid_at,payload,created_at")
        .single();

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        ownerStatements: current.ownerStatements.map((item) =>
          item.id === statement.id ? updated as OwnerStatementRow : item,
        ),
      }));

      await writeAuditLog({
        action: "owner_statement_status_updated",
        entityType: "owner_statement",
        entityId: statement.id,
        entityLabel: statement.period_label,
        payload: { from: statement.status, to: status },
      });

      setOwnerMessage(
        status === "visible"
          ? "Abrechnung ist im Eigentümerbereich sichtbar."
          : "Abrechnungsstatus aktualisiert.",
      );
    } catch {
      setOwnerMessage("Der Abrechnungsstatus konnte nicht aktualisiert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function createOwnerOperation() {
    const propertyId = ownerOperationDraft.property_id;
    const title = ownerOperationDraft.title.trim();

    if (!propertyId || !title) {
      setOwnerMessage("Bitte Unterkunft und Operationstitel eintragen.");
      return;
    }

    setPendingAction("owner-operation-create");
    setOwnerMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const insertPayload = {
        property_id: propertyId,
        title,
        operation_type: ownerOperationDraft.operation_type || "maintenance",
        status: ownerOperationDraft.status || "planned",
        visibility: ownerOperationDraft.visibility || "owner_visible",
        scheduled_for: ownerOperationDraft.scheduled_for || null,
        completed_at: ownerOperationDraft.completed_at || null,
        note: ownerOperationDraft.note.trim() || null,
        payload: {
          source: "next-admin",
          updatedAt: new Date().toISOString(),
        },
      };
      const { data: inserted, error } = await supabase
        .from("owner_operations")
        .insert(insertPayload)
        .select("id,property_id,title,operation_type,status,visibility,scheduled_for,completed_at,note,payload,created_at")
        .single();

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        ownerOperations: [inserted as OwnerOperationRow, ...current.ownerOperations],
      }));

      await writeAuditLog({
        action: "owner_operation_created",
        entityType: "owner_operation",
        entityId: (inserted as OwnerOperationRow).id,
        entityLabel: title,
        payload: insertPayload,
      });

      setOwnerOperationDraft({
        property_id: propertyId,
        title: "",
        operation_type: "maintenance",
        status: "planned",
        visibility: "owner_visible",
        scheduled_for: "",
        completed_at: "",
        note: "",
      });
      setOwnerMessage("Operation gespeichert.");
    } catch {
      setOwnerMessage("Die Operation konnte nicht gespeichert werden. Ist die Owner-Operations-Migration live?");
    } finally {
      setPendingAction(null);
    }
  }

  async function updateOwnerOperationStatus(operation: OwnerOperationRow, status: string) {
    setPendingAction(`owner-operation-status-${operation.id}`);
    setOwnerMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: updated, error } = await supabase
        .from("owner_operations")
        .update({
          status,
          completed_at: status === "done" ? (operation.completed_at || todayIsoDate()) : operation.completed_at,
          updated_at: new Date().toISOString(),
          payload: {
            ...(operation.payload ?? {}),
            statusUpdatedAt: new Date().toISOString(),
            source: "next-admin",
          },
        })
        .eq("id", operation.id)
        .select("id,property_id,title,operation_type,status,visibility,scheduled_for,completed_at,note,payload,created_at")
        .single();

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        ownerOperations: current.ownerOperations.map((item) =>
          item.id === operation.id ? updated as OwnerOperationRow : item,
        ),
      }));

      await writeAuditLog({
        action: "owner_operation_status_updated",
        entityType: "owner_operation",
        entityId: operation.id,
        entityLabel: operation.title,
        payload: { from: operation.status, to: status },
      });

      setOwnerMessage("Operationsstatus aktualisiert.");
    } catch {
      setOwnerMessage("Der Operationsstatus konnte nicht aktualisiert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function updateLeadStatus(lead: LeadRow, status: string) {
    const actionKey = `lead-${lead.id}-${status}`;
    setPendingAction(actionKey);
    setActionMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        ...lead.payload,
        status,
        updatedAt: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("leads")
        .update({
          status,
          payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", lead.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        leads: current.leads.map((item) =>
          item.id === lead.id ? { ...item, status, payload } : item,
        ),
      }));

      await writeAuditLog({
        action: "lead_status_updated",
        entityType: "lead",
        entityId: lead.id,
        entityLabel: getLeadLabel(lead),
        payload: { from: lead.status, to: status },
      });

      setActionMessage("Anfrage aktualisiert.");
    } catch {
      setActionMessage("Die Anfrage konnte nicht aktualisiert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function updateLeadFollowUp(lead: LeadRow, followUpAt: string) {
    const actionKey = `lead-${lead.id}-follow-up`;
    setPendingAction(actionKey);
    setActionMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const now = new Date().toISOString();
      const previous = getLeadFollowUpAt(lead);
      const payload = {
        ...lead.payload,
        followUpAt: followUpAt || null,
        updatedAt: now,
      };
      const { error } = await supabase
        .from("leads")
        .update({
          follow_up_at: followUpAt || null,
          payload,
          updated_at: now,
        })
        .eq("id", lead.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        leads: current.leads.map((item) =>
          item.id === lead.id ? { ...item, follow_up_at: followUpAt || null, payload } : item,
        ),
      }));

      await writeAuditLog({
        action: "lead_follow_up_updated",
        entityType: "lead",
        entityId: lead.id,
        entityLabel: getLeadLabel(lead),
        payload: { from: previous, to: followUpAt || null },
      });

      setActionMessage("Wiedervorlage gespeichert.");
    } catch {
      setActionMessage("Die Wiedervorlage konnte nicht gespeichert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function saveLeadDetails(lead: LeadRow) {
    const actionKey = `lead-${lead.id}-details`;
    setPendingAction(actionKey);
    setDrawerMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const now = new Date().toISOString();
      const name = leadDetailsDraft.name.trim() || null;
      const email = leadDetailsDraft.email.trim() || null;
      const phone = leadDetailsDraft.phone.trim() || null;
      const packageSlug = leadDetailsDraft.package_slug.trim() || null;
      const source = leadDetailsDraft.source.trim() || null;
      const campaign = leadDetailsDraft.campaign.trim() || null;
      const followUpAt = leadDetailsDraft.follow_up_at || null;
      const whatsappOptIn = consentDraftValueToBool(leadDetailsDraft.whatsapp_opt_in);
      const adults = integerOrNull(leadDetailsDraft.adults);
      const children = integerOrNull(leadDetailsDraft.children);
      const childrenAges = leadDetailsDraft.children_ages.trim() || null;
      const dog = leadDetailsDraft.dog.trim() || null;
      const payload = {
        ...lead.payload,
        name,
        email,
        phone,
        packageSlug,
        source,
        campaign,
        followUpAt,
        selectedDate: leadDetailsDraft.selected_date.trim() || null,
        adults,
        children,
        childrenAges,
        dog,
        occasion: leadDetailsDraft.occasion.trim() || null,
        whatsappOptIn,
        updatedAt: now,
      };
      const { data: updated, error } = await supabase
        .from("leads")
        .update({
          name,
          email,
          phone,
          type: leadDetailsDraft.type,
          status: leadDetailsDraft.status.trim() || "Neu",
          package_slug: packageSlug,
          source,
          campaign,
          follow_up_at: followUpAt,
          whatsapp_consent_at: whatsappOptIn ? lead.whatsapp_consent_at || now : null,
          whatsapp_opt_in: whatsappOptIn,
          adults,
          children,
          children_ages: childrenAges,
          dog,
          payload,
          updated_at: now,
        })
        .eq("id", lead.id)
        .select("id,type,status,name,email,phone,package_slug,source,campaign,follow_up_at,whatsapp_opt_in,whatsapp_consent_at,adults,children,children_ages,dog,archived_at,created_at,payload")
        .single();

      if (error) throw error;

      const updatedLead = updated as LeadRow;
      setDataState((current) => ({
        ...current,
        leads: current.leads.map((item) => item.id === lead.id ? updatedLead : item),
      }));
      setLeadDetailsDraft(leadDetailsDraftFromLead(updatedLead));

      await writeAuditLog({
        action: "lead_details_updated",
        entityType: "lead",
        entityId: lead.id,
        entityLabel: getLeadLabel(updatedLead),
        payload: {
          from: {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            type: lead.type,
            status: lead.status,
            packageSlug: lead.package_slug,
            source: lead.source,
            campaign: lead.campaign,
            followUpAt: getLeadFollowUpAt(lead),
            whatsappOptIn: lead.whatsapp_opt_in ?? null,
            adults: lead.adults ?? null,
            children: lead.children ?? null,
            childrenAges: lead.children_ages ?? null,
            dog: lead.dog ?? null,
          },
          to: {
            name: updatedLead.name,
            email: updatedLead.email,
            phone: updatedLead.phone,
            type: updatedLead.type,
            status: updatedLead.status,
            packageSlug: updatedLead.package_slug,
            source: updatedLead.source,
            campaign: updatedLead.campaign,
            followUpAt,
            whatsappOptIn: updatedLead.whatsapp_opt_in ?? null,
            adults: updatedLead.adults ?? null,
            children: updatedLead.children ?? null,
            childrenAges: updatedLead.children_ages ?? null,
            dog: updatedLead.dog ?? null,
          },
        },
      });

      setDrawerMessage("Anfrage gespeichert.");
    } catch {
      setDrawerMessage("Die Anfrage konnte nicht gespeichert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function updateLeadArchive(lead: LeadRow, shouldArchive: boolean) {
    const actionKey = `lead-${lead.id}-${shouldArchive ? "archive" : "reactivate"}`;
    setPendingAction(actionKey);
    setActionMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const now = new Date().toISOString();
      const archivedAt = shouldArchive ? now : null;
      const payload = {
        ...lead.payload,
        archivedAt,
        updatedAt: now,
      };
      const { error } = await supabase
        .from("leads")
        .update({
          archived_at: archivedAt,
          payload,
          updated_at: now,
        })
        .eq("id", lead.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        leads: current.leads.map((item) =>
          item.id === lead.id ? { ...item, archived_at: archivedAt, payload } : item,
        ),
      }));

      await writeAuditLog({
        action: shouldArchive ? "lead_archived" : "lead_reactivated",
        entityType: "lead",
        entityId: lead.id,
        entityLabel: getLeadLabel(lead),
        payload: { from: lead.archived_at, to: archivedAt },
      });

      setActionMessage(shouldArchive ? "Anfrage archiviert." : "Anfrage reaktiviert.");
    } catch {
      setActionMessage(shouldArchive ? "Die Anfrage konnte nicht archiviert werden." : "Die Anfrage konnte nicht reaktiviert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function deleteTestLead(lead: LeadRow) {
    if (!isLeadTest(lead)) {
      setActionMessage("Nur Test- oder Spam-Anfragen können hier gelöscht werden.");
      return;
    }
    if (!window.confirm(`Testanfrage "${getLeadLabel(lead)}" wirklich löschen?`)) return;

    const actionKey = `lead-${lead.id}-delete`;
    setPendingAction(actionKey);
    setActionMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", lead.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        leads: current.leads.filter((item) => item.id !== lead.id),
      }));

      await writeAuditLog({
        action: "lead_test_deleted",
        entityType: "lead",
        entityId: lead.id,
        entityLabel: getLeadLabel(lead),
        payload: { type: lead.type, status: lead.status },
      });

      setActionMessage("Testanfrage gelöscht.");
    } catch {
      setActionMessage("Die Testanfrage konnte nicht gelöscht werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function reserveLead(lead: LeadRow) {
    const actionKey = `lead-${lead.id}-reserve`;
    setPendingAction(actionKey);
    setActionMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const packageItem = data.packages.find(
        (item) => item.slug === lead.package_slug || item.id === lead.package_slug,
      );
      const now = new Date().toISOString();
      const accessCode = generatedGuestAccessCode(lead.id, lead.email);
      const selectedDate = getPayloadText(lead.payload ?? {}, ["selectedDate", "dateLabel", "travelDate", "arrivalDate"]) || null;
      const adults = lead.adults ?? null;
      const children = lead.children ?? null;
      const childrenAges = lead.children_ages ?? null;
      const dog = lead.dog ?? null;
      const leadPayload = {
        ...lead.payload,
        status: "Reserviert",
        updatedAt: now,
      };
      const bookingPayload = {
        ...lead.payload,
        id: lead.id,
        leadId: lead.id,
        customerName: getLeadLabel(lead),
        email: lead.email,
        phone: lead.phone,
        packageId: packageItem?.id ?? lead.package_slug,
        packageSlug: packageItem?.slug ?? lead.package_slug,
        packageName: packageItem?.name ?? lead.package_slug ?? "Auszeit",
        selectedDate,
        adults,
        children,
        childrenAges,
        dog,
        guestAccessCode: accessCode,
        status: "Reserviert",
        paymentStatus: "offen",
        createdAt: now,
        updatedAt: now,
      };

      const existingCustomerResult = await supabase
        .from("customers")
        .select("id,primary_lead_id,name,email,phone,customer_type,notes,payload,created_at")
        .eq("primary_lead_id", lead.id)
        .maybeSingle();

      if (existingCustomerResult.error) throw existingCustomerResult.error;

      const customerPayload = {
        primary_lead_id: lead.id,
        name: getLeadLabel(lead),
        email: lead.email,
        phone: lead.phone,
        customer_type: "guest",
        notes: existingCustomerResult.data?.notes ?? null,
        payload: {
          ...((existingCustomerResult.data?.payload as Record<string, unknown> | null) ?? {}),
          source: "lead-reservation",
          packageId: packageItem?.id ?? lead.package_slug,
          leadId: lead.id,
          updatedAt: now,
        },
        updated_at: now,
      };

      const customerResult = existingCustomerResult.data
        ? await supabase
          .from("customers")
          .update(customerPayload)
          .eq("id", existingCustomerResult.data.id)
          .select("id,primary_lead_id,name,email,phone,customer_type,notes,payload,created_at")
          .single()
        : await supabase
          .from("customers")
          .insert(customerPayload)
          .select("id,primary_lead_id,name,email,phone,customer_type,notes,payload,created_at")
          .single();

      if (customerResult.error) throw customerResult.error;

      const customer = customerResult.data as CustomerRecordRow;

      const leadResult = await supabase
        .from("leads")
        .update({
          status: "Reserviert",
          payload: leadPayload,
          updated_at: now,
        })
        .eq("id", lead.id);

      if (leadResult.error) throw leadResult.error;

      const bookingResult = await supabase.from("bookings").upsert({
        id: lead.id,
        lead_id: lead.id,
        customer_id: customer.id,
        package_id: packageItem?.id ?? lead.package_slug,
        status: "Reserviert",
        payment_status: "offen",
        guest_access_code: accessCode,
        guest_name: getLeadLabel(lead),
        guest_email: lead.email,
        guest_phone: lead.phone,
        selected_date: selectedDate,
        adults,
        children,
        children_ages: childrenAges,
        dog,
        payload: bookingPayload,
        updated_at: now,
      });

      if (bookingResult.error) throw bookingResult.error;

      setDataState((current) => {
        const bookingRow: BookingRow = {
          id: lead.id,
          lead_id: lead.id,
          customer_id: customer.id,
          package_id: packageItem?.id ?? lead.package_slug,
          status: "Reserviert",
          payment_status: "offen",
          guest_access_code: accessCode,
          guest_name: getLeadLabel(lead),
          guest_email: lead.email,
          guest_phone: lead.phone,
          selected_date: selectedDate,
          reservation_deadline: null,
          payment_due_date: null,
          payment_amount: null,
          payment_date: null,
          payment_method: null,
          payment_reference: null,
          payment_proof_url: null,
          adults,
          children,
          children_ages: childrenAges,
          dog,
          check_in_status: null,
          experience_status: null,
          next_task: null,
          created_at: now,
          payload: bookingPayload,
        };

        return {
          ...current,
          leads: current.leads.map((item) =>
            item.id === lead.id ? { ...item, status: "Reserviert", payload: leadPayload } : item,
          ),
          bookings: current.bookings.some((booking) => booking.id === lead.id)
            ? current.bookings.map((booking) => (booking.id === lead.id ? bookingRow : booking))
            : [bookingRow, ...current.bookings],
          customers: current.customers.some((item) => item.id === customer.id)
            ? current.customers.map((item) => item.id === customer.id ? customer : item)
            : [customer, ...current.customers],
        };
      });

      await writeAuditLog({
        action: "lead_reserved",
        entityType: "booking",
        entityId: lead.id,
        entityLabel: getLeadLabel(lead),
        payload: { leadId: lead.id, packageId: packageItem?.id ?? lead.package_slug },
      });

      setActionMessage("Reservierung angelegt.");
    } catch {
      setActionMessage("Die Reservierung konnte nicht angelegt werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function updateBookingStatus(booking: BookingRow, status: string) {
    const actionKey = `booking-${booking.id}-${status}`;
    setPendingAction(actionKey);
    setActionMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const paymentStatus = paymentStatusForBooking(status);
      const guestAccessCode = booking.guest_access_code || guestAccessCodeForBooking(booking);
      const payload = {
        ...booking.payload,
        status,
        paymentStatus,
        guestAccessCode,
        updatedAt: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("bookings")
        .update({
          status,
          payment_status: paymentStatus,
          guest_access_code: guestAccessCode,
          payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        bookings: current.bookings.map((item) =>
          item.id === booking.id
            ? { ...item, status, payment_status: paymentStatus, guest_access_code: guestAccessCode, payload }
            : item,
        ),
      }));

      await writeAuditLog({
        action: "booking_status_updated",
        entityType: "booking",
        entityId: booking.id,
        entityLabel: getBookingLabel(booking),
        payload: { from: booking.status, to: status, paymentStatus },
      });

      setActionMessage("Buchung aktualisiert.");
    } catch {
      setActionMessage("Die Buchung konnte nicht aktualisiert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function savePaymentInfo() {
    if (!selectedBooking) return;

    const actionKey = `booking-payment-${selectedBooking.id}`;
    setPendingAction(actionKey);
    setDrawerMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const paymentStatus = paymentDraft.payment_status.trim() || "offen";
      const guestAccessCode = selectedBooking.guest_access_code || guestAccessCodeForBooking(selectedBooking);
      const paymentAmount = paymentDraft.payment_amount.trim() || null;
      const paymentDate = paymentDraft.payment_date.trim() || null;
      const paymentMethod = paymentDraft.payment_method.trim() || null;
      const paymentReference = paymentDraft.payment_reference.trim() || null;
      const paymentProofUrl = paymentDraft.payment_proof_url.trim() || null;
      const paymentPayload = {
        paymentStatus,
        paymentAmount,
        paymentDate,
        paymentMethod,
        paymentReference,
        paymentProofUrl,
        guestAccessCode,
        updatedAt: new Date().toISOString(),
      };
      const payload = {
        ...selectedBooking.payload,
        ...paymentPayload,
      };
      const { error } = await supabase
        .from("bookings")
        .update({
          payment_status: paymentStatus,
          guest_access_code: guestAccessCode,
          payment_amount: paymentAmount,
          payment_date: paymentDate,
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          payment_proof_url: paymentProofUrl,
          payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedBooking.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        bookings: current.bookings.map((booking) =>
          booking.id === selectedBooking.id
            ? {
                ...booking,
                payment_status: paymentStatus,
                guest_access_code: guestAccessCode,
                payment_amount: paymentAmount,
                payment_date: paymentDate,
                payment_method: paymentMethod,
                payment_reference: paymentReference,
                payment_proof_url: paymentProofUrl,
                payload,
              }
            : booking,
        ),
      }));

      await writeAuditLog({
        action: "booking_payment_documented",
        entityType: "booking",
        entityId: selectedBooking.id,
        entityLabel: getBookingLabel(selectedBooking),
        payload: {
          from: selectedBooking.payment_status,
          to: paymentStatus,
          paymentAmount,
          paymentDate,
          paymentMethod,
          paymentReference,
        },
      });

      setDrawerMessage("Zahlungsdaten gespeichert.");
    } catch {
      setDrawerMessage("Zahlungsdaten konnten nicht gespeichert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function saveBookingOperations() {
    if (!selectedBooking) return;

    const actionKey = `booking-operations-${selectedBooking.id}`;
    setPendingAction(actionKey);
    setDrawerMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const guestAccessCode = bookingOperationsDraft.guest_access_code.trim() ||
        guestAccessCodeForBooking(selectedBooking);
      const packageId = bookingOperationsDraft.package_id.trim() || null;
      const guestName = bookingOperationsDraft.guest_name.trim() || null;
      const guestEmail = bookingOperationsDraft.email.trim() || null;
      const guestPhone = bookingOperationsDraft.phone.trim() || null;
      const selectedDate = bookingOperationsDraft.selected_date.trim() || null;
      const reservationDeadline = bookingOperationsDraft.reservation_deadline || null;
      const paymentDueDate = bookingOperationsDraft.payment_due_date || null;
      const adults = integerOrNull(bookingOperationsDraft.adults);
      const children = integerOrNull(bookingOperationsDraft.children);
      const childrenAges = bookingOperationsDraft.children_ages.trim() || null;
      const dog = bookingOperationsDraft.dog.trim() || null;
      const checkInStatus = bookingOperationsDraft.check_in_status.trim() || "offen";
      const experienceStatus = bookingOperationsDraft.experience_status.trim() || "offen";
      const nextTask = bookingOperationsDraft.next_task.trim() || null;
      const operationsPayload = {
        packageId,
        guestName,
        email: guestEmail,
        phone: guestPhone,
        selectedDate,
        guestAccessCode,
        reservationDeadline,
        paymentDueDate,
        adults,
        children,
        childrenAges,
        dog,
        checkInStatus,
        experienceStatus,
        nextTask,
        updatedAt: new Date().toISOString(),
      };
      const payload = {
        ...selectedBooking.payload,
        ...operationsPayload,
      };
      const { error } = await supabase
        .from("bookings")
        .update({
          package_id: packageId,
          guest_access_code: guestAccessCode,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          selected_date: selectedDate,
          reservation_deadline: reservationDeadline,
          payment_due_date: paymentDueDate,
          adults,
          children,
          children_ages: childrenAges,
          dog,
          check_in_status: checkInStatus,
          experience_status: experienceStatus,
          next_task: nextTask,
          payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedBooking.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        bookings: current.bookings.map((booking) =>
          booking.id === selectedBooking.id
            ? {
                ...booking,
                package_id: packageId,
                guest_access_code: guestAccessCode,
                guest_name: guestName,
                guest_email: guestEmail,
                guest_phone: guestPhone,
                selected_date: selectedDate,
                reservation_deadline: reservationDeadline,
                payment_due_date: paymentDueDate,
                adults,
                children,
                children_ages: childrenAges,
                dog,
                check_in_status: checkInStatus,
                experience_status: experienceStatus,
                next_task: nextTask,
                payload,
              }
            : booking,
        ),
      }));

      await writeAuditLog({
        action: "booking_operations_updated",
        entityType: "booking",
        entityId: selectedBooking.id,
        entityLabel: getBookingLabel(selectedBooking),
        payload: {
          reservationDeadline: operationsPayload.reservationDeadline,
          paymentDueDate: operationsPayload.paymentDueDate,
          guestAccessCode,
          packageId: operationsPayload.packageId,
          checkInStatus: operationsPayload.checkInStatus,
          experienceStatus: operationsPayload.experienceStatus,
          nextTask: operationsPayload.nextTask,
        },
      });

      setDrawerMessage("Buchungsdetails gespeichert.");
    } catch {
      setDrawerMessage("Buchungsdetails konnten nicht gespeichert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function saveDrawerNote() {
    if (!selection) return;

    const actionKey = `drawer-note-${selection.type}-${selection.id}`;
    setPendingAction(actionKey);
    setDrawerMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const isLead = selection.type === "lead";
      const isBooking = selection.type === "booking";
      const currentEntity = isLead
        ? data.leads.find((lead) => lead.id === selection.id)
        : isBooking
          ? data.bookings.find((booking) => booking.id === selection.id)
          : data.supportMessages.find((support) => support.id === selection.id);

      if (!currentEntity) throw new Error("Missing entity");

      const payload = {
        ...currentEntity.payload,
        internalNote: drawerNote,
        updatedAt: new Date().toISOString(),
      };
      const table = isLead ? "leads" : isBooking ? "bookings" : "support_messages";
      const { error } = await supabase
        .from(table)
        .update({ payload, updated_at: new Date().toISOString() })
        .eq("id", selection.id);

      if (error) throw error;

      const supportCase = !isLead && !isBooking ? currentEntity as SupportRow : null;
      const supportLeadId = supportCase ? getSupportRelationId(supportCase, "lead") : null;
      const supportBookingId = supportCase ? getSupportRelationId(supportCase, "booking") : null;
      const eventResult = await supabase
        .from("communication_events")
        .insert({
          lead_id: isLead ? selection.id : supportLeadId,
          booking_id: isBooking ? selection.id : supportBookingId,
          support_id: supportCase?.id ?? null,
          channel: "note",
          direction: "internal",
          event_type: "note",
          subject: isLead || isBooking ? "Interne Notiz" : "Interne Support-Notiz",
          body: drawerNote || "Notiz aktualisiert.",
          actor: data.profile.email,
          status: "recorded",
          source: "next-admin",
          payload: {
            source: "next-admin",
            entityType: selection.type,
            entityId: selection.id,
          },
        })
        .select(communicationEventSelectColumns)
        .single();

      if (eventResult.error) throw eventResult.error;

      setDataState((current) => ({
        ...current,
        communicationEvents: [
          eventResult.data as CommunicationEventRow,
          ...current.communicationEvents,
        ].slice(0, 120),
        leads: isLead
          ? current.leads.map((lead) => (lead.id === selection.id ? { ...lead, payload } : lead))
          : current.leads,
        bookings: isLead || !isBooking
          ? current.bookings
          : current.bookings.map((booking) =>
              booking.id === selection.id ? { ...booking, payload } : booking,
            ),
        supportMessages: isLead || isBooking
          ? current.supportMessages
          : current.supportMessages.map((support) =>
              support.id === selection.id ? { ...support, payload } : support,
            ),
      }));
      setCommunicationEvents((current) => [
        eventResult.data as CommunicationEventRow,
        ...current,
      ]);

      await writeAuditLog({
        action: "internal_note_updated",
        entityType: selection.type,
        entityId: selection.id,
        entityLabel: isLead
          ? getLeadLabel(currentEntity as LeadRow)
          : isBooking
            ? getBookingLabel(currentEntity as BookingRow)
            : getSupportLabel(currentEntity as SupportRow),
        payload: { noteLength: drawerNote.length },
      });

      setDrawerMessage("Notiz gespeichert.");
    } catch {
      setDrawerMessage("Notiz konnte nicht gespeichert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function sendDrawerEmail() {
    if (!selection) return;

    const currentEntity = selection.type === "lead"
      ? data.leads.find((lead) => lead.id === selection.id)
      : selection.type === "booking"
        ? data.bookings.find((booking) => booking.id === selection.id)
        : data.supportMessages.find((support) => support.id === selection.id);

    if (!currentEntity) return;

    const payload = currentEntity.payload ?? {};
    const recipient = selection.type === "lead"
      ? (currentEntity as LeadRow).email || getPayloadText(payload, ["email"])
      : getPayloadText(payload, ["email"]);
    const subject = outboundDraft.subject.trim();
    const body = outboundDraft.body.trim();

    if (!recipient || !subject || !body) {
      setDrawerMessage("Bitte Empfänger, Betreff und Nachricht prüfen.");
      return;
    }

    const booking = selection.type === "booking" ? currentEntity as BookingRow : null;
    const supportCase = selection.type === "support" ? currentEntity as SupportRow : null;
    const actionKey = `drawer-email-${selection.type}-${selection.id}`;
    setPendingAction(actionKey);
    setDrawerMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const leadId = selection.type === "lead"
        ? selection.id
        : selection.type === "booking"
          ? booking?.lead_id || getPayloadText(payload, ["leadId", "lead_id"]) || booking?.id
          : supportCase
            ? getSupportRelationId(supportCase, "lead")
            : null;
      const bookingId = selection.type === "booking"
        ? selection.id
        : supportCase
          ? getSupportRelationId(supportCase, "booking")
          : null;
      const customerId = booking?.customer_id || getPayloadText(payload, ["customerId", "customer_id"]);
      const { data: result, error } = await supabase.functions.invoke("admin-send-message", {
        body: {
          leadId,
          bookingId,
          customerId,
          supportId: selection.type === "support" ? selection.id : null,
          recipient,
          subject,
          body,
        },
      });

      if (error) throw error;

      const event = (result as { event?: CommunicationEventRow | null } | null)?.event;
      if (event) {
        setCommunicationEvents((current) => [event, ...current]);
        setDataState((current) => ({
          ...current,
          communicationEvents: [event, ...current.communicationEvents].slice(0, 120),
        }));
      }

      await writeAuditLog({
        action: "admin_email_sent",
        entityType: selection.type,
        entityId: selection.id,
        entityLabel: selection.type === "lead"
          ? getLeadLabel(currentEntity as LeadRow)
          : selection.type === "booking"
            ? getBookingLabel(currentEntity as BookingRow)
            : getSupportLabel(currentEntity as SupportRow),
        payload: { recipient, subject },
      });

      setOutboundDraft((current) => ({ ...current, body: "" }));
      setDrawerMessage("E-Mail gesendet und in der Historie gespeichert.");
    } catch {
      setDrawerMessage("Die E-Mail konnte nicht gesendet werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function updateSupportStatus(support: SupportRow, status: string) {
    const actionKey = `support-${support.id}-${status}`;
    setPendingAction(actionKey);
    setActionMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        ...support.payload,
        status,
        updatedAt: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("support_messages")
        .update({
          status,
          payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", support.id);

      if (error) throw error;

      const statusEventResult = await supabase
        .from("support_status_events")
        .insert({
          support_id: support.id,
          from_status: support.status,
          to_status: status,
          actor: data.profile.email,
          payload: {
            source: "next-admin",
            supportLabel: getSupportLabel(support),
          },
        })
        .select("id")
        .single();

      if (statusEventResult.error) throw statusEventResult.error;

      setDataState((current) => ({
        ...current,
        supportMessages: current.supportMessages.map((item) =>
          item.id === support.id ? { ...item, status, payload } : item,
        ),
      }));

      await writeAuditLog({
        action: "support_status_updated",
        entityType: "support",
        entityId: support.id,
        entityLabel: getSupportLabel(support),
        payload: { from: support.status, to: status },
      });

      setActionMessage("Supportfall aktualisiert.");
    } catch {
      setActionMessage("Der Supportfall konnte nicht aktualisiert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function updateTaskStatus(task: AdminTaskRow, status: string) {
    const actionKey = `task-${task.id}-${status}`;
    setPendingAction(actionKey);
    setActionMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        ...task.payload,
        status,
        updatedAt: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("admin_tasks")
        .update({
          status,
          payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", task.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        tasks: current.tasks.map((item) =>
          item.id === task.id ? { ...item, status, payload } : item,
        ),
      }));

      await writeAuditLog({
        action: "task_status_updated",
        entityType: "admin_task",
        entityId: task.id,
        entityLabel: task.title,
        payload: { from: task.status, to: status },
      });

      setActionMessage("Aufgabe aktualisiert.");
    } catch {
      setActionMessage("Die Aufgabe konnte nicht aktualisiert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  function resetTaskDraft(referenceValue = taskReferenceOptions[0]?.value || "") {
    setEditingTaskId(null);
    setTaskDraft({
      title: "",
      referenceValue,
      dueAt: todayIsoDate(),
      priority: "medium",
      note: "",
    });
  }

  function startEditTask(task: AdminTaskRow) {
    const referenceValue = `${task.reference_type}:${task.reference_id}`;
    setEditingTaskId(task.id);
    setTaskDraft({
      title: task.title,
      referenceValue,
      dueAt: task.due_at || "",
      priority: task.priority === "low" || task.priority === "high" ? task.priority : "medium",
      note: task.note || "",
    });
    setActiveWorkspace("tasks");
    setActionMessage("Aufgabe zum Bearbeiten geladen.");
  }

  async function saveAdminTask() {
    const referenceValue = taskDraft.referenceValue || taskReferenceOptions[0]?.value || "";
    const reference = taskReferenceOptions.find((option) => option.value === referenceValue);
    const title = taskDraft.title.trim();
    const existingTask = editingTaskId ? data.tasks.find((task) => task.id === editingTaskId) : null;
    const referenceType = reference?.type || existingTask?.reference_type || "";
    const referenceId = reference?.id || existingTask?.reference_id || "";
    const referenceLabel = reference?.label || existingTask?.reference_label || null;

    if (!title || !referenceType || !referenceId) {
      setActionMessage("Bitte Aufgabentitel und Bezug auswählen.");
      return;
    }

    if (existingTask) {
      const actionKey = `task-update-${existingTask.id}`;
      setPendingAction(actionKey);
      setActionMessage(null);

      try {
        const supabase = createSupabaseBrowserClient();
        const payload = {
          ...existingTask.payload,
          editedFrom: "next-admin",
          editedAt: new Date().toISOString(),
        };
        const { data: updated, error } = await supabase
          .from("admin_tasks")
          .update({
            title,
            reference_type: referenceType,
            reference_id: referenceId,
            reference_label: referenceLabel,
            due_at: taskDraft.dueAt || null,
            priority: taskDraft.priority,
            note: taskDraft.note.trim() || null,
            payload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingTask.id)
          .select("id,title,reference_type,reference_id,reference_label,due_at,status,priority,note,payload,created_at")
          .single();

        if (error) throw error;

        const task = updated as AdminTaskRow;
        setDataState((current) => ({
          ...current,
          tasks: current.tasks.map((item) => item.id === task.id ? task : item),
        }));

        await writeAuditLog({
          action: "task_updated",
          entityType: "admin_task",
          entityId: task.id,
          entityLabel: task.title,
          payload: {
            from: {
              title: existingTask.title,
              referenceType: existingTask.reference_type,
              referenceId: existingTask.reference_id,
              dueAt: existingTask.due_at,
              priority: existingTask.priority,
            },
            to: {
              title: task.title,
              referenceType: task.reference_type,
              referenceId: task.reference_id,
              dueAt: task.due_at,
              priority: task.priority,
            },
          },
        });

        resetTaskDraft(referenceValue);
        setActionMessage("Aufgabe gespeichert.");
      } catch {
        setActionMessage("Die Aufgabe konnte nicht gespeichert werden.");
      } finally {
        setPendingAction(null);
      }
      return;
    }

    const id = `task-${crypto.randomUUID()}`;
    const actionKey = `task-create-${id}`;
    setPendingAction(actionKey);
    setActionMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        createdFrom: "next-admin",
        note: taskDraft.note.trim() || null,
      };
      const { data: inserted, error } = await supabase
        .from("admin_tasks")
        .insert({
          id,
          title,
          reference_type: referenceType,
          reference_id: referenceId,
          reference_label: referenceLabel,
          due_at: taskDraft.dueAt || null,
          status: "open",
          priority: taskDraft.priority,
          note: taskDraft.note.trim() || null,
          payload,
        })
        .select("id,title,reference_type,reference_id,reference_label,due_at,status,priority,note,payload,created_at")
        .single();

      if (error) throw error;

      const task = inserted as AdminTaskRow;
      setDataState((current) => ({
        ...current,
        tasks: [task, ...current.tasks],
      }));
      resetTaskDraft(referenceValue);

      await writeAuditLog({
        action: "task_created",
        entityType: "admin_task",
        entityId: task.id,
        entityLabel: task.title,
        payload: {
          referenceType: task.reference_type,
          referenceId: task.reference_id,
          priority: task.priority,
          dueAt: task.due_at,
        },
      });

      setActionMessage("Aufgabe angelegt.");
    } catch {
      setActionMessage("Die Aufgabe konnte nicht angelegt werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function deleteAdminTask(task: AdminTaskRow) {
    const confirmed = window.confirm(`Aufgabe "${task.title}" wirklich löschen?`);
    if (!confirmed) return;

    const actionKey = `task-delete-${task.id}`;
    setPendingAction(actionKey);
    setActionMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("admin_tasks")
        .delete()
        .eq("id", task.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        tasks: current.tasks.filter((item) => item.id !== task.id),
      }));
      if (editingTaskId === task.id) {
        resetTaskDraft();
      }

      await writeAuditLog({
        action: "task_deleted",
        entityType: "admin_task",
        entityId: task.id,
        entityLabel: task.title,
        payload: {
          referenceType: task.reference_type,
          referenceId: task.reference_id,
          status: task.status,
          priority: task.priority,
          dueAt: task.due_at,
        },
      });

      setActionMessage("Aufgabe gelöscht.");
    } catch {
      setActionMessage("Die Aufgabe konnte nicht gelöscht werden.");
    } finally {
      setPendingAction(null);
    }
  }

  function openTaskReference(task: AdminTaskRow) {
    if (task.reference_type === "lead") {
      setActiveWorkspace("crm");
      setSelection({ type: "lead", id: task.reference_id });
      return;
    }
    if (task.reference_type === "booking") {
      setActiveWorkspace("crm");
      setSelection({ type: "booking", id: task.reference_id });
      return;
    }
    if (task.reference_type === "support") {
      setActiveWorkspace("support");
      setSelection({ type: "support", id: task.reference_id });
      return;
    }
    if (task.reference_type === "package") {
      setActiveWorkspace("inventory");
      setInventorySelection({ mode: "edit", type: "package", id: task.reference_id });
      return;
    }
    if (task.reference_type === "property") {
      setActiveWorkspace("inventory");
      setInventorySelection({ mode: "edit", type: "property", id: task.reference_id });
      return;
    }
    if (task.reference_type === "owner") {
      const owner = data.ownerProfiles.find((item) => item.id === task.reference_id);
      if (owner) editOwnerProfile(owner);
      setActiveWorkspace("owners");
      return;
    }
    if (task.reference_type === "experience" || task.reference_type === "experienceProvider") {
      const experience = task.reference_type === "experience"
        ? data.experienceBlocks.find((item) => item.id === task.reference_id)
        : null;
      if (experience) {
        setActiveWorkspace("operations");
        setExperienceSelection({ mode: "edit", id: experience.id });
        return;
      }
      setActiveWorkspace("operations");
      return;
    }
    if (task.reference_type === "localPlace") {
      setActiveWorkspace("operations");
      setLocalPlaceSelection({ mode: "edit", id: task.reference_id });
      return;
    }
    setActiveWorkspace("tasks");
  }

  async function saveInventory() {
    if (!inventorySelection) return;

    const actionKey = inventorySelection.mode === "create"
      ? `inventory-${inventorySelection.type}-create`
      : `inventory-${inventorySelection.type}-${inventorySelection.id}`;
    setPendingAction(actionKey);
    setInventoryMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const now = new Date().toISOString();

      if (inventorySelection.type === "package") {
        const name = String(inventoryDraft.name || "").trim() || "Neue Auszeit";
        const baseSlug = slugify(String(inventoryDraft.slug || "").trim() || name) || "neue-auszeit";
        const packagePayload = {
          headline: String(inventoryDraft.headline || "").trim(),
          subheadline: String(inventoryDraft.subheadline || "").trim(),
          shortDescription: String(inventoryDraft.short_description || "").trim(),
          experienceFeeling: String(inventoryDraft.experience_feeling || "").trim(),
          includedItems: splitLines(String(inventoryDraft.included_items || "")),
          highlights: splitLines(String(inventoryDraft.highlights || "")),
          recommendations: splitLines(String(inventoryDraft.recommendations || "")),
          faq: splitLines(String(inventoryDraft.faq || "")),
          launchNote: String(inventoryDraft.launch_note || "").trim(),
          heroImage: String(inventoryDraft.hero_image || "").trim(),
          galleryImages: splitLines(String(inventoryDraft.gallery_images || "")),
          updatedAt: now,
        };
        const packagePayloadBase = {
          name,
          slug: inventorySelection.mode === "create"
            ? `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`
            : undefined,
          audience: String(inventoryDraft.audience || "families").trim(),
          status: String(inventoryDraft.status || "draft").trim(),
          location: String(inventoryDraft.location || "Sankt Peter-Ording").trim(),
          property_id: String(inventoryDraft.property_id || "").trim() || null,
          price_from: String(inventoryDraft.price_from || "").trim() || null,
          concrete_price: String(inventoryDraft.concrete_price || "").trim() || null,
          payload: packagePayload,
          updated_at: now,
        };

        if (inventorySelection.mode === "create") {
          const insertPayload = {
            ...packagePayloadBase,
            id: `pkg-${crypto.randomUUID()}`,
            slug: packagePayloadBase.slug as string,
          };
          const { data: inserted, error } = await supabase
            .from("packages")
            .insert(insertPayload)
            .select("id,name,slug,audience,location,status,property_id,price_from,concrete_price,payload")
            .single();

          if (error) throw error;

          setDataState((current) => ({
            ...current,
            packages: [inserted as SimpleRow, ...current.packages],
          }));

          await writeAuditLog({
            action: "package_created",
            entityType: "package",
            entityId: (inserted as SimpleRow).id,
            entityLabel: name,
            payload: insertPayload,
          });

          setInventorySelection({ mode: "edit", type: "package", id: (inserted as SimpleRow).id });
          setInventoryMessage("Angelegt.");
          return;
        }

        const currentItem = data.packages.find((item) => item.id === inventorySelection.id);
        if (!currentItem) throw new Error("Missing package");

        const payload = {
          ...(currentItem.payload ?? {}),
          ...packagePayload,
        };
        const updatePayload = {
          name,
          status: packagePayloadBase.status,
          location: packagePayloadBase.location,
          property_id: packagePayloadBase.property_id,
          price_from: packagePayloadBase.price_from,
          concrete_price: packagePayloadBase.concrete_price,
          payload,
          updated_at: now,
        };
        const { error } = await supabase
          .from("packages")
          .update(updatePayload)
          .eq("id", inventorySelection.id);

        if (error) throw error;

        setDataState((current) => ({
          ...current,
          packages: current.packages.map((item) =>
            item.id === inventorySelection.id ? { ...item, ...updatePayload } : item,
          ),
        }));

        await writeAuditLog({
          action: "package_updated",
          entityType: "package",
          entityId: inventorySelection.id,
          entityLabel: currentItem.name || inventorySelection.id,
          payload: updatePayload,
        });
      } else {
        const name = String(inventoryDraft.name || "").trim() || "Neue Unterkunft";
        const propertyPayload = {
          description: String(inventoryDraft.description || "").trim(),
          ownerName: String(inventoryDraft.owner_name || "").trim(),
          email: String(inventoryDraft.owner_email || "").trim(),
          phone: String(inventoryDraft.owner_phone || "").trim(),
          propertyType: String(inventoryDraft.property_type || "").trim(),
          currentRental: String(inventoryDraft.current_rental || "agency").trim(),
          address: String(inventoryDraft.address || "").trim(),
          earliestArrival: String(inventoryDraft.earliest_arrival || "").trim(),
          latestArrival: String(inventoryDraft.latest_arrival || "").trim(),
          checkOutTime: String(inventoryDraft.check_out_time || "").trim(),
          keySafeCode: String(inventoryDraft.key_safe_code || "").trim(),
          checkInInstructions: String(inventoryDraft.check_in_instructions || "").trim(),
          amenities: splitLines(String(inventoryDraft.amenities || "")),
          attributes: draftStringArray(inventoryDraft.attributes),
          experienceWorlds: draftStringArray(inventoryDraft.experience_worlds),
          houseRules: splitLines(String(inventoryDraft.house_rules || "")),
          media: splitLines(String(inventoryDraft.media || "")),
          mediaAltTexts: splitLines(String(inventoryDraft.media_alt_texts || "")),
          imageRightsConfirmed: Boolean(inventoryDraft.image_rights_confirmed),
          updatedAt: now,
        };
        const amenities = splitLines(String(inventoryDraft.amenities || ""));
        const attributes = draftStringArray(inventoryDraft.attributes);
        const experienceWorlds = draftStringArray(inventoryDraft.experience_worlds);
        const houseRules = splitLines(String(inventoryDraft.house_rules || ""));
        const media = splitLines(String(inventoryDraft.media || ""));
        const mediaAltTexts = splitLines(String(inventoryDraft.media_alt_texts || ""));
        const propertyPayloadBase = {
          name,
          status: String(inventoryDraft.status || "draft").trim(),
          location: String(inventoryDraft.location || "Sankt Peter-Ording").trim(),
          sleeps: numberOrNull(String(inventoryDraft.sleeps || "")),
          bedrooms: numberOrNull(String(inventoryDraft.bedrooms || "")),
          bathrooms: numberOrNull(String(inventoryDraft.bathrooms || "")),
          check_in_type: String(inventoryDraft.check_in_type || "").trim() || null,
          support_type: String(inventoryDraft.support_type || "").trim() || null,
          support_name: String(inventoryDraft.support_name || "").trim() || null,
          image_rights_confirmed: Boolean(inventoryDraft.image_rights_confirmed),
          description: propertyPayload.description || null,
          owner_name: propertyPayload.ownerName || null,
          owner_email: propertyPayload.email || null,
          owner_phone: propertyPayload.phone || null,
          property_type: propertyPayload.propertyType || null,
          current_rental: propertyPayload.currentRental || null,
          address: propertyPayload.address || null,
          earliest_arrival: propertyPayload.earliestArrival || null,
          latest_arrival: propertyPayload.latestArrival || null,
          check_out_time: propertyPayload.checkOutTime || null,
          key_safe_code: propertyPayload.keySafeCode || null,
          check_in_instructions: propertyPayload.checkInInstructions || null,
          amenities,
          attributes,
          experience_worlds: experienceWorlds,
          house_rules: houseRules,
          media,
          media_alt_texts: mediaAltTexts,
          payload: propertyPayload,
          updated_at: now,
        };

        if (inventorySelection.mode === "create") {
          const insertPayload = {
            ...propertyPayloadBase,
            id: `property-${crypto.randomUUID()}`,
          };
          const { data: inserted, error } = await supabase
            .from("properties")
            .insert(insertPayload)
            .select("id,name,location,sleeps,bedrooms,bathrooms,check_in_type,support_type,support_name,image_rights_confirmed,description,owner_name,owner_email,owner_phone,property_type,current_rental,address,earliest_arrival,latest_arrival,check_out_time,key_safe_code,check_in_instructions,amenities,attributes,experience_worlds,house_rules,media,media_alt_texts,cleaning_status,maintenance_status,last_check,status,payload")
            .single();

          if (error) throw error;

          setDataState((current) => ({
            ...current,
            properties: [inserted as SimpleRow, ...current.properties],
          }));

          await writeAuditLog({
            action: "property_created",
            entityType: "property",
            entityId: (inserted as SimpleRow).id,
            entityLabel: name,
            payload: insertPayload,
          });

          setInventorySelection({ mode: "edit", type: "property", id: (inserted as SimpleRow).id });
          setInventoryMessage("Angelegt.");
          return;
        }

        const currentItem = data.properties.find((item) => item.id === inventorySelection.id);
        if (!currentItem) throw new Error("Missing property");

        const payload = {
          ...(currentItem.payload ?? {}),
          ...propertyPayload,
        };
        const updatePayload = {
          name,
          status: propertyPayloadBase.status,
          location: propertyPayloadBase.location,
          sleeps: propertyPayloadBase.sleeps,
          bedrooms: propertyPayloadBase.bedrooms,
          bathrooms: propertyPayloadBase.bathrooms,
          check_in_type: propertyPayloadBase.check_in_type,
          support_type: propertyPayloadBase.support_type,
          support_name: propertyPayloadBase.support_name,
          image_rights_confirmed: propertyPayloadBase.image_rights_confirmed,
          payload,
          updated_at: now,
        };
        const { error } = await supabase
          .from("properties")
          .update(updatePayload)
          .eq("id", inventorySelection.id);

        if (error) throw error;

        setDataState((current) => ({
          ...current,
          properties: current.properties.map((item) =>
            item.id === inventorySelection.id ? { ...item, ...updatePayload } : item,
          ),
        }));

        await writeAuditLog({
          action: "property_updated",
          entityType: "property",
          entityId: inventorySelection.id,
          entityLabel: currentItem.name || inventorySelection.id,
          payload: updatePayload,
        });
      }

      setInventoryMessage("Gespeichert.");
    } catch {
      setInventoryMessage("Die Daten konnten nicht gespeichert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function saveExperience() {
    if (!experienceSelection) return;

    const actionKey = experienceSelection.mode === "create"
      ? "experience-create"
      : `experience-${experienceSelection.id}`;
    setPendingAction(actionKey);
    setExperienceMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const now = new Date().toISOString();
      const title = String(experienceDraft.title || "").trim() || "Neuer Erlebnisbaustein";
      const guestNote = String(experienceDraft.guest_note || "").trim();
      const priceNote = String(experienceDraft.price_note || "").trim();
      const capacityNote = String(experienceDraft.capacity_note || "").trim();
      const availabilityNote = String(experienceDraft.availability_note || "").trim();
      const qualityScoreRaw = String(experienceDraft.quality_score || "").trim();
      const qualityScore = qualityScoreRaw ? Number.parseInt(qualityScoreRaw, 10) : null;
      const qualityNote = String(experienceDraft.quality_note || "").trim();

      const payload = {
        guestNote,
        priceNote,
        capacityNote,
        availabilityNote,
        qualityScore: qualityScoreRaw,
        qualityNote,
        updatedAt: now,
      };
      const updatePayload = {
        title,
        package_id: String(experienceDraft.package_id || "").trim() || null,
        provider_id: String(experienceDraft.provider_id || "").trim() || null,
        role: String(experienceDraft.role || "planned").trim(),
        included_in_price: Boolean(experienceDraft.included_in_price),
        confirmation_status: String(experienceDraft.confirmation_status || "planned").trim(),
        guest_note: guestNote || null,
        price_note: priceNote || null,
        capacity_note: capacityNote || null,
        availability_note: availabilityNote || null,
        quality_score: qualityScore !== null && Number.isFinite(qualityScore) ? qualityScore : null,
        quality_note: qualityNote || null,
        payload,
        updated_at: now,
      };

      if (experienceSelection.mode === "create") {
        const { data: inserted, error } = await supabase
          .from("experience_blocks")
          .insert(updatePayload)
          .select(experienceBlockSelectColumns)
          .single();

        if (error) throw error;

        setDataState((current) => ({
          ...current,
          experienceBlocks: [inserted as ExperienceBlockRow, ...current.experienceBlocks],
        }));

        await writeAuditLog({
          action: "experience_created",
          entityType: "experience",
          entityId: (inserted as ExperienceBlockRow).id,
          entityLabel: title,
          payload: updatePayload,
        });

        setExperienceSelection({ mode: "edit", id: (inserted as ExperienceBlockRow).id });
        setExperienceMessage("Angelegt.");
        return;
      }

      const currentItem = data.experienceBlocks.find((item) => item.id === experienceSelection.id);
      if (!currentItem) throw new Error("Missing experience");

      const mergedPayload = {
        ...(currentItem.payload ?? {}),
        ...payload,
      };
      const editPayload = {
        ...updatePayload,
        payload: mergedPayload,
      };
      const { error } = await supabase
        .from("experience_blocks")
        .update(editPayload)
        .eq("id", experienceSelection.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        experienceBlocks: current.experienceBlocks.map((item) =>
          item.id === experienceSelection.id ? { ...item, ...editPayload } : item,
        ),
      }));

      await writeAuditLog({
        action: "experience_updated",
        entityType: "experience",
        entityId: experienceSelection.id,
        entityLabel: currentItem.title,
        payload: editPayload,
      });

      setExperienceMessage("Gespeichert.");
    } catch {
      setExperienceMessage("Das Erlebnis konnte nicht gespeichert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function saveLocalPlace() {
    if (!localPlaceSelection) return;

    const actionKey = localPlaceSelection.mode === "create"
      ? "local-place-create"
      : `local-place-${localPlaceSelection.id}`;
    setPendingAction(actionKey);
    setLocalPlaceMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const now = new Date().toISOString();
      const name = String(localPlaceDraft.name || "").trim() || "Neuer Ort";
      const category = String(localPlaceDraft.category || "food").trim();
      const status = String(localPlaceDraft.status || "candidate").trim();
      const curationKind = String(
        localPlaceDraft.curation_kind || (category === "event" ? "local_event" : "local_tip"),
      ).trim();
      const description = String(localPlaceDraft.description || "").trim() || null;
      const cuisine = String(localPlaceDraft.cuisine || "").trim() || null;
      const eventDate = String(localPlaceDraft.event_date || "").trim() || null;
      const eventTime = String(localPlaceDraft.event_time || "").trim() || null;
      const eventAudience = String(localPlaceDraft.event_audience || "").trim() || null;
      const eventSetting = String(localPlaceDraft.event_setting || "").trim() || null;
      const eventFitNote = String(localPlaceDraft.event_fit_note || "").trim() || null;
      const bestFor = splitLines(String(localPlaceDraft.best_for || ""));
      const images = splitLines(String(localPlaceDraft.images || ""));
      const payload = {
        description,
        cuisine,
        openingHours: String(localPlaceDraft.opening_hours || "").trim(),
        packageFit: splitLines(String(localPlaceDraft.package_fit || "")),
        curationKind,
        eventDate,
        eventTime,
        eventAudience,
        eventSetting,
        eventFitNote,
        bestFor,
        images,
        updatedAt: now,
      };
      const updatePayload = {
        name,
        category,
        status,
        lat: numberOrNull(String(localPlaceDraft.lat || "")),
        lng: numberOrNull(String(localPlaceDraft.lng || "")),
        address: String(localPlaceDraft.address || "").trim() || null,
        website: String(localPlaceDraft.website || "").trim() || null,
        reservation_url: String(localPlaceDraft.reservation_url || "").trim() || null,
        menu_url: String(localPlaceDraft.menu_url || "").trim() || null,
        rating: numberOrNull(String(localPlaceDraft.rating || "")),
        opening_hours: String(localPlaceDraft.opening_hours || "").trim()
          ? { note: String(localPlaceDraft.opening_hours || "").trim() }
          : null,
        package_fit: splitLines(String(localPlaceDraft.package_fit || "")),
        description,
        cuisine,
        curation_kind: curationKind || null,
        event_date: eventDate,
        event_time: eventTime,
        event_audience: eventAudience,
        event_setting: eventSetting,
        event_fit_note: eventFitNote,
        best_for: bestFor,
        audiences: bestFor,
        images,
        payload,
        updated_at: now,
      };

      if (localPlaceSelection.mode === "create") {
        const { data: inserted, error } = await supabase
          .from("local_places")
          .insert({
            ...updatePayload,
            id: `place-${crypto.randomUUID()}`,
          })
          .select(localPlaceAdminSelectColumns)
          .single();

        if (error) throw error;

        setDataState((current) => ({
          ...current,
          localPlaces: [inserted as LocalPlaceRow, ...current.localPlaces],
        }));

        await writeAuditLog({
          action: "local_place_created",
          entityType: "local_place",
          entityId: (inserted as LocalPlaceRow).id,
          entityLabel: name,
          payload: updatePayload,
        });

        setLocalPlaceSelection({ mode: "edit", id: (inserted as LocalPlaceRow).id });
        setLocalPlaceMessage("Angelegt.");
        return;
      }

      const currentItem = data.localPlaces.find((item) => item.id === localPlaceSelection.id);
      if (!currentItem) throw new Error("Missing local place");

      const editPayload = {
        ...updatePayload,
        payload: {
          ...(currentItem.payload ?? {}),
          ...payload,
        },
      };
      const { error } = await supabase
        .from("local_places")
        .update(editPayload)
        .eq("id", localPlaceSelection.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        localPlaces: current.localPlaces.map((item) =>
          item.id === localPlaceSelection.id ? { ...item, ...editPayload } : item,
        ),
      }));

      await writeAuditLog({
        action: "local_place_updated",
        entityType: "local_place",
        entityId: localPlaceSelection.id,
        entityLabel: currentItem.name,
        payload: editPayload,
      });

      setLocalPlaceMessage("Gespeichert.");
    } catch {
      setLocalPlaceMessage("Der Ort konnte nicht gespeichert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function savePackageDate() {
    if (!dateSelection) return;

    const actionKey = dateSelection.mode === "create" ? "date-create" : `date-${dateSelection.id}`;
    setPendingAction(actionKey);
    setDateMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const now = new Date().toISOString();
      const packageId = String(dateDraft.package_id || "").trim();
      if (!packageId) {
        setDateMessage("Bitte zuerst eine Auszeit auswählen.");
        return;
      }
      const label = String(dateDraft.label || "").trim() || "Neuer Termin";

      const payload = {
        note: String(dateDraft.note || "").trim(),
        updatedAt: now,
      };
      const updatePayload = {
        label,
        package_id: packageId,
        starts_on: String(dateDraft.starts_on || "").trim() || null,
        ends_on: String(dateDraft.ends_on || "").trim() || null,
        capacity: numberOrNull(String(dateDraft.capacity || "")),
        status: String(dateDraft.status || "available").trim(),
        payload,
        updated_at: now,
      };

      if (dateSelection.mode === "create") {
        const { data: inserted, error } = await supabase
          .from("package_dates")
          .insert(updatePayload)
          .select("id,package_id,label,starts_on,ends_on,capacity,status,payload,created_at")
          .single();

        if (error) throw error;

        setDataState((current) => ({
          ...current,
          packageDates: [inserted as PackageDateRow, ...current.packageDates],
        }));

        await writeAuditLog({
          action: "package_date_created",
          entityType: "package_date",
          entityId: (inserted as PackageDateRow).id,
          entityLabel: label,
          payload: updatePayload,
        });

        setDateSelection({ mode: "edit", id: (inserted as PackageDateRow).id });
        setDateMessage("Angelegt.");
        return;
      }

      const currentItem = data.packageDates.find((item) => item.id === dateSelection.id);
      if (!currentItem) throw new Error("Missing date");

      const editPayload = {
        ...updatePayload,
        payload: {
          ...(currentItem.payload ?? {}),
          ...payload,
        },
      };
      const { error } = await supabase
        .from("package_dates")
        .update(editPayload)
        .eq("id", dateSelection.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        packageDates: current.packageDates.map((item) =>
          item.id === dateSelection.id ? { ...item, ...editPayload } : item,
        ),
      }));

      await writeAuditLog({
        action: "package_date_updated",
        entityType: "package_date",
        entityId: dateSelection.id,
        entityLabel: currentItem.label,
        payload: editPayload,
      });

      setDateMessage("Gespeichert.");
    } catch {
      setDateMessage("Der Termin konnte nicht gespeichert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <main className="admin-shell admin-dashboard">
      <header className="admin-header">
        <a aria-label="Morrow Startseite" href="https://www.getmorrow.de">
          <img alt="morrow" src="/brand/morrow-wordmark-offblack.svg" />
        </a>
        <nav aria-label="Admin Navigation">
          {adminWorkspaces.map((item) => (
            <button
              aria-pressed={activeWorkspace === item.id}
              className={activeWorkspace === item.id ? "is-active" : undefined}
              key={item.id}
              onClick={() => setActiveWorkspace(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
          <button onClick={onLogout} type="button">
            Abmelden
          </button>
        </nav>
      </header>

      <section className="admin-hero">
        <p className="admin-eyebrow">Morrow Admin</p>
        <h1>{workspace.title}</h1>
        <p>{workspace.text}</p>
        <p className="admin-hero-meta">Migrierte Bereiche: {workspace.legacySections.join(" · ")}</p>
        <p className="admin-hero-meta">Angemeldet als {displayName}</p>
        {actionMessage ? <p className="admin-action-message">{actionMessage}</p> : null}
      </section>

      <section className="admin-metrics" aria-label="Kennzahlen" hidden={activeWorkspace !== "overview"}>
        <article>
          <span>Offene Anfragen</span>
          <strong>{openLeads.length}</strong>
          <p>{activeLeads.length} aktiv · {archivedLeads.length} archiviert</p>
        </article>
        <article>
          <span>Buchungen</span>
          <strong>{data.bookings.length}</strong>
          <p>{paidBookings.length} bezahlt markiert</p>
        </article>
        <article>
          <span>Kunden</span>
          <strong>{activeCustomerRows.length}</strong>
          <p>{customerRows.length - activeCustomerRows.length} Testkontakte ausgeblendet</p>
        </article>
        <article>
          <span>Heute fällig</span>
          <strong>{dueTasks.length}</strong>
          <p>{activeTasks.length} aktive Aufgaben</p>
        </article>
        <article>
          <span>Monitoring</span>
          <strong>{monitoring.length}</strong>
          <p>{openSupport.length} offene Supportfälle</p>
        </article>
        <article>
          <span>Feedback</span>
          <strong>{averageRating ? averageRating.toFixed(1) : "–"}</strong>
          <p>{data.guestFeedback.length} Rückmeldungen geladen</p>
        </article>
        <article>
          <span>Vor Ort</span>
          <strong>{approvedLocalPlaces.length}</strong>
          <p>{candidateLocalPlaces.length} Kandidaten prüfen</p>
        </article>
      </section>

      <section className="admin-grid" id="aufgaben" hidden={!["overview", "tasks", "activity"].includes(activeWorkspace)}>
        {activeWorkspace === "overview" ? (
        <article className="admin-card admin-card-wide">
          <p className="admin-eyebrow">Tagessteuerung</p>
          <h2>Heute zuerst</h2>
          <p>
            Fällige Aufgaben, Nachfassaktionen, offene Supportfälle und kritisches Feedback.
            Die Bearbeitung passiert im jeweiligen Detailbereich.
          </p>
          <div className="admin-list">
            {overviewWorkItems.map((item) => (
              <article className="admin-list-item" key={item.id}>
                <div>
                  <small>{item.label}</small>
                  <strong>{item.title}</strong>
                  <em>{item.meta}</em>
                </div>
                <div className="admin-row-actions">
                  <button onClick={item.action} type="button">
                    Öffnen
                  </button>
                </div>
              </article>
            ))}
            {overviewWorkItems.length === 0 ? (
              <p className="admin-drawer-message">Für den Moment ist keine Tagesarbeit fällig.</p>
            ) : null}
          </div>
        </article>
        ) : null}

        {activeWorkspace === "tasks" ? (
        <article className="admin-card admin-card-wide">
          <p className="admin-eyebrow">Aufgaben</p>
          <h2>{editingTaskId ? "Aufgabe bearbeiten" : "Heute im Blick"}</h2>
          <div className="admin-task-create">
            <label>
              Aufgabe
              <input
                onChange={(event) => setTaskDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="z. B. Zahlung prüfen"
                value={taskDraft.title}
              />
            </label>
            <label>
              Bezug
              <select
                onChange={(event) => setTaskDraft((current) => ({ ...current, referenceValue: event.target.value }))}
                value={taskDraft.referenceValue || taskReferenceOptions[0]?.value || ""}
              >
                {taskReferenceSelectOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label>
              Fällig
              <input
                onChange={(event) => setTaskDraft((current) => ({ ...current, dueAt: event.target.value }))}
                type="date"
                value={taskDraft.dueAt}
              />
            </label>
            <label>
              Priorität
              <select
                onChange={(event) => setTaskDraft((current) => ({ ...current, priority: event.target.value as TaskDraft["priority"] }))}
                value={taskDraft.priority}
              >
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
              </select>
            </label>
            <label className="admin-task-note">
              Notiz
              <textarea
                onChange={(event) => setTaskDraft((current) => ({ ...current, note: event.target.value }))}
                placeholder="Kurz notieren, was als Nächstes zu tun ist."
                value={taskDraft.note}
              />
            </label>
            <button
              className="admin-button"
              disabled={
                pendingAction?.startsWith("task-create") ||
                pendingAction?.startsWith("task-update") ||
                (!editingTaskId && taskReferenceOptions.length === 0)
              }
              onClick={saveAdminTask}
              type="button"
            >
              {editingTaskId ? "Aufgabe speichern" : "Aufgabe anlegen"}
            </button>
            {editingTaskId ? (
              <button className="admin-button secondary" onClick={() => resetTaskDraft()} type="button">
                Abbrechen
              </button>
            ) : null}
          </div>
          <div className="admin-card-toolbar" aria-label="Aufgabenfilter">
            {(["open", "in_progress", "done", "all"] as TaskStatusFilter[]).map((status) => (
              <button
                aria-pressed={taskStatusFilter === status}
                className={taskStatusFilter === status ? "is-active" : undefined}
                key={status}
                onClick={() => setTaskStatusFilter(status)}
                type="button"
              >
                {status === "all" ? "Alle Status" : taskStatusLabel(status)}
              </button>
            ))}
            {(["all", "lead", "booking", "support", "package", "property", "experience", "localPlace", "owner", "experienceProvider"] as TaskReferenceFilter[]).map((filter) => (
              <button
                aria-pressed={taskReferenceFilter === filter}
                className={taskReferenceFilter === filter ? "is-active" : undefined}
                key={filter}
                onClick={() => setTaskReferenceFilter(filter)}
                type="button"
              >
                {taskReferenceFilterLabel(filter)}
              </button>
            ))}
            {(["all", "high", "medium", "low"] as TaskPriorityFilter[]).map((priority) => (
              <button
                aria-pressed={taskPriorityFilter === priority}
                className={taskPriorityFilter === priority ? "is-active" : undefined}
                key={priority}
                onClick={() => setTaskPriorityFilter(priority)}
                type="button"
              >
                {taskPriorityFilterLabel(priority)}
              </button>
            ))}
          </div>
          <div className="admin-list">
            {filteredTasks.slice(0, 12).map((task) => (
              <article className="admin-list-item" key={task.id}>
                <div>
                  <small>
                    {taskTimingLabel(task)} · {taskPriorityLabel(task.priority)}
                  </small>
                  <strong>{task.title}</strong>
                  <em>
                    {taskReferenceLabel(task.reference_type)} · {task.reference_label || task.reference_id}
                  </em>
                  {task.note ? <p>{task.note}</p> : null}
                </div>
                <div className="admin-row-actions">
                  <button onClick={() => startEditTask(task)} type="button">
                    Bearbeiten
                  </button>
                  <button onClick={() => openTaskReference(task)} type="button">
                    Bezug öffnen
                  </button>
                  {taskStatuses.map((status) => (
                    <button
                      disabled={pendingAction === `task-${task.id}-${status}`}
                      key={status}
                      onClick={() => updateTaskStatus(task, status)}
                      type="button"
                    >
                      {taskStatusLabel(status)}
                    </button>
                  ))}
                  <button
                    className="is-danger"
                    disabled={pendingAction === `task-delete-${task.id}`}
                    onClick={() => deleteAdminTask(task)}
                    type="button"
                  >
                    Löschen
                  </button>
                </div>
              </article>
            ))}
            {filteredTasks.length === 0 ? (
              <p className="admin-drawer-message">Keine passenden Aufgaben vorhanden.</p>
            ) : null}
          </div>
        </article>
        ) : null}

        {activeWorkspace === "overview" ? (
        <article className="admin-card">
          <p className="admin-eyebrow">Monitoring</p>
          <h2>Fehlende Daten und Risiken</h2>
          <div className="admin-list">
            {monitoring.slice(0, 8).map((item) => (
              <article className="admin-list-item" key={item.id}>
                <div>
                  <small>{item.label} · {item.severity === "high" ? "hoch" : "prüfen"}</small>
                  <strong>{item.title}</strong>
                  <em>{item.description}</em>
                </div>
              </article>
            ))}
            {monitoring.length === 0 ? (
              <p className="admin-drawer-message">Keine akuten Monitoringhinweise vorhanden.</p>
            ) : null}
          </div>
        </article>
        ) : null}

        {["overview", "activity"].includes(activeWorkspace) ? (
        <article className="admin-card admin-card-wide" id="audit">
          <p className="admin-eyebrow">Änderungen</p>
          <h2>Letzte Aktivitäten</h2>
          <div className="admin-timeline admin-timeline-compact">
            {data.auditLogs.length ? (
              data.auditLogs.slice(0, 8).map((log) => (
                <article key={log.id}>
                  <small>
                    {formatDate(log.created_at)} · {log.actor_email || "Morrow"}
                  </small>
                  <strong>{auditActionLabel(log.action)}</strong>
                  <p>
                    {log.entity_label ? `${log.entity_label} · ` : ""}
                    {auditPayloadSummary(log)}
                  </p>
                </article>
              ))
            ) : (
              <p className="admin-drawer-message">Noch keine Änderungen protokolliert.</p>
            )}
          </div>
        </article>
        ) : null}

        {activeWorkspace === "activity" ? (
        <article className="admin-card admin-card-wide" id="kommunikation">
          <p className="admin-eyebrow">Kommunikation</p>
          <h2>Zentrale Historie</h2>
          <p>
            Alle geladenen Kommunikationsereignisse aus Anfragen, Buchungen,
            Kunden und Support. Detailarbeit bleibt im jeweiligen Drawer.
          </p>
          <div className="admin-communication-controls">
            <label>
              Suche
              <input
                onChange={(event) => setCommunicationSearch(event.target.value)}
                placeholder="Name, Betreff, Inhalt, Empfänger"
                value={communicationSearch}
              />
            </label>
            <div className="admin-card-toolbar" aria-label="Kommunikationsfilter">
              {([
                ["all", "Alle"],
                ["email", "E-Mail"],
                ["note", "Notizen"],
                ["inbound", "Eingehend"],
                ["outbound", "Ausgehend"],
                ["internal", "Intern"],
              ] as [CommunicationChannelFilter, string][]).map(([value, label]) => (
                <button
                  aria-pressed={communicationChannelFilter === value}
                  className={communicationChannelFilter === value ? "is-active" : undefined}
                  key={value}
                  onClick={() => setCommunicationChannelFilter(value)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="admin-list">
            {filteredCommunicationEvents.slice(0, 24).map((event) => (
              <article className="admin-list-item" key={event.id}>
                <div>
                  <small>
                    {formatDate(event.created_at)} · {communicationChannelLabel(event.channel)} · {communicationDirectionLabel(event.direction)}
                  </small>
                  <strong>{event.subject || event.event_type}</strong>
                  <em>{communicationContextLabel(event, data)}</em>
                  {event.body ? <p>{event.body}</p> : null}
                </div>
                <div className="admin-row-actions">
                  {event.recipient ? <a href={`mailto:${event.recipient}`}>{event.recipient}</a> : null}
                  {event.lead_id ? (
                    <button onClick={() => setSelection({ type: "lead", id: event.lead_id as string })} type="button">
                      Anfrage öffnen
                    </button>
                  ) : null}
                  {event.booking_id ? (
                    <button onClick={() => setSelection({ type: "booking", id: event.booking_id as string })} type="button">
                      Buchung öffnen
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
            {filteredCommunicationEvents.length === 0 ? (
              <p className="admin-drawer-message">Keine passende Kommunikation gefunden.</p>
            ) : null}
          </div>
        </article>
        ) : null}
      </section>

      <section className="admin-grid" id="anfragen" hidden={activeWorkspace !== "crm"}>
        <article className="admin-card">
          <p className="admin-eyebrow">Anfragen</p>
          <h2>{leadScopeFilter === "archived" ? "Archivierte Anfragen" : "Aktive Anfragen"}</h2>
          <div className="admin-card-toolbar" aria-label="Anfragenfilter">
            {(["active", "archived"] as LeadScopeFilter[]).map((scope) => (
              <button
                aria-pressed={leadScopeFilter === scope}
                className={leadScopeFilter === scope ? "is-active" : undefined}
                key={scope}
                onClick={() => setLeadScopeFilter(scope)}
                type="button"
              >
                {scope === "active" ? "Aktiv" : "Archiv"}
              </button>
            ))}
            {(["all", "guest", "owner", "experience"] as LeadTypeFilter[]).map((type) => (
              <button
                aria-pressed={leadTypeFilter === type}
                className={leadTypeFilter === type ? "is-active" : undefined}
                key={type}
                onClick={() => setLeadTypeFilter(type)}
                type="button"
              >
                {type === "all" ? "Alle Typen" : type === "guest" ? "Gast" : type === "owner" ? "Eigentümer" : "Erlebnis"}
              </button>
            ))}
            {(["all", "Neu", "In Prüfung", "Kontaktiert", "Reserviert", "Kein Interesse"] as LeadStatusFilter[]).map((status) => (
              <button
                aria-pressed={leadStatusFilter === status}
                className={leadStatusFilter === status ? "is-active" : undefined}
                key={status}
                onClick={() => setLeadStatusFilter(status)}
                type="button"
              >
                {status === "all" ? "Alle Status" : status}
              </button>
            ))}
            {(["all", "due", "new", "review"] as LeadWorkFilter[]).map((work) => (
              <button
                aria-pressed={leadWorkFilter === work}
                className={leadWorkFilter === work ? "is-active" : undefined}
                key={work}
                onClick={() => setLeadWorkFilter(work)}
                type="button"
              >
                {work === "all" ? "Alle Arbeit" : work === "due" ? "Fällig" : work === "new" ? "Neu" : "In Prüfung"}
              </button>
            ))}
          </div>
          <div className="admin-list">
            {filteredLeads.slice(0, 14).map((lead) => (
              <article className="admin-list-item" key={lead.id}>
                <div>
                  <small>{formatDate(lead.created_at)} · {leadWorkLabel(lead)}</small>
                  <strong>{getLeadLabel(lead)}</strong>
                  <em>{lead.status} · {leadIntentLabel(lead)}</em>
                  <p>{leadWorkMeta(lead)}</p>
                </div>
                <div className="admin-row-actions">
                  <button onClick={() => setSelection({ type: "lead", id: lead.id })} type="button">
                    Details
                  </button>
                  <label className="admin-inline-date">
                    Wiedervorlage
                    <input
                      defaultValue={getLeadFollowUpAt(lead) || ""}
                      disabled={pendingAction === `lead-${lead.id}-follow-up`}
                      onBlur={(event) => {
                        const nextValue = event.currentTarget.value;
                        if (nextValue !== (getLeadFollowUpAt(lead) || "")) {
                          void updateLeadFollowUp(lead, nextValue);
                        }
                      }}
                      type="date"
                    />
                  </label>
                  {leadQuickStatuses.map((status) => (
                    <button
                      disabled={pendingAction === `lead-${lead.id}-${status}`}
                      key={status}
                      onClick={() => updateLeadStatus(lead, status)}
                      type="button"
                    >
                      {status}
                    </button>
                  ))}
                  {!lead.archived_at && lead.type === "guest" ? (
                    <button
                      disabled={pendingAction === `lead-${lead.id}-reserve`}
                      onClick={() => reserveLead(lead)}
                      type="button"
                    >
                      Reservieren
                    </button>
                  ) : null}
                  {lead.archived_at ? (
                    <button
                      disabled={pendingAction === `lead-${lead.id}-reactivate`}
                      onClick={() => updateLeadArchive(lead, false)}
                      type="button"
                    >
                      Reaktivieren
                    </button>
                  ) : (
                    <button
                      className="is-danger"
                      disabled={pendingAction === `lead-${lead.id}-archive`}
                      onClick={() => updateLeadArchive(lead, true)}
                      type="button"
                    >
                      Archivieren
                    </button>
                  )}
                  {isLeadTest(lead) ? (
                    <button
                      className="is-danger"
                      disabled={pendingAction === `lead-${lead.id}-delete`}
                      onClick={() => deleteTestLead(lead)}
                      type="button"
                    >
                      Test löschen
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
            {filteredLeads.length === 0 ? (
              <p className="admin-drawer-message">
                Keine passenden {leadScopeFilter === "archived" ? "archivierten" : "aktiven"} Anfragen gefunden.
              </p>
            ) : null}
          </div>
        </article>

        <article className="admin-card admin-card-wide" id="kunden">
          <p className="admin-eyebrow">Kunden</p>
          <h2>Gastkontakte aus Anfragen und Buchungen</h2>
          <p>
            Dieser Bereich führt Gastanfragen und Buchungen zu einem Kundenblick
            zusammen. Eigentümer- und Erlebnispartneranfragen bleiben in ihren
            eigenen Arbeitsbereichen.
          </p>
          <div className="admin-card-toolbar" aria-label="Kundenfilter">
            {[
              ["all", "Alle"],
              ["request", "Anfragephase"],
              ["booking", "Mit Buchung"],
              ["due", "Fällig"],
            ].map(([value, label]) => (
              <button
                aria-pressed={customerPhaseFilter === value}
                className={customerPhaseFilter === value ? "is-active" : undefined}
                key={value}
                onClick={() => setCustomerPhaseFilter(value as CustomerPhaseFilter)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="admin-list">
            {filteredCustomerRows.slice(0, 12).map((customer) => {
              const latestLead = [...customer.leads].sort((a, b) => compareNewest(a.created_at, b.created_at))[0];
              const latestBooking = [...customer.bookings].sort((a, b) => compareNewest(a.created_at, b.created_at))[0];

              return (
                <article className="admin-list-item" key={customer.id}>
                  <div>
                    <small>
                      {customerPhaseLabel(customer)} · {customer.latestCreatedAt ? formatDate(customer.latestCreatedAt) : "ohne Datum"} · {customer.source}
                    </small>
                    <strong>{customer.name}</strong>
                    <em>{customer.latestStatus} · {customer.nextStep}</em>
                    <p>
                      {customer.leads.length} Anfrage{customer.leads.length === 1 ? "" : "n"} · {customer.bookings.length} Buchung{customer.bookings.length === 1 ? "" : "en"}
                    </p>
                  </div>
                  <div className="admin-row-actions">
                    {customer.email ? <a href={`mailto:${customer.email}`}>{customer.email}</a> : null}
                    {customer.phone ? <a href={`tel:${customer.phone.replace(/\s+/g, "")}`}>{customer.phone}</a> : null}
                    <button onClick={() => setSelectedCustomerId(customer.id)} type="button">
                      Kunde öffnen
                    </button>
                    {latestLead ? (
                      <button onClick={() => setSelection({ type: "lead", id: latestLead.id })} type="button">
                        Anfrage öffnen
                      </button>
                    ) : null}
                    {latestBooking ? (
                      <button onClick={() => setSelection({ type: "booking", id: latestBooking.id })} type="button">
                        Buchung öffnen
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
            {filteredCustomerRows.length === 0 ? (
              <p className="admin-drawer-message">Keine passenden Gastkontakte vorhanden.</p>
            ) : null}
          </div>
        </article>

        <article className="admin-card" id="buchungen">
          <p className="admin-eyebrow">Buchungen</p>
          <h2>Aktuelle Aufenthalte</h2>
          <div className="admin-list">
            {data.bookings.slice(0, 8).map((booking) => (
              <article className="admin-list-item" key={booking.id}>
                <div>
                  <small>{formatDate(booking.created_at)}</small>
                  <strong>{getBookingLabel(booking)}</strong>
                  <em>
                    {booking.status} · {booking.payment_status}
                  </em>
                </div>
                <div className="admin-row-actions">
                  <button
                    onClick={() => setSelection({ type: "booking", id: booking.id })}
                    type="button"
                  >
                    Details
                  </button>
                  {isGuestAreaUnlocked(booking.status) && booking.guest_access_code ? (
                    <a href={guestAreaHref(booking)} rel="noreferrer" target="_blank">
                      Gästebereich
                    </a>
                  ) : null}
                  {bookingStatuses.map((status) => (
                    <button
                      disabled={pendingAction === `booking-${booking.id}-${status}`}
                      key={status}
                      onClick={() => updateBookingStatus(booking, status)}
                      type="button"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-grid" id="support" hidden={activeWorkspace !== "support"}>
        <article className="admin-card admin-card-wide">
          <p className="admin-eyebrow">Gästesupport</p>
          <h2>Nachrichten aus dem Gästebereich</h2>
          <p>
            Hier landen Fragen und Probleme aus der Gäste-App. Jeder Fall bleibt mit
            der passenden Buchung oder Anfrage verbunden.
          </p>
          <div className="admin-card-toolbar" aria-label="Supportfilter">
            {([
              ["all", "Alle Status"],
              ["open", "Offen"],
              ["in_progress", "In Arbeit"],
              ["closed", "Geschlossen"],
            ] as [SupportStatusFilter, string][]).map(([value, label]) => (
              <button
                aria-pressed={supportStatusFilter === value}
                className={supportStatusFilter === value ? "is-active" : undefined}
                key={value}
                onClick={() => setSupportStatusFilter(value)}
                type="button"
              >
                {label}
              </button>
            ))}
            {([
              ["all", "Alle Dringlichkeiten"],
              ["urgent", "Dringend"],
              ["medium", "Mittel"],
              ["normal", "Normal"],
            ] as [SupportUrgencyFilter, string][]).map(([value, label]) => (
              <button
                aria-pressed={supportUrgencyFilter === value}
                className={supportUrgencyFilter === value ? "is-active" : undefined}
                key={value}
                onClick={() => setSupportUrgencyFilter(value)}
                type="button"
              >
                {label}
              </button>
            ))}
            <select
              aria-label="Supportkategorie filtern"
              onChange={(event) => setSupportCategoryFilter(event.target.value)}
              value={supportCategoryFilter}
            >
              <option value="all">Alle Kategorien</option>
              {supportCategoryOptions.map((category) => (
                <option key={category} value={category}>
                  {supportCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-list">
            {filteredSupportMessages.length ? (
              filteredSupportMessages.slice(0, 16).map((support) => (
                <article className="admin-list-item" key={support.id}>
                  <div>
                    <small>
                      {formatDate(support.created_at)} · {supportUrgencyLabel(support.urgency)} · {supportCategoryLabel(support.category)}
                    </small>
                    <strong>{getSupportContactLabel(support)}</strong>
                    <em>
                      {getSupportLabel(support)} · {supportStatusLabel(support.status)}
                    </em>
                  </div>
                  <div className="admin-row-actions">
                    <button
                      onClick={() => setSelection({ type: "support", id: support.id })}
                      type="button"
                    >
                      Details
                    </button>
                    {supportStatuses.map((status) => (
                      <button
                        disabled={pendingAction === `support-${support.id}-${status}`}
                        key={status}
                        onClick={() => updateSupportStatus(support, status)}
                        type="button"
                      >
                        {supportStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <p className="admin-drawer-message">Keine passenden Supportnachrichten vorhanden.</p>
            )}
          </div>
        </article>
      </section>

      <section className="admin-grid" id="feedback" hidden={activeWorkspace !== "support"}>
        <article className="admin-card admin-card-wide">
          <p className="admin-eyebrow">Feedback</p>
          <h2>Rückmeldungen nach dem Aufenthalt</h2>
          <p>
            Hier werden Gästestimmen aus dem Gästebereich gesammelt. Niedrige
            Bewertungen sind ein Signal für Nachfassen und Verbesserungen.
          </p>
          {lowFeedback.length ? (
            <div className="admin-feedback-alert">
              <strong>{lowFeedback.length} Rückmeldung{lowFeedback.length === 1 ? "" : "en"} prüfen</strong>
              <span>Bewertung 3 oder niedriger</span>
            </div>
          ) : null}
          <div className="admin-list">
            {data.guestFeedback.length ? (
              data.guestFeedback.slice(0, 10).map((feedback) => {
                const booking = feedback.booking_id
                  ? data.bookings.find((item) => item.id === feedback.booking_id)
                  : null;

                return (
                  <article className="admin-list-item" key={feedback.id}>
                    <div>
                      <small>
                        {formatDate(feedback.created_at)} · {feedback.rating ? `${feedback.rating}/5` : "ohne Bewertung"}
                      </small>
                      <strong>{getFeedbackPackageLabel(feedback, data.bookings)}</strong>
                      <em>{feedbackReturnInterestLabel(feedback.return_interest)}</em>
                      <p>{getFeedbackText(feedback)}</p>
                    </div>
                    <div className="admin-row-actions">
                      {booking ? (
                        <button
                          onClick={() => setSelection({ type: "booking", id: booking.id })}
                          type="button"
                        >
                          Buchung öffnen
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="admin-drawer-message">Noch kein Gästefeedback vorhanden.</p>
            )}
          </div>
        </article>
      </section>

      <section className="admin-grid" id="vor-ort" hidden={activeWorkspace !== "operations"}>
        <article className="admin-card admin-card-wide">
          <p className="admin-eyebrow">Vor Ort</p>
          <h2>Kuratierte Orte und Empfehlungen</h2>
          <p>
            Diese Datensätze steuern, was Gäste in der Vor-Ort-Karte sehen:
            Restaurants, Strände, Veranstaltungen, Hilfe und bewusst ausgewählte Empfehlungen.
          </p>
          <div className="admin-card-toolbar">
            <button
              className="admin-button secondary"
              onClick={() => setLocalPlaceSelection({ mode: "create" })}
              type="button"
            >
              Ort anlegen
            </button>
          </div>
          <div className="admin-list">
            {data.localPlaces.length ? (
              data.localPlaces.map((place) => (
                <article className="admin-list-item" key={place.id}>
                  <div>
                    <small>
                      {localPlaceStatusLabel(place.status)} · {localPlaceCategoryLabel(place.category)}
                    </small>
                    <strong>{place.name}</strong>
                    <em>{getLocalPlaceSummary(place)}</em>
                    <p>
                      {place.rating ? `${place.rating.toFixed(1)} Bewertung · ` : ""}
                      {place.lat && place.lng ? "Koordinaten vorhanden" : "Koordinaten fehlen"}
                    </p>
                  </div>
                  <div className="admin-row-actions">
                    <button
                      onClick={() => setLocalPlaceSelection({ mode: "edit", id: place.id })}
                      type="button"
                    >
                      Bearbeiten
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="admin-drawer-message">Noch keine Vor-Ort-Datensätze vorhanden.</p>
            )}
          </div>
        </article>
      </section>

      <section className="admin-grid" id="erlebnisse" hidden={activeWorkspace !== "operations"}>
        <article className="admin-card admin-card-wide">
          <p className="admin-eyebrow">Erlebnisse</p>
          <h2>Bausteine der Auszeiten</h2>
          <p>
            Erlebnisbausteine verbinden Auszeit, Anbieter und Gastversprechen.
            Enthaltene Bausteine sollten vor der Freigabe bestätigt sein.
          </p>
          <div className="admin-card-toolbar">
            <button
              className="admin-button secondary"
              onClick={() => setExperienceSelection({ mode: "create" })}
              type="button"
            >
              Erlebnis anlegen
            </button>
          </div>
          <div className="admin-list">
            {data.experienceBlocks.length ? (
              data.experienceBlocks.map((experience) => (
                <article className="admin-list-item" key={experience.id}>
                  <div>
                    <small>
                      {experienceRoleLabel(experience.role)} · {experienceConfirmationLabel(experience.confirmation_status)}
                    </small>
                    <strong>{experience.title}</strong>
                    <em>
                      {getPackageName(data.packages, experience.package_id)} · {getProviderName(data.experienceProviders, experience.provider_id)}
                    </em>
                  </div>
                  <div className="admin-row-actions">
                    <button
                      onClick={() => setExperienceSelection({ mode: "edit", id: experience.id })}
                      type="button"
                    >
                      Bearbeiten
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="admin-drawer-message">Noch keine Erlebnisbausteine vorhanden.</p>
            )}
          </div>
        </article>
      </section>

      <section className="admin-grid" id="termine" hidden={activeWorkspace !== "operations"}>
        <article className="admin-card admin-card-wide">
          <p className="admin-eyebrow">Termine</p>
          <h2>Zeiträume und Verfügbarkeit</h2>
          <p>
            Diese Termine steuern, welche Auszeiten konkret angefragt und später
            verbindlich vorbereitet werden können.
          </p>
          <div className="admin-card-toolbar">
            <button
              className="admin-button secondary"
              onClick={() => setDateSelection({ mode: "create" })}
              type="button"
            >
              Termin anlegen
            </button>
          </div>
          <div className="admin-list">
            {data.packageDates.length ? (
              data.packageDates.map((date) => (
                <article className="admin-list-item" key={date.id}>
                  <div>
                    <small>
                      {packageDateStatusLabel(date.status)} · {getPackageDateRange(date)}
                    </small>
                    <strong>{date.label}</strong>
                    <em>
                      {getPackageName(data.packages, date.package_id)} · {date.capacity ?? "Kapazität offen"} Plätze
                    </em>
                  </div>
                  <div className="admin-row-actions">
                    <button
                      onClick={() => setDateSelection({ mode: "edit", id: date.id })}
                      type="button"
                    >
                      Bearbeiten
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="admin-drawer-message">Noch keine Termine in Supabase vorhanden.</p>
            )}
          </div>
        </article>
      </section>

      <section className="admin-grid" id="bestand" hidden={activeWorkspace !== "inventory"}>
        <article className="admin-card">
          <p className="admin-eyebrow">Auszeiten</p>
          <h2>Angebote im System</h2>
          <div className="admin-card-toolbar">
            <button
              className="admin-button secondary"
              onClick={() => setInventorySelection({ mode: "create", type: "package" })}
              type="button"
            >
              Auszeit anlegen
            </button>
          </div>
          <div className="admin-list">
            {data.packages.map((packageItem) => (
              <article className="admin-list-item" key={packageItem.id}>
                <div>
                  <strong>{packageItem.name || packageItem.id}</strong>
                  <em>
                    {packageItem.status || "ohne Status"} · {packageItem.location || "Ort offen"}
                  </em>
                </div>
                <div className="admin-row-actions">
                  <button
                    onClick={() => setInventorySelection({ mode: "edit", type: "package", id: packageItem.id })}
                    type="button"
                  >
                    Bearbeiten
                  </button>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="admin-card">
          <p className="admin-eyebrow">Objekte</p>
          <h2>Unterkünfte und Bestand</h2>
          <div className="admin-card-toolbar">
            <button
              className="admin-button secondary"
              onClick={() => setInventorySelection({ mode: "create", type: "property" })}
              type="button"
            >
              Unterkunft anlegen
            </button>
          </div>
          <div className="admin-list">
            {data.properties.map((property) => (
              <article className="admin-list-item" key={property.id}>
                <div>
                  <strong>{property.name || property.id}</strong>
                  <em>
                    {property.status || "ohne Status"} · {property.location || "Ort offen"}
                  </em>
                </div>
                <div className="admin-row-actions">
                  <button
                    onClick={() => setInventorySelection({ mode: "edit", type: "property", id: property.id })}
                    type="button"
                  >
                    Bearbeiten
                  </button>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-grid" id="agenturen" hidden={activeWorkspace !== "partners"}>
        <article className="admin-card admin-card-wide">
          <p className="admin-eyebrow">Agenturarbeit</p>
          <h2>Startpartner im Blick</h2>
          <p>
            Agenturen sind im MVP der schnelle Zugang zu Objekten, freien
            Terminen und Nutzungsfreigaben. Diese Übersicht zeigt, wo operativ
            nachgefasst werden muss.
          </p>
          <div className="admin-metrics">
            <article>
              <span>{activeAgencies.length}</span>
              <strong>Aktiv</strong>
              <p>Startpartner mit laufender Abstimmung</p>
            </article>
            <article>
              <span>{agenciesWithoutDates.length}</span>
              <strong>Termine offen</strong>
              <p>Verfügbarkeitsnotiz fehlt</p>
            </article>
            <article>
              <span>{agenciesWithProperties.length}</span>
              <strong>Mit Objekten</strong>
              <p>Agenturen mit verbundenem Bestand</p>
            </article>
            <article>
              <span>{agencyFollowUpsDue.length}</span>
              <strong>Heute fällig</strong>
              <p>Wiedervorlagen prüfen</p>
            </article>
          </div>
          {agencyFollowUpsDue.length ? (
            <div className="admin-linked-list">
              {agencyFollowUpsDue.map((agency) => (
                <article key={agency.id}>
                  <div>
                    <strong>{agency.name}</strong>
                    <span>
                      {getPayloadText(agency.payload ?? {}, ["nextFollowUpAt", "next_follow_up_at"])}
                      {agency.contact_name ? ` · ${agency.contact_name}` : ""}
                    </span>
                  </div>
                  <button onClick={() => editAgency(agency)} type="button">
                    Öffnen
                  </button>
                </article>
              ))}
            </div>
          ) : null}
        </article>

        <article className="admin-card">
          <p className="admin-eyebrow">Agenturen</p>
          <h2>Phase-1-Partner pflegen</h2>
          <p>
            Agenturen liefern in der Startphase Objektzugang, freie Termine und
            operative Hinweise. Sie bleiben intern und werden nicht als
            Gästeversprechen kommuniziert.
          </p>
          <div className="admin-form-grid">
            <label>
              Agenturname
              <input
                onChange={(event) => setAgencyDraft((current) => ({ ...current, name: event.target.value }))}
                value={agencyDraft.name}
              />
            </label>
            <label>
              Ansprechpartner
              <input
                onChange={(event) => setAgencyDraft((current) => ({ ...current, contact_name: event.target.value }))}
                value={agencyDraft.contact_name}
              />
            </label>
            <label>
              E-Mail
              <input
                onChange={(event) => setAgencyDraft((current) => ({ ...current, email: event.target.value }))}
                type="email"
                value={agencyDraft.email}
              />
            </label>
            <label>
              Telefon
              <input
                onChange={(event) => setAgencyDraft((current) => ({ ...current, phone: event.target.value }))}
                type="tel"
                value={agencyDraft.phone}
              />
            </label>
            <label>
              Ort
              <input
                onChange={(event) => setAgencyDraft((current) => ({ ...current, location: event.target.value }))}
                value={agencyDraft.location}
              />
            </label>
            <label>
              Status
              <select
                onChange={(event) => setAgencyDraft((current) => ({ ...current, status: event.target.value }))}
                value={agencyDraft.status}
              >
                <option value="lead">Kontakt prüfen</option>
                <option value="active">Aktiv</option>
                <option value="paused">Pausiert</option>
              </select>
            </label>
            <label>
              Rückmeldung in Tagen
              <input
                inputMode="numeric"
                onChange={(event) => setAgencyDraft((current) => ({ ...current, response_due_days: event.target.value }))}
                value={agencyDraft.response_due_days}
              />
            </label>
            <label>
              Wiedervorlage
              <input
                onChange={(event) => setAgencyDraft((current) => ({ ...current, next_follow_up_at: event.target.value }))}
                type="date"
                value={agencyDraft.next_follow_up_at}
              />
            </label>
            <label className="admin-form-grid-full">
              Freie Termine / Verfügbarkeitsnotiz
              <textarea
                onChange={(event) => setAgencyDraft((current) => ({ ...current, available_dates_note: event.target.value }))}
                placeholder="Welche Termine wurden genannt, was muss nachgefragt werden?"
                rows={3}
                value={agencyDraft.available_dates_note}
              />
            </label>
            <label className="admin-form-grid-full">
              Interne Notiz
              <textarea
                onChange={(event) => setAgencyDraft((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Kooperationsstand, Qualität, offene Punkte."
                rows={3}
                value={agencyDraft.notes}
              />
            </label>
          </div>
          <div className="admin-option-grid">
            {data.properties.map((property) => (
              <label className="admin-checkbox-label" key={property.id}>
                <input
                  checked={agencyDraft.managed_property_ids.includes(property.id)}
                  onChange={(event) => {
                    setAgencyDraft((current) => ({
                      ...current,
                      managed_property_ids: event.target.checked
                        ? [...current.managed_property_ids, property.id]
                        : current.managed_property_ids.filter((id) => id !== property.id),
                    }));
                  }}
                  type="checkbox"
                />
                {property.name || property.id}
              </label>
            ))}
          </div>
          <button
            className="admin-button"
            disabled={Boolean(pendingAction?.startsWith("agency-save"))}
            onClick={saveAgency}
            type="button"
          >
            Agentur speichern
          </button>
          {agencyMessage ? <p className="admin-drawer-message">{agencyMessage}</p> : null}
        </article>

        <article className="admin-card">
          <p className="admin-eyebrow">Agenturbestand</p>
          <h2>{data.agencies.length} Kontakte</h2>
          <p>
            Verbundene Objekte zeigen, welche Unterkunft aktuell über eine
            externe Agentur in den Morrow-Prozess kommt.
          </p>
          <div className="admin-list">
            {data.agencies.length ? (
              data.agencies.map((agency) => {
                const linkedPropertyNames = agency.managed_property_ids
                  .map((propertyId) => getPropertyName(data.properties, propertyId))
                  .join(" · ");
                const nextFollowUpAt = getPayloadText(agency.payload ?? {}, ["nextFollowUpAt", "next_follow_up_at"]);
                return (
                  <article className="admin-list-item" key={agency.id}>
                    <div>
                      <small>
                        {agencyStatusLabel(agency.status)} · {agency.location || "Ort offen"}
                      </small>
                      <strong>{agency.name}</strong>
                      <em>
                        {agency.contact_name || "Ansprechpartner offen"}
                        {agency.response_due_days ? ` · Rückmeldung ${agency.response_due_days} Tage` : ""}
                      </em>
                      <p>{linkedPropertyNames || "Noch kein Objekt verbunden."}</p>
                      {nextFollowUpAt ? <p>Wiedervorlage: {nextFollowUpAt}</p> : null}
                      {agency.available_dates_note ? <p>{agency.available_dates_note}</p> : null}
                    </div>
                    <div className="admin-row-actions">
                      <button onClick={() => editAgency(agency)} type="button">
                        Bearbeiten
                      </button>
                      {agency.email ? <a href={`mailto:${agency.email}`}>E-Mail</a> : null}
                      {agency.phone ? <a href={`tel:${agency.phone.replace(/\s/g, "")}`}>Telefon</a> : null}
                      {agency.status === "paused" ? (
                        <button
                          disabled={pendingAction === `agency-status-${agency.id}`}
                          onClick={() => updateAgencyStatus(agency, "active")}
                          type="button"
                        >
                          Aktivieren
                        </button>
                      ) : (
                        <button
                          disabled={pendingAction === `agency-status-${agency.id}`}
                          onClick={() => updateAgencyStatus(agency, "paused")}
                          type="button"
                        >
                          Pausieren
                        </button>
                      )}
                      {!agency.managed_property_ids.length ? (
                        <button
                          className="is-danger"
                          disabled={pendingAction === `agency-delete-${agency.id}`}
                          onClick={() => deleteAgency(agency)}
                          type="button"
                        >
                          Löschen
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="admin-drawer-message">Noch keine Agenturen angelegt oder Migration noch nicht live.</p>
            )}
          </div>
        </article>
      </section>

      <section className="admin-grid" id="erlebnisanbieter" hidden={activeWorkspace !== "partners"}>
        <article className="admin-card">
          <p className="admin-eyebrow">Erlebnisanbieter</p>
          <h2>Partnerprofile pflegen</h2>
          <p>
            Anbieterprofile sind die Grundlage für Erlebnisbausteine, Konditionen,
            Verfügbarkeit und spätere Partnerkommunikation.
          </p>
          <div className="admin-form-grid">
            <label>
              Anbietername
              <input
                onChange={(event) => setProviderDraft((current) => ({ ...current, name: event.target.value }))}
                value={providerDraft.name}
              />
            </label>
            <label>
              Status
              <select
                onChange={(event) => setProviderDraft((current) => ({ ...current, status: event.target.value }))}
                value={providerDraft.status}
              >
                <option value="lead">Kontakt prüfen</option>
                <option value="in-review">In Prüfung</option>
                <option value="partner">Partner</option>
                <option value="paused">Pausiert</option>
              </select>
            </label>
            <label>
              Ansprechpartner
              <input
                onChange={(event) => setProviderDraft((current) => ({ ...current, contact_name: event.target.value }))}
                value={providerDraft.contact_name}
              />
            </label>
            <label>
              Geeignet für
              <select
                onChange={(event) => setProviderDraft((current) => ({ ...current, audience_fit: event.target.value }))}
                value={providerDraft.audience_fit}
              >
                <option value="both">Familien und Paare</option>
                <option value="families">Familien</option>
                <option value="couples">Paare</option>
              </select>
            </label>
            <label>
              E-Mail
              <input
                onChange={(event) => setProviderDraft((current) => ({ ...current, email: event.target.value }))}
                type="email"
                value={providerDraft.email}
              />
            </label>
            <label>
              Telefon
              <input
                onChange={(event) => setProviderDraft((current) => ({ ...current, phone: event.target.value }))}
                type="tel"
                value={providerDraft.phone}
              />
            </label>
            <label>
              Ort
              <input
                onChange={(event) => setProviderDraft((current) => ({ ...current, location: event.target.value }))}
                value={providerDraft.location}
              />
            </label>
            <label>
              Kategorie
              <input
                onChange={(event) => setProviderDraft((current) => ({ ...current, category: event.target.value }))}
                placeholder="z. B. Yoga, Wattwandern, Reiten"
                value={providerDraft.category}
              />
            </label>
            <label className="admin-form-grid-full">
              Website
              <input
                onChange={(event) => setProviderDraft((current) => ({ ...current, website: event.target.value }))}
                placeholder="https://..."
                value={providerDraft.website}
              />
            </label>
            <label className="admin-form-grid-full">
              Konditionen / Preislogik
              <textarea
                onChange={(event) => setProviderDraft((current) => ({ ...current, pricing_note: event.target.value }))}
                placeholder="Einkaufspreise, Inklusivlogik, Storno oder Mindestteilnehmer."
                rows={3}
                value={providerDraft.pricing_note}
              />
            </label>
            <label className="admin-form-grid-full">
              Verfügbarkeit / Kapazität
              <textarea
                onChange={(event) => setProviderDraft((current) => ({ ...current, availability_note: event.target.value }))}
                placeholder="Wann möglich, welche Gruppen, wetterabhängig?"
                rows={3}
                value={providerDraft.availability_note}
              />
            </label>
            <label className="admin-form-grid-full">
              Kooperationsstand
              <textarea
                onChange={(event) => setProviderDraft((current) => ({ ...current, collaboration_note: event.target.value }))}
                placeholder="Was wurde besprochen, was fehlt, nächster Schritt?"
                rows={3}
                value={providerDraft.collaboration_note}
              />
            </label>
            <label className="admin-form-grid-full">
              Interne Notiz
              <textarea
                onChange={(event) => setProviderDraft((current) => ({ ...current, notes: event.target.value }))}
                rows={3}
                value={providerDraft.notes}
              />
            </label>
          </div>
          <button
            className="admin-button"
            disabled={Boolean(pendingAction?.startsWith("provider-save"))}
            onClick={saveProvider}
            type="button"
          >
            Erlebnisanbieter speichern
          </button>
          {providerMessage ? <p className="admin-drawer-message">{providerMessage}</p> : null}
        </article>

        <article className="admin-card">
          <p className="admin-eyebrow">Anbieterbestand</p>
          <h2>{data.experienceProviders.length} Kontakte</h2>
          <p>
            Verknüpfte Erlebnisbausteine zeigen, welche Anbieter bereits in
            Auszeiten eingeplant sind.
          </p>
          <div className="admin-list">
            {data.experienceProviders.length ? (
              data.experienceProviders.map((provider) => {
                const linkedExperiences = data.experienceBlocks.filter((experience) => experience.provider_id === provider.id);
                const contactName = provider.contact_name || getPayloadText(provider.payload ?? {}, ["contactName", "contact_name"]);
                const audienceFit = provider.audience_fit || getPayloadText(provider.payload ?? {}, ["audienceFit", "audience_fit"]) || "Zielgruppe offen";
                const availabilityNote = provider.availability_note || getPayloadText(provider.payload ?? {}, ["availabilityNote", "availability_note"]);

                return (
                  <article className="admin-list-item" key={provider.id}>
                    <div>
                      <small>
                        {providerStatusLabel(provider.status)} · {provider.category || "Kategorie offen"}
                      </small>
                      <strong>{provider.name}</strong>
                      <em>
                        {contactName || "Ansprechpartner offen"} · {provider.location || "Ort offen"} · {audienceFit}
                      </em>
                      <p>
                        {linkedExperiences.length
                          ? `${linkedExperiences.length} Erlebnisbaustein${linkedExperiences.length === 1 ? "" : "e"} verbunden`
                          : "Noch kein Erlebnisbaustein verbunden."}
                      </p>
                      {availabilityNote ? <p>{availabilityNote}</p> : null}
                    </div>
                    <div className="admin-row-actions">
                      <button onClick={() => editProvider(provider)} type="button">
                        Bearbeiten
                      </button>
                      {provider.email ? <a href={`mailto:${provider.email}`}>E-Mail</a> : null}
                      {provider.phone ? <a href={`tel:${provider.phone.replace(/\s/g, "")}`}>Telefon</a> : null}
                      {provider.status === "paused" ? (
                        <button
                          disabled={pendingAction === `provider-status-${provider.id}`}
                          onClick={() => updateProviderStatus(provider, "partner")}
                          type="button"
                        >
                          Reaktivieren
                        </button>
                      ) : (
                        <button
                          disabled={pendingAction === `provider-status-${provider.id}`}
                          onClick={() => updateProviderStatus(provider, "paused")}
                          type="button"
                        >
                          Pausieren
                        </button>
                      )}
                      {!linkedExperiences.length ? (
                        <button
                          className="is-danger"
                          disabled={pendingAction === `provider-delete-${provider.id}`}
                          onClick={() => deleteProvider(provider)}
                          type="button"
                        >
                          Löschen
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="admin-drawer-message">Noch keine Erlebnisanbieter angelegt oder Migration noch nicht live.</p>
            )}
          </div>
        </article>
      </section>

      <section className="admin-grid" id="eigentuemer" hidden={activeWorkspace !== "owners"}>
        <article className="admin-card">
          <p className="admin-eyebrow">Eigentümer</p>
          <h2>Zugänge freischalten</h2>
          <p>
            Eigentümer sehen nur Objekte und Buchungen, die hier ausdrücklich
            verbunden wurden.
          </p>
          <div className="admin-form-grid">
            <label>
              E-Mail
              <input
                onChange={(event) => setOwnerProfileDraft((current) => ({ ...current, email: event.target.value }))}
                type="email"
                value={ownerProfileDraft.email}
              />
            </label>
            <label>
              Name
              <input
                onChange={(event) => setOwnerProfileDraft((current) => ({ ...current, display_name: event.target.value }))}
                value={ownerProfileDraft.display_name}
              />
            </label>
            <label>
              Telefon
              <input
                onChange={(event) => setOwnerProfileDraft((current) => ({ ...current, phone: event.target.value }))}
                type="tel"
                value={ownerProfileDraft.phone}
              />
            </label>
            <label>
              Status
              <select
                onChange={(event) => setOwnerProfileDraft((current) => ({ ...current, status: event.target.value }))}
                value={ownerProfileDraft.status}
              >
                <option value="active">Aktiv</option>
                <option value="invited">Eingeladen</option>
                <option value="paused">Pausiert</option>
                <option value="archived">Archiviert</option>
              </select>
            </label>
          </div>
          <button
            className="admin-button"
            disabled={pendingAction === "owner-profile-create"}
            onClick={createOwnerProfile}
            type="button"
          >
            Eigentümer speichern
          </button>
          {ownerMessage ? <p className="admin-drawer-message">{ownerMessage}</p> : null}
          <div className="admin-list admin-list-compact">
            {data.ownerProfiles.length ? (
              data.ownerProfiles.map((owner) => (
                <article className="admin-list-item" key={owner.id}>
                  <div>
                    <small>{owner.status}</small>
                    <strong>{owner.display_name || owner.email}</strong>
                    <em>{owner.email}{owner.phone ? ` · ${owner.phone}` : ""}</em>
                  </div>
                  <div className="admin-row-actions">
                    <button onClick={() => editOwnerProfile(owner)} type="button">
                      Bearbeiten
                    </button>
                    {owner.status === "active" ? (
                      <button
                        className="is-danger"
                        disabled={pendingAction === `owner-profile-status-${owner.id}`}
                        onClick={() => updateOwnerProfileStatus(owner, "paused")}
                        type="button"
                      >
                        Pausieren
                      </button>
                    ) : (
                      <button
                        disabled={pendingAction === `owner-profile-status-${owner.id}`}
                        onClick={() => updateOwnerProfileStatus(owner, "active")}
                        type="button"
                      >
                        Aktivieren
                      </button>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <p className="admin-drawer-message">Noch keine Eigentümerprofile angelegt.</p>
            )}
          </div>
        </article>

        <article className="admin-card">
          <p className="admin-eyebrow">Objektzugriff</p>
          <h2>Unterkunft verbinden</h2>
          <div className="admin-form-grid">
            <label>
              Eigentümer
              <select
                onChange={(event) => setOwnerAccessDraft((current) => ({ ...current, owner_profile_id: event.target.value }))}
                value={ownerAccessDraft.owner_profile_id}
              >
                <option value="">Auswählen</option>
                {data.ownerProfiles.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.display_name || owner.email}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Unterkunft
              <select
                onChange={(event) => setOwnerAccessDraft((current) => ({ ...current, property_id: event.target.value }))}
                value={ownerAccessDraft.property_id}
              >
                <option value="">Auswählen</option>
                {data.properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name || property.id}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Rolle
              <select
                onChange={(event) => setOwnerAccessDraft((current) => ({ ...current, role: event.target.value }))}
                value={ownerAccessDraft.role}
              >
                <option value="owner">Eigentümer</option>
                <option value="co_owner">Miteigentümer</option>
                <option value="viewer">Betrachter</option>
              </select>
            </label>
            <label className="admin-checkbox-label">
              <input
                checked={ownerAccessDraft.can_view_financials}
                onChange={(event) => setOwnerAccessDraft((current) => ({ ...current, can_view_financials: event.target.checked }))}
                type="checkbox"
              />
              Finanzen sichtbar
            </label>
            <label className="admin-checkbox-label">
              <input
                checked={ownerAccessDraft.can_view_operations}
                onChange={(event) => setOwnerAccessDraft((current) => ({ ...current, can_view_operations: event.target.checked }))}
                type="checkbox"
              />
              Operations sichtbar
            </label>
          </div>
          <button
            className="admin-button"
            disabled={pendingAction === "owner-access-create"}
            onClick={createOwnerAccess}
            type="button"
          >
            Zugriff speichern
          </button>
        </article>

        <article className="admin-card">
          <p className="admin-eyebrow">Dokumente</p>
          <h2>Für Eigentümer freigeben</h2>
          <p>
            Vereinbarungen, Abrechnungen oder Reports werden pro Unterkunft
            gepflegt und erscheinen nur bei freigeschaltetem Objektzugriff.
          </p>
          <div className="admin-form-grid">
            <label>
              Unterkunft
              <select
                onChange={(event) => setOwnerDocumentDraft((current) => ({ ...current, property_id: event.target.value }))}
                value={ownerDocumentDraft.property_id}
              >
                <option value="">Auswählen</option>
                {data.properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name || property.id}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Titel
              <input
                onChange={(event) => setOwnerDocumentDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="Monatsabrechnung August"
                value={ownerDocumentDraft.title}
              />
            </label>
            <label>
              Typ
              <select
                onChange={(event) => setOwnerDocumentDraft((current) => ({ ...current, document_type: event.target.value }))}
                value={ownerDocumentDraft.document_type}
              >
                {ownerDocumentTypes.map((type) => (
                  <option key={type} value={type}>
                    {ownerDocumentTypeLabels[type]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                onChange={(event) => setOwnerDocumentDraft((current) => ({ ...current, status: event.target.value }))}
                value={ownerDocumentDraft.status}
              >
                {ownerDocumentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Zeitraum
              <input
                onChange={(event) => setOwnerDocumentDraft((current) => ({ ...current, period_label: event.target.value }))}
                placeholder="August 2026"
                value={ownerDocumentDraft.period_label}
              />
            </label>
            <label>
              Dokument-Link
              <input
                onChange={(event) => setOwnerDocumentDraft((current) => ({ ...current, url: event.target.value }))}
                placeholder="https://..."
                type="url"
                value={ownerDocumentDraft.url}
              />
            </label>
          </div>
          <button
            className="admin-button"
            disabled={pendingAction === "owner-document-create"}
            onClick={createOwnerDocument}
            type="button"
          >
            Dokument speichern
          </button>
        </article>

        <article className="admin-card admin-card-wide">
          <p className="admin-eyebrow">Abrechnung</p>
          <h2>Monatsabrechnung vorbereiten</h2>
          <p>
            Hier pflegen wir den nachvollziehbaren Monatsstatus pro Unterkunft.
            Sichtbar oder ausgezahlt erscheint er im Eigentümerbereich, Entwurf
            bleibt intern.
          </p>
          <div className="admin-form-grid">
            <label>
              Unterkunft
              <select
                onChange={(event) => setOwnerStatementDraft((current) => ({ ...current, property_id: event.target.value }))}
                value={ownerStatementDraft.property_id}
              >
                <option value="">Auswählen</option>
                {data.properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name || property.id}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Zeitraum
              <input
                onChange={(event) => setOwnerStatementDraft((current) => ({ ...current, period_label: event.target.value }))}
                placeholder="August 2026"
                value={ownerStatementDraft.period_label}
              />
            </label>
            <label>
              Von
              <input
                onChange={(event) => setOwnerStatementDraft((current) => ({ ...current, period_start: event.target.value }))}
                type="date"
                value={ownerStatementDraft.period_start}
              />
            </label>
            <label>
              Bis
              <input
                onChange={(event) => setOwnerStatementDraft((current) => ({ ...current, period_end: event.target.value }))}
                type="date"
                value={ownerStatementDraft.period_end}
              />
            </label>
            <label>
              Status
              <select
                onChange={(event) => setOwnerStatementDraft((current) => ({ ...current, status: event.target.value }))}
                value={ownerStatementDraft.status}
              >
                {ownerStatementStatuses.map((status) => (
                  <option key={status} value={status}>
                    {ownerStatementStatusLabels[status]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Umsatz brutto
              <input
                inputMode="decimal"
                onChange={(event) => setOwnerStatementDraft((current) => ({ ...current, gross_revenue: event.target.value }))}
                placeholder="1990,00"
                value={ownerStatementDraft.gross_revenue}
              />
            </label>
            <label>
              Morrow Anteil
              <input
                inputMode="decimal"
                onChange={(event) => setOwnerStatementDraft((current) => ({ ...current, morrow_fee: event.target.value }))}
                placeholder="298,50"
                value={ownerStatementDraft.morrow_fee}
              />
            </label>
            <label>
              Weitere Kosten
              <input
                inputMode="decimal"
                onChange={(event) => setOwnerStatementDraft((current) => ({ ...current, other_costs: event.target.value }))}
                placeholder="120,00"
                value={ownerStatementDraft.other_costs}
              />
            </label>
            <label>
              Auszahlung
              <input
                inputMode="decimal"
                onChange={(event) => setOwnerStatementDraft((current) => ({ ...current, owner_payout: event.target.value }))}
                placeholder="1571,50"
                value={ownerStatementDraft.owner_payout}
              />
            </label>
            <label>
              Ausgezahlt am
              <input
                onChange={(event) => setOwnerStatementDraft((current) => ({ ...current, paid_at: event.target.value }))}
                type="date"
                value={ownerStatementDraft.paid_at}
              />
            </label>
            <label className="admin-form-grid-full">
              Dokument-Link optional
              <input
                onChange={(event) => setOwnerStatementDraft((current) => ({ ...current, document_url: event.target.value }))}
                placeholder="https://..."
                type="url"
                value={ownerStatementDraft.document_url}
              />
            </label>
          </div>
          <button
            className="admin-button"
            disabled={pendingAction === "owner-statement-create"}
            onClick={createOwnerStatement}
            type="button"
          >
            Abrechnung speichern
          </button>
        </article>

        <article className="admin-card admin-card-wide">
          <p className="admin-eyebrow">Operations</p>
          <h2>Objektarbeit sichtbar machen</h2>
          <p>
            Reinigung, Kontrolle, Mängel oder Übergaben werden pro Unterkunft
            geführt. Nur freigegebene Einträge erscheinen im Eigentümerbereich.
          </p>
          <div className="admin-form-grid">
            <label>
              Unterkunft
              <select
                onChange={(event) => setOwnerOperationDraft((current) => ({ ...current, property_id: event.target.value }))}
                value={ownerOperationDraft.property_id}
              >
                <option value="">Auswählen</option>
                {data.properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name || property.id}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Titel
              <input
                onChange={(event) => setOwnerOperationDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="Reinigung nach Aufenthalt geplant"
                value={ownerOperationDraft.title}
              />
            </label>
            <label>
              Typ
              <select
                onChange={(event) => setOwnerOperationDraft((current) => ({ ...current, operation_type: event.target.value }))}
                value={ownerOperationDraft.operation_type}
              >
                {ownerOperationTypes.map((type) => (
                  <option key={type} value={type}>
                    {ownerOperationTypeLabels[type]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                onChange={(event) => setOwnerOperationDraft((current) => ({ ...current, status: event.target.value }))}
                value={ownerOperationDraft.status}
              >
                {ownerOperationStatuses.map((status) => (
                  <option key={status} value={status}>
                    {ownerOperationStatusLabels[status]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sichtbarkeit
              <select
                onChange={(event) => setOwnerOperationDraft((current) => ({ ...current, visibility: event.target.value }))}
                value={ownerOperationDraft.visibility}
              >
                {ownerOperationVisibilities.map((visibility) => (
                  <option key={visibility} value={visibility}>
                    {ownerOperationVisibilityLabels[visibility]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Geplant am
              <input
                onChange={(event) => setOwnerOperationDraft((current) => ({ ...current, scheduled_for: event.target.value }))}
                type="date"
                value={ownerOperationDraft.scheduled_for}
              />
            </label>
            <label>
              Erledigt am
              <input
                onChange={(event) => setOwnerOperationDraft((current) => ({ ...current, completed_at: event.target.value }))}
                type="date"
                value={ownerOperationDraft.completed_at}
              />
            </label>
            <label className="admin-form-grid-full">
              Notiz
              <textarea
                onChange={(event) => setOwnerOperationDraft((current) => ({ ...current, note: event.target.value }))}
                placeholder="Kurz erklären, was passiert ist oder als Nächstes passiert."
                value={ownerOperationDraft.note}
              />
            </label>
          </div>
          <button
            className="admin-button"
            disabled={pendingAction === "owner-operation-create"}
            onClick={createOwnerOperation}
            type="button"
          >
            Operation speichern
          </button>
        </article>

        <article className="admin-card admin-card-wide">
          <p className="admin-eyebrow">Freigaben</p>
          <h2>Aktive Eigentümerzugriffe</h2>
          <div className="admin-list">
            {data.ownerAccess.length ? (
              data.ownerAccess.map((access) => {
                const owner = data.ownerProfiles.find((profile) => profile.id === access.owner_profile_id);
                return (
                  <article className="admin-list-item" key={access.id}>
                    <div>
                      <small>{access.role} · {access.can_view_financials ? "Finanzen" : "ohne Finanzen"}</small>
                      <strong>{owner?.display_name || owner?.email || access.owner_profile_id}</strong>
                      <em>{getPropertyName(data.properties, access.property_id)}</em>
                    </div>
                    <div className="admin-row-actions">
                      <button onClick={() => editOwnerAccess(access)} type="button">
                        Bearbeiten
                      </button>
                      <button
                        className="is-danger"
                        disabled={pendingAction === `owner-access-delete-${access.id}`}
                        onClick={() => deleteOwnerAccess(access)}
                        type="button"
                      >
                        Entfernen
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="admin-drawer-message">
                Noch keine Eigentümerzugriffe vorhanden oder Owner-Migration noch nicht live angewendet.
              </p>
            )}
          </div>
        </article>

        <article className="admin-card admin-card-wide">
          <p className="admin-eyebrow">Eigentümerdokumente</p>
          <h2>Freigegebene und vorbereitete Dokumente</h2>
          <div className="admin-list">
            {data.ownerDocuments.length ? (
              data.ownerDocuments.map((document) => (
                <article className="admin-list-item" key={document.id}>
                  <div>
                    <small>
                      {ownerDocumentTypeLabels[document.document_type] || document.document_type}
                      {" · "}
                      {document.status}
                      {document.period_label ? ` · ${document.period_label}` : ""}
                    </small>
                    <strong>{document.title}</strong>
                    <em>{getPropertyName(data.properties, document.property_id)}</em>
                  </div>
                  <div className="admin-row-actions">
                    <a href={document.url} target="_blank" rel="noreferrer">
                      Öffnen
                    </a>
                    {document.status === "visible" ? (
                      <button
                        className="is-danger"
                        disabled={pendingAction === `owner-document-status-${document.id}`}
                        onClick={() => updateOwnerDocumentStatus(document, "archived")}
                        type="button"
                      >
                        Archivieren
                      </button>
                    ) : (
                      <button
                        disabled={pendingAction === `owner-document-status-${document.id}`}
                        onClick={() => updateOwnerDocumentStatus(document, "visible")}
                        type="button"
                      >
                        Sichtbar machen
                      </button>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <p className="admin-drawer-message">
                Noch keine Eigentümerdokumente vorhanden oder Owner-Dokumente-Migration noch nicht live angewendet.
              </p>
            )}
          </div>
        </article>

        <article className="admin-card admin-card-wide">
          <p className="admin-eyebrow">Eigentümerabrechnungen</p>
          <h2>Entwürfe, Sichtbarkeit und Auszahlung</h2>
          <div className="admin-list">
            {data.ownerStatements.length ? (
              data.ownerStatements.map((statement) => (
                <article className="admin-list-item" key={statement.id}>
                  <div>
                    <small>
                      {ownerStatementStatusLabels[statement.status] || statement.status}
                      {" · "}
                      {statement.period_label}
                      {statement.paid_at ? ` · bezahlt ${formatShortDate(statement.paid_at)}` : ""}
                    </small>
                    <strong>{formatCurrency(statement.owner_payout)} Auszahlung</strong>
                    <em>
                      {getPropertyName(data.properties, statement.property_id)}
                      {" · Umsatz "}
                      {formatCurrency(statement.gross_revenue)}
                    </em>
                  </div>
                  <div className="admin-row-actions">
                    {statement.document_url ? (
                      <a href={statement.document_url} target="_blank" rel="noreferrer">
                        Dokument
                      </a>
                    ) : null}
                    {ownerStatementStatuses
                      .filter((status) => status !== statement.status)
                      .map((status) => (
                        <button
                          className={status === "archived" ? "is-danger" : undefined}
                          disabled={pendingAction === `owner-statement-status-${statement.id}`}
                          key={status}
                          onClick={() => updateOwnerStatementStatus(statement, status)}
                          type="button"
                        >
                          {ownerStatementStatusLabels[status]}
                        </button>
                      ))}
                  </div>
                </article>
              ))
            ) : (
              <p className="admin-drawer-message">
                Noch keine Eigentümerabrechnungen vorhanden oder Owner-Abrechnungs-Migration noch nicht live angewendet.
              </p>
            )}
          </div>
        </article>

        <article className="admin-card admin-card-wide">
          <p className="admin-eyebrow">Operationsverlauf</p>
          <h2>Reinigung, Kontrolle und Mängel</h2>
          <div className="admin-list">
            {data.ownerOperations.length ? (
              data.ownerOperations.map((operation) => (
                <article className="admin-list-item" key={operation.id}>
                  <div>
                    <small>
                      {ownerOperationTypeLabels[operation.operation_type] || operation.operation_type}
                      {" · "}
                      {ownerOperationStatusLabels[operation.status] || operation.status}
                      {" · "}
                      {ownerOperationVisibilityLabels[operation.visibility] || operation.visibility}
                      {operation.scheduled_for ? ` · ${formatShortDate(operation.scheduled_for)}` : ""}
                    </small>
                    <strong>{operation.title}</strong>
                    <em>
                      {getPropertyName(data.properties, operation.property_id)}
                      {operation.note ? ` · ${operation.note}` : ""}
                    </em>
                  </div>
                  <div className="admin-row-actions">
                    {ownerOperationStatuses
                      .filter((status) => status !== operation.status)
                      .map((status) => (
                        <button
                          className={status === "archived" ? "is-danger" : undefined}
                          disabled={pendingAction === `owner-operation-status-${operation.id}`}
                          key={status}
                          onClick={() => updateOwnerOperationStatus(operation, status)}
                          type="button"
                        >
                          {ownerOperationStatusLabels[status]}
                        </button>
                      ))}
                  </div>
                </article>
              ))
            ) : (
              <p className="admin-drawer-message">
                Noch keine Operationsdatensätze vorhanden oder Owner-Operations-Migration noch nicht live angewendet.
              </p>
            )}
          </div>
        </article>
      </section>
      <AdminDetailDrawer
        auditLogs={drawerAuditLogs}
        booking={selectedBooking}
        communicationEvents={communicationEvents}
        canSendEmail={Boolean(selection && selectedDrawerEmail)}
        isLoading={isDrawerLoading}
        bookingOperationsDraft={bookingOperationsDraft}
        message={drawerMessage}
        note={drawerNote}
        lead={selectedLead}
        leadDetailsDraft={leadDetailsDraft}
        leadDetailsPending={pendingAction === `lead-${selectedLead?.id}-details`}
        onClose={() => setSelection(null)}
        onBookingOperationsChange={(key, value) => setBookingOperationsDraft((current) => ({ ...current, [key]: value }))}
        onLeadDetailsChange={(key, value) => setLeadDetailsDraft((current) => ({ ...current, [key]: value }))}
        onOutboundChange={(key, value) => setOutboundDraft((current) => ({ ...current, [key]: value }))}
        onNoteChange={setDrawerNote}
        onPaymentChange={(key, value) => setPaymentDraft((current) => ({ ...current, [key]: value }))}
        onSaveBookingOperations={saveBookingOperations}
        onSaveLeadDetails={() => selectedLead ? void saveLeadDetails(selectedLead) : undefined}
        onSaveNote={saveDrawerNote}
        onSavePayment={savePaymentInfo}
        onSendEmail={sendDrawerEmail}
        outboundDraft={outboundDraft}
        packages={data.packages}
        paymentDraft={paymentDraft}
        bookingOperationsPending={pendingAction === `booking-operations-${selectedBooking?.id}`}
        paymentPending={pendingAction === `booking-payment-${selectedBooking?.id}`}
        pending={Boolean(pendingAction?.startsWith("drawer-note"))}
        sendPending={Boolean(pendingAction?.startsWith("drawer-email"))}
        support={selectedSupport}
      />
      <AdminCustomerDrawer
        auditLogs={customerAuditLogs}
        communicationEvents={customerCommunicationEvents}
        customer={selectedCustomer}
        noteDraft={customerNoteDraft}
        notePending={pendingAction === `customer-note-${selectedCustomer?.id}`}
        isLoading={isCustomerDrawerLoading}
        message={customerDrawerMessage}
        onClose={() => setSelectedCustomerId(null)}
        onNoteChange={setCustomerNoteDraft}
        onOpenBooking={(bookingId) => {
          setSelectedCustomerId(null);
          setSelection({ type: "booking", id: bookingId });
        }}
        onOpenLead={(leadId) => {
          setSelectedCustomerId(null);
          setSelection({ type: "lead", id: leadId });
        }}
        onSaveNote={saveCustomerNote}
      />
      <AdminInventoryDrawer
        draft={inventoryDraft}
        inventoryType={inventorySelection?.type ?? null}
        isCreating={inventorySelection?.mode === "create"}
        message={inventoryMessage}
        onChange={(key, value) => setInventoryDraft((current) => ({ ...current, [key]: value }))}
        onClose={() => setInventorySelection(null)}
        onSave={saveInventory}
        packages={data.packages}
        pending={Boolean(pendingAction?.startsWith("inventory"))}
        properties={data.properties}
        property={selectedProperty}
        packageItem={selectedPackage}
      />
      <AdminExperienceDrawer
        draft={experienceDraft}
        experience={selectedExperience}
        isCreating={experienceSelection?.mode === "create"}
        message={experienceMessage}
        onChange={(key, value) => setExperienceDraft((current) => ({ ...current, [key]: value }))}
        onClose={() => setExperienceSelection(null)}
        onSave={saveExperience}
        packages={data.packages}
        pending={Boolean(pendingAction?.startsWith("experience"))}
        providers={data.experienceProviders}
      />
      <AdminLocalPlaceDrawer
        draft={localPlaceDraft}
        isCreating={localPlaceSelection?.mode === "create"}
        message={localPlaceMessage}
        onChange={(key, value) => setLocalPlaceDraft((current) => ({ ...current, [key]: value }))}
        onClose={() => setLocalPlaceSelection(null)}
        onSave={saveLocalPlace}
        pending={Boolean(pendingAction?.startsWith("local-place"))}
        place={selectedLocalPlace}
      />
      <AdminPackageDateDrawer
        date={selectedDate}
        draft={dateDraft}
        isCreating={dateSelection?.mode === "create"}
        message={dateMessage}
        onChange={(key, value) => setDateDraft((current) => ({ ...current, [key]: value }))}
        onClose={() => setDateSelection(null)}
        onSave={savePackageDate}
        packages={data.packages}
        pending={Boolean(pendingAction?.startsWith("date"))}
      />
    </main>
  );
}

function AdminCustomerDrawer({
  auditLogs,
  communicationEvents,
  customer,
  isLoading,
  message,
  noteDraft,
  notePending,
  onClose,
  onNoteChange,
  onOpenBooking,
  onOpenLead,
  onSaveNote,
}: {
  auditLogs: AuditLogRow[];
  communicationEvents: CommunicationEventRow[];
  customer: CustomerRow | null;
  isLoading: boolean;
  message: string | null;
  noteDraft: string;
  notePending: boolean;
  onClose: () => void;
  onNoteChange: (value: string) => void;
  onOpenBooking: (bookingId: string) => void;
  onOpenLead: (leadId: string) => void;
  onSaveNote: () => void;
}) {
  if (!customer) return null;

  const internalNotes = [
    ...customer.leads.map((lead) => ({
      id: `lead-${lead.id}`,
      label: `Anfrage · ${leadIntentLabel(lead)}`,
      value: getInternalNote(lead.payload ?? {}),
    })),
    ...customer.bookings.map((booking) => ({
      id: `booking-${booking.id}`,
      label: `Buchung · ${getBookingLabel(booking)}`,
      value: getInternalNote(booking.payload ?? {}),
    })),
  ].filter((item) => item.value);

  return (
    <div className="admin-drawer-layer" role="presentation">
      <button className="admin-drawer-backdrop" onClick={onClose} type="button" />
      <aside className="admin-drawer" aria-label="Kundendetails">
        <header>
          <div>
            <p className="admin-eyebrow">Kunde</p>
            <h2>{customer.name}</h2>
            <span>{customerPhaseLabel(customer)} · {customer.nextStep}</span>
          </div>
          <button aria-label="Kundendetails schließen" onClick={onClose} type="button">
            Schließen
          </button>
        </header>

        <section className="admin-drawer-grid">
          <article>
            <small>E-Mail</small>
            <strong>{customer.email ? <a href={`mailto:${customer.email}`}>{customer.email}</a> : "nicht angegeben"}</strong>
          </article>
          <article>
            <small>Telefon</small>
            <strong>{customer.phone ? <a href={`tel:${customer.phone.replace(/\s+/g, "")}`}>{customer.phone}</a> : "nicht angegeben"}</strong>
          </article>
          <article>
            <small>Status</small>
            <strong>{customer.latestStatus}</strong>
          </article>
          <article>
            <small>Quelle</small>
            <strong>{customer.source}</strong>
          </article>
        </section>

        {message ? <p className="admin-drawer-message">{message}</p> : null}

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Anfragehistorie</p>
          <div className="admin-list">
            {customer.leads.length ? (
              customer.leads.map((lead) => (
                <article className="admin-list-item" key={lead.id}>
                  <div>
                    <small>{formatDate(lead.created_at)} · {leadWorkLabel(lead)}</small>
                    <strong>{leadIntentLabel(lead)}</strong>
                    <em>{lead.status} · {leadSourceLabel(lead)}</em>
                    <p>{leadWorkMeta(lead)}</p>
                  </div>
                  <div className="admin-row-actions">
                    <button onClick={() => onOpenLead(lead.id)} type="button">
                      Anfrage öffnen
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="admin-drawer-message">Keine Anfragehistorie vorhanden.</p>
            )}
          </div>
        </section>

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Buchungshistorie</p>
          <div className="admin-list">
            {customer.bookings.length ? (
              customer.bookings.map((booking) => (
                <article className="admin-list-item" key={booking.id}>
                  <div>
                    <small>{formatDate(booking.created_at)}</small>
                    <strong>{getBookingLabel(booking)}</strong>
                    <em>{booking.status} · {booking.payment_status}</em>
                    <p>
                      {booking.selected_date || getPayloadText(booking.payload ?? {}, ["selectedDate", "dateLabel", "travelDate"]) ||
                        "Termin noch nicht eindeutig hinterlegt."}
                    </p>
                  </div>
                  <div className="admin-row-actions">
                    <button onClick={() => onOpenBooking(booking.id)} type="button">
                      Buchung öffnen
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="admin-drawer-message">Noch keine Buchung vorhanden.</p>
            )}
          </div>
        </section>

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Interne Notizen</p>
          <label className="admin-drawer-field">
            Zentrale Kundennotiz
            <textarea
              onChange={(event) => onNoteChange(event.target.value)}
              rows={5}
              value={noteDraft}
            />
          </label>
          <button
            className="admin-button"
            disabled={notePending}
            onClick={onSaveNote}
            type="button"
          >
            {notePending ? "Speichert..." : "Kundennotiz speichern"}
          </button>
          <div className="admin-timeline admin-timeline-compact">
            {internalNotes.length ? (
              internalNotes.map((note) => (
                <article key={note.id}>
                  <small>{note.label}</small>
                  <p>{note.value}</p>
                </article>
              ))
            ) : (
              <p className="admin-drawer-message">Noch keine weiteren Notizen an Anfrage oder Buchung hinterlegt.</p>
            )}
          </div>
        </section>

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Kommunikation</p>
          {isLoading ? <p className="admin-drawer-message">Historie wird geladen.</p> : null}
          <div className="admin-timeline admin-timeline-compact">
            {communicationEvents.length ? (
              communicationEvents.map((event) => (
                <article key={event.id}>
                  <small>
                    {formatDate(event.created_at)} · {event.channel} · {event.direction}
                  </small>
                  <strong>{event.subject || event.event_type}</strong>
                  {event.body ? <p>{event.body}</p> : null}
                </article>
              ))
            ) : !isLoading ? (
              <p className="admin-drawer-message">Noch keine Kommunikation für diesen Kunden geladen.</p>
            ) : null}
          </div>
        </section>

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Änderungen</p>
          <div className="admin-timeline admin-timeline-compact">
            {auditLogs.length ? (
              auditLogs.map((log) => (
                <article key={log.id}>
                  <small>
                    {formatDate(log.created_at)} · {log.actor_email || "Morrow"}
                  </small>
                  <strong>{auditActionLabel(log.action)}</strong>
                  <p>{auditPayloadSummary(log)}</p>
                </article>
              ))
            ) : (
              <p className="admin-drawer-message">Noch keine Änderungen für diesen Kunden gefunden.</p>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}

function AdminDetailDrawer({
  auditLogs,
  booking,
  bookingOperationsDraft,
  bookingOperationsPending,
  canSendEmail,
  communicationEvents,
  isLoading,
  lead,
  leadDetailsDraft,
  leadDetailsPending,
  message,
  note,
  onBookingOperationsChange,
  onClose,
  onLeadDetailsChange,
  onOutboundChange,
  onNoteChange,
  onPaymentChange,
  onSaveBookingOperations,
  onSaveLeadDetails,
  onSaveNote,
  onSavePayment,
  onSendEmail,
  outboundDraft,
  packages,
  paymentDraft,
  paymentPending,
  pending,
  sendPending,
  support,
}: {
  auditLogs: AuditLogRow[];
  booking: BookingRow | null;
  bookingOperationsDraft: BookingOperationsDraft;
  bookingOperationsPending: boolean;
  canSendEmail: boolean;
  communicationEvents: CommunicationEventRow[];
  isLoading: boolean;
  lead: LeadRow | null;
  leadDetailsDraft: LeadDetailsDraft;
  leadDetailsPending: boolean;
  message: string | null;
  note: string;
  onBookingOperationsChange: (key: keyof BookingOperationsDraft, value: string) => void;
  onClose: () => void;
  onLeadDetailsChange: (key: keyof LeadDetailsDraft, value: string) => void;
  onOutboundChange: (key: keyof OutboundDraft, value: string) => void;
  onNoteChange: (value: string) => void;
  onPaymentChange: (key: keyof PaymentDraft, value: string) => void;
  onSaveBookingOperations: () => void;
  onSaveLeadDetails: () => void;
  onSaveNote: () => void;
  onSavePayment: () => void;
  onSendEmail: () => void;
  outboundDraft: OutboundDraft;
  packages: SimpleRow[];
  paymentDraft: PaymentDraft;
  paymentPending: boolean;
  pending: boolean;
  sendPending: boolean;
  support: SupportRow | null;
}) {
  if (!lead && !booking && !support) return null;

  const title = lead
    ? getLeadLabel(lead)
    : booking
      ? getBookingLabel(booking)
      : getSupportContactLabel(support as SupportRow);
  const status = lead
    ? lead.status
    : booking
      ? `${booking.status} · ${booking.payment_status}`
      : `${getSupportLabel(support as SupportRow)} · ${supportStatusLabel((support as SupportRow).status)}`;
  const payload = lead?.payload ?? booking?.payload ?? support?.payload ?? {};
  const email = lead?.email || getPayloadText(payload, ["email"]);
  const phone = lead?.phone || getPayloadText(payload, ["phone"]);
  const packageName =
    getPayloadText(payload, ["packageName", "packageTitle", "stayName", "packageSlug"]) ||
    lead?.package_slug;
  const selectedDate = getPayloadText(payload, [
    "selectedDate",
    "dateLabel",
    "travelDate",
    "arrivalDate",
    "bookingDate",
  ]);
  const drawerType = lead ? "Anfrage" : booking ? "Buchung" : "Support";
  const supportMessage = support?.message || getPayloadText(payload, ["message", "note"]);
  const supportCategory = support
    ? supportCategoryLabel(support.category || getPayloadText(payload, ["supportCategory", "category"]))
    : null;
  const supportContextItems = support ? getSupportContextItems(support) : [];
  const leadSource = lead ? leadSourceLabel(lead) : null;
  const leadUtm = typeof payload.utm === "object" && payload.utm !== null
    ? payload.utm as Record<string, unknown>
    : {};
  const leadMedium = getPayloadText(leadUtm, ["medium", "utm_medium"]);
  const leadContent = getPayloadText(leadUtm, ["content", "utm_content"]);

  return (
    <div className="admin-drawer-layer" role="presentation">
      <button className="admin-drawer-backdrop" onClick={onClose} type="button" />
      <aside className="admin-drawer" aria-label="Details">
        <header>
          <div>
            <p className="admin-eyebrow">{drawerType}</p>
            <h2>{title}</h2>
            <span>{status}</span>
          </div>
          <button aria-label="Details schließen" onClick={onClose} type="button">
            Schließen
          </button>
        </header>

        <section className="admin-drawer-grid">
          <article>
            <small>E-Mail</small>
            <strong>
              {email ? <a href={`mailto:${email}`}>{email}</a> : "nicht angegeben"}
            </strong>
          </article>
          <article>
            <small>Telefon</small>
            <strong>
              {phone ? <a href={`tel:${phone}`}>{phone}</a> : "nicht angegeben"}
            </strong>
          </article>
          <article>
            <small>{support ? "Kategorie" : "Auszeit"}</small>
            <strong>{support ? supportCategory || "Allgemein" : packageName || "nicht zugeordnet"}</strong>
          </article>
          <article>
            <small>{support ? "Dringlichkeit" : "Termin"}</small>
            <strong>{support ? supportUrgencyLabel(support.urgency) : selectedDate || "offen"}</strong>
          </article>
          {lead ? (
            <>
              <article>
                <small>Quelle</small>
                <strong>{leadSource}</strong>
              </article>
              <article>
                <small>Kampagnenkontext</small>
                <strong>{[leadMedium, leadContent].filter(Boolean).join(" · ") || "nicht gesetzt"}</strong>
              </article>
            </>
          ) : null}
        </section>

        {support && supportContextItems.length ? (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">Kontext</p>
            <div className="admin-drawer-context-grid">
              {supportContextItems.map(([label, value]) => (
                <article key={`${label}-${value}`}>
                  <small>{label}</small>
                  <strong>{value}</strong>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {supportMessage ? (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">Nachricht</p>
            <article className="admin-drawer-note-card">
              <p>{supportMessage}</p>
            </article>
          </section>
        ) : null}

        {lead ? (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">Anfrage bearbeiten</p>
            <div className="admin-form-grid">
              <label>
                Name
                <input
                  onChange={(event) => onLeadDetailsChange("name", event.target.value)}
                  value={leadDetailsDraft.name}
                />
              </label>
              <label>
                E-Mail
                <input
                  onChange={(event) => onLeadDetailsChange("email", event.target.value)}
                  value={leadDetailsDraft.email}
                />
              </label>
              <label>
                Telefon
                <input
                  onChange={(event) => onLeadDetailsChange("phone", event.target.value)}
                  value={leadDetailsDraft.phone}
                />
              </label>
              <label>
                Art
                <select
                  onChange={(event) => onLeadDetailsChange("type", event.target.value as LeadRow["type"])}
                  value={leadDetailsDraft.type}
                >
                  <option value="guest">Gastanfrage</option>
                  <option value="owner">Eigentümer</option>
                  <option value="experience">Erlebnispartner</option>
                </select>
              </label>
              <label>
                Status
                <input
                  onChange={(event) => onLeadDetailsChange("status", event.target.value)}
                  value={leadDetailsDraft.status}
                />
              </label>
              <label>
                Auszeit
                <select
                  onChange={(event) => onLeadDetailsChange("package_slug", event.target.value)}
                  value={leadDetailsDraft.package_slug}
                >
                  <option value="">Nicht zugeordnet</option>
                  {packages.map((packageItem) => (
                    <option key={packageItem.id} value={packageItem.slug || packageItem.id}>
                      {packageItem.name || packageItem.slug || packageItem.id}
                    </option>
                  ))}
                  {leadDetailsDraft.package_slug && !packages.some((packageItem) =>
                    packageItem.slug === leadDetailsDraft.package_slug || packageItem.id === leadDetailsDraft.package_slug
                  ) ? (
                    <option value={leadDetailsDraft.package_slug}>{leadDetailsDraft.package_slug}</option>
                  ) : null}
                </select>
              </label>
              <label>
                Termin
                <input
                  onChange={(event) => onLeadDetailsChange("selected_date", event.target.value)}
                  value={leadDetailsDraft.selected_date}
                />
              </label>
              <label>
                Wiedervorlage
                <input
                  onChange={(event) => onLeadDetailsChange("follow_up_at", event.target.value)}
                  type="date"
                  value={leadDetailsDraft.follow_up_at}
                />
              </label>
              <label>
                Erwachsene
                <input
                  inputMode="numeric"
                  onChange={(event) => onLeadDetailsChange("adults", event.target.value)}
                  value={leadDetailsDraft.adults}
                />
              </label>
              <label>
                Kinder
                <input
                  inputMode="numeric"
                  onChange={(event) => onLeadDetailsChange("children", event.target.value)}
                  value={leadDetailsDraft.children}
                />
              </label>
              <label>
                Alter der Kinder
                <input
                  onChange={(event) => onLeadDetailsChange("children_ages", event.target.value)}
                  value={leadDetailsDraft.children_ages}
                />
              </label>
              <label>
                Hund
                <input
                  onChange={(event) => onLeadDetailsChange("dog", event.target.value)}
                  value={leadDetailsDraft.dog}
                />
              </label>
              <label>
                Quelle
                <input
                  onChange={(event) => onLeadDetailsChange("source", event.target.value)}
                  value={leadDetailsDraft.source}
                />
              </label>
              <label>
                Kampagne
                <input
                  onChange={(event) => onLeadDetailsChange("campaign", event.target.value)}
                  value={leadDetailsDraft.campaign}
                />
              </label>
              <label>
                WhatsApp
                <select
                  onChange={(event) => onLeadDetailsChange("whatsapp_opt_in", event.target.value)}
                  value={leadDetailsDraft.whatsapp_opt_in}
                >
                  <option value="">Nicht abgefragt</option>
                  <option value="yes">Zugestimmt</option>
                  <option value="no">Nicht zugestimmt</option>
                </select>
              </label>
              <label>
                Anlass
                <input
                  onChange={(event) => onLeadDetailsChange("occasion", event.target.value)}
                  value={leadDetailsDraft.occasion}
                />
              </label>
            </div>
            <button className="admin-button" disabled={leadDetailsPending} onClick={onSaveLeadDetails} type="button">
              {leadDetailsPending ? "Speichern" : "Anfrage speichern"}
            </button>
          </section>
        ) : null}

        {booking ? (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">Operations</p>
            <div className="admin-drawer-context-grid">
              <article>
                <small>Gästebereich</small>
                <strong>{guestAccessCodeForBooking(booking)}</strong>
              </article>
              <article>
                <small>Reservierungsfrist</small>
                <strong>{bookingOperationsDraft.reservation_deadline || "offen"}</strong>
              </article>
              <article>
                <small>Zahlungsfrist</small>
                <strong>{bookingOperationsDraft.payment_due_date || "offen"}</strong>
              </article>
              <article>
                <small>Check-in</small>
                <strong>{bookingOperationsDraft.check_in_status || "offen"}</strong>
              </article>
              <article>
                <small>Erlebnis</small>
                <strong>{bookingOperationsDraft.experience_status || "offen"}</strong>
              </article>
            </div>
            <div className="admin-form-grid">
              <label>
                Gastname
                <input
                  onChange={(event) => onBookingOperationsChange("guest_name", event.target.value)}
                  value={bookingOperationsDraft.guest_name}
                />
              </label>
              <label>
                E-Mail
                <input
                  onChange={(event) => onBookingOperationsChange("email", event.target.value)}
                  value={bookingOperationsDraft.email}
                />
              </label>
              <label>
                Telefon
                <input
                  onChange={(event) => onBookingOperationsChange("phone", event.target.value)}
                  value={bookingOperationsDraft.phone}
                />
              </label>
              <label>
                Auszeit
                <select
                  onChange={(event) => onBookingOperationsChange("package_id", event.target.value)}
                  value={bookingOperationsDraft.package_id}
                >
                  <option value="">Nicht zugeordnet</option>
                  {packages.map((packageItem) => (
                    <option key={packageItem.id} value={packageItem.id}>
                      {packageItem.name || packageItem.slug || packageItem.id}
                    </option>
                  ))}
                  {bookingOperationsDraft.package_id && !packages.some((packageItem) =>
                    packageItem.id === bookingOperationsDraft.package_id
                  ) ? (
                    <option value={bookingOperationsDraft.package_id}>{bookingOperationsDraft.package_id}</option>
                  ) : null}
                </select>
              </label>
              <label>
                Termin
                <input
                  onChange={(event) => onBookingOperationsChange("selected_date", event.target.value)}
                  value={bookingOperationsDraft.selected_date}
                />
              </label>
              <label>
                Zugangscode
                <input
                  onChange={(event) => onBookingOperationsChange("guest_access_code", event.target.value.toUpperCase())}
                  value={bookingOperationsDraft.guest_access_code}
                />
              </label>
              <label>
                Reservierungsfrist
                <input
                  onChange={(event) => onBookingOperationsChange("reservation_deadline", event.target.value)}
                  type="date"
                  value={bookingOperationsDraft.reservation_deadline}
                />
              </label>
              <label>
                Zahlungsfrist
                <input
                  onChange={(event) => onBookingOperationsChange("payment_due_date", event.target.value)}
                  type="date"
                  value={bookingOperationsDraft.payment_due_date}
                />
              </label>
              <label>
                Erwachsene
                <input
                  inputMode="numeric"
                  onChange={(event) => onBookingOperationsChange("adults", event.target.value)}
                  placeholder="z. B. 2"
                  value={bookingOperationsDraft.adults}
                />
              </label>
              <label>
                Kinder
                <input
                  inputMode="numeric"
                  onChange={(event) => onBookingOperationsChange("children", event.target.value)}
                  placeholder="z. B. 2"
                  value={bookingOperationsDraft.children}
                />
              </label>
              <label>
                Alter der Kinder
                <input
                  onChange={(event) => onBookingOperationsChange("children_ages", event.target.value)}
                  placeholder="z. B. 5 und 8"
                  value={bookingOperationsDraft.children_ages}
                />
              </label>
              <label>
                Hund
                <input
                  onChange={(event) => onBookingOperationsChange("dog", event.target.value)}
                  placeholder="Nein, ja oder kurze Notiz"
                  value={bookingOperationsDraft.dog}
                />
              </label>
              <label>
                Check-in-Status
                <select
                  onChange={(event) => onBookingOperationsChange("check_in_status", event.target.value)}
                  value={bookingOperationsDraft.check_in_status}
                >
                  <option value="offen">Offen</option>
                  <option value="daten_geprüft">Daten geprüft</option>
                  <option value="freigegeben">Freigegeben</option>
                  <option value="gesendet">An Gast gesendet</option>
                </select>
              </label>
              <label>
                Erlebnisstatus
                <select
                  onChange={(event) => onBookingOperationsChange("experience_status", event.target.value)}
                  value={bookingOperationsDraft.experience_status}
                >
                  <option value="offen">Offen</option>
                  <option value="angefragt">Angefragt</option>
                  <option value="bestätigt">Bestätigt</option>
                  <option value="alternative_nötig">Alternative nötig</option>
                </select>
              </label>
              <label className="admin-form-grid-full">
                Nächste Aufgabe
                <textarea
                  onChange={(event) => onBookingOperationsChange("next_task", event.target.value)}
                  placeholder="Was muss als Nächstes passieren?"
                  rows={3}
                  value={bookingOperationsDraft.next_task}
                />
              </label>
            </div>
            <button
              className="admin-button"
              disabled={bookingOperationsPending}
              onClick={onSaveBookingOperations}
              type="button"
            >
              {bookingOperationsPending ? "Speichern" : "Buchungsdetails speichern"}
            </button>
            {booking.guest_access_code ? (
              <p className="admin-drawer-message">
                Gästebereich: <a href={guestAreaHref(booking)}>Link öffnen</a>
              </p>
            ) : bookingOperationsDraft.guest_access_code ? (
              <p className="admin-drawer-message">
                Der Zugangscode ist vorbereitet. Speichere die Buchungsdetails, damit der Gästebereich-Link aktiv wird.
              </p>
            ) : null}
          </section>
        ) : null}

        {booking ? (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">Zahlung</p>
            <div className="admin-form-grid">
              <label>
                Zahlungsstatus
                <select
                  onChange={(event) => onPaymentChange("payment_status", event.target.value)}
                  value={paymentDraft.payment_status}
                >
                  <option value="offen">Offen</option>
                  <option value="angefordert">Angefordert</option>
                  <option value="teilbezahlt">Teilbezahlt</option>
                  <option value="bezahlt">Bezahlt</option>
                  <option value="erstattet">Erstattet</option>
                </select>
              </label>
              <label>
                Betrag
                <input
                  onChange={(event) => onPaymentChange("payment_amount", event.target.value)}
                  placeholder="z. B. 1.190 €"
                  value={paymentDraft.payment_amount}
                />
              </label>
              <label>
                Zahlungsdatum
                <input
                  onChange={(event) => onPaymentChange("payment_date", event.target.value)}
                  placeholder="TT.MM.JJJJ"
                  value={paymentDraft.payment_date}
                />
              </label>
              <label>
                Zahlungsart
                <input
                  onChange={(event) => onPaymentChange("payment_method", event.target.value)}
                  placeholder="Überweisung, Rechnung, Stripe ..."
                  value={paymentDraft.payment_method}
                />
              </label>
              <label>
                Referenz
                <input
                  onChange={(event) => onPaymentChange("payment_reference", event.target.value)}
                  placeholder="Rechnungsnummer oder Transaktions-ID"
                  value={paymentDraft.payment_reference}
                />
              </label>
              <label>
                Beleglink
                <input
                  onChange={(event) => onPaymentChange("payment_proof_url", event.target.value)}
                  placeholder="Interner Link zum Zahlungsbeleg"
                  value={paymentDraft.payment_proof_url}
                />
              </label>
            </div>
            <button className="admin-button" disabled={paymentPending} onClick={onSavePayment} type="button">
              {paymentPending ? "Speichern" : "Zahlung speichern"}
            </button>
          </section>
        ) : null}

        {canSendEmail ? (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">E-Mail senden</p>
            <div className="admin-form-grid">
              <label>
                Betreff
                <input
                  onChange={(event) => onOutboundChange("subject", event.target.value)}
                  value={outboundDraft.subject}
                />
              </label>
              <label>
                Nachricht
                <textarea
                  onChange={(event) => onOutboundChange("body", event.target.value)}
                  placeholder="Persönliche Rückmeldung oder nächster Schritt."
                  rows={6}
                  value={outboundDraft.body}
                />
              </label>
            </div>
            <button className="admin-button" disabled={sendPending} onClick={onSendEmail} type="button">
              {sendPending ? "Senden" : "E-Mail senden"}
            </button>
          </section>
        ) : null}

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Interne Notiz</p>
          <textarea
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Gespräch, nächster Schritt oder wichtige Einschätzung festhalten."
            rows={5}
            value={note}
          />
          <button className="admin-button" disabled={pending} onClick={onSaveNote} type="button">
            {pending ? "Speichern" : "Notiz speichern"}
          </button>
          {message ? <p className="admin-drawer-message">{message}</p> : null}
        </section>

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Historie</p>
          {isLoading ? <p className="admin-drawer-message">Historie wird geladen.</p> : null}
          <div className="admin-timeline">
            {communicationEvents.length ? (
              communicationEvents.map((event) => (
                <article key={event.id}>
                  <small>{formatDate(event.created_at)}</small>
                  <strong>{event.subject || event.event_type}</strong>
                  <p>{event.body || `${event.channel} · ${event.direction}`}</p>
                </article>
              ))
            ) : (
              <p className="admin-drawer-message">Noch keine Historie vorhanden.</p>
            )}
          </div>
        </section>

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Änderungen</p>
          <div className="admin-timeline admin-timeline-compact">
            {auditLogs.length ? (
              auditLogs.map((log) => (
                <article key={log.id}>
                  <small>
                    {formatDate(log.created_at)} · {log.actor_email || "Morrow"}
                  </small>
                  <strong>{auditActionLabel(log.action)}</strong>
                  <p>{auditPayloadSummary(log)}</p>
                </article>
              ))
            ) : (
              <p className="admin-drawer-message">Noch keine Änderungen protokolliert.</p>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}

function AdminInventoryDrawer({
  draft,
  inventoryType,
  isCreating,
  message,
  onChange,
  onClose,
  onSave,
  packageItem,
  packages,
  pending,
  properties,
  property,
}: {
  draft: InventoryDraft;
  inventoryType: "package" | "property" | null;
  isCreating: boolean;
  message: string | null;
  onChange: (key: string, value: string | boolean | string[]) => void;
  onClose: () => void;
  onSave: () => void;
  packageItem: SimpleRow | null;
  packages: SimpleRow[];
  pending: boolean;
  properties: SimpleRow[];
  property: SimpleRow | null;
}) {
  if (!packageItem && !property && !isCreating) return null;

  const isPackage = inventoryType === "package" || Boolean(packageItem);
  const title = isCreating
    ? isPackage
      ? "Neue Auszeit"
      : "Neue Unterkunft"
    : isPackage
      ? packageItem?.name || "Auszeit bearbeiten"
      : property?.name || "Unterkunft bearbeiten";
  const selectedAttributes = draftStringArray(draft.attributes);
  const selectedWorlds = draftStringArray(draft.experience_worlds);
  const propertyIssues = !isPackage ? getInventoryPropertyIssues(draft) : [];
  const linkedPackages = property
    ? packages.filter((item) => item.property_id === property.id)
    : [];
  const toggleArrayValue = (key: string, value: string) => {
    const current = draftStringArray(draft[key]);
    onChange(
      key,
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  return (
    <div className="admin-drawer-layer" role="presentation">
      <button className="admin-drawer-backdrop" onClick={onClose} type="button" />
      <aside className="admin-drawer" aria-label="Bestand bearbeiten">
        <header>
          <div>
            <p className="admin-eyebrow">{isPackage ? "Auszeit" : "Unterkunft"}</p>
            <h2>{title}</h2>
            <span>
              {isCreating ? "wird nach dem Speichern angelegt" : isPackage ? packageItem?.id : property?.id}
            </span>
          </div>
          <button aria-label="Bearbeitung schließen" onClick={onClose} type="button">
            Schließen
          </button>
        </header>

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Basisdaten</p>
          <div className="admin-form-grid">
            <label>
              Name
              <input
                onChange={(event) => onChange("name", event.target.value)}
                value={String(draft.name || "")}
              />
            </label>
            <label>
              Status
              <select
                onChange={(event) => onChange("status", event.target.value)}
                value={String(draft.status || "draft")}
              >
                <option value="draft">Entwurf</option>
                <option value="review">Prüfen</option>
                <option value="published">Veröffentlicht</option>
                <option value="paused">Pausiert</option>
              </select>
            </label>
            <label>
              Ort
              <input
                onChange={(event) => onChange("location", event.target.value)}
                value={String(draft.location || "")}
              />
            </label>
            {isPackage ? (
              <>
                <label>
                  Slug
                  <input
                    onChange={(event) => onChange("slug", event.target.value)}
                    placeholder="wird automatisch aus dem Namen erstellt"
                    readOnly={!isCreating}
                    value={String(draft.slug || "")}
                  />
                </label>
                <label>
                  Zielgruppe
                  {isCreating ? (
                    <select
                      onChange={(event) => onChange("audience", event.target.value)}
                      value={String(draft.audience || "families")}
                    >
                      <option value="families">Familien</option>
                      <option value="couples">Paare</option>
                    </select>
                  ) : (
                    <input readOnly value={String(draft.audience || "")} />
                  )}
                </label>
                <label>
                  Unterkunft
                  <select
                    onChange={(event) => onChange("property_id", event.target.value)}
                    value={String(draft.property_id || "")}
                  >
                    <option value="">Nicht verbunden</option>
                    {properties.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name || item.id}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : null}
          </div>
        </section>

        {isPackage ? (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">Preis und Verbindung</p>
            <div className="admin-form-grid">
              <label>
                Preis ab
                <input
                  onChange={(event) => onChange("price_from", event.target.value)}
                  placeholder="z. B. ab 1.190 €"
                  value={String(draft.price_from || "")}
                />
              </label>
              <label>
                Konkreter Preis
                <input
                  onChange={(event) => onChange("concrete_price", event.target.value)}
                  placeholder="z. B. 1.190 €"
                  value={String(draft.concrete_price || "")}
                />
              </label>
            </div>
          </section>
        ) : (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">Unterkunftsdaten</p>
            <div className="admin-form-grid">
              <label>
                Beschreibung
                <textarea
                  onChange={(event) => onChange("description", event.target.value)}
                  rows={4}
                  value={String(draft.description || "")}
                />
              </label>
              <label>
                Objekttyp
                <input
                  onChange={(event) => onChange("property_type", event.target.value)}
                  placeholder="z. B. Ferienhaus, Wohnung, Hotelzimmer"
                  value={String(draft.property_type || "")}
                />
              </label>
              <label>
                Eigentümer
                <input
                  onChange={(event) => onChange("owner_name", event.target.value)}
                  value={String(draft.owner_name || "")}
                />
              </label>
              <label>
                Eigentümer-E-Mail
                <input
                  onChange={(event) => onChange("owner_email", event.target.value)}
                  type="email"
                  value={String(draft.owner_email || "")}
                />
              </label>
              <label>
                Eigentümer-Telefon
                <input
                  onChange={(event) => onChange("owner_phone", event.target.value)}
                  type="tel"
                  value={String(draft.owner_phone || "")}
                />
              </label>
              <label>
                Aktuelle Vermietung
                <select
                  onChange={(event) => onChange("current_rental", event.target.value)}
                  value={String(draft.current_rental || "agency")}
                >
                  <option value="self">Selbst</option>
                  <option value="agency">Agentur</option>
                  <option value="platforms">Plattformen</option>
                  <option value="not-yet">Noch nicht</option>
                </select>
              </label>
              <label>
                Schlafplätze
                <input
                  inputMode="numeric"
                  onChange={(event) => onChange("sleeps", event.target.value)}
                  value={String(draft.sleeps || "")}
                />
              </label>
              <label>
                Schlafzimmer
                <input
                  inputMode="numeric"
                  onChange={(event) => onChange("bedrooms", event.target.value)}
                  value={String(draft.bedrooms || "")}
                />
              </label>
              <label>
                Badezimmer
                <input
                  inputMode="numeric"
                  onChange={(event) => onChange("bathrooms", event.target.value)}
                  value={String(draft.bathrooms || "")}
                />
              </label>
              <label>
                Check-in-Art
                <select
                  onChange={(event) => onChange("check_in_type", event.target.value)}
                  value={String(draft.check_in_type || "")}
                >
                  <option value="">Noch offen</option>
                  <option value="key_safe">Schlüsselsafe</option>
                  <option value="agency_pickup">Abholung bei Agentur</option>
                  <option value="personal_handover">Persönliche Übergabe</option>
                  <option value="smartlock">Smartlock</option>
                  <option value="unknown">Unbekannt</option>
                </select>
              </label>
              <label>
                Support-Typ
                <select
                  onChange={(event) => onChange("support_type", event.target.value)}
                  value={String(draft.support_type || "")}
                >
                  <option value="">Noch offen</option>
                  <option value="morrow">Morrow</option>
                  <option value="agency">Partneragentur</option>
                  <option value="hotel">Hotel / Gastgeber</option>
                </select>
              </label>
              <label>
                Support-Name
                <input
                  onChange={(event) => onChange("support_name", event.target.value)}
                  value={String(draft.support_name || "")}
                />
              </label>
            </div>
          </section>
        )}

        {!isPackage ? (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">Objektprüfung</p>
            <div className="admin-readiness-panel">
              <div>
                <strong>{propertyIssues.length === 0 ? "Bereit für Auszeiten" : "Noch nicht auszeitbereit"}</strong>
                <span>
                  {propertyIssues.length === 0
                    ? "Objektprofil, Anreise, Regeln, Medienrechte und Support sind gepflegt."
                    : `${propertyIssues.length} Punkt${propertyIssues.length === 1 ? "" : "e"} fehlen vor einer sauberen Veröffentlichung.`}
                </span>
              </div>
              <div className="admin-readiness-list">
                {propertyIssues.length === 0
                  ? <span>Alle Pflichtpunkte gepflegt</span>
                  : propertyIssues.map((issue) => <span key={issue}>{issue}</span>)}
              </div>
            </div>
          </section>
        ) : null}

        {isPackage ? (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">Paket-Story</p>
            <div className="admin-form-grid">
              <label>
                Headline
                <input
                  onChange={(event) => onChange("headline", event.target.value)}
                  placeholder="z. B. Vier Tage Nordsee, die sich nach echter Familienzeit anfühlen."
                  value={String(draft.headline || "")}
                />
              </label>
              <label>
                Subheadline
                <textarea
                  onChange={(event) => onChange("subheadline", event.target.value)}
                  rows={3}
                  value={String(draft.subheadline || "")}
                />
              </label>
              <label>
                Kurzbeschreibung
                <textarea
                  onChange={(event) => onChange("short_description", event.target.value)}
                  rows={4}
                  value={String(draft.short_description || "")}
                />
              </label>
              <label>
                Gefühl der Auszeit
                <textarea
                  onChange={(event) => onChange("experience_feeling", event.target.value)}
                  rows={4}
                  value={String(draft.experience_feeling || "")}
                />
              </label>
            </div>
          </section>
        ) : null}

        {isPackage ? (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">Leistung und Momente</p>
            <div className="admin-form-grid">
              <label>
                Enthalten
                <textarea
                  onChange={(event) => onChange("included_items", event.target.value)}
                  placeholder="Ein Punkt pro Zeile"
                  rows={5}
                  value={String(draft.included_items || "")}
                />
              </label>
              <label>
                Highlights / Momente
                <textarea
                  onChange={(event) => onChange("highlights", event.target.value)}
                  placeholder="Ein Moment pro Zeile"
                  rows={5}
                  value={String(draft.highlights || "")}
                />
              </label>
              <label>
                Empfehlungen vor Ort
                <textarea
                  onChange={(event) => onChange("recommendations", event.target.value)}
                  placeholder="Eine Empfehlung pro Zeile"
                  rows={5}
                  value={String(draft.recommendations || "")}
                />
              </label>
              <label>
                FAQ
                <textarea
                  onChange={(event) => onChange("faq", event.target.value)}
                  placeholder="Eine Frage oder Antwort pro Zeile"
                  rows={5}
                  value={String(draft.faq || "")}
                />
              </label>
            </div>
          </section>
        ) : null}

        {isPackage ? (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">Medien und Launch</p>
            <div className="admin-form-grid">
              <label>
                Hero-Bild
                <input
                  onChange={(event) => onChange("hero_image", event.target.value)}
                  placeholder="Bildpfad oder URL"
                  value={String(draft.hero_image || "")}
                />
              </label>
              <label>
                Galerie
                <textarea
                  onChange={(event) => onChange("gallery_images", event.target.value)}
                  placeholder="Ein Bildpfad oder eine URL pro Zeile"
                  rows={5}
                  value={String(draft.gallery_images || "")}
                />
              </label>
              <label>
                Interne Launch-Notiz
                <textarea
                  onChange={(event) => onChange("launch_note", event.target.value)}
                  placeholder="Was muss vor Veröffentlichung noch geprüft werden?"
                  rows={4}
                  value={String(draft.launch_note || "")}
                />
              </label>
            </div>
          </section>
        ) : null}

        {!isPackage ? (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">Anreise und Aufenthalt</p>
            <div className="admin-form-grid">
              <label>
                Adresse
                <input
                  onChange={(event) => onChange("address", event.target.value)}
                  value={String(draft.address || "")}
                />
              </label>
              <label>
                Früheste Anreise
                <input
                  onChange={(event) => onChange("earliest_arrival", event.target.value)}
                  placeholder="z. B. 15:00"
                  value={String(draft.earliest_arrival || "")}
                />
              </label>
              <label>
                Späteste Anreise
                <input
                  onChange={(event) => onChange("latest_arrival", event.target.value)}
                  placeholder="z. B. 18:00"
                  value={String(draft.latest_arrival || "")}
                />
              </label>
              <label>
                Check-out
                <input
                  onChange={(event) => onChange("check_out_time", event.target.value)}
                  placeholder="z. B. 10:00"
                  value={String(draft.check_out_time || "")}
                />
              </label>
              <label>
                Schlüsselcode / Smartlock
                <input
                  onChange={(event) => onChange("key_safe_code", event.target.value)}
                  placeholder="Nur intern bzw. nach Buchung anzeigen"
                  value={String(draft.key_safe_code || "")}
                />
              </label>
              <label>
                Check-in-Hinweise
                <textarea
                  onChange={(event) => onChange("check_in_instructions", event.target.value)}
                  rows={4}
                  value={String(draft.check_in_instructions || "")}
                />
              </label>
            </div>
          </section>
        ) : null}

        {!isPackage ? (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">Ausstattung und Positionierung</p>
            <div className="admin-form-grid">
              <label>
                Ausstattung
                <textarea
                  onChange={(event) => onChange("amenities", event.target.value)}
                  placeholder="Ein Merkmal pro Zeile"
                  rows={5}
                  value={String(draft.amenities || "")}
                />
              </label>
            </div>
            <div className="admin-option-grid" aria-label="Objektattribute">
              {propertyAttributeOptions.map((option) => (
                <label className="admin-checkbox-label" key={option.value}>
                  <input
                    checked={selectedAttributes.includes(option.value)}
                    onChange={() => toggleArrayValue("attributes", option.value)}
                    type="checkbox"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </section>
        ) : null}

        {!isPackage ? (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">Erlebniswelten</p>
            <div className="admin-option-grid" aria-label="Erlebniswelten">
              {experienceWorldOptions.map((option) => (
                <label className="admin-checkbox-label" key={option.value}>
                  <input
                    checked={selectedWorlds.includes(option.value)}
                    onChange={() => toggleArrayValue("experience_worlds", option.value)}
                    type="checkbox"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </section>
        ) : null}

        {!isPackage ? (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">Regeln und Medien</p>
            <div className="admin-form-grid">
              <label>
                Unterkunftsregeln
                <textarea
                  onChange={(event) => onChange("house_rules", event.target.value)}
                  placeholder="Eine Regel pro Zeile"
                  rows={5}
                  value={String(draft.house_rules || "")}
                />
              </label>
              <label>
                Medien
                <textarea
                  onChange={(event) => onChange("media", event.target.value)}
                  placeholder="Ein Bildpfad oder eine URL pro Zeile"
                  rows={5}
                  value={String(draft.media || "")}
                />
              </label>
              <label>
                Bildbeschreibungen
                <textarea
                  onChange={(event) => onChange("media_alt_texts", event.target.value)}
                  placeholder="Eine Beschreibung pro Bildzeile"
                  rows={5}
                  value={String(draft.media_alt_texts || "")}
                />
              </label>
              <label className="admin-checkbox-label">
                <input
                  checked={Boolean(draft.image_rights_confirmed)}
                  onChange={(event) => onChange("image_rights_confirmed", event.target.checked)}
                  type="checkbox"
                />
                Bildrechte bestätigt
              </label>
            </div>
          </section>
        ) : null}

        {!isPackage && property ? (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">Verbundene Auszeiten</p>
            <div className="admin-linked-list">
              {linkedPackages.length === 0 ? (
                <p>Noch keine Auszeit mit dieser Unterkunft verbunden.</p>
              ) : linkedPackages.map((item) => (
                <article key={item.id}>
                  <div>
                    <strong>{item.name || item.id}</strong>
                    <span>
                      {[item.audience, item.status, item.concrete_price || item.price_from]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="admin-drawer-section">
          <button className="admin-button" disabled={pending} onClick={onSave} type="button">
            {pending ? "Speichern" : "Speichern"}
          </button>
          {message ? <p className="admin-drawer-message">{message}</p> : null}
        </section>
      </aside>
    </div>
  );
}

function AdminExperienceDrawer({
  draft,
  experience,
  isCreating,
  message,
  onChange,
  onClose,
  onSave,
  packages,
  pending,
  providers,
}: {
  draft: ExperienceDraft;
  experience: ExperienceBlockRow | null;
  isCreating: boolean;
  message: string | null;
  onChange: (key: string, value: string | boolean) => void;
  onClose: () => void;
  onSave: () => void;
  packages: SimpleRow[];
  pending: boolean;
  providers: ExperienceProviderRow[];
}) {
  if (!experience && !isCreating) return null;

  const experienceIssues = getExperienceIssues(draft);

  return (
    <div className="admin-drawer-layer" role="presentation">
      <button className="admin-drawer-backdrop" onClick={onClose} type="button" />
      <aside className="admin-drawer" aria-label="Erlebnis bearbeiten">
        <header>
          <div>
            <p className="admin-eyebrow">Erlebnis</p>
            <h2>{isCreating ? "Neuer Erlebnisbaustein" : experience?.title}</h2>
            <span>{isCreating ? "wird nach dem Speichern angelegt" : experience?.id}</span>
          </div>
          <button aria-label="Bearbeitung schließen" onClick={onClose} type="button">
            Schließen
          </button>
        </header>

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Erlebnisprüfung</p>
          <div className="admin-readiness-panel">
            <div>
              <strong>{experienceIssues.length === 0 ? "Bereit für Auszeiten" : "Noch nicht auszeitbereit"}</strong>
              <span>
                {experienceIssues.length === 0
                  ? "Anbieter, Preislogik, Kapazität, Verfügbarkeit und Gastnotiz sind gepflegt."
                  : `${experienceIssues.length} Punkt${experienceIssues.length === 1 ? "" : "e"} fehlen vor einer sauberen Nutzung.`}
              </span>
            </div>
            <div className="admin-readiness-list">
              {experienceIssues.length === 0
                ? <span>Alle Pflichtpunkte gepflegt</span>
                : experienceIssues.map((issue) => <span key={issue}>{issue}</span>)}
            </div>
          </div>
        </section>

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Zuordnung</p>
          <div className="admin-form-grid">
            <label>
              Titel
              <input
                onChange={(event) => onChange("title", event.target.value)}
                value={String(draft.title || "")}
              />
            </label>
            <label>
              Auszeit
              <select
                onChange={(event) => onChange("package_id", event.target.value)}
                value={String(draft.package_id || "")}
              >
                <option value="">Nicht verbunden</option>
                {packages.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name || item.id}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Anbieter
              <select
                onChange={(event) => onChange("provider_id", event.target.value)}
                value={String(draft.provider_id || "")}
              >
                <option value="">Anbieter offen</option>
                {providers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Paketlogik</p>
          <div className="admin-form-grid">
            <label>
              Rolle
              <select
                onChange={(event) => onChange("role", event.target.value)}
                value={String(draft.role || "planned")}
              >
                {experienceRoles.map((role) => (
                  <option key={role} value={role}>
                    {experienceRoleLabel(role)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Bestätigung
              <select
                onChange={(event) => onChange("confirmation_status", event.target.value)}
                value={String(draft.confirmation_status || "planned")}
              >
                {experienceConfirmationStatuses.map((status) => (
                  <option key={status} value={status}>
                    {experienceConfirmationLabel(status)}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-checkbox-label">
              <input
                checked={Boolean(draft.included_in_price)}
                onChange={(event) => onChange("included_in_price", event.target.checked)}
                type="checkbox"
              />
              Im Preis enthalten
            </label>
          </div>
        </section>

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Gast- und Operationshinweise</p>
          <div className="admin-form-grid">
            <label>
              Gastnotiz
              <textarea
                onChange={(event) => onChange("guest_note", event.target.value)}
                rows={4}
                value={String(draft.guest_note || "")}
              />
            </label>
            <label>
              Preisnotiz
              <input
                onChange={(event) => onChange("price_note", event.target.value)}
                value={String(draft.price_note || "")}
              />
            </label>
            <label>
              Kapazität
              <input
                onChange={(event) => onChange("capacity_note", event.target.value)}
                value={String(draft.capacity_note || "")}
              />
            </label>
            <label>
              Verfügbarkeit
              <input
                onChange={(event) => onChange("availability_note", event.target.value)}
                value={String(draft.availability_note || "")}
              />
            </label>
            <label>
              Qualitätsbewertung
              <select
                onChange={(event) => onChange("quality_score", event.target.value)}
                value={String(draft.quality_score || "")}
              >
                <option value="">Noch nicht bewertet</option>
                <option value="1">1 · kritisch</option>
                <option value="2">2 · schwach</option>
                <option value="3">3 · solide</option>
                <option value="4">4 · gut</option>
                <option value="5">5 · sehr passend</option>
              </select>
            </label>
            <label>
              Interne Qualitätsnotiz
              <textarea
                onChange={(event) => onChange("quality_note", event.target.value)}
                rows={4}
                value={String(draft.quality_note || "")}
              />
            </label>
          </div>
        </section>

        <section className="admin-drawer-section">
          <button className="admin-button" disabled={pending} onClick={onSave} type="button">
            {pending ? "Speichern" : "Speichern"}
          </button>
          {message ? <p className="admin-drawer-message">{message}</p> : null}
        </section>
      </aside>
    </div>
  );
}

function AdminLocalPlaceDrawer({
  draft,
  isCreating,
  message,
  onChange,
  onClose,
  onSave,
  pending,
  place,
}: {
  draft: LocalPlaceDraft;
  isCreating: boolean;
  message: string | null;
  onChange: (key: string, value: string | boolean) => void;
  onClose: () => void;
  onSave: () => void;
  pending: boolean;
  place: LocalPlaceRow | null;
}) {
  if (!place && !isCreating) return null;

  const localPlaceIssues = getLocalPlaceIssues(draft);

  return (
    <div className="admin-drawer-layer" role="presentation">
      <button className="admin-drawer-backdrop" onClick={onClose} type="button" />
      <aside className="admin-drawer" aria-label="Vor-Ort-Ort bearbeiten">
        <header>
          <div>
            <p className="admin-eyebrow">Vor Ort</p>
            <h2>{isCreating ? "Neuer Ort" : place?.name}</h2>
            <span>{isCreating ? "wird nach dem Speichern angelegt" : place?.id}</span>
          </div>
          <button aria-label="Bearbeitung schließen" onClick={onClose} type="button">
            Schließen
          </button>
        </header>

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Ortsprüfung</p>
          <div className="admin-readiness-panel">
            <div>
              <strong>{localPlaceIssues.length === 0 ? "Bereit für die Gästewelt" : "Noch nicht gastbereit"}</strong>
              <span>
                {localPlaceIssues.length === 0
                  ? "Kategorie, Karte, Beschreibung, Bilder und relevante Links sind gepflegt."
                  : `${localPlaceIssues.length} Punkt${localPlaceIssues.length === 1 ? "" : "e"} fehlen vor einer sauberen Freigabe.`}
              </span>
            </div>
            <div className="admin-readiness-list">
              {localPlaceIssues.length === 0
                ? <span>Alle Pflichtpunkte gepflegt</span>
                : localPlaceIssues.map((issue) => <span key={issue}>{issue}</span>)}
            </div>
          </div>
        </section>

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Freigabe</p>
          <div className="admin-form-grid">
            <label>
              Name
              <input
                onChange={(event) => onChange("name", event.target.value)}
                value={String(draft.name || "")}
              />
            </label>
            <label>
              Kategorie
              <select
                onChange={(event) => onChange("category", event.target.value)}
                value={String(draft.category || "food")}
              >
                {localPlaceCategories.map((category) => (
                  <option key={category} value={category}>
                    {localPlaceCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                onChange={(event) => onChange("status", event.target.value)}
                value={String(draft.status || "candidate")}
              >
                {localPlaceStatuses.map((status) => (
                  <option key={status} value={status}>
                    {localPlaceStatusLabel(status)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Kuratierungsart
              <select
                onChange={(event) => onChange("curation_kind", event.target.value)}
                value={String(draft.curation_kind || (String(draft.category || "") === "event" ? "local_event" : "local_tip"))}
              >
                {localPlaceCurationKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {localPlaceCurationKindLabel(kind)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Bewertung
              <input
                inputMode="decimal"
                onChange={(event) => onChange("rating", event.target.value)}
                placeholder="z. B. 4.6"
                value={String(draft.rating || "")}
              />
            </label>
            <label>
              Passt zu Auszeiten
              <textarea
                onChange={(event) => onChange("package_fit", event.target.value)}
                placeholder="families oder couples, je Zeile ein Wert. Leer = für alle."
                rows={3}
                value={String(draft.package_fit || "")}
              />
            </label>
          </div>
        </section>

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Karte und Kontakt</p>
          <div className="admin-form-grid">
            <label>
              Adresse
              <input
                onChange={(event) => onChange("address", event.target.value)}
                value={String(draft.address || "")}
              />
            </label>
            <label>
              Latitude
              <input
                inputMode="decimal"
                onChange={(event) => onChange("lat", event.target.value)}
                value={String(draft.lat || "")}
              />
            </label>
            <label>
              Longitude
              <input
                inputMode="decimal"
                onChange={(event) => onChange("lng", event.target.value)}
                value={String(draft.lng || "")}
              />
            </label>
            <label>
              Website
              <input
                onChange={(event) => onChange("website", event.target.value)}
                placeholder="https://..."
                value={String(draft.website || "")}
              />
            </label>
            <label>
              Reservierungslink
              <input
                onChange={(event) => onChange("reservation_url", event.target.value)}
                placeholder="https://..."
                value={String(draft.reservation_url || "")}
              />
            </label>
            <label>
              Speisekarte / Programm
              <input
                onChange={(event) => onChange("menu_url", event.target.value)}
                placeholder="https://..."
                value={String(draft.menu_url || "")}
              />
            </label>
            <label>
              Öffnungszeiten / Hinweis
              <input
                onChange={(event) => onChange("opening_hours", event.target.value)}
                placeholder="z. B. täglich ab 12 Uhr, saisonal prüfen"
                value={String(draft.opening_hours || "")}
              />
            </label>
            <label>
              Veranstaltungsdatum
              <input
                onChange={(event) => onChange("event_date", event.target.value)}
                placeholder="z. B. 12.08.2026 oder saisonal"
                value={String(draft.event_date || "")}
              />
            </label>
            <label>
              Veranstaltungszeit
              <input
                onChange={(event) => onChange("event_time", event.target.value)}
                placeholder="z. B. 18:00 Uhr"
                value={String(draft.event_time || "")}
              />
            </label>
            {String(draft.category || "") === "event" ? (
              <>
                <label>
                  Zielgruppe
                  <select
                    onChange={(event) => onChange("event_audience", event.target.value)}
                    value={String(draft.event_audience || "")}
                  >
                    <option value="">Offen</option>
                    <option value="families">Familien</option>
                    <option value="couples">Paare</option>
                    <option value="both">Familien und Paare</option>
                  </select>
                </label>
                <label>
                  Indoor / Outdoor
                  <select
                    onChange={(event) => onChange("event_setting", event.target.value)}
                    value={String(draft.event_setting || "")}
                  >
                    <option value="">Offen</option>
                    <option value="indoor">Indoor</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="both">Beides möglich</option>
                  </select>
                </label>
                <label>
                  Morrow-Fit
                  <textarea
                    onChange={(event) => onChange("event_fit_note", event.target.value)}
                    placeholder="Warum passt dieses Event wirklich zur Auszeit?"
                    rows={3}
                    value={String(draft.event_fit_note || "")}
                  />
                </label>
              </>
            ) : null}
          </div>
        </section>

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Gastansicht</p>
          <div className="admin-form-grid">
            <label>
              Beschreibung
              <textarea
                onChange={(event) => onChange("description", event.target.value)}
                placeholder="Kurz, hilfreich und passend zur Auszeit."
                rows={4}
                value={String(draft.description || "")}
              />
            </label>
            <label>
              Küche / Typ
              <input
                onChange={(event) => onChange("cuisine", event.target.value)}
                placeholder="z. B. Fisch, Pfahlbau, Familienfreundlich"
                value={String(draft.cuisine || "")}
              />
            </label>
            <label>
              Passt gut für
              <textarea
                onChange={(event) => onChange("best_for", event.target.value)}
                placeholder="Ein Punkt pro Zeile"
                rows={4}
                value={String(draft.best_for || "")}
              />
            </label>
            <label>
              Bilder
              <textarea
                onChange={(event) => onChange("images", event.target.value)}
                placeholder="Ein Bildpfad oder eine URL pro Zeile"
                rows={5}
                value={String(draft.images || "")}
              />
            </label>
          </div>
        </section>

        <section className="admin-drawer-section">
          <button className="admin-button" disabled={pending} onClick={onSave} type="button">
            {pending ? "Speichern" : "Speichern"}
          </button>
          {message ? <p className="admin-drawer-message">{message}</p> : null}
        </section>
      </aside>
    </div>
  );
}

function AdminPackageDateDrawer({
  date,
  draft,
  isCreating,
  message,
  onChange,
  onClose,
  onSave,
  packages,
  pending,
}: {
  date: PackageDateRow | null;
  draft: DateDraft;
  isCreating: boolean;
  message: string | null;
  onChange: (key: string, value: string) => void;
  onClose: () => void;
  onSave: () => void;
  packages: SimpleRow[];
  pending: boolean;
}) {
  if (!date && !isCreating) return null;

  return (
    <div className="admin-drawer-layer" role="presentation">
      <button className="admin-drawer-backdrop" onClick={onClose} type="button" />
      <aside className="admin-drawer" aria-label="Termin bearbeiten">
        <header>
          <div>
            <p className="admin-eyebrow">Termin</p>
            <h2>{isCreating ? "Neuer Termin" : date?.label}</h2>
            <span>{isCreating ? "wird nach dem Speichern angelegt" : date?.id}</span>
          </div>
          <button aria-label="Bearbeitung schließen" onClick={onClose} type="button">
            Schließen
          </button>
        </header>

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Zeitraum</p>
          <div className="admin-form-grid">
            <label>
              Label
              <input
                onChange={(event) => onChange("label", event.target.value)}
                value={String(draft.label || "")}
              />
            </label>
            <label>
              Auszeit
              <select
                onChange={(event) => onChange("package_id", event.target.value)}
                value={String(draft.package_id || "")}
              >
                {packages.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name || item.id}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Start
              <input
                onChange={(event) => onChange("starts_on", event.target.value)}
                type="date"
                value={String(draft.starts_on || "")}
              />
            </label>
            <label>
              Ende
              <input
                onChange={(event) => onChange("ends_on", event.target.value)}
                type="date"
                value={String(draft.ends_on || "")}
              />
            </label>
          </div>
        </section>

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Verfügbarkeit</p>
          <div className="admin-form-grid">
            <label>
              Kapazität
              <input
                inputMode="numeric"
                onChange={(event) => onChange("capacity", event.target.value)}
                value={String(draft.capacity || "")}
              />
            </label>
            <label>
              Status
              <select
                onChange={(event) => onChange("status", event.target.value)}
                value={String(draft.status || "available")}
              >
                {packageDateStatuses.map((status) => (
                  <option key={status} value={status}>
                    {packageDateStatusLabel(status)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Interne Notiz
              <textarea
                onChange={(event) => onChange("note", event.target.value)}
                rows={4}
                value={String(draft.note || "")}
              />
            </label>
          </div>
        </section>

        <section className="admin-drawer-section">
          <button className="admin-button" disabled={pending} onClick={onSave} type="button">
            {pending ? "Speichern" : "Speichern"}
          </button>
          {message ? <p className="admin-drawer-message">{message}</p> : null}
        </section>
      </aside>
    </div>
  );
}
