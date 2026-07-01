import type { Member, Piece } from "./types";

/**
 * Illustrative seed content for The Fine Line so every screen renders before
 * real uploads exist. Members are placeholders (real roster comes later);
 * pieces use the studio's real Cone 6 glazes and plausible layerings.
 */

export const MEMBERS: Member[] = [
  { id: "m-june", slug: "june", name: "June Park", avatar: "JP", memberSince: 2016, disciplines: ["Wheel", "Porcelain"] },
  { id: "m-marco", slug: "marco", name: "Marco Reyes", avatar: "MR", memberSince: 2018, disciplines: ["Hand-building", "Sculpture"] },
  { id: "m-lena", slug: "lena", name: "Lena Osei", avatar: "LO", memberSince: 2019, disciplines: ["Wheel", "Tableware"] },
  { id: "m-theo", slug: "theo", name: "Theo Nakamura", avatar: "TN", memberSince: 2015, disciplines: ["Wheel", "Glaze chem"] },
  { id: "m-priya", slug: "priya", name: "Priya Shah", avatar: "PS", memberSince: 2021, disciplines: ["Hand-building"] },
  { id: "m-else", slug: "else", name: "Else Vang", avatar: "EV", memberSince: 2014, disciplines: ["Wheel", "Wood-fire"] },
];

const MBY = new Map(MEMBERS.map((m) => [m.id, m]));
export function getMember(id: string): Member | undefined {
  return MBY.get(id);
}
export function getMemberBySlug(slug: string): Member | undefined {
  return MEMBERS.find((m) => m.slug === slug);
}

