"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { deletePiece } from "@/lib/actions";

/** Edit + Delete controls shown on a piece detail page to its maker only. */
export function PieceOwnerActions({ slug }: { slug: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deletePiece(slug);
      if (res.ok) {
        router.push("/you");
        router.refresh();
      } else {
        setError(res.error);
        setConfirming(false);
      }
    });
  }

  return (
    <section className="mt-8 border-t border-line pt-5">
      {error && (
        <p className="mb-3 rounded-md border border-error-line bg-error-bg px-4 py-2.5 text-sm text-error">
          {error}
        </p>
      )}

      {confirming ? (
        <div className="rounded-card border border-error-line bg-error-bg/40 p-4">
          <p className="text-sm font-medium text-ink">Delete this piece for good?</p>
          <p className="mt-1 text-sm text-slip">
            Its photos and glaze record will be removed. This can’t be undone.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="inline-flex min-h-[40px] items-center justify-center rounded-md bg-error px-4 text-sm font-semibold text-on-terracotta transition-colors hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Deleting…" : "Delete permanently"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-line-strong bg-bone px-4 text-sm font-semibold text-ink transition-colors hover:bg-clay/40 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/pieces/${slug}/edit`}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-line-strong bg-bone px-4 text-sm font-semibold text-ink transition-colors hover:bg-clay/40"
          >
            <Pencil size={15} /> Edit
          </Link>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-error-line bg-bone px-4 text-sm font-semibold text-error transition-colors hover:bg-error-bg/60"
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      )}
    </section>
  );
}
