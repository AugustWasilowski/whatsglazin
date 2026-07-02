import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getGlazeBySlug, getPieces, coOccurring } from "@/lib/db";
import { swatchBg } from "@/lib/glazes";
import { PotteryCard } from "@/components/PotteryCard";
import { BackButton } from "@/components/ui/BackButton";
import { Container } from "@/components/ui/Container";
import { SpecTable } from "@/components/ui/Spec";
import { SpecimenHero } from "@/components/glazes/SpecimenHero";
import { SpecStrip } from "@/components/motion/SpecStrip";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const glaze = await getGlazeBySlug(slug);
  if (!glaze) return { title: "Glaze not found" };
  return { title: glaze.name, description: glaze.description };
}

export default async function GlazeDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const glaze = await getGlazeBySlug(slug);
  if (!glaze) notFound();

  const allPieces = await getPieces();
  const pieces = allPieces.filter((p) => p.glazeIds.includes(glaze.id));
  const combos = coOccurring(glaze.id, allPieces);

  const specRows = [
    { label: "Family", value: glaze.family },
    { label: "Finish", value: glaze.finish },
    { label: "Cone", value: `Δ${glaze.cone}` },
    { label: "Chemistry", value: glaze.chemistry },
    { label: "Atmosphere", value: "Oxidation" },
  ];

  return (
    <div>
      {/* ---- Specimen plate ---- */}
      <header>
        <Container className="pt-5">
          <BackButton fallback="/glazes" />
          <div className="relative mt-4" data-glaze={glaze.baseHex}>
            <SpecimenHero
              glaze={glaze}
              className="rounded-arch h-[46vh] max-h-[560px] min-h-[320px] w-full shadow-[var(--shadow-deep)] max-sm:rounded-card!"
            />
            <p
              className="pointer-events-none absolute left-1/2 top-7 -translate-x-1/2 whitespace-nowrap font-mono text-label font-medium uppercase"
              style={{ color: glaze.onColor }}
            >
              {glaze.finish} · Δ{glaze.cone}
            </p>
          </div>
          <h1 className="relative z-10 -mt-7 font-display text-display-xl text-ink sm:-mt-10">
            {glaze.name}
          </h1>
        </Container>
      </header>

      <Container className="pt-8">
        {/* ---- Lede + spec card ---- */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
          {glaze.description && (
            <p className="max-w-[46ch] font-display text-xl leading-relaxed text-ink-2 first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-terracotta sm:text-2xl">
              {glaze.description}
            </p>
          )}
          <SpecTable rows={specRows} className="h-fit shadow-[var(--shadow-card)]" />
        </div>

        {/* ---- Often combined with: mini test tiles ---- */}
        {combos.length > 0 && (
          <section className="mt-14">
            <h2 className="font-mono text-label font-medium uppercase text-terracotta">
              Often combined with
            </h2>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-6">
              {combos.map(({ glaze: g, count }) => (
                <Link
                  key={g.id}
                  href={`/glazes/${g.slug}`}
                  data-cursor="link"
                  data-glaze={g.baseHex}
                  className="group w-[92px] text-center"
                >
                  <span
                    className="rounded-arch block aspect-[3/4] w-full shadow-[var(--shadow-card),var(--shadow-pool)] transition-transform duration-300 group-hover:-translate-y-1"
                    style={{ background: swatchBg(g) }}
                    aria-hidden
                  />
                  <span className="mt-2 block text-sm font-medium leading-tight text-ink transition-colors group-hover:text-terracotta">
                    {g.name}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wider text-slip">
                    ×{count}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </Container>

      {/* ---- Chemistry as ornament ---- */}
      <SpecStrip
        text={`${glaze.chemistry} — Δ${glaze.cone} — ${glaze.finish}`}
        className="mt-10 text-clay-deep"
      />

      {/* ---- Pieces fired in this glaze ---- */}
      <Container className="pb-10">
        <section className="mt-2">
          <h2 className="font-mono text-label font-medium uppercase text-terracotta">
            In the wild
          </h2>
          <p className="mt-2 font-display text-display-lg text-ink">
            {pieces.length} {pieces.length === 1 ? "piece" : "pieces"} in this glaze
          </p>
          <div className="mt-6 columns-2 gap-4 lg:columns-3">
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
      </Container>
    </div>
  );
}
