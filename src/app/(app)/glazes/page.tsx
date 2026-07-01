import type { Metadata } from "next";
import { getGlazesWithCounts } from "@/lib/db";
import { GlazeLibrary } from "@/components/glazes/GlazeLibrary";

export const metadata: Metadata = {
  title: "Glaze library",
  description: "Every glaze at The Fine Line, with example pieces for each.",
};

export default async function GlazesPage() {
  const glazes = await getGlazesWithCounts();
  return <GlazeLibrary glazes={glazes} />;
}
