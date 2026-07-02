"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, shouldAnimate, SplitText } from "@/lib/motion";
import type { JSX } from "react";

/**
 * Editorial line-mask reveal for display headings: each line rises out of an
 * overflow mask on scroll. Splitting waits for fonts so line breaks are true.
 * Under reduced motion the heading simply renders — SplitText is never built.
 */
export function HeadlineReveal({
  as = "h2",
  className,
  children,
  delay = 0,
}: {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !shouldAnimate()) return;
    registerGsap();

    let split: SplitText | null = null;
    let tween: gsap.core.Tween | null = null;
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled || !el.isConnected) return;
      split = new SplitText(el, { type: "lines", mask: "lines" });
      tween = gsap.fromTo(
        split.lines,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.09,
          ease: "power4.out",
          delay,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );
    });

    return () => {
      cancelled = true;
      tween?.scrollTrigger?.kill();
      tween?.kill();
      split?.revert();
    };
  }, [delay]);

  const Tag = as as React.ElementType;
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
