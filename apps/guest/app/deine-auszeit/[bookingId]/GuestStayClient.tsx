"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@morrow/supabase";
import { GuestLocalMap, type GuestMapPlace } from "./GuestLocalMap";

type GuestView = "home" | "plan" | "booking" | "local" | "help" | "feedback" | "again";
type LocalFilter = "all" | "weather" | "tide" | "beach" | "food" | "experience" | "event" | "shopping" | "emergency";
type SupportCategory = "general" | "arrival" | "property" | "experience" | "local";
type SupportUrgency = "normal" | "soon" | "urgent";

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
    lat?: number | null;
    lng?: number | null;
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
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  website?: string | null;
  reservation_url?: string | null;
  menu_url?: string | null;
  rating?: number | null;
  opening_hours?: Record<string, unknown> | null;
  package_fit?: string[];
  payload?: Record<string, unknown>;
};

type WeatherDay = {
  date: string;
  min: number;
  max: number;
  code: number;
  precipitation: number;
  wind: number;
};

type GuestStayPayload = {
  booking?: GuestBooking;
  package?: GuestPackage;
};

const devGuestStayPayload: GuestStayPayload = {
  booking: {
    id: "11111111-1111-4111-8111-111111111111",
    leadId: "11111111-1111-4111-8111-111111111111",
    customerId: "11111111-1111-4111-8111-111111111111",
    status: "Vor Anreise",
    paymentStatus: "bezahlt",
    name: "Sophie Krüger",
    customerName: "Sophie Krüger",
    email: "sophie.krueger@example.com",
    phone: "+49 170 0000000",
    packageName: "Couple Reset",
    packageSlug: "couple-reset",
    selectedDate: "12.–16. August",
    guests: "2",
    dog: "nein",
    checkInStatus: "vorbereitet",
    experienceStatus: "vorbereitet",
  },
  package: {
    id: "pkg-couple-reset",
    slug: "couple-reset",
    name: "Couple Reset",
    audience: "couples",
    location: "Sankt Peter-Ording",
    title: "Raus aus dem Alltag. Rein in gemeinsame Zeit.",
    description:
      "Unterkunft, ruhiger Rhythmus und passende Empfehlungen sind vorbereitet, damit ihr ankommt, ohne vorher alles selbst zu sortieren.",
    image: "/brand/generated/morrow-spo-couple.png",
    stay: {
      name: "Nordsee Rückzugsort",
      location: "Sankt Peter-Ording Bad",
      address: "Die genaue Adresse liegt vor Anreise bereit.",
      image: "/brand/generated/morrow-spo-couple.png",
      checkInType: "Schlüsselsafe",
      checkInInstructions: "Check-in ab 16 Uhr. Den finalen Code erhaltet ihr kurz vor der Anreise.",
      propertySupportType: "morrow",
      propertySupportName: "Morrow",
      houseRules: ["Rauchen ist nicht erlaubt.", "Ruhezeiten vor Ort beachten."],
      amenities: ["Küche", "WLAN", "ruhiger Wohnbereich"],
    },
    experienceItems: [
      {
        title: "Ruhiger Abend zu zweit",
        role: "included",
        guestNotes: "Ein vorbereiteter Vorschlag für einen Abend ohne Suche und Abstimmung.",
      },
      {
        title: "Wellness oder Yoga",
        role: "optional",
        guestNotes: "Optionaler Baustein, wenn es zu eurem Anlass und Reiserhythmus passt.",
      },
    ],
  },
};

const devCompletedGuestStayPayload: GuestStayPayload = {
  ...devGuestStayPayload,
  booking: {
    ...devGuestStayPayload.booking,
    id: "22222222-2222-4222-8222-222222222222",
    leadId: "22222222-2222-4222-8222-222222222222",
    customerId: "22222222-2222-4222-8222-222222222222",
    status: "Abgeschlossen",
    selectedDate: "12.–16. August",
  },
};

