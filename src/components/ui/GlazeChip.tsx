import { cn } from "@/lib/utils";
import type { Glaze } from "@/lib/types";

/**
 * Glaze chip / tag.
 * - "solid": pill filled with the glaze color + on-color text (used in the
 *   upload combination list; supports a remove button).
 * - "soft": subtle chip with a color dot (used on pottery cards).
 */
export function GlazeChip({
  glaze,
  variant = "solid",
  onRemove,
  className,
}: {
  glaze: Glaze;
  variant?: "solid" | "soft";
  onRemove?: () => void;
  className?: string;
}) {
  if (variant === "soft") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-pill bg-chip px-2 py-0.5 text-[11px] font-medium text-ink-2",
          className,
        )}
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: glaze.baseHex }}
          aria-hidden
        />
        {glaze.name}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-[13px] font-semibold",
        className,
      )}
      style={{ background: glaze.baseHex, color: glaze.onColor }}
    >
      {glaze.name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${glaze.name}`}
          className="-mr-1 grid h-4 w-4 place-items-center rounded-full bg-white/25 text-[11px] leading-none hover:bg-white/40"
        >
          ×
        </button>
      )}
    </span>
  );
}
