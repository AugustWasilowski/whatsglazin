import Link from "next/link";
import { cn } from "@/lib/utils";
import { swatchBg } from "@/lib/glazes";
import type { Glaze } from "@/lib/types";

/**
 * Glaze tile — arched "test tile" swatch + finish label + name + family/count.
 * Hover lights a cursor-following specular highlight on the swatch; the
 * `--mx`/`--my` vars are set by the surrounding grid (see GlazeLibrary).
 */
export function GlazeTile({
  glaze,
  count = 0,
  className,
  swatchClassName = "aspect-square",
}: {
  glaze: Glaze;
  count?: number;
  className?: string;
  swatchClassName?: string;
}) {
  return (
    <Link
      href={`/glazes/${glaze.slug}`}
      data-cursor="link"
      data-glaze={glaze.baseHex}
      className={cn("group block", className)}
    >
      <div
        data-swatch
        className={cn(
          "rounded-arch relative w-full overflow-hidden shadow-[var(--shadow-card),var(--shadow-pool)]",
          swatchClassName,
        )}
        style={{ background: swatchBg(glaze) }}
      >
        <span
          className="absolute right-2.5 top-2.5 font-mono text-[10px] uppercase tracking-wider opacity-80"
          style={{ color: glaze.onColor }}
        >
          {glaze.finish}
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:hidden"
          style={{
            background:
              "radial-gradient(140px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,.28), transparent 70%)",
          }}
        />
      </div>
      <p className="mt-2 font-display text-lg leading-tight text-ink">{glaze.name}</p>
      <p className="font-mono text-[11px] uppercase tracking-wider text-slip">
        {glaze.family} · {count} {count === 1 ? "piece" : "pieces"}
      </p>
    </Link>
  );
}
