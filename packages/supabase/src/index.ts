import { createClient } from "@supabase/supabase-js";

export type JsonRecord = Record<string, unknown>;

export type LocalPlaceCategory =
  | "beach"
  | "emergency"
  | "event"
  | "experience"
  | "food"
  | "shopping"
  | "tide"
  | "weather"
  | string;

export type LocalPlaceStatus = "candidate" | "approved" | "paused" | "hidden" | string;

export type LocalPlaceRowBase = {
  id: string;
  name: string;
  category: LocalPlaceCategory;
  status: LocalPlaceStatus;
  lat: number | null;
  lng: number | null;
  address: string | null;
  website: string | null;
  reservation_url: string | null;
  menu_url: string | null;
  rating: number | null;
  opening_hours?: JsonRecord | null;
  package_fit?: string[];
  description?: string | null;
  cuisine?: string | null;
  curation_kind?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  event_audience?: string | null;
  event_setting?: string | null;
  event_fit_note?: string | null;
  best_for?: string[];
  audiences?: string[];
  images?: string[];
  payload: JsonRecord;
};

export const localPlaceBaseSelectColumns =
  "id,name,category,status,lat,lng,address,website,reservation_url,menu_url,rating,opening_hours,package_fit,description,cuisine,curation_kind,event_date,event_time,event_audience,event_setting,event_fit_note,best_for,audiences,images,payload" as const;

export const localPlaceAdminSelectColumns =
  `${localPlaceBaseSelectColumns},created_at` as const;

export const adminAuditLogSelectColumns =
  "id,actor_email,action,entity_type,entity_id,entity_label,payload,created_at" as const;

export const experienceBlockSelectColumns =
  "id,package_id,provider_id,title,role,included_in_price,confirmation_status,guest_note,price_note,capacity_note,availability_note,quality_score,quality_note,payload,created_at" as const;

export type ExperienceBlockRowBase = {
  id: string;
  package_id: string | null;
  provider_id: string | null;
  title: string;
  role: string;
  included_in_price: boolean;
  confirmation_status: string;
  guest_note?: string | null;
  price_note?: string | null;
  capacity_note?: string | null;
  availability_note?: string | null;
  quality_score?: number | null;
  quality_note?: string | null;
  payload: JsonRecord;
  created_at: string;
};

export type AdminAuditLogRow = {
  id: string;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_label: string | null;
  payload: JsonRecord;
  created_at: string;
};

export type AdminAuditLogInput = {
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string;
  entityLabel: string | null;
  payload: JsonRecord;
};

export type OwnerDashboardProperty = {
  id: string;
  name: string;
  location: string;
  sleeps: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  checkInType: string | null;
  supportType: string | null;
  supportName: string | null;
  status: string;
  description?: string | null;
  ownerName?: string | null;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  propertyType?: string | null;
  currentRental?: string | null;
  address?: string | null;
  earliestArrival?: string | null;
  latestArrival?: string | null;
  checkOutTime?: string | null;
  keySafeCode?: string | null;
  checkInInstructions?: string | null;
  amenities?: string[];
  attributes?: string[];
  experienceWorlds?: string[];
  houseRules?: string[];
  media?: string[];
  mediaAltTexts?: string[];
  cleaningStatus?: string | null;
  maintenanceStatus?: string | null;
  lastCheck?: string | null;
  payload: JsonRecord;
  accessRole: string;
  canViewFinancials: boolean;
  canViewOperations: boolean;
};

export type OwnerDashboardPackage = {
  id: string;
  slug: string;
  name: string;
  audience: string;
  location: string;
  status: string;
  propertyId: string | null;
  priceFrom: string | null;
  concretePrice: string | null;
};

export type OwnerDashboardBooking = {
  id: string;
  status: string;
  paymentStatus: string;
  packageId: string | null;
  packageName: string | null;
  propertyId: string | null;
  propertyName: string | null;
  dateLabel: string | null;
  startsOn: string | null;
  endsOn: string | null;
  paymentAmount?: string | null;
  payload: JsonRecord;
};

export type OwnerDashboardDate = {
  id: string;
  packageId: string;
  packageName: string;
  propertyId: string | null;
  label: string;
  startsOn: string | null;
  endsOn: string | null;
  capacity: number | null;
  status: string;
  payload: JsonRecord;
};

export type OwnerDashboardDocument = {
  id: string;
  propertyId: string;
  propertyName: string | null;
  title: string;
  documentType: string;
  status: string;
  url: string;
  periodLabel: string | null;
  payload: JsonRecord;
  createdAt: string;
};

export type OwnerDashboardMessage = {
  id: string;
  category: string;
  status: string;
  urgency: string | null;
  message: string;
  propertyId: string | null;
  propertyName: string | null;
  subject: string | null;
  requestedStartsOn: string | null;
  requestedEndsOn: string | null;
  payload: JsonRecord;
  createdAt: string;
  updatedAt: string | null;
};

export type OwnerDashboardStatement = {
  id: string;
  propertyId: string;
  propertyName: string | null;
  periodLabel: string;
  periodStart: string | null;
  periodEnd: string | null;
  status: string;
  currency: string;
  grossRevenue: number;
  morrowFee: number;
  otherCosts: number;
  ownerPayout: number;
  documentUrl: string | null;
  paidAt: string | null;
  payload: JsonRecord;
  createdAt: string;
  updatedAt: string | null;
};

export type OwnerOperation = {
  id: string;
  propertyId: string;
  propertyName: string | null;
  title: string;
  operationType: string;
  status: string;
  visibility: string;
  scheduledFor: string | null;
  completedAt: string | null;
  note: string | null;
  payload: JsonRecord;
  createdAt: string;
  updatedAt: string | null;
};

export type OwnerCommunicationEvent = {
  id: string;
  supportId: string | null;
  channel: string;
  direction: string;
  eventType: string;
  subject: string | null;
  body: string | null;
  actor: string | null;
  status: string;
  createdAt: string;
};

export type OwnerSupportStatusEvent = {
  id: string;
  supportId: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  actor: string | null;
  payload: JsonRecord;
  createdAt: string;
};

export type OwnerDashboardData = {
  profile: {
    id: string;
    email: string;
    displayName: string | null;
    phone: string | null;
    status: string;
  };
  properties: OwnerDashboardProperty[];
  packages: OwnerDashboardPackage[];
  dates: OwnerDashboardDate[];
  bookings: OwnerDashboardBooking[];
  documents?: OwnerDashboardDocument[];
  messages?: OwnerDashboardMessage[];
  statements?: OwnerDashboardStatement[];
  operations?: OwnerOperation[];
  communicationEvents?: OwnerCommunicationEvent[];
  supportStatusEvents?: OwnerSupportStatusEvent[];
};

export function createSupabaseBrowserClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing public Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function insertAdminAuditLog(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  input: AdminAuditLogInput,
) {
  const { data, error } = await supabase
    .from("admin_audit_logs")
    .insert({
      actor_email: input.actorEmail,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      entity_label: input.entityLabel,
      payload: input.payload,
    })
    .select(adminAuditLogSelectColumns)
    .single();

  if (error) throw error;
  return data as AdminAuditLogRow | null;
}
