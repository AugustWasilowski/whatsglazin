"use client";

import { useId, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { swatchBg } from "@/lib/glazes";
import type { Glaze } from "@/lib/types";

/**
 * Accessible glaze type-ahead (ARIA combobox).
 * Suggests existing studio glazes as you type; offers a "New glaze" row only
 * when nothing matches exactly. Keyboard: ↑/↓ move, Enter select, Esc close.
 */
export function GlazeTypeahead({
  glazes,
  selectedIds,
  onAdd,
  onAddNew,
}: {
  glazes: Glaze[];
  selectedIds: string[];
  onAdd: (glazeId: string) => void;
  onAddNew: (name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const available = useMemo(
    () => glazes.filter((g) => !selectedIds.includes(g.id)),
    [glazes, selectedIds],
  );
  const fuse = useMemo(
    () => new Fuse(available, { keys: ["name", "family"], threshold: 0.4, ignoreLocation: true }),
    [available],
  );

  const q = query.trim();
  const matches = q ? fuse.search(q).map((r) => r.item) : available;
  const exact = available.some((g) => g.name.toLowerCase() === q.toLowerCase());
  const showNew = q.length > 0 && !exact;

  // Rows = matches + optional "new" row.
  const rowCount = matches.length + (showNew ? 1 : 0);

  function commit(index: number) {
    if (index < matches.length) {
      onAdd(matches[index].id);
    } else if (showNew) {
      onAddNew(q);
    }
    setQuery("");
    setActive(0);
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, rowCount - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      if (open && rowCount > 0) {
        e.preventDefault();
        commit(active);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <label htmlFor={`${listId}-input`} className="mb-1.5 block text-sm font-medium text-ink-2">
        Glaze(s) used
      </label>
      <input
        id={`${listId}-input`}
        ref={inputRef}
        role="combobox"
        aria-expanded={open && rowCount > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && rowCount > 0 ? `${listId}-opt-${active}` : undefined}
        type="text"
        value={query}
        placeholder="Search studio glazes…"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        className="h-12 w-full rounded-md border-[1.5px] border-line-strong bg-bone px-4 text-[15px] text-ink placeholder:text-slip focus:border-terracotta focus:outline-none focus:ring-[3px] focus:ring-terracotta/[0.16]"
        autoComplete="off"
      />

      {open && rowCount > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-72 w-full overflow-auto rounded-card border border-line bg-bone p-1 shadow-[var(--shadow-elevated)]"
        >
          {matches.map((g, i) => (
            <li
              key={g.id}
              id={`${listId}-opt-${i}`}
              role="option"
              aria-selected={active === i}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                commit(i);
              }}
              className={`flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 ${
                active === i ? "bg-clay" : ""
              }`}
            >
              <span
                className="h-6 w-6 shrink-0 rounded-md"
                style={{ background: swatchBg(g) }}
                aria-hidden
              />
              <span className="flex-1 font-medium text-ink">{g.name}</span>
              <span className="text-xs text-slip">{g.family}</span>
            </li>
          ))}

          {showNew && (
            <li
              id={`${listId}-opt-${matches.length}`}
              role="option"
              aria-selected={active === matches.length}
              onMouseEnter={() => setActive(matches.length)}
              onMouseDown={(e) => {
                e.preventDefault();
                commit(matches.length);
              }}
              className={`mt-1 flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-line-strong px-2.5 py-2 ${
                active === matches.length ? "bg-clay" : ""
              }`}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-clay-deep text-terracotta">
                +
              </span>
              <span className="flex-1 text-ink">
                New glaze: <span className="font-semibold">&ldquo;{q}&rdquo;</span>
              </span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
