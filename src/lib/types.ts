/** Core domain types for WhatsGlazin. These mirror the Supabase schema
 *  introduced in Phase 2 so screens can be built against typed data now. */

/** Loose grouping used for display/search. Freeform so real studio glazes
 *  (which don't follow a fixed taxonomy) can carry whatever fits. */
export type GlazeFamily = string;

export type GlazeFinish =
  | "satin"
  | "glossy"
  | "matte"
  | "runny"
  | "dry matte"
  | "metallic";

export interface Glaze {
  id: string;
  slug: string;
  name: string;
  family: GlazeFamily;
  /** Cone the glaze is fired to (6 or 10 at The Fine Line). */
  cone: number;
  /** Swatch gradient endpoints. */
  baseHex: string;
  shade2Hex: string;
  /** Legible text color to place on top of the swatch. */
  onColor: string;
  finish: GlazeFinish;
  /** Short mono chemistry string, e.g. "Fe · reduction". */
  chemistry: string;
  description: string;
  /** Derived: part of a studio's official library (studioId set). */
  isStudioGlaze: boolean;
  /** The studio whose library this glaze belongs to; null/undefined = personal. */
  studioId?: string;
  /** Freeform recipe text (ingredients, amounts, process notes). */
  recipe?: string;
  /** Link to the recipe on glazy.org (or similar). */
  glazyUrl?: string;
  createdBy?: string;
  createdAt: string;
}

/** A pottery studio with its own corner of WhatsGlazin. */
export interface Studio {
  id: string;
  slug: string;
  name: string;
  location?: string;
  description?: string;
  established?: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
}

/** Lightweight studio reference embedded on pieces/glazes. */
export interface StudioRef {
  id: string;
  slug: string;
  name: string;
}

export type PieceForm =
  | "Tumbler"
  | "Vase"
  | "Bowl"
  | "Mug"
  | "Beaker"
  | "Plate"
  | "Vessel"
  | "Jar"
  | "Cup"
  | "Planter";

export interface PiecePhoto {
  /** Storage path or URL. Null while using swatch placeholders. */
  url: string | null;
  /** Tiny blurred data URI for blur-up, when available. */
  blurDataURL?: string;
  alt?: string;
}

export interface Piece {
  id: string;
  slug: string;
  title?: string;
  makerId: string;
  form: PieceForm;
  /** Ordered — layer order matters; a combination is >1 glaze. */
  glazeIds: string[];
  photos: PiecePhoto[];
  clayBody?: string;
  /** Firing tags, e.g. ["CONE 10", "REDUCTION"]. */
  firing?: string[];
  notes?: string;
  /** Snapshot of the maker's studio at creation time. */
  studioId?: string;
  createdAt: string;
}

export interface Member {
  id: string;
  slug: string;
  name: string;
  /** Initials shown in the gradient avatar when no photo. */
  avatar?: string;
  memberSince: number;
  disciplines: string[];
  /** Optional home-studio association (filters dropdowns/gallery defaults). */
  studioId?: string;
  /** Platform-wide admin (metrics, moderation). */
  isSiteAdmin: boolean;
}

/** A piece with its glazes (ordered) and maker resolved — the shape screens
 *  and client components consume. Built at the server/DB boundary. */
export interface EnrichedPiece extends Piece {
  glazes: Glaze[];
  maker: Member | null;
  studio: StudioRef | null;
}

/** A glaze plus how many pieces use it (for library/landing tiles). */
export interface GlazeWithCount extends Glaze {
  pieceCount: number;
}

/** Site-admin dashboard aggregates. */
export interface AdminStats {
  members: number;
  studios: number;
  pieces: number;
  glazes: number;
  studioAdmins: number;
}

/** One aggregated page-view row (no PII — path + day + count). */
export interface PageViewRow {
  path: string;
  day: string;
  count: number;
}
