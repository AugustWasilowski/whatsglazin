"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap, shouldAnimate } from "@/lib/motion";
import { useMagnetic } from "@/components/motion/useMagnetic";
import { HeadlineReveal } from "@/components/motion/HeadlineReveal";
import { ShaderCanvas } from "@/components/gfx/ShaderCanvas";
import { MOLTEN_FRAG } from "@/components/gfx/shaders/molten";
import { ButtonLink } from "@/components/ui/Button";
import { getGlazeBySlug } from "@/lib/glazes";

export type HeroStat = { n: number; label: string };

/** A randomly-picked finished piece, chosen server-side on each page load. */
export type FeaturedPiece = {
  slug: string;
  url: string;
  alt: string;
  /** e.g. "Floating Blue · by August" */
  label: string;
};

// The bucket: four studio glazes the molten surface melts between.
const MELT_SLUGS = ["floating-blue", "butterscotch", "oribe-6", "satin-white"] as const;
const MELT = MELT_SLUGS.map((s) => getGlazeBySlug(s)!);
const MELT_COLORS = MELT.map((g) => g.baseHex) as [string, string, string, string];

// Static stand-in: the same four glazes as a layered pour.
const MELT_FALLBACK = [
  "repeating-linear-gradient(135deg, rgba(255,255,255,.055) 0 9px, rgba(28,18,8,.05) 9px 18px)",
  `linear-gradient(158deg, ${MELT[0].baseHex} 0%, ${MELT[1].baseHex} 38%, ${MELT[2].baseHex} 72%, ${MELT[3].shade2Hex} 100%)`,
].join(", ");

/** Hero — a piece straight off the wall (random each load) beside the intro. */
export function LandingHero({
  stats,
  featured,
}: {
  stats: HeroStat[];
  featured?: FeaturedPiece | null;
}) {
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
              The Fine Line · St. Charles, IL · est. 1979
            </p>
            <HeadlineReveal as="h1" className="font-display text-display-2xl text-ink">
              Real glazes on real pots.
            </HeadlineReveal>
            <p className="hero-fade mt-7 max-w-[520px] text-lg leading-relaxed text-ink-3">
              WhatsGlazin is the studio&rsquo;s glaze gallery — finished pieces,
              each tagged with the exact glazes on it, so you can see how every
              glaze actually fires, alone or layered. Searchable by glaze,
              combination, and maker.
            </p>
            <div className="hero-fade mt-9 flex flex-wrap gap-3">
              <span ref={primaryMag} className="inline-block">
                <ButtonLink href="/gallery" size="lg" data-cursor="link">
                  Browse the gallery
                </ButtonLink>
              </span>
              <span ref={secondaryMag} className="inline-block">
                <ButtonLink href="/glazes" variant="secondary" size="lg" data-cursor="link">
                  The glaze board
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

          {/* ---- off the wall (desktop): a random piece each load ---- */}
          <div className="hero-arch relative hidden h-[72vh] max-h-[780px] min-h-[420px] lg:block">
            {featured ? (
              <>
                <Link
                  href={`/pieces/${featured.slug}`}
                  data-cursor="link"
                  className="rounded-arch absolute inset-0 block overflow-hidden shadow-[var(--shadow-deep)]"
                >
                  <Image
                    src={featured.url}
                    alt={featured.alt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 40vw, 0px"
                    className="object-cover"
                  />
                  {/* wet edge highlight */}
                  <span className="rounded-arch pointer-events-none absolute inset-0 border border-white/15" />
                </Link>
                <p className="absolute -bottom-8 right-2 font-mono text-[11px] uppercase tracking-wider text-slip">
                  Off the wall · {featured.label}
                </p>
              </>
            ) : (
              <>
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
                  <div className="pointer-events-none absolute inset-0 rounded-arch border border-white/15" />
                </div>
                <p className="absolute -bottom-8 right-2 font-mono text-[11px] uppercase tracking-wider text-slip">
                  Live melt · {MELT.map((g) => g.name).join(" · ")}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
