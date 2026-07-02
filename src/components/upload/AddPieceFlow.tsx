"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Plus, Check, ChevronDown, X } from "lucide-react";
import { GlazeTypeahead } from "./GlazeTypeahead";
import { Button, ButtonLink } from "@/components/ui/Button";
import { GlazeChip } from "@/components/ui/GlazeChip";
import { Input, Textarea } from "@/components/ui/Input";
import { createPiece, updatePiece } from "@/lib/actions";
import type { EnrichedPiece, Glaze } from "@/lib/types";

// Existing photos have a real URL and no File; new ones carry the File to upload.
type Photo = { id: string; url: string; file?: File };
type Chip = { key: string; glaze?: Glaze; name: string };
type Step = "form" | "saving" | "success";

let uid = 0;
const nextId = () => `u${uid++}`;

/**
 * Add or edit a piece. In "edit" mode it's pre-filled from `initial` and submits
 * to updatePiece; otherwise it creates a new piece.
 */
export function AddPieceFlow({
  glazes,
  mode = "create",
  initial,
}: {
  glazes: Glaze[];
  mode?: "create" | "edit";
  initial?: EnrichedPiece;
}) {
  const isEdit = mode === "edit";

  const [photos, setPhotos] = useState<Photo[]>(() =>
    isEdit && initial
      ? initial.photos
          .filter((p) => p.url)
          .map((p) => ({ id: nextId(), url: p.url as string }))
      : [],
  );
  const [chips, setChips] = useState<Chip[]>(() =>
    isEdit && initial
      ? initial.glazes.map((g) => ({ key: g.id, glaze: g, name: g.name }))
      : [],
  );
  const [showAdvanced, setShowAdvanced] = useState(isEdit);
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  // Optional details
  const [title, setTitle] = useState(initial?.title ?? "");
  const [form, setForm] = useState(isEdit ? initial?.form ?? "" : "");
  const [clayBody, setClayBody] = useState(initial?.clayBody ?? "");
  const [firing, setFiring] = useState(initial?.firing?.join(" · ") ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const fileInput = useRef<HTMLInputElement>(null);
  const selectedGlazeIds = chips.filter((c) => c.glaze).map((c) => c.glaze!.id);
  const canSubmit = photos.length > 0 && chips.length > 0;

  // Warn before losing unsaved work on reload / close / hard navigation.
  useEffect(() => {
    if (!dirty || step !== "form") return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, step]);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const incoming: Photo[] = Array.from(files).map((f) => ({
      id: nextId(),
      url: URL.createObjectURL(f),
      file: f,
    }));
    setPhotos((prev) => [...prev, ...incoming]);
    setDirty(true);
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const gone = prev.find((p) => p.id === id);
      if (gone?.file) URL.revokeObjectURL(gone.url); // only new (blob) URLs
      return prev.filter((p) => p.id !== id);
    });
    setDirty(true);
  }

  function addGlaze(id: string) {
    const g = glazes.find((x) => x.id === id);
    if (!g || chips.some((c) => c.key === id)) return;
    setChips((prev) => [...prev, { key: id, glaze: g, name: g.name }]);
    setDirty(true);
  }
  function addNewGlaze(name: string) {
    const key = `new-${name.toLowerCase()}`;
    if (chips.some((c) => c.key === key)) return;
    setChips((prev) => [...prev, { key, name }]);
    setDirty(true);
  }
  function removeChip(key: string) {
    setChips((prev) => prev.filter((c) => c.key !== key));
    setDirty(true);
  }

  async function submit() {
    setError(null);
    setStep("saving");
    const fd = new FormData();
    fd.set("title", title);
    fd.set("form", form);
    fd.set("clayBody", clayBody);
    fd.set("firing", firing);
    fd.set("notes", notes);
    fd.set(
      "glazes",
      JSON.stringify(chips.map((c) => (c.glaze ? { id: c.glaze.id } : { newName: c.name }))),
    );

    if (isEdit) {
      // Send the final ordered photo list; append only the new files, in order.
      const order = photos.map((p) => (p.file ? { new: true } : { keep: p.url }));
      fd.set("photoOrder", JSON.stringify(order));
      photos.forEach((p) => p.file && fd.append("photos", p.file, p.file.name));
    } else {
      photos.forEach((p) => p.file && fd.append("photos", p.file, p.file.name));
    }

    const res =
      isEdit && initial ? await updatePiece(initial.slug, fd) : await createPiece(fd);

    if (res.ok) {
      setDirty(false);
      setSavedSlug(res.slug);
      setStep("success");
    } else {
      setError(res.error);
      setStep("form");
    }
  }

  function reset() {
    photos.forEach((p) => p.file && URL.revokeObjectURL(p.url));
    setPhotos([]);
    setChips([]);
    setShowAdvanced(false);
    setTitle("");
    setForm("");
    setClayBody("");
    setFiring("");
    setNotes("");
    setSavedSlug(null);
    setDirty(false);
    setStep("form");
  }

  // ---------- SAVING ----------
  if (step === "saving") {
    return (
      <div className="grid min-h-[60vh] place-items-center px-6 text-center">
        <div>
          <div className="mx-auto h-12 w-12 animate-[wg-spin_0.8s_linear_infinite] rounded-full border-[3px] border-line-strong border-t-terracotta motion-reduce:animate-none" />
          <p className="mt-4 text-ink-2">
            {isEdit ? "Saving your changes…" : "Saving to the studio…"}
          </p>
        </div>
      </div>
    );
  }

  // ---------- SUCCESS ----------
  if (step === "success") {
    const names = chips.map((c) => c.name).join(" + ");
    const dripColors = chips
      .map((c) => c.glaze?.baseHex ?? "#b0552f")
      .slice(0, 5);
    return (
      <div className="grid min-h-[60vh] place-items-center px-6 text-center">
        <div className="max-w-sm">
          {/* the glazes you just logged, dripping in */}
          <div aria-hidden className="mb-3 flex h-8 items-start justify-center gap-3">
            {dripColors.map((c, i) => (
              <span
                key={i}
                className="h-6 w-2.5 rounded-b-full animate-[wg-drip_0.7s_cubic-bezier(0.5,0,0.6,1)_both] motion-reduce:hidden"
                style={{ background: c, animationDelay: `${0.2 + i * 0.13}s` }}
              />
            ))}
          </div>
          <div className="mx-auto grid h-[88px] w-[88px] animate-[wg-pop_0.4s_cubic-bezier(0.16,1,0.3,1)_both] place-items-center rounded-full bg-success-bg text-success shadow-[var(--shadow-pool)] motion-reduce:animate-none">
            <Check size={44} strokeWidth={2.6} />
          </div>
          <h1 className="mt-6 font-display text-3xl text-ink">
            {isEdit ? "Changes saved." : "It’s in the studio."}
          </h1>
          <p className="mt-2 text-ink-2">
            {isEdit ? "Your piece is updated." : `Now searchable by ${names}.`}
          </p>
          <div className="mt-7 flex flex-col gap-3">
            <ButtonLink href={savedSlug ? `/pieces/${savedSlug}` : "/gallery"} size="lg">
              See your piece
            </ButtonLink>
            {!isEdit && (
              <Button variant="secondary" size="lg" onClick={reset}>
                Add another
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- FORM ----------
  return (
    <div className="mx-auto w-full max-w-[560px] px-5 py-8 sm:px-6">
      <p className="font-mono text-label font-medium uppercase text-terracotta">
        {isEdit ? "The kiln log" : "Straight off the shelf"}
      </p>
      <h1 className="mt-2 font-display text-4xl text-ink">
        {isEdit ? "Edit piece" : "Add a piece"}
      </h1>
      <p className="mt-1 text-slip">
        {isEdit ? "Update the photos, glazes, or details." : "Photo → glaze → done."}
      </p>

      {error && (
        <p className="mt-4 rounded-md border border-error-line bg-error-bg px-4 py-2.5 text-sm text-error">
          {error}
        </p>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = ""; // allow re-picking the same file after a remove
        }}
      />

      {/* Dropzone / photos */}
      {photos.length === 0 ? (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="mt-6 flex w-full flex-col items-center gap-2 rounded-card border-2 border-dashed border-sand bg-bone px-6 py-12 text-center transition-colors hover:bg-clay/40"
        >
          <span className="grid h-[50px] w-[50px] place-items-center rounded-md bg-clay-deep text-terracotta">
            <Camera size={26} />
          </span>
          <span className="mt-1 font-semibold text-ink">Tap to shoot or pick</span>
          <span className="text-sm text-slip">Add multiple angles · JPG, HEIC, PNG</span>
        </button>
      ) : (
        <div className="mt-6 flex flex-wrap gap-3">
          {photos.map((p) => (
            <div
              key={p.id}
              className="group relative h-24 w-24 overflow-hidden rounded-md border border-line"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(p.id)}
                aria-label="Remove photo"
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/70 text-bone backdrop-blur-sm transition-colors hover:bg-ink"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="grid h-24 w-24 place-items-center rounded-md border-2 border-dashed border-sand text-slip hover:bg-clay/40"
            aria-label="Add another angle"
          >
            <Plus size={22} />
          </button>
        </div>
      )}

      {/* Glaze type-ahead */}
      <div className="mt-6">
        <GlazeTypeahead
          glazes={glazes}
          selectedIds={selectedGlazeIds}
          onAdd={addGlaze}
          onAddNew={addNewGlaze}
        />
      </div>

      {/* Selected combination */}
      {chips.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {chips.map((c) =>
              c.glaze ? (
                <GlazeChip
                  key={c.key}
                  glaze={c.glaze}
                  onRemove={() => removeChip(c.key)}
                  className="animate-[wg-pop_0.22s_ease-out_both] motion-reduce:animate-none"
                />
              ) : (
                <span
                  key={c.key}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-dashed border-terracotta bg-clay-deep px-3 py-1 text-[13px] font-semibold text-terracotta animate-[wg-pop_0.22s_ease-out_both] motion-reduce:animate-none"
                >
                  {c.name}
                  <button
                    type="button"
                    onClick={() => removeChip(c.key)}
                    aria-label={`Remove ${c.name}`}
                    className="-mr-1 grid h-4 w-4 place-items-center rounded-full bg-terracotta/15 text-[11px] leading-none"
                  >
                    ×
                  </button>
                </span>
              ),
            )}
          </div>
          {chips.length > 1 && <p className="mt-2 text-xs text-slip">Order is kept.</p>}
        </div>
      )}

      {/* Optional details */}
      <div className="mt-6 rounded-card border border-line bg-bone">
        <button
          type="button"
          onClick={() => setShowAdvanced((s) => !s)}
          aria-expanded={showAdvanced}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-ink-2"
        >
          Optional details
          <ChevronDown size={18} className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
        </button>
        {showAdvanced && (
          <div className="grid gap-3 px-4 pb-4">
            <Field label="Title" placeholder="Everyday bowl" value={title} onChange={(v) => { setTitle(v); setDirty(true); }} />
            <Field label="Form" placeholder="Tumbler, Bowl, Vase…" value={form} onChange={(v) => { setForm(v); setDirty(true); }} />
            <Field label="Clay body" placeholder="Stoneware" value={clayBody} onChange={(v) => { setClayBody(v); setDirty(true); }} />
            <Field label="Firing" placeholder="Cone 6 · oxidation" value={firing} onChange={(v) => { setFiring(v); setDirty(true); }} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-2">Notes</label>
              <Textarea
                rows={3}
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setDirty(true); }}
                placeholder="How you glazed it, what happened in the kiln…"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sticky submit */}
      <div className="sticky bottom-20 z-10 mt-6 md:bottom-4">
        <Button size="lg" onClick={submit} disabled={!canSubmit} className="min-h-[52px] w-full">
          {isEdit ? "Save changes" : "Add this piece"}
        </Button>
        {!canSubmit && (
          <p className="mt-2 text-center text-xs text-slip">
            {photos.length === 0
              ? "Add at least one photo to continue."
              : "Add at least one glaze to continue."}
          </p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-2">{label}</label>
      <Input
        inputSize="md"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
