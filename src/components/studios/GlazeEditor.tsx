"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createStudioGlaze, updateGlaze, deleteGlaze } from "@/lib/studio-actions";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { glazeFill } from "@/lib/glazes";
import type { Glaze, GlazeFinish } from "@/lib/types";

const FINISHES: GlazeFinish[] = ["satin", "glossy", "matte", "runny", "dry matte", "metallic"];

/** Create a studio glaze, or edit any glaze the viewer is allowed to touch.
 *  Live "test tile" preview mirrors the hex fields. */
export function GlazeEditor({
  studioId,
  studioSlug,
  glaze,
}: {
  /** Present in create mode: which studio's library the glaze joins. */
  studioId?: string;
  studioSlug?: string;
  /** Present in edit mode. */
  glaze?: Glaze;
}) {
  const router = useRouter();
  const [name, setName] = useState(glaze?.name ?? "");
  const [family, setFamily] = useState(glaze?.family ?? "");
  const [cone, setCone] = useState(String(glaze?.cone ?? 6));
  const [finish, setFinish] = useState<GlazeFinish>(glaze?.finish ?? "satin");
  const [baseHex, setBaseHex] = useState(glaze?.baseHex ?? "#B0552F");
  const [shade2Hex, setShade2Hex] = useState(glaze?.shade2Hex ?? "#8A3D1E");
  const [onColor, setOnColor] = useState(glaze?.onColor ?? "#FBF7EE");
  const [chemistry, setChemistry] = useState(glaze?.chemistry ?? "");
  const [description, setDescription] = useState(glaze?.description ?? "");
  const [recipe, setRecipe] = useState(glaze?.recipe ?? "");
  const [glazyUrl, setGlazyUrl] = useState(glaze?.glazyUrl ?? "");

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("family", family);
      fd.set("cone", cone);
      fd.set("finish", finish);
      fd.set("baseHex", baseHex.trim());
      fd.set("shade2Hex", shade2Hex.trim());
      fd.set("onColor", onColor.trim());
      fd.set("chemistry", chemistry);
      fd.set("description", description);
      fd.set("recipe", recipe);
      fd.set("glazyUrl", glazyUrl);

      const res = glaze
        ? await updateGlaze(glaze.slug, fd)
        : await createStudioGlaze(studioId!, studioSlug!, fd);
      if (res.ok) {
        router.push(`/glazes/${res.slug}`);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function remove() {
    if (!glaze) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteGlaze(glaze.slug);
      if (res.ok) {
        router.push(glaze.studioId && studioSlug ? `/studios/${studioSlug}` : "/glazes");
        router.refresh();
      } else {
        setError(res.error);
        setConfirmingDelete(false);
      }
    });
  }

  const hexInput = (
    label: string,
    id: string,
    value: string,
    set: (v: string) => void,
  ) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-2">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#B0552F"}
          onChange={(e) => set(e.target.value)}
          className="h-11 w-11 shrink-0 cursor-pointer rounded-md border border-line-strong bg-bone p-1"
        />
        <Input
          id={id}
          inputSize="md"
          value={value}
          onChange={(e) => set(e.target.value)}
          placeholder="#B0552F"
          maxLength={7}
          className="font-mono"
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {error && (
        <p className="rounded-md border border-error-line bg-error-bg px-4 py-2.5 text-sm text-error">
          {error}
        </p>
      )}

      {/* Live test tile */}
      <div
        className="rounded-arch relative mx-auto aspect-[3/4] w-40 shadow-[var(--shadow-card),var(--shadow-pool)]"
        style={{ background: glazeFill(baseHex, shade2Hex) }}
        aria-hidden
      >
        <span
          className="absolute inset-x-0 top-4 text-center font-mono text-[10px] uppercase tracking-wider"
          style={{ color: onColor }}
        >
          {finish} · Δ{cone || "6"}
        </span>
      </div>

      <div>
        <label htmlFor="glaze-name" className="mb-1.5 block text-sm font-medium text-ink-2">
          Glaze name
        </label>
        <Input
          id="glaze-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Floating Blue"
          maxLength={60}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="glaze-family" className="mb-1.5 block text-sm font-medium text-ink-2">
            Family
          </label>
          <Input
            id="glaze-family"
            inputSize="md"
            value={family}
            onChange={(e) => setFamily(e.target.value)}
            placeholder="Blue, Iron, White…"
            maxLength={40}
          />
        </div>
        <div>
          <label htmlFor="glaze-cone" className="mb-1.5 block text-sm font-medium text-ink-2">
            Cone
          </label>
          <Input
            id="glaze-cone"
            inputSize="md"
            inputMode="numeric"
            value={cone}
            onChange={(e) => setCone(e.target.value.replace(/\D/g, "").slice(0, 2))}
            placeholder="6"
          />
        </div>
        <div>
          <label htmlFor="glaze-finish" className="mb-1.5 block text-sm font-medium text-ink-2">
            Finish
          </label>
          <select
            id="glaze-finish"
            value={finish}
            onChange={(e) => setFinish(e.target.value as GlazeFinish)}
            className="h-11 w-full rounded-md border-[1.5px] border-line-strong bg-bone px-3 text-[15px] text-ink focus:border-terracotta focus:outline-none focus:ring-[3px] focus:ring-terracotta/15"
          >
            {FINISHES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {hexInput("Base color", "glaze-base", baseHex, setBaseHex)}
        {hexInput("Shade color", "glaze-shade", shade2Hex, setShade2Hex)}
        {hexInput("Text color", "glaze-on", onColor, setOnColor)}
      </div>

      <div>
        <label htmlFor="glaze-chem" className="mb-1.5 block text-sm font-medium text-ink-2">
          Chemistry note
        </label>
        <Input
          id="glaze-chem"
          inputSize="md"
          value={chemistry}
          onChange={(e) => setChemistry(e.target.value)}
          placeholder="Rutile · Co · floats"
          maxLength={80}
        />
      </div>

      <div>
        <label htmlFor="glaze-desc" className="mb-1.5 block text-sm font-medium text-ink-2">
          Description
        </label>
        <Textarea
          id="glaze-desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="How it behaves — where it breaks, pools, runs…"
          maxLength={2000}
        />
      </div>

      <div>
        <label htmlFor="glaze-recipe" className="mb-1.5 block text-sm font-medium text-ink-2">
          Recipe
        </label>
        <Textarea
          id="glaze-recipe"
          rows={8}
          value={recipe}
          onChange={(e) => setRecipe(e.target.value)}
          placeholder={"Custer feldspar\t38\nSilica\t28\nWhiting\t20\nEPK\t14\n\nAdd: Rutile 4 · Cobalt carbonate 1"}
          maxLength={8000}
          className="font-mono text-[13px] leading-relaxed"
        />
        <p className="mt-1.5 text-xs text-slip">
          Freeform — write it the way your studio writes it.
        </p>
      </div>

      <div>
        <label htmlFor="glaze-glazy" className="mb-1.5 block text-sm font-medium text-ink-2">
          Glazy.org link
        </label>
        <Input
          id="glaze-glazy"
          inputSize="md"
          type="url"
          value={glazyUrl}
          onChange={(e) => setGlazyUrl(e.target.value)}
          placeholder="https://glazy.org/recipes/…"
          maxLength={300}
        />
      </div>

      <Button type="submit" size="lg" disabled={pending || name.trim().length < 2}>
        {pending ? "Saving…" : glaze ? "Save glaze" : "Add to the glaze board"}
      </Button>

      {glaze &&
        (confirmingDelete ? (
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-ink-2">Remove this glaze for good?</span>
            <Button type="button" variant="danger" onClick={remove} disabled={pending}>
              Yes, remove it
            </Button>
            <Button type="button" variant="ghost" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="mx-auto text-sm font-medium text-slip underline underline-offset-4 transition-colors hover:text-error"
          >
            Remove this glaze
          </button>
        ))}
    </form>
  );
}
