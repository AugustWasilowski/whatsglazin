"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, X, Check } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Member, StudioRef } from "@/lib/types";

const GRAD = "linear-gradient(140deg,#C98A4E,#8C4A1E)";

function isPhoto(v?: string): v is string {
  return typeof v === "string" && /^https?:\/\//.test(v);
}
function initials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
}

export function ProfileEditor({
  member,
  email,
  studios = [],
}: {
  member: Member;
  email?: string;
  studios?: StudioRef[];
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  // Profile fields
  const [name, setName] = useState(member.name);
  const [disciplines, setDisciplines] = useState<string[]>(member.disciplines ?? []);
  const [disciplineDraft, setDisciplineDraft] = useState("");
  const [studioId, setStudioId] = useState(member.studioId ?? "");

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    isPhoto(member.avatar) ? member.avatar : null,
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const avatarInput = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  // Email change (Supabase Auth, client-side)
  const [newEmail, setNewEmail] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function pickAvatar(file: File | undefined) {
    if (!file) return;
    if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
    setSaved(false);
  }
  function clearAvatar() {
    if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
    setSaved(false);
  }

  function addDiscipline() {
    const d = disciplineDraft.trim();
    if (!d || disciplines.some((x) => x.toLowerCase() === d.toLowerCase()) || disciplines.length >= 8)
      return;
    setDisciplines((prev) => [...prev, d]);
    setDisciplineDraft("");
    setSaved(false);
  }
  function removeDiscipline(d: string) {
    setDisciplines((prev) => prev.filter((x) => x !== d));
    setSaved(false);
  }

  function saveProfile() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("disciplines", JSON.stringify(disciplines));
      fd.set("studioId", studioId);
      if (avatarFile) fd.append("avatar", avatarFile, avatarFile.name);
      if (removeAvatar) fd.set("removeAvatar", "1");

      const res = await updateProfile(fd);
      if (res.ok) {
        setSaved(true);
        setAvatarFile(null);
        setRemoveAvatar(false);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    const next = newEmail.trim();
    if (!next) return;
    setEmailBusy(true);
    setEmailMsg(null);
    const { error } = await supabase.auth.updateUser({ email: next });
    setEmailBusy(false);
    if (error) {
      setEmailMsg({ ok: false, text: error.message });
    } else {
      setEmailMsg({
        ok: true,
        text: `Check your inbox — we sent a confirmation link to ${next}. For security, you may also need to confirm from your current address.`,
      });
      setNewEmail("");
    }
  }

  return (
    <div className="mx-auto w-full max-w-[560px] px-5 py-8 sm:px-6">
      <h1 className="font-display text-4xl text-ink">Edit profile</h1>
      <p className="mt-1 text-slip">Your name, photo, and craft — plus your account email.</p>

      {error && (
        <p className="mt-4 rounded-md border border-error-line bg-error-bg px-4 py-2.5 text-sm text-error">
          {error}
        </p>
      )}

      {/* Avatar */}
      <div className="mt-7 flex items-center gap-5">
        <span className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full font-display text-2xl text-bone" style={{ background: GRAD }}>
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarPreview} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            initials(name || member.name)
          )}
        </span>
        <div className="flex flex-wrap gap-2">
          <input
            ref={avatarInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              pickAvatar(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => avatarInput.current?.click()}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-line-strong bg-bone px-4 text-sm font-semibold text-ink transition-colors hover:bg-clay/40"
          >
            <Camera size={15} /> {avatarPreview ? "Change photo" : "Upload photo"}
          </button>
          {avatarPreview && (
            <button
              type="button"
              onClick={clearAvatar}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-line-strong bg-bone px-4 text-sm font-semibold text-slip transition-colors hover:text-ink"
            >
              <X size={15} /> Remove
            </button>
          )}
        </div>
      </div>

      {/* Display name */}
      <div className="mt-7">
        <label htmlFor="display-name" className="mb-1.5 block text-sm font-medium text-ink-2">
          Display name
        </label>
        <Input
          inputSize="md"
          id="display-name"
          type="text"
          value={name}
          maxLength={60}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
        />
      </div>

      {/* Disciplines */}
      <div className="mt-6">
        <label htmlFor="discipline" className="mb-1.5 block text-sm font-medium text-ink-2">
          Disciplines
        </label>
        {disciplines.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {disciplines.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong bg-bone px-3 py-1 text-[13px] font-medium text-ink"
              >
                {d}
                <button
                  type="button"
                  onClick={() => removeDiscipline(d)}
                  aria-label={`Remove ${d}`}
                  className="-mr-1 grid h-4 w-4 place-items-center rounded-full bg-clay-deep text-[11px] leading-none text-ink-2"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            inputSize="md"
            id="discipline"
            type="text"
            value={disciplineDraft}
            maxLength={24}
            onChange={(e) => setDisciplineDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDiscipline();
              }
            }}
            placeholder="Wheel, Hand-building, Glaze chem…"
            className="flex-1"
          />
          <button
            type="button"
            onClick={addDiscipline}
            disabled={!disciplineDraft.trim() || disciplines.length >= 8}
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-line-strong bg-bone px-4 text-sm font-semibold text-ink transition-colors hover:bg-clay/40 disabled:opacity-50"
          >
            Add
          </button>
        </div>
        <p className="mt-1.5 text-xs text-slip">Up to 8. Press Enter to add.</p>
      </div>

      {/* Home studio */}
      <div className="mt-6">
        <label htmlFor="home-studio" className="mb-1.5 block text-sm font-medium text-ink-2">
          Home studio
        </label>
        <select
          id="home-studio"
          value={studioId}
          onChange={(e) => {
            setStudioId(e.target.value);
            setSaved(false);
          }}
          className="h-11 w-full rounded-md border-[1.5px] border-line-strong bg-bone px-3 text-[15px] text-ink focus:border-terracotta focus:outline-none focus:ring-[3px] focus:ring-terracotta/15"
        >
          <option value="">No studio — just me and my kiln</option>
          {studios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-slip">
          Optional — pre-fills your studio&rsquo;s glazes when you log a piece.
          Not listed?{" "}
          <Link href="/studios/new" className="underline underline-offset-2 hover:text-ink">
            Start a studio
          </Link>
          .
        </p>
      </div>

      <div className="sticky bottom-20 z-10 mt-7 md:bottom-4">
        <Button size="lg" onClick={saveProfile} disabled={pending} className="w-full">
          {pending ? "Saving…" : saved ? "Saved ✓" : "Save profile"}
        </Button>
      </div>

      {/* Account email */}
      <section className="mt-12 border-t border-line pt-7">
        <h2 className="font-display text-2xl text-ink">Account email</h2>
        <p className="mt-1 text-sm text-slip">
          You currently sign in as <strong className="text-ink-2">{email ?? "—"}</strong>.
        </p>

        {emailMsg && (
          <p
            className={`mt-4 rounded-md border px-4 py-2.5 text-sm ${
              emailMsg.ok
                ? "border-success-line bg-success-bg text-success"
                : "border-error-line bg-error-bg text-error"
            }`}
          >
            {emailMsg.ok && <Check size={14} className="mr-1 inline" />}
            {emailMsg.text}
          </p>
        )}

        <form onSubmit={changeEmail} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="new-email" className="sr-only">
            New email address
          </label>
          <Input
            inputSize="md"
            id="new-email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="new@email.com"
            className="flex-1"
          />
          <button
            type="submit"
            disabled={emailBusy || !newEmail.trim()}
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-line-strong bg-bone px-5 text-sm font-semibold text-ink transition-colors hover:bg-clay/40 disabled:opacity-60"
          >
            {emailBusy ? "Sending…" : "Update email"}
          </button>
        </form>
      </section>
    </div>
  );
}
