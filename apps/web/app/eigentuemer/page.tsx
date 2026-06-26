import { ownersPageContent } from "@morrow/domain";
import { Button, Card, Container, Eyebrow, SectionHeader } from "@morrow/ui";
import { JsonLd } from "../_components/JsonLd";
import { SiteHeader } from "../_components/SiteHeader";
import { ownersStructuredData } from "../_lib/structuredData";

export const metadata = {
  title: "Für Eigentümer",
  description:
    "Morrow hilft Eigentümern hochwertiger Ferienimmobilien in Sankt Peter-Ording mit aktiver Vermarktung, klarer Positionierung und transparenterem Vermietungsmodell.",
};

export default function OwnersPage() {
  return (
    <main className="site-shell">
      <JsonLd data={ownersStructuredData()} />
      <SiteHeader />

      <section className="owner-hero">
        <Container className="owner-hero-grid">
          <div>
            <Eyebrow>{ownersPageContent.hero.kicker}</Eyebrow>
            <h1>{ownersPageContent.hero.title}</h1>
            <p>{ownersPageContent.hero.text}</p>
            <div className="owner-hero-actions">
              <Button
                data-conversion="owner_request_click"
                data-conversion-label="Eigentümer Hero Immobilie vorstellen"
                href="#ertragspotenzial"
              >
                Immobilie vorstellen
              </Button>
              <Button
                data-conversion="cta_stays_view"
                data-conversion-label="Eigentümer Hero Auszeiten ansehen"
                href="/auszeiten"
                variant="secondary"
              >
                Auszeiten ansehen
              </Button>
            </div>
          </div>
          <figure className="owner-hero-media">
            <img alt={ownersPageContent.hero.imageAlt} src={ownersPageContent.hero.image} />
            <figcaption>
              <span>Nicht nur verwaltet</span>
              {ownersPageContent.hero.note}
            </figcaption>
          </figure>
        </Container>
      </section>

      <section className="section owner-principles-section">
        <Container className="owner-principles-grid">
          {ownersPageContent.principles.map((item) => (
            <Card className="principle-card" key={item.title}>
              <span aria-hidden="true" className="card-marker" />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Card>
          ))}
        </Container>
      </section>

      <section className="section owner-value-section">
        <Container className="owner-value-grid">
          <SectionHeader
            eyebrow={ownersPageContent.value.kicker}
            text={ownersPageContent.value.text}
            title={ownersPageContent.value.title}
          />
          <div className="owner-value-cards">
            {ownersPageContent.value.items.map((item) => (
              <Card className="owner-value-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="section owner-model-section">
        <Container className="owner-model-grid">
          <div>
            <Eyebrow>{ownersPageContent.model.kicker}</Eyebrow>
            <h2>{ownersPageContent.model.title}</h2>
            <p>{ownersPageContent.model.text}</p>
          </div>
          <div className="owner-model-steps">
            {ownersPageContent.model.steps.map((step, index) => (
              <article key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="section owner-start-section">
        <Container className="owner-start-grid">
          <img alt={ownersPageContent.start.imageAlt} src={ownersPageContent.start.image} />
          <div>
            <Eyebrow>{ownersPageContent.start.kicker}</Eyebrow>
            <h2>{ownersPageContent.start.title}</h2>
            <p>{ownersPageContent.start.text}</p>
            <div className="owner-start-points">
              {ownersPageContent.start.points.map((point, index) => (
                <span key={point}>
                  <strong>{String(index + 1).padStart(2, "0")}</strong>
                  {point}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="section owner-request-section" id="ertragspotenzial">
        <Container className="owner-request-grid">
          <SectionHeader
            eyebrow={ownersPageContent.request.kicker}
            text={ownersPageContent.request.text}
            title={ownersPageContent.request.title}
          />
          <Card className="request-card">
            <Eyebrow>Was wir abfragen</Eyebrow>
            <div className="request-field-grid">
              {ownersPageContent.request.fields.map((field) => (
                <span key={field}>{field}</span>
              ))}
            </div>
            <Button
              data-conversion="owner_request_mailto"
              data-conversion-label="Eigentümer Ertragspotenzial anfordern"
              href="mailto:auszeiten@getmorrow.de?subject=Immobilie%20vorstellen"
            >
              Ertragspotenzial anfordern
            </Button>
          </Card>
        </Container>
      </section>

      <section className="section owner-faq-section">
        <Container>
          <SectionHeader
            eyebrow="Fragen von Eigentümern"
            text="Wir starten kuratiert und persönlich. Deshalb geht es zuerst um Passung, Vertrauen und klare nächste Schritte."
            title="Was vor einer Zusammenarbeit wichtig ist."
          />
          <div className="faq-grid">
            {ownersPageContent.faqs.map((faq) => (
              <Card className="faq-card" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
