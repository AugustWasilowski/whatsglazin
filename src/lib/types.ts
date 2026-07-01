/** Core domain types for WhatsGlazin. These mirror the Supabase schema
 *  introduced in Phase 2 so screens can be built against typed data now. */

export type GlazeFamily =
  | "Celadon"
  | "Iron"
  | "Feldspathic"
  | "Ash"
  | "Ash·Blue"
  | "Copper"
  | "Liner";

export type GlazeFinish = "satin" | "glossy" | "matte" | "runny" | "dry matte";

export interface Glaze {
  id: string;
  slug: string;
  name: string;
  family: GlazeFamily;
  /** Swatch gradient endpoints. */
  baseHex: string;
  shade2Hex: string;
  /** Legible text color to place on top of the swatch. */
  onColor: string;
  finish: GlazeFinish;
  /** Short mono chemistry string, e.g. "Fe · reduction". */
  chemistry: string;
  description: string;
  isStudioGlaze: boolean;
  createdBy?: string;
  createdAt: string;
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
}
