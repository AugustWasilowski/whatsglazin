"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap, registerGsap, shouldAnimate } from "@/lib/motion";

/**
 * Chemistry as ornament: a full-bleed strip of oversized outlined type
 * (`CONE 6 — Δ6 · 2232°F — OXIDATION`) that slides with scroll (scrubbed,
 * not an infinite marquee). Purely decorative — hidden from the a11y tree.
 */
export function SpecStrip({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldAnimate()) return;
    registerGsap();
    const tween = gsap.fromTo(
      innerRef.current,
      { xPercent: 1.5 },
      {
        xPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const line = Array(3).fill(text.toUpperCase()).join("  —  ");

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("select-none overflow-hidden py-8", className)}
    >
      <div
        ref={innerRef}
        className="text-outline whitespace-nowrap font-display text-[clamp(2.75rem,7vw,6.5rem)] leading-none opacity-30"
      >
        {line}
      </div>
    </div>
  );
}
