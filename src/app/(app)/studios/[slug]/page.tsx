import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getStudioBySlug,
  getStudioAdmins,
  getAdminStudioIds,
  getGlazes,
  getPieces,
} from "@/lib/db";
import { getSessionMember } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { SpecLabel, SpecTable } from "@/components/ui/Spec";
import { ButtonLink } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { HeadlineReveal } from "@/components/motion/HeadlineReveal";
import { GlazeTile } from "@/components/GlazeTile";
import { PotteryCard } from "@/components/PotteryCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const studio = await getStudioBySlug(slug);
  if (!studio) return { title: "Studio not found" };
  return {
    title: studio.name,
    description: studio.description ?? `What's glazin at ${studio.name}.`,
  };
}

export default async function StudioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const studio = await getStudioBySlug(slug);
  if (!studio) notFound();

  const { member } = await getSessionMember();
  const [admins, allGlazes, allPieces, adminOf] = await Promise.all([
    getStudioAdmins(studio.id),
    getGlazes(),
    getPieces(),
    member ? getAdminStudioIds(member.id) : Promise.resolve([]),
  ]);

  // Inactive studios stay reachable only for their admins + the site admin.
  const canManage = adminOf.includes(studio.id) || Boolean(member?.isSiteAdmin);
  if (!studio.isActive && !canManage) notFound();

  const glazes = allGlazes.filter((g) => g.studioId === studio.id);
  const pieces = allPieces.filter((p) => p.studioId === studio.id);
  const pieceCountByGlaze = new Map<string, number>();
  for (const p of pieces)
    for (const id of p.glazeIds)
      pieceCountByGlaze.set(id, (pieceCountByGlaze.get(id) ?? 0) + 1);

  const specRows = [
    studio.location ? { label: "Location", value: studio.location } : null,
    studio.established ? { label: "Established", value: String(studio.established) } : null,
    { label: "Glazes", value: String(glazes.length) },
    { label: "Pieces", value: String(pieces.length) },
  ].filter((r): r is { label: string; value: string } => Boolean(r));

  return (
    <Container className="py-8 sm:py-10">
      {!studio.isActive && (
        <p className="mb-6 rounded-md border border-error-line bg-error-bg px-4 py-2.5 text-sm text-error">
          This studio is deactivated — only its admins can see this page.
        </p>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SpecLabel>Studio corner</SpecLabel>
          <HeadlineReveal as="h1" className="mt-3 font-display text-display-xl text-ink">
            {studio.name}
          </HeadlineReveal>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <ButtonLink href={`/studios/${studio.slug}/edit`} variant="secondary">
              Edit studio
            </ButtonLink>
            <ButtonLink href={`/studios/${studio.slug}/glazes/new`}>Add a glaze</ButtonLink>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
        <div>
          {studio.description && (
            <p className="max-w-[52ch] font-display text-xl leading-relaxed text-ink-2">
              {studio.description}
            </p>
          )}
          {admins.length > 0 && (
            <div className="mt-6">
              <p className="font-mono text-label font-medium uppercase text-slip">
                Studio {admins.length === 1 ? "admin" : "admins"}
              </p>
              <div className="mt-3 flex flex-wrap gap-4">
                {admins.map((a) => (
                  <Link
                    key={a.id}
                    href={`/members/${a.slug}`}
                    data-cursor="link"
                    className="group flex items-center gap-2.5"
                  >
                    <Avatar member={a} size={40} />
                    <span className="text-sm font-medium text-ink transition-colors group-hover:text-terracotta">
                      {a.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        <SpecTable rows={specRows} className="h-fit shadow-[var(--shadow-card)]" />
      </div>

      {/* ---- The studio's glaze library ---- */}
      <section className="mt-14">
        <h2 className="font-mono text-label font-medium uppercase text-terracotta">
          The glaze board
        </h2>
        {glazes.length ? (
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {glazes.map((g) => (
              <GlazeTile
                key={g.id}
                glaze={g}
                count={pieceCountByGlaze.get(g.id) ?? 0}
                swatchClassName="aspect-[4/3]"
              />
            ))}
          </div>
        ) : (
          <EmptyState className="mt-6" title="No glazes yet">
            {canManage
              ? "Add the studio's first glaze so members can start logging with it."
              : "This studio hasn't added its glazes yet."}
          </EmptyState>
        )}
      </section>

      {/* ---- Fired here ---- */}
      <section className="mt-14">
        <h2 className="font-mono text-label font-medium uppercase text-terracotta">
          Fired here
        </h2>
        {pieces.length ? (
          <div className="mt-6 columns-2 gap-4 lg:columns-3">
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
          <EmptyState className="mt-6" title="Nothing on the shelf yet">
            Pieces logged by this studio&rsquo;s members will show up here.
          </EmptyState>
        )}
      </section>
    </Container>
  );
}
