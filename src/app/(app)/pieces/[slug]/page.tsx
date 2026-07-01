import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PIECES, getPieceBySlug, getMember } from "@/lib/data";
import { getGlazes, pieceFill, swatchFill } from "@/lib/glazes";
import { BackButton } from "@/components/ui/BackButton";
import { timeAgo } from "@/lib/utils";

export function generateStaticParams() {
  return PIECES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const piece = getPieceBySlug(slug);
  if (!piece) return { title: "Piece not found" };
  const maker = getMember(piece.makerId);
  return {
    title: piece.title ?? piece.form,
    description: `A ${piece.form.toLowerCase()} by ${maker?.name} at The Fine Line.`,
  };
}

export default async function PieceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const piece = getPieceBySlug(slug);
  if (!piece) notFound();

  const glazes = getGlazes(piece.glazeIds);
  const maker = getMember(piece.makerId);
  const primary = glazes[0];

  return (
    <div>
      {/* hero photo */}
      <div className="relative h-[340px] w-full" style={{ background: pieceFill(glazes) }}>
        <div className="absolute left-4 top-4">
          <BackButton />
        </div>
        <span className="absolute right-4 top-4 rounded-pill bg-ink/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-bone backdrop-blur-sm">
          Photo 1 / {piece.photos.length} · {piece.form}
        </span>
        {/* angle thumbnails */}
        {piece.photos.length > 1 && (
          <div className="absolute bottom-4 left-4 flex gap-2">
            {piece.photos.map((_, i) => (
              <span
                key={i}
                className={`h-11 w-11 rounded-md border-2 ${i === 0 ? "border-bone" : "border-bone/40"}`}
                style={{ background: pieceFill(glazes) }}
                aria-hidden
              />
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-[760px] px-5 py-7 sm:px-8">
        <h1 className="font-display text-3xl text-ink">{piece.title ?? piece.form}</h1>
        <p className="mt-1 text-sm text-slip">
          {piece.form} ·{" "}
          <Link href={`/members/${maker?.slug}`} className="text-ink-2 hover:text-ink">
            by {maker?.name}
          </Link>{" "}
          · {timeAgo(piece.createdAt)} ago
        </p>

        {/* glazes used */}
        <section className="mt-7">
          <h2 className="font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-slip">
            Glazes used · tap to explore
          </h2>
          <ul className="mt-3 divide-y divide-line rounded-card border border-line bg-bone">
            {glazes.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/glazes/${g.slug}`}
                  className="flex items-center gap-3 p-3 transition-colors hover:bg-clay/50"
                >
                  <span
                    className="h-11 w-11 shrink-0 rounded-md"
                    style={{ background: swatchFill(g) }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{g.name}</span>
                    <span className="block text-xs text-slip">
                      {g.family} · {g.finish}
                    </span>
                  </span>
                  <ChevronRight size={18} className="text-slip" />
                </Link>
              </li>
            ))}
          </ul>
          {glazes.length > 1 && (
            <p className="mt-2 text-xs text-slip">Order is kept — first glaze down, last on top.</p>
          )}
        </section>

        {/* firing & notes */}
        {(piece.firing?.length || piece.notes || piece.clayBody) && (
          <section className="mt-7 rounded-card border border-line bg-paper p-5">
            <h2 className="font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-slip">
              Firing &amp; notes
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {piece.clayBody && (
                <span className="rounded-pill border border-line-strong bg-bone px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-2">
                  {piece.clayBody}
                </span>
              )}
              {piece.firing?.map((f) => (
                <span
                  key={f}
                  className="rounded-pill border border-line-strong bg-bone px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-2"
                >
                  {f}
                </span>
              ))}
            </div>
            {piece.notes && (
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{piece.notes}</p>
            )}
          </section>
        )}

        {primary && (
          <Link
            href={`/glazes/${primary.slug}`}
            className="mt-7 inline-flex items-center gap-1 text-sm font-semibold text-celadon hover:text-ink"
          >
            See more in {primary.name} <ChevronRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
