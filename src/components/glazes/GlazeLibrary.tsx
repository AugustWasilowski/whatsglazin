"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GlazeTile } from "@/components/GlazeTile";
import { HeadlineReveal } from "@/components/motion/HeadlineReveal";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { SpecLabel } from "@/components/ui/Spec";
import { canHover, shouldAnimate } from "@/lib/motion";
import type { GlazeWithCount, StudioRef } from "@/lib/types";

/** Glaze library — "The Board": searchable, grouped by studio library. */
export function GlazeLibrary({
  glazes,
  studios = [],
}: {
  glazes: GlazeWithCount[];
  studios?: StudioRef[];
}) {
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

  // Studio libraries first (in studio order), then personal glazes.
  const groups = useMemo(() => {
    const byStudio = new Map<string, GlazeWithCount[]>();
    const personal: GlazeWithCount[] = [];
    for (const g of results) {
      if (g.studioId) {
        const list = byStudio.get(g.studioId) ?? [];
        list.push(g);
        byStudio.set(g.studioId, list);
      } else {
        personal.push(g);
      }
    }
    const out: { key: string; title: string; glazes: GlazeWithCount[] }[] = [];
    for (const s of studios) {
      const list = byStudio.get(s.id);
      if (list?.length) out.push({ key: s.id, title: s.name, glazes: list });
      byStudio.delete(s.id);
    }
    // Glazes whose studio isn't in the (active) list still get shown.
    for (const [id, list] of byStudio) out.push({ key: id, title: "Studio", glazes: list });
    if (personal.length) out.push({ key: "personal", title: "Member glazes", glazes: personal });
    return out;
  }, [results, studios]);

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

  const showGroupHeadings = groups.length > 1 || studios.length > 1;

  return (
    <Container className="py-8">
      <SpecLabel>{glazes.length} glazes · every studio · every kiln</SpecLabel>
      <HeadlineReveal as="h1" className="mt-1 font-display text-display-xl text-ink">
        Glaze library
      </HeadlineReveal>
      <div className="mt-6">
        <label htmlFor="glaze-search" className="sr-only">
          Search the glazes
        </label>
        <Input
          id="glaze-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${glazes.length} glazes…`}
        />
      </div>

      <div ref={boardRef}>
        {groups.length ? (
          groups.map((group) => (
            <section key={group.key} className="mt-10">
              {showGroupHeadings && (
                <h2 className="font-mono text-label font-medium uppercase text-terracotta">
                  {group.title}
                  <span className="ml-2 text-slip">×{group.glazes.length}</span>
                </h2>
              )}
              <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {group.glazes.map((g) => (
                  <GlazeTile
                    key={g.id}
                    glaze={g}
                    count={g.pieceCount}
                    swatchClassName="aspect-[4/3]"
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <EmptyState className="mt-8" title={glazes.length ? "No glazes match" : "No glazes yet"}>
            {glazes.length
              ? "Try a different name, family, or finish."
              : "Glazes appear here as members log the ones they use."}
          </EmptyState>
        )}
      </div>
    </Container>
  );
}
