import { createClient } from "@/lib/supabase/server";
import type {
  Glaze,
  GlazeWithCount,
  Member,
  EnrichedPiece,
  PieceForm,
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
    isStudioGlaze: Boolean(r.is_studio_glaze),
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

  return {
    id: r.id as string,
    slug: r.slug as string,
    title: (r.title as string) ?? undefined,
    makerId: (r.maker_id as string) ?? "",
    form: (r.form as PieceForm) ?? "Vessel",
    glazeIds: glazes.map((g) => g.id),
    glazes,
    maker: makerRow ? mapMember(makerRow) : null,
    photos: photos.length ? photos : [{ url: null }],
    clayBody: (r.clay_body as string) ?? undefined,
    firing: (r.firing as string[]) ?? undefined,
    notes: (r.notes as string) ?? undefined,
    createdAt: r.created_at as string,
  };
}

const PIECE_SELECT = `
  id, slug, title, maker_id, form, clay_body, firing, notes, created_at,
  piece_glazes ( position, glazes ( * ) ),
  piece_photos ( url, blur_data_url, alt, position ),
  maker:members!pieces_maker_id_fkey ( * )
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

export async function getMembers(): Promise<Member[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("members").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map(mapMember);
}

export async function getMemberBySlug(slug: string): Promise<Member | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("members").select("*").eq("slug", slug).maybeSingle();
  return data ? mapMember(data) : null;
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
