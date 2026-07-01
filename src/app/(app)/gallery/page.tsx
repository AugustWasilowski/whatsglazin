import type { Metadata } from "next";
import { getPieces, getGlazes } from "@/lib/db";
import { GalleryBrowser } from "@/components/gallery/GalleryBrowser";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse and search The Fine Line's pottery by glaze, maker, and combination.",
};

export default async function GalleryPage() {
  const [pieces, glazes] = await Promise.all([getPieces(), getGlazes()]);
  return <GalleryBrowser pieces={pieces} glazes={glazes} />;
}
