import type { GuideArticle, StayDetail } from "@morrow/domain";
import { guideArticles, publicRoutes, stayTemplates } from "@morrow/domain";

const siteUrl = "https://www.getmorrow.de";

function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function parsePrice(value: string) {
  const numeric = value.replace(/[^\d,.-]/g, "");
  const normalized = numeric.includes(",")
    ? numeric.replace(/\./g, "").replace(",", ".")
    : numeric.replace(/\.(?=\d{3}(?:\D|$))/g, "");
  const price = Number.parseFloat(normalized);
  return Number.isFinite(price) ? price : undefined;
}

function breadcrumb(items: Array<{ name: string; item: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.item),
    })),
  };
}

export function homeStructuredData() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Morrow",
      url: siteUrl,
      logo: absoluteUrl("/brand/morrow-wordmark-offblack.svg"),
      sameAs: [],
      areaServed: "Sankt Peter-Ording",
      description:
        "Morrow verbindet ausgewählte Unterkünfte, lokale Erlebnisse und persönliche Betreuung zu vorbereiteten Auszeiten in Sankt Peter-Ording.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Morrow",
      url: siteUrl,
      inLanguage: "de-DE",
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Kuratierte Auszeiten in Sankt Peter-Ording",
      itemListElement: stayTemplates.map((stay, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: stay.title,
        url: absoluteUrl(stay.href),
      })),
    },
  ];
}

export function staysStructuredData() {
  return [
    breadcrumb([
      { name: "Morrow", item: publicRoutes.home },
      { name: "Auszeiten", item: publicRoutes.stays },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Morrow Auszeiten",
      itemListElement: stayTemplates.map((stay, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: stay.title,
        description: stay.lead,
        url: absoluteUrl(stay.href),
      })),
    },
  ];
}

export function stayStructuredData(stay: StayDetail) {
  const price = parsePrice(stay.price);

  return [
    breadcrumb([
      { name: "Morrow", item: publicRoutes.home },
      { name: "Auszeiten", item: publicRoutes.stays },
      { name: stay.title, item: stay.href },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${stay.title} in ${stay.location}`,
      description: stay.heroLead,
      image: stay.heroGallery.map((image) => absoluteUrl(image.src)),
      brand: {
        "@type": "Brand",
        name: "Morrow",
      },
      audience: {
        "@type": "Audience",
        audienceType: stay.audience === "families" ? "Familien" : "Paare",
      },
      offers: {
        "@type": "Offer",
        url: absoluteUrl(stay.href),
        priceCurrency: "EUR",
        ...(price ? { price } : {}),
        availability: "https://schema.org/LimitedAvailability",
        areaServed: stay.location,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: stay.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];
}

export function guidesStructuredData() {
  return [
    breadcrumb([
      { name: "Morrow", item: publicRoutes.home },
      { name: "Ratgeber", item: publicRoutes.guides },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Morrow Ratgeber",
      url: absoluteUrl(publicRoutes.guides),
      hasPart: guideArticles.map((article) => ({
        "@type": "Article",
        headline: article.title,
        url: absoluteUrl(article.href),
      })),
    },
  ];
}

export function articleStructuredData(article: GuideArticle) {
  return [
    breadcrumb([
      { name: "Morrow", item: publicRoutes.home },
      { name: "Ratgeber", item: publicRoutes.guides },
      { name: article.title, item: article.href },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.description,
      image: absoluteUrl(article.image),
      datePublished: article.publishedAt,
      dateModified: article.publishedAt,
      author: {
        "@type": "Organization",
        name: article.author,
      },
      publisher: {
        "@type": "Organization",
        name: "Morrow",
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/brand/morrow-wordmark-offblack.svg"),
        },
      },
      mainEntityOfPage: absoluteUrl(article.href),
      inLanguage: "de-DE",
    },
  ];
}

export function ownersStructuredData() {
  return [
    breadcrumb([
      { name: "Morrow", item: publicRoutes.home },
      { name: "Für Eigentümer", item: publicRoutes.owners },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Morrow für Eigentümer",
      provider: {
        "@type": "Organization",
        name: "Morrow",
        url: siteUrl,
      },
      areaServed: "Sankt Peter-Ording",
      serviceType: "Ferienimmobilien-Vermarktung und Hospitality-Betrieb",
      description:
        "Morrow unterstützt Eigentümer hochwertiger Ferienimmobilien mit Positionierung, Vermarktung, Transparenz und vorbereiteten Aufenthalten.",
    },
  ];
}

export function partnersStructuredData() {
  return [
    breadcrumb([
      { name: "Morrow", item: publicRoutes.home },
      { name: "Für Erlebnispartner", item: publicRoutes.partners },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Morrow Erlebnispartner",
      provider: {
        "@type": "Organization",
        name: "Morrow",
        url: siteUrl,
      },
      areaServed: "Sankt Peter-Ording",
      serviceType: "Kuratierte lokale Erlebnisse für Ferienaufenthalte",
      description:
        "Morrow arbeitet mit ausgewählten lokalen Erlebnispartnern, die vorbereitete Auszeiten in Sankt Peter-Ording bereichern.",
    },
  ];
}
