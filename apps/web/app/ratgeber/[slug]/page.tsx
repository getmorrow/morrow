import { notFound } from "next/navigation";
import { guideArticles, stayDetails } from "@morrow/domain";
import type { GuideArticle } from "@morrow/domain";
import { Button, Card, Container, Eyebrow } from "@morrow/ui";
import { SiteHeader } from "../../_components/SiteHeader";

type GuideArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return guideArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: GuideArticlePageProps) {
  const { slug } = await params;
  const article = guideArticles.find((item) => item.slug === slug);

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      images: [article.image],
    },
  };
}

export default async function GuideArticlePage({ params }: GuideArticlePageProps) {
  const { slug } = await params;
  const article = guideArticles.find((item) => item.slug === slug);

  if (!article) {
    notFound();
  }

  const [quickAnswer, ...articleSections] = article.sections;
  const relatedStays = article.relatedStaySlugs
    .map((staySlug) => stayDetails[staySlug])
    .filter(Boolean);

  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="article-hero">
        <Container className="article-hero-grid">
          <div>
            <Eyebrow>Ratgeber</Eyebrow>
            <h1>{article.title}</h1>
            <p>{article.description}</p>
            <div className="article-meta" aria-label="Artikelinformationen">
              <span>{article.author}</span>
              <span>{formatGermanDate(article.publishedAt)}</span>
              <span>{article.readingTime}</span>
            </div>
          </div>
          <img alt="" src={article.image} />
        </Container>
      </section>

      <article className="article-layout">
        <Container className="article-layout-grid">
          <aside className="article-sidebar">
            <ArticleToc sections={articleSections} />
            <Card className="article-side-card">
              <Eyebrow>Artikelinfo</Eyebrow>
              <p>
                <strong>{article.author}</strong>
              </p>
              <p>{formatGermanDate(article.publishedAt)}</p>
              <p>{article.readingTime}</p>
            </Card>
          </aside>

          <div className="article-main-flow">
            {quickAnswer ? (
              <section className="article-answer">
                <Eyebrow>Kurz gesagt</Eyebrow>
                <h2>{quickAnswer.title}</h2>
                <ArticleText body={quickAnswer.body} />
              </section>
            ) : null}

            <div className="article-toc-mobile">
              <ArticleToc sections={articleSections} />
            </div>

            <ArticleContext article={article} />

            <div className="article-body">
              {articleSections.map((section, index) => (
                <ArticleSection
                  article={article}
                  index={index}
                  key={section.title}
                  section={section}
                />
              ))}
            </div>
          </div>
        </Container>
      </article>

      {relatedStays.length > 0 ? (
        <section className="section article-related">
          <Container>
            <Eyebrow>Passende Auszeit</Eyebrow>
            <h2>Wenn ihr nicht alles selbst zusammensuchen möchtet.</h2>
            <p>
              Morrow verbindet Unterkunft, Erlebnis und Orientierung vor Ort zu einer
              vorbereiteten Auszeit.
            </p>
            <div className="article-related-grid">
              {relatedStays.map((stay) => (
                <a className="stay-overview-card" href={stay.href} key={stay.slug}>
                  <img alt={stay.title} src={stay.image} />
                  <div className="stay-overview-content">
                    <span>{stay.shortTitle}</span>
                    <h3>{stay.title}</h3>
                    <p>{stay.lead}</p>
                    <strong>Auszeit ansehen</strong>
                  </div>
                </a>
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </main>
  );
}

function ArticleToc({ sections }: { sections: GuideArticle["sections"] }) {
  return (
    <nav className="article-toc" aria-label="Inhaltsverzeichnis">
      <Eyebrow>In diesem Ratgeber</Eyebrow>
      <div>
        {sections.map((section) => (
          <a href={`#${articleSectionId(section.title)}`} key={section.title}>
            {section.title}
          </a>
        ))}
      </div>
    </nav>
  );
}

function ArticleContext({ article }: { article: GuideArticle }) {
  const context =
    article.audience === "families"
      ? {
          image: "/brand/generated/morrow-article-family-arrival-dunes.png",
          alt: "Familie läuft durch die Dünen von Sankt Peter-Ording Richtung Strand",
          kicker: "Familienzeit in SPO",
          title: "Gute Planung heißt nicht, jeden Tag vollzumachen.",
          text:
            "Für Familien ist oft entscheidend, dass Unterkunft, Wege, Wetter und ein erster Naturmoment zusammenpassen. Dann bleibt mehr Raum für das, worum es eigentlich geht: gemeinsam am Meer sein.",
        }
      : article.audience === "couples"
        ? {
            image: "/brand/generated/morrow-article-couple-beach-walk.png",
            alt: "Paar läuft gemeinsam am Nordseestrand in Sankt Peter-Ording",
            kicker: "Paarzeit in SPO",
            title: "Wenige gute Entscheidungen reichen oft.",
            text:
              "Für Paare entsteht Erholung nicht durch ein volles Programm, sondern durch einen Ort, der Abstand schafft, und Momente, die ohne viel Abstimmung funktionieren.",
          }
        : {
            image: "/brand/generated/morrow-spo-local-orientation.png",
            alt: "Vorbereitete Orientierung mit Blick auf Dünen und Pfahlbau in Sankt Peter-Ording",
            kicker: "Orientierung vor Ort",
            title: "SPO wird leichter, wenn ihr nicht bei null startet.",
            text:
              "Strand, Wetter, Wege und Erlebnisse wirken am besten, wenn sie zusammen gedacht werden. Genau dafür sammelt der Ratgeber lokale Orientierung.",
          };

  return (
    <section className="article-context-panel">
      <img alt={context.alt} src={context.image} />
      <div>
        <Eyebrow>{context.kicker}</Eyebrow>
        <h2>{context.title}</h2>
        <p>{context.text}</p>
      </div>
    </section>
  );
}

function ArticleSection({
  article,
  section,
  index,
}: {
  article: GuideArticle;
  section: GuideArticle["sections"][number];
  index: number;
}) {
  const id = articleSectionId(section.title);
  const normalizedTitle = section.title.toLowerCase();
  const isFaq = normalizedTitle.startsWith("häufige fragen");
  const isChecklist = normalizedTitle.includes("checkliste");
  const isMorrowBridge = normalizedTitle.startsWith("wann morrow");
  const shouldFeature = !isFaq && !isChecklist && !isMorrowBridge && [0, 4].includes(index);

  if (isChecklist) {
    return <ArticleChecklistSection id={id} section={section} />;
  }

  if (isFaq) {
    return <ArticleFaqSection id={id} section={section} />;
  }

  if (isMorrowBridge) {
    return <ArticleMorrowBridge article={article} id={id} />;
  }

  if (shouldFeature) {
    const visual = articleVisualFor(article, index);

    return (
      <section className="article-feature-section" id={id}>
        <div>
          <Eyebrow>{articleSectionKickerFor(section.title)}</Eyebrow>
          <h2>{section.title}</h2>
          <ArticleText body={section.body} />
        </div>
        <img alt={visual.alt} src={visual.src} />
      </section>
    );
  }

  return (
    <section className="article-text-section" id={id}>
      <Eyebrow>{articleSectionKickerFor(section.title)}</Eyebrow>
      <h2>{section.title}</h2>
      <ArticleText body={section.body} />
    </section>
  );
}

function ArticleText({ body }: { body: string }) {
  return (
    <div className="article-richtext">
      {body.split("\n\n").map((block) => {
        const lines = block.split("\n");
        const listItems = lines.filter((line) => line.trim().startsWith("- "));
        const intro = lines.filter((line) => !line.trim().startsWith("- ")).join(" ");

        if (listItems.length > 0) {
          return (
            <div className="article-list-block" key={block}>
              {intro ? <p>{intro}</p> : null}
              <ul>
                {listItems.map((line) => (
                  <li key={line}>{line.replace(/^- /, "")}</li>
                ))}
              </ul>
            </div>
          );
        }

        return <p key={block}>{block}</p>;
      })}
    </div>
  );
}

function ArticleChecklistSection({
  id,
  section,
}: {
  id: string;
  section: GuideArticle["sections"][number];
}) {
  const lines = section.body.split("\n").filter(Boolean);
  const items = lines.filter((line) => line.startsWith("- ")).map((line) => line.replace(/^- /, ""));
  const intro = lines.filter((line) => !line.startsWith("- ")).join(" ");

  return (
    <section className="article-checklist-section" id={id}>
      <Eyebrow>Kurz prüfen</Eyebrow>
      <h2>{section.title}</h2>
      {intro ? <p>{intro}</p> : null}
      <div className="article-checklist-grid">
        {items.map((item, index) => (
          <Card className="article-check-card" key={item}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{item}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ArticleFaqSection({
  id,
  section,
}: {
  id: string;
  section: GuideArticle["sections"][number];
}) {
  const items = section.body.split("\n\n").map((block) => {
    const [question, ...answer] = block.split("\n");
    return {
      question,
      answer: answer.join(" "),
    };
  });

  return (
    <section className="article-faq-section" id={id}>
      <Eyebrow>Gut zu wissen</Eyebrow>
      <h2>{section.title}</h2>
      <div className="article-faq-grid">
        {items.map((item) => (
          <Card className="faq-card" key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ArticleMorrowBridge({ article, id }: { article: GuideArticle; id: string }) {
  const href =
    article.audience === "couples"
      ? "/auszeiten/couple-reset"
      : article.audience === "both"
        ? "/auszeiten"
        : "/auszeiten/family-escape";
  const title =
    article.audience === "couples"
      ? "Weniger suchen. Mehr Zeit zu zweit."
      : article.audience === "both"
        ? "Weniger suchen. Bewusster ankommen."
        : "Weniger suchen. Mehr Familienzeit.";
  const text =
    article.audience === "couples"
      ? "Unterkunft, ruhiges Erlebnis und Empfehlungen sind bereits zusammen gedacht. Ihr kommt an, habt Orientierung und behaltet freie Zeit."
      : article.audience === "both"
        ? "Unterkunft, Erlebnis und Empfehlungen sind bereits zusammen gedacht. So entsteht aus vielen Möglichkeiten ein Aufenthalt, der zu euch passt."
        : "Unterkunft, lokales Erlebnis und Empfehlungen sind bereits zusammen gedacht. Ihr kommt an, habt Orientierung und behaltet freie Zeit.";

  return (
    <section className="article-morrow-section" id={id}>
      <div>
        <Eyebrow>Kuratierte Auszeit</Eyebrow>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <Button href={href}>{article.audience === "both" ? "Auszeiten ansehen" : "Auszeit ansehen"}</Button>
    </section>
  );
}

function articleVisualFor(article: GuideArticle, index: number) {
  const familyVisuals = [
    {
      src: "/brand/generated/morrow-article-family-arrival-dunes.png",
      alt: "Familie kommt entspannt in Sankt Peter-Ording an",
    },
    {
      src: "/brand/generated/morrow-article-family-watt-rest.png",
      alt: "Familie erlebt gemeinsame Zeit in den Dünen von Sankt Peter-Ording",
    },
    {
      src: "/brand/generated/morrow-article-family-wide-beach.png",
      alt: "Ruhiger Familienmoment am Strand von Sankt Peter-Ording",
    },
  ];
  const coupleVisuals = [
    {
      src: "/brand/generated/morrow-article-couple-beach-walk.png",
      alt: "Paar läuft gemeinsam am Strand von Sankt Peter-Ording",
    },
    {
      src: "/brand/generated/morrow-article-couple-dunes-rest.png",
      alt: "Paar sitzt ruhig am Nordseestrand in Sankt Peter-Ording",
    },
    {
      src: "/brand/generated/morrow-article-couple-table-moment.png",
      alt: "Ruhiger gemeinsamer Moment am Tisch während einer Auszeit",
    },
  ];
  const bothVisuals = [
    {
      src: "/brand/generated/morrow-spo-local-orientation.png",
      alt: "Lokale Orientierung mit Blick auf Sankt Peter-Ording",
    },
    {
      src: "/brand/generated/morrow-spo-image-set.png",
      alt: "Erlebnisse und Nordseemomente in Sankt Peter-Ording",
    },
  ];
  const visuals =
    article.audience === "families"
      ? familyVisuals
      : article.audience === "couples"
        ? coupleVisuals
        : bothVisuals;

  return visuals[index % visuals.length];
}

function articleSectionKickerFor(title: string) {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes("strand")) return "Der Strand";
  if (normalizedTitle.includes("wellness") || normalizedTitle.includes("thalasso")) return "Wellness";
  if (normalizedTitle.includes("dinner") || normalizedTitle.includes("abend") || normalizedTitle.includes("essen")) return "Abend & Essen";
  if (normalizedTitle.includes("wetter") || normalizedTitle.includes("regen")) return "Wetter";
  if (normalizedTitle.includes("watt")) return "Watt & Natur";
  if (normalizedTitle.includes("unterkunft")) return "Unterkunft";
  if (normalizedTitle.includes("erlebnis") || normalizedTitle.includes("aktivität")) return "Erlebnisse";
  if (normalizedTitle.includes("familie") || normalizedTitle.includes("kinder")) return "Familienzeit";
  if (normalizedTitle.includes("paare") || normalizedTitle.includes("zweit")) return "Paarzeit";
  if (normalizedTitle.includes("ort") || normalizedTitle.includes("spo") || normalizedTitle.includes("sankt peter-ording")) return "Sankt Peter-Ording";

  return "Orientierung";
}

function articleSectionId(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatGermanDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
