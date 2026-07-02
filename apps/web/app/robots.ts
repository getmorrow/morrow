import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/app/gast", "/app/gast/", "/app/eigentuemer", "/app/eigentuemer/"],
      },
    ],
    sitemap: "https://www.getmorrow.de/sitemap.xml",
  };
}
