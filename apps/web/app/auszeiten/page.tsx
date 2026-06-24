import { stayTemplates } from "@morrow/domain";
import { Container, Eyebrow } from "@morrow/ui";
import { PublicPageShell } from "../_components/PublicPageShell";

export default function StaysPage() {
  return (
    <PublicPageShell
      eyebrow="Auszeiten"
      text="Der vollständige Auszeitenbereich wird aus dem Prototyp in diese Next.js-Struktur migriert. Für den Start stehen Family Escape und Couple Reset im Mittelpunkt."
      title="Kuratierte Auszeiten in Sankt Peter-Ording."
    >
      <section className="section package-band">
        <Container>
          <div className="package-grid">
            {stayTemplates.map((stay) => (
              <a className="stay-card" href={stay.href} key={stay.slug}>
                <img alt="" src={stay.image} />
                <div>
                  <Eyebrow>{stay.shortTitle}</Eyebrow>
                  <h3>{stay.title}</h3>
                  <p>{stay.lead}</p>
                  <span>Auszeit ansehen</span>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>
    </PublicPageShell>
  );
}
