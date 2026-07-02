"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap, shouldAnimate } from "@/lib/motion";
import { useMagnetic } from "@/components/motion/useMagnetic";
import { HeadlineReveal } from "@/components/motion/HeadlineReveal";
import { ShaderCanvas } from "@/components/gfx/ShaderCanvas";
import { MOLTEN_FRAG } from "@/components/gfx/shaders/molten";
import { ButtonLink } from "@/components/ui/Button";
import { getGlazeBySlug } from "@/lib/glazes";

export type HeroStat = { n: number; label: string };

// The bucket: four studio glazes the molten surface melts between.
const MELT_SLUGS = ["floating-blue", "butterscotch", "oribe-6", "satin-white"] as const;
const MELT = MELT_SLUGS.map((s) => getGlazeBySlug(s)!);
const MELT_COLORS = MELT.map((g) => g.baseHex) as [string, string, string, string];

// Static stand-in: the same four glazes as a layered pour.
const MELT_FALLBACK = [
  "repeating-linear-gradient(135deg, rgba(255,255,255,.055) 0 9px, rgba(28,18,8,.05) 9px 18px)",
  `linear-gradient(158deg, ${MELT[0].baseHex} 0%, ${MELT[1].baseHex} 38%, ${MELT[2].baseHex} 72%, ${MELT[3].shade2Hex} 100%)`,
].join(", ");

/** "Molten" hero — a live glaze melt behind the studio's kiln log. */
export function LandingHero({ stats }: { stats: HeroStat[] }) {
  const scope = useRef<HTMLElement>(null);
  const primaryMag = useMagnetic<HTMLSpanElement>(0.25);
  const secondaryMag = useMagnetic<HTMLSpanElement>(0.25);

  useGSAP(
    () => {
      registerGsap();
      const el = scope.current;
      if (!el || !shouldAnimate()) return;

      gsap.fromTo(
        ".hero-fade",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.09,
          delay: 0.25,
          ease: "power3.out",
          clearProps: "opacity,transform",
        },
      );
      gsap.fromTo(
        ".hero-arch",
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 1.1, ease: "power3.out" },
      );
      // Gentle parallax on the kiln door as the page scrolls away.
      gsap.to(".hero-arch", {
        yPercent: 7,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative overflow-hidden bg-clay">
      {/* Mobile: the melt runs full-bleed behind a clay wash. */}
      <div className="absolute inset-0 lg:hidden">
        <ShaderCanvas
          fragment={MOLTEN_FRAG}
          colors={MELT_COLORS}
          className="absolute inset-0"
          fallback={
            <div className="absolute inset-0" style={{ background: MELT_FALLBACK }} />
          }
        />
        <div className="absolute inset-0 bg-clay/85" />
      </div>

      <div className="relative mx-auto w-full max-w-[1400px] px-5 sm:px-10">
        <div className="grid min-h-[88vh] items-center gap-12 py-20 sm:py-24 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          {/* ---- copy ---- */}
          <div className="max-w-[680px]">
            <p className="hero-fade mb-6 font-mono text-label font-medium uppercase text-terracotta">
              The Fine Line · St. Charles, IL · Cone 6 · est. 1979
            </p>
            <HeadlineReveal as="h1" className="font-display text-display-2xl text-ink">
              A wall of what we made.
            </HeadlineReveal>
            <p className="hero-fade mt-7 max-w-[520px] text-lg leading-relaxed text-ink-3">
              Snap a piece straight off the kiln shelf, log the glaze in three
              taps, and it joins a gallery the whole studio can search — by
              color, recipe, and maker.
            </p>
            <div className="hero-fade mt-9 flex flex-wrap gap-3">
              <span ref={primaryMag} className="inline-block">
                <ButtonLink href="/add" size="lg" data-cursor="link">
                  Add your piece
                </ButtonLink>
              </span>
              <span ref={secondaryMag} className="inline-block">
                <ButtonLink href="/gallery" variant="secondary" size="lg" data-cursor="link">
                  Browse the gallery
                </ButtonLink>
              </span>
            </div>

            {/* ---- kiln log ---- */}
            <dl className="hero-fade mt-14 flex max-w-[520px] divide-x divide-line-strong border-y border-line-strong">
              {stats.map((s) => (
                <div key={s.label} className="flex-1 px-5 py-4 first:pl-1">
                  <dd className="font-mono text-2xl tabular-nums text-ink">
                    {String(s.n).padStart(2, "0")}
                  </dd>
                  <dt className="mt-0.5 font-mono text-label uppercase text-slip">
                    {s.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          {/* ---- the kiln door (desktop) ---- */}
          <div className="hero-arch relative hidden h-[72vh] max-h-[780px] min-h-[420px] lg:block">
            <div
              className="rounded-arch absolute inset-0 overflow-hidden shadow-[var(--shadow-deep)]"
              data-glaze={MELT[0].baseHex}
            >
              <ShaderCanvas
                fragment={MOLTEN_FRAG}
                colors={MELT_COLORS}
                className="absolute inset-0"
                fallback={
                  <div className="absolute inset-0" style={{ background: MELT_FALLBACK }} />
                }
              />
              {/* wet edge highlight */}
              <div className="pointer-events-none absolute inset-0 rounded-arch border border-white/15" />
            </div>
            <p className="absolute -bottom-8 right-2 font-mono text-[11px] uppercase tracking-wider text-slip">
              Live melt · {MELT.map((g) => g.name).join(" · ")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
