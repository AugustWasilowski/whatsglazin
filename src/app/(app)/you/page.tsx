import { redirect } from "next/navigation";
import { getSessionMember } from "@/lib/auth";
import { initialsOf } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = { title: "You" };

/** The signed-in member's account. (Their pieces gallery arrives with the
 *  data-layer swap.) Middleware already gates this route, but guard anyway. */
export default async function YouPage() {
  const { user, member } = await getSessionMember();
  if (!user) redirect("/auth?next=/you");

  const name = member?.name ?? user.email ?? "Member";

  return (
    <div className="mx-auto w-full max-w-[560px] px-5 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-terracotta font-display text-xl text-on-terracotta">
          {initialsOf(name)}
        </span>
        <div className="min-w-0">
          <h1 className="truncate font-display text-3xl text-ink">{name}</h1>
          {user.email && <p className="truncate text-sm text-slip">{user.email}</p>}
          {member && (
            <p className="text-sm text-slip">Member since {member.memberSince}</p>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-card border border-line bg-bone p-6 text-center">
        <p className="font-display text-2xl text-ink">Nothing logged yet</p>
        <p className="mt-1 text-sm text-slip">
          Pull a piece from the kiln and add your first one.
        </p>
        <ButtonLink href="/add" size="lg" className="mt-5">
          Add a piece
        </ButtonLink>
      </div>

      <form action="/auth/signout" method="post" className="mt-6 text-center">
        <button
          type="submit"
          className="text-sm font-medium text-slip underline underline-offset-4 hover:text-ink"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
