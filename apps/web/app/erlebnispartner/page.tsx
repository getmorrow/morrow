import { Button, Container } from "@morrow/ui";
import { PublicPageShell } from "../_components/PublicPageShell";

export default function ExperiencePartnersPage() {
  return (
    <PublicPageShell
      eyebrow="Erlebnispartner"
      text="Morrow arbeitet mit ausgewählten lokalen Anbietern, deren Erlebnisse wirklich zu Familien, Paaren und dem Ort passen."
      title="Lokale Erlebnisse, die Auszeiten stärker machen."
    >
      <section className="section">
        <Container className="detail-preview">
          <p>
            Diese Seite wird später als klarer Kooperationspfad für lokale
            Erlebnisanbieter ausgebaut.
          </p>
          <Button href="mailto:auszeiten@getmorrow.de">Kooperation anfragen</Button>
        </Container>
      </section>
    </PublicPageShell>
  );
}
