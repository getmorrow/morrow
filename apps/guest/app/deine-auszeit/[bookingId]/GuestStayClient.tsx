"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@morrow/supabase";

type GuestView = "home" | "plan" | "booking" | "local" | "help" | "feedback" | "again";

type GuestBooking = {
  id?: string;
  leadId?: string;
  customerId?: string;
  status?: string;
  paymentStatus?: string;
  name?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  packageName?: string;
  packageSlug?: string;
  selectedDate?: string;
  dateLabel?: string;
  guests?: string;
  adults?: string;
  children?: string;
  childAges?: string;
  dog?: string;
  checkInStatus?: string;
  experienceStatus?: string;
  internalNote?: string;
  createdAt?: string;
  updatedAt?: string;
};

type GuestPackage = {
  id?: string;
  slug?: string;
  name?: string;
  audience?: string;
  location?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  price?: string;
  concretePrice?: string;
  image?: string;
  heroImage?: string;
  stay?: {
    name?: string;
    location?: string;
    address?: string;
    image?: string;
    checkInType?: string;
    checkInInstructions?: string;
    arrivalWindow?: string;
    arrivalLatest?: string;
    checkoutUntil?: string;
    propertySupportType?: string;
    propertySupportName?: string;
    houseRules?: string[];
    amenities?: string[];
  };
  experienceItems?: Array<{
    title?: string;
    name?: string;
    role?: string;
    guestNotes?: string;
    description?: string;
  }>;
};

type LocalPlace = {
  id: string;
  name: string;
  category: string;
  status: string;
  address?: string | null;
  website?: string | null;
  reservation_url?: string | null;
  menu_url?: string | null;
  rating?: number | null;
  payload?: Record<string, unknown>;
};

type GuestStayPayload = {
  booking?: GuestBooking;
  package?: GuestPackage;
};

const viewLabels: Record<GuestView, string> = {
  home: "Start",
  plan: "Auszeit",
  booking: "Buchung",
  local: "Vor Ort",
  help: "Hilfe",
  feedback: "Feedback",
  again: "Auszeiten",
};

const viewIcons: Record<GuestView, string> = {
  home: "⌂",
  plan: "✦",
  booking: "□",
  local: "⌖",
  help: "♡",
  feedback: "☆",
  again: "↻",
};

const allowedStatuses = ["Bezahlt", "Vor Anreise", "Aktiv", "Abgeschlossen"];

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "schön";
}

function formatStayDate(value?: string) {
  if (!value) return "Termin liegt in eurer Buchung";
  return value;
}

