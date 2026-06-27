"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSupabaseBrowserClient,
  type OwnerDashboardData,
  type OwnerDashboardBooking,
  type OwnerDashboardDate,
  type OwnerDashboardDocument,
  type OwnerDashboardProperty,
} from "@morrow/supabase";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: OwnerDashboardData }
  | { status: "empty" }
  | { status: "error"; message: string };

type OwnerGap = OwnerDashboardDate & {
  actionLabel: string;
  urgency: "high" | "medium" | "low";
};

type OwnerContactCategory = "general" | "property" | "booking" | "accounting";

const ownerContactCategoryLabels: Record<OwnerContactCategory, string> = {
  general: "Allgemeine Rückfrage",
  property: "Objekt oder Ausstattung",
  booking: "Buchung oder Zeitraum",
  accounting: "Abrechnung",
};

const ownerDocumentTypeLabels: Record<string, string> = {
  agreement: "Vereinbarung",
  document: "Dokument",
  handover: "Übergabe",
  invoice: "Beleg",
  report: "Report",
  statement: "Abrechnung",
};

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

function parseMoney(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function dateDistanceLabel(startsOn: string | null) {
  if (!startsOn) return "Termin offen";
  const today = new Date();
  const start = new Date(`${startsOn}T00:00:00`);
  const days = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "liegt zurück";
  if (days === 0) return "heute";
  if (days === 1) return "morgen";
  return `in ${days} Tagen`;
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

function getVisibleGaps(dates: OwnerDashboardDate[]): OwnerGap[] {
  return [...dates]
    .filter((date) => date.status === "available")
    .sort((a, b) => {
      const aDate = a.startsOn ? new Date(a.startsOn).getTime() : Number.MAX_SAFE_INTEGER;
      const bDate = b.startsOn ? new Date(b.startsOn).getTime() : Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    })
    .slice(0, 6)
    .map((date) => {
      const distance = date.startsOn
        ? Math.ceil((new Date(`${date.startsOn}T00:00:00`).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 999;
      return {
        ...date,
        actionLabel: distance <= 14 ? "Aktiv vermarkten" : distance <= 45 ? "Kampagne vorbereiten" : "Beobachten",
        urgency: distance <= 14 ? "high" : distance <= 45 ? "medium" : "low",
      };
    });
}

function bookingRevenue(bookings: OwnerDashboardBooking[]) {
  return bookings.reduce((sum, booking) => {
    const payload = booking.payload ?? {};
    return sum + parseMoney(
      payload.paymentAmount ??
      payload.amountPaid ??
      payload.price ??
      payload.concretePrice ??
      payload.packagePrice,
    );
  }, 0);
}

function payoutEstimate(bookings: OwnerDashboardBooking[]) {
  const revenue = bookingRevenue(bookings);
  if (!revenue) return 0;
  return Math.round(revenue * 0.82);
}

function propertyOperations(property: OwnerDashboardProperty) {
  const payload = property.payload ?? {};
  const cleaningStatus = getPayloadText(payload, ["cleaningStatus", "cleaning", "housekeepingStatus"]) || "wird nach Buchung geplant";
  const maintenanceStatus = getPayloadText(payload, ["maintenanceStatus", "damageStatus", "operationsStatus"]) || "keine offenen Meldungen";
  const lastCheck = getPayloadText(payload, ["lastCheck", "lastInspection", "lastUpdated"]) || "noch nicht dokumentiert";

  return {
    cleaningStatus,
    lastCheck,
    maintenanceStatus,
  };
}

function formatOwnerDocumentLabel(document: OwnerDashboardDocument) {
  const typeLabel = ownerDocumentTypeLabels[document.documentType] || "Dokument";
  const propertyLabel = document.propertyName || "Objekt";
  return [typeLabel, propertyLabel, document.periodLabel].filter(Boolean).join(" · ");
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
  const [contactCategory, setContactCategory] = useState<OwnerContactCategory>("general");
  const [contactPropertyId, setContactPropertyId] = useState(data.properties[0]?.id ?? "");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const nextBookings = useMemo(() => getNextBookings(data.bookings), [data.bookings]);
  const upcomingDates = useMemo(() => getUpcomingDates(data.dates ?? []), [data.dates]);
  const openNotes = useMemo(() => getOpenPropertyNotes(data.properties), [data.properties]);
  const visibleGaps = useMemo(() => getVisibleGaps(data.dates ?? []), [data.dates]);
  const activePackages = data.packages.filter((packageItem) =>
    ["active", "published"].includes(packageItem.status),
  );
  const paidBookings = data.bookings.filter((booking) => booking.paymentStatus === "bezahlt");
  const reservedBookings = data.bookings.filter((booking) => booking.status === "Reserviert");
  const documentedRevenue = bookingRevenue(paidBookings);
  const estimatedPayout = payoutEstimate(paidBookings);
  const ownerDocuments = data.documents ?? [];
  const displayName = data.profile.displayName || "dein Objekt";
  const selectedContactProperty = data.properties.find((property) => property.id === contactPropertyId) ?? data.properties[0] ?? null;

  async function sendOwnerMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contactMessage.trim() || contactStatus === "sending") return;

    setContactStatus("sending");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("support_messages").insert({
        id: crypto.randomUUID(),
        category: `owner_${contactCategory}`,
        message: contactMessage.trim(),
        urgency: contactCategory === "accounting" ? "soon" : "normal",
        payload: {
          source: "next-owner",
          subject: ownerContactCategoryLabels[contactCategory],
          categoryLabel: "Eigentümeranliegen",
          ownerProfileId: data.profile.id,
          ownerName: data.profile.displayName,
          ownerEmail: data.profile.email,
          ownerPhone: data.profile.phone,
          propertyId: selectedContactProperty?.id ?? null,
          propertyName: selectedContactProperty?.name ?? null,
          supportCategory: contactCategory,
        },
      });

      if (error) throw error;

      setContactMessage("");
      setContactStatus("sent");
    } catch {
      setContactStatus("error");
    }
  }

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
            <a href="#luecken">Lücken</a>
            <a href="#vermarktung">Vermarktung</a>
            <a href="#operations">Operations</a>
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
            <h2>{documentedRevenue ? `${formatCurrency(documentedRevenue)} dokumentiert` : "Noch kein Umsatz dokumentiert"}</h2>
            <p>
              Die Abrechnung bleibt bewusst nachvollziehbar: Buchungen,
              Zahlungsstatus und spätere Auszahlung werden hier zusammengeführt.
            </p>
          </article>
        </section>

        <section className="owner-section owner-card owner-contact-card" id="kontakt">
          <div>
            <p className="eyebrow">Direkter Draht</p>
            <h2>Eine Rückfrage, die direkt im Morrow Admin landet.</h2>
            <p>
              Für Objekt, Buchung oder Abrechnung kannst du hier eine kurze
              Nachricht senden. Morrow ordnet sie intern deinem Profil und dem
              passenden Objekt zu.
            </p>
          </div>
          <form className="owner-contact-form" onSubmit={sendOwnerMessage}>
            <label>
              Thema
              <select
                onChange={(event) => setContactCategory(event.target.value as OwnerContactCategory)}
                value={contactCategory}
              >
                {(Object.keys(ownerContactCategoryLabels) as OwnerContactCategory[]).map((category) => (
                  <option key={category} value={category}>
                    {ownerContactCategoryLabels[category]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Objektbezug
              <select
                disabled={!data.properties.length}
                onChange={(event) => setContactPropertyId(event.target.value)}
                value={contactPropertyId}
              >
                {data.properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="owner-contact-message">
              Nachricht
              <textarea
                onChange={(event) => {
                  setContactMessage(event.target.value);
                  if (contactStatus !== "idle") setContactStatus("idle");
                }}
                placeholder="Was sollen wir für dich prüfen?"
                required
                rows={4}
                value={contactMessage}
              />
            </label>
            <div className="owner-contact-actions">
              <button className="owner-button" disabled={contactStatus === "sending"} type="submit">
                {contactStatus === "sending" ? "Wird gesendet" : "Nachricht senden"}
              </button>
              {contactStatus === "sent" ? (
                <p>Nachricht ist angekommen und wird im Admin weiterbearbeitet.</p>
              ) : null}
              {contactStatus === "error" ? (
                <p>Die Nachricht konnte nicht gesendet werden. Bitte später erneut versuchen.</p>
              ) : null}
            </div>
          </form>
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
                  <article className="owner-status-item" key={date.id}>
                    <span className="owner-status-copy">
                      <b>{formatDate(date)}</b>
                      <small>{dateDistanceLabel(date.startsOn)}</small>
                    </span>
                    <strong>{date.packageName || date.status}</strong>
                  </article>
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
                  <article className="owner-status-item" key={booking.id}>
                    <span className="owner-status-copy">
                      <b>{formatDateRange(booking)}</b>
                      <small>{booking.propertyName || booking.status}</small>
                    </span>
                    <strong>{booking.packageName || booking.status}</strong>
                  </article>
                ))
              ) : (
                <p>Noch keine aktiven Buchungen sichtbar.</p>
              )}
            </div>
          </article>
        </section>

        <section className="owner-section owner-card" id="luecken">
          <div className="owner-section-head">
            <div>
              <p className="eyebrow">Lückenmarketing Light</p>
              <h2>Freie Zeiträume, aus denen Nachfrage entstehen kann.</h2>
            </div>
            <p>
              Morrow bewertet freie Termine nicht als Leerstand, sondern als
              konkrete Vermarktungschance mit passender Auszeit und Zielgruppe.
            </p>
          </div>
          <div className="owner-gap-list">
            {visibleGaps.length ? (
              visibleGaps.map((gap) => (
                <article className={`owner-gap-item is-${gap.urgency}`} key={gap.id}>
                  <div>
                    <small>{gap.packageName || "Auszeit"} · {dateDistanceLabel(gap.startsOn)}</small>
                    <strong>{formatDate(gap)}</strong>
                    <p>{gap.capacity ? `${gap.capacity} Plätze/Kapazität offen` : "Kapazität wird intern geprüft"}</p>
                  </div>
                  <span>{gap.actionLabel}</span>
                </article>
              ))
            ) : (
              <p>Aktuell sind keine freigegebenen Lücken sichtbar.</p>
            )}
          </div>
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

        <section className="owner-section owner-dashboard-grid" id="operations">
          <article className="owner-card">
            <p className="eyebrow">Operations</p>
            <h2>Objektstatus ohne Blackbox</h2>
            <div className="owner-status-list">
              {data.properties.map((property) => {
                const operations = propertyOperations(property);
                return (
                  <article className="owner-status-item" key={property.id}>
                    <span className="owner-status-copy">
                      <b>{property.name}</b>
                      <small>Letzte Prüfung: {operations.lastCheck}</small>
                    </span>
                    <strong>{property.canViewOperations ? operations.maintenanceStatus : "intern geführt"}</strong>
                  </article>
                );
              })}
            </div>
          </article>

          <article className="owner-card">
            <p className="eyebrow">Reinigung und Vorbereitung</p>
            <h2>Was vor Aufenthalten wichtig wird</h2>
            <div className="owner-process-list">
              {data.properties.map((property) => (
                <span key={property.id}>
                  {property.name}
                  <strong>{property.canViewOperations ? propertyOperations(property).cleaningStatus : "nicht freigegeben"}</strong>
                </span>
              ))}
            </div>
          </article>
        </section>

        <section className="owner-section owner-dashboard-grid" id="abrechnung">
          <article className="owner-card">
            <p className="eyebrow">Abrechnung</p>
            <h2>Monatsstatus statt Blackbox</h2>
            {data.properties.some((property) => property.canViewFinancials) ? (
              <div className="owner-finance-grid">
                <article>
                  <span>Dokumentierter Umsatz</span>
                  <strong>{documentedRevenue ? formatCurrency(documentedRevenue) : "offen"}</strong>
                </article>
                <article>
                  <span>Orientierung Auszahlung</span>
                  <strong>{estimatedPayout ? formatCurrency(estimatedPayout) : "offen"}</strong>
                </article>
                <article>
                  <span>Bezahlte Buchungen</span>
                  <strong>{paidBookings.length}</strong>
                </article>
              </div>
            ) : (
              <p>Finanzdaten sind für diesen Zugang nicht freigeschaltet.</p>
            )}
          </article>

          <article className="owner-card">
            <p className="eyebrow">Dokumente und Kommunikation</p>
            <h2>Alles bleibt nachvollziehbar.</h2>
            <p>
              Monatsabrechnung, Vereinbarungen und Rückfragen werden hier
              schrittweise ergänzt. Bis dahin bleibt Morrow persönlich
              Ansprechpartner und pflegt die Daten im Admin.
            </p>
            <div className="owner-document-list">
              {ownerDocuments.length ? (
                ownerDocuments.map((document) => (
                  <a href={document.url} key={document.id} target="_blank" rel="noreferrer">
                    <span>{formatOwnerDocumentLabel(document)}</span>
                    <strong>{document.title}</strong>
                  </a>
                ))
              ) : (
                <span>Noch keine Dokumente für diesen Zugang hinterlegt.</span>
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
