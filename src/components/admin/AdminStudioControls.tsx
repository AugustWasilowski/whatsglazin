"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setStudioActive, removeStudioAdmin } from "@/lib/studio-actions";
import type { Member, Studio } from "@/lib/types";

/** Site-admin moderation row controls: (de)activate a studio, demote admins. */
export function AdminStudioControls({
  studio,
  admins,
}: {
  studio: Studio;
  admins: Member[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggleActive() {
    setError(null);
    startTransition(async () => {
      const res = await setStudioActive(studio.id, !studio.isActive);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  function demote(memberId: string) {
    setError(null);
    startTransition(async () => {
      const res = await removeStudioAdmin(studio.id, memberId);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {error && <span className="w-full text-xs text-error">{error}</span>}
      {admins.map((a) => (
        <button
          key={a.id}
          type="button"
          disabled={pending}
          onClick={() => demote(a.id)}
          title={`Remove ${a.name} as admin`}
          className="inline-flex items-center gap-1 rounded-pill border border-line-strong bg-bone px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-2 transition-colors hover:border-error hover:text-error disabled:opacity-50"
        >
          {a.name} ×
        </button>
      ))}
      <button
        type="button"
        disabled={pending}
        onClick={toggleActive}
        className={`inline-flex items-center rounded-pill border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50 ${
          studio.isActive
            ? "border-error-line bg-error-bg text-error hover:border-error"
            : "border-success-line bg-success-bg text-success"
        }`}
      >
        {pending ? "…" : studio.isActive ? "Deactivate" : "Reactivate"}
      </button>
    </div>
  );
}
