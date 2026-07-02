import { cn } from "@/lib/utils";

/** Dashed "nothing on the shelf yet" card. */
export function EmptyState({
  title,
  children,
  action,
  className,
}: {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-dashed border-line-strong bg-bone/60 p-10 text-center",
        className,
      )}
    >
      <p className="font-display text-2xl text-ink">{title}</p>
      {children ? <p className="mt-2 text-sm text-slip">{children}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
