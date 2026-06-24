import { guideArticles } from "@morrow/domain";
import { Container } from "@morrow/ui";
import { PublicPageShell } from "../../_components/PublicPageShell";

type GuideArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return guideArticles.map((article) => ({ slug: article.slug }));
}

export default async function GuideArticlePage({ params }: GuideArticlePageProps) {
  const { slug } = await params;
  const article = guideArticles.find((item) => item.slug === slug);

  return (
    <PublicPageShell
      eyebrow={article?.category ?? "Ratgeber"}
      text={
        article?.excerpt ??
        "Dieser Ratgeber wird im nächsten Migrationsschritt ausgearbeitet."
      }
      title={article?.title ?? "Morrow Ratgeber"}
    >
      <section className="section">
        <Container className="detail-preview">
          {article?.image ? <img alt="" src={article.image} /> : null}
          <p>
            Der vollständige Artikel wird aus dem Prototyp in eine
            SEO-fähige Next.js-Struktur migriert: mit Inhaltsverzeichnis,
            Autor, Lesezeit, strukturierten Abschnitten, Bildern und
            passenden CTAs.
          </p>
        </Container>
      </section>
    </PublicPageShell>
  );
}
