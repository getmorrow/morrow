import {
  guideArticles,
  homePageContent,
  publicRoutes,
  stayTemplates,
} from "@morrow/domain";
import { Button, Card, Container, Eyebrow, SectionHeader } from "@morrow/ui";
import { SiteHeader } from "./_components/SiteHeader";

export default function HomePage() {
  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="hero" id="top">
        <Container className="hero-grid">
          <div className="hero-copy">
            <Eyebrow>{homePageContent.hero.kicker}</Eyebrow>
            <h1>{homePageContent.hero.title}</h1>
            <p>{homePageContent.hero.lead}</p>
            <div className="hero-cues" aria-label="Was Morrow vorbereitet">
              {homePageContent.hero.cues.map((cue) => (
                <span key={cue}>{cue}</span>
              ))}
            </div>
            <div className="hero-actions">
              <Button href="#auszeiten">Auszeit planen</Button>
              <Button href={publicRoutes.owners} variant="secondary">
                Für Eigentümer
              </Button>
            </div>
          </div>

          <div className="hero-media">
            <div className="hero-photo-cluster">
              <img
                alt={homePageContent.hero.imageAlt}
                className="hero-photo-main"
                src={homePageContent.hero.image}
              />
              <figure className="hero-photo-card hero-photo-card-one">
                <img
                  alt={homePageContent.hero.secondaryImageAlt}
                  src={homePageContent.hero.secondaryImage}
                />
                <figcaption>Zeit zusammen</figcaption>
              </figure>
              <figure className="hero-photo-card hero-photo-card-two">
                <img
                  alt={homePageContent.hero.detailImageAlt}
                  src={homePageContent.hero.detailImage}
                />
                <figcaption>Ankommen vorbereitet</figcaption>
              </figure>
            </div>
            <div className="hero-picks" aria-label="Auszeit-Einstiege">
              {stayTemplates.map((stay) => (
                <a href={stay.href} key={stay.slug}>
                  <span>{stay.shortTitle}</span>
                  <strong>{stay.title}</strong>
                  <small>{stay.promise}</small>
                </a>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="section brand-panel">
        <Container className="intro-grid">
          <SectionHeader
            eyebrow={homePageContent.why.kicker}
            title={homePageContent.why.title}
          />
          <div className="principles">
            {homePageContent.why.items.map((item) => (
              <Card className="principle-card" key={item.title}>
                <span aria-hidden="true" className="card-marker" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="section process-section">
        <Container className="process-grid">
          <SectionHeader
            eyebrow={homePageContent.process.kicker}
            text={homePageContent.process.text}
            title={homePageContent.process.title}
          />
          <div className="process-steps" aria-label="Ablauf">
            {homePageContent.process.items.map((item, index) => (
              <article className="process-step" key={item.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="section package-band" id="auszeiten">
        <Container>
          <SectionHeader
            eyebrow={homePageContent.stays.kicker}
            text={homePageContent.stays.text}
            title={homePageContent.stays.title}
          />
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

      <section className="editorial-split">
        <Container className="editorial-grid">
          <img
            alt={homePageContent.local.imageAlt}
            src={homePageContent.local.image}
          />
          <div>
            <Eyebrow>{homePageContent.local.kicker}</Eyebrow>
            <h2>{homePageContent.local.title}</h2>
            <p>{homePageContent.local.text}</p>
            <Button href={publicRoutes.guides} variant="secondary">
              Ratgeber lesen
            </Button>
          </div>
        </Container>
      </section>

      <section className="section guide-teaser">
        <Container>
          <SectionHeader
            eyebrow="Ratgeber"
            text="Unsere Ratgeber sind keine beliebigen Reisetipps. Sie helfen euch zu verstehen, welche Art von Zeit in SPO zu euch passt."
            title="Erst Orientierung. Dann Vorfreude."
          />
          <div className="article-grid">
            {guideArticles.map((article) => (
              <a className="article-card" href={article.href} key={article.slug}>
                <img alt="" src={article.image} />
                <div>
                  <Eyebrow>{article.category}</Eyebrow>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>

      <section className="section owner-teaser">
        <Container className="owner-grid">
          <SectionHeader
            eyebrow={homePageContent.owners.kicker}
            title={homePageContent.owners.title}
          />
          <div>
            <p>{homePageContent.owners.text}</p>
            <Button href={publicRoutes.owners}>Immobilie vorstellen</Button>
          </div>
        </Container>
      </section>

      <section className="final-cta">
        <Container className="final-cta-grid">
          <SectionHeader
            eyebrow={homePageContent.finalCta.kicker}
            text={homePageContent.finalCta.text}
            title={homePageContent.finalCta.title}
          />
          <div className="final-cta-actions">
            <Button href="#auszeiten">Auszeiten ansehen</Button>
            <Button href={publicRoutes.owners} variant="secondary">
              Immobilie vorstellen
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
