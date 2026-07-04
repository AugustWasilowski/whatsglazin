import type { Metadata } from "next";
import Link from "next/link";
import { requireSiteAdmin } from "@/lib/auth";
import {
  getAdminStats,
  getPageViews,
  getPieceDates,
  getStudios,
  getStudioAdmins,
  getGlazes,
  getPieces,
} from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { SpecLabel } from "@/components/ui/Spec";
import { HeadlineReveal } from "@/components/motion/HeadlineReveal";
import { AdminStudioControls } from "@/components/admin/AdminStudioControls";

export const metadata: Metadata = { title: "Site admin", robots: { index: false } };

/** Weekly buckets for the uploads chart (last 12 weeks). */
function weeklyBuckets(dates: string[], weeks = 12): { label: string; count: number }[] {
  const WEEK = 7 * 86_400_000;
  const now = Date.now();
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const start = now - (weeks - i) * WEEK;
    return { start, end: start + WEEK, count: 0 };
  });
  for (const d of dates) {
    const t = new Date(d).getTime();
    const b = buckets.find((x) => t >= x.start && t < x.end);
    if (b) b.count += 1;
  }
  return buckets.map((b) => ({
    label: new Date(b.start).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count: b.count,
  }));
}

/** Simple mono/terracotta CSS bar chart — no chart library. */
function Bars({ data, unit }: { data: { label: string; count: number }[]; unit: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex h-36 items-end gap-1.5">
      {data.map((d, i) => (
        <div key={i} className="group flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <span className="font-mono text-[10px] text-slip opacity-0 transition-opacity group-hover:opacity-100">
            {d.count}
          </span>
          <div
            className="w-full rounded-t-[3px] bg-terracotta/80 transition-colors group-hover:bg-terracotta"
            style={{ height: `${Math.max(d.count > 0 ? 6 : 2, (d.count / max) * 100)}%` }}
            title={`${d.label}: ${d.count} ${unit}`}
          />
          <span className="w-full truncate text-center font-mono text-[9px] uppercase text-slip">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default async function AdminPage() {
  await requireSiteAdmin(); // 404 for everyone else; RLS enforces underneath.

  const [stats, pageViews, pieceDates, studios, glazes, pieces] = await Promise.all([
    getAdminStats(),
    getPageViews(30),
    getPieceDates(),
    getStudios(true),
    getGlazes(),
    getPieces(),
  ]);

  // Page views: daily totals + top paths.
  const byDay = new Map<string, number>();
  const byPath = new Map<string, number>();
  for (const v of pageViews) {
    byDay.set(v.day, (byDay.get(v.day) ?? 0) + v.count);
    byPath.set(v.path, (byPath.get(v.path) ?? 0) + v.count);
  }
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    return {
      label: d.toLocaleDateString("en-US", { day: "numeric" }),
      count: byDay.get(key) ?? 0,
    };
  });
  const topPaths = [...byPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const totalViews = pageViews.reduce((s, v) => s + v.count, 0);

  const statCards = [
    { label: "Members", value: stats.members },
    { label: "Studios", value: stats.studios },
    { label: "Pieces", value: stats.pieces },
    { label: "Glazes", value: stats.glazes },
    { label: "Studio admins", value: stats.studioAdmins },
    { label: "Views · 30d", value: totalViews },
  ];

  const adminsByStudio = new Map(
    await Promise.all(
      studios.map(async (s) => [s.id, await getStudioAdmins(s.id)] as const),
    ),
  );

  return (
    <Container className="py-8 sm:py-10">
      <SpecLabel>Kiln control panel</SpecLabel>
      <HeadlineReveal as="h1" className="mt-3 font-display text-display-xl text-ink">
        Site admin
      </HeadlineReveal>

      {/* ---- Totals ---- */}
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-card border border-line bg-bone p-4 shadow-[var(--shadow-card)]"
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-slip">{s.label}</p>
            <p className="mt-1 font-display text-4xl text-ink">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ---- Traffic ---- */}
      <section className="mt-14">
        <h2 className="font-mono text-label font-medium uppercase text-terracotta">
          Page views · last 30 days
        </h2>
        {totalViews === 0 ? (
          <p className="mt-4 text-sm text-slip">
            No views recorded yet — counting starts with this deploy.
          </p>
        ) : (
          <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <Bars data={days} unit="views" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slip">Top pages</p>
              <ul className="mt-2 divide-y divide-line border-y border-line">
                {topPaths.map(([path, count]) => (
                  <li key={path} className="flex items-baseline justify-between gap-4 py-2">
                    <span className="truncate font-mono text-[12px] text-ink-2">{path}</span>
                    <span className="font-display text-lg text-ink">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* ---- Uploads over time ---- */}
      <section className="mt-14">
        <h2 className="font-mono text-label font-medium uppercase text-terracotta">
          Pieces logged · last 12 weeks
        </h2>
        <div className="mt-6 max-w-3xl">
          <Bars data={weeklyBuckets(pieceDates)} unit="pieces" />
        </div>
      </section>

      {/* ---- Studios ---- */}
      <section className="mt-14">
        <h2 className="font-mono text-label font-medium uppercase text-terracotta">
          Studios &amp; their admins
        </h2>
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {studios.map((s) => {
            const admins = adminsByStudio.get(s.id) ?? [];
            const glazeCount = glazes.filter((g) => g.studioId === s.id).length;
            const pieceCount = pieces.filter((p) => p.studioId === s.id).length;
            return (
              <li
                key={s.id}
                className="flex flex-wrap items-center gap-x-6 gap-y-3 px-2 py-5 sm:px-4"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/studios/${s.slug}`}
                    data-cursor="link"
                    className={`font-display text-xl transition-colors hover:text-terracotta ${
                      s.isActive ? "text-ink" : "text-slip line-through"
                    }`}
                  >
                    {s.name}
                  </Link>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slip">
                    {[s.location, `${glazeCount} glazes`, `${pieceCount} pieces`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <AdminStudioControls studio={s} admins={admins} />
              </li>
            );
          })}
        </ul>
      </section>
    </Container>
  );
}
