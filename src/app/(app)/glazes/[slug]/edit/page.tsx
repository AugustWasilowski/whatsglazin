import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSessionMember } from "@/lib/auth";
import { getGlazeBySlug, getAdminStudioIds, getStudios } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { SpecLabel } from "@/components/ui/Spec";
import { BackButton } from "@/components/ui/BackButton";
import { HeadlineReveal } from "@/components/motion/HeadlineReveal";
import { GlazeEditor } from "@/components/studios/GlazeEditor";

export const metadata: Metadata = { title: "Edit glaze" };

export default async function EditGlazePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const glaze = await getGlazeBySlug(slug);
  if (!glaze) notFound();

  const { member } = await getSessionMember();
  if (!member) redirect(`/auth?next=/glazes/${slug}/edit`);

  // Studio-library glazes: that studio's admins. Personal: the creator.
  // Site admin: anything. (RLS enforces the same rules underneath.)
  if (!member.isSiteAdmin) {
    if (glaze.studioId) {
      const adminOf = await getAdminStudioIds(member.id);
      if (!adminOf.includes(glaze.studioId)) redirect(`/glazes/${slug}`);
    } else if (glaze.createdBy !== member.id) {
      redirect(`/glazes/${slug}`);
    }
  }

  const studios = glaze.studioId ? await getStudios(true) : [];
  const studioSlug = studios.find((s) => s.id === glaze.studioId)?.slug;

  return (
    <Container size="form" className="py-10">
      <BackButton fallback={`/glazes/${slug}`} />
      <SpecLabel className="mt-5">
        {studioSlug ? "Studio glaze board" : "Personal glaze"}
      </SpecLabel>
      <HeadlineReveal as="h1" className="mt-3 font-display text-display-lg text-ink">
        Edit {glaze.name}
      </HeadlineReveal>
      <div className="mt-8">
        <GlazeEditor glaze={glaze} studioSlug={studioSlug} />
      </div>
    </Container>
  );
}
