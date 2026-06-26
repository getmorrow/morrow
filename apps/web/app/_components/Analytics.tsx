"use client";

import Script from "next/script";
import { useEffect } from "react";

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function Analytics() {
  useEffect(() => {
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
  }, []);

  return (
    <>
      {gaId ? (
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

      {metaPixelId ? (
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
    </>
  );
}
