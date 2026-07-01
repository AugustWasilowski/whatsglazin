import type { Metadata } from "next";
import { PIECES } from "@/lib/data";
import { GalleryBrowser } from "@/components/gallery/GalleryBrowser";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse and search The Fine Line's pottery by glaze, maker, and combination.",
};

export default function GalleryPage() {
  // Newest first. In Phase 2 this comes from Supabase.
  const pieces = [...PIECES].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
  return <GalleryBrowser pieces={pieces} />;
}
