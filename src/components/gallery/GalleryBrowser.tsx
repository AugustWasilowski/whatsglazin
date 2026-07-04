"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, Flip, registerGsap, shouldAnimate } from "@/lib/motion";
import { HeadlineReveal } from "@/components/motion/HeadlineReveal";
import { PotteryCard } from "@/components/PotteryCard";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { SpecLabel } from "@/components/ui/Spec";
import { swatchBg } from "@/lib/glazes";
import { cn } from "@/lib/utils";
import type { EnrichedPiece, Glaze, StudioRef } from "@/lib/types";

type SearchItem = { piece: EnrichedPiece; title: string; maker: string; glazes: string };

/** Gallery browser — fuzzy search + studio context chips + single-glaze filter
 *  chips over a masonry, with a GSAP Flip reflow when the result set changes.
 *  The eyebrow/heading are overridable so /search can reuse this. */
export function GalleryBrowser({
  pieces,
  glazes,
  studios = [],
  initialStudioId = null,
  eyebrow = "What's glazin",
  heading = "Gallery",
  autoFocus = false,
}: {
  pieces: EnrichedPiece[];
  glazes: Glaze[];
  /** Studios with work on the wall — renders the context chip row when >1. */
  studios?: StudioRef[];
  /** Default studio context (the viewer's home studio), null = all studios. */
  initialStudioId?: string | null;
  eyebrow?: string;
  heading?: string;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filterGlaze, setFilterGlaze] = useState<string | null>(null);
  // Studio context is a view scope, not a "filter" — Clear filters leaves it.
  const [filterStudio, setFilterStudio] = useState<string | null>(
    initialStudioId && studios.some((s) => s.id === initialStudioId) ? initialStudioId : null,
  );

  const gridRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const entranceDone = useRef(false);
  const driftCleanup = useRef<(() => void) | null>(null);

  const glazeById = useMemo(() => new Map(glazes.map((g) => [g.id, g])), [glazes]);

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
        maker: piece.maker?.name ?? "",
        glazes: piece.glazes.map((g) => g.name).join(" "),
      })),
    [pieces],
  );

  const fuse = useMemo(
    () => new Fuse(items, { keys: ["title", "maker", "glazes"], threshold: 0.38, ignoreLocation: true }),
    [items],
  );

  const results = useMemo(() => {
    let base = query.trim() ? fuse.search(query.trim()).map((r) => r.item.piece) : pieces;
    if (filterStudio) base = base.filter((p) => p.studioId === filterStudio);
    if (filterGlaze) base = base.filter((p) => p.glazeIds.includes(filterGlaze));
    return base;
  }, [query, filterGlaze, filterStudio, fuse, pieces]);

  const isFiltering = query.trim() !== "" || filterGlaze !== null;

  useGSAP(
    () => {
      const el = gridRef.current;
      if (!el || !shouldAnimate()) return;
      registerGsap();

      // Retire any column drift before reflowing so it never fights Flip.
      driftCleanup.current?.();
      driftCleanup.current = null;

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

      // Subtle scroll drift for the desktop masonry — only on the full,
      // unfiltered wall so it never fights the Flip reflow. The grid is
      // CSS-columns (columns aren't real DOM), so drift individual cards
      // by index instead. Created after the entrance settles, torn down via
      // driftCleanup (useGSAP with deps only reverts its context on unmount).
      if (!isFiltering) {
        const mm = gsap.matchMedia();
        mm.add("(min-width: 1024px) and (hover: hover) and (pointer: fine)", () => {
          const drifts: gsap.core.Tween[] = [];
          const delayed = gsap.delayedCall(0.75, () => {
            el.querySelectorAll<HTMLElement>("[data-flip-id]").forEach((card, index) => {
              const lane = index % 4;
              if (lane === 0) return;
              drifts.push(
                gsap.fromTo(
                  card,
                  { y: 0 },
                  {
                    y: lane === 2 ? 20 : -28,
                    ease: "none",
                    scrollTrigger: {
                      trigger: el,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: 0.8,
                    },
                  },
                ),
              );
            });
          });
          return () => {
            delayed.kill();
            drifts.forEach((t) => {
              t.scrollTrigger?.kill();
              t.kill();
            });
            if (el.isConnected) {
              gsap.set(el.querySelectorAll("[data-flip-id]"), { clearProps: "transform" });
            }
          };
        });
        driftCleanup.current = () => mm.revert();
      }
    },
    { dependencies: [results], scope: gridRef },
  );

  // Kill drift triggers on unmount (the useGSAP context only records tweens
  // created synchronously — the drift is built in a delayed call).
  useEffect(
    () => () => {
      driftCleanup.current?.();
      driftCleanup.current = null;
    },
    [],
  );

  const activeGlaze = filterGlaze ? glazeById.get(filterGlaze) : null;

  return (
    <Container className="py-8">
      <SpecLabel>{eyebrow}</SpecLabel>
      <HeadlineReveal as="h1" className="mt-1 font-display text-display-xl text-ink">
        {heading}
      </HeadlineReveal>

      <div className="mt-6">
        <label htmlFor="gallery-search" className="sr-only">
          Search glaze, maker, or piece
        </label>
        <Input
          id="gallery-search"
          type="search"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            captureFlip();
            setQuery(e.target.value);
          }}
          placeholder="Search glaze, maker, piece…"
        />
      </div>

      {/* Studio context — which corner of the wall you're looking at. */}
      {studios.length > 1 && (
        <div className="mt-5 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[{ id: null as string | null, name: "All studios" }, ...studios].map((s) => {
            const active = filterStudio === s.id;
            return (
              <button
                key={s.id ?? "all"}
                type="button"
                onClick={() => {
                  captureFlip();
                  setFilterStudio(s.id);
                }}
                aria-pressed={active}
                className={cn(
                  "inline-flex shrink-0 items-center rounded-pill border px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wider transition-colors",
                  active
                    ? "border-transparent bg-ink text-bone"
                    : "border-line-strong bg-bone text-ink-2 hover:border-slip",
                )}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {glazes.map((g) => {
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
              data-glaze={g.baseHex}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-pill border px-3 py-1.5 text-[13px] font-medium transition-colors",
                active
                  ? "border-transparent shadow-[var(--shadow-pool)]"
                  : "border-line-strong bg-bone text-ink-2 hover:border-slip",
              )}
              style={active ? { background: swatchBg(g), color: g.onColor } : undefined}
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
        <span className="font-mono text-label uppercase text-slip">
          {isFiltering
            ? `${results.length} ${results.length === 1 ? "result" : "results"}${activeGlaze ? ` in ${activeGlaze.name}` : ""}`
            : `${results.length} ${results.length === 1 ? "piece" : "pieces"} on the wall`}
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
                showStudio={studios.length > 1 && !filterStudio}
              />
            </div>
          ))}
        </div>
      ) : isFiltering ? (
        <EmptyState className="mt-12" title="Nothing matches yet">
          Try a different glaze, maker, or search term.
        </EmptyState>
      ) : (
        <EmptyState className="mt-12" title="No pieces yet">
          The gallery fills up as members log their work.{" "}
          <Link href="/add" className="font-medium text-terracotta hover:text-terracotta-hover">
            Add the first piece
          </Link>
          .
        </EmptyState>
      )}
    </Container>
  );
}
