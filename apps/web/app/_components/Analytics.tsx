"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const consentStorageKey = "morrow_cookie_consent_v1";
const attributionStorageKey = "morrow_attribution_v1";
type ConsentState = "accepted" | "declined" | null;

function attributionFromCurrentPage() {
  const params = new URLSearchParams(window.location.search);
  const hasPaidOrUtmContext = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "fbclid",
  ].some((key) => params.has(key));

  if (!hasPaidOrUtmContext && !document.referrer) return null;

  return {
    capturedAt: new Date().toISOString(),
    campaign: params.get("utm_campaign") || "",
    content: params.get("utm_content") || "",
    currentPath: window.location.pathname,
    fbclid: params.get("fbclid") || "",
    gclid: params.get("gclid") || "",
    landingPath: window.location.pathname,
    medium: params.get("utm_medium") || "",
    referrer: document.referrer || "",
    source: params.get("utm_source") || "website",
    term: params.get("utm_term") || "",
    url: window.location.href,
  };
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function Analytics() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [isReady, setIsReady] = useState(false);
  const hasTracking = Boolean(gaId || metaPixelId);
  const canTrack = hasTracking && consent === "accepted";

  useEffect(() => {
    const savedConsent = window.localStorage.getItem(consentStorageKey);
    if (savedConsent === "accepted" || savedConsent === "declined") {
      setConsent(savedConsent);
    }
    const attribution = attributionFromCurrentPage();
    if (attribution) {
      const savedAttribution = window.localStorage.getItem(attributionStorageKey);
      if (!savedAttribution || attribution.gclid || attribution.fbclid || attribution.campaign) {
        window.localStorage.setItem(attributionStorageKey, JSON.stringify(attribution));
      }
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!canTrack) return;

    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const element = target.closest<HTMLElement>("[data-conversion]");
      if (!element) return;

      const eventName = element.dataset.conversion || "cta_click";
      const eventLabel = element.dataset.conversionLabel || element.textContent?.trim() || "CTA";
      const eventLocation = element.dataset.conversionLocation || window.location.pathname;
      const payload = {
        event_category: "conversion",
        event_label: eventLabel,
        location: eventLocation,
        href: element instanceof HTMLAnchorElement ? element.href : undefined,
      };

      window.gtag?.("event", eventName, payload);
      window.fbq?.("trackCustom", eventName, payload);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [canTrack]);

  function updateConsent(nextConsent: Exclude<ConsentState, null>) {
    window.localStorage.setItem(consentStorageKey, nextConsent);
    setConsent(nextConsent);
  }

  return (
    <>
      {canTrack && gaId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="morrow-google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}

      {canTrack && metaPixelId ? (
        <Script id="morrow-meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      ) : null}

      {hasTracking && isReady && consent === null ? (
        <div className="consent-banner" role="dialog" aria-label="Cookie-Einwilligung">
          <div>
            <strong>Datenschutz respektieren.</strong>
            <p>
              Wir nutzen optionale Analyse- und Marketingmessung, um zu
              verstehen, welche Auszeiten wirklich angefragt werden. Ohne
              Zustimmung bleiben nur technisch notwendige Funktionen aktiv.
            </p>
          </div>
          <div className="consent-actions">
            <button type="button" onClick={() => updateConsent("declined")}>
              Nur notwendige
            </button>
            <button type="button" onClick={() => updateConsent("accepted")}>
              Alle akzeptieren
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