const devLocalPlaces: LocalPlace[] = [
  {
    id: "dev-food-arche-noah",
    name: "Arche Noah am Strandabschnitt Bad",
    category: "food",
    status: "approved",
    lat: 54.312,
    lng: 8.603,
    address: "Pfahlbau-Restaurant am Strandabschnitt Bad",
    website: "https://www.arche-noah-spo.de/",
    reservation_url: "https://www.arche-noah-spo.de/",
    rating: 4.4,
    payload: {
      cuisine: "Nordsee, Fisch, unkompliziert",
      bestFor: ["Strandtag", "gut erreichbar", "Abendessen"],
      description: "Gut erreichbares Essen direkt am Wasser, wenn ihr nicht neu suchen möchtet.",
    },
  },
  {
    id: "dev-beach-bad",
    name: "Strandabschnitt Bad",
    category: "beach",
    status: "approved",
    lat: 54.314,
    lng: 8.607,
    address: "Strandabschnitt Bad, Sankt Peter-Ording",
    payload: {
      bestFor: ["kurze Wege", "Spaziergang", "Pfahlbauten"],
      description: "Ein guter erster Strandmoment, wenn ihr schnell ans Wasser möchtet.",
    },
  },
  {
    id: "dev-event-market",
    name: "Wochenmarkt im Ort",
    category: "event",
    status: "approved",
    lat: 54.306,
    lng: 8.642,
    address: "Sankt Peter-Ording",
    payload: {
      bestFor: ["Vormittag", "lokal", "ruhig"],
      description: "Kleiner lokaler Impuls, wenn er zeitlich zu eurer Auszeit passt.",
    },
  },
  {
    id: "dev-experience-watt",
    name: "Wattmoment mit Guide",
    category: "experience",
    status: "approved",
    lat: 54.301,
    lng: 8.598,
    payload: {
      bestFor: ["Natur", "Nordseegefühl", "bewusst geplant"],
      description: "Ein kuratierter Naturmoment, wenn Tide, Wetter und Tagesrhythmus passen.",
    },
  },
];

function isDevGuestAccess(bookingId: string, accessCode: string) {
  return process.env.NODE_ENV !== "production" && ["dev-active", "dev-completed"].includes(bookingId) && accessCode === "MORROWDEV";
}

function devGuestPayload(bookingId: string) {
  return bookingId === "dev-completed" ? devCompletedGuestStayPayload : devGuestStayPayload;
}

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

const supportCategoryLabels: Record<SupportCategory, string> = {
  general: "Allgemeine Frage",
  arrival: "Anreise",
  property: "Unterkunft",
  experience: "Erlebnis",
  local: "Vor Ort",
};

const supportUrgencyLabels: Record<SupportUrgency, string> = {
  normal: "Normal",
  soon: "Bald klären",
  urgent: "Dringend",
};

const localFilterOrder: LocalFilter[] = [
  "all",
  "weather",
  "tide",
  "beach",
  "food",
  "experience",
  "event",
  "shopping",
  "emergency",
];

const localFilterLabels: Record<LocalFilter, string> = {
  all: "Alle",
  weather: "Wetter",
  tide: "Gezeiten",
  beach: "Strand",
  food: "Essen",
  experience: "Erlebnisse",
  event: "Veranstaltungen",
  shopping: "Praktisch",
  emergency: "Hilfe",
};

const weatherPreview = [
  { label: "Heute", value: "18°", detail: "Windig, kurze Strandfenster" },
  { label: "Morgen", value: "19°", detail: "Hell, gute Wege ans Wasser" },
  { label: "3 Tage", value: "17-20°", detail: "Wechselhaft, Plan B bereithalten" },
  { label: "14 Tage", value: "Nordsee typisch", detail: "Vor Anreise erneut prüfen" },
];

