import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Zahlungsbedingungen",
  description: "Zahlungsablauf und Zahlungsstatus bei Morrow-Auszeiten.",
};

export default function PaymentTermsPage() {
  return (
    <LegalPage
      eyebrow="Zahlung"
      intro="Morrow arbeitet im MVP bewusst persönlich. Zahlungsfristen und Zahlungsweg werden im konkreten Angebot klar benannt."
      title="Zahlungsbedingungen."
      sections={[
        {
          title: "Zahlungsweg",
          children: (
            <p>
              Zahlungen erfolgen im MVP manuell über den im Angebot genannten
              Zahlungsweg. Die konkreten Zahlungsdaten, Beträge, Fristen und
              Referenzen werden in der Buchungsbestätigung genannt.
            </p>
          ),
        },
        {
          title: "Reservierung und Fälligkeit",
          children: (
            <p>
              Ob und wie lange eine Auszeit nach Angebotsversand reserviert
              bleibt, wird im jeweiligen Angebot angegeben. Eine Buchung wird
              erst nach ausdrücklicher Bestätigung und nach den vereinbarten
              Zahlungsbedingungen verbindlich.
            </p>
          ),
        },
        {
          title: "Zahlungsstatus im Gästebereich",
          children: (
            <p>
              Nach Freigabe kann der Gästebereich relevante Informationen zur
              gebuchten Auszeit zeigen. Zahlungs- und Buchungsstatus werden
              intern im Admin-System gepflegt.
            </p>
          ),
        },
      ]}
    />
  );
}
