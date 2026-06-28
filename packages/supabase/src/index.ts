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

export const supportMessageSelectColumns =
  "id,lead_id,booking_id,owner_profile_id,property_id,category,message,status,urgency,source,subject,contact_name,contact_email,contact_phone,property_name,package_name,requested_starts_on,requested_ends_on,requested_date_range_label,payload,created_at,updated_at" as const;

export const experienceProviderSelectColumns =
  "id,name,location,category,status,website,email,phone,contact_name,audience_fit,collaboration_note,pricing_note,availability_note,notes,payload" as const;

export const communicationEventSelectColumns =
  "id,lead_id,booking_id,customer_id,support_id,channel,direction,event_type,subject,body,recipient,actor,status,provider,provider_message_id,template_key,source,payload,created_at" as const;

export const agencySelectColumns =
  "id,name,contact_name,email,phone,location,status,managed_property_ids,response_due_days,available_dates_note,next_follow_up_at,notes,payload,created_at" as const;

export const ownerDocumentSelectColumns =
  "id,property_id,title,document_type,status,url,period_label,payload,created_at" as const;

export const ownerStatementSelectColumns =
  "id,property_id,period_label,period_start,period_end,status,currency,gross_revenue,morrow_fee,other_costs,owner_payout,document_url,paid_at,payload,created_at" as const;

export const ownerOperationSelectColumns =
  "id,property_id,title,operation_type,status,visibility,scheduled_for,completed_at,note,payload,created_at" as const;

export const customerSelectColumns =
  "id,primary_lead_id,name,email,phone,customer_type,notes,payload,created_at" as const;

export const ownerProfileSelectColumns =
  "id,email,display_name,phone,status,payload,created_at" as const;

export const ownerAccessSelectColumns =
  "id,owner_profile_id,property_id,role,can_view_financials,can_view_operations,created_at" as const;

export const leadSelectColumns =
  "id,type,status,name,email,phone,package_slug,source,campaign,follow_up_at,whatsapp_opt_in,whatsapp_consent_at,adults,children,children_ages,dog,archived_at,created_at,payload" as const;

export const bookingSelectColumns =
  "id,lead_id,customer_id,package_id,status,payment_status,guest_access_code,guest_name,guest_email,guest_phone,selected_date,reservation_deadline,payment_due_date,payment_amount,payment_date,payment_method,payment_reference,payment_proof_url,adults,children,children_ages,dog,check_in_status,experience_status,next_task,created_at,payload" as const;

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

export type SupportMessageRowBase = {
  id: string;
  lead_id: string | null;
  booking_id?: string | null;
  owner_profile_id?: string | null;
  property_id?: string | null;
  category: string;
  message: string;
  status: string;
  urgency: string | null;
  source?: string | null;
  subject?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  property_name?: string | null;
  package_name?: string | null;
  requested_starts_on?: string | null;
  requested_ends_on?: string | null;
  requested_date_range_label?: string | null;
  payload: JsonRecord;
  created_at: string;
  updated_at?: string | null;
};

export type ExperienceProviderRowBase = {
  id: string;
  name: string;
  location: string | null;
  category: string | null;
  status: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  contact_name?: string | null;
  audience_fit?: string | null;
  collaboration_note?: string | null;
  pricing_note?: string | null;
  availability_note?: string | null;
  notes?: string | null;
  payload: JsonRecord;
};

export type CommunicationEventRowBase = {
  id: string;
  lead_id: string | null;
  booking_id: string | null;
  customer_id?: string | null;
  support_id?: string | null;
  channel: string;
  direction: string;
  event_type: string;
  subject: string | null;
  body: string | null;
  recipient?: string | null;
  actor: string | null;
  status: string;
  provider?: string | null;
  provider_message_id?: string | null;
  template_key?: string | null;
  source?: string | null;
  payload?: JsonRecord;
  created_at: string;
};

export type AgencyRowBase = {
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
  next_follow_up_at?: string | null;
  notes?: string | null;
  payload: JsonRecord;
  created_at: string;
};

export type OwnerDocumentRowBase = {
  id: string;
  property_id: string;
  title: string;
  document_type: string;
  status: string;
  url: string;
  period_label: string | null;
  payload: JsonRecord;
  created_at: string;
};

export type OwnerStatementRowBase = {
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
  payload: JsonRecord;
  created_at: string;
};

export type OwnerOperationRowBase = {
  id: string;
  property_id: string;
  title: string;
  operation_type: string;
  status: string;
  visibility: string;
  scheduled_for: string | null;
  completed_at: string | null;
  note: string | null;
  payload: JsonRecord;
  created_at: string;
};

export type CustomerRecordRowBase = {
  id: string;
  primary_lead_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  customer_type: string;
  notes: string | null;
  payload: JsonRecord;
  created_at: string;
};

export type OwnerProfileRowBase = {
  id: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  status: string;
  payload: JsonRecord;
  created_at: string;
};

export type OwnerAccessRowBase = {
  id: string;
  owner_profile_id: string;
  property_id: string;
  role: string;
  can_view_financials: boolean;
  can_view_operations: boolean;
  created_at: string;
};

export type LeadRowBase = {
  id: string;
  type: "guest" | "owner" | "experience" | string;
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
  payload: JsonRecord;
};

export type BookingRowBase = {
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
  payload: JsonRecord;
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
