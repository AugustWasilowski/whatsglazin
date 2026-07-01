import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in-only areas have nothing useful for crawlers.
      disallow: ["/auth", "/you", "/add"],
    },
    sitemap: "https://whatsglazin.com/sitemap.xml",
  };
}
