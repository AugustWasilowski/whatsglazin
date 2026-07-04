import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSessionMember } from "@/lib/auth";
import { getStudioBySlug, getAdminStudioIds } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { SpecLabel } from "@/components/ui/Spec";
import { BackButton } from "@/components/ui/BackButton";
import { HeadlineReveal } from "@/components/motion/HeadlineReveal";
import { GlazeEditor } from "@/components/studios/GlazeEditor";

export const metadata: Metadata = { title: "Add a glaze" };

export default async function NewStudioGlazePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const studio = await getStudioBySlug(slug);
  if (!studio) notFound();

  const { member } = await getSessionMember();
  if (!member) redirect(`/auth?next=/studios/${slug}/glazes/new`);
  const adminOf = await getAdminStudioIds(member.id);
  if (!adminOf.includes(studio.id) && !member.isSiteAdmin) {
    redirect(`/studios/${slug}`);
  }

  return (
    <Container size="form" className="py-10">
      <BackButton fallback={`/studios/${slug}`} />
      <SpecLabel className="mt-5">{studio.name} · glaze board</SpecLabel>
      <HeadlineReveal as="h1" className="mt-3 font-display text-display-lg text-ink">
        Add a glaze
      </HeadlineReveal>
      <div className="mt-8">
        <GlazeEditor studioId={studio.id} studioSlug={studio.slug} />
      </div>
    </Container>
  );
}
