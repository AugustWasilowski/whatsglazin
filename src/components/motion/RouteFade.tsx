"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap, shouldAnimate } from "@/lib/motion";

/** Fades + lifts route content in on each in-app navigation. */
export function RouteFade({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      if (!ref.current || !shouldAnimate()) return;
      gsap.from(ref.current, { opacity: 0, y: 10, duration: 0.4, ease: "power2.out" });
    },
    { dependencies: [pathname], scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}
