"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSupabaseBrowserClient,
  type OwnerDashboardData,
  type OwnerDashboardBooking,
  type OwnerDashboardDate,
  type OwnerDashboardDocument,
  type OwnerDashboardMessage,
  type OwnerDashboardProperty,
  type OwnerDashboardStatement,
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

type OwnerContactCategory = "general" | "property" | "booking" | "availability" | "accounting";

const ownerContactCategoryLabels: Record<OwnerContactCategory, string> = {
  general: "Allgemeine Rückfrage",
  property: "Objekt oder Ausstattung",
  booking: "Buchung oder Zeitraum",
  availability: "Eigenbelegung oder Verfügbarkeit",
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

const ownerMessageStatusLabels: Record<string, string> = {
  closed: "Abgeschlossen",
  in_progress: "In Bearbeitung",
  new: "Neu",
  open: "Offen",
  waiting: "Wartet",
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

function formatDateTime(value: string | null) {
  if (!value) return "Zeitpunkt offen";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Zeitpunkt offen";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
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

function formatOwnerMessageLabel(message: OwnerDashboardMessage) {
  const category = message.payload?.supportCategory;
  const categoryLabel =
    typeof category === "string" && category in ownerContactCategoryLabels
      ? ownerContactCategoryLabels[category as OwnerContactCategory]
      : message.subject || message.category.replace(/^owner_/, "");
  const statusLabel = ownerMessageStatusLabels[message.status] || message.status || "Neu";

  return [categoryLabel, statusLabel].filter(Boolean).join(" · ");
}

function formatOwnerMessageDateRange(message: OwnerDashboardMessage) {
  if (!message.requestedStartsOn && !message.requestedEndsOn) return null;
  return `${message.requestedStartsOn || "offen"} bis ${message.requestedEndsOn || "offen"}`;
}

function formatOwnerStatementStatus(statement: OwnerDashboardStatement) {
  const labels: Record<string, string> = {
    paid: "Ausgezahlt",
    visible: "Freigegeben",
  };
  return labels[statement.status] || statement.status;
}

function formatOperationLabel(type: string, status: string) {
  return [
    ownerOperationTypeLabels[type] || type,
    ownerOperationStatusLabels[status] || status,
  ].join(" · ");
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

        const [dashboardResult, operationsResult, communicationResult, statusEventsResult] = await Promise.all([
          supabase.rpc("get_owner_dashboard"),
          supabase.rpc("get_owner_operations"),
          supabase.rpc("get_owner_communication_events"),
          supabase.rpc("get_owner_support_status_events"),
        ]);

        if (!isMounted) return;

        if (dashboardResult.error) {
          setState({
            status: "error",
            message: "Der Eigentümerbereich konnte nicht geladen werden.",
          });
          return;
        }

        if (!dashboardResult.data) {
          setState({ status: "empty" });
          return;
        }

        setState({
          status: "ready",
          data: {
            ...(dashboardResult.data as OwnerDashboardData),
            operations: operationsResult.error ? [] : ((operationsResult.data as OwnerDashboardData["operations"]) ?? []),
            communicationEvents: communicationResult.error ? [] : ((communicationResult.data as OwnerDashboardData["communicationEvents"]) ?? []),
            supportStatusEvents: statusEventsResult.error ? [] : ((statusEventsResult.data as OwnerDashboardData["supportStatusEvents"]) ?? []),
          },
        });
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
  const [contactStartsOn, setContactStartsOn] = useState("");
  const [contactEndsOn, setContactEndsOn] = useState("");
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
  const ownerDocuments = data.documents ?? [];
  const ownerMessages = data.messages ?? [];
  const ownerCommunicationEvents = data.communicationEvents ?? [];
  const ownerSupportStatusEvents = data.supportStatusEvents ?? [];
  const ownerStatements = data.statements ?? [];
  const ownerOperations = data.operations ?? [];
  const latestStatement = ownerStatements[0] ?? null;
  const statementRevenue = ownerStatements.reduce((sum, statement) => sum + Number(statement.grossRevenue || 0), 0);
  const statementPayout = ownerStatements.reduce((sum, statement) => sum + Number(statement.ownerPayout || 0), 0);
  const displayName = data.profile.displayName || "dein Objekt";
  const selectedContactProperty = data.properties.find((property) => property.id === contactPropertyId) ?? data.properties[0] ?? null;
  const isAvailabilityRequest = contactCategory === "availability";
  const hasInvalidAvailabilityRange =
    isAvailabilityRequest && Boolean(contactStartsOn && contactEndsOn && contactEndsOn < contactStartsOn);

  async function sendOwnerMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (contactStatus === "sending") return;
    if (isAvailabilityRequest && (!contactStartsOn || !contactEndsOn)) {
      setContactStatus("error");
      return;
    }
    if (hasInvalidAvailabilityRange) {
      setContactStatus("error");
      return;
    }
    if (!isAvailabilityRequest && !contactMessage.trim()) return;

    setContactStatus("sending");
    const messageText = contactMessage.trim() || "Bitte Zeitraum für Eigenbelegung oder Verfügbarkeit prüfen.";

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("support_messages").insert({
        id: crypto.randomUUID(),
        category: `owner_${contactCategory}`,
        message: messageText,
        urgency: contactCategory === "accounting" || isAvailabilityRequest ? "soon" : "normal",
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
          requestedStartsOn: isAvailabilityRequest ? contactStartsOn : null,
          requestedEndsOn: isAvailabilityRequest ? contactEndsOn : null,
          requestedDateRangeLabel: isAvailabilityRequest
            ? `${contactStartsOn || "offen"} bis ${contactEndsOn || "offen"}`
            : null,
        },
      });

      if (error) throw error;

      setContactMessage("");
      if (isAvailabilityRequest) {
        setContactStartsOn("");
        setContactEndsOn("");
      }
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
            <a href="#rueckfragen">Rückfragen</a>
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
            <h2>
              {latestStatement
                ? `${formatCurrency(latestStatement.ownerPayout)} ${formatOwnerStatementStatus(latestStatement).toLowerCase()}`
                : documentedRevenue
                  ? `${formatCurrency(documentedRevenue)} dokumentiert`
                  : "Noch keine Abrechnung sichtbar"}
            </h2>
            <p>
              {latestStatement
                ? `${latestStatement.periodLabel} · ${latestStatement.propertyName || "Objekt"}`
                : "Sobald Morrow eine Monatsabrechnung freigibt, erscheint sie hier nachvollziehbar für dein Objekt."}
            </p>
          </article>
        </section>

        <section className="owner-section owner-card owner-contact-card" id="kontakt">
          <div>
            <p className="eyebrow">Direkter Draht</p>
            <h2>Eine Rückfrage, die direkt im Morrow Admin landet.</h2>
            <p>
              Für Objekt, Buchung, Abrechnung oder freie Zeiträume kannst du
              hier eine kurze Nachricht senden. Morrow ordnet sie intern deinem
              Profil und dem passenden Objekt zu.
            </p>
          </div>
          <form className="owner-contact-form" onSubmit={sendOwnerMessage}>
            <label>
              Thema
              <select
                onChange={(event) => {
                  setContactCategory(event.target.value as OwnerContactCategory);
                  if (contactStatus !== "idle") setContactStatus("idle");
                }}
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
            {isAvailabilityRequest ? (
              <div className="owner-contact-date-grid">
                <label>
                  Von
                  <input
                    max={contactEndsOn || undefined}
                    onChange={(event) => {
                      setContactStartsOn(event.target.value);
                      if (contactStatus !== "idle") setContactStatus("idle");
                    }}
                    required
                    type="date"
                    value={contactStartsOn}
                  />
                </label>
                <label>
                  Bis
                  <input
                    min={contactStartsOn || undefined}
                    onChange={(event) => {
                      setContactEndsOn(event.target.value);
                      if (contactStatus !== "idle") setContactStatus("idle");
                    }}
                    required
                    type="date"
                    value={contactEndsOn}
                  />
                </label>
              </div>
            ) : null}
            <label className="owner-contact-message">
              Nachricht
              <textarea
                onChange={(event) => {
                  setContactMessage(event.target.value);
                  if (contactStatus !== "idle") setContactStatus("idle");
                }}
                placeholder={
                  isAvailabilityRequest
                    ? "Soll der Zeitraum blockiert, freigegeben oder geprüft werden?"
                    : "Was sollen wir für dich prüfen?"
                }
                required={!isAvailabilityRequest}
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
                <p>
                  {isAvailabilityRequest && (!contactStartsOn || !contactEndsOn)
                    ? "Bitte Zeitraum vollständig auswählen."
                    : hasInvalidAvailabilityRange
                      ? "Bitte ein Enddatum nach dem Startdatum wählen."
                    : "Die Nachricht konnte nicht gesendet werden. Bitte später erneut versuchen."}
                </p>
              ) : null}
            </div>
          </form>
        </section>

        <section className="owner-section owner-card" id="rueckfragen">
          <div className="owner-section-head">
            <div>
              <p className="eyebrow">Rückfragen</p>
              <h2>Was du an Morrow gesendet hast.</h2>
            </div>
            <p>
              Damit nichts in E-Mails oder einzelnen Nachrichten verschwindet,
              siehst du hier die letzten Anliegen, die im Admin weiterbearbeitet werden.
            </p>
          </div>
          <div className="owner-message-list">
            {ownerMessages.length ? (
              ownerMessages.slice(0, 6).map((message) => {
                const messageEvents = ownerCommunicationEvents
                  .filter((event) => event.supportId === message.id)
                  .slice(0, 2);
                const statusEvents = ownerSupportStatusEvents
                  .filter((event) => event.supportId === message.id)
                  .slice(0, 3);
                return (
                  <article className="owner-message-item" key={message.id}>
                    <div>
                      <span>{formatOwnerMessageLabel(message)}</span>
                      <strong>{message.propertyName || "Allgemein"}</strong>
                      <p>{message.message}</p>
                      {formatOwnerMessageDateRange(message) ? (
                        <small>Zeitraum: {formatOwnerMessageDateRange(message)}</small>
                      ) : null}
                    </div>
                    <time dateTime={message.updatedAt || message.createdAt}>
                      {formatDateTime(message.updatedAt || message.createdAt)}
                    </time>
                    {messageEvents.length ? (
                      <div className="owner-message-replies">
                        {messageEvents.map((event) => (
                          <article key={event.id}>
                            <span>{event.channel === "email" ? "Antwort per E-Mail" : "Update von Morrow"}</span>
                            <strong>{event.subject || "Rückmeldung"}</strong>
                            {event.body ? <p>{event.body}</p> : null}
                            <time dateTime={event.createdAt}>{formatDateTime(event.createdAt)}</time>
                          </article>
                        ))}
                      </div>
                    ) : null}
                    {statusEvents.length ? (
                      <div className="owner-message-status">
                        {statusEvents.map((event) => (
                          <span key={event.id}>
                            {ownerMessageStatusLabels[event.toStatus] || event.toStatus}
                            {" · "}
                            {formatDateTime(event.createdAt)}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                );
              })
            ) : (
              <p>Noch keine Rückfragen für diesen Zugang sichtbar.</p>
            )}
          </div>
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
              {ownerOperations.length ? (
                ownerOperations.map((operation) => (
                  <article className="owner-status-item" key={operation.id}>
                    <span className="owner-status-copy">
                      <b>{operation.title}</b>
                      <small>
                        {formatOperationLabel(operation.operationType, operation.status)}
                        {operation.scheduledFor ? ` · ${formatDateTime(operation.scheduledFor)}` : ""}
                      </small>
                      {operation.note ? <small>{operation.note}</small> : null}
                    </span>
                    <strong>{operation.propertyName || "Objekt"}</strong>
                  </article>
                ))
              ) : (
                data.properties.map((property) => {
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
                })
              )}
            </div>
          </article>

          <article className="owner-card">
            <p className="eyebrow">Reinigung und Vorbereitung</p>
            <h2>Was vor Aufenthalten wichtig wird</h2>
            <div className="owner-process-list">
              {ownerOperations
                .filter((operation) => ["cleaning", "handover", "inspection"].includes(operation.operationType))
                .slice(0, 4)
                .map((operation) => (
                  <span key={operation.id}>
                    {operation.propertyName || "Objekt"}
                    <strong>{operation.title}</strong>
                  </span>
                ))}
              {!ownerOperations.some((operation) => ["cleaning", "handover", "inspection"].includes(operation.operationType))
                ? data.properties.map((property) => (
                    <span key={property.id}>
                      {property.name}
                      <strong>{property.canViewOperations ? propertyOperations(property).cleaningStatus : "nicht freigegeben"}</strong>
                    </span>
                  ))
                : null}
            </div>
          </article>
        </section>

        <section className="owner-section owner-dashboard-grid" id="abrechnung">
          <article className="owner-card">
            <p className="eyebrow">Abrechnung</p>
            <h2>Monatsstatus statt Blackbox</h2>
            {data.properties.some((property) => property.canViewFinancials) ? (
              <>
                <div className="owner-finance-grid">
                  <article>
                    <span>Freigegebener Umsatz</span>
                    <strong>{statementRevenue ? formatCurrency(statementRevenue) : "offen"}</strong>
                  </article>
                  <article>
                    <span>Auszahlung</span>
                    <strong>{statementPayout ? formatCurrency(statementPayout) : "offen"}</strong>
                  </article>
                  <article>
                    <span>Abrechnungen</span>
                    <strong>{ownerStatements.length}</strong>
                  </article>
                </div>
                <div className="owner-statement-list">
                  {ownerStatements.length ? (
                    ownerStatements.map((statement) => (
                      <article className="owner-statement-item" key={statement.id}>
                        <div>
                          <span>
                            {formatOwnerStatementStatus(statement)}
                            {" · "}
                            {statement.propertyName || "Objekt"}
                          </span>
                          <strong>{statement.periodLabel}</strong>
                          <p>
                            Umsatz {formatCurrency(statement.grossRevenue)}
                            {" · "}
                            Morrow {formatCurrency(statement.morrowFee)}
                            {" · "}
                            Kosten {formatCurrency(statement.otherCosts)}
                          </p>
                        </div>
                        <div>
                          <strong>{formatCurrency(statement.ownerPayout)}</strong>
                          {statement.documentUrl ? (
                            <a href={statement.documentUrl} target="_blank" rel="noreferrer">
                              Beleg öffnen
                            </a>
                          ) : null}
                        </div>
                      </article>
                    ))
                  ) : (
                    <p>
                      Noch keine Monatsabrechnung freigegeben. Morrow ergänzt
                      sie nach bestätigten und bezahlten Aufenthalten.
                    </p>
                  )}
                </div>
              </>
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
