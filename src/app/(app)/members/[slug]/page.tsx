import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MEMBERS, getMemberBySlug, piecesByMaker } from "@/lib/data";
import { getGlazes, swatchFill } from "@/lib/glazes";
import { Avatar } from "@/components/ui/Avatar";
import { PotteryCard } from "@/components/PotteryCard";

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = getMemberBySlug(slug);
  return member ? { title: member.name } : { title: "Member not found" };
}

export default async function MemberProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = getMemberBySlug(slug);
  if (!member) notFound();

  const pieces = piecesByMaker(member.id);
  // Distinct glazes they reach for, by frequency.
  const glazeCounts = new Map<string, number>();
  for (const p of pieces)
    for (const gid of p.glazeIds)
      glazeCounts.set(gid, (glazeCounts.get(gid) ?? 0) + 1);
  const reaches = getGlazes(
    [...glazeCounts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id),
  );

  const stats = [
    { n: pieces.length, label: "pieces" },
    { n: reaches.length, label: "glazes" },
    { n: member.memberSince, label: "since" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-10">
      <div className="flex items-center gap-4">
        <Avatar member={member} size={72} />
        <div>
          <h1 className="font-display text-3xl text-ink">{member.name}</h1>
          <p className="text-sm text-slip">
            Member since {member.memberSince} · {member.disciplines.join(" · ")}
          </p>
        </div>
      </div>

      <dl className="mt-6 flex gap-8">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="text-xs uppercase tracking-wider text-slip">{s.label}</dt>
            <dd className="font-display text-2xl text-ink">{s.n}</dd>
          </div>
        ))}
      </dl>

      {reaches.length > 0 && (
        <section className="mt-9">
          <h2 className="font-display text-2xl text-ink">Glazes they reach for</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {reaches.map((g) => (
              <Link
                key={g.id}
                href={`/glazes/${g.slug}`}
                className="inline-flex items-center gap-2 rounded-pill border border-line bg-bone py-1.5 pl-1.5 pr-3 text-sm font-medium text-ink transition-colors hover:border-slip"
              >
                <span
                  className="h-6 w-6 rounded-full"
                  style={{ background: swatchFill(g) }}
                  aria-hidden
                />
                {g.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-9">
        <h2 className="font-display text-2xl text-ink">Their pieces</h2>
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
      </section>
    </div>
  );
}
