import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GLAZES, getGlazeBySlug, swatchFill } from "@/lib/glazes";
import { piecesWithGlaze } from "@/lib/data";
import { coOccurringGlazes } from "@/lib/queries";
import { PotteryCard } from "@/components/PotteryCard";
import { BackButton } from "@/components/ui/BackButton";

export function generateStaticParams() {
  return GLAZES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const glaze = getGlazeBySlug(slug);
  if (!glaze) return { title: "Glaze not found" };
  return {
    title: glaze.name,
    description: glaze.description,
  };
}

export default async function GlazeDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const glaze = getGlazeBySlug(slug);
  if (!glaze) notFound();

  const pieces = piecesWithGlaze(glaze.id);
  const combos = coOccurringGlazes(glaze.id);
  const chips = [glaze.chemistry, glaze.finish, glaze.family];

  return (
    <div>
      {/* swatch header */}
      <header
        className="relative flex h-[220px] items-end"
        style={{ background: swatchFill(glaze) }}
      >
        <div className="absolute left-4 top-4">
          <BackButton fallback="/glazes" />
        </div>
        <div className="w-full p-6" style={{ color: glaze.onColor }}>
          <p className="font-mono text-[11px] uppercase tracking-wider opacity-80">
            {glaze.family} · {glaze.finish}
          </p>
          <h1 className="mt-1 font-display text-4xl leading-none">{glaze.name}</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-10">
        <p className="max-w-[70ch] text-[16px] leading-relaxed text-ink-2">
          {glaze.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-pill border border-line-strong bg-bone px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-2"
            >
              {c}
            </span>
          ))}
        </div>

        {/* common combinations */}
        {combos.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-2xl text-ink">Often combined with</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {combos.map(({ glaze: g, count }) => (
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
                  <span className="text-xs text-slip">×{count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* pieces */}
        <section className="mt-10">
          <h2 className="font-display text-2xl text-ink">
            {pieces.length} {pieces.length === 1 ? "piece" : "pieces"} in this glaze
          </h2>
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

        <Link
          href="/glazes"
          className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-celadon hover:text-ink"
        >
          All glazes <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
