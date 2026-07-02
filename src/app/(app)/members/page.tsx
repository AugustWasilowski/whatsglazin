import type { Metadata } from "next";
import Link from "next/link";
import { getMembers, getPieces } from "@/lib/db";
import { Avatar } from "@/components/ui/Avatar";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { SpecLabel } from "@/components/ui/Spec";
import { HeadlineReveal } from "@/components/motion/HeadlineReveal";

export const metadata: Metadata = {
  title: "Members",
  description: "The makers of The Fine Line.",
};

export default async function MembersPage() {
  const [members, pieces] = await Promise.all([getMembers(), getPieces()]);
  const countByMaker = new Map<string, number>();
  for (const p of pieces) countByMaker.set(p.makerId, (countByMaker.get(p.makerId) ?? 0) + 1);

  return (
    <Container className="py-8 sm:py-10">
      <SpecLabel>The Fine Line · Roster</SpecLabel>
      <HeadlineReveal as="h1" className="mt-3 font-display text-display-xl text-ink">
        The Makers
      </HeadlineReveal>
      {members.length === 0 ? (
        <EmptyState className="mt-8" title="No members yet">
          Makers show up here once they’ve logged a piece.
        </EmptyState>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {members.map((m) => {
            const count = countByMaker.get(m.id) ?? 0;
            return (
              <li key={m.id}>
                <Link
                  href={`/members/${m.slug}`}
                  data-cursor="link"
                  className="group flex flex-wrap items-center gap-x-5 gap-y-1 px-2 py-5 transition-colors hover:bg-bone/60 sm:px-4"
                >
                  <Avatar member={m} size={56} />
                  <span className="min-w-0 flex-1 truncate font-display text-2xl text-ink transition-colors group-hover:text-terracotta">
                    {m.name}
                  </span>
                  <span className="w-full font-mono text-label uppercase text-slip sm:w-auto sm:text-right">
                    {m.disciplines.join(" · ")}
                    {m.disciplines.length ? " · " : ""}
                    {count} {count === 1 ? "piece" : "pieces"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
