import Link from "next/link";
import { cn } from "@/lib/utils";

/** WhatsGlazin wordmark — Young Serif with a terracotta question mark. */
export function Wordmark({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "font-display text-xl leading-none tracking-[-0.01em] text-ink",
        className,
      )}
      aria-label="WhatsGlazin — home"
    >
      What&rsquo;sGlazin<span className="text-terracotta">?</span>
    </Link>
  );
}
