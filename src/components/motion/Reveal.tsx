"use client";

import { useRef, type ElementType } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap, shouldAnimate } from "@/lib/motion";

/**
 * Scroll-reveal wrapper. Staggers its element children up + in as the block
 * enters the viewport. No-op under prefers-reduced-motion (children stay put).
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  y = 20,
  stagger = 0.08,
  start = "top 85%",
}: {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
  y?: number;
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = ref.current;
      if (!el || !shouldAnimate()) return;
      const targets = Array.from(el.children);
      if (!targets.length) return;
      gsap.from(targets, {
        opacity: 0,
        y,
        duration: 0.6,
        ease: "power3.out",
        stagger,
        scrollTrigger: { trigger: el, start, once: true },
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
