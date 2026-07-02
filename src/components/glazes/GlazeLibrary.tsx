"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GlazeTile } from "@/components/GlazeTile";
import { HeadlineReveal } from "@/components/motion/HeadlineReveal";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { SpecLabel } from "@/components/ui/Spec";
import { canHover, shouldAnimate } from "@/lib/motion";
import type { GlazeWithCount } from "@/lib/types";

/** Glaze library — "The Board": searchable grid of the studio's glaze tiles. */
export function GlazeLibrary({ glazes }: { glazes: GlazeWithCount[] }) {
  const [query, setQuery] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return glazes;
    return glazes.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.family.toLowerCase().includes(q) ||
        g.finish.toLowerCase().includes(q),
    );
  }, [query, glazes]);

  // One delegated pointermove drives every tile's specular highlight: set the
  // --mx/--my vars on whichever swatch the cursor is over. Hover-only, cheap.
  useEffect(() => {
    const board = boardRef.current;
    if (!board || !canHover() || !shouldAnimate()) return;
    const onMove = (e: PointerEvent) => {
      const swatch = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-swatch]");
      if (!swatch) return;
      const r = swatch.getBoundingClientRect();
      swatch.style.setProperty("--mx", `${e.clientX - r.left}px`);
      swatch.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    board.addEventListener("pointermove", onMove);
    return () => board.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <Container className="py-8">
      <SpecLabel>{glazes.length} Studio Glazes · Cone 6 · Oxidation</SpecLabel>
      <HeadlineReveal as="h1" className="mt-1 font-display text-display-xl text-ink">
        Glaze library
      </HeadlineReveal>
      <div className="mt-6">
        <label htmlFor="glaze-search" className="sr-only">
          Search the studio glazes
        </label>
        <Input
          id="glaze-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${glazes.length} studio glazes…`}
        />
      </div>

      <div ref={boardRef}>
        {results.length ? (
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((g) => (
              <GlazeTile key={g.id} glaze={g} count={g.pieceCount} swatchClassName="aspect-[4/3]" />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-8"
            title={glazes.length ? "No glazes match" : "No glazes yet"}
          >
            {glazes.length
              ? "Try a different name, family, or finish."
              : "Glazes appear here as members log the ones they use."}
          </EmptyState>
        )}
      </div>
    </Container>
  );
}
