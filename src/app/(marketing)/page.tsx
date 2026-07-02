import Link from "next/link";
import { getPieces, getGlazesWithCounts, getMembers } from "@/lib/db";
import { ButtonLink } from "@/components/ui/Button";
import { SpecLabel } from "@/components/ui/Spec";
import { PotteryCard } from "@/components/PotteryCard";
import { LandingHero } from "@/components/landing/LandingHero";
import { TestTileBoard } from "@/components/landing/TestTileBoard";
import { Reveal } from "@/components/motion/Reveal";
import { HeadlineReveal } from "@/components/motion/HeadlineReveal";
import { SpecStrip } from "@/components/motion/SpecStrip";
import { Magnetic } from "@/components/motion/Magnetic";

const STEPS = [
  { n: "01", color: "text-celadon", title: "Shoot it", body: "Snap the piece straight off the kiln shelf — one hand, one tap. Add a few angles if you like." },
  { n: "02", color: "text-terracotta", title: "Log the glaze", body: "Start typing and the studio's glazes surface instantly. Tap to add — layer as many as you dipped." },
  { n: "03", color: "text-cobalt", title: "It's remembered", body: "It joins a gallery the whole studio can search — by color, recipe, maker, and combination." },
];

/** Landing — "The Kiln Catalog": molten hero + editorial studio record. */
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

  return (
    <>
      <LandingHero stats={stats} />

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="overflow-hidden bg-bone">
        <SpecStrip text="Cone 6 — Δ6 · 2232°F — Oxidation" className="text-clay-deep" />
        <Reveal className="mx-auto w-full max-w-[1180px] px-5 pb-20 pt-4 sm:px-10 sm:pb-28">
          <SpecLabel>Three taps at the shelf</SpecLabel>
          <HeadlineReveal className="mt-3 max-w-[16ch] font-display text-display-lg text-ink">
            The kiln forgets. We don&rsquo;t.
          </HeadlineReveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="relative rounded-card border border-line bg-paper p-6 pt-12"
              >
                <div
                  aria-hidden
                  className={`text-outline pointer-events-none absolute -top-7 left-4 font-display text-[88px] leading-none ${s.color}`}
                >
                  {s.n}
                </div>
                <h3 className="mt-3 text-xl font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{s.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------- RECENT PIECES ---------- */}
      {pieces.length > 0 && (
        <section className="overflow-hidden bg-clay">
          <SpecStrip text="Fresh from the kiln — Δ6 — 2232°F" className="text-stoneware" />
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
      <section className="overflow-hidden bg-bone py-20 sm:py-28">
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
