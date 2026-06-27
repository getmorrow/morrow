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
