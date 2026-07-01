"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Blend, Plus, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/gallery", label: "Browse", icon: LayoutGrid },
  { href: "/glazes", label: "Glazes", icon: Blend },
  { href: "/search", label: "Search", icon: Search },
  { href: "/you", label: "You", icon: User },
];

/** Mobile bottom tab bar with a raised terracotta "Add" FAB in the center. */
export function MobileTabBar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  // Split tabs 2 / 2 around the center FAB.
  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bone/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-center px-2">
        {left.map((t) => (
          <TabLink key={t.href} {...t} active={isActive(t.href)} />
        ))}

        <div className="flex justify-center">
          <Link
            href="/add"
            aria-label="Add a piece"
            className="grid h-[46px] w-[46px] -translate-y-3 place-items-center rounded-full bg-terracotta text-on-terracotta shadow-[var(--shadow-glow)] transition-transform active:scale-95"
          >
            <Plus size={24} strokeWidth={2.5} />
          </Link>
        </div>

        {right.map((t) => (
          <TabLink key={t.href} {...t} active={isActive(t.href)} />
        ))}
      </div>
    </nav>
  );
}

function TabLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium transition-colors",
        active ? "text-ink" : "text-[#A99A82]",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={22} strokeWidth={active ? 2.4 : 2} />
      {label}
    </Link>
  );
}
