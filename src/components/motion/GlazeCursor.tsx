"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { gsap, registerGsap, canHover, reduced, capabilityStore } from "@/lib/motion";

let cursorVerdict: boolean | null = null;
function canCursor(): boolean {
  if (typeof window === "undefined") return false;
  cursorVerdict ??= canHover() && !reduced();
  return cursorVerdict;
}

/**
 * A small glaze drop that trails the native cursor (never replaces it).
 * Grows into a hollow ring over [data-cursor="link"] targets, and tints
 * itself from the nearest [data-glaze] ancestor's color.
 * Desktop / fine-pointer only.
 */
export function GlazeCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const enabled = useSyncExternalStore(
    capabilityStore.subscribe,
    canCursor,
    capabilityStore.server,
  );

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    if (!dot) return;
    registerGsap();

    const xTo = gsap.quickTo(dot, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.35, ease: "power3.out" });
    let visible = false;
    let ring = false;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      xTo(e.clientX);
      yTo(e.clientY);
      if (!visible) {
        visible = true;
        gsap.to(dot, { autoAlpha: 1, duration: 0.2 });
      }

      const el = e.target as Element | null;
      const overLink = Boolean(el?.closest?.('[data-cursor="link"], a, button'));
      const glaze = el?.closest?.("[data-glaze]") as HTMLElement | null;
      const tint = glaze?.dataset.glaze || "#b0552f";

      if (overLink !== ring) {
        ring = overLink;
        gsap.to(dot, {
          scale: ring ? 2.6 : 1,
          backgroundColor: ring ? "transparent" : tint,
          borderWidth: ring ? 1.5 : 0,
          duration: 0.25,
          ease: "power3.out",
        });
      }
      // Keep the tint current even without a ring-state change.
      gsap.to(dot, { borderColor: tint, ...(ring ? {} : { backgroundColor: tint }), duration: 0.3 });
    };

    const onLeave = () => {
      visible = false;
      gsap.to(dot, { autoAlpha: 0, duration: 0.2 });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-0 border-terracotta bg-terracotta opacity-0 mix-blend-multiply"
      style={{ borderStyle: "solid" }}
    />
  );
}
