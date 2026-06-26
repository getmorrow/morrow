"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSupabaseBrowserClient,
  type OwnerDashboardData,
  type OwnerDashboardBooking,
  type OwnerDashboardDate,
  type OwnerDashboardProperty,
} from "@morrow/supabase";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: OwnerDashboardData }
  | { status: "empty" }
  | { status: "error"; message: string };

function formatDateRange(booking: OwnerDashboardBooking) {
  if (booking.dateLabel) return booking.dateLabel;
  if (!booking.startsOn || !booking.endsOn) return "Termin wird ergänzt";

  const start = new Date(`${booking.startsOn}T00:00:00`);
  const end = new Date(`${booking.endsOn}T00:00:00`);

  const formatter = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function formatDate(date: OwnerDashboardDate) {
  if (date.label) return date.label;
  if (!date.startsOn || !date.endsOn) return "Termin wird ergänzt";

  const start = new Date(`${date.startsOn}T00:00:00`);
  const end = new Date(`${date.endsOn}T00:00:00`);
  const formatter = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function getPayloadText(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value;
  }

  return null;
}

function getPayloadLines(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string");
    }
    if (typeof value === "string" && value.trim()) {
      return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    }
  }

  return [];
}

function propertyImage(property: OwnerDashboardProperty) {
  const media = getPayloadLines(property.payload ?? {}, ["media"]);
  return getPayloadText(property.payload ?? {}, ["image"]) || media[0] || "/brand/generated/morrow-spo-interior.png";
}

function propertyReadiness(property: OwnerDashboardProperty) {
  const payload = property.payload ?? {};
  const checks = [
    Boolean(getPayloadText(payload, ["address"])),
    Boolean(getPayloadText(payload, ["checkInInstructions"])),
    getPayloadLines(payload, ["houseRules"]).length >= 2,
    getPayloadLines(payload, ["media"]).length > 0,
    getPayloadLines(payload, ["amenities", "features"]).length >= 3,
    getPayloadLines(payload, ["attributes"]).length >= 2,
    getPayloadLines(payload, ["experienceWorlds"]).length > 0,
  ];
  const done = checks.filter(Boolean).length;

  return {
    done,
    total: checks.length,
    label: done === checks.length ? "bereit" : `${done}/${checks.length} gepflegt`,
  };
}

function getNextBookings(bookings: OwnerDashboardBooking[]) {
  return [...bookings]
    .filter((booking) => booking.status !== "Abgeschlossen")
    .sort((a, b) => {
      const aDate = a.startsOn ? new Date(a.startsOn).getTime() : Number.MAX_SAFE_INTEGER;
      const bDate = b.startsOn ? new Date(b.startsOn).getTime() : Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    })
    .slice(0, 4);
}

function getUpcomingDates(dates: OwnerDashboardDate[]) {
  return [...dates]
    .filter((date) => !["archived", "cancelled"].includes(date.status))
    .sort((a, b) => {
      const aDate = a.startsOn ? new Date(a.startsOn).getTime() : Number.MAX_SAFE_INTEGER;
      const bDate = b.startsOn ? new Date(b.startsOn).getTime() : Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    })
    .slice(0, 5);
}

function getOpenPropertyNotes(properties: OwnerDashboardProperty[]) {
  return properties.flatMap((property) => {
    const notes: string[] = [];
    const payload = property.payload ?? {};

    if (!property.checkInType) notes.push(`${property.name}: Check-in ergänzen`);
    if (!property.supportType) notes.push(`${property.name}: Betreuung klären`);
    if (!getPayloadText(payload, ["address"])) notes.push(`${property.name}: Adresse fehlt`);
    if (getPayloadLines(payload, ["media"]).length === 0) notes.push(`${property.name}: Medien fehlen`);
    if (getPayloadLines(payload, ["experienceWorlds"]).length === 0) notes.push(`${property.name}: Erlebniswelten offen`);

    return notes;
  });
}

export function OwnerDashboardClient() {
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

        const { data, error } = await supabase.rpc("get_owner_dashboard");

        if (!isMounted) return;

        if (error) {
          setState({
            status: "error",
            message: "Der Eigentümerbereich konnte nicht geladen werden.",
          });
          return;
        }

        if (!data) {
          setState({ status: "empty" });
          return;
        }

        setState({ status: "ready", data: data as OwnerDashboardData });
      } catch {
        if (!isMounted) return;
        setState({
          status: "error",
          message: "Der Eigentümerbereich konnte nicht geladen werden.",
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
      <main className="owner-shell owner-dashboard">
        <div className="owner-container owner-center-state">
          <p className="eyebrow">Eigentümerbereich</p>
          <h1>Zugang wird geprüft.</h1>
        </div>
      </main>
    );
  }

  if (state.status === "empty") {
    return (
      <main className="owner-shell owner-dashboard">
        <div className="owner-container owner-center-state">
          <p className="eyebrow">Eigentümerbereich</p>
          <h1>Für diesen Zugang ist noch kein Objekt freigeschaltet.</h1>
          <p>Bitte melde dich bei Morrow, wenn du hier bereits Daten erwartest.</p>
          <button className="owner-button secondary" onClick={handleLogout} type="button">
            Abmelden
          </button>
        </div>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="owner-shell owner-dashboard">
        <div className="owner-container owner-center-state">
          <p className="eyebrow">Eigentümerbereich</p>
          <h1>{state.message}</h1>
          <button className="owner-button secondary" onClick={handleLogout} type="button">
            Zurück zum Login
          </button>
        </div>
      </main>
    );
  }

  return <OwnerDashboardView data={state.data} onLogout={handleLogout} />;
}

