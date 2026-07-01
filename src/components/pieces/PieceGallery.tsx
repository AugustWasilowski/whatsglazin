"use client";

import { useState } from "react";
import Image from "next/image";

type Photo = { url: string | null; alt?: string; blurDataURL?: string };

/**
 * The piece hero: a main photo plus a row of thumbnails that switch it.
 * Thumbnails are real buttons — focusable and keyboard-operable. The
 * `overlay` slot (the back button) renders inside the same positioned box.
 */
export function PieceGallery({
  photos,
  fill,
  form,
  alt,
  overlay,
}: {
  photos: Photo[];
  fill: string;
  form: string;
  alt: string;
  overlay?: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const current = photos[active] ?? photos[0];

  return (
    <div className="relative h-[340px] w-full" style={{ background: fill }}>
      {current?.url && (
        <Image
          src={current.url}
          alt={current.alt ?? alt}
          fill
          sizes="100vw"
          className="object-cover"
          placeholder={current.blurDataURL ? "blur" : "empty"}
          blurDataURL={current.blurDataURL}
          priority
        />
      )}

      {overlay}

      <span className="absolute right-4 top-4 rounded-pill bg-ink/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-bone backdrop-blur-sm">
        Photo {active + 1} / {photos.length} · {form}
      </span>

      {photos.length > 1 && (
        <div className="absolute bottom-4 left-4 flex gap-2">
          {photos.map((ph, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1} of ${photos.length}`}
              aria-current={i === active}
              className={`relative h-11 w-11 overflow-hidden rounded-md border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bone ${
                i === active ? "border-bone" : "border-bone/40 hover:border-bone/70"
              }`}
              style={{ background: fill }}
            >
              {ph.url && (
                <Image src={ph.url} alt="" fill sizes="44px" className="object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
