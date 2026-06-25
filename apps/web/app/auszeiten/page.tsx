import { stayDetails, stayTemplates, staysPageContent } from "@morrow/domain";
import { Button, Card, Container, Eyebrow, SectionHeader } from "@morrow/ui";
import { SiteHeader } from "../_components/SiteHeader";

export const metadata = {
  title: "Auszeiten in Sankt Peter-Ording",
  description:
    "Morrow kuratiert vorbereitete Auszeiten in Sankt Peter-Ording: Family Escape für Familien und Couple Reset für Paare.",
};

export default function StaysPage() {
  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="stays-hero">
        <Container className="stays-hero-grid">
          <div>
            <Eyebrow>{staysPageContent.hero.kicker}</Eyebrow>
            <h1>{staysPageContent.hero.title}</h1>
            <p>{staysPageContent.hero.text}</p>
            <div className="stays-hero-actions">
              <Button href="#auszeiten">Auszeiten ansehen</Button>
              <Button href="/ratgeber" variant="secondary">
                Ratgeber lesen
              </Button>
            </div>
          </div>
          <img alt={staysPageContent.hero.imageAlt} src={staysPageContent.hero.image} />
        </Container>
      </section>

      <section className="section stays-principles-section">
        <Container className="stays-principles-grid">
          {staysPageContent.principles.map((item) => (
            <Card className="principle-card" key={item.title}>
              <span aria-hidden="true" className="card-marker" />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Card>
          ))}
        </Container>
      </section>

      <section className="section stays-list-section" id="auszeiten">
        <Container>
          <SectionHeader
            eyebrow={staysPageContent.comparison.kicker}
            text={staysPageContent.comparison.text}
            title={staysPageContent.comparison.title}
          />
          <div className="stays-overview-grid">
            {stayTemplates.map((stay) => {
              const detail = stayDetails[stay.slug];

              return (
                <a className="stay-overview-card" href={stay.href} key={stay.slug}>
                  <img alt="" src={stay.image} />
                  <div className="stay-overview-content">
                    <Eyebrow>{stay.shortTitle}</Eyebrow>
                    <h2>{stay.title}</h2>
                    <p>{stay.promise}</p>
                    <div className="stay-overview-meta">
                      <span>{detail.price}</span>
                      <span>{detail.dates.join(" oder ")}</span>
                      <span>{detail.maxGuests} Personen</span>
                    </div>
                    <strong>Auszeit ansehen</strong>
                  </div>
                </a>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="section stays-context-section">
        <Container className="stays-context-grid">
          <SectionHeader
            eyebrow="Warum so wenig Auswahl?"
            text="Morrow ist keine Plattform für hunderte Optionen. Der erste Schritt ist bewusst kuratiert, damit ihr schneller versteht, ob ein Aufenthalt zu euch passt."
            title="Mehr Vertrauen entsteht nicht durch mehr Karten."
          />
          <div className="context-copy">
            <p>
              Die Auszeiten verbinden Unterkunft, Erlebnis und Orientierung.
              Danach prüfen wir persönlich, ob Termin, Objekt und eure Wünsche
              wirklich zusammenpassen.
            </p>
            <p>
              Später kann Morrow weitere Orte, Anlässe und Auszeiten ergänzen.
              Für den Start konzentrieren wir uns auf Sankt Peter-Ording,
              Familien und Paare.
            </p>
          </div>
        </Container>
      </section>

      <section className="final-cta">
        <Container className="final-cta-grid">
          <SectionHeader
            eyebrow={staysPageContent.finalCta.kicker}
            text={staysPageContent.finalCta.text}
            title={staysPageContent.finalCta.title}
          />
          <div className="final-cta-actions">
            <Button href="/auszeiten/family-escape">Family Escape</Button>
            <Button href="/auszeiten/couple-reset" variant="secondary">
              Couple Reset
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
