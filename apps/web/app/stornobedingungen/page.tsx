import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Stornobedingungen",
  description: "Storno- und Änderungsbedingungen für Morrow-Auszeiten.",
};

export default function CancellationTermsPage() {
  return (
    <LegalPage
      eyebrow="Storno"
      intro="Die Stornobedingungen beschreiben, wie Morrow mit Stornierungen, Änderungen und Ausfällen einzelner Bestandteile umgeht."
      title="Stornobedingungen."
      sections={[
        {
          title: "Stornierung durch Gäste",
          children: (
            <p>
              Gäste können eine Buchung in Textform stornieren. Maßgeblich sind
              die im Angebot und in der Buchungsbestätigung genannten
              Stornofristen und Kosten. Abweichende Bedingungen von Unterkunfts-,
              Erlebnis- oder Servicepartnern gelten, wenn sie im Angebot
              ausdrücklich benannt wurden.
            </p>
          ),
        },
        {
          title: "Änderungswünsche",
          children: (
            <p>
              Änderungswünsche zu Termin, Personenanzahl oder Erlebnis werden
              individuell geprüft. Ob eine Änderung möglich ist, hängt von
              Verfügbarkeit, Partnerbedingungen und bereits bestätigten
              Leistungen ab.
            </p>
          ),
        },
        {
          title: "Ausfall von Erlebnisbestandteilen",
          children: (
            <p>
              Wenn ein Erlebnis aufgrund von Wetter, Sicherheit oder
              Partnerverfügbarkeit nicht wie geplant stattfinden kann, prüft
              Morrow eine passende Alternative oder eine transparente Anpassung
              des betroffenen Leistungsbestandteils.
            </p>
          ),
        },
      ]}
    />
  );
}
