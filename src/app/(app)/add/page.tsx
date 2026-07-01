import type { Metadata } from "next";
import { getGlazes } from "@/lib/db";
import { AddPieceFlow } from "@/components/upload/AddPieceFlow";

export const metadata: Metadata = {
  title: "Add a piece",
  description: "Photo → glaze → done.",
};

export default async function AddPage() {
  const glazes = await getGlazes();
  return <AddPieceFlow glazes={glazes} />;
}
