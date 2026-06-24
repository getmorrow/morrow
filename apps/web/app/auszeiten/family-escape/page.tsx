import { stayTemplates } from "@morrow/domain";
import { Container } from "@morrow/ui";
import { PublicPageShell } from "../../_components/PublicPageShell";

const stay = stayTemplates.find((item) => item.slug === "family-escape");

export default function FamilyEscapePage() {
  return (
    <PublicPageShell
      eyebrow="Für Familien"
      text={stay?.lead ?? ""}
      title="Family Escape."
    >
      <section className="section">
        <Container className="detail-preview">
          <img alt="" src={stay?.image} />
          <p>
            Diese Detailseite wird als erste Auszeit aus dem Prototyp nach
            Next.js migriert: mit Unterkunft, Erlebnis, Terminen, Anfrage und
            SEO-Struktur.
          </p>
        </Container>
      </section>
    </PublicPageShell>
  );
}
