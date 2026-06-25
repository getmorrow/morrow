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

const leadQuickStatuses = ["In Prüfung", "Kontaktiert", "Kein Interesse"] as const;
const bookingStatuses = ["Bezahlt", "Vor Anreise", "Aktiv", "Abgeschlossen", "Storniert"] as const;

function paymentStatusForBooking(status: string) {
  return ["Bezahlt", "Vor Anreise", "Aktiv", "Abgeschlossen"].includes(status)
    ? "bezahlt"
    : "offen";
}

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
              .select("id,type,status,name,email,phone,package_slug,created_at,payload")
              .order("created_at", { ascending: false })
              .limit(30),
            supabase
              .from("bookings")
              .select("id,status,payment_status,created_at,payload")
              .order("created_at", { ascending: false })
              .limit(30),
            supabase.from("packages").select("id,name,slug,status").order("name"),
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
  data: initialData,
  onLogout,
}: {
  data: DashboardData;
  onLogout: () => void;
}) {
  const [dataState, setDataState] = useState(initialData);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const data = dataState;
  const openLeads = useMemo(() => getOpenLeads(data.leads), [data.leads]);
  const paidBookings = data.bookings.filter((booking) => booking.payment_status === "bezahlt");
  const openSupport = data.supportMessages.filter((message) => message.status !== "closed");
  const displayName = data.profile.name || data.profile.email;

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
    await supabase.from("admin_audit_logs").insert({
      actor_email: data.profile.email,
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_label: entityLabel,
      payload,
    });
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
              <article className="admin-list-item" key={lead.id}>
                <div>
                  <small>{formatDate(lead.created_at)}</small>
                  <strong>{getLeadLabel(lead)}</strong>
                  <em>{lead.status}</em>
                </div>
                <div className="admin-row-actions">
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
