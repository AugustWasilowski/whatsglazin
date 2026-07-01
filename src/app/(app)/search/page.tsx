import type { Metadata } from "next";
import { PIECES } from "@/lib/data";
import { GalleryBrowser } from "@/components/gallery/GalleryBrowser";

export const metadata: Metadata = {
  title: "Search",
  description: "Search The Fine Line by glaze, maker, or piece.",
};

// The search tab reuses the gallery browser (search + glaze filters).
export default function SearchPage() {
  const pieces = [...PIECES].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
  return <GalleryBrowser pieces={pieces} />;
}
