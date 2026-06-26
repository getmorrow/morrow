"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@morrow/supabase";

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
  created_at: string;
  payload: Record<string, unknown>;
};

type BookingRow = {
  id: string;
  lead_id?: string | null;
  customer_id?: string | null;
  status: string;
  payment_status: string;
  created_at: string;
  payload: Record<string, unknown>;
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

type SupportRow = {
  id: string;
  lead_id: string | null;
  category: string;
  message: string;
  status: string;
  urgency: string | null;
  created_at: string;
  payload: Record<string, unknown>;
};

type ExperienceProviderRow = {
  id: string;
  name: string;
  location: string | null;
  category: string | null;
  status: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  payload: Record<string, unknown>;
};

type ExperienceBlockRow = {
  id: string;
  package_id: string | null;
  provider_id: string | null;
  title: string;
  role: string;
  included_in_price: boolean;
  confirmation_status: string;
  payload: Record<string, unknown>;
  created_at: string;
};

type LocalPlaceRow = {
  id: string;
  name: string;
  category: string;
  status: string;
  lat: number | null;
  lng: number | null;
  address: string | null;
  website: string | null;
  reservation_url: string | null;
  menu_url: string | null;
  rating: number | null;
  opening_hours?: Record<string, unknown> | null;
  package_fit?: string[];
  payload: Record<string, unknown>;
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

type CommunicationEventRow = {
  id: string;
  lead_id: string | null;
  booking_id: string | null;
  channel: string;
  direction: string;
  event_type: string;
  subject: string | null;
  body: string | null;
  actor: string | null;
  status: string;
  created_at: string;
};

type GuestFeedbackRow = {
  id: string;
  lead_id: string | null;
  booking_id: string | null;
  rating: number | null;
  return_interest: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

type AuditLogRow = {
  id: string;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_label: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

type DashboardData = {
  profile: AdminProfile;
  leads: LeadRow[];
  bookings: BookingRow[];
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
const localPlaceCategories = [
  "food",
  "beach",
  "experience",
  "event",
  "shopping",
  "emergency",
] as const;
const packageDateStatuses = ["available", "reserved", "sold_out", "paused"] as const;
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

function paymentDraftFromBooking(booking: BookingRow | null): PaymentDraft {
  const payload = booking?.payload ?? {};

  return {
    payment_status: booking?.payment_status || getPayloadText(payload, ["paymentStatus"]) || "offen",
    payment_amount: getPayloadText(payload, ["paymentAmount", "amountPaid", "price"]) || "",
    payment_date: getPayloadText(payload, ["paymentDate", "paidAt"]) || "",
    payment_method: getPayloadText(payload, ["paymentMethod"]) || "",
    payment_reference: getPayloadText(payload, ["paymentReference", "invoiceNumber", "transactionId"]) || "",
    payment_proof_url: getPayloadText(payload, ["paymentProofUrl", "receiptUrl", "invoiceUrl"]) || "",
  };
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

function numberOrNull(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
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
    booking_payment_documented: "Zahlung dokumentiert",
    booking_status_updated: "Buchungsstatus geändert",
    date_created: "Termin angelegt",
    date_updated: "Termin geändert",
    drawer_note_saved: "Interne Notiz gespeichert",
    internal_note_updated: "Interne Notiz gespeichert",
    experience_created: "Erlebnis angelegt",
    experience_updated: "Erlebnis geändert",
    lead_reserved: "Reservierung angelegt",
    lead_status_updated: "Anfragestatus geändert",
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
    task_status_updated: "Aufgabe aktualisiert",
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

function getLocalPlaceSummary(place: LocalPlaceRow) {
  return getPayloadText(place.payload, ["description", "guestDescription", "morrowNote", "routeNote"]) ||
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
  return leads.filter((lead) => !["Bezahlt", "Abgeschlossen", "Kein Interesse"].includes(lead.status));
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
    getPayloadText(booking.payload, ["packageName", "stayName", "guestName", "customerName"]) ||
    booking.status
  );
}

function getSupportLabel(support: SupportRow) {
  return (
    getPayloadText(support.payload, ["subject", "title", "supportName", "categoryLabel"]) ||
    support.category ||
    "Supportfall"
  );
}

function getSupportContactLabel(support: SupportRow) {
  return (
    getPayloadText(support.payload, ["guestName", "customerName", "name", "leadName"]) ||
    getPayloadText(support.payload, ["email", "phone"]) ||
    "Gast"
  );
}

function getSupportRelationId(support: SupportRow, kind: "lead" | "booking") {
  const keys = kind === "lead" ? ["leadId", "lead_id"] : ["bookingId", "booking_id"];
  return getPayloadText(support.payload, keys) || (kind === "lead" ? support.lead_id : null);
}

function getFeedbackText(feedback: GuestFeedbackRow) {
  return (
    getPayloadText(feedback.payload, ["loved", "message", "feedback", "text", "note"]) ||
    "Kein Freitext hinterlegt."
  );
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
    if (!getPayloadText(propertyPayload, ["address"]) || !getPayloadText(propertyPayload, ["checkInInstructions"])) {
      items.push({
        id: `property-checkin-${item.id}`,
        label: "Check-in",
        title: item.name || item.id,
        description: "Adresse und Check-in-Hinweise fehlen oder sind unvollständig.",
        severity: "high",
      });
    }
    if (splitLines(getPayloadLines(propertyPayload, ["houseRules"])).length < 2) {
      items.push({
        id: `property-rules-${item.id}`,
        label: "Regeln",
        title: item.name || item.id,
        description: "Mindestens zwei Unterkunftsregeln pflegen.",
        severity: "medium",
      });
    }
    if (splitLines(getPayloadLines(propertyPayload, ["amenities", "features"])).length < 3) {
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
          leadsResult,
          bookingsResult,
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
          feedbackResult,
          auditResult,
        ] =
          await Promise.all([
            supabase
              .from("leads")
              .select("id,type,status,name,email,phone,package_slug,created_at,payload")
              .order("created_at", { ascending: false })
              .limit(30),
            supabase
              .from("bookings")
              .select("id,lead_id,customer_id,status,payment_status,created_at,payload")
              .order("created_at", { ascending: false })
              .limit(30),
            supabase
              .from("packages")
              .select("id,name,slug,audience,location,status,property_id,price_from,concrete_price,payload")
              .order("name"),
            supabase
              .from("properties")
              .select("id,name,location,sleeps,bedrooms,bathrooms,check_in_type,support_type,support_name,image_rights_confirmed,status,payload")
              .order("name"),
            supabase
              .from("admin_tasks")
              .select("id,title,reference_type,reference_id,reference_label,due_at,status,priority,note,payload,created_at")
              .order("due_at", { ascending: true, nullsFirst: false })
              .order("created_at", { ascending: false })
              .limit(40),
            supabase
              .from("support_messages")
              .select("id,lead_id,category,message,status,urgency,created_at,payload")
              .order("created_at", { ascending: false })
              .limit(20),
            supabase
              .from("experience_providers")
              .select("id,name,location,category,status,website,email,phone,payload")
              .order("name"),
            supabase
              .from("experience_blocks")
              .select("id,package_id,provider_id,title,role,included_in_price,confirmation_status,payload,created_at")
              .order("created_at", { ascending: false }),
            supabase
              .from("local_places")
              .select("id,name,category,status,lat,lng,address,website,reservation_url,menu_url,rating,opening_hours,package_fit,payload,created_at")
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
          leadsResult.error ||
          bookingsResult.error ||
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
            leads: (leadsResult.data ?? []) as LeadRow[],
            bookings: (bookingsResult.data ?? []) as BookingRow[],
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
  const [selection, setSelection] = useState<DetailSelection>(null);
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
  const [ownerMessage, setOwnerMessage] = useState<string | null>(null);
  const [communicationEvents, setCommunicationEvents] = useState<CommunicationEventRow[]>([]);
  const [drawerAuditLogs, setDrawerAuditLogs] = useState<AuditLogRow[]>([]);
  const [drawerNote, setDrawerNote] = useState("");
  const [outboundDraft, setOutboundDraft] = useState<OutboundDraft>({ subject: "", body: "" });
  const [paymentDraft, setPaymentDraft] = useState<PaymentDraft>(paymentDraftFromBooking(null));
  const [drawerMessage, setDrawerMessage] = useState<string | null>(null);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const data = dataState;
  const openLeads = useMemo(() => getOpenLeads(data.leads), [data.leads]);
  const paidBookings = data.bookings.filter((booking) => booking.payment_status === "bezahlt");
  const openSupport = data.supportMessages.filter((message) => message.status !== "closed");
  const activeTasks = data.tasks.filter((task) => task.status !== "done");
  const dueTasks = activeTasks.filter((task) => task.due_at && task.due_at <= todayIsoDate());
  const approvedLocalPlaces = data.localPlaces.filter((place) => place.status === "approved");
  const candidateLocalPlaces = data.localPlaces.filter((place) => place.status === "candidate");
  const monitoring = monitoringItems(data);
  const averageRating = averageFeedbackRating(data.guestFeedback);
  const lowFeedback = data.guestFeedback.filter((feedback) => typeof feedback.rating === "number" && feedback.rating <= 3);
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
        description: getPayloadText(item.payload ?? {}, ["description"]) || "",
        owner_name: getPayloadText(item.payload ?? {}, ["ownerName"]) || "",
        owner_email: getPayloadText(item.payload ?? {}, ["email", "ownerEmail"]) || "",
        owner_phone: getPayloadText(item.payload ?? {}, ["phone", "ownerPhone"]) || "",
        property_type: getPayloadText(item.payload ?? {}, ["propertyType"]) || "",
        current_rental: getPayloadText(item.payload ?? {}, ["currentRental"]) || "agency",
        check_in_type: item.check_in_type || "",
        support_type: item.support_type || "",
        support_name: item.support_name || "",
        address: getPayloadText(item.payload ?? {}, ["address"]) || "",
        earliest_arrival: getPayloadText(item.payload ?? {}, ["earliestArrival"]) || "",
        latest_arrival: getPayloadText(item.payload ?? {}, ["latestArrival"]) || "",
        check_out_time: getPayloadText(item.payload ?? {}, ["checkOutTime"]) || "",
        key_safe_code: getPayloadText(item.payload ?? {}, ["keySafeCode"]) || "",
        check_in_instructions: getPayloadText(item.payload ?? {}, ["checkInInstructions"]) || "",
        amenities: getPayloadLines(item.payload ?? {}, ["amenities", "features"]),
        attributes: getPayloadStringArray(item.payload ?? {}, ["attributes"]),
        experience_worlds: getPayloadStringArray(item.payload ?? {}, ["experienceWorlds"]),
        house_rules: getPayloadLines(item.payload ?? {}, ["houseRules"]),
        media: getPayloadLines(item.payload ?? {}, ["media"]),
        media_alt_texts: getPayloadLines(item.payload ?? {}, ["mediaAltTexts"]),
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
      guest_note: getPayloadText(item.payload, ["guestNote", "guestNotes", "description"]) || "",
      price_note: getPayloadText(item.payload, ["priceNote", "price", "cost"]) || "",
      capacity_note: getPayloadText(item.payload, ["capacityNote", "capacity"]) || "",
      availability_note: getPayloadText(item.payload, ["availabilityNote", "availability"]) || "",
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
      description: getPayloadText(item.payload, ["description", "guestDescription", "morrowNote", "routeNote"]) || "",
      cuisine: getPayloadText(item.payload, ["cuisine"]) || "",
      best_for: getPayloadLines(item.payload, ["bestFor", "audiences"]),
      images: getPayloadLines(item.payload, ["images"]),
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
      setPaymentDraft(paymentDraftFromBooking(null));
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
    setDrawerMessage(null);

    let isMounted = true;
    const activeSelection = selection;

    async function loadEvents() {
      setIsDrawerLoading(true);
      try {
        const supabase = createSupabaseBrowserClient();
        const query = supabase
          .from("communication_events")
          .select("id,lead_id,booking_id,channel,direction,event_type,subject,body,actor,status,created_at")
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
                  : await query.eq("event_type", `support:${activeSelection.id}`);

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
    payload: Record<string, unknown>;
  }) {
    const supabase = createSupabaseBrowserClient();
    const { data: inserted } = await supabase.from("admin_audit_logs").insert({
      actor_email: data.profile.email,
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_label: entityLabel,
      payload,
    }).select("id,actor_email,action,entity_type,entity_id,entity_label,payload,created_at").single();

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
        status: "Reserviert",
        paymentStatus: "offen",
        createdAt: now,
        updatedAt: now,
      };

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
        package_id: packageItem?.id ?? lead.package_slug,
        status: "Reserviert",
        payment_status: "offen",
        payload: bookingPayload,
        updated_at: now,
      });

      if (bookingResult.error) throw bookingResult.error;

      setDataState((current) => {
        const bookingRow: BookingRow = {
          id: lead.id,
          lead_id: lead.id,
          customer_id: null,
          status: "Reserviert",
          payment_status: "offen",
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
      const payload = {
        ...booking.payload,
        status,
        paymentStatus,
        updatedAt: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("bookings")
        .update({
          status,
          payment_status: paymentStatus,
          payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        bookings: current.bookings.map((item) =>
          item.id === booking.id
            ? { ...item, status, payment_status: paymentStatus, payload }
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
      const paymentPayload = {
        paymentStatus,
        paymentAmount: paymentDraft.payment_amount.trim(),
        paymentDate: paymentDraft.payment_date.trim(),
        paymentMethod: paymentDraft.payment_method.trim(),
        paymentReference: paymentDraft.payment_reference.trim(),
        paymentProofUrl: paymentDraft.payment_proof_url.trim(),
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
          payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedBooking.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        bookings: current.bookings.map((booking) =>
          booking.id === selectedBooking.id
            ? { ...booking, payment_status: paymentStatus, payload }
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
          paymentAmount: paymentPayload.paymentAmount,
          paymentDate: paymentPayload.paymentDate,
          paymentMethod: paymentPayload.paymentMethod,
          paymentReference: paymentPayload.paymentReference,
        },
      });

      setDrawerMessage("Zahlungsdaten gespeichert.");
    } catch {
      setDrawerMessage("Zahlungsdaten konnten nicht gespeichert werden.");
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
          channel: "note",
          direction: "internal",
          event_type: "note",
          subject: isLead || isBooking ? "Interne Notiz" : "Interne Support-Notiz",
          body: drawerNote || "Notiz aktualisiert.",
          actor: data.profile.email,
          status: "recorded",
          payload: {
            source: "next-admin",
            entityType: selection.type,
            entityId: selection.id,
          },
        })
        .select("id,lead_id,booking_id,channel,direction,event_type,subject,body,actor,status,created_at")
        .single();

      if (eventResult.error) throw eventResult.error;

      setDataState((current) => ({
        ...current,
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
            .select("id,name,location,sleeps,bedrooms,bathrooms,check_in_type,support_type,support_name,image_rights_confirmed,status,payload")
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

      const payload = {
        guestNote: String(experienceDraft.guest_note || "").trim(),
        priceNote: String(experienceDraft.price_note || "").trim(),
        capacityNote: String(experienceDraft.capacity_note || "").trim(),
        availabilityNote: String(experienceDraft.availability_note || "").trim(),
        updatedAt: now,
      };
      const updatePayload = {
        title,
        package_id: String(experienceDraft.package_id || "").trim() || null,
        provider_id: String(experienceDraft.provider_id || "").trim() || null,
        role: String(experienceDraft.role || "planned").trim(),
        included_in_price: Boolean(experienceDraft.included_in_price),
        confirmation_status: String(experienceDraft.confirmation_status || "planned").trim(),
        payload,
        updated_at: now,
      };

      if (experienceSelection.mode === "create") {
        const { data: inserted, error } = await supabase
          .from("experience_blocks")
          .insert(updatePayload)
          .select("id,package_id,provider_id,title,role,included_in_price,confirmation_status,payload,created_at")
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
      const payload = {
        description: String(localPlaceDraft.description || "").trim(),
        cuisine: String(localPlaceDraft.cuisine || "").trim(),
        openingHours: String(localPlaceDraft.opening_hours || "").trim(),
        packageFit: splitLines(String(localPlaceDraft.package_fit || "")),
        bestFor: splitLines(String(localPlaceDraft.best_for || "")),
        images: splitLines(String(localPlaceDraft.images || "")),
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
          .select("id,name,category,status,lat,lng,address,website,reservation_url,menu_url,rating,opening_hours,package_fit,payload,created_at")
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
          <a href="#anfragen">Anfragen</a>
          <a href="#buchungen">Buchungen</a>
          <a href="#aufgaben">Aufgaben</a>
          <a href="#support">Support</a>
          <a href="#feedback">Feedback</a>
          <a href="#audit">Änderungen</a>
          <a href="#vor-ort">Vor Ort</a>
          <a href="#erlebnisse">Erlebnisse</a>
          <a href="#termine">Termine</a>
          <a href="#bestand">Bestand</a>
          <a href="#eigentuemer">Eigentümer</a>
          <button onClick={onLogout} type="button">
            Abmelden
          </button>
        </nav>
      </header>

      <section className="admin-hero">
        <p className="admin-eyebrow">Morrow Admin</p>
        <h1>Guten Überblick, {displayName}.</h1>
        <p>
          Diese Next-Version bildet den neuen operativen Kern ab: erst lesen,
          dann Schritt für Schritt die geprüften Prototyp-Funktionen migrieren.
        </p>
        {actionMessage ? <p className="admin-action-message">{actionMessage}</p> : null}
      </section>

      <section className="admin-metrics" aria-label="Kennzahlen">
        <article>
          <span>Offene Anfragen</span>
          <strong>{openLeads.length}</strong>
          <p>{data.leads.length} insgesamt geladen</p>
        </article>
        <article>
          <span>Buchungen</span>
          <strong>{data.bookings.length}</strong>
          <p>{paidBookings.length} bezahlt markiert</p>
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

      <section className="admin-grid" id="aufgaben">
        <article className="admin-card">
          <p className="admin-eyebrow">Aufgaben</p>
          <h2>Heute im Blick</h2>
          <div className="admin-list">
            {(dueTasks.length ? dueTasks : activeTasks.slice(0, 6)).map((task) => (
              <article className="admin-list-item" key={task.id}>
                <div>
                  <small>
                    {taskTimingLabel(task)} · {taskPriorityLabel(task.priority)}
                  </small>
                  <strong>{task.title}</strong>
                  <em>
                    {taskReferenceLabel(task.reference_type)} · {task.reference_label || task.reference_id}
                  </em>
                </div>
                <div className="admin-row-actions">
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
                </div>
              </article>
            ))}
            {activeTasks.length === 0 ? (
              <p className="admin-drawer-message">Keine offenen Aufgaben vorhanden.</p>
            ) : null}
          </div>
        </article>

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
      </section>

      <section className="admin-grid" id="anfragen">
        <article className="admin-card">
          <p className="admin-eyebrow">Anfragen</p>
          <h2>Neueste Kontakte</h2>
          <div className="admin-list">
            {data.leads.slice(0, 8).map((lead) => (
              <article className="admin-list-item" key={lead.id}>
                <div>
                  <small>{formatDate(lead.created_at)}</small>
                  <strong>{getLeadLabel(lead)}</strong>
                  <em>{lead.status}</em>
                </div>
                <div className="admin-row-actions">
                  <button onClick={() => setSelection({ type: "lead", id: lead.id })} type="button">
                    Details
                  </button>
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
                  {lead.type === "guest" ? (
                    <button
                      disabled={pendingAction === `lead-${lead.id}-reserve`}
                      onClick={() => reserveLead(lead)}
                      type="button"
                    >
                      Reservieren
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
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

      <section className="admin-grid" id="support">
        <article className="admin-card admin-card-wide">
          <p className="admin-eyebrow">Gästesupport</p>
          <h2>Nachrichten aus dem Gästebereich</h2>
          <p>
            Hier landen Fragen und Probleme aus der Gäste-App. Jeder Fall bleibt mit
            der passenden Buchung oder Anfrage verbunden.
          </p>
          <div className="admin-list">
            {data.supportMessages.length ? (
              data.supportMessages.slice(0, 10).map((support) => (
                <article className="admin-list-item" key={support.id}>
                  <div>
                    <small>
                      {formatDate(support.created_at)} · {supportUrgencyLabel(support.urgency)}
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
              <p className="admin-drawer-message">Noch keine Supportnachrichten vorhanden.</p>
            )}
          </div>
        </article>
      </section>

      <section className="admin-grid" id="feedback">
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

      <section className="admin-grid" id="vor-ort">
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

      <section className="admin-grid" id="erlebnisse">
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

      <section className="admin-grid" id="termine">
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

      <section className="admin-grid" id="bestand">
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

      <section className="admin-grid" id="eigentuemer">
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
      </section>
      <AdminDetailDrawer
        auditLogs={drawerAuditLogs}
        booking={selectedBooking}
        communicationEvents={communicationEvents}
        canSendEmail={Boolean(selection && selectedDrawerEmail)}
        isLoading={isDrawerLoading}
        message={drawerMessage}
        note={drawerNote}
        lead={selectedLead}
        onClose={() => setSelection(null)}
        onOutboundChange={(key, value) => setOutboundDraft((current) => ({ ...current, [key]: value }))}
        onNoteChange={setDrawerNote}
        onPaymentChange={(key, value) => setPaymentDraft((current) => ({ ...current, [key]: value }))}
        onSaveNote={saveDrawerNote}
        onSavePayment={savePaymentInfo}
        onSendEmail={sendDrawerEmail}
        outboundDraft={outboundDraft}
        paymentDraft={paymentDraft}
        paymentPending={pendingAction === `booking-payment-${selectedBooking?.id}`}
        pending={Boolean(pendingAction?.startsWith("drawer-note"))}
        sendPending={Boolean(pendingAction?.startsWith("drawer-email"))}
        support={selectedSupport}
      />
      <AdminInventoryDrawer
        draft={inventoryDraft}
        inventoryType={inventorySelection?.type ?? null}
        isCreating={inventorySelection?.mode === "create"}
        message={inventoryMessage}
        onChange={(key, value) => setInventoryDraft((current) => ({ ...current, [key]: value }))}
        onClose={() => setInventorySelection(null)}
        onSave={saveInventory}
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

function AdminDetailDrawer({
  auditLogs,
  booking,
  canSendEmail,
  communicationEvents,
  isLoading,
  lead,
  message,
  note,
  onClose,
  onOutboundChange,
  onNoteChange,
  onPaymentChange,
  onSaveNote,
  onSavePayment,
  onSendEmail,
  outboundDraft,
  paymentDraft,
  paymentPending,
  pending,
  sendPending,
  support,
}: {
  auditLogs: AuditLogRow[];
  booking: BookingRow | null;
  canSendEmail: boolean;
  communicationEvents: CommunicationEventRow[];
  isLoading: boolean;
  lead: LeadRow | null;
  message: string | null;
  note: string;
  onClose: () => void;
  onOutboundChange: (key: keyof OutboundDraft, value: string) => void;
  onNoteChange: (value: string) => void;
  onPaymentChange: (key: keyof PaymentDraft, value: string) => void;
  onSaveNote: () => void;
  onSavePayment: () => void;
  onSendEmail: () => void;
  outboundDraft: OutboundDraft;
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
  const supportCategory = support?.category || getPayloadText(payload, ["category", "categoryLabel"]);

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
        </section>

        {supportMessage ? (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">Nachricht</p>
            <article className="admin-drawer-note-card">
              <p>{supportMessage}</p>
            </article>
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
