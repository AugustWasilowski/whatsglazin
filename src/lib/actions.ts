"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSessionMember } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export type GlazeEntry = { id?: string; newName?: string };
export type CreatePieceResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };
export type DeletePieceResult = { ok: true } | { ok: false; error: string };

/** One entry of the edit form's ordered photo list: keep an existing photo
 *  (by URL) or slot in the next newly-uploaded file. */
type PhotoOrderEntry = { keep: string } | { new: true };

const BUCKET = "pieces";
const PUBLIC_MARKER = `/storage/v1/object/public/${BUCKET}/`;

/* ------------------------------ shared parsing ----------------------------- */

const cap = (s: string, n: number) => s.slice(0, n);

/** Text fields, trimmed and length-capped, shared by create and update. */
function readFields(formData: FormData) {
  const str = (k: string) => ((formData.get(k) as string) ?? "").trim();
  const firingRaw = str("firing");
  return {
    title: cap(str("title"), 120),
    form: cap(str("form"), 40) || "Vessel",
    clayBody: cap(str("clayBody"), 60),
    notes: cap(str("notes"), 2000),
    firing: firingRaw
      ? firingRaw
          .split(/[,·]/)
          .map((s) => cap(s.trim().toUpperCase(), 24))
          .filter(Boolean)
          .slice(0, 6)
      : null,
  };
}

/** Validate the glaze list: known shape, capped count, capped new-name length. */
function readGlazeEntries(formData: FormData): GlazeEntry[] {
  try {
    const parsed = JSON.parse(((formData.get("glazes") as string) ?? "[]") || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e) => e && (typeof e.id === "string" || typeof e.newName === "string"))
      .slice(0, 12)
      .map((e) => ({
        id: typeof e.id === "string" ? e.id : undefined,
        newName: typeof e.newName === "string" ? cap(e.newName.trim(), 60) : undefined,
      }));
  } catch {
    return [];
  }
}

// Only accept real raster images, capped in size and count. Blocks SVG (script
// vector) and non-image payloads from reaching the public bucket.
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);
const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

/** New files off the form, filtered to safe images and capped in count. */
function readNewPhotos(formData: FormData): File[] {
  return formData
    .getAll("photos")
    .filter(
      (f): f is File =>
        f instanceof File &&
        f.size > 0 &&
        f.size <= MAX_PHOTO_BYTES &&
        ALLOWED_TYPES.has(f.type),
    )
    .slice(0, 8);
}

/* ------------------------------ shared writes ------------------------------ */

/** Resolve glaze entries to ordered glaze ids, creating any new glazes. */
async function resolveGlazeIds(
  supabase: SupabaseClient,
  memberId: string,
  entries: GlazeEntry[],
): Promise<string[]> {
  const ids: string[] = [];
  for (const e of entries) {
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
          created_by: memberId,
        })
        .select("id")
        .single();
      glazeId = gRow?.id as string | undefined;
    }
    if (glazeId) ids.push(glazeId);
  }
  return ids;
}

/** Upload files to the member's folder; return the public URLs that succeeded,
 *  in order. Names are randomized so an upload never clobbers a kept photo. */
async function uploadPhotos(
  supabase: SupabaseClient,
  memberId: string,
  pieceId: string,
  files: File[],
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const ext =
      (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${memberId}/${pieceId}/${randomUUID().slice(0, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type || "image/jpeg", upsert: true });
    if (error) continue;
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(pub.publicUrl);
  }
  return urls;
}

/** Public URL → in-bucket storage path (for removal). Null if not ours. */
function storagePathFromUrl(url: string): string | null {
  const i = url.indexOf(PUBLIC_MARKER);
  return i === -1 ? null : url.slice(i + PUBLIC_MARKER.length);
}

/* -------------------------------- create ----------------------------------- */

/**
 * Create a piece: insert the row, resolve/create its ordered glazes, upload the
 * photos, and record them. Runs under the member's session, so RLS enforces
 * that they can only write their own content.
 */
