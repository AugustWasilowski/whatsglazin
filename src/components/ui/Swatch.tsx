import { cn } from "@/lib/utils";
import { swatchFill } from "@/lib/glazes";
import type { Glaze } from "@/lib/types";

/**
 * Material swatch for a single glaze. Uses the diagonal-weave gradient recipe
 * until real photography is supplied. Optionally overlays the finish label.
 */
export function Swatch({
  glaze,
  className,
  showFinish = false,
  rounded = "card",
}: {
  glaze: Glaze;
  className?: string;
  showFinish?: boolean;
  rounded?: "sm" | "md" | "card" | "lg" | "pill" | "full";
}) {
  const radius = {
    sm: "rounded-sm",
    md: "rounded-md",
    card: "rounded-card",
    lg: "rounded-lg",
    pill: "rounded-pill",
    full: "rounded-full",
  }[rounded];

  return (
    <div
      className={cn("relative overflow-hidden", radius, className)}
      style={{ background: swatchFill(glaze) }}
      role="img"
      aria-label={`${glaze.name} glaze — ${glaze.family}, ${glaze.finish}`}
    >
      {showFinish && (
        <span
          className="absolute right-2 top-2 font-mono text-[10px] uppercase tracking-wider opacity-80"
          style={{ color: glaze.onColor }}
        >
          {glaze.finish}
        </span>
      )}
    </div>
  );
}
