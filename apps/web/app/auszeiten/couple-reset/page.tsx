import { publicRoutes, stayDetails } from "@morrow/domain";
import { Button, Card, Container, Eyebrow, SectionHeader } from "@morrow/ui";
import { JsonLd } from "../../_components/JsonLd";
import { SiteHeader } from "../../_components/SiteHeader";
import { stayStructuredData } from "../../_lib/structuredData";

const stay = stayDetails["couple-reset"];

export const metadata = {
  title: "Couple Reset in Sankt Peter-Ording",
  description:
    "Couple Reset verbindet ruhige Unterkunft, Erlebnisbaustein und persönliche Orientierung zu einer vorbereiteten Paar-Auszeit in Sankt Peter-Ording.",
};

export default function CoupleResetPage() {
  return (
    <main className="site-shell">
      <JsonLd data={stayStructuredData(stay)} />
      <SiteHeader />

      <section className="stay-hero">
        <Container className="stay-hero-grid">
          <div className="stay-hero-copy">
            <Eyebrow>
              {stay.shortTitle} · {stay.location}
            </Eyebrow>
            <h1>{stay.heroTitle}</h1>
            <p>{stay.heroLead}</p>
            <div className="stay-hero-actions">
              <Button
                data-conversion="stay_request_click"
                data-conversion-label="Couple Reset Hero Anfrage"
                href="#anfrage"
              >
                Auszeit anfragen
              </Button>
              <Button
                data-conversion="cta_stays_view"
                data-conversion-label="Couple Reset Hero Auszeiten ansehen"
                href={publicRoutes.stays}
                variant="secondary"
              >
                Auszeiten ansehen
              </Button>
            </div>
          </div>

          <div className="stay-hero-gallery" aria-label="Eindrücke der Auszeit">
            {stay.heroGallery.map((image, index) => (
              <figure
                className={index === 0 ? "stay-gallery-main" : "stay-gallery-card"}
                key={image.src}
              >
                <img alt={image.alt} src={image.src} />
                {image.label ? <figcaption>{image.label}</figcaption> : null}
              </figure>
            ))}
          </div>
        </Container>
      </section>

      <section className="stay-summary">
        <Container className="stay-summary-grid">
          <Card className="stay-price-card">
            <Eyebrow>Preis</Eyebrow>
            <strong>{stay.price}</strong>
            <p>{stay.priceNote}</p>
          </Card>
          <Card className="stay-date-card">
            <Eyebrow>Termine</Eyebrow>
            <div>
              {stay.dates.map((date) => (
                <span key={date}>{date}</span>
              ))}
            </div>
          </Card>
          <Card className="stay-facts-card">
            <Eyebrow>Rahmen</Eyebrow>
            <p>
              {stay.maxGuests} Personen · Hund{" "}
              {stay.dogOptional ? "optional anfragen" : "nicht vorgesehen"}
            </p>
          </Card>
        </Container>
      </section>

      <section className="section stay-story-section">
        <Container className="stay-story-grid">
          <img alt={stay.story.imageAlt} src={stay.story.image} />
          <div>
            <Eyebrow>{stay.story.kicker}</Eyebrow>
            <h2>{stay.story.title}</h2>
            <p>{stay.story.text}</p>
            <div className="stay-cue-list">
              {stay.story.cues.map((cue) => (
                <span key={cue}>{cue}</span>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="section stay-included-section">
        <Container className="stay-included-grid">
          <SectionHeader
            eyebrow="Enthalten"
            text="Couple Reset soll nicht überladen. Es verbindet die wenigen Dinge, die aus einem Kurztrip eine ruhige Auszeit machen."
            title="Was für euch vorbereitet ist."
          />
          <div className="included-list">
            {stay.included.map((item) => (
              <Card className="included-card" key={item}>
                <span aria-hidden="true" />
                <p>{item}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="section stay-property-section">
        <Container className="stay-property-grid">
          <div>
            <Eyebrow>{stay.property.kicker}</Eyebrow>
            <h2>{stay.property.title}</h2>
            <p>{stay.property.text}</p>
            <div className="stay-fact-row">
              {stay.property.facts.map((fact) => (
                <span key={fact}>{fact}</span>
              ))}
            </div>
          </div>
          <img alt={stay.property.imageAlt} src={stay.property.image} />
        </Container>
      </section>

      <section className="section stay-experience-section">
        <Container className="stay-experience-grid">
          <img alt={stay.experience.imageAlt} src={stay.experience.image} />
          <div>
            <Eyebrow>{stay.experience.kicker}</Eyebrow>
            <h2>{stay.experience.title}</h2>
            <p>{stay.experience.text}</p>
            <div className="experience-tags">
              {stay.experience.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="section stay-recommendations-section">
        <Container>
          <SectionHeader
            eyebrow="Vor Ort"
            text="Zur Auszeit gehören wenige, passende Hinweise für Spaziergänge, Dinner und ruhige Pausen, damit ihr nicht zwischen Optionen hängen bleibt."
            title="Weniger suchen. Mehr Zeit für den Moment."
          />
          <div className="recommendation-grid">
            {stay.recommendations.map((item) => (
              <Card className="recommendation-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="section stay-request-section" id="anfrage">
        <Container className="stay-request-grid">
          <SectionHeader
            eyebrow="Anfrage"
            text={stay.request.text}
            title={stay.request.title}
          />
          <Card className="request-card">
            <Eyebrow>Was wir abfragen</Eyebrow>
            <div className="request-field-grid">
              {stay.request.fields.map((field) => (
                <span key={field}>{field}</span>
              ))}
            </div>
            <Button
              data-conversion="stay_request_mailto"
              data-conversion-label="Couple Reset Anfrage per E-Mail"
              href="mailto:auszeiten@getmorrow.de?subject=Anfrage%20Couple%20Reset"
            >
              Anfrage per E-Mail starten
            </Button>
          </Card>
        </Container>
      </section>

      <section className="section stay-faq-section">
        <Container>
          <SectionHeader eyebrow="FAQ" title="Was Paare vorher wissen wollen." />
          <div className="faq-grid">
            {stay.faqs.map((faq) => (
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
