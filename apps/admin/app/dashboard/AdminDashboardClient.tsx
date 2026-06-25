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
  created_at: string;
  payload: Record<string, unknown>;
};

type BookingRow = {
  id: string;
  status: string;
  payment_status: string;
  created_at: string;
  payload: Record<string, unknown>;
};

type SimpleRow = {
  id: string;
  name?: string;
  status?: string;
};

type SupportRow = {
  id: string;
  status: string;
  urgency: string | null;
  created_at: string;
  payload: Record<string, unknown>;
};

type DashboardData = {
  profile: AdminProfile;
  leads: LeadRow[];
  bookings: BookingRow[];
  packages: SimpleRow[];
  properties: SimpleRow[];
  supportMessages: SupportRow[];
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: DashboardData }
  | { status: "error"; message: string };

function getPayloadText(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value;
  }

  return null;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getOpenLeads(leads: LeadRow[]) {
  return leads.filter((lead) => !["Bezahlt", "Abgeschlossen", "Kein Interesse"].includes(lead.status));
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

        const [leadsResult, bookingsResult, packagesResult, propertiesResult, supportResult] =
          await Promise.all([
            supabase
              .from("leads")
              .select("id,type,status,created_at,payload")
              .order("created_at", { ascending: false })
              .limit(30),
            supabase
              .from("bookings")
              .select("id,status,payment_status,created_at,payload")
              .order("created_at", { ascending: false })
              .limit(30),
            supabase.from("packages").select("id,name,status").order("name"),
            supabase.from("properties").select("id,name,status").order("name"),
            supabase
              .from("support_messages")
              .select("id,status,urgency,created_at,payload")
              .order("created_at", { ascending: false })
              .limit(20),
          ]);

        if (!isMounted) return;

        const firstError =
          leadsResult.error ||
          bookingsResult.error ||
          packagesResult.error ||
          propertiesResult.error ||
          supportResult.error;

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
            supportMessages: (supportResult.data ?? []) as SupportRow[],
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
  data,
  onLogout,
}: {
  data: DashboardData;
  onLogout: () => void;
}) {
  const openLeads = useMemo(() => getOpenLeads(data.leads), [data.leads]);
  const paidBookings = data.bookings.filter((booking) => booking.payment_status === "bezahlt");
  const openSupport = data.supportMessages.filter((message) => message.status !== "closed");
  const displayName = data.profile.name || data.profile.email;

  return (
    <main className="admin-shell admin-dashboard">
      <header className="admin-header">
        <a aria-label="Morrow Startseite" href="https://www.getmorrow.de">
          <img alt="morrow" src="/brand/morrow-wordmark-offblack.svg" />
        </a>
        <nav aria-label="Admin Navigation">
          <a href="#anfragen">Anfragen</a>
          <a href="#buchungen">Buchungen</a>
          <a href="#bestand">Bestand</a>
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
          <span>Auszeiten</span>
          <strong>{data.packages.length}</strong>
          <p>in Supabase</p>
        </article>
        <article>
          <span>Support</span>
          <strong>{openSupport.length}</strong>
          <p>offene Fälle</p>
        </article>
      </section>

      <section className="admin-grid" id="anfragen">
        <article className="admin-card">
          <p className="admin-eyebrow">Anfragen</p>
          <h2>Neueste Kontakte</h2>
          <div className="admin-list">
            {data.leads.slice(0, 8).map((lead) => (
              <span key={lead.id}>
                <small>{formatDate(lead.created_at)}</small>
                <strong>{getPayloadText(lead.payload, ["name", "fullName", "email"]) || lead.type}</strong>
                <em>{lead.status}</em>
              </span>
            ))}
          </div>
        </article>

        <article className="admin-card" id="buchungen">
          <p className="admin-eyebrow">Buchungen</p>
          <h2>Aktuelle Aufenthalte</h2>
          <div className="admin-list">
            {data.bookings.slice(0, 8).map((booking) => (
              <span key={booking.id}>
                <small>{formatDate(booking.created_at)}</small>
                <strong>
                  {getPayloadText(booking.payload, ["packageName", "stayName", "guestName"]) ||
                    booking.status}
                </strong>
                <em>{booking.payment_status}</em>
              </span>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-grid" id="bestand">
        <article className="admin-card">
          <p className="admin-eyebrow">Auszeiten</p>
          <h2>Angebote im System</h2>
          <div className="admin-list">
            {data.packages.map((packageItem) => (
              <span key={packageItem.id}>
                <strong>{packageItem.name || packageItem.id}</strong>
                <em>{packageItem.status || "ohne Status"}</em>
              </span>
            ))}
          </div>
        </article>

        <article className="admin-card">
          <p className="admin-eyebrow">Objekte</p>
          <h2>Unterkünfte und Bestand</h2>
          <div className="admin-list">
            {data.properties.map((property) => (
              <span key={property.id}>
                <strong>{property.name || property.id}</strong>
                <em>{property.status || "ohne Status"}</em>
              </span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
