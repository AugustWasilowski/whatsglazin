import Link from "next/link";
import { cn } from "@/lib/utils";
import { swatchFill } from "@/lib/glazes";
import { piecesWithGlaze } from "@/lib/data";
import type { Glaze } from "@/lib/types";

/**
 * Glaze tile — material swatch + finish label + name + family/count.
 * Hover sweeps a soft "material shimmer" across the swatch.
 */
export function GlazeTile({
  glaze,
  className,
  swatchClassName = "aspect-square",
}: {
  glaze: Glaze;
  className?: string;
  swatchClassName?: string;
}) {
  const count = piecesWithGlaze(glaze.id).length;

  return (
    <Link
      href={`/glazes/${glaze.slug}`}
      className={cn("group block", className)}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-card",
          swatchClassName,
        )}
        style={{ background: swatchFill(glaze) }}
      >
        <span
          className="absolute right-2.5 top-2.5 font-mono text-[10px] uppercase tracking-wider opacity-80"
          style={{ color: glaze.onColor }}
        >
          {glaze.finish}
        </span>
        {/* shimmer sweep on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full motion-reduce:hidden"
        />
      </div>
      <p className="mt-2 font-display text-lg leading-tight text-ink">
        {glaze.name}
      </p>
      <p className="text-xs text-slip">
        {glaze.family} · {count} {count === 1 ? "piece" : "pieces"}
      </p>
    </Link>
  );
}
