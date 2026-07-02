import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div className="max-w-sm">
        <p aria-hidden className="text-outline font-display text-[88px] leading-none text-terracotta">
          404
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink">We couldn’t find that.</h1>
        <p className="mt-2 text-ink-2">
          The piece, glaze, or page may have been removed — or the link was mistyped.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/gallery"
            className="inline-flex min-h-[48px] items-center justify-center rounded-md bg-terracotta px-6 font-semibold text-on-terracotta shadow-[var(--shadow-glow)] transition-colors hover:bg-terracotta-hover"
          >
            Browse the gallery
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center justify-center rounded-md border border-line-strong bg-bone px-6 font-semibold text-ink transition-colors hover:bg-clay/40"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
