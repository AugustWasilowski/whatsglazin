import type { Metadata } from "next";
import { getGlazesWithCounts, getStudioRefs } from "@/lib/db";
import { GlazeLibrary } from "@/components/glazes/GlazeLibrary";

export const metadata: Metadata = {
  title: "Glaze library",
  description: "Every glaze on WhatsGlazin, studio by studio, with example pieces for each.",
};

export default async function GlazesPage() {
  const [glazes, studios] = await Promise.all([getGlazesWithCounts(), getStudioRefs()]);
  return <GlazeLibrary glazes={glazes} studios={studios} />;
}
