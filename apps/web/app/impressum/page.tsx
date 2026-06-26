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
              <p>
                Morrow befindet sich in der MVP-Phase. Die vollständigen
                Anbieterangaben nach den geltenden gesetzlichen Vorgaben werden
                vor dem verbindlichen öffentlichen Buchungsstart final ergänzt.
              </p>
              <p>
                Bitte hier die finale Rechtsform, vertretungsberechtigte Person,
                ladungsfähige Anschrift, Registerangaben und Umsatzsteuerangaben
                eintragen, sobald sie feststehen.
              </p>
            </>
          ),
        },
        {
          title: "Kontakt",
          children: (
            <p>
              Für Anfragen zu Auszeiten, Kooperationen und bestehenden Vorgängen
              nutzt Morrow die auf der Website und in der jeweiligen Anfrage
              angegebenen Kontaktwege. Eine zentrale Kontaktadresse wird vor dem
              verbindlichen Buchungsstart final hinterlegt.
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
