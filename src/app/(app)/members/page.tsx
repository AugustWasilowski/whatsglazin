import type { Metadata } from "next";
import Link from "next/link";
import { getMembers, getPieces } from "@/lib/db";
import { Avatar } from "@/components/ui/Avatar";

export const metadata: Metadata = {
  title: "Members",
  description: "The makers of The Fine Line.",
};

export default async function MembersPage() {
  const [members, pieces] = await Promise.all([getMembers(), getPieces()]);
  const countByMaker = new Map<string, number>();
  for (const p of pieces) countByMaker.set(p.makerId, (countByMaker.get(p.makerId) ?? 0) + 1);

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-10">
      <h1 className="font-display text-4xl text-ink sm:text-5xl">Members</h1>
      {members.length === 0 ? (
        <div className="mt-8 rounded-card border border-dashed border-line-strong bg-bone/60 p-10 text-center">
          <p className="font-display text-2xl text-ink">No members yet</p>
          <p className="mt-1 text-sm text-slip">
            Makers show up here once they’ve logged a piece.
          </p>
        </div>
      ) : (
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => {
          const count = countByMaker.get(m.id) ?? 0;
          return (
            <Link
              key={m.id}
              href={`/members/${m.slug}`}
              className="flex items-center gap-4 rounded-card border border-line bg-bone p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
            >
              <Avatar member={m} size={52} />
              <div className="min-w-0">
                <p className="truncate font-display text-xl text-ink">{m.name}</p>
                <p className="truncate text-xs text-slip">
                  {m.disciplines.join(" · ")}
                  {m.disciplines.length ? " · " : ""}
                  {count} {count === 1 ? "piece" : "pieces"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      )}
    </div>
  );
}
