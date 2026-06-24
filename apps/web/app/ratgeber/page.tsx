import { guideArticles } from "@morrow/domain";
import { Container, Eyebrow } from "@morrow/ui";
import { PublicPageShell } from "../_components/PublicPageShell";

export default function GuidesPage() {
  return (
    <PublicPageShell
      eyebrow="Ratgeber"
      text="Der Ratgeber wird systematisch für SEO und GEO aufgebaut: mit Themen rund um Auszeiten, Familienurlaub, Paarzeit und Sankt Peter-Ording."
      title="Antworten, Orientierung und lokale Einordnung."
    >
      <section className="section guide-teaser">
        <Container>
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
    </PublicPageShell>
  );
}
