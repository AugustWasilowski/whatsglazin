import { createClient } from "@/lib/supabase/server";
import type {
  Glaze,
  GlazeWithCount,
  Member,
  EnrichedPiece,
  PieceForm,
  Studio,
  StudioRef,
} from "./types";

/* ----------------------------- row mappers ----------------------------- */

type Row = Record<string, unknown>;

function mapGlaze(r: Row): Glaze {
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    family: r.family as string,
    cone: (r.cone as number) ?? 6,
    baseHex: r.base_hex as string,
    shade2Hex: r.shade2_hex as string,
    onColor: r.on_color as string,
    finish: r.finish as Glaze["finish"],
    chemistry: (r.chemistry as string) ?? "",
    description: (r.description as string) ?? "",
    // studio_id is the source of truth; the legacy boolean covers the window
    // between migration 002 and the cleanup migration.
    isStudioGlaze: Boolean(r.studio_id ?? r.is_studio_glaze),
    studioId: (r.studio_id as string) ?? undefined,
    recipe: (r.recipe as string) ?? undefined,
    glazyUrl: (r.glazy_url as string) ?? undefined,
    createdBy: (r.created_by as string) ?? undefined,
    createdAt: r.created_at as string,
  };
}

function mapMember(r: Row): Member {
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    avatar: (r.avatar as string) ?? undefined,
    memberSince: (r.member_since as number) ?? new Date().getFullYear(),
    disciplines: (r.disciplines as string[]) ?? [],
    studioId: (r.studio_id as string) ?? undefined,
    isSiteAdmin: Boolean(r.is_site_admin),
  };
}

function mapStudio(r: Row): Studio {
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    location: (r.location as string) ?? undefined,
    description: (r.description as string) ?? undefined,
    established: (r.established as number) ?? undefined,
    isActive: Boolean(r.is_active),
    createdBy: (r.created_by as string) ?? undefined,
    createdAt: r.created_at as string,
  };
}

function mapPiece(r: Row): EnrichedPiece {
  const layers = ((r.piece_glazes as Row[]) ?? [])
    .slice()
    .sort((a, b) => (a.position as number) - (b.position as number));
  const glazes = layers
    .map((l) => (l.glazes ? mapGlaze(l.glazes as Row) : null))
    .filter((g): g is Glaze => Boolean(g));

  const photos = ((r.piece_photos as Row[]) ?? [])
    .slice()
    .sort((a, b) => (a.position as number) - (b.position as number))
    .map((p) => ({
      url: (p.url as string) ?? null,
      blurDataURL: (p.blur_data_url as string) ?? undefined,
      alt: (p.alt as string) ?? undefined,
    }));

  const makerRow = r.maker as Row | null;
  const studioRow = r.studio as Row | null;

  return {
    id: r.id as string,
    slug: r.slug as string,
    title: (r.title as string) ?? undefined,
    makerId: (r.maker_id as string) ?? "",
    form: (r.form as PieceForm) ?? "Vessel",
    glazeIds: glazes.map((g) => g.id),
    glazes,
    maker: makerRow ? mapMember(makerRow) : null,
    studioId: (r.studio_id as string) ?? undefined,
    studio: studioRow
      ? {
          id: studioRow.id as string,
          slug: studioRow.slug as string,
          name: studioRow.name as string,
        }
      : null,
    photos: photos.length ? photos : [{ url: null }],
    clayBody: (r.clay_body as string) ?? undefined,
    firing: (r.firing as string[]) ?? undefined,
    notes: (r.notes as string) ?? undefined,
    createdAt: r.created_at as string,
  };
}

const PIECE_SELECT = `
  id, slug, title, maker_id, form, clay_body, firing, notes, created_at, studio_id,
  piece_glazes ( position, glazes ( * ) ),
  piece_photos ( url, blur_data_url, alt, position ),
  maker:members!pieces_maker_id_fkey ( * ),
  studio:studios!pieces_studio_id_fkey ( id, slug, name )
`;

