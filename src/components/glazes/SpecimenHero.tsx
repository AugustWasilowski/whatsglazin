"use client";

import type { Glaze } from "@/lib/types";
import { hasSwatchPhoto, swatchFill } from "@/lib/glazes";
import { RippleSwatch } from "@/components/gfx/RippleSwatch";
import { ShaderCanvas } from "@/components/gfx/ShaderCanvas";
import { MOLTEN_FRAG } from "@/components/gfx/shaders/molten";
import { cn } from "@/lib/utils";

/**
 * The specimen plate on a glaze detail page. Glazes with a real fired-tile
 * photo get the ripple "dip"; the rest get the molten shader running in that
 * glaze's own two colors — the stand-in until a tile photo lands.
 */
export function SpecimenHero({
  glaze,
  className,
}: {
  glaze: Glaze;
  className?: string;
}) {
  if (hasSwatchPhoto(glaze)) {
    return (
      <RippleSwatch
        src={`/glazes/${glaze.slug}.jpg`}
        className={cn("relative overflow-hidden", className)}
      />
    );
  }
  return (
    <ShaderCanvas
      fragment={MOLTEN_FRAG}
      colors={[glaze.baseHex, glaze.shade2Hex, glaze.baseHex, glaze.shade2Hex]}
      className={cn("relative overflow-hidden", className)}
      fallback={
        <div className="absolute inset-0" style={{ background: swatchFill(glaze) }} />
      }
    />
  );
}
