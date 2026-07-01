import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getGlazes, getPieceBySlug } from "@/lib/db";
import { getSessionMember } from "@/lib/auth";
import { AddPieceFlow } from "@/components/upload/AddPieceFlow";

export const metadata: Metadata = { title: "Edit piece" };

export default async function EditPiecePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { member } = await getSessionMember();
  if (!member) redirect(`/auth?next=/pieces/${slug}/edit`);

  const piece = await getPieceBySlug(slug);
  if (!piece) notFound();
  // Only the maker may edit; anyone else is bounced to the public view.
  if (piece.makerId !== member.id) redirect(`/pieces/${slug}`);

  const glazes = await getGlazes();
  return <AddPieceFlow glazes={glazes} mode="edit" initial={piece} />;
}
