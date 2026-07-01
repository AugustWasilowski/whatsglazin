import { SiteHeader } from "@/components/nav/SiteHeader";
import { MobileTabBar } from "@/components/nav/MobileTabBar";
import { RouteFade } from "@/components/motion/RouteFade";
import { getSessionMember } from "@/lib/auth";
import { initialsOf } from "@/lib/utils";

/** Chrome for the in-app screens: desktop header + mobile bottom tab bar. */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { member } = await getSessionMember();
  const headerMember = member
    ? { name: member.name, initials: initialsOf(member.name) }
    : null;

  return (
    <div className="flex min-h-full flex-col bg-clay">
      <div className="hidden md:block">
        <SiteHeader member={headerMember} />
      </div>
      {/* leave room for the fixed mobile tab bar */}
      <main className="flex-1 pb-24 md:pb-0">
        <RouteFade>{children}</RouteFade>
      </main>
      <MobileTabBar />
    </div>
  );
}
