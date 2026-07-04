"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionMember } from "@/lib/auth";
import { getAdminStudioIds } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { GlazeFinish } from "@/lib/types";

export type StudioResult = { ok: true; slug: string } | { ok: false; error: string };
export type GlazeWriteResult = { ok: true; slug: string } | { ok: false; error: string };
export type SimpleResult = { ok: true } | { ok: false; error: string };

const cap = (s: string, n: number) => s.slice(0, n);
const str = (formData: FormData, k: string) => ((formData.get(k) as string) ?? "").trim();

const FINISHES: GlazeFinish[] = ["satin", "glossy", "matte", "runny", "dry matte", "metallic"];
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** Supabase embeds a to-one relation as an object OR a one-element array
 *  depending on FK detection — read the slug from either shape. */
function embeddedSlug(v: unknown): string | undefined {
  const row = Array.isArray(v) ? v[0] : v;
  return (row as { slug?: string } | null | undefined)?.slug;
}

/** May the session member manage this studio? (Site admin always can.) */
async function canManageStudio(studioId: string): Promise<
  | { ok: true; memberId: string }
  | { ok: false; error: string }
> {
  const { member } = await getSessionMember();
  if (!member) return { ok: false, error: "Please sign in again." };
  if (member.isSiteAdmin) return { ok: true, memberId: member.id };
  const adminOf = await getAdminStudioIds(member.id);
  if (!adminOf.includes(studioId)) {
    return { ok: false, error: "Only this studio's admins can do that." };
  }
  return { ok: true, memberId: member.id };
}

/* -------------------------------- studios -------------------------------- */

/** Self-serve studio creation via the atomic create_studio() RPC — the caller
 *  becomes the studio's first admin (and is associated with it if they had
 *  no home studio yet). */
export async function createStudio(formData: FormData): Promise<StudioResult> {
  const { member } = await getSessionMember();
  if (!member) return { ok: false, error: "Please sign in again." };

  const name = cap(str(formData, "name"), 80);
  if (name.length < 2) return { ok: false, error: "Give the studio a name (2+ characters)." };
  const location = cap(str(formData, "location"), 120);
  const description = cap(str(formData, "description"), 2000);
  const establishedRaw = str(formData, "established");
  const established = /^\d{4}$/.test(establishedRaw) ? Number(establishedRaw) : null;

  const supabase = await createClient();
  const base = slugify(name) || "studio";

  // Try the clean slug first; suffix on collision (same idea as piece slugs).
  for (const slug of [base, `${base}-${randomUUID().slice(0, 4)}`]) {
    const { error } = await supabase.rpc("create_studio", {
      p_name: name,
      p_slug: slug,
      p_location: location || null,
      p_description: description || null,
      p_established: established,
    });
    if (!error) {
      revalidatePath("/studios");
      revalidatePath("/you");
      return { ok: true, slug };
    }
    // 23505 = unique violation on the slug — retry with the suffixed one.
    if (!error.message.toLowerCase().includes("duplicate")) {
      return { ok: false, error: error.message };
    }
  }
  return { ok: false, error: "Could not create the studio. Try a different name." };
}

