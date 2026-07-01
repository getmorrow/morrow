import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und Anbieterkennzeichnung von Morrow.",
};

export default function ImprintPage() {
  return (
    <LegalPage
      eyebrow="Impressum"
      intro="Anbieterkennzeichnung, Kontaktwege und Verantwortlichkeiten für die öffentliche Morrow-Website."
      title="Impressum."
      sections={[
        {
          title: "Anbieter",
          children: (
            <>
              <p>Morrow</p>
              <p>
                Kontakt für Anfragen zu Auszeiten, Kooperationen und bestehenden
                Vorgängen: auszeiten@getmorrow.de
              </p>
            </>
          ),
        },
        {
          title: "Kontakt",
          children: (
            <p>
              Gäste, Eigentümer, Erlebnisanbieter und Partner erreichen Morrow
              über die auf der Website genannten Formulare sowie per E-Mail an
              auszeiten@getmorrow.de.
            </p>
          ),
        },
        {
          title: "Verantwortung für Inhalte",
          children: (
            <p>
              Die Inhalte dieser Website werden mit Sorgfalt erstellt. Angaben
              zu Auszeiten, Unterkünften, Erlebnissen, Preisen und Terminen sind
              erst verbindlich, wenn sie im persönlichen Angebot oder in der
              Buchungsbestätigung ausdrücklich bestätigt wurden.
            </p>
          ),
        },
      ]}
    />
  );
}
