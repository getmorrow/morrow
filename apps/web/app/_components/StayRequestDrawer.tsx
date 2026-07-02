"use client";

import { useEffect, useId, useState } from "react";
import { LeadForm } from "./LeadForm";

type StayRequestDrawerProps = {
  audience: "families" | "couples";
  dates: string[];
  label: string;
  packageName: string;
  packageSlug: string;
};

export function StayRequestDrawer({
  audience,
  dates,
  label,
  packageName,
  packageSlug,
}: StayRequestDrawerProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    document.body.classList.add("has-stay-request-drawer");

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.classList.remove("has-stay-request-drawer");
    };
  }, [open]);

  return (
    <>
      <a
        className="button button-primary stay-request-desktop-link"
        data-conversion="stay_request_click"
        data-conversion-label={label}
        href="#anfrage"
      >
        Auszeit anfragen
      </a>
      <button
        className="button button-primary stay-request-mobile-button"
        data-conversion="stay_request_click"
        data-conversion-label={label}
        onClick={() => setOpen(true)}
        type="button"
      >
        Auszeit anfragen
      </button>
      {open ? (
        <div className="stay-request-drawer-backdrop" onClick={() => setOpen(false)}>
          <aside
            aria-labelledby={titleId}
            aria-modal="true"
            className="stay-request-drawer"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <span aria-hidden="true" className="stay-request-drawer-handle" />
            <div className="stay-request-drawer-head">
              <div>
                <p className="eyebrow">Anfrage</p>
                <h2 id={titleId}>Auszeit anfragen.</h2>
                <p>Schickt uns die wichtigsten Angaben. Wir prüfen Termin, Unterkunft und Erlebnis persönlich.</p>
              </div>
              <button aria-label="Anfrage schließen" onClick={() => setOpen(false)} type="button">
                Schließen
              </button>
            </div>
            <LeadForm
              audience={audience}
              dates={dates}
              packageName={packageName}
              packageSlug={packageSlug}
              type="guest"
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}