/* ------------------------------- glazes -------------------------------- */

export async function getGlazes(): Promise<Glaze[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("glazes").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map(mapGlaze);
}

export async function getGlazeBySlug(slug: string): Promise<Glaze | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("glazes").select("*").eq("slug", slug).maybeSingle();
  return data ? mapGlaze(data) : null;
}

/** Glazes with a usage count, ordered by name. */
export async function getGlazesWithCounts(): Promise<GlazeWithCount[]> {
  const [glazes, pieces] = await Promise.all([getGlazes(), getPieces()]);
  const counts = new Map<string, number>();
  for (const p of pieces)
    for (const id of p.glazeIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  return glazes.map((g) => ({ ...g, pieceCount: counts.get(g.id) ?? 0 }));
}

/* ------------------------------- pieces -------------------------------- */

/** All pieces, enriched, newest first. Powers the gallery, landing, and the
 *  by-glaze / by-maker filters (filtered in memory — studio-scale data). */
export async function getPieces(): Promise<EnrichedPiece[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pieces")
    .select(PIECE_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => mapPiece(r as Row));
}

export async function getPieceBySlug(slug: string): Promise<EnrichedPiece | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pieces")
    .select(PIECE_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  return data ? mapPiece(data as Row) : null;
}

/* ------------------------------- members ------------------------------- */

/** The public roster: only members who have logged at least one piece. This
 *  keeps unconfirmed / never-active accounts (e.g. anyone who merely requested
 *  a sign-in code) out of the studio's public member list. */
export async function getMembers(): Promise<Member[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("members").select("*").order("name");
  if (error) throw error;
  const members = (data ?? []).map(mapMember);

  const pieces = await getPieces();
  const makers = new Set(pieces.map((p) => p.makerId));
  return members.filter((m) => makers.has(m.id));
}

export async function getMemberBySlug(slug: string): Promise<Member | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("members").select("*").eq("slug", slug).maybeSingle();
  return data ? mapMember(data) : null;
}

/* ------------------------------- studios ------------------------------- */

/** Active studios, alphabetical. Pass includeInactive for admin views. */
export async function getStudios(includeInactive = false): Promise<Studio[]> {
  const supabase = await createClient();
  let query = supabase.from("studios").select("*").order("name");
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapStudio);
}

export async function getStudioBySlug(slug: string): Promise<Studio | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("studios").select("*").eq("slug", slug).maybeSingle();
  return data ? mapStudio(data) : null;
}

/** The members who administer a studio. */
export async function getStudioAdmins(studioId: string): Promise<Member[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("studio_admins")
    .select("member:members!studio_admins_member_id_fkey ( * )")
    .eq("studio_id", studioId);
  if (error) throw error;
  return (data ?? [])
    .map((r) => (r.member ? mapMember(r.member as unknown as Row) : null))
    .filter((m): m is Member => Boolean(m));
}

/** Studio ids the given member administers (for conditional edit UI). */
export async function getAdminStudioIds(memberId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("studio_admins")
    .select("studio_id")
    .eq("member_id", memberId);
  if (error) throw error;
  return (data ?? []).map((r) => r.studio_id as string);
}

/** Quick lookup: studio id → StudioRef, for labels in client components. */
export async function getStudioRefs(): Promise<StudioRef[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("studios")
    .select("id, slug, name")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return (data ?? []) as StudioRef[];
}

/* ---------------------------- derived helpers -------------------------- */

/** Glazes that co-occur with the given glaze across pieces, most first. */
export function coOccurring(
  glazeId: string,
  pieces: EnrichedPiece[],
): { glaze: Glaze; count: number }[] {
  const counts = new Map<string, { glaze: Glaze; count: number }>();
  for (const p of pieces) {
    if (!p.glazeIds.includes(glazeId)) continue;
    for (const g of p.glazes) {
      if (g.id === glazeId) continue;
      const cur = counts.get(g.id);
      if (cur) cur.count += 1;
      else counts.set(g.id, { glaze: g, count: 1 });
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}
