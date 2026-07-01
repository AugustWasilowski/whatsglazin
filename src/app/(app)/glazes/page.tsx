import type { Metadata } from "next";
import { GLAZES } from "@/lib/glazes";
import { GlazeLibrary } from "@/components/glazes/GlazeLibrary";

export const metadata: Metadata = {
  title: "Glaze library",
  description: "Every glaze at The Fine Line, with example pieces for each.",
};

export default function GlazesPage() {
  return <GlazeLibrary glazes={GLAZES} />;
}
