import type { MetadataRoute } from "next";
import { getPieces, getGlazes, getMembers } from "@/lib/db";

const BASE = "https://whatsglazin.com";

/** Static marketing/browse routes plus every public piece, glaze, and member. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/gallery`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/glazes`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/members`, changeFrequency: "weekly", priority: 0.6 },
  ];

  try {
    const [pieces, glazes, members] = await Promise.all([
      getPieces(),
      getGlazes(),
      getMembers(),
    ]);
    for (const p of pieces)
      routes.push({
        url: `${BASE}/pieces/${p.slug}`,
        lastModified: p.createdAt,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    for (const g of glazes)
      routes.push({ url: `${BASE}/glazes/${g.slug}`, changeFrequency: "monthly", priority: 0.5 });
    for (const m of members)
      routes.push({ url: `${BASE}/members/${m.slug}`, changeFrequency: "monthly", priority: 0.4 });
  } catch {
    // If the DB is unreachable at build/request time, still ship the static map.
  }

  return routes;
}