// Layering order is [bottom, …, top] — the last glaze is on top.
export const PIECES: Piece[] = [
  {
    id: "p-floating-bowl", slug: "floating-blue-bowl", title: "Floating Blue Bowl",
    makerId: "m-june", form: "Bowl", glazeIds: ["g-bone", "g-floating-blue"],
    photos: [{ url: null }, { url: null }], clayBody: "Stoneware", firing: ["CONE 6", "OXIDATION"],
    notes: "Floating Blue over a Bone liner — the blue breaks amber right where the rim rolls over.",
    createdAt: "2026-06-27T15:00:00Z",
  },
  {
    id: "p-oribe-tumbler", slug: "oribe-satin-tumbler", title: "Oribe Tumbler",
    makerId: "m-else", form: "Tumbler", glazeIds: ["g-satin-white", "g-oribe-6"],
    photos: [{ url: null }, { url: null }, { url: null }], clayBody: "Stoneware", firing: ["CONE 6", "OXIDATION"],
    notes: "Oribe 6 poured over Satin White — pools deep green and breaks bright on the throwing rings.",
    createdAt: "2026-06-26T18:30:00Z",
  },
  {
    id: "p-nutmeg-mug", slug: "nutmeg-mug", title: "Nutmeg Mug",
    makerId: "m-lena", form: "Mug", glazeIds: ["g-nutmeg"],
    photos: [{ url: null }], clayBody: "Stoneware", firing: ["CONE 6", "OXIDATION"],
    notes: "Straight Nutmeg, breaking rust over the handle pulls.",
    createdAt: "2026-06-25T12:00:00Z",
  },
  {
    id: "p-spearmint-cup", slug: "spearmint-cup", title: "Spearmint Cup",
    makerId: "m-marco", form: "Cup", glazeIds: ["g-bone", "g-spearmint"],
    photos: [{ url: null }, { url: null }], clayBody: "Stoneware", firing: ["CONE 6", "OXIDATION"],
    notes: "Spearmint over Bone for a brighter, cooler mint.",
    createdAt: "2026-06-24T09:15:00Z",
  },
  {
    id: "p-butterscotch-vase", slug: "butterscotch-vase", title: "Butterscotch Bud Vase",
    makerId: "m-theo", form: "Vase", glazeIds: ["g-butterscotch"],
    photos: [{ url: null }], clayBody: "Stoneware", firing: ["CONE 6", "OXIDATION"],
    createdAt: "2026-06-23T14:40:00Z",
  },
  {
    id: "p-bronze-jar", slug: "weathered-bronze-jar", title: "Weathered Jar",
    makerId: "m-priya", form: "Jar", glazeIds: ["g-metallic-black", "g-weathered-bronze"],
    photos: [{ url: null }, { url: null }], clayBody: "Stoneware", firing: ["CONE 6", "OXIDATION"],
    notes: "Weathered Bronze over Metallic Black — crystallizes into a patinated shoulder.",
    createdAt: "2026-06-22T17:05:00Z",
  },
  {
    id: "p-celadon-bowl", slug: "blue-celadon-bowl", title: "Blue Celadon Bowl",
    makerId: "m-lena", form: "Bowl", glazeIds: ["g-jr-blue-celadon"],
    photos: [{ url: null }], clayBody: "Porcelain", firing: ["CONE 6", "OXIDATION"],
    notes: "JR Blue Celadon poured thick to pool the carved lines.",
    createdAt: "2026-06-21T11:20:00Z",
  },
  {
    id: "p-ketchup-plate", slug: "ketchup-butterscotch-plate", title: "Ember Plate",
    makerId: "m-theo", form: "Plate", glazeIds: ["g-butterscotch", "g-ketchup"],
    photos: [{ url: null }, { url: null }, { url: null }], clayBody: "Stoneware", firing: ["CONE 6", "OXIDATION"],
    notes: "Ketchup over Butterscotch — the overlap runs a glassy oxblood.",
    createdAt: "2026-06-20T16:00:00Z",
  },
  {
    id: "p-floating-vase", slug: "floating-blue-vase", title: "Floating Blue Vase",
    makerId: "m-else", form: "Vase", glazeIds: ["g-floating-blue"],
    photos: [{ url: null }], clayBody: "Stoneware", firing: ["CONE 6", "OXIDATION"],
    createdAt: "2026-06-19T13:10:00Z",
  },
  {
    id: "p-tan-planter", slug: "tan-nutmeg-planter", title: "Sandbank Planter",
    makerId: "m-marco", form: "Planter", glazeIds: ["g-440-tan", "g-nutmeg"],
    photos: [{ url: null }, { url: null }], clayBody: "Stoneware", firing: ["CONE 6", "OXIDATION"],
    notes: "Nutmeg brushed over 440 Tan — warm bands where they meet.",
    createdAt: "2026-06-18T10:00:00Z",
  },
  {
    id: "p-spearmint-beaker", slug: "spearmint-beaker", title: "Mint Beaker",
    makerId: "m-priya", form: "Beaker", glazeIds: ["g-spearmint"],
    photos: [{ url: null }], clayBody: "Porcelain", firing: ["CONE 6", "OXIDATION"],
    createdAt: "2026-06-17T15:45:00Z",
  },
  {
    id: "p-oribe-nutmeg-vessel", slug: "oribe-nutmeg-vessel", title: "Deep Woods Vessel",
    makerId: "m-june", form: "Vessel", glazeIds: ["g-nutmeg", "g-oribe-6"],
    photos: [{ url: null }, { url: null }], clayBody: "Stoneware", firing: ["CONE 6", "OXIDATION"],
    notes: "Oribe 6 over Nutmeg — the copper goes near-black over the iron and breaks green on the edges.",
    createdAt: "2026-06-16T12:30:00Z",
  },
];

const PBY = new Map(PIECES.map((p) => [p.id, p]));
export function getPiece(id: string): Piece | undefined {
  return PBY.get(id);
}
export function getPieceBySlug(slug: string): Piece | undefined {
  return PIECES.find((p) => p.slug === slug);
}

/** Pieces that use a given glaze, newest first. */
export function piecesWithGlaze(glazeId: string): Piece[] {
  return PIECES.filter((p) => p.glazeIds.includes(glazeId));
}

/** Pieces by a given maker, newest first. */
export function piecesByMaker(makerId: string): Piece[] {
  return PIECES.filter((p) => p.makerId === makerId);
}
