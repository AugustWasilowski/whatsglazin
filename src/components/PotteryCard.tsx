import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getGlazes, pieceFill } from "@/lib/glazes";
import { getMember } from "@/lib/data";
import { GlazeChip } from "@/components/ui/GlazeChip";
import type { Piece } from "@/lib/types";

/**
 * Pottery card — photo-forward, whole card links to the piece detail.
 * Falls back to the glaze-fill placeholder until a real photo exists.
 */
export function PotteryCard({
  piece,
  className,
  aspect = "aspect-[4/5]",
  priority = false,
}: {
  piece: Piece;
  className?: string;
  /** Tailwind aspect class — vary it for masonry. */
  aspect?: string;
  priority?: boolean;
}) {
  const glazes = getGlazes(piece.glazeIds);
  const maker = getMember(piece.makerId);
  const isCombo = glazes.length > 1;
  const cover = piece.photos[0]?.url ?? null;

  return (
    <Link
      href={`/pieces/${piece.slug}`}
      className={cn(
        "group block overflow-hidden rounded-card border border-line-2 bg-bone shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]",
        className,
      )}
    >
      <div className={cn("relative w-full", aspect)} style={{ background: pieceFill(glazes) }}>
        {cover && (
          <Image
            src={cover}
            alt={piece.photos[0]?.alt ?? piece.title ?? "Pottery piece"}
            fill
            sizes="(max-width: 640px) 50vw, 300px"
            className="object-cover"
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

      <div className="p-3.5">
        <p className="truncate text-[15px] font-semibold text-ink">
          {piece.title ?? piece.form}
        </p>
        <p className="mt-0.5 text-xs font-medium text-slip">by {maker?.name}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {glazes.map((g) => (
            <GlazeChip key={g.id} glaze={g} variant="soft" />
          ))}
        </div>
      </div>
    </Link>
  );
}
