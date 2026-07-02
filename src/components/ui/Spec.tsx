import { cn } from "@/lib/utils";

/**
 * "Lab specimen" typography — the catalog's mono labeling system.
 * SpecLabel = eyebrow, MonoPill = metadata tag, SpecTable = hairline data card.
 */

/** Mono uppercase eyebrow above headings. */
export function SpecLabel({
  className,
  children,
  as: Tag = "p",
}: {
  className?: string;
  children: React.ReactNode;
  as?: "p" | "span" | "div";
}) {
  return (
    <Tag
      className={cn(
        "font-mono text-label font-medium uppercase text-terracotta",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Small mono metadata pill (clay body, firing, form…). */
export function MonoPill({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border border-line-strong bg-bone px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-2",
        className,
      )}
    >
      {children}
    </span>
  );
}

export type SpecRow = {
  label: string;
  value: React.ReactNode;
};

/** Hairline-ruled specimen data card: mono labels, serif values. */
export function SpecTable({
  rows,
  className,
}: {
  rows: SpecRow[];
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "divide-y divide-line rounded-card border border-line bg-bone",
        className,
      )}
    >
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-baseline justify-between gap-6 px-5 py-3.5"
        >
          <dt className="shrink-0 font-mono text-label uppercase text-slip">
            {row.label}
          </dt>
          <dd className="text-right font-display text-[17px] leading-snug text-ink">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
