"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { GlazeWithCount } from "@/lib/types";
import { swatchBg } from "@/lib/glazes";
import { gsap, registerGsap, shouldAnimate, canHover } from "@/lib/motion";

/**
 * The studio's test-tile board, full bleed: arch-top glaze tiles in a row.
 * Swipes natively on touch; on desktop it also drifts sideways with scroll
 * (a scrubbed nudge, never scroll-jacking).
 */
export function TestTileBoard({ glazes }: { glazes: GlazeWithCount[] }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldAnimate() || !canHover()) return;
    registerGsap();
    const tween = gsap.fromTo(
      innerRef.current,
      { x: 0 },
      {
        x: -140,
        ease: "none",
        scrollTrigger: {
          trigger: outerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div
      ref={outerRef}
      className="overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div ref={innerRef} className="flex w-max gap-5 px-5 sm:px-10">
        {glazes.map((g) => (
          <Link
            key={g.id}
            href={`/glazes/${g.slug}`}
            data-cursor="link"
            data-glaze={g.baseHex}
            className="group w-[170px] shrink-0 sm:w-[210px]"
          >
            <div
              className="rounded-arch aspect-[3/4] w-full overflow-hidden shadow-[var(--shadow-card),var(--shadow-pool)] transition-transform duration-300 group-hover:-translate-y-1.5"
              style={{ background: swatchBg(g) }}
            >
              <span
                className="mt-4 block text-center font-mono text-[10px] uppercase tracking-wider opacity-80"
                style={{ color: g.onColor }}
              >
                {g.finish} · Δ{g.cone}
              </span>
            </div>
            <p className="mt-3 text-center font-display text-lg leading-tight text-ink">
              {g.name}
            </p>
            <p className="mt-0.5 text-center font-mono text-[11px] uppercase tracking-wider text-slip">
              {g.family}
              {g.pieceCount ? ` · ${g.pieceCount}` : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
