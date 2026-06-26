import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Stornobedingungen",
  description: "Arbeitsfassung der Storno- und Änderungsbedingungen für Morrow.",
};

export default function CancellationTermsPage() {
  return (
    <LegalPage
      eyebrow="Storno"
      intro="Die Stornobedingungen müssen je Unterkunft, Partnerleistung und Buchungsmodell klar im Angebot ausgewiesen werden."
      title="Stornobedingungen."
      sections={[
        {
          title: "Stornierung durch Gäste",
          children: (
            <p>
              Die konkreten Fristen, Kosten und Bedingungen einer Stornierung
              werden im Angebot und in der Buchungsbestätigung ausgewiesen. Sie
              können je Unterkunft, Erlebnispartner und Saison unterschiedlich
              sein.
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