export async function createPiece(formData: FormData): Promise<CreatePieceResult> {
  const { member } = await getSessionMember();
  if (!member) return { ok: false, error: "Please sign in again." };

  const supabase = await createClient();

  const fields = readFields(formData);
  const glazeEntries = readGlazeEntries(formData);
  if (glazeEntries.length === 0) return { ok: false, error: "Add at least one glaze." };

  const photos = readNewPhotos(formData);
  if (photos.length === 0) {
    return {
      ok: false,
      error: "Add at least one photo (JPG, PNG, WebP, or HEIC, under 15 MB).",
    };
  }

  // 1) the piece
  const base = slugify(fields.title || fields.form) || "piece";
  const slug = `${base}-${randomUUID().slice(0, 6)}`;
  const { data: pieceRow, error: pieceErr } = await supabase
    .from("pieces")
    .insert({
      slug,
      title: fields.title || null,
      maker_id: member.id,
      form: fields.form,
      clay_body: fields.clayBody || null,
      firing: fields.firing,
      notes: fields.notes || null,
    })
    .select("id, slug")
    .single();
  if (pieceErr || !pieceRow) {
    return { ok: false, error: pieceErr?.message ?? "Could not save the piece." };
  }
  const pieceId = pieceRow.id as string;

  // 2) photos first — if none land, don't leave a photoless piece behind.
  const urls = await uploadPhotos(supabase, member.id, pieceId, photos);
  if (urls.length === 0) {
    await supabase.from("pieces").delete().eq("id", pieceId);
    return { ok: false, error: "Your photos couldn't be uploaded. Please try again." };
  }
  const photoRows = urls.map((url, position) => ({
    piece_id: pieceId,
    url,
    position,
    alt: fields.title || fields.form,
  }));
  const { error: photoErr } = await supabase.from("piece_photos").insert(photoRows);
  if (photoErr) {
    await supabase.from("pieces").delete().eq("id", pieceId);
    return { ok: false, error: "Could not save the photos. Please try again." };
  }

  // 3) glazes (create any new ones), ordered
  const glazeIds = await resolveGlazeIds(supabase, member.id, glazeEntries);
  if (glazeIds.length === 0) {
    await supabase.from("pieces").delete().eq("id", pieceId);
    return { ok: false, error: "Could not save the glazes. Please try again." };
  }
  const layers = glazeIds.map((glaze_id, position) => ({ piece_id: pieceId, glaze_id, position }));
  const { error: layerErr } = await supabase.from("piece_glazes").insert(layers);
  if (layerErr) {
    await supabase.from("pieces").delete().eq("id", pieceId);
    return { ok: false, error: "Could not save the glazes. Please try again." };
  }

  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath(`/members/${member.slug}`);
  revalidatePath("/you");

  return { ok: true, slug: pieceRow.slug as string };
}

/* -------------------------------- update ----------------------------------- */

/**
 * Edit an existing piece the member owns: update its fields, replace the glaze
 * layers, and reconcile photos (keep/remove existing, upload new, in order).
 */
