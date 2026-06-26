import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Buchungsbedingungen",
  description: "Buchungsablauf und Verbindlichkeit von Morrow-Auszeiten.",
};

export default function BookingTermsPage() {
  return (
    <LegalPage
      eyebrow="Buchung"
      intro="Die Buchungsbedingungen erklären, wann aus einer Anfrage eine verbindliche Auszeit wird und welche Informationen Gäste erhalten."
      title="Buchungsbedingungen."
      sections={[
        {
          title: "Von der Anfrage zur Buchung",
          children: (
            <p>
              Gäste wählen eine Auszeit und senden eine Anfrage. Morrow prüft
              persönlich, ob Termin, Unterkunft, Erlebnis und Rahmenbedingungen
              zusammenpassen. Erst nach Bestätigung des konkreten Angebots und
              der vereinbarten Zahlung entsteht eine verbindliche Buchung.
            </p>
          ),
        },
        {
          title: "Was enthalten ist",
          children: (
            <p>
              Enthalten sind nur die Leistungen, die im Angebot ausdrücklich
              genannt werden. Dazu können Unterkunft, ein lokales Erlebnis,
              kuratierte Empfehlungen, Gästebereich, Ansprechpartner und
              vorbereitete Aufenthaltsinformationen gehören.
            </p>
          ),
        },
        {
          title: "Gästebereich",
          children: (
            <p>
              Nach verbindlicher Buchung und Freigabe erhalten Gäste Zugang zu
              ihrem persönlichen Gästebereich. Dort werden Anreise, Unterkunft,
              Regeln, Vor-Ort-Empfehlungen, Wetter, Gezeiten, Hilfe und weitere
              relevante Informationen gebündelt.
            </p>
          ),
        },
      ]}
    />
  );
}
