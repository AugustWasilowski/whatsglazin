import { SiteHeader } from "@/components/nav/SiteHeader";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-clay">
      <SiteHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
