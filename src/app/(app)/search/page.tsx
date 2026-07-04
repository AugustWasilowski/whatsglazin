import type { Metadata } from "next";
import { getPieces, getGlazes, getStudioRefs } from "@/lib/db";
import { GalleryBrowser } from "@/components/gallery/GalleryBrowser";

export const metadata: Metadata = {
  title: "Search",
  description: "Search pottery by glaze, maker, studio, or piece.",
};

// The search tab reuses the gallery browser but with its own heading, an
// auto-focused field, and no default studio scope (search spans everything).
export default async function SearchPage() {
  const [pieces, glazes, studios] = await Promise.all([
    getPieces(),
    getGlazes(),
    getStudioRefs(),
  ]);
  const withPieces = studios.filter((s) => pieces.some((p) => p.studioId === s.id));

  return (
    <GalleryBrowser
      pieces={pieces}
      glazes={glazes}
      studios={withPieces}
      eyebrow="Find a piece"
      heading="Search"
      autoFocus
    />
  );
}
