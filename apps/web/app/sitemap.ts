import type { MetadataRoute } from "next";
import { guideArticles, publicRoutes } from "@morrow/domain";

const baseUrl = "https://www.getmorrow.de";

export default function sitemap(): MetadataRoute.Sitemap {
  const routePaths = [
    ...Object.values(publicRoutes),
    ...guideArticles.map((article) => article.href),
  ];

  return routePaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
