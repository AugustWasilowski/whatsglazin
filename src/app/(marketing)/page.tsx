import Link from "next/link";
import { getPieces, getGlazesWithCounts, getMembers } from "@/lib/db";
import { ButtonLink } from "@/components/ui/Button";
import { SpecLabel } from "@/components/ui/Spec";
import { PotteryCard } from "@/components/PotteryCard";
import { LandingHero, type FeaturedPiece } from "@/components/landing/LandingHero";
import { TestTileBoard } from "@/components/landing/TestTileBoard";
import { Reveal } from "@/components/motion/Reveal";
import { HeadlineReveal } from "@/components/motion/HeadlineReveal";
import { SpecStrip } from "@/components/motion/SpecStrip";
import { Magnetic } from "@/components/motion/Magnetic";

/** Landing — "The Kiln Catalog": a random piece off the wall + the studio record. */
export default async function Landing() {
  const [pieces, glazes, members] = await Promise.all([
    getPieces(),
    getGlazesWithCounts(),
    getMembers(),
  ]);

  const stats = [
    { n: pieces.length, label: "pieces" },
    { n: members.length, label: "members" },
    { n: glazes.length, label: "glazes" },
  ];

  // A different piece from the wall on every load (page renders per request).
  const withPhotos = pieces.filter((p) => p.photos[0]?.url);
  const pick = withPhotos.length
    ? withPhotos[Math.floor(Math.random() * withPhotos.length)]
    : null;
  const featured: FeaturedPiece | null = pick
    ? {
        slug: pick.slug,
        url: pick.photos[0]!.url as string,
        alt: pick.title ?? pick.form,
        label: `${pick.glazes.map((g) => g.name).join(" / ") || pick.form} · by ${
          pick.maker?.name ?? "a member"
        }`,
      }
    : null;

  return (
    <>
      <LandingHero stats={stats} featured={featured} />

      {/* ---------- RECENT PIECES ---------- */}
      {pieces.length > 0 && (
        <section className="overflow-hidden bg-bone">
          <SpecStrip text="Fresh from the kiln — Δ6 — 2232°F" className="text-clay-deep" />
          <div className="mx-auto w-full max-w-[1180px] px-5 pb-20 pt-4 sm:px-10 sm:pb-28">
            <div className="flex items-end justify-between">
              <div>
                <SpecLabel>The latest unload</SpecLabel>
                <HeadlineReveal className="mt-3 font-display text-display-lg text-ink">
                  Recent pieces
                </HeadlineReveal>
              </div>
              <Link
                href="/gallery"
                data-cursor="link"
                className="mb-1 shrink-0 font-mono text-label uppercase text-celadon hover:text-ink"
              >
                See all {pieces.length} →
              </Link>
            </div>
            <Reveal className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4" stagger={0.06}>
              {pieces.slice(0, 4).map((p, i) => (
                <PotteryCard key={p.id} piece={p} priority={i === 0} />
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------- THE TEST TILE BOARD ---------- */}
      <section className="overflow-hidden bg-clay py-20 sm:py-28">
        <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-10">
          <div className="flex items-end justify-between">
            <div>
              <SpecLabel>{glazes.length} studio glazes · Cone 6 · Oxidation</SpecLabel>
              <HeadlineReveal className="mt-3 font-display text-display-lg text-ink">
                The test tile board
              </HeadlineReveal>
            </div>
            <Link
              href="/glazes"
              data-cursor="link"
              className="mb-1 shrink-0 font-mono text-label uppercase text-celadon hover:text-ink"
            >
              Explore all →
            </Link>
          </div>
        </div>
        <div className="mt-10">
          <TestTileBoard glazes={glazes} />
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="on-dark grain-strong overflow-hidden bg-kiln text-bone">
        <Reveal className="mx-auto w-full max-w-[1180px] px-5 py-24 text-center sm:px-10 sm:py-32">
          <SpecLabel className="text-ember">Members of The Fine Line</SpecLabel>
          <HeadlineReveal className="mt-4 font-display text-display-xl leading-tight">
            Made something?
            <span className="block text-ember">Add it to the wall.</span>
          </HeadlineReveal>
          <div className="mt-10 flex justify-center">
            <Magnetic>
              <ButtonLink
                href="/auth"
                variant="onDark"
                size="lg"
                className="rounded-pill px-8"
                data-cursor="link"
              >
                Continue with Google or Email
              </ButtonLink>
            </Magnetic>
          </div>
        </Reveal>
      </section>
    </>
  );
}
