import { GLAZES, pieceFill, getGlazes } from "@/lib/glazes";
import { PIECES, getMember } from "@/lib/data";
import { Swatch } from "@/components/ui/Swatch";
import { Button, ButtonLink } from "@/components/ui/Button";

/**
 * Phase 0 smoke test / design-system preview.
 * Verifies fonts, tokens, and seed data render before real screens land.
 * This page is replaced by the Living Gallery Wall landing in Phase 4.
 */
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-6 py-16 sm:px-10">
      <p className="mb-5 font-sans text-[12px] font-medium uppercase tracking-[0.22em] text-terracotta">
        The Fine Line · Pottery Studio · Est. 2014
      </p>
      <h1 className="font-display text-[13vw] leading-[0.9] tracking-[-0.02em] text-ink sm:text-[104px]">
        What&rsquo;s<br />
        Glazin<span className="text-terracotta">?</span>
      </h1>
      <p className="mt-6 max-w-[620px] text-lg leading-relaxed text-ink-3">
        Pull a piece from the kiln, snap it, and log the glaze in three taps.
        WhatsGlazin turns every firing into a living gallery — and a glaze
        library the whole studio can search.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button size="lg">Add your piece</Button>
        <ButtonLink href="#" variant="secondary" size="lg">
          Browse the gallery
        </ButtonLink>
      </div>

      {/* --- Token check: type + color --- */}
      <section className="mt-20">
        <h2 className="font-display text-2xl text-ink">Foundation check</h2>
        <p className="mt-1 text-sm text-slip">
          Fonts, palette, and seed data — Phase 0.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {(
            [
              ["bg-bone", "bone"],
              ["bg-paper", "paper"],
              ["bg-clay", "clay"],
              ["bg-clay-deep", "clay-deep"],
              ["bg-stoneware", "stoneware"],
              ["bg-terracotta text-on-terracotta", "terracotta"],
              ["bg-celadon text-bone", "celadon"],
              ["bg-cobalt text-bone", "cobalt"],
              ["bg-ink text-bone", "ink"],
              ["bg-kiln text-bone", "kiln"],
              ["bg-success-bg text-success", "success"],
              ["bg-error-bg text-error", "error"],
            ] as const
          ).map(([cls, label]) => (
            <div
              key={label}
              className={`flex h-16 items-end rounded-md border border-line p-2 text-xs font-medium ${cls}`}
            >
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* --- Glaze swatches --- */}
      <section className="mt-16">
        <h2 className="font-display text-2xl text-ink">The 10 studio glazes</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {GLAZES.map((g) => (
            <div key={g.id}>
              <Swatch glaze={g} showFinish className="aspect-square w-full" />
              <p className="mt-2 font-display text-lg text-ink">{g.name}</p>
              <p className="text-xs text-slip">{g.family}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Piece cards (placeholder fills) --- */}
      <section className="mt-16">
        <h2 className="font-display text-2xl text-ink">Recent pieces</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PIECES.slice(0, 4).map((p) => {
            const glazes = getGlazes(p.glazeIds);
            const maker = getMember(p.makerId);
            return (
              <article
                key={p.id}
                className="overflow-hidden rounded-card border border-line-2 bg-bone shadow-[var(--shadow-card)]"
              >
                <div
                  className="relative aspect-[4/5] w-full"
                  style={{ background: pieceFill(glazes) }}
                >
                  {glazes.length > 1 && (
                    <span className="absolute right-2 top-2 rounded-pill bg-ink/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-bone">
                      Combo
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-ink">{p.title}</p>
                  <p className="text-xs text-slip">by {maker?.name}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
