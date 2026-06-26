import { experiencePartnersPageContent } from "@morrow/domain";
import { Button, Card, Container, Eyebrow, SectionHeader } from "@morrow/ui";
import { JsonLd } from "../_components/JsonLd";
import { SiteHeader } from "../_components/SiteHeader";
import { partnersStructuredData } from "../_lib/structuredData";

export const metadata = {
  title: "Für Erlebnispartner",
  description:
    "Morrow arbeitet mit ausgewählten lokalen Erlebnispartnern in Sankt Peter-Ording, die Familien und Paaren besondere, gut vorbereitete Auszeiten ermöglichen.",
};

export default function ExperiencePartnersPage() {
  return (
    <main className="site-shell">
      <JsonLd data={partnersStructuredData()} />
      <SiteHeader />

      <section className="partner-hero">
        <Container className="partner-hero-grid">
          <div>
            <Eyebrow>{experiencePartnersPageContent.hero.kicker}</Eyebrow>
            <h1>{experiencePartnersPageContent.hero.title}</h1>
            <p>{experiencePartnersPageContent.hero.text}</p>
            <div className="partner-hero-actions">
              <Button
                data-conversion="partner_request_click"
                data-conversion-label="Erlebnispartner Hero Erlebnis vorschlagen"
                href="#kooperation"
              >
                Erlebnis vorschlagen
              </Button>
              <Button
                data-conversion="cta_stays_view"
                data-conversion-label="Erlebnispartner Hero Auszeiten ansehen"
                href="/auszeiten"
                variant="secondary"
              >
                Auszeiten ansehen
              </Button>
            </div>
          </div>
          <figure className="partner-hero-media">
            <img
              alt={experiencePartnersPageContent.hero.imageAlt}
              src={experiencePartnersPageContent.hero.image}
            />
            <figcaption>
              <span>Lokale Qualität</span>
              {experiencePartnersPageContent.hero.note}
            </figcaption>
          </figure>
        </Container>
      </section>

      <section className="section partner-principles-section">
        <Container className="partner-principles-grid">
          {experiencePartnersPageContent.principles.map((item) => (
            <Card className="principle-card" key={item.title}>
              <span aria-hidden="true" className="card-marker" />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Card>
          ))}
        </Container>
      </section>

      <section className="section partner-fit-section">
        <Container className="partner-fit-grid">
          <SectionHeader
            eyebrow={experiencePartnersPageContent.fit.kicker}
            text={experiencePartnersPageContent.fit.text}
            title={experiencePartnersPageContent.fit.title}
          />
          <div className="partner-fit-cards">
            {experiencePartnersPageContent.fit.items.map((item) => (
              <Card className="partner-fit-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="section partner-collaboration-section">
        <Container className="partner-collaboration-grid">
          <img
            alt={experiencePartnersPageContent.collaboration.imageAlt}
            src={experiencePartnersPageContent.collaboration.image}
          />
          <div>
            <Eyebrow>{experiencePartnersPageContent.collaboration.kicker}</Eyebrow>
            <h2>{experiencePartnersPageContent.collaboration.title}</h2>
            <p>{experiencePartnersPageContent.collaboration.text}</p>
            <div className="partner-collaboration-steps">
              {experiencePartnersPageContent.collaboration.steps.map((step, index) => (
                <article key={step.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="section partner-request-section" id="kooperation">
        <Container className="partner-request-grid">
          <SectionHeader
            eyebrow={experiencePartnersPageContent.request.kicker}
            text={experiencePartnersPageContent.request.text}
            title={experiencePartnersPageContent.request.title}
          />
          <Card className="request-card">
            <Eyebrow>Was wir abfragen</Eyebrow>
            <div className="request-field-grid">
              {experiencePartnersPageContent.request.fields.map((field) => (
                <span key={field}>{field}</span>
              ))}
            </div>
            <Button
              data-conversion="partner_request_mailto"
              data-conversion-label="Erlebnispartner Kooperation anfragen"
              href="mailto:auszeiten@getmorrow.de?subject=Erlebnis%20vorschlagen"
            >
              Kooperation anfragen
            </Button>
          </Card>
        </Container>
      </section>

      <section className="section partner-faq-section">
        <Container>
          <SectionHeader
            eyebrow="Fragen von Erlebnispartnern"
            text="Wir halten die Auswahl bewusst kuratiert. Entscheidend ist nicht die Menge der Angebote, sondern ob ein Erlebnis Gäste wirklich besser durch ihre Auszeit führt."
            title="Was vor einer Zusammenarbeit wichtig ist."
          />
          <div className="faq-grid">
            {experiencePartnersPageContent.faqs.map((faq) => (
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
