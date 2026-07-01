import type { Member, Piece } from "./types";

/**
 * Illustrative seed content for The Fine Line so every screen renders before
 * Supabase is wired. Replaced by real studio data in Phase 2.
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

export const PIECES: Piece[] = [
  {
    id: "p-ash-vessel-4", slug: "ash-vessel-no-4", title: "Ash Vessel No.4",
    makerId: "m-else", form: "Vessel", glazeIds: ["g-ash-falls", "g-tenmoku"],
    photos: [{ url: null }, { url: null }, { url: null }],
    clayBody: "Stoneware", firing: ["CONE 10", "REDUCTION"],
    notes: "Ash Falls poured over a Tenmoku base — let it river down the shoulder and gathered black in the low belly.",
    createdAt: "2026-06-27T15:00:00Z",
  },
  {
    id: "p-dipped-beaker", slug: "dipped-beaker", title: "Dipped Beaker",
    makerId: "m-june", form: "Beaker", glazeIds: ["g-celadon", "g-shino"],
    photos: [{ url: null }, { url: null }],
    clayBody: "Porcelain", firing: ["CONE 10", "REDUCTION"],
    notes: "Celadon inside and out, dipped one-third in Shino for the warm collar.",
    createdAt: "2026-06-26T18:30:00Z",
  },
  {
    id: "p-celadon-bowl", slug: "celadon-bowl", title: "Everyday Bowl",
    makerId: "m-lena", form: "Bowl", glazeIds: ["g-celadon"],
    photos: [{ url: null }], clayBody: "Porcelain", firing: ["CONE 10", "REDUCTION"],
    notes: "Straight Studio Celadon, poured thick to pool the foot ring.",
    createdAt: "2026-06-25T12:00:00Z",
  },
  {
    id: "p-tenmoku-tumbler", slug: "tenmoku-tumbler", title: "Night Tumbler",
    makerId: "m-marco", form: "Tumbler", glazeIds: ["g-tenmoku"],
    photos: [{ url: null }, { url: null }], clayBody: "Stoneware", firing: ["CONE 10", "REDUCTION"],
    createdAt: "2026-06-24T09:15:00Z",
  },
  {
    id: "p-chun-vase", slug: "chun-vase", title: "Chun Bud Vase",
    makerId: "m-theo", form: "Vase", glazeIds: ["g-chun-blue"],
    photos: [{ url: null }], clayBody: "Porcelain", firing: ["CONE 10", "REDUCTION"],
    notes: "Three coats to build the opalescence at the neck.",
    createdAt: "2026-06-23T14:40:00Z",
  },
  {
    id: "p-iron-red-plate", slug: "iron-red-plate", title: "Persimmon Plate",
    makerId: "m-priya", form: "Plate", glazeIds: ["g-iron-red", "g-bone-matte"],
    photos: [{ url: null }, { url: null }], clayBody: "Stoneware", firing: ["CONE 10", "SLOW COOL"],
    notes: "Iron Red rim breaking onto a Bone Matte well.",
    createdAt: "2026-06-22T17:05:00Z",
  },
  {
    id: "p-nuka-mug", slug: "nuka-mug", title: "Oatmeal Mug",
    makerId: "m-lena", form: "Mug", glazeIds: ["g-nuka"],
    photos: [{ url: null }], clayBody: "Stoneware", firing: ["CONE 10", "REDUCTION"],
    createdAt: "2026-06-21T11:20:00Z",
  },
  {
    id: "p-copper-jar", slug: "copper-jar", title: "Lidded Copper Jar",
    makerId: "m-theo", form: "Jar", glazeIds: ["g-copper-green", "g-tenmoku"],
    photos: [{ url: null }, { url: null }, { url: null }], clayBody: "Stoneware", firing: ["CONE 6", "OXIDATION"],
    notes: "Copper Green over Tenmoku on the lid — the overlap goes metallic.",
    createdAt: "2026-06-20T16:00:00Z",
  },
  {
    id: "p-shino-cup", slug: "shino-cup", title: "Carbon-Trap Cup",
    makerId: "m-else", form: "Cup", glazeIds: ["g-shino"],
    photos: [{ url: null }], clayBody: "Stoneware", firing: ["CONE 10", "REDUCTION"],
    createdAt: "2026-06-19T13:10:00Z",
  },
  {
    id: "p-ash-planter", slug: "ash-planter", title: "Running Planter",
    makerId: "m-marco", form: "Planter", glazeIds: ["g-ash-falls", "g-nuka"],
    photos: [{ url: null }, { url: null }], clayBody: "Stoneware", firing: ["CONE 10", "REDUCTION"],
    notes: "Ash Falls streaking through Nuka — left a wide gap at the foot.",
    createdAt: "2026-06-18T10:00:00Z",
  },
  {
    id: "p-kaki-vase", slug: "kaki-vase", title: "Persimmon Vase",
    makerId: "m-priya", form: "Vase", glazeIds: ["g-kaki"],
    photos: [{ url: null }], clayBody: "Stoneware", firing: ["CONE 10", "SLOW COOL"],
    createdAt: "2026-06-17T15:45:00Z",
  },
  {
    id: "p-bone-liner-bowl", slug: "bone-liner-bowl", title: "Bone & Celadon Bowl",
    makerId: "m-june", form: "Bowl", glazeIds: ["g-bone-matte", "g-celadon"],
    photos: [{ url: null }, { url: null }], clayBody: "Porcelain", firing: ["CONE 10", "REDUCTION"],
    notes: "Bone Matte liner with a Celadon exterior for the soft two-tone.",
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