/** Update a studio's info (name, location, description, established). */
export async function updateStudio(
  studioId: string,
  studioSlug: string,
  formData: FormData,
): Promise<StudioResult> {
  const gate = await canManageStudio(studioId);
  if (!gate.ok) return gate;

  const name = cap(str(formData, "name"), 80);
  if (name.length < 2) return { ok: false, error: "Give the studio a name (2+ characters)." };
  const location = cap(str(formData, "location"), 120);
  const description = cap(str(formData, "description"), 2000);
  const establishedRaw = str(formData, "established");
  const established = /^\d{4}$/.test(establishedRaw) ? Number(establishedRaw) : null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("studios")
    .update({
      name,
      location: location || null,
      description: description || null,
      established,
    })
    .eq("id", studioId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/studios");
  revalidatePath(`/studios/${studioSlug}`);
  return { ok: true, slug: studioSlug };
}

/* --------------------------------- glazes -------------------------------- */

/** Shared glaze-form parsing/validation for create + update. */
function readGlazeFields(formData: FormData):
  | {
      ok: true;
      fields: {
        name: string;
        family: string;
        cone: number;
        finish: GlazeFinish;
        baseHex: string;
        shade2Hex: string;
        onColor: string;
        chemistry: string;
        description: string;
        recipe: string;
        glazyUrl: string;
      };
    }
  | { ok: false; error: string } {
  const name = cap(str(formData, "name"), 60);
  if (name.length < 2) return { ok: false, error: "Give the glaze a name (2+ characters)." };

  const family = cap(str(formData, "family"), 40) || "Custom";
  const coneRaw = str(formData, "cone");
  const cone = /^\d{1,2}$/.test(coneRaw) ? Number(coneRaw) : 6;

  const finishRaw = str(formData, "finish") as GlazeFinish;
  const finish = FINISHES.includes(finishRaw) ? finishRaw : "satin";

  const baseHex = str(formData, "baseHex");
  const shade2Hex = str(formData, "shade2Hex") || baseHex;
  const onColor = str(formData, "onColor") || "#2A2018";
  for (const [label, hex] of [
    ["base color", baseHex],
    ["shade color", shade2Hex],
    ["text color", onColor],
  ] as const) {
    if (!HEX_RE.test(hex)) return { ok: false, error: `The ${label} must be a hex value like #B0552F.` };
  }

  const chemistry = cap(str(formData, "chemistry"), 80);
  const description = cap(str(formData, "description"), 2000);
  const recipe = cap(str(formData, "recipe"), 8000);

  let glazyUrl = cap(str(formData, "glazyUrl"), 300);
  if (glazyUrl) {
    try {
      const parsed = new URL(glazyUrl);
      if (parsed.protocol !== "https:") throw new Error();
      glazyUrl = parsed.toString();
    } catch {
      return { ok: false, error: "The recipe link must be a full https:// URL." };
    }
  }

  return {
    ok: true,
    fields: { name, family, cone, finish, baseHex, shade2Hex, onColor, chemistry, description, recipe, glazyUrl },
  };
}

/** Add a glaze to a studio's official library (studio admins only). */
export async function createStudioGlaze(
  studioId: string,
  studioSlug: string,
  formData: FormData,
): Promise<GlazeWriteResult> {
  const gate = await canManageStudio(studioId);
  if (!gate.ok) return gate;
  const parsed = readGlazeFields(formData);
  if (!parsed.ok) return parsed;
  const f = parsed.fields;

  const supabase = await createClient();
  const slug = `${slugify(f.name) || "glaze"}-${randomUUID().slice(0, 4)}`;
  const { error } = await supabase.from("glazes").insert({
    slug,
    name: f.name,
    family: f.family,
    cone: f.cone,
    base_hex: f.baseHex,
    shade2_hex: f.shade2Hex,
    on_color: f.onColor,
    finish: f.finish,
    chemistry: f.chemistry || null,
    description: f.description || null,
    recipe: f.recipe || null,
    glazy_url: f.glazyUrl || null,
    studio_id: studioId,
    is_studio_glaze: true, // legacy flag, kept in sync until migration 003
    created_by: gate.memberId,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/glazes");
  revalidatePath(`/studios/${studioSlug}`);
  return { ok: true, slug };
}

/** Edit a glaze — studio admins for library glazes, creators for personal
 *  ones, site admin for anything. RLS backstops every branch. */
export async function updateGlaze(glazeSlug: string, formData: FormData): Promise<GlazeWriteResult> {
  const { member } = await getSessionMember();
  if (!member) return { ok: false, error: "Please sign in again." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("glazes")
    .select("id, slug, studio_id, created_by, studios ( slug )")
    .eq("slug", glazeSlug)
    .maybeSingle();
  if (!existing) return { ok: false, error: "Glaze not found." };

  if (!member.isSiteAdmin) {
    if (existing.studio_id) {
      const adminOf = await getAdminStudioIds(member.id);
      if (!adminOf.includes(existing.studio_id as string)) {
        return { ok: false, error: "Only this studio's admins can edit its glazes." };
      }
    } else if (existing.created_by !== member.id) {
      return { ok: false, error: "Only the member who added this glaze can edit it." };
    }
  }

  const parsed = readGlazeFields(formData);
  if (!parsed.ok) return parsed;
  const f = parsed.fields;

  const { error } = await supabase
    .from("glazes")
    .update({
      name: f.name,
      family: f.family,
      cone: f.cone,
      base_hex: f.baseHex,
      shade2_hex: f.shade2Hex,
      on_color: f.onColor,
      finish: f.finish,
      chemistry: f.chemistry || null,
      description: f.description || null,
      recipe: f.recipe || null,
      glazy_url: f.glazyUrl || null,
    })
    .eq("id", existing.id as string);
  if (error) return { ok: false, error: error.message };

  const studioSlug = embeddedSlug(existing.studios);
  revalidatePath("/glazes");
  revalidatePath(`/glazes/${glazeSlug}`);
  if (studioSlug) revalidatePath(`/studios/${studioSlug}`);
  return { ok: true, slug: glazeSlug };
}

/** Delete a glaze (same authorization as updateGlaze). Pieces referencing it
 *  block deletion via the FK — surfaced as a friendly message. */
export async function deleteGlaze(glazeSlug: string): Promise<SimpleResult> {
  const { member } = await getSessionMember();
  if (!member) return { ok: false, error: "Please sign in again." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("glazes")
    .select("id, studio_id, created_by, studios ( slug )")
    .eq("slug", glazeSlug)
    .maybeSingle();
  if (!existing) return { ok: false, error: "Glaze not found." };

  if (!member.isSiteAdmin) {
    if (existing.studio_id) {
      const adminOf = await getAdminStudioIds(member.id);
      if (!adminOf.includes(existing.studio_id as string)) {
        return { ok: false, error: "Only this studio's admins can remove its glazes." };
      }
    } else if (existing.created_by !== member.id) {
      return { ok: false, error: "Only the member who added this glaze can remove it." };
    }
  }

  const { count } = await supabase
    .from("piece_glazes")
    .select("piece_id", { count: "exact", head: true })
    .eq("glaze_id", existing.id as string);
  if ((count ?? 0) > 0) {
    return {
      ok: false,
      error: `This glaze is on ${count} ${count === 1 ? "piece" : "pieces"} and can't be deleted.`,
    };
  }

  const { error } = await supabase.from("glazes").delete().eq("id", existing.id as string);
  if (error) {
    return error.code === "23503"
      ? { ok: false, error: "This glaze is in use on pieces and can't be deleted." }
      : { ok: false, error: error.message };
  }

  const studioSlug = embeddedSlug(existing.studios);
  revalidatePath("/glazes");
  if (studioSlug) revalidatePath(`/studios/${studioSlug}`);
  return { ok: true };
}

/* ------------------------- association + moderation ------------------------ */

/** Set (or clear) the signed-in member's home-studio association. */
export async function setStudioAssociation(studioId: string | null): Promise<SimpleResult> {
  const { member } = await getSessionMember();
  if (!member) return { ok: false, error: "Please sign in again." };

  const supabase = await createClient();
  if (studioId) {
    const { data } = await supabase
      .from("studios")
      .select("id")
      .eq("id", studioId)
      .eq("is_active", true)
      .maybeSingle();
    if (!data) return { ok: false, error: "That studio doesn't exist." };
  }

  const { error } = await supabase
    .from("members")
    .update({ studio_id: studioId })
    .eq("id", member.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/you");
  revalidatePath("/gallery");
  return { ok: true };
}

/** Site-admin moderation: activate/deactivate a studio (RPC-enforced). */
export async function setStudioActive(studioId: string, active: boolean): Promise<SimpleResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_studio_active", {
    p_studio_id: studioId,
    p_active: active,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/studios");
  revalidatePath("/admin");
  return { ok: true };
}

/** Remove a studio admin (their own admins or the site admin; RLS enforces). */
export async function removeStudioAdmin(studioId: string, memberId: string): Promise<SimpleResult> {
  const gate = await canManageStudio(studioId);
  if (!gate.ok) return gate;

  const supabase = await createClient();
  const { error } = await supabase
    .from("studio_admins")
    .delete()
    .eq("studio_id", studioId)
    .eq("member_id", memberId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}
