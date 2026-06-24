import type { MetadataRoute } from "next";
import { publicRoutes } from "@morrow/domain";

const baseUrl = "https://www.getmorrow.de";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(publicRoutes).map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
