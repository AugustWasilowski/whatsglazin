"use client";

import { useEffect } from "react";

/**
 * Route error boundary. Next 16 passes `unstable_retry`; older/other paths pass
 * `reset`. Accept both so the retry button works either way.
 */
export default function Error({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  unstable_retry?: () => void;
}) {
  useEffect(() => {
    // Surface it for logs; the digest ties back to server-side traces.
    console.error(error);
  }, [error]);

  const retry = unstable_retry ?? reset;

  return (
    <div className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div className="max-w-sm">
        <h1 className="font-display text-4xl text-ink">Something cracked in the kiln.</h1>
        <p className="mt-2 text-ink-2">
          A hiccup on our end kept this from loading. Give it another try.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => retry?.()}
            className="inline-flex min-h-[48px] items-center justify-center rounded-md bg-terracotta px-6 font-semibold text-on-terracotta shadow-[var(--shadow-glow)] transition-colors hover:bg-terracotta-hover"
          >
            Try again
          </button>
          <a
            href="/gallery"
            className="inline-flex min-h-[48px] items-center justify-center rounded-md border border-line-strong bg-bone px-6 font-semibold text-ink transition-colors hover:bg-clay/40"
          >
            Back to the gallery
          </a>
        </div>
      </div>
    </div>
  );
}
