"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createStudio, updateStudio } from "@/lib/studio-actions";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import type { Studio } from "@/lib/types";

/** Create/edit form for a studio's info. Creation makes the caller its admin. */
export function StudioForm({ studio }: { studio?: Studio }) {
  const router = useRouter();
  const [name, setName] = useState(studio?.name ?? "");
  const [location, setLocation] = useState(studio?.location ?? "");
  const [established, setEstablished] = useState(
    studio?.established ? String(studio.established) : "",
  );
  const [description, setDescription] = useState(studio?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("location", location);
      fd.set("established", established);
      fd.set("description", description);
      const res = studio
        ? await updateStudio(studio.id, studio.slug, fd)
        : await createStudio(fd);
      if (res.ok) {
        router.push(`/studios/${res.slug}`);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {error && (
        <p className="rounded-md border border-error-line bg-error-bg px-4 py-2.5 text-sm text-error">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="studio-name" className="mb-1.5 block text-sm font-medium text-ink-2">
          Studio name
        </label>
        <Input
          id="studio-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="The Fine Line"
          maxLength={80}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_140px]">
        <div>
          <label htmlFor="studio-location" className="mb-1.5 block text-sm font-medium text-ink-2">
            Location
          </label>
          <Input
            id="studio-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="St. Charles, IL"
            maxLength={120}
          />
        </div>
        <div>
          <label htmlFor="studio-est" className="mb-1.5 block text-sm font-medium text-ink-2">
            Established
          </label>
          <Input
            id="studio-est"
            inputMode="numeric"
            pattern="[0-9]{4}"
            value={established}
            onChange={(e) => setEstablished(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="1979"
          />
        </div>
      </div>

      <div>
        <label htmlFor="studio-desc" className="mb-1.5 block text-sm font-medium text-ink-2">
          About the studio
        </label>
        <Textarea
          id="studio-desc"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What kind of work happens here, kilns, community…"
          maxLength={2000}
        />
      </div>

      <Button type="submit" size="lg" disabled={pending || name.trim().length < 2}>
        {pending ? "Saving…" : studio ? "Save changes" : "Create studio"}
      </Button>
      {!studio && (
        <p className="text-sm text-slip">
          You&rsquo;ll become this studio&rsquo;s admin — you can manage its glaze
          library and info.
        </p>
      )}
    </form>
  );
}
