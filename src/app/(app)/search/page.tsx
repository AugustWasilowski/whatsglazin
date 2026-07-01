import type { Metadata } from "next";
import { getPieces, getGlazes } from "@/lib/db";
import { GalleryBrowser } from "@/components/gallery/GalleryBrowser";

export const metadata: Metadata = {
  title: "Search",
  description: "Search The Fine Line by glaze, maker, or piece.",
};

// The search tab reuses the gallery browser (search + glaze filters).
export default async function SearchPage() {
  const [pieces, glazes] = await Promise.all([getPieces(), getGlazes()]);
  return <GalleryBrowser pieces={pieces} glazes={glazes} />;
}
