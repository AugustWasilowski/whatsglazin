import Link from "next/link";
import { GLAZES, getGlazes, pieceFill } from "@/lib/glazes";
import { PIECES, MEMBERS } from "@/lib/data";
import { ButtonLink } from "@/components/ui/Button";
import { PotteryCard } from "@/components/PotteryCard";
import { GlazeTile } from "@/components/GlazeTile";

const STATS = [
  { n: PIECES.length, label: "pieces" },
  { n: MEMBERS.length, label: "members" },
  { n: GLAZES.length, label: "glazes" },
];

const STEPS = [
  { n: "01", color: "text-celadon", title: "Shoot it", body: "Snap the piece straight off the kiln shelf — one hand, one tap. Add a few angles if you like." },
  { n: "02", color: "text-terracotta", title: "Log the glaze", body: "Start typing and the studio's glazes surface instantly. Tap to add — layer as many as you dipped." },
  { n: "03", color: "text-cobalt", title: "It's remembered", body: "It joins a gallery the whole studio can search — by colour, recipe, maker, and combination." },
];

/** Landing — "1c: Living gallery wall". Static structure; GSAP motion lands in Phase 6. */
export default function Landing() {
  // Build a dense wall from the seed pieces (repeated to fill the grid).
  const wall = Array.from({ length: 24 }, (_, i) => PIECES[i % PIECES.length]);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden">
        {/* masonry wall */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 columns-3 gap-3 p-3 sm:columns-4 lg:columns-6"
        >
          {wall.map((p, i) => (
            <div
              key={i}
              className="mb-3 w-full break-inside-avoid rounded-md"
              style={{
                background: pieceFill(getGlazes(p.glazeIds)),
                aspectRatio: i % 3 === 0 ? "3 / 4" : i % 3 === 1 ? "1 / 1" : "4 / 5",
              }}
            />
          ))}
        </div>
        {/* warm scrim for legibility */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(241,231,214,0.97) 30%, rgba(241,231,214,0.72) 48%, rgba(241,231,214,0.12) 68%, transparent)",
          }}
        />

        <div className="relative mx-auto w-full max-w-[1180px] px-6 py-24 sm:px-10 sm:py-32">
          <div className="max-w-[640px]">
            <p className="mb-5 font-sans text-[12px] font-medium uppercase tracking-[0.22em] text-terracotta">
              The Fine Line · Portland, OR
            </p>
            <h1 className="font-display text-[15vw] leading-[0.92] tracking-[-0.02em] text-ink sm:text-[84px]">
              A wall of<br />what<br />we made.
            </h1>
            <p className="mt-6 max-w-[520px] text-lg leading-relaxed text-ink-3">
              Snap a piece straight off the kiln shelf, log the glaze in three
              taps, and it joins a gallery the whole studio can search — by
              colour, recipe, and maker.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/add" size="lg">Add your piece</ButtonLink>
              <ButtonLink href="/gallery" variant="secondary" size="lg">
                Browse the gallery
              </ButtonLink>
            </div>
            <dl className="mt-10 flex gap-8">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-3xl text-ink">
                    {s.n}
                    <span className="ml-1.5 align-middle text-sm font-sans font-medium text-slip">
                      {s.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="bg-bone">
        <div className="mx-auto w-full max-w-[1180px] px-6 py-16 sm:px-10 sm:py-20">
          <p className="font-sans text-[12px] font-medium uppercase tracking-[0.2em] text-terracotta">
            Three taps at the shelf
          </p>
          <h2 className="mt-2 max-w-[16ch] font-display text-4xl text-ink sm:text-5xl">
            The kiln forgets. We don&rsquo;t.
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-card border border-line bg-paper p-6">
                <div className={`font-display text-4xl ${s.color}`}>{s.n}</div>
                <h3 className="mt-3 text-xl font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- RECENT PIECES ---------- */}
      <section className="bg-clay">
        <div className="mx-auto w-full max-w-[1180px] px-6 py-16 sm:px-10 sm:py-20">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl text-ink sm:text-4xl">Recent pieces</h2>
            <Link href="/gallery" className="text-sm font-semibold text-celadon hover:text-ink">
              See all {PIECES.length} →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {PIECES.slice(0, 4).map((p, i) => (
              <PotteryCard key={p.id} piece={p} priority={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- GLAZE PEEK ---------- */}
      <section className="bg-bone">
        <div className="mx-auto w-full max-w-[1180px] px-6 py-16 sm:px-10 sm:py-20">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl text-ink sm:text-4xl">The glaze library</h2>
            <Link href="/glazes" className="text-sm font-semibold text-celadon hover:text-ink">
              Explore all {GLAZES.length} →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-6">
            {GLAZES.slice(0, 6).map((g) => (
              <GlazeTile key={g.id} glaze={g} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="bg-kiln text-bone">
        <div className="mx-auto w-full max-w-[1180px] px-6 py-20 text-center sm:px-10 sm:py-28">
          <h2 className="font-display text-4xl leading-tight sm:text-[56px]">
            Made something?<br />
            <span className="text-terracotta-soft">Add it to the wall.</span>
          </h2>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/auth" size="lg" className="rounded-pill px-8">
              Continue with Google · Apple · Email
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="bg-[#241A12] text-bone/70">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p className="font-display text-lg text-bone">
            What&rsquo;sGlazin<span className="text-terracotta">?</span>
          </p>
          <nav className="flex gap-6 text-sm">
            <Link href="/gallery" className="hover:text-bone">Gallery</Link>
            <Link href="/glazes" className="hover:text-bone">Glazes</Link>
            <Link href="/members" className="hover:text-bone">Members</Link>
            <Link href="/auth" className="hover:text-bone">Sign in</Link>
          </nav>
          <p className="text-xs text-bone/50">
            whatsglazin.com · The Fine Line, est. 2014
          </p>
        </div>
      </footer>
    </>
  );
}
