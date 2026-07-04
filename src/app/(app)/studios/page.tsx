import type { Metadata } from "next";
import Link from "next/link";
import { getStudios, getGlazes, getPieces } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { SpecLabel } from "@/components/ui/Spec";
import { ButtonLink } from "@/components/ui/Button";
import { HeadlineReveal } from "@/components/motion/HeadlineReveal";

export const metadata: Metadata = {
  title: "Studios",
  description: "The studios of WhatsGlazin — each with its own glazes, makers, and kiln output.",
};

export default async function StudiosPage() {
  const [studios, glazes, pieces] = await Promise.all([
    getStudios(),
    getGlazes(),
    getPieces(),
  ]);

  const glazeCount = new Map<string, number>();
  for (const g of glazes)
    if (g.studioId) glazeCount.set(g.studioId, (glazeCount.get(g.studioId) ?? 0) + 1);
  const pieceCount = new Map<string, number>();
  for (const p of pieces)
    if (p.studioId) pieceCount.set(p.studioId, (pieceCount.get(p.studioId) ?? 0) + 1);

  return (
    <Container className="py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SpecLabel>What&rsquo;s glazin · everywhere</SpecLabel>
          <HeadlineReveal as="h1" className="mt-3 font-display text-display-xl text-ink">
            The Studios
          </HeadlineReveal>
        </div>
        <ButtonLink href="/studios/new" variant="secondary">
          Start a studio
        </ButtonLink>
      </div>

      {studios.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No studios yet"
          action={<ButtonLink href="/studios/new">Start the first one</ButtonLink>}
        >
          A studio&rsquo;s corner holds its glaze library and everything fired there.
        </EmptyState>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {studios.map((s) => (
            <li key={s.id}>
              <Link
                href={`/studios/${s.slug}`}
                data-cursor="link"
                className="group flex flex-wrap items-center gap-x-5 gap-y-1 px-2 py-6 transition-colors hover:bg-bone/60 sm:px-4"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-2xl text-ink transition-colors group-hover:text-terracotta sm:text-3xl">
                    {s.name}
                  </span>
                  {(s.location || s.established) && (
                    <span className="mt-1 block font-mono text-label uppercase text-slip">
                      {[s.location, s.established ? `est. ${s.established}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  )}
                </span>
                <span className="w-full font-mono text-label uppercase text-slip sm:w-auto sm:text-right">
                  {glazeCount.get(s.id) ?? 0} glazes · {pieceCount.get(s.id) ?? 0}{" "}
                  {(pieceCount.get(s.id) ?? 0) === 1 ? "piece" : "pieces"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
