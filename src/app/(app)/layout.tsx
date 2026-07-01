import { SiteHeader } from "@/components/nav/SiteHeader";
import { MobileTabBar } from "@/components/nav/MobileTabBar";

/** Chrome for the in-app screens: desktop header + mobile bottom tab bar. */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-clay">
      <div className="hidden md:block">
        <SiteHeader />
      </div>
      {/* leave room for the fixed mobile tab bar */}
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <MobileTabBar />
    </div>
  );
}
