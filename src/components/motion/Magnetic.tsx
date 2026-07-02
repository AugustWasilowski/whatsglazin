"use client";

import { useMagnetic } from "./useMagnetic";

/** Client wrapper: makes its child magnetic on fine-pointer devices. */
export function Magnetic({
  children,
  strength = 0.25,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useMagnetic<HTMLSpanElement>(strength);
  return (
    <span ref={ref} className={className ?? "inline-block"}>
      {children}
    </span>
  );
}
