"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** Circular "glass" back button for detail hero headers. */
export function BackButton({
  className,
  fallback = "/gallery",
}: {
  className?: string;
  /** Where to go if there's no history to pop. */
  fallback?: string;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full bg-bone/80 text-ink shadow-[var(--shadow-card)] backdrop-blur-md transition-colors hover:bg-bone",
        className,
      )}
    >
      <ArrowLeft size={18} strokeWidth={2.4} />
    </button>
  );
}
