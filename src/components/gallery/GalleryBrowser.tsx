"use client";

import { useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, Flip, registerGsap, shouldAnimate } from "@/lib/motion";
import { GLAZES, getGlazes, getGlaze } from "@/lib/glazes";
import { getMember } from "@/lib/data";
import { PotteryCard } from "@/components/PotteryCard";
import { cn } from "@/lib/utils";
import type { Piece } from "@/lib/types";

type SearchItem = { piece: Piece; title: string; maker: string; glazes: string };

/** Gallery browser — fuzzy search + single-glaze filter chips over a masonry,
 *  with a GSAP Flip reflow when the result set changes. */
export function GalleryBrowser({ pieces }: { pieces: Piece[] }) {
  const [query, setQuery] = useState("");
  const [filterGlaze, setFilterGlaze] = useState<string | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const entranceDone = useRef(false);

  // Capture positions before a state change so we can animate the reflow.
  function captureFlip() {
    const el = gridRef.current;
    if (!el || !shouldAnimate()) return;
    registerGsap();
    flipState.current = Flip.getState(el.querySelectorAll("[data-flip-id]"));
  }

  const items = useMemo<SearchItem[]>(
    () =>
      pieces.map((piece) => ({
        piece,
        title: piece.title ?? piece.form,
        maker: getMember(piece.makerId)?.name ?? "",
        glazes: getGlazes(piece.glazeIds).map((g) => g.name).join(" "),
      })),
    [pieces],
  );

  const fuse = useMemo(
    () => new Fuse(items, { keys: ["title", "maker", "glazes"], threshold: 0.38, ignoreLocation: true }),
    [items],
  );

  const results = useMemo(() => {
    let base = query.trim() ? fuse.search(query.trim()).map((r) => r.item.piece) : pieces;
    if (filterGlaze) base = base.filter((p) => p.glazeIds.includes(filterGlaze));
    return base;
  }, [query, filterGlaze, fuse, pieces]);

  // Reflow (Flip) on change, or a first-load stagger.
  useGSAP(
    () => {
      const el = gridRef.current;
      if (!el || !shouldAnimate()) return;
      registerGsap();
      if (flipState.current) {
        Flip.from(flipState.current, {
          duration: 0.5,
          ease: "power2.inOut",
          scale: true,
          absolute: true,
          onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4 }),
          onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.3 }),
        });
        flipState.current = null;
      } else if (!entranceDone.current) {
        entranceDone.current = true;
        gsap.from(el.querySelectorAll("[data-flip-id]"), {
          opacity: 0,
          y: 18,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.04,
        });
      }
    },
    { dependencies: [results], scope: gridRef },
  );

  const isFiltering = query.trim() !== "" || filterGlaze !== null;
  const activeGlaze = filterGlaze ? getGlaze(filterGlaze) : null;

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-10">
      <p className="font-sans text-[12px] font-medium uppercase tracking-[0.2em] text-terracotta">
        The Fine Line
      </p>
      <h1 className="mt-1 font-display text-4xl text-ink sm:text-5xl">Gallery</h1>

      <div className="mt-6">
        <label htmlFor="gallery-search" className="sr-only">
          Search glaze, maker, or piece
        </label>
        <input
          id="gallery-search"
          type="search"
          value={query}
          onChange={(e) => {
            captureFlip();
            setQuery(e.target.value);
          }}
          placeholder="Search glaze, maker, piece…"
          className="h-12 w-full rounded-md border-[1.5px] border-line-strong bg-bone px-4 text-[15px] text-ink placeholder:text-slip focus:border-terracotta focus:outline-none focus:ring-[3px] focus:ring-terracotta/15"
        />
      </div>

      <div className="mt-4 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {GLAZES.map((g) => {
          const active = filterGlaze === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                captureFlip();
                setFilterGlaze(active ? null : g.id);
              }}
              aria-pressed={active}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-pill border px-3 py-1.5 text-[13px] font-medium transition-colors",
                active ? "border-transparent" : "border-line-strong bg-bone text-ink-2 hover:border-slip",
              )}
              style={active ? { background: g.baseHex, color: g.onColor } : undefined}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: active ? g.onColor : g.baseHex }}
                aria-hidden
              />
              {g.name}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3 text-sm text-slip">
        <span>
          {results.length} {results.length === 1 ? "piece" : "pieces"}
          {activeGlaze && ` in ${activeGlaze.name}`}
        </span>
        {isFiltering && (
          <button
            type="button"
            onClick={() => {
              captureFlip();
              setQuery("");
              setFilterGlaze(null);
            }}
            className="inline-flex items-center gap-1 font-medium text-terracotta hover:text-terracotta-hover"
          >
            Clear filters <X size={14} />
          </button>
        )}
      </div>

      {results.length > 0 ? (
        <div ref={gridRef} className="mt-5 columns-2 gap-4 sm:columns-3 lg:columns-4">
          {results.map((p, i) => (
            <div key={p.id} data-flip-id={p.id} className="mb-4 break-inside-avoid">
              <PotteryCard
                piece={p}
                aspect={i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-card border border-dashed border-line-strong bg-bone/60 p-10 text-center">
          <p className="font-display text-2xl text-ink">Nothing matches yet</p>
          <p className="mt-1 text-sm text-slip">Try a different glaze, maker, or search term.</p>
        </div>
      )}
    </div>
  );
}
