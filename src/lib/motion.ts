import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";

let registered = false;

/** Register GSAP plugins once, client-side only. */
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, Flip, SplitText);
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

/** Fine-pointer device that can actually hover — gates cursor/magnetic effects. */
export function canHover(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

type NetworkInformation = { saveData?: boolean };

let shaderVerdict: boolean | null = null;

/**
 * Whether a canvas/WebGL effect may run at all: no reduced-motion, no
 * data-saver, a real WebGL context available, and no `?nogfx=1` debug
 * override in the URL. Deliberately ignores `document.hidden` — render loops
 * pause while hidden instead, so a tab opened in the background isn't demoted
 * forever. Probed once and cached (stable for useSyncExternalStore snapshots);
 * components still self-demote at runtime if frames come in slow.
 */
export function canRunShader(): boolean {
  if (typeof window === "undefined") return false;
  if (shaderVerdict !== null) return shaderVerdict;
  shaderVerdict = (() => {
    if (reduced()) return false;
    if (new URLSearchParams(window.location.search).has("nogfx")) return false;
    const conn = (navigator as Navigator & { connection?: NetworkInformation })
      .connection;
    if (conn?.saveData) return false;
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      return gl !== null;
    } catch {
      return false;
    }
  })();
  return shaderVerdict;
}

const noopSubscribe = () => () => {};
export const capabilityStore = {
  subscribe: noopSubscribe,
  /** SSR snapshot — capabilities are unknown on the server. */
  server: () => false,
};

export { gsap, ScrollTrigger, Flip, SplitText };
