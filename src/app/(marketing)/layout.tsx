import { SiteHeader } from "@/components/nav/SiteHeader";
import { SiteFooter } from "@/components/nav/SiteFooter";
import { getSessionMember } from "@/lib/auth";
import { initialsOf } from "@/lib/utils";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { member } = await getSessionMember();
  return (
    <div className="flex min-h-full flex-col bg-clay">
      <SiteHeader
        member={
          member
            ? { name: member.name, initials: initialsOf(member.name), isSiteAdmin: member.isSiteAdmin }
            : null
        }
      />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