export async function updatePiece(
  slug: string,
  formData: FormData,
): Promise<CreatePieceResult> {
  const { member } = await getSessionMember();
  if (!member) return { ok: false, error: "Please sign in again." };

  const supabase = await createClient();

  const { data: piece } = await supabase
    .from("pieces")
    .select("id, slug, maker_id")
    .eq("slug", slug)
    .maybeSingle();
  if (!piece) return { ok: false, error: "That piece no longer exists." };
  if (piece.maker_id !== member.id) {
    return { ok: false, error: "You can only edit your own pieces." };
  }
  const pieceId = piece.id as string;

  const fields = readFields(formData);
  const glazeEntries = readGlazeEntries(formData);
  if (glazeEntries.length === 0) return { ok: false, error: "Add at least one glaze." };

  // Reconstruct the final photo order from the form.
  let order: PhotoOrderEntry[] = [];
  try {
    const parsed = JSON.parse(((formData.get("photoOrder") as string) ?? "[]") || "[]");
    if (Array.isArray(parsed)) {
      order = parsed.filter(
        (e): e is PhotoOrderEntry =>
          e && (typeof e.keep === "string" || e.new === true),
      );
    }
  } catch {
    order = [];
  }
  const newFiles = readNewPhotos(formData);
  const uploaded = await uploadPhotos(supabase, member.id, pieceId, newFiles);

  // Walk the order, consuming uploaded URLs for each "new" slot.
  let nextUpload = 0;
  const finalUrls: string[] = [];
  for (const entry of order) {
    if ("keep" in entry) finalUrls.push(entry.keep);
    else if (nextUpload < uploaded.length) finalUrls.push(uploaded[nextUpload++]);
  }
  if (finalUrls.length === 0) {
    return { ok: false, error: "A piece needs at least one photo." };
  }

  // 1) fields
  const { error: updErr } = await supabase
    .from("pieces")
    .update({
      title: fields.title || null,
      form: fields.form,
      clay_body: fields.clayBody || null,
      firing: fields.firing,
      notes: fields.notes || null,
    })
    .eq("id", pieceId);
  if (updErr) return { ok: false, error: updErr.message };

  // 2) glaze layers — replace wholesale
  const glazeIds = await resolveGlazeIds(supabase, member.id, glazeEntries);
  if (glazeIds.length === 0) {
    return { ok: false, error: "Could not save the glazes. Please try again." };
  }
  await supabase.from("piece_glazes").delete().eq("piece_id", pieceId);
  await supabase.from("piece_glazes").insert(
    glazeIds.map((glaze_id, position) => ({ piece_id: pieceId, glaze_id, position })),
  );

  // 3) photos — delete removed files from storage, then rewrite rows in order.
  const { data: existing } = await supabase
    .from("piece_photos")
    .select("url")
    .eq("piece_id", pieceId);
  const kept = new Set(finalUrls);
  const removedPaths = (existing ?? [])
    .map((r) => r.url as string)
    .filter((u) => !kept.has(u))
    .map(storagePathFromUrl)
    .filter((p): p is string => Boolean(p));
  if (removedPaths.length) {
    await supabase.storage.from(BUCKET).remove(removedPaths);
  }
  await supabase.from("piece_photos").delete().eq("piece_id", pieceId);
  await supabase.from("piece_photos").insert(
    finalUrls.map((url, position) => ({
      piece_id: pieceId,
      url,
      position,
      alt: fields.title || fields.form,
    })),
  );

  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath(`/pieces/${slug}`);
  revalidatePath(`/members/${member.slug}`);
  revalidatePath("/you");

  return { ok: true, slug: piece.slug as string };
}

/* -------------------------------- delete ----------------------------------- */

/** Delete a piece the member owns, plus its photos in storage. Cascade clears
 *  the piece_glazes / piece_photos rows. */
export async function deletePiece(slug: string): Promise<DeletePieceResult> {
  const { member } = await getSessionMember();
  if (!member) return { ok: false, error: "Please sign in again." };

  const supabase = await createClient();

  const { data: piece } = await supabase
    .from("pieces")
    .select("id, maker_id")
    .eq("slug", slug)
    .maybeSingle();
  if (!piece) return { ok: true }; // already gone
  if (piece.maker_id !== member.id) {
    return { ok: false, error: "You can only delete your own pieces." };
  }
  const pieceId = piece.id as string;

  // Remove the piece's photo objects from the member's folder.
  const prefix = `${member.id}/${pieceId}`;
  const { data: files } = await supabase.storage.from(BUCKET).list(prefix);
  if (files?.length) {
    await supabase.storage.from(BUCKET).remove(files.map((f) => `${prefix}/${f.name}`));
  }

  const { error: delErr } = await supabase.from("pieces").delete().eq("id", pieceId);
  if (delErr) return { ok: false, error: delErr.message };

  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath(`/members/${member.slug}`);
  revalidatePath("/you");

  return { ok: true };
}
