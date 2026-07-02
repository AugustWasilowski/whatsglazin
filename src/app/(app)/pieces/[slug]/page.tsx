import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getPieceBySlug } from "@/lib/db";
import { getSessionMember } from "@/lib/auth";
import { pieceFill, swatchBg } from "@/lib/glazes";
import { BackButton } from "@/components/ui/BackButton";
import { Container } from "@/components/ui/Container";
import { MonoPill } from "@/components/ui/Spec";
import { PieceGallery } from "@/components/pieces/PieceGallery";
import { PieceOwnerActions } from "@/components/pieces/PieceOwnerActions";
import { SpecStrip } from "@/components/motion/SpecStrip";
import { timeAgo } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const piece = await getPieceBySlug(slug);
  if (!piece) return { title: "Piece not found" };
  return {
    title: piece.title ?? piece.form,
    description: `A ${piece.form.toLowerCase()} by ${piece.maker?.name ?? "a member"} at The Fine Line.`,
  };
}

export default async function PieceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const piece = await getPieceBySlug(slug);
  if (!piece) notFound();

  const { member } = await getSessionMember();
  const isOwner = Boolean(member && member.id === piece.makerId);

  const { glazes, maker } = piece;
  const primary = glazes[0];

  return (
    <div>
      <PieceGallery
        photos={piece.photos}
        fill={pieceFill(glazes)}
        form={piece.form}
        alt={piece.title ?? piece.form}
        overlay={
          <div className="absolute left-4 top-4">
            <BackButton />
          </div>
        }
      />

      <Container size="reading" className="py-7">
        <h1 className="font-display text-3xl text-ink">{piece.title ?? piece.form}</h1>
        <p className="mt-1 text-sm text-slip">
          {piece.form} ·{" "}
          {maker ? (
            <Link href={`/members/${maker.slug}`} className="text-ink-2 hover:text-ink">
              by {maker.name}
            </Link>
          ) : (
            "by a member"
          )}{" "}
          · {timeAgo(piece.createdAt)} ago
        </p>

        {glazes.length > 0 && (
          <section className="mt-8">
            <h2 className="font-mono text-label font-medium uppercase text-terracotta">
              The recipe
            </h2>
            {/* Layering made visible: first glaze dipped sits at the BOTTOM of
                the stack, so render order is reversed from recipe order. */}
            <div className="relative mt-4">
              <ol className="overflow-hidden rounded-card shadow-[var(--shadow-card)]" reversed>
                {[...glazes].reverse().map((g, i) => {
                  const layer = glazes.length - i; // original recipe position
                  return (
                    <li key={g.id}>
                      <Link
                        href={`/glazes/${g.slug}`}
                        data-cursor="link"
                        data-glaze={g.baseHex}
                        className="flex h-16 items-center justify-between gap-4 px-5 transition-[filter] hover:brightness-105"
                        style={{ background: swatchBg(g), color: g.onColor }}
                      >
                        <span className="min-w-0 truncate font-display text-lg">{g.name}</span>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] opacity-85">
                          Layer {layer}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-card shadow-[var(--shadow-pool)]"
              />
            </div>
            {glazes.length > 1 && (
              <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-slip">
                First dipped · bottom — Last dipped · top
              </p>
            )}
          </section>
        )}

        {(piece.firing?.length || piece.notes || piece.clayBody) && (
          <section className="mt-8 rounded-card border border-line bg-paper p-5">
            <h2 className="font-mono text-label font-medium uppercase text-slip">
              Firing &amp; notes
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {piece.clayBody && <MonoPill>{piece.clayBody}</MonoPill>}
              {piece.firing?.map((f) => (
                <MonoPill key={f}>{f}</MonoPill>
              ))}
            </div>
            {piece.notes && <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{piece.notes}</p>}
          </section>
        )}

        {primary && (
          <Link
            href={`/glazes/${primary.slug}`}
            className="mt-7 inline-flex items-center gap-1 text-sm font-semibold text-celadon hover:text-ink"
          >
            See more in {primary.name} <ChevronRight size={16} />
          </Link>
        )}
      </Container>

      {glazes.length > 0 && (
        <SpecStrip
          text={`${glazes.map((g) => g.name).join(" × ")} — Δ${primary.cone}`}
          className="text-clay-deep"
        />
      )}

      {isOwner && (
        <Container size="reading" className="pb-8">
          <PieceOwnerActions slug={piece.slug} />
        </Container>
      )}
    </div>
  );
}
