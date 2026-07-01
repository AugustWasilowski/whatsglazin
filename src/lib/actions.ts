"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionMember } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export type GlazeEntry = { id?: string; newName?: string };
export type CreatePieceResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

/**
 * Create a piece: insert the row, resolve/create its ordered glazes, upload the
 * photos to storage, and record them. Runs under the member's session, so RLS
 * enforces that they can only write their own content.
 */
export async function createPiece(formData: FormData): Promise<CreatePieceResult> {
  const { member } = await getSessionMember();
  if (!member) return { ok: false, error: "Please sign in again." };

  const supabase = await createClient();

  const cap = (s: string, n: number) => s.slice(0, n);
  const str = (k: string) => ((formData.get(k) as string) ?? "").trim();
  const title = cap(str("title"), 120);
  const form = cap(str("form"), 40) || "Vessel";
  const clayBody = cap(str("clayBody"), 60);
  const notes = cap(str("notes"), 2000);
  const firingRaw = str("firing");
  const firing = firingRaw
    ? firingRaw
        .split(/[,·]/)
        .map((s) => cap(s.trim().toUpperCase(), 24))
        .filter(Boolean)
        .slice(0, 6)
    : null;

  // Validate the glaze list: known shape, capped count, capped new-name length.
  let glazeEntries: GlazeEntry[] = [];
  try {
    const parsed = JSON.parse(str("glazes") || "[]");
    if (Array.isArray(parsed)) {
      glazeEntries = parsed
        .filter((e) => e && (typeof e.id === "string" || typeof e.newName === "string"))
        .slice(0, 12)
        .map((e) => ({
          id: typeof e.id === "string" ? e.id : undefined,
          newName: typeof e.newName === "string" ? cap(e.newName.trim(), 60) : undefined,
        }));
    }
  } catch {
    glazeEntries = [];
  }
  if (glazeEntries.length === 0) return { ok: false, error: "Add at least one glaze." };

  // Only accept real raster images, capped in size and count. Blocks SVG (script
  // vector) and non-image payloads from being uploaded to the public bucket.
  const ALLOWED_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
  ]);
  const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
  const photos = formData
    .getAll("photos")
    .filter(
      (f): f is File =>
        f instanceof File &&
        f.size > 0 &&
        f.size <= MAX_PHOTO_BYTES &&
        ALLOWED_TYPES.has(f.type),
    )
    .slice(0, 8);
  if (photos.length === 0) {
    return {
      ok: false,
      error: "Add at least one photo (JPG, PNG, WebP, or HEIC, under 15 MB).",
    };
  }

  // 1) the piece
  const base = slugify(title || form) || "piece";
  const slug = `${base}-${randomUUID().slice(0, 6)}`;
  const { data: pieceRow, error: pieceErr } = await supabase
    .from("pieces")
    .insert({
      slug,
      title: title || null,
      maker_id: member.id,
      form,
      clay_body: clayBody || null,
      firing,
      notes: notes || null,
    })
    .select("id, slug")
    .single();
  if (pieceErr || !pieceRow) {
    return { ok: false, error: pieceErr?.message ?? "Could not save the piece." };
  }
  const pieceId = pieceRow.id as string;

  // 2) glazes (create any new ones), ordered
  const layers: { piece_id: string; glaze_id: string; position: number }[] = [];
  for (let i = 0; i < glazeEntries.length; i++) {
    const e = glazeEntries[i];
    let glazeId = e.id;
    if (!glazeId && e.newName) {
      const name = e.newName.trim();
      const { data: gRow } = await supabase
        .from("glazes")
        .insert({
          slug: `${slugify(name)}-${randomUUID().slice(0, 4)}`,
          name,
          family: "Custom",
          cone: 6,
          base_hex: "#C4B49A",
          shade2_hex: "#8A7A64",
          on_color: "#2A2018",
          finish: "satin",
          is_studio_glaze: false,
          created_by: member.id,
        })
        .select("id")
        .single();
      glazeId = gRow?.id as string | undefined;
    }
    if (glazeId) layers.push({ piece_id: pieceId, glaze_id: glazeId, position: i });
  }
  if (layers.length) await supabase.from("piece_glazes").insert(layers);

  // 3) photos → storage + rows
  const photoRows: { piece_id: string; url: string; position: number; alt: string }[] = [];
  for (let i = 0; i < photos.length; i++) {
    const file = photos[i];
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${member.id}/${pieceId}/${i}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("pieces")
      .upload(path, file, { contentType: file.type || "image/jpeg", upsert: true });
    if (upErr) continue;
    const { data: pub } = supabase.storage.from("pieces").getPublicUrl(path);
    photoRows.push({ piece_id: pieceId, url: pub.publicUrl, position: i, alt: title || form });
  }
  if (photoRows.length) await supabase.from("piece_photos").insert(photoRows);

  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath(`/members/${member.slug}`);

  return { ok: true, slug: pieceRow.slug as string };
}
