import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMemberBySlug, getPieces } from "@/lib/db";
import { swatchBg } from "@/lib/glazes";
import { Avatar } from "@/components/ui/Avatar";
import { Container } from "@/components/ui/Container";
import { SpecLabel } from "@/components/ui/Spec";
import { PotteryCard } from "@/components/PotteryCard";
import type { Glaze } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = await getMemberBySlug(slug);
  return member ? { title: member.name } : { title: "Member not found" };
}

export default async function MemberProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = await getMemberBySlug(slug);
  if (!member) notFound();

  const allPieces = await getPieces();
  const pieces = allPieces.filter((p) => p.makerId === member.id);

  // Distinct glazes they reach for, by frequency.
  const seen = new Map<string, { glaze: Glaze; count: number }>();
  for (const p of pieces)
    for (const g of p.glazes) {
      const cur = seen.get(g.id);
      if (cur) cur.count += 1;
      else seen.set(g.id, { glaze: g, count: 1 });
    }
  const reaches = [...seen.values()].sort((a, b) => b.count - a.count).map((x) => x.glaze);
  const mostUsed = reaches[0];

  return (
    <Container className="py-8 sm:py-10">
      <div className="flex items-center gap-5 sm:gap-7">
        <Avatar member={member} size={96} />
        <div className="min-w-0">
          <SpecLabel>
            Member since {member.memberSince}
            {member.disciplines.length ? ` · ${member.disciplines.join(" · ")}` : ""}
          </SpecLabel>
          <h1 className="mt-1.5 font-display text-display-lg text-ink">{member.name}</h1>
          <p className="mt-2.5 font-mono text-label uppercase text-slip">
            {pieces.length} {pieces.length === 1 ? "piece" : "pieces"}
            {mostUsed ? <> · Most used — {mostUsed.name}</> : null}
          </p>
        </div>
      </div>

      {reaches.length > 0 && (
        <section className="mt-11">
          <h2 className="font-mono text-label font-medium uppercase text-terracotta">
            Glazes they reach for
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {reaches.map((g) => (
              <Link
                key={g.id}
                href={`/glazes/${g.slug}`}
                data-cursor="link"
                data-glaze={g.baseHex}
                className="inline-flex items-center gap-2 rounded-pill border border-line bg-bone py-1.5 pl-1.5 pr-3 text-sm font-medium text-ink transition-colors hover:border-slip"
              >
                <span className="h-6 w-6 rounded-full" style={{ background: swatchBg(g) }} aria-hidden />
                {g.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-11">
        <h2 className="font-mono text-label font-medium uppercase text-terracotta">
          Their pieces
        </h2>
        {pieces.length ? (
          <div className="mt-5 columns-2 gap-4 lg:columns-3">
            {pieces.map((p, i) => (
              <PotteryCard
                key={p.id}
                piece={p}
                className="mb-4 break-inside-avoid"
                aspect={i % 2 === 0 ? "aspect-[3/4]" : "aspect-[4/5]"}
              />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slip">No pieces logged yet.</p>
        )}
      </section>
    </Container>
  );
}
