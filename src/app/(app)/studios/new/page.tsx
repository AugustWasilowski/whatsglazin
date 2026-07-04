import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionMember } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { SpecLabel } from "@/components/ui/Spec";
import { HeadlineReveal } from "@/components/motion/HeadlineReveal";
import { StudioForm } from "@/components/studios/StudioForm";

export const metadata: Metadata = {
  title: "Start a studio",
  description: "Give your studio its own corner of WhatsGlazin.",
};

export default async function NewStudioPage() {
  const { user } = await getSessionMember();
  if (!user) redirect("/auth?next=/studios/new");

  return (
    <Container size="form" className="py-10">
      <SpecLabel>A new corner</SpecLabel>
      <HeadlineReveal as="h1" className="mt-3 font-display text-display-lg text-ink">
        Start a studio
      </HeadlineReveal>
      <p className="mt-3 text-ink-2">
        Your studio gets its own glaze board, gallery of pieces, and page —
        whatsglazin.com/studios/your-studio.
      </p>
      <div className="mt-8">
        <StudioForm />
      </div>
    </Container>
  );
}
