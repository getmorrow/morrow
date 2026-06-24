import { Button, Container } from "@morrow/ui";
import { PublicPageShell } from "../_components/PublicPageShell";

export default function OwnersPage() {
  return (
    <PublicPageShell
      eyebrow="Für Eigentümer"
      text="Morrow soll Ferienimmobilien nicht nur verwalten, sondern aktiver positionieren, transparenter steuern und langfristig bessere Ergebnisse ermöglichen."
      title="Ein modernerer Weg für Ferienimmobilien."
    >
      <section className="section">
        <Container className="detail-preview">
          <p>
            Diese Seite wird als nächster öffentlicher Pfad migriert: mit
            Ertragslogik, Objektprüfung, Prozess, Vertrauen und Kontakt.
          </p>
          <Button href="mailto:auszeiten@getmorrow.de">Immobilie vorstellen</Button>
        </Container>
      </section>
    </PublicPageShell>
  );
}
