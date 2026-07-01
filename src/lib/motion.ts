import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";

let registered = false;

/** Register GSAP plugins once, client-side only. */
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, Flip);
  registered = true;
}

/** True when the user asked for reduced motion — every animation checks this. */
export function reduced(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Whether entrance animations should run. False under reduced-motion OR when the
 * page is hidden — GSAP's ticker is paused while hidden, so a `from()` would sit
 * at its start state (invisible). Guarding here guarantees content is never
 * stuck hidden; it simply appears without the entrance in those cases.
 */
export function shouldAnimate(): boolean {
  return (
    typeof document !== "undefined" && !document.hidden && !reduced()
  );
}

export { gsap, ScrollTrigger, Flip };
