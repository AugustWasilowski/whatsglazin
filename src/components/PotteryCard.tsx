import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { pieceFill } from "@/lib/glazes";
import type { EnrichedPiece } from "@/lib/types";

/**
 * Pottery card — "catalog plate": the photo alone carries the frame while the
 * caption sits below on the page background, like a plate in a printed catalog.
 * Falls back to the glaze-fill placeholder until a real photo exists.
 */
export function PotteryCard({
  piece,
  className,
  aspect = "aspect-[4/5]",
  priority = false,
}: {
  piece: EnrichedPiece;
  className?: string;
  /** Tailwind aspect class — vary it for masonry. */
  aspect?: string;
  priority?: boolean;
}) {
  const { glazes, maker } = piece;
  const isCombo = glazes.length > 1;
  const cover = piece.photos[0]?.url ?? null;

  return (
    <Link
      href={`/pieces/${piece.slug}`}
      data-cursor="link"
      data-glaze={glazes[0]?.baseHex}
      className={cn(
        "group block transition-transform duration-300 hover:-translate-y-1",
        className,
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-card shadow-[var(--shadow-card)] transition-shadow duration-300 group-hover:shadow-[var(--shadow-elevated)]",
          aspect,
        )}
        style={{ background: pieceFill(glazes) }}
      >
        {cover && (
          <Image
            src={cover}
            alt={piece.photos[0]?.alt ?? piece.title ?? "Pottery piece"}
            fill
            sizes="(max-width: 640px) 50vw, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            placeholder={piece.photos[0]?.blurDataURL ? "blur" : "empty"}
            blurDataURL={piece.photos[0]?.blurDataURL}
            priority={priority}
          />
        )}
        {isCombo && (
          <span className="absolute right-2 top-2 rounded-pill bg-ink/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-bone backdrop-blur-sm">
            Combo
          </span>
        )}
      </div>

      <div className="mt-2.5 px-0.5">
        <p className="truncate font-display text-[17px] leading-snug text-ink">
          {glazes.length ? glazes.map((g) => g.name).join(" / ") : (piece.title ?? piece.form)}
        </p>
        <p className="mt-1 truncate font-mono text-[10.5px] uppercase tracking-wider text-slip">
          by {maker?.name ?? "—"}
        </p>
      </div>
    </Link>
  );
}
