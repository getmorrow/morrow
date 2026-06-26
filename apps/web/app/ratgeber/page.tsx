import { guideArticles } from "@morrow/domain";
import { Button, Card, Container, Eyebrow, SectionHeader } from "@morrow/ui";
import { JsonLd } from "../_components/JsonLd";
import { SiteHeader } from "../_components/SiteHeader";
import { guidesStructuredData } from "../_lib/structuredData";

export const metadata = {
  title: "Ratgeber",
  description:
    "Der Morrow Ratgeber sammelt Orientierung zu Sankt Peter-Ording, Familienurlaub, Paarzeit, Wetter, Watt, Erlebnissen und vorbereiteten Auszeiten.",
};

const guideThemes = [
  {
    title: "Mit Kindern in SPO",
    text:
      "Strand, Watt, Wege und Pausen so denken, dass Familien nicht jeden Tag neu planen müssen.",
  },
  {
    title: "Zeit zu zweit",
    text:
      "Ruhige Orte, gute Anlässe und wenige Entscheidungen für Paare, die Abstand vom Alltag suchen.",
  },
  {
    title: "Erlebnisse vor Ort",
    text:
      "Lokale Ideen, die zu Wetter, Unterkunft und Stimmung passen, statt eine endlose Liste zu werden.",
  },
];

export default function GuidesPage() {
  const [featuredArticle, ...secondaryArticles] = guideArticles;

  return (
    <main className="site-shell">
      <JsonLd data={guidesStructuredData()} />
      <SiteHeader />

      <section className="guide-index-hero">
        <Container className="guide-index-hero-grid">
          <div>
            <Eyebrow>Ratgeber</Eyebrow>
            <h1>Sankt Peter-Ording bewusst planen.</h1>
            <p>
              Antworten auf die Fragen, die vor und während eines Urlaubs an der
              Nordsee wirklich zählen: Ort, Wetter, Erlebnisse, Familienzeit,
              Paarzeit und gute Entscheidungen vor Ort.
            </p>
            <div className="guide-index-actions">
              <Button
                data-conversion="guide_index_click"
                data-conversion-label="Ratgeber Hero Artikel entdecken"
                href="#ratgeber-artikel"
              >
                Artikel entdecken
              </Button>
              <Button
                data-conversion="cta_stays_view"
                data-conversion-label="Ratgeber Hero Auszeiten ansehen"
                href="/auszeiten"
                variant="secondary"
              >
                Auszeiten ansehen
              </Button>
            </div>
          </div>
          <div className="guide-index-media" aria-label="Sankt Peter-Ording Impressionen">
            <img
              alt="Vorbereitete Orientierung mit Blick auf Dünen und Pfahlbau in Sankt Peter-Ording"
              className="guide-index-main-image"
              src="/brand/generated/morrow-spo-local-orientation.png"
            />
            <img
              alt="Familie erlebt eine ruhige Naturzeit im Watt von Sankt Peter-Ording"
              className="guide-index-small-image guide-index-small-one"
              src="/brand/generated/morrow-spo-family-watt.png"
            />
            <img
              alt="Paar sitzt gemeinsam in den Dünen von Sankt Peter-Ording"
              className="guide-index-small-image guide-index-small-two"
              src="/brand/generated/morrow-spo-couple-testimonial-beach-b.png"
            />
            <Card className="guide-index-note">
              <span>Orientierung vor Ort</span>
              <p>Auszeiten, Erlebnisse und Hinweise für SPO.</p>
            </Card>
          </div>
        </Container>
      </section>

      <section className="section guide-theme-section" aria-label="Ratgeber Themen">
        <Container className="guide-theme-grid">
          {guideThemes.map((theme) => (
            <Card className="guide-theme-card" key={theme.title}>
              <span aria-hidden="true" className="card-marker" />
              <h2>{theme.title}</h2>
              <p>{theme.text}</p>
            </Card>
          ))}
        </Container>
      </section>

      <section className="section guide-index-section" id="ratgeber-artikel">
        <Container>
          <SectionHeader
            eyebrow="Aktuelle Artikel"
            text="Wir sammeln Fragen, Ideen und lokale Hinweise rund um Urlaub, Auszeiten, Erlebnisse und Sankt Peter-Ording und führen von dort zu passenden Aufenthalten."
            title="Alles, was euren Aufenthalt in SPO leichter macht."
          />

          {featuredArticle ? (
            <article className="guide-featured-article">
              <img alt="" src={featuredArticle.image} />
              <div>
                <Eyebrow>Startpunkt</Eyebrow>
                <h2>{featuredArticle.title}</h2>
                <p>{featuredArticle.excerpt}</p>
                <Button
                  data-conversion="guide_article_click"
                  data-conversion-label={`Featured ${featuredArticle.title}`}
                  href={featuredArticle.href}
                >
                  Artikel lesen
                </Button>
              </div>
            </article>
          ) : null}

          <div className="article-grid guide-index-grid">
            {secondaryArticles.map((article) => (
              <a
                className="article-card"
                data-conversion="guide_article_click"
                data-conversion-label={article.title}
                href={article.href}
                key={article.slug}
              >
                <img alt="" src={article.image} />
                <div>
                  <Eyebrow>{article.category}</Eyebrow>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <span>Lesen</span>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
