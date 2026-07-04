import type { Metadata } from "next";
import { getGlazes, getStudioRefs } from "@/lib/db";
import { getSessionMember } from "@/lib/auth";
import { AddPieceFlow } from "@/components/upload/AddPieceFlow";

export const metadata: Metadata = {
  title: "Add a piece",
  description: "Photo → glaze → done.",
};

export default async function AddPage() {
  const [glazes, studios, { member }] = await Promise.all([
    getGlazes(),
    getStudioRefs(),
    getSessionMember(),
  ]);
  const studioNames = Object.fromEntries(studios.map((s) => [s.id, s.name]));

  return (
    <AddPieceFlow
      glazes={glazes}
      homeStudioId={member?.studioId}
      studioNames={studioNames}
    />
  );
}
