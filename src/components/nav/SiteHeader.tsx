"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Wordmark } from "./Wordmark";
import { ButtonLink } from "@/components/ui/Button";

const LINKS = [
  { href: "/gallery", label: "Gallery" },
  { href: "/glazes", label: "Glazes" },
  { href: "/studios", label: "Studios" },
  { href: "/members", label: "Members" },
  { href: "/add", label: "Add" },
];

export type HeaderMember = { name: string; initials: string; isSiteAdmin?: boolean } | null;

/** Desktop / marketing header — editorial at rest, condenses on scroll. */
export function SiteHeader({ member }: { member?: HeaderMember }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-clay/80 backdrop-blur-md">
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1400px] items-center justify-between px-5 transition-[height] duration-300 ease-out sm:px-10",
          scrolled ? "h-14" : "h-20",
        )}
      >
        <Wordmark />
        <nav className="hidden items-center gap-8 md:flex">
          {[...LINKS, ...(member?.isSiteAdmin ? [{ href: "/admin", label: "Admin" }] : [])].map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                data-cursor="link"
                className={cn(
                  "relative py-1 font-mono text-label font-medium uppercase transition-colors hover:text-ink",
                  active ? "text-ink" : "text-ink-2",
                )}
              >
                {l.label}
                {/* drip-dot marks the active section */}
                <span
                  className={cn(
                    "absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-terracotta transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden
                />
              </Link>
            );
          })}
        </nav>
        {member ? (
          <Link
            href="/you"
            aria-label="Your account"
            className="flex items-center gap-2 rounded-pill py-1 pl-1 pr-3 transition-colors hover:bg-bone/60"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-terracotta text-xs font-semibold text-on-terracotta">
              {member.initials}
            </span>
            <span className="hidden text-sm font-medium text-ink sm:inline">
              {member.name.split(" ")[0]}
            </span>
          </Link>
        ) : (
          <ButtonLink href="/auth" variant="secondary" size="md" className="min-h-[40px] px-4">
            Sign in
          </ButtonLink>
        )}
      </div>
    </header>
  );
}
