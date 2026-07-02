"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
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
            <Button variant="danger" onClick={onDelete} disabled={pending}>
              {pending ? "Deleting…" : "Delete permanently"}
            </Button>
            <Button variant="secondary" onClick={() => setConfirming(false)} disabled={pending}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <ButtonLink variant="secondary" href={`/pieces/${slug}/edit`}>
            <Pencil size={15} /> Edit
          </ButtonLink>
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
