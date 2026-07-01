"use client";

import { useMemo, useState } from "react";
import { GlazeTile } from "@/components/GlazeTile";
import type { GlazeWithCount } from "@/lib/types";

/** Glaze library — searchable grid of the studio's glaze tiles. */
export function GlazeLibrary({ glazes }: { glazes: GlazeWithCount[] }) {
  const [query, setQuery] = useState("");

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

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-10">
      <h1 className="font-display text-4xl text-ink sm:text-5xl">Glaze library</h1>
      <div className="mt-6">
        <label htmlFor="glaze-search" className="sr-only">
          Search the studio glazes
        </label>
        <input
          id="glaze-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${glazes.length} studio glazes…`}
          className="h-12 w-full rounded-md border-[1.5px] border-line-strong bg-bone px-4 text-[15px] text-ink placeholder:text-slip focus:border-terracotta focus:outline-none focus:ring-[3px] focus:ring-terracotta/15"
        />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {results.map((g) => (
          <GlazeTile key={g.id} glaze={g} count={g.pieceCount} swatchClassName="aspect-[4/3]" />
        ))}
      </div>
    </div>
  );
}
