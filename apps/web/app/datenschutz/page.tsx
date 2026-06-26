import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Datenschutz",
  description:
    "Datenschutzhinweise für Website, Anfragen, Gästebereich und Kommunikation bei Morrow.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Datenschutz"
      intro="Morrow verarbeitet nur Daten, die für Anfrage, Vorbereitung, Kommunikation und Durchführung einer Auszeit benötigt werden."
      title="Datenschutz."
      sections={[
        {
          title: "Welche Daten verarbeitet werden",
          children: (
            <p>
              Bei Anfragen können Name, E-Mail-Adresse, Telefonnummer,
              gewünschte Auszeit, Reisedaten, Anzahl der Erwachsenen und Kinder,
              Alter der Kinder, Hundewunsch, Anlass und freiwillige Hinweise
              verarbeitet werden. Bei Buchungen kommen Buchungsstatus,
              Zahlungsstatus, Aufenthaltsinformationen, Supportnachrichten und
              Feedback hinzu.
            </p>
          ),
        },
        {
          title: "Zweck der Verarbeitung",
          children: (
            <p>
              Die Daten werden genutzt, um Anfragen zu beantworten, passende
              Unterkünfte und Erlebnisse zu prüfen, Buchungen vorzubereiten, den
              Gästebereich bereitzustellen, wichtige Aufenthaltsinformationen zu
              senden und Supportfälle zu bearbeiten.
            </p>
          ),
        },
        {
          title: "Technische Dienstleister",
          children: (
            <p>
              Für Datenbank, Authentifizierung und operative Daten nutzt Morrow
              Supabase. Für E-Mail-Versand und transaktionale Nachrichten wird
              Resend eingesetzt. Tracking und Werbemessung können über Google
              und Meta vorbereitet sein, werden aber nur im rechtlich zulässigen
              Rahmen und abhängig von Einwilligungen aktiviert.
            </p>
          ),
        },
        {
          title: "WhatsApp und freiwillige Kanäle",
          children: (
            <p>
              WhatsApp-Kommunikation ist optional. Sie erfolgt nur, wenn Gäste
              ausdrücklich zustimmen. E-Mail bleibt der Standardkanal für
              wichtige Nachrichten rund um Anfrage und Aufenthalt.
            </p>
          ),
        },
        {
          title: "Aufbewahrung und Rechte",
          children: (
            <p>
              Personenbezogene Daten werden nur so lange gespeichert, wie sie
              für Anfrage, Buchung, gesetzliche Pflichten, Support und interne
              Nachvollziehbarkeit erforderlich sind. Betroffene können Auskunft,
              Berichtigung, Löschung oder Einschränkung der Verarbeitung
              verlangen, soweit keine gesetzlichen Gründe entgegenstehen.
            </p>
          ),
        },
      ]}
    />
  );
}
