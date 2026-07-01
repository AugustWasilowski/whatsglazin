import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionMember } from "@/lib/auth";
import { getPieces } from "@/lib/db";
import { initialsOf } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { PotteryCard } from "@/components/PotteryCard";

export const metadata = { title: "You" };

/** The signed-in member's account and their own pieces. Middleware already
 *  gates this route, but guard anyway. */
export default async function YouPage() {
  const { user, member } = await getSessionMember();
  if (!user) redirect("/auth?next=/you");

  const name = member?.name ?? user.email ?? "Member";
  const pieces = member
    ? (await getPieces()).filter((p) => p.makerId === member.id)
    : [];

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-10">
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-terracotta font-display text-xl text-on-terracotta">
          {initialsOf(name)}
        </span>
        <div className="min-w-0">
          <h1 className="truncate font-display text-3xl text-ink">{name}</h1>
          {user.email && <p className="truncate text-sm text-slip">{user.email}</p>}
          {member && (
            <p className="text-sm text-slip">
              Member since {member.memberSince} ·{" "}
              <Link
                href={`/members/${member.slug}`}
                className="font-medium text-celadon underline underline-offset-4 hover:text-ink"
              >
                View public profile
              </Link>
            </p>
          )}
        </div>
      </div>

      <section className="mt-9">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl text-ink">Your pieces</h2>
          {pieces.length > 0 && (
            <ButtonLink href="/add" variant="secondary">
              Add a piece
            </ButtonLink>
          )}
        </div>

        {pieces.length ? (
          <div className="mt-5 columns-2 gap-4 lg:columns-3">
            {pieces.map((p, i) => (
              <PotteryCard
                key={p.id}
                piece={p}
                className="mb-4 break-inside-avoid"
                aspect={i % 2 === 0 ? "aspect-[3/4]" : "aspect-[4/5]"}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-card border border-line bg-bone p-6 text-center">
            <p className="font-display text-2xl text-ink">Nothing logged yet</p>
            <p className="mt-1 text-sm text-slip">
              Pull a piece from the kiln and add your first one.
            </p>
            <ButtonLink href="/add" size="lg" className="mt-5">
              Add a piece
            </ButtonLink>
          </div>
        )}
      </section>

      <form action="/auth/signout" method="post" className="mt-10 text-center">
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
