import type { Metadata } from "next";
import { GLAZES } from "@/lib/glazes";
import { AddPieceFlow } from "@/components/upload/AddPieceFlow";

export const metadata: Metadata = {
  title: "Add a piece",
  description: "Photo → glaze → done.",
};

export default function AddPage() {
  return <AddPieceFlow glazes={GLAZES} />;
}
