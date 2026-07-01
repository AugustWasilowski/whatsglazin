"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Camera, Plus, Check, ChevronDown } from "lucide-react";
import { GlazeTypeahead } from "./GlazeTypeahead";
import { Button, ButtonLink } from "@/components/ui/Button";
import { GlazeChip } from "@/components/ui/GlazeChip";
import { getGlaze } from "@/lib/glazes";
import type { Glaze } from "@/lib/types";

type Photo = { id: string; url: string; progress: number };
type Chip = { key: string; glaze?: Glaze; name: string };
type Step = "form" | "saving" | "success";

let uid = 0;
const nextId = () => `u${uid++}`;

export function AddPieceFlow({ glazes }: { glazes: Glaze[] }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [chips, setChips] = useState<Chip[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const fileInput = useRef<HTMLInputElement>(null);

  const selectedGlazeIds = chips.filter((c) => c.glaze).map((c) => c.glaze!.id);
  const canSubmit = photos.length > 0 && chips.length > 0 && photos.every((p) => p.progress >= 100);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const incoming: Photo[] = Array.from(files).map((f) => ({
      id: nextId(),
      url: URL.createObjectURL(f),
      progress: 0,
    }));
    setPhotos((prev) => [...prev, ...incoming]);
    // Simulate upload progress (real upload lands in Phase 5).
    incoming.forEach((p) => {
      const tick = setInterval(() => {
        setPhotos((prev) =>
          prev.map((x) =>
            x.id === p.id ? { ...x, progress: Math.min(100, x.progress + 25) } : x,
          ),
        );
      }, 180);
      setTimeout(() => clearInterval(tick), 900);
    });
  }

  function addGlaze(id: string) {
    const g = getGlaze(id);
    if (!g || chips.some((c) => c.key === id)) return;
    setChips((prev) => [...prev, { key: id, glaze: g, name: g.name }]);
  }
  function addNewGlaze(name: string) {
    const key = `new-${name.toLowerCase()}`;
    if (chips.some((c) => c.key === key)) return;
    setChips((prev) => [...prev, { key, name }]);
  }
  function removeChip(key: string) {
    setChips((prev) => prev.filter((c) => c.key !== key));
  }

  function submit() {
    setStep("saving");
    // Simulated save (Phase 5 = real insert + upload).
    setTimeout(() => setStep("success"), 1400);
  }

  function reset() {
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]);
    setChips([]);
    setShowAdvanced(false);
    setStep("form");
  }

  // ---------- SAVING ----------
  if (step === "saving") {
    return (
      <div className="grid min-h-[60vh] place-items-center px-6 text-center">
        <div>
          <div className="mx-auto h-12 w-12 animate-[wg-spin_0.8s_linear_infinite] rounded-full border-[3px] border-line-strong border-t-terracotta motion-reduce:animate-none" />
          <p className="mt-4 text-ink-2">Saving to the studio…</p>
        </div>
      </div>
    );
  }

  // ---------- SUCCESS ----------
  if (step === "success") {
    const names = chips.map((c) => c.name).join(" + ");
    return (
      <div className="grid min-h-[60vh] place-items-center px-6 text-center">
        <div className="max-w-sm">
          <div className="mx-auto grid h-[88px] w-[88px] animate-[wg-pop_0.4s_cubic-bezier(0.16,1,0.3,1)_both] place-items-center rounded-full bg-success-bg text-success motion-reduce:animate-none">
            <Check size={44} strokeWidth={2.6} />
          </div>
          <h1 className="mt-6 font-display text-3xl text-ink">It&rsquo;s in the studio.</h1>
          <p className="mt-2 text-ink-2">Now searchable by {names}.</p>
          <div className="mt-7 flex flex-col gap-3">
            <ButtonLink href="/gallery" size="lg">See it in the gallery</ButtonLink>
            <Button variant="secondary" size="lg" onClick={reset}>
              Add another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- FORM ----------
  return (
    <div className="mx-auto w-full max-w-[560px] px-5 py-8 sm:px-6">
      <h1 className="font-display text-4xl text-ink">Add a piece</h1>
      <p className="mt-1 text-slip">Photo → glaze → done.</p>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {/* Dropzone / photos */}
      {photos.length === 0 ? (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="mt-6 flex w-full flex-col items-center gap-2 rounded-card border-2 border-dashed border-[#C9B48F] bg-bone px-6 py-12 text-center transition-colors hover:bg-clay/40"
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
            <div key={p.id} className="relative h-24 w-24 overflow-hidden rounded-md border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="h-full w-full object-cover" />
              {p.progress < 100 && (
                <div className="absolute inset-0 grid place-items-center bg-ink/40 font-mono text-xs text-bone">
                  {p.progress}%
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="grid h-24 w-24 place-items-center rounded-md border-2 border-dashed border-[#C9B48F] text-slip hover:bg-clay/40"
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
                <GlazeChip key={c.key} glaze={c.glaze} onRemove={() => removeChip(c.key)} />
              ) : (
                <span
                  key={c.key}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-dashed border-terracotta bg-clay-deep px-3 py-1 text-[13px] font-semibold text-terracotta"
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
          <ChevronDown
            size={18}
            className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}
          />
        </button>
        {showAdvanced && (
          <div className="grid gap-3 px-4 pb-4">
            <Field label="Title" placeholder="Everyday bowl" />
            <Field label="Clay body" placeholder="Stoneware" />
            <Field label="Firing" placeholder="Cone 10 · reduction" />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-2">Notes</label>
              <textarea
                rows={3}
                placeholder="How you glazed it, what happened in the kiln…"
                className="w-full rounded-md border-[1.5px] border-line-strong bg-bone px-3 py-2 text-[15px] text-ink placeholder:text-slip focus:border-terracotta focus:outline-none focus:ring-[3px] focus:ring-terracotta/15"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sticky submit */}
      <div className="sticky bottom-20 z-10 mt-6 md:bottom-4">
        <Button
          size="lg"
          onClick={submit}
          disabled={!canSubmit}
          className="min-h-[52px] w-full"
        >
          {photos.length > 0 && !photos.every((p) => p.progress >= 100)
            ? "Uploading photos…"
            : "Add this piece"}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-2">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        className="h-11 w-full rounded-md border-[1.5px] border-line-strong bg-bone px-3 text-[15px] text-ink placeholder:text-slip focus:border-terracotta focus:outline-none focus:ring-[3px] focus:ring-terracotta/15"
      />
    </div>
  );
}
