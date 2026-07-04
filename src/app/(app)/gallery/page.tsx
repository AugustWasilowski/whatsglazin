import type { Metadata } from "next";
import { getPieces, getGlazes, getStudioRefs } from "@/lib/db";
import { getSessionMember } from "@/lib/auth";
import { GalleryBrowser } from "@/components/gallery/GalleryBrowser";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse and search pottery by glaze, maker, studio, and combination.",
};

export default async function GalleryPage() {
  const [pieces, glazes, studios, { member }] = await Promise.all([
    getPieces(),
    getGlazes(),
    getStudioRefs(),
    getSessionMember(),
  ]);

  // Only studios with work on the wall earn a context chip.
  const withPieces = studios.filter((s) => pieces.some((p) => p.studioId === s.id));

  return (
    <GalleryBrowser
      pieces={pieces}
      glazes={glazes}
      studios={withPieces}
      initialStudioId={member?.studioId ?? null}
    />
  );
}
