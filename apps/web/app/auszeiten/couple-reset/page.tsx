import { stayTemplates } from "@morrow/domain";
import { Container } from "@morrow/ui";
import { PublicPageShell } from "../../_components/PublicPageShell";

const stay = stayTemplates.find((item) => item.slug === "couple-reset");

export default function CoupleResetPage() {
  return (
    <PublicPageShell
      eyebrow="Für Paare"
      text={stay?.lead ?? ""}
      title="Couple Reset."
    >
      <section className="section">
        <Container className="detail-preview">
          <img alt="" src={stay?.image} />
          <p>
            Diese Detailseite wird als zweite Auszeit aus dem Prototyp nach
            Next.js migriert: mit ruhigem Storytelling, konkretem Objekt,
            Erlebnis, Terminen und Anfrage.
          </p>
        </Container>
      </section>
    </PublicPageShell>
  );
}
