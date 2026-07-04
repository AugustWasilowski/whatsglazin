import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSessionMember } from "@/lib/auth";
import { getStudioBySlug, getAdminStudioIds } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { SpecLabel } from "@/components/ui/Spec";
import { BackButton } from "@/components/ui/BackButton";
import { HeadlineReveal } from "@/components/motion/HeadlineReveal";
import { StudioForm } from "@/components/studios/StudioForm";

export const metadata: Metadata = { title: "Edit studio" };

export default async function EditStudioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const studio = await getStudioBySlug(slug);
  if (!studio) notFound();

  const { member } = await getSessionMember();
  if (!member) redirect(`/auth?next=/studios/${slug}/edit`);
  const adminOf = await getAdminStudioIds(member.id);
  if (!adminOf.includes(studio.id) && !member.isSiteAdmin) {
    redirect(`/studios/${slug}`);
  }

  return (
    <Container size="form" className="py-10">
      <BackButton fallback={`/studios/${slug}`} />
      <SpecLabel className="mt-5">Studio settings</SpecLabel>
      <HeadlineReveal as="h1" className="mt-3 font-display text-display-lg text-ink">
        Edit {studio.name}
      </HeadlineReveal>
      <div className="mt-8">
        <StudioForm studio={studio} />
      </div>
    </Container>
  );
}