const tidePreview = [
  { label: "Morgens", value: "Ebbe prüfen", detail: "Watt nur mit aktuellem Stand und sicherer Route." },
  { label: "Nachmittags", value: "Wasser kommt", detail: "Strandspaziergänge lieber nah am Übergang planen." },
  { label: "Hinweis", value: "Tagesaktuell", detail: "Live-Werte werden als eigener Datenbaustein ergänzt." },
];

function weatherCodeLabel(code: number) {
  if ([0, 1].includes(code)) return "hell";
  if ([2, 3].includes(code)) return "bewölkt";
  if ([45, 48].includes(code)) return "neblig";
  if ([51, 53, 55, 56, 57].includes(code)) return "Nieselregen";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Regen";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Schnee";
  if ([95, 96, 99].includes(code)) return "Gewitter";
  return "wechselhaft";
}

function formatWeatherDate(value: string, index: number) {
  if (index === 0) return "Heute";
  if (index === 1) return "Morgen";
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }).format(date);
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function payloadText(payload: Record<string, unknown> | undefined, keys: string[], fallback = "") {
  if (!payload) return fallback;
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

function payloadList(payload: Record<string, unknown> | undefined, keys: string[]) {
  if (!payload) return [];
  for (const key of keys) {
    const value = payload[key];
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === "string" && value.trim()) {
      return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

function payloadImages(payload: Record<string, unknown> | undefined) {
  if (!payload) return [];
  for (const key of ["images", "gallery", "media"]) {
    const value = payload[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
    if (typeof value === "string" && value.trim()) {
      return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
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
      const fit = Array.isArray(place.package_fit) && place.package_fit.length
        ? place.package_fit
        : place.payload?.packageFit;
      if (!audience || !Array.isArray(fit)) return true;
      return fit.length === 0 || fit.map(String).includes(audience);
    })
    .slice(0, 24);
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

function normalizeCategory(category: string): LocalFilter {
  if (category === "service") return "emergency";
  if (localFilterOrder.includes(category as LocalFilter)) return category as LocalFilter;
  return "all";
}

function placeDescription(place: LocalPlace) {
  return (
    payloadText(place.payload, ["description", "guestDescription", "routeNote", "morrowNote"], place.address || "Für eure Auszeit kuratiert.")
  );
}

function placeDetailImage(place: LocalPlace, packageItem?: GuestPackage | null) {
  return payloadText(place.payload, ["image"]) || payloadImages(place.payload)[0] || packageImage(packageItem);
}

function placeMeta(place: LocalPlace) {
  const parts = [
    categoryLabel(place.category),
    payloadText(place.payload, ["cuisine", "meta"]),
    place.rating ? `${place.rating.toFixed(1)} Bewertung` : payloadText(place.payload, ["ratingValue"]),
  ].filter(Boolean);
  return parts.slice(0, 2).join(" · ");
}

function placeActions(place: LocalPlace) {
  return [
    place.reservation_url ? { label: "Reservieren", href: place.reservation_url } : null,
    place.menu_url ? { label: "Speisekarte", href: place.menu_url } : null,
    place.website ? { label: "Website", href: place.website } : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>;
}

function openingHoursText(place: LocalPlace) {
  const payloadValue = payloadText(place.payload, ["openingHours", "openingHoursNote", "hours"]);
  if (payloadValue) return payloadValue;
  const note = place.opening_hours?.note;
  if (typeof note === "string" && note.trim()) return note.trim();
  return "";
}

function eventTimeText(place: LocalPlace) {
  const date = payloadText(place.payload, ["eventDate", "startsOn", "date"]);
  const time = payloadText(place.payload, ["eventTime", "time"]);
  return [date, time].filter(Boolean).join(" · ");
}

function localPlaceToMapPlace(place: LocalPlace): GuestMapPlace | null {
  if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng)) return null;
  return {
    id: place.id,
    name: place.name,
    category: normalizeCategory(place.category),
    lat: Number(place.lat),
    lng: Number(place.lng),
  };
}

function stayMapPlace(packageItem?: GuestPackage | null): GuestMapPlace {
  const lat = typeof packageItem?.stay?.lat === "number" ? packageItem.stay.lat : 54.309;
  const lng = typeof packageItem?.stay?.lng === "number" ? packageItem.stay.lng : 8.633;
  return {
    id: "stay",
    name: packageItem?.stay?.name || "Eure Auszeit",
    category: "stay",
    lat,
    lng,
  };
}

function stayAsLocalPlace(packageItem?: GuestPackage | null): LocalPlace {
  const mapPlace = stayMapPlace(packageItem);
  return {
    id: "stay",
    name: mapPlace.name,
    category: "stay",
    status: "approved",
    lat: mapPlace.lat,
    lng: mapPlace.lng,
    address: packageItem?.stay?.address || packageItem?.stay?.location || packageItem?.location || "Sankt Peter-Ording",
    payload: {
      description:
        packageItem?.stay?.checkInInstructions ||
        "Eure Unterkunft ist der Ausgangspunkt für Anreise, Strand, Empfehlungen und die vorbereitete Auszeit.",
      bestFor: ["Ankommen", "Orientierung", "Ausgangspunkt"],
      image: packageItem?.stay?.image || packageImage(packageItem),
    },
  };
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
  const [supportCategory, setSupportCategory] = useState<SupportCategory>("general");
  const [supportUrgency, setSupportUrgency] = useState<SupportUrgency>("normal");
  const [supportSent, setSupportSent] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState("5");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [localFilter, setLocalFilter] = useState<LocalFilter>("all");
  const [selectedPlace, setSelectedPlace] = useState<LocalPlace | null>(null);
  const [weatherDays, setWeatherDays] = useState<WeatherDay[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherRange, setWeatherRange] = useState<"today" | "3" | "14">("today");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      if (isDevGuestAccess(bookingId, accessCode)) {
        setPayload(devGuestPayload(bookingId));
        setPlaces(devLocalPlaces);
        setLoading(false);
        return;
      }

      let supabase: ReturnType<typeof createSupabaseBrowserClient>;

      try {
        supabase = createSupabaseBrowserClient();
      } catch {
        setError("Der Gästebereich ist gerade nicht erreichbar. Bitte versucht es gleich noch einmal oder meldet euch bei Morrow.");
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
        .select("id,name,category,status,lat,lng,address,website,reservation_url,menu_url,rating,opening_hours,package_fit,payload")
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
  const propertySupportType = packageItem?.stay?.propertySupportType ?? "morrow";
  const propertySupportName = packageItem?.stay?.propertySupportName || (propertySupportType === "morrow" ? "Morrow" : "den Unterkunftspartner");
  const morrowHandlesProperty = propertySupportType === "morrow";
  const stayDate = formatStayDate(booking?.selectedDate ?? booking?.dateLabel);
  const countdown = daysUntilFromLabel(booking?.selectedDate ?? booking?.dateLabel);
  const localPlaces = useMemo(() => visibleLocalPlaces(places, packageItem), [places, packageItem]);
  const nextEscapeCards = [
    {
      title: packageItem?.name?.includes("Couple") ? "Family Escape" : "Couple Reset",
      text: packageItem?.name?.includes("Couple")
        ? "Wenn ihr das nächste Mal mit Kindern, Großeltern oder Freunden ans Meer möchtet."
        : "Wenn ihr das nächste Mal bewusst zu zweit raus aus dem Alltag möchtet.",
      href: packageItem?.name?.includes("Couple")
        ? "https://www.getmorrow.de/auszeiten/family-escape"
        : "https://www.getmorrow.de/auszeiten/couple-reset",
    },
    {
      title: "Neue Auszeiten",
      text: "Alle kuratierten Aufenthalte, sobald neue Termine und Unterkünfte freigegeben sind.",
      href: "https://www.getmorrow.de/auszeiten",
    },
  ];
  const localFilters = useMemo(() => {
    const categories = new Set(localPlaces.map((place) => normalizeCategory(place.category)));
    categories.add("weather");
    categories.add("tide");
    categories.add("all");
    return localFilterOrder.filter((filter) => categories.has(filter));
  }, [localPlaces]);
  const filteredLocalPlaces = localFilter === "all"
    ? localPlaces.slice(0, 10)
    : localPlaces.filter((place) => normalizeCategory(place.category) === localFilter).slice(0, 12);
  const selectedFilterLabel = localFilterLabels[localFilter];
  const showPlaceResults = localFilter !== "weather" && localFilter !== "tide";
  const mapPlaces = useMemo(() => {
    const stay = stayMapPlace(packageItem);
    const sourcePlaces = localFilter === "all"
      ? localPlaces
      : localPlaces.filter((place) => normalizeCategory(place.category) === localFilter);
    const placePins = sourcePlaces
      .map(localPlaceToMapPlace)
      .filter((place): place is GuestMapPlace => Boolean(place));
    return [stay, ...placePins];
  }, [localFilter, localPlaces, packageItem]);
  const navItems: GuestView[] = completed
    ? ["home", "booking", "feedback", "again"]
    : ["home", "plan", "booking", "local", "help"];
  const weatherPlace = stayMapPlace(packageItem);
  const visibleWeatherDays = weatherRange === "today"
    ? weatherDays.slice(0, 1)
    : weatherRange === "3"
      ? weatherDays.slice(0, 3)
      : weatherDays.slice(0, 14);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      if (!packageItem) return;
      setWeatherLoading(true);

      try {
        const params = new URLSearchParams({
          latitude: String(weatherPlace.lat),
          longitude: String(weatherPlace.lng),
          daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max",
          timezone: "Europe/Berlin",
          forecast_days: "14",
        });
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
        if (!response.ok) throw new Error("weather request failed");
        const data = await response.json();
        const days: WeatherDay[] = (data.daily?.time ?? []).map((date: string, index: number) => ({
          date,
          min: Number(data.daily?.temperature_2m_min?.[index] ?? 0),
          max: Number(data.daily?.temperature_2m_max?.[index] ?? 0),
          code: Number(data.daily?.weather_code?.[index] ?? 3),
          precipitation: Number(data.daily?.precipitation_sum?.[index] ?? 0),
          wind: Number(data.daily?.wind_speed_10m_max?.[index] ?? 0),
        }));
        if (!cancelled) setWeatherDays(days);
      } catch {
        if (!cancelled) setWeatherDays([]);
      } finally {
        if (!cancelled) setWeatherLoading(false);
      }
    }

    void loadWeather();

    return () => {
      cancelled = true;
    };
  }, [packageItem, weatherPlace.lat, weatherPlace.lng]);

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
      category: supportCategory,
      message: supportMessage.trim(),
      urgency: supportUrgency,
      payload: {
        bookingId,
        source: "next-guest",
        guestName,
        supportCategory,
        supportUrgency,
        propertySupportType,
        propertySupportName,
        packageName: booking?.packageName ?? packageItem?.name ?? null,
      },
    });

    if (!supportError) {
      setSupportSent(true);
      setSupportMessage("");
      setSupportCategory("general");
      setSupportUrgency("normal");
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
            {completed ? (
              <>
                <div className="guest-card-grid">
                  <article>
                    <span>Rückblick</span>
                    <strong>{booking.packageName ?? packageItem?.name ?? "Eure Morrow Auszeit"}</strong>
                    <p>{stayDate}. Eure Buchungsdetails bleiben sichtbar, damit ihr später noch einmal nachsehen könnt.</p>
                  </article>
                  <article>
                    <span>Feedback</span>
                    <strong>Was sollen wir behalten?</strong>
                    <p>Ein kurzer Eindruck hilft uns, kommende Auszeiten noch ruhiger und passender vorzubereiten.</p>
                  </article>
                </div>
                <section className="guest-return-section">
                  <div>
                    <p className="eyebrow">Wieder raus</p>
                    <h2>Wenn die nächste Auszeit ruft.</h2>
                    <p>Wir zeigen euch bewusst nur wenige Wege zurück: dieselbe Ruhe, ein anderer Anlass oder eine neue Zeit am Wasser.</p>
                  </div>
                  <div className="guest-return-slider">
                    {nextEscapeCards.map((card) => (
                      <a href={card.href} key={card.title}>
                        <span>Morrow Auszeit</span>
                        <strong>{card.title}</strong>
                        <p>{card.text}</p>
                      </a>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <div className="guest-card-grid">
                <article>
                  <span>Heute wichtig</span>
                  <strong>Anreise prüfen</strong>
                  <p>Schlüssel, Zeitfenster und Unterkunftshinweise findet ihr in Buchung.</p>
                </article>
                <article>
                  <span>Vor Ort</span>
                  <strong>{localPlaces.length} kuratierte Orte</strong>
                  <p>Restaurants, Strand, Erlebnisse und praktische Hinweise werden bewusst reduziert gezeigt.</p>
                </article>
              </div>
            )}
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
            <div className="guest-map-card">
              <div className="guest-map-visual" aria-label="Interaktive Karte Sankt Peter-Ording">
                <GuestLocalMap
                  places={mapPlaces}
                  compactMarkers={localFilter === "all"}
                  onSelectPlace={(placeId) => {
                    if (placeId === "stay") {
                      setSelectedPlace(stayAsLocalPlace(packageItem));
                      return;
                    }
                    const place = localPlaces.find((item) => item.id === placeId);
                    if (place) setSelectedPlace(place);
                  }}
                />
                <div className="guest-map-overlay">
                  <span>{localFilter === "all" ? "In eurer Nähe" : selectedFilterLabel}</span>
                  <strong>{localFilter === "all" ? `${localPlaces.length} Orte` : `${Math.max(mapPlaces.length - 1, 0)} Orte`}</strong>
                </div>
              </div>
              <div className="guest-map-caption">
                <strong>{localFilter === "all" ? "Tippt Gruppen-Pins an, um Orte aufzulösen." : "Tippt einen Ort für Details."}</strong>
                <span>{localFilter === "all" ? "Der Drawer öffnet erst bei einem konkreten Ort." : "Route, Links und Hinweise liegen im Detail."}</span>
              </div>
            </div>

            <div className="guest-filter-row" aria-label="Vor-Ort-Filter">
              {localFilters.map((filter) => (
                <button
                  key={filter}
                  className={localFilter === filter ? "is-active" : ""}
                  type="button"
                  onClick={() => {
                    setLocalFilter(filter);
                    setSelectedPlace(null);
                  }}
                >
                  {localFilterLabels[filter]}
                </button>
              ))}
            </div>

            {(localFilter === "all" || localFilter === "weather") && (
              <section className="guest-local-module" aria-label="Wetter">
                <div className="guest-module-head">
                  <span>Wetter</span>
                  <strong>{weatherDays.length ? "Aktuelle Vorschau für SPO" : "Nordsee im Blick behalten"}</strong>
                </div>
                <div className="guest-weather-range" aria-label="Wetter Zeitraum">
                  {[
                    { id: "today", label: "Heute" },
                    { id: "3", label: "3 Tage" },
                    { id: "14", label: "14 Tage" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      className={weatherRange === item.id ? "is-active" : ""}
                      type="button"
                      onClick={() => setWeatherRange(item.id as "today" | "3" | "14")}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="guest-horizontal-cards">
                  {(visibleWeatherDays.length ? visibleWeatherDays : weatherPreview).map((item, index) => (
                    <article key={"date" in item ? item.date : item.label}>
                      <span>{"date" in item ? formatWeatherDate(item.date, index) : item.label}</span>
                      <strong>{"date" in item ? `${Math.round(item.max)}° / ${Math.round(item.min)}°` : item.value}</strong>
                      <p>
                        {"date" in item
                          ? `${weatherCodeLabel(item.code)}, ${Math.round(item.wind)} km/h Wind, ${item.precipitation.toLocaleString("de-DE", { maximumFractionDigits: 1 })} mm Regen.`
                          : item.detail}
                      </p>
                    </article>
                  ))}
                </div>
                {weatherLoading ? <p className="guest-live-note">Wetter wird aktualisiert.</p> : null}
                {weatherDays.length ? <p className="guest-live-note">Live-Daten über Open-Meteo. Vor Aktivitäten am Wasser bitte am Reisetag erneut prüfen.</p> : null}
              </section>
            )}

            {(localFilter === "all" || localFilter === "tide") && (
              <section className="guest-local-module" aria-label="Gezeiten">
                <div className="guest-module-head">
                  <span>Gezeiten</span>
                  <strong>Watt und Wasser bewusst planen</strong>
                </div>
                <div className="guest-horizontal-cards">
                  {tidePreview.map((item) => (
                    <article key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                      <p>{item.detail}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {showPlaceResults ? (
              <section className="guest-local-module">
                <div className="guest-module-head">
                  <span>{selectedFilterLabel}</span>
                  <strong>{localFilter === "all" ? "Kuratierte Auswahl" : `${filteredLocalPlaces.length} passende Orte`}</strong>
                </div>
                {filteredLocalPlaces.length ? (
                  <div className="guest-place-list">
                    {filteredLocalPlaces.map((place) => {
                      const bestFor = payloadList(place.payload, ["bestFor", "audiences"]).slice(0, 3);

                      return (
                        <article key={place.id}>
                          <span>{placeMeta(place)}</span>
                          <strong>{place.name}</strong>
                          <p>{placeDescription(place)}</p>
                          {bestFor.length ? (
                            <div className="guest-place-tags">
                              {bestFor.map((item) => <small key={item}>{item}</small>)}
                            </div>
                          ) : null}
                          <button type="button" onClick={() => setSelectedPlace(place)}>
                            Details ansehen
                          </button>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="guest-empty-state">
                    <strong>Noch keine freigegebenen Orte</strong>
                    <p>Wenn diese Kategorie zur Auszeit passt, ergänzt Morrow hier bewusst kuratierte Empfehlungen.</p>
                  </div>
                )}
              </section>
            ) : null}
          </section>
        )}

        {activeView === "help" && (
          <section className="guest-content-card">
            <p className="eyebrow">Hilfe</p>
            <h2>Schreibt uns, wenn ihr Orientierung braucht.</h2>
            <p>Für Fragen zur Auszeit, Empfehlung oder zum Ablauf. Wir sortieren eure Nachricht direkt richtig ein.</p>
            <div className="guest-support-routing">
              <article>
                <span>Auszeit & Empfehlungen</span>
                <strong>Morrow</strong>
                <p>Fragen zu Ablauf, Erlebnis, Empfehlungen oder Orientierung vor Ort laufen über uns.</p>
              </article>
              <article>
                <span>Unterkunft</span>
                <strong>{propertySupportName}</strong>
                <p>
                  {morrowHandlesProperty
                    ? "Bei dieser Unterkunft kümmern wir uns auch um Objektfragen und leiten intern weiter."
                    : "Bei konkreten Objektfragen beziehen wir den zuständigen Unterkunftspartner ein."}
                </p>
              </article>
            </div>
            <div className="guest-form-grid">
              <label>
                Thema
                <select value={supportCategory} onChange={(event) => setSupportCategory(event.target.value as SupportCategory)}>
                  {(Object.keys(supportCategoryLabels) as SupportCategory[]).map((category) => (
                    <option key={category} value={category}>{supportCategoryLabels[category]}</option>
                  ))}
                </select>
              </label>
              <label>
                Dringlichkeit
                <select value={supportUrgency} onChange={(event) => setSupportUrgency(event.target.value as SupportUrgency)}>
                  {(Object.keys(supportUrgencyLabels) as SupportUrgency[]).map((urgency) => (
                    <option key={urgency} value={urgency}>{supportUrgencyLabels[urgency]}</option>
                  ))}
                </select>
              </label>
            </div>
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
            <p>Wenn ihr wieder ein paar Tage Nordsee braucht, könnt ihr direkt in die aktuellen Auszeiten springen oder euch später persönlich melden.</p>
            <div className="guest-return-slider">
              {nextEscapeCards.map((card) => (
                <a href={card.href} key={card.title}>
                  <span>Morrow Auszeit</span>
                  <strong>{card.title}</strong>
                  <p>{card.text}</p>
                </a>
              ))}
            </div>
            <a className="guest-primary-link" href="https://www.getmorrow.de/auszeiten">Alle Auszeiten ansehen</a>
          </section>
        )}
      </div>

      {selectedPlace ? (
        <div className="guest-drawer-backdrop" onClick={() => setSelectedPlace(null)}>
          <aside className="guest-detail-drawer" onClick={(event) => event.stopPropagation()} aria-label={`${selectedPlace.name} Details`}>
            <span className="guest-drawer-handle" aria-hidden="true" />
            <img alt="" src={placeDetailImage(selectedPlace, packageItem)} />
            <div className="guest-drawer-content">
              <p className="eyebrow">{categoryLabel(selectedPlace.category)}</p>
              <h2>{selectedPlace.name}</h2>
              <p>{placeDescription(selectedPlace)}</p>

              <div className="guest-drawer-facts">
                {selectedPlace.rating ? (
                  <article>
                    <span>Bewertung</span>
                    <strong>{selectedPlace.rating.toFixed(1)}</strong>
                  </article>
                ) : null}
                {payloadText(selectedPlace.payload, ["cuisine"]) ? (
                  <article>
                    <span>Küche</span>
                    <strong>{payloadText(selectedPlace.payload, ["cuisine"])}</strong>
                  </article>
                ) : null}
                {selectedPlace.address ? (
                  <article>
                    <span>Adresse</span>
                    <strong>{selectedPlace.address}</strong>
                  </article>
                ) : null}
                {openingHoursText(selectedPlace) ? (
                  <article>
                    <span>Öffnungszeiten</span>
                    <strong>{openingHoursText(selectedPlace)}</strong>
                  </article>
                ) : null}
                {eventTimeText(selectedPlace) ? (
                  <article>
                    <span>Termin</span>
                    <strong>{eventTimeText(selectedPlace)}</strong>
                  </article>
                ) : null}
              </div>

              {payloadList(selectedPlace.payload, ["bestFor", "audiences"]).length ? (
                <div className="guest-place-tags">
                  {payloadList(selectedPlace.payload, ["bestFor", "audiences"]).slice(0, 5).map((item) => (
                    <small key={item}>{item}</small>
                  ))}
                </div>
              ) : null}

              {placeActions(selectedPlace).length ? (
                <div className="guest-drawer-actions">
                  {placeActions(selectedPlace).map((action) => (
                    <a key={action.label} href={action.href} target="_blank" rel="noreferrer">
                      {action.label}
                    </a>
                  ))}
                </div>
              ) : null}

              <button type="button" onClick={() => setSelectedPlace(null)}>
                Zurück
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {!selectedPlace ? (
        <nav className="guest-bottom-nav" aria-label="Gästebereich Navigation">
          {navItems.map((item) => (
            <button key={item} className={activeView === item ? "is-active" : ""} type="button" onClick={() => setActiveView(item)}>
              <span>{viewIcons[item]}</span>
              {viewLabels[item]}
            </button>
          ))}
        </nav>
      ) : null}
    </main>
  );
}
