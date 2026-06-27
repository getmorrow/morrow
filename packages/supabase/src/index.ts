import { createClient } from "@supabase/supabase-js";

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
  payload: Record<string, unknown>;
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
  payload: Record<string, unknown>;
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
  payload: Record<string, unknown>;
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
  payload: Record<string, unknown>;
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
  payload: Record<string, unknown>;
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
  payload: Record<string, unknown>;
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
  payload: Record<string, unknown>;
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
  payload: Record<string, unknown>;
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
