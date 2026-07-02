"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@morrow/supabase";

type LeadType = "guest" | "owner" | "experience";

type LeadFormProps = {
  type: LeadType;
  packageName?: string;
  packageSlug?: string;
  dates?: string[];
  audience?: "families" | "couples";
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  selectedDate: string;
  adults: string;
  children: string;
  childrenAges: string;
  dog: string;
  occasion: string;
  propertyLocation: string;
  propertyType: string;
  businessName: string;
  experienceType: string;
  message: string;
  whatsappOptIn: boolean;
};

const conversionStorageKey = "morrow_last_conversion_v1";

const initialState: FormState = {
  adults: "2",
  businessName: "",
  children: "0",
  childrenAges: "",
  dog: "offen",
  email: "",
  experienceType: "",
  message: "",
  name: "",
  occasion: "",
  phone: "",
  propertyLocation: "",
  propertyType: "",
  selectedDate: "",
  whatsappOptIn: false,
};

function fieldLabel(type: LeadType) {
  if (type === "owner") return "Immobilie vorstellen";
  if (type === "experience") return "Kooperation anfragen";
  return "Auszeit anfragen";
}

function getUtmContext() {
  const params = new URLSearchParams(window.location.search);
  const storedAttribution = readStoredAttribution();
  const source = params.get("utm_source") || storedAttribution.source || "website";
  const campaign = params.get("utm_campaign") || storedAttribution.campaign || "";
  const medium = params.get("utm_medium") || storedAttribution.medium || "";
  const content = params.get("utm_content") || storedAttribution.content || "";
  const term = params.get("utm_term") || storedAttribution.term || "";
  const gclid = params.get("gclid") || storedAttribution.gclid || "";
  const fbclid = params.get("fbclid") || storedAttribution.fbclid || "";

  return {
    campaign,
    content,
    currentPath: window.location.pathname,
    fbclid,
    firstCapturedAt: storedAttribution.capturedAt || "",
    gclid,
    landingPath: storedAttribution.landingPath || window.location.pathname,
    medium,
    referrer: document.referrer || storedAttribution.referrer || "",
    source,
    term,
    url: window.location.href,
  };
}

function readStoredAttribution() {
  try {
    const rawAttribution = window.localStorage.getItem("morrow_attribution_v1");
    if (!rawAttribution) return {} as Record<string, string>;
    const attribution = JSON.parse(rawAttribution) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(attribution).map(([key, value]) => [key, typeof value === "string" ? value : ""]),
    ) as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
}

function readLastConversionContext() {
  try {
    const rawConversion = window.localStorage.getItem(conversionStorageKey);
    if (!rawConversion) return {} as Record<string, string>;
    const conversion = JSON.parse(rawConversion) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(conversion).map(([key, value]) => [key, typeof value === "string" ? value : ""]),
    ) as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
}

