"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Wordmark } from "./Wordmark";
import { ButtonLink } from "@/components/ui/Button";

const LINKS = [
  { href: "/gallery", label: "Gallery" },
  { href: "/glazes", label: "Glazes" },
  { href: "/members", label: "Members" },
];

/** Desktop / marketing header — wordmark + section links + Sign in. */
export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-clay/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between px-6 sm:px-10">
        <Wordmark />
        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-ink",
                  active ? "text-ink" : "text-ink-2",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <ButtonLink href="/auth" variant="secondary" size="md" className="min-h-[40px] px-4">
          Sign in
        </ButtonLink>
      </div>
    </header>
  );
}