function daysUntilFromLabel(label?: string) {
  if (!label) return null;
  const match = label.match(/(\d{1,2})\.\s*([A-Za-zÄÖÜäöü]+)/);
  if (!match) return null;
  const months: Record<string, number> = {
    januar: 0,
    februar: 1,
    märz: 2,
    maerz: 2,
    april: 3,
    mai: 4,
    juni: 5,
    juli: 6,
    august: 7,
    september: 8,
    oktober: 9,
    november: 10,
    dezember: 11,
  };
  const month = months[match[2].toLowerCase()];
  if (month === undefined) return null;
  const now = new Date();
  const arrival = new Date(now.getFullYear(), month, Number(match[1]));
  if (arrival.getTime() < now.getTime() - 1000 * 60 * 60 * 24 * 30) {
    arrival.setFullYear(arrival.getFullYear() + 1);
  }
  return Math.max(0, Math.ceil((arrival.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function packageImage(packageItem?: GuestPackage | null) {
  return (
    packageItem?.heroImage ||
    packageItem?.image ||
    packageItem?.stay?.image ||
    "/brand/generated/morrow-spo-couple.png"
  );
}

function visibleLocalPlaces(places: LocalPlace[], packageItem?: GuestPackage | null) {
  const audience = packageItem?.audience === "couples" ? "couples" : packageItem?.audience === "families" ? "families" : "";
  return places
    .filter((place) => place.status === "approved")
    .filter((place) => {
      const fit = place.payload?.packageFit;
      if (!audience || !Array.isArray(fit)) return true;
      return fit.length === 0 || fit.includes(audience);
    })
    .slice(0, 8);
}

function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    food: "Essen",
    beach: "Strand",
    experience: "Erlebnis",
    event: "Veranstaltung",
    shopping: "Praktisch",
    emergency: "Hilfe",
    weather: "Wetter",
    tide: "Gezeiten",
  };
  return labels[category] ?? category;
}

export function GuestStayClient({
  bookingId,
  accessCode,
  initialView,
}: {
  bookingId: string;
  accessCode: string;
  initialView: string;
}) {
  const [activeView, setActiveView] = useState<GuestView>(
    initialView === "feedback" ? "feedback" : "home",
  );
  const [payload, setPayload] = useState<GuestStayPayload | null>(null);
  const [places, setPlaces] = useState<LocalPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSent, setSupportSent] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState("5");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      let supabase: ReturnType<typeof createSupabaseBrowserClient>;

      try {
        supabase = createSupabaseBrowserClient();
      } catch {
        setError("Der Gästebereich ist lokal noch nicht mit Supabase verbunden. Bitte prüft die Umgebungsvariablen.");
        setLoading(false);
        return;
      }

      const { data, error: stayError } = await supabase.rpc("get_guest_stay", {
        p_booking_id: bookingId,
        p_access_code: accessCode,
      });

      if (cancelled) return;

      if (stayError || !data) {
        setError("Wir konnten diesen Gästebereich nicht öffnen. Bitte prüft euren Link oder meldet euch bei Morrow.");
        setLoading(false);
        return;
      }

      setPayload(data as GuestStayPayload);

      const { data: localData } = await supabase
        .from("local_places")
        .select("id,name,category,status,address,website,reservation_url,menu_url,rating,payload")
        .eq("status", "approved")
        .order("updated_at", { ascending: false })
        .limit(80);

      if (!cancelled) {
        setPlaces((localData ?? []) as LocalPlace[]);
        setLoading(false);
      }
    }

    void load().catch(() => {
      if (!cancelled) {
        setError("Der Gästebereich ist gerade nicht erreichbar. Bitte versucht es gleich noch einmal.");
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [accessCode, bookingId]);

  const booking = payload?.booking;
  const packageItem = payload?.package;
  const completed = booking?.status === "Abgeschlossen";
  const guestName = text(booking?.name, text(booking?.customerName, "eure"));
  const stayDate = formatStayDate(booking?.selectedDate ?? booking?.dateLabel);
  const countdown = daysUntilFromLabel(booking?.selectedDate ?? booking?.dateLabel);
  const localPlaces = useMemo(() => visibleLocalPlaces(places, packageItem), [places, packageItem]);
  const navItems: GuestView[] = completed
    ? ["home", "booking", "feedback", "again"]
    : ["home", "plan", "booking", "local", "help"];

  async function sendSupport() {
    if (!supportMessage.trim()) return;
    let supabase: ReturnType<typeof createSupabaseBrowserClient>;

    try {
      supabase = createSupabaseBrowserClient();
    } catch {
      setSupportSent(false);
      return;
    }

    const { error: supportError } = await supabase.from("support_messages").insert({
      id: crypto.randomUUID(),
      lead_id: booking?.leadId ?? null,
      category: "general",
      message: supportMessage.trim(),
      urgency: "normal",
      payload: {
        bookingId,
        source: "next-guest",
        guestName,
        packageName: booking?.packageName ?? packageItem?.name ?? null,
      },
    });

    if (!supportError) {
      setSupportSent(true);
      setSupportMessage("");
    }
  }

  async function sendFeedback() {
    let supabase: ReturnType<typeof createSupabaseBrowserClient>;

    try {
      supabase = createSupabaseBrowserClient();
    } catch {
      setFeedbackSent(false);
      return;
    }

    const { error: feedbackError } = await supabase.from("guest_feedback").insert({
      id: crypto.randomUUID(),
      lead_id: booking?.leadId ?? null,
      booking_id: bookingId,
      rating: Number(feedbackRating),
      return_interest: "maybe",
      payload: {
        source: "next-guest",
        loved: feedbackText.trim(),
        packageName: booking?.packageName ?? packageItem?.name ?? null,
      },
    });

    if (!feedbackError) {
      setFeedbackSent(true);
      setFeedbackText("");
    }
  }

  if (loading) {
    return (
      <main className="guest-page">
        <div className="guest-shell">
          <header className="guest-app-header">
            <img alt="morrow" src="/brand/morrow-wordmark-offblack.svg" />
          </header>
          <section className="guest-loading-card">
            <p className="eyebrow">Deine Auszeit</p>
            <h1>Zugang wird geprüft.</h1>
          </section>
        </div>
      </main>
    );
  }

  if (error || !booking || !allowedStatuses.includes(booking.status ?? "")) {
    return (
      <main className="guest-page">
        <div className="guest-shell">
          <header className="guest-app-header">
            <img alt="morrow" src="/brand/morrow-wordmark-offblack.svg" />
          </header>
          <section className="guest-login-hero">
            <p className="eyebrow">Deine Auszeit</p>
            <h1>Dieser Zugang ist nicht verfügbar.</h1>
            <p>{error || "Bitte nutzt den persönlichen Link aus eurer Buchungsbestätigung."}</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="guest-page has-bottom-nav">
      <div className="guest-shell">
        <header className="guest-app-header guest-app-header-floating">
          <a aria-label="Morrow Startseite" href="https://www.getmorrow.de">
            <img alt="morrow" src="/brand/morrow-wordmark-offblack.svg" />
          </a>
          <span>{completed ? "Willkommen zurück" : "Gästebereich"}</span>
        </header>

        <section className="guest-hero-card">
          <img alt="" src={packageImage(packageItem)} />
          <div>
            <p className="eyebrow">{booking.packageName ?? packageItem?.name ?? "Morrow Auszeit"}</p>
            <h1>
              {completed
                ? `${firstName(guestName)}, schön, dass ihr da wart.`
                : `${firstName(guestName)}, eure Auszeit ist vorbereitet.`}
            </h1>
            <p>
              {completed
                ? "Eure vergangene Buchung bleibt hier sichtbar. Wenn ihr wieder raus möchtet, findet ihr direkt den Weg zur nächsten Auszeit."
                : "Alles Wichtige liegt hier zusammen: Anreise, Buchung, Empfehlungen vor Ort und Hilfe, wenn ihr sie braucht."}
            </p>
          </div>
        </section>

        {activeView === "home" && (
          <section className="guest-section-stack">
            <div className="guest-status-card">
              <span>{completed ? "Abgeschlossen" : countdown === null ? "Vorbereitet" : `Noch ${countdown} Tage`}</span>
              <h2>{completed ? "Zeit für einen Blick zurück." : "Eure Auszeit rückt näher."}</h2>
              <p>{completed ? "Teilt kurz, was gut war. Das hilft uns, Morrow spürbar besser zu machen." : `${stayDate}. Wir halten die wichtigsten Hinweise für euch bereit.`}</p>
            </div>
            <div className="guest-card-grid">
              <article>
                <span>Heute wichtig</span>
                <strong>{completed ? "Feedback geben" : "Anreise prüfen"}</strong>
                <p>{completed ? "Ein kurzer Eindruck reicht." : "Schlüssel, Zeitfenster und Unterkunftshinweise findet ihr in Buchung."}</p>
              </article>
              <article>
                <span>Vor Ort</span>
                <strong>{localPlaces.length} kuratierte Orte</strong>
                <p>Restaurants, Strand, Erlebnisse und praktische Hinweise werden bewusst reduziert gezeigt.</p>
              </article>
            </div>
          </section>
        )}

        {activeView === "plan" && (
          <section className="guest-content-card">
            <p className="eyebrow">Meine Auszeit</p>
            <h2>{packageItem?.title ?? packageItem?.name ?? booking.packageName}</h2>
            <p>{packageItem?.description ?? "Unterkunft, Erlebnis und Ort sind so kombiniert, dass ihr leichter ankommt und weniger selbst planen müsst."}</p>
            <div className="guest-list">
              {(packageItem?.experienceItems ?? []).slice(0, 4).map((experience, index) => (
                <article key={`${experience.title ?? experience.name}-${index}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{experience.title ?? experience.name ?? "Erlebnis"}</strong>
                    <p>{experience.guestNotes ?? experience.description ?? "Wird passend zu eurer Auszeit vorbereitet."}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeView === "booking" && (
          <section className="guest-content-card">
            <p className="eyebrow">Buchung</p>
            <h2>{stayDate}</h2>
            <div className="guest-detail-grid">
              <article><span>Status</span><strong>{booking.status}</strong></article>
              <article><span>Zahlung</span><strong>{booking.paymentStatus ?? "offen"}</strong></article>
              <article><span>Gäste</span><strong>{booking.guests ?? "in Buchung"}</strong></article>
              <article><span>Hund</span><strong>{booking.dog ?? "nicht angegeben"}</strong></article>
            </div>
            <div className="guest-info-block">
              <span>Anreise und Schlüssel</span>
              <p>{packageItem?.stay?.checkInInstructions ?? "Die finalen Check-in-Informationen werden vor der Anreise hier ergänzt."}</p>
            </div>
            <div className="guest-info-block">
              <span>Unterkunft</span>
              <p>{packageItem?.stay?.name ?? "Eure Unterkunft"} · {packageItem?.stay?.address ?? packageItem?.stay?.location ?? packageItem?.location ?? "Sankt Peter-Ording"}</p>
            </div>
          </section>
        )}

        {activeView === "local" && (
          <section className="guest-content-card">
            <p className="eyebrow">Vor Ort</p>
            <h2>Schnelle Entscheidungen statt neuer Suche.</h2>
            <p>Hier erscheinen nur Orte, die von Morrow freigegeben wurden und zu eurer Auszeit passen.</p>
            <div className="guest-place-list">
              {localPlaces.map((place) => (
                <article key={place.id}>
                  <span>{categoryLabel(place.category)}</span>
                  <strong>{place.name}</strong>
                  <p>{place.address ?? text(place.payload?.description, "Für eure Auszeit kuratiert.")}</p>
                  <div>
                    {place.rating ? <small>{place.rating.toFixed(1)} Bewertung</small> : null}
                    {place.website ? <a href={place.website} target="_blank" rel="noreferrer">Website</a> : null}
                    {place.reservation_url ? <a href={place.reservation_url} target="_blank" rel="noreferrer">Reservieren</a> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeView === "help" && (
          <section className="guest-content-card">
            <p className="eyebrow">Hilfe</p>
            <h2>Schreibt uns, wenn ihr Orientierung braucht.</h2>
            <p>Für Fragen zur Auszeit, Empfehlung oder zum Ablauf. Objektprobleme werden je nach Unterkunft an den zuständigen Partner weitergegeben.</p>
            <textarea value={supportMessage} onChange={(event) => setSupportMessage(event.target.value)} placeholder="Was können wir für euch klären?" />
            <button type="button" onClick={sendSupport}>{supportSent ? "Nachricht gesendet" : "Nachricht senden"}</button>
          </section>
        )}

        {activeView === "feedback" && (
          <section className="guest-content-card">
            <p className="eyebrow">Feedback</p>
            <h2>Wie hat sich eure Auszeit angefühlt?</h2>
            <p>Ein kurzer Eindruck hilft uns mehr als ein perfekter Text.</p>
            <select value={feedbackRating} onChange={(event) => setFeedbackRating(event.target.value)}>
              <option value="5">5 · sehr gut</option>
              <option value="4">4 · gut</option>
              <option value="3">3 · okay</option>
              <option value="2">2 · nicht stimmig</option>
              <option value="1">1 · enttäuschend</option>
            </select>
            <textarea value={feedbackText} onChange={(event) => setFeedbackText(event.target.value)} placeholder="Was war besonders gut oder sollte besser werden?" />
            <button type="button" onClick={sendFeedback}>{feedbackSent ? "Danke für euer Feedback" : "Feedback senden"}</button>
          </section>
        )}

        {activeView === "again" && (
          <section className="guest-content-card">
            <p className="eyebrow">Wieder raus</p>
            <h2>Vielleicht ist die nächste Auszeit schon näher, als ihr denkt.</h2>
            <p>Wenn ihr wieder ein paar Tage Nordsee braucht, könnt ihr euch die aktuellen Auszeiten ansehen.</p>
            <a className="guest-primary-link" href="https://www.getmorrow.de/auszeiten">Auszeiten ansehen</a>
          </section>
        )}
      </div>

      <nav className="guest-bottom-nav" aria-label="Gästebereich Navigation">
        {navItems.map((item) => (
          <button key={item} className={activeView === item ? "is-active" : ""} type="button" onClick={() => setActiveView(item)}>
            <span>{viewIcons[item]}</span>
            {viewLabels[item]}
          </button>
        ))}
      </nav>
    </main>
  );
}