function OwnerDashboardView({
  data,
  onLogout,
}: {
  data: OwnerDashboardData;
  onLogout: () => void;
}) {
  const nextBookings = useMemo(() => getNextBookings(data.bookings), [data.bookings]);
  const upcomingDates = useMemo(() => getUpcomingDates(data.dates ?? []), [data.dates]);
  const openNotes = useMemo(() => getOpenPropertyNotes(data.properties), [data.properties]);
  const activePackages = data.packages.filter((packageItem) =>
    ["active", "published"].includes(packageItem.status),
  );
  const paidBookings = data.bookings.filter((booking) => booking.paymentStatus === "bezahlt");
  const reservedBookings = data.bookings.filter((booking) => booking.status === "Reserviert");
  const visibleGaps = upcomingDates.filter((date) => date.status === "available");
  const displayName = data.profile.displayName || "dein Objekt";

  return (
    <main className="owner-shell owner-dashboard">
      <div className="owner-container">
        <header className="owner-app-header">
          <a aria-label="Morrow Startseite" href="https://www.getmorrow.de">
            <img alt="morrow" src="/brand/morrow-wordmark-offblack.svg" />
          </a>
          <nav className="owner-dashboard-nav" aria-label="Eigentümerbereich">
            <a href="#objekte">Objekte</a>
            <a href="#buchungen">Buchungen</a>
            <a href="#vermarktung">Vermarktung</a>
            <a href="#abrechnung">Abrechnung</a>
            <button className="owner-nav-button" onClick={onLogout} type="button">
              Abmelden
            </button>
          </nav>
        </header>

        <section className="owner-dashboard-hero">
          <p className="eyebrow">Eigentümerbereich</p>
          <h1>Guten Überblick, {displayName}.</h1>
          <p>
            Hier siehst du, welche Objekte verbunden sind, welche Auszeiten
            sichtbar sind, welche Buchungen anstehen und wie Morrow freie
            Zeiträume aktiv in Nachfrage verwandelt.
          </p>
        </section>

        <section className="owner-metrics-grid" aria-label="Kennzahlen">
          <article className="owner-metric-card">
            <span>Objekte</span>
            <strong>{data.properties.length}</strong>
            <p>freigeschaltet</p>
          </article>
          <article className="owner-metric-card">
            <span>Auszeiten</span>
            <strong>{activePackages.length}</strong>
            <p>aktiv verbunden</p>
          </article>
          <article className="owner-metric-card">
            <span>Termine</span>
            <strong>{visibleGaps.length}</strong>
            <p>freie Zeiträume sichtbar</p>
          </article>
          <article className="owner-metric-card">
            <span>Buchungen</span>
            <strong>{data.bookings.length}</strong>
            <p>{paidBookings.length} bezahlt · {reservedBookings.length} reserviert</p>
          </article>
        </section>

        <section className="owner-section owner-highlight-grid" aria-label="Tagesüberblick">
          <article className="owner-card owner-highlight-card">
            <p className="eyebrow">Aktiver Ertragshebel</p>
            <h2>{visibleGaps.length ? "Freie Zeiträume im Blick" : "Keine offenen Lücken sichtbar"}</h2>
            <p>
              {visibleGaps.length
                ? "Morrow kann diese Zeiträume mit passenden Auszeiten, Zielgruppen und Kampagnen verbinden."
                : "Aktuell sind keine freien buchbaren Zeiträume für deine verbundenen Auszeiten sichtbar."}
            </p>
          </article>
          <article className="owner-card owner-highlight-card">
            <p className="eyebrow">Transparenz</p>
            <h2>{openNotes.length ? `${openNotes.length} Punkte offen` : "Objektdaten wirken vollständig"}</h2>
            <p>
              Je vollständiger Objekt, Check-in, Medien und Erlebniswelten gepflegt sind,
              desto besser kann Morrow dein Objekt positionieren.
            </p>
          </article>
          <article className="owner-card owner-highlight-card">
            <p className="eyebrow">Abrechnung</p>
            <h2>{paidBookings.length ? `${paidBookings.length} bezahlte Buchung${paidBookings.length === 1 ? "" : "en"}` : "Noch keine bezahlte Buchung"}</h2>
            <p>
              Umsatz, Kosten und Nettoauszahlung werden hier als nächster Schritt
              nachvollziehbar zusammengeführt.
            </p>
          </article>
        </section>

        <section className="owner-section owner-object-grid" id="objekte">
          {data.properties.map((property) => (
            <article className="owner-card owner-object-card" key={property.id}>
              <img
                alt={`${property.name} in ${property.location}`}
                src={propertyImage(property)}
              />
              <div>
                <p className="eyebrow">Objekt</p>
                <h2>{property.name}</h2>
                <p>
                  {property.location}
                  {property.sleeps ? ` · bis ${property.sleeps} Personen` : ""}
                  {property.bedrooms ? ` · ${property.bedrooms} Schlafzimmer` : ""}
                </p>
                <div className="owner-pill-row">
                  <span>{property.status}</span>
                  <span>{property.accessRole}</span>
                  <span>{propertyReadiness(property).label}</span>
                  {property.canViewFinancials ? <span>Abrechnung sichtbar</span> : null}
                </div>
                <div className="owner-detail-list">
                  <span>
                    Check-in
                    <strong>{property.checkInType || "offen"}</strong>
                  </span>
                  <span>
                    Betreuung
                    <strong>{property.supportName || property.supportType || "offen"}</strong>
                  </span>
                </div>
              </div>
            </article>
          ))}

          <aside className="owner-card">
            <p className="eyebrow">Objektstatus</p>
            <h2>Was gerade offen ist</h2>
            {openNotes.length ? (
              <ul>
                {openNotes.slice(0, 5).map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : (
              <p>Die wichtigsten Angaben sind für die verbundenen Objekte gepflegt.</p>
            )}
          </aside>
        </section>

        <section className="owner-section owner-dashboard-grid" id="buchungen">
          <article className="owner-card">
            <p className="eyebrow">Zeiträume</p>
            <h2>Kommende Verfügbarkeiten</h2>
            <div className="owner-status-list">
              {upcomingDates.length ? (
                upcomingDates.map((date) => (
                  <span key={date.id}>
                    {formatDate(date)}
                    <strong>{date.packageName || date.status}</strong>
                  </span>
                ))
              ) : (
                <p>Noch keine kommenden Zeiträume sichtbar.</p>
              )}
            </div>
          </article>

          <article className="owner-card">
            <p className="eyebrow">Buchungen</p>
            <h2>Aktuelle Buchungen</h2>
            <div className="owner-status-list">
              {nextBookings.length ? (
                nextBookings.map((booking) => (
                  <span key={booking.id}>
                    {formatDateRange(booking)}
                    <strong>{booking.packageName || booking.status}</strong>
                  </span>
                ))
              ) : (
                <p>Noch keine aktiven Buchungen sichtbar.</p>
              )}
            </div>
          </article>
        </section>

        <section className="owner-section owner-dashboard-grid" id="vermarktung">
          <article className="owner-card">
            <p className="eyebrow">Vermarktung</p>
            <h2>Welche Auszeiten verbunden sind</h2>
            <div className="owner-status-list">
              {data.packages.length ? (
                data.packages.map((packageItem) => (
                  <span key={packageItem.id}>
                    {packageItem.name}
                    <strong>{packageItem.status} · {packageItem.concretePrice || packageItem.priceFrom || "Preis offen"}</strong>
                  </span>
                ))
              ) : (
                <p>Noch keine Auszeit mit diesem Objekt verbunden.</p>
              )}
            </div>
          </article>

          <article className="owner-card">
            <p className="eyebrow">Nächster Schritt</p>
            <h2>Was Morrow daraus macht</h2>
            <p>
              Freie Zeiträume werden mit passenden Auszeiten verbunden und
              gezielt vermarktet. So bleibt sichtbar, wo Nachfrage entsteht und
              welche Lücken als Nächstes bearbeitet werden.
            </p>
            <div className="owner-process-list">
              <span>Objektprofil schärfen</span>
              <span>Reiseanlass ableiten</span>
              <span>Direktanfragen gewinnen</span>
            </div>
          </article>
        </section>

        <section className="owner-section owner-dashboard-grid" id="abrechnung">
          <article className="owner-card">
            <p className="eyebrow">Abrechnung</p>
            <h2>Monatsstatus statt Blackbox</h2>
            <p>
              Umsatz, Kosten, Provision, Nettoauszahlung, Belege und der Stand
              der Monatsabrechnung werden hier nachvollziehbar zusammengeführt.
            </p>
          </article>

          <article className="owner-card">
            <p className="eyebrow">Rechte</p>
            <h2>Nur die passenden Daten</h2>
            <p>
              Dieser Zugang zeigt nur Objekte, Auszeiten und Buchungen, die dem
              Eigentümerprofil freigeschaltet wurden.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
