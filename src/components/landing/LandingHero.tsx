"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap, shouldAnimate } from "@/lib/motion";
import { getGlazes, pieceFill } from "@/lib/glazes";
import { PIECES, MEMBERS } from "@/lib/data";
import { GLAZES } from "@/lib/glazes";
import { ButtonLink } from "@/components/ui/Button";

const STATS = [
  { n: PIECES.length, label: "pieces" },
  { n: MEMBERS.length, label: "members" },
  { n: GLAZES.length, label: "glazes" },
];

const HEADLINE = ["A wall of", "what", "we made."];

export function LandingHero() {
  const scope = useRef<HTMLElement>(null);

  // A dense wall from the seed pieces (repeated to fill).
  const wall = Array.from({ length: 24 }, (_, i) => {
    const p = PIECES[i % PIECES.length];
    return {
      fill: pieceFill(getGlazes(p.glazeIds)),
      aspect: i % 3 === 0 ? "3 / 4" : i % 3 === 1 ? "1 / 1" : "4 / 5",
    };
  });

  useGSAP(
    () => {
      registerGsap();
      const el = scope.current;
      if (!el || !shouldAnimate()) return;

      // Load-in choreography.
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-tile", {
        opacity: 0,
        scale: 0.92,
        y: 16,
        duration: 0.7,
        stagger: { each: 0.035, from: "random" },
      })
        .from(".hero-line", { yPercent: 115, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.15)
        .from(
          ".hero-fade",
          { opacity: 0, y: 16, duration: 0.6, stagger: 0.08 },
          "-=0.4",
        );

      // Slow parallax drift + scrim fade on scroll.
      gsap.to(".hero-wall", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-scrim", {
        opacity: 0.35,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative overflow-hidden">
      {/* masonry wall (over-scanned so parallax leaves no gap) */}
      <div
        aria-hidden
        className="hero-wall pointer-events-none absolute -inset-x-0 -top-[10%] h-[130%] columns-3 gap-3 p-3 sm:columns-4 lg:columns-6"
      >
        {wall.map((t, i) => (
          <div
            key={i}
            className="hero-tile mb-3 w-full break-inside-avoid rounded-md"
            style={{ background: t.fill, aspectRatio: t.aspect }}
          />
        ))}
      </div>

      {/* warm scrim for legibility */}
      <div
        aria-hidden
        className="hero-scrim absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(241,231,214,0.97) 30%, rgba(241,231,214,0.72) 48%, rgba(241,231,214,0.12) 68%, transparent)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1180px] px-6 py-24 sm:px-10 sm:py-32">
        <div className="max-w-[640px]">
          <p className="hero-fade mb-5 font-sans text-[12px] font-medium uppercase tracking-[0.22em] text-terracotta">
            The Fine Line · St. Charles, IL
          </p>
          <h1 className="font-display text-[15vw] leading-[0.92] tracking-[-0.02em] text-ink sm:text-[84px]">
            {HEADLINE.map((line) => (
              <span key={line} className="block overflow-hidden">
                <span className="hero-line block">{line}</span>
              </span>
            ))}
          </h1>
          <p className="hero-fade mt-6 max-w-[520px] text-lg leading-relaxed text-ink-3">
            Snap a piece straight off the kiln shelf, log the glaze in three taps,
            and it joins a gallery the whole studio can search — by colour, recipe,
            and maker.
          </p>
          <div className="hero-fade mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/add" size="lg">Add your piece</ButtonLink>
            <ButtonLink href="/gallery" variant="secondary" size="lg">
              Browse the gallery
            </ButtonLink>
          </div>
          <dl className="hero-fade mt-10 flex gap-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-3xl text-ink">
                  {s.n}
                  <span className="ml-1.5 align-middle font-sans text-sm font-medium text-slip">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