function integerOrNull(value: string) {
  const trimmed = value.trim();
  if (!/^[0-9]+$/.test(trimmed)) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function LeadForm({ audience, dates = [], packageName, packageSlug, type }: LeadFormProps) {
  const [form, setForm] = useState<FormState>({
    ...initialState,
    adults: audience === "couples" ? "2" : "2",
    selectedDate: dates[0] || "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const isFamily = audience === "families";
  const isCouple = audience === "couples";
  const submitLabel = useMemo(() => {
    if (status === "sending") return "Wird gesendet";
    if (status === "success") return "Anfrage gesendet";
    return fieldLabel(type);
  }, [status, type]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const utm = getUtmContext();
      const conversionContext = readLastConversionContext();
      const submittedAt = new Date().toISOString();
      const adults = integerOrNull(form.adults);
      const children = integerOrNull(form.children);
      const childrenAges = form.childrenAges.trim() || null;
      const dog = form.dog || null;
      const formContext = {
        audience: audience || "",
        currentPath: window.location.pathname,
        currentUrl: window.location.href,
        formLabel: fieldLabel(type),
        packageName: packageName || "",
        packageSlug: packageSlug || "",
        type,
      };
      const leadPayload = {
        adults,
        businessName: form.businessName.trim(),
        children,
        childrenAges,
        conversionContext,
        dog,
        experienceType: form.experienceType.trim(),
        formContext,
        message: form.message.trim(),
        occasion: form.occasion.trim(),
        packageName,
        packageSlug,
        propertyLocation: form.propertyLocation.trim(),
        propertyType: form.propertyType.trim(),
        selectedDate: form.selectedDate,
        submittedAt,
        type,
        utm,
        whatsappOptIn: form.whatsappOptIn,
      };

      const { data, error } = await supabase
        .from("leads")
        .insert({
          campaign: utm.campaign || null,
          adults,
          children,
          children_ages: childrenAges,
          dog,
          email: form.email.trim(),
          name: form.name.trim(),
          package_slug: packageSlug || null,
          phone: form.phone.trim() || null,
          payload: leadPayload,
          source: utm.source,
          status: "Neu",
          type,
          whatsapp_consent_at: form.whatsappOptIn ? submittedAt : null,
          whatsapp_opt_in: form.whatsappOptIn,
        })
        .select("id")
        .single();

      if (error) throw error;

      const notificationResult = await supabase.functions.invoke("lead-notification", {
        body: {
          lead: {
            ...leadPayload,
            email: form.email.trim(),
            id: data.id,
            name: form.name.trim(),
            phone: form.phone.trim(),
          },
        },
      });

      if (notificationResult.error) {
        console.warn("Morrow lead notification failed after lead insert", notificationResult.error);
      }

      setStatus("success");
      setMessage(
        type === "guest"
          ? "Danke, eure Anfrage ist angekommen. Wir prüfen Termin, Unterkunft und Erlebnis persönlich und melden uns mit einer klaren Rückmeldung."
          : "Danke, deine Anfrage ist angekommen. Wir melden uns persönlich mit dem nächsten Schritt.",
      );
    } catch {
      setStatus("error");
      setMessage(
        "Die Anfrage konnte gerade nicht gesendet werden. Bitte versuche es erneut oder schreibe direkt an auszeiten@getmorrow.de.",
      );
    }
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <div className="lead-form-grid">
        <label>
          Name
          <input
            autoComplete="name"
            onChange={(event) => updateField("name", event.target.value)}
            required
            value={form.name}
          />
        </label>
        <label>
          E-Mail
          <input
            autoComplete="email"
            onChange={(event) => updateField("email", event.target.value)}
            required
            type="email"
            value={form.email}
          />
        </label>
        <label>
          Telefon
          <input
            autoComplete="tel"
            onChange={(event) => updateField("phone", event.target.value)}
            required={type === "guest"}
            type="tel"
            value={form.phone}
          />
        </label>

        {type === "guest" ? (
          <>
            <label>
              Gewünschter Termin
              <select
                onChange={(event) => updateField("selectedDate", event.target.value)}
                required
                value={form.selectedDate}
              >
                {dates.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
                <option value="Bitte passende Alternative vorschlagen">
                  Bitte passende Alternative vorschlagen
                </option>
              </select>
            </label>
            <label>
              Erwachsene
              <input
                max={isCouple ? 2 : 8}
                min={1}
                onChange={(event) => updateField("adults", event.target.value)}
                readOnly={isCouple}
                type="number"
                value={form.adults}
              />
            </label>
            {isFamily ? (
              <>
                <label>
                  Kinder
                  <input
                    max={6}
                    min={0}
                    onChange={(event) => updateField("children", event.target.value)}
                    type="number"
                    value={form.children}
                  />
                </label>
                <label>
                  Alter der Kinder
                  <input
                    onChange={(event) => updateField("childrenAges", event.target.value)}
                    placeholder="z. B. 4 und 8 Jahre"
                    required={Number(form.children || 0) > 0}
                    value={form.childrenAges}
                  />
                </label>
                <label>
                  Hund
                  <select onChange={(event) => updateField("dog", event.target.value)} value={form.dog}>
                    <option value="offen">Offen</option>
                    <option value="ja">Ja, Hund reist mit</option>
                    <option value="nein">Nein</option>
                  </select>
                </label>
              </>
            ) : null}
            {isCouple ? (
              <label>
                Anlass
                <select onChange={(event) => updateField("occasion", event.target.value)} value={form.occasion}>
                  <option value="">Einfach raus aus dem Alltag</option>
                  <option value="Geburtstag">Geburtstag</option>
                  <option value="Jahrestag">Jahrestag</option>
                  <option value="Überraschung">Überraschung</option>
                  <option value="Sonstiger Anlass">Sonstiger Anlass</option>
                </select>
              </label>
            ) : null}
          </>
        ) : null}

        {type === "owner" ? (
          <>
            <label>
              Ort der Immobilie
              <input
                onChange={(event) => updateField("propertyLocation", event.target.value)}
                placeholder="z. B. Sankt Peter-Ording"
                required
                value={form.propertyLocation}
              />
            </label>
            <label>
              Objektart
              <input
                onChange={(event) => updateField("propertyType", event.target.value)}
                placeholder="Ferienhaus, Wohnung, Hotel ..."
                value={form.propertyType}
              />
            </label>
          </>
        ) : null}

        {type === "experience" ? (
          <>
            <label>
              Anbieter / Betrieb
              <input
                onChange={(event) => updateField("businessName", event.target.value)}
                required
                value={form.businessName}
              />
            </label>
            <label>
              Erlebnisart
              <input
                onChange={(event) => updateField("experienceType", event.target.value)}
                placeholder="z. B. Watt, Yoga, Kochen, Reiten"
                required
                value={form.experienceType}
              />
            </label>
          </>
        ) : null}
      </div>

      <label className="lead-form-message">
        Nachricht
        <textarea
          onChange={(event) => updateField("message", event.target.value)}
          placeholder={type === "guest" ? "Was sollten wir für eure Auszeit wissen?" : "Was sollten wir vorab wissen?"}
          rows={4}
          value={form.message}
        />
      </label>

      <label className="lead-form-checkbox">
        <input
          checked={form.whatsappOptIn}
          onChange={(event) => updateField("whatsappOptIn", event.target.checked)}
          type="checkbox"
        />
        Ich bin einverstanden, dass Morrow mich optional per WhatsApp zu wichtigen Rückfragen kontaktieren darf. E-Mail bleibt der Standard.
      </label>

      <button
        className="button button-primary lead-form-submit"
        data-conversion={`${type}_lead_submit`}
        data-conversion-label={fieldLabel(type)}
        disabled={status === "sending" || status === "success"}
        type="submit"
      >
        {submitLabel}
      </button>
      {message ? <p className={`lead-form-status is-${status}`}>{message}</p> : null}
    </form>
  );
}
