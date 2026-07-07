import Link from "next/link";

const LINKS = [
  { href: "/gallery", label: "Gallery" },
  { href: "/glazes", label: "Glazes" },
  { href: "/studios", label: "Studios" },
  { href: "/members", label: "Members" },
  { href: "/auth", label: "Sign in" },
];

/** Site footer — the kiln-dark colophon shared by marketing and app shells. */
export function SiteFooter() {
  return (
    <footer className="on-dark grain-strong overflow-hidden bg-kiln-3 text-bone/70">
      <div className="mx-auto w-full max-w-[1400px] px-5 pb-10 pt-16 sm:px-10">
        <p
          aria-hidden
          className="text-outline select-none whitespace-nowrap font-display text-[clamp(3rem,11vw,10rem)] leading-none text-bone/25"
        >
          What&rsquo;sGlazin?
        </p>
        <div className="mt-10 flex flex-col gap-6 border-t border-bone/10 pt-8 sm:flex-row sm:items-end sm:justify-between">
          <nav className="flex flex-wrap gap-x-7 gap-y-3">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-mono text-label uppercase text-bone/60 transition-colors hover:text-bone"
                data-cursor="link"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="font-mono text-[11px] uppercase tracking-wider text-bone/40">
            <p>whatsglazin.com · The Fine Line · St. Charles, IL · est. 1979</p>
            <p className="mt-1">
              Cone 6 & 10 ·{" "}
              <span className="normal-case italic tracking-normal">
                This is all Jill&rsquo;s idea.
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
