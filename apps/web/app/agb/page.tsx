import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Bedingungen für Morrow-Auszeiten.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="AGB"
      intro="Die allgemeinen Bedingungen beschreiben den Rahmen, in dem Morrow kuratierte Auszeiten vorbereitet, vermittelt und begleitet."
      title="Allgemeine Geschäftsbedingungen."
      sections={[
        {
          title: "Leistungsverständnis",
          children: (
            <p>
              Morrow entwickelt kuratierte Auszeiten aus ausgewählten
              Unterkünften, lokalen Erlebnissen, Empfehlungen und persönlicher
              Orientierung. Die konkrete Leistung ergibt sich aus dem jeweiligen
              Angebot und der Buchungsbestätigung.
            </p>
          ),
        },
        {
          title: "Anfrage und Angebot",
          children: (
            <p>
              Eine Anfrage über die Website ist noch keine Buchung. Morrow prüft
              Termin, Unterkunft, Erlebnis und Verfügbarkeit persönlich und
              meldet sich mit einer Rückmeldung oder einem konkreten Angebot.
              Eine verbindliche Buchung entsteht erst, wenn Gäste das Angebot
              ausdrücklich annehmen und die darin genannten Zahlungsbedingungen
              erfüllt sind.
            </p>
          ),
        },
        {
          title: "Partnerleistungen",
          children: (
            <p>
              Einzelne Bestandteile einer Auszeit können durch Unterkunfts-,
              Erlebnis- oder Servicepartner erbracht werden. Morrow kuratiert
              diese Leistungen und beschreibt im Angebot, welche Bestandteile
              enthalten sind und welche Bedingungen dafür gelten.
            </p>
          ),
        },
        {
          title: "Änderungen vor Ort",
          children: (
            <p>
              Wetter, Gezeiten, lokale Verfügbarkeiten oder betriebliche Gründe
              können Anpassungen erforderlich machen. Morrow achtet darauf, dass
              Änderungen zum Charakter der Auszeit passen und Gäste klar
              informiert werden.
            </p>
          ),
        },
        {
          title: "Kommunikation",
          children: (
            <p>
              E-Mail ist der Standardkanal für wichtige Informationen rund um
              Anfrage, Angebot und Buchung. WhatsApp oder andere freiwillige
              Kanäle werden nur genutzt, wenn Gäste dem jeweiligen Kanal
              zustimmen.
            </p>
          ),
        },
      ]}
    />
  );
}
