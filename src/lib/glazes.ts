import type { Glaze } from "./types";

/**
 * The Fine Line's Cone 6 glazes, read from the studio's glaze test board.
 * Swatch colors/finishes are approximations from that photo + known Cone 6
 * behavior — easy to refine, and replaceable with cropped real swatches.
 * Cone 10 glazes will be added when the studio locates that board.
 *
 * In Phase 2 this array seeds the Supabase `glazes` table.
 */
export const GLAZES: Glaze[] = [
  {
    id: "g-satin-white", slug: "satin-white", name: "Satin White", family: "White", cone: 6,
    baseHex: "#ECE6D8", shade2Hex: "#D6CCB8", onColor: "#37301F", finish: "satin",
    chemistry: "Ca · Zn matte · liner",
    description: "A soft, opaque satin white that stays smooth enough to line a cup. The quiet base most combinations start from.",
    isStudioGlaze: true, createdAt: "2020-01-01T00:00:00Z",
  },
  {
    id: "g-jr-clear", slug: "jr-clear", name: "JR Clear", family: "Clear", cone: 6,
    baseHex: "#D9C7A2", shade2Hex: "#BBA477", onColor: "#33281A", finish: "glossy",
    chemistry: "Transparent gloss",
    description: "The studio's clear gloss — shows the clay body and any slip beneath, and brightens the color of whatever it caps.",
    isStudioGlaze: true, createdAt: "2020-01-01T00:00:00Z",
  },
  {
    id: "g-nutmeg", slug: "nutmeg", name: "Nutmeg", family: "Iron", cone: 6,
    baseHex: "#7C5330", shade2Hex: "#482B18", onColor: "#F2E6D5", finish: "glossy",
    chemistry: "Fe · breaks rust",
    description: "A warm iron brown that breaks rust-orange over edges and texture. Rich and glossy on its own, lively under a lighter cap.",
    isStudioGlaze: true, createdAt: "2020-01-01T00:00:00Z",
  },
  {
    id: "g-440-tan", slug: "440-tan", name: "440 Tan", family: "Tan", cone: 6,
    baseHex: "#C7A473", shade2Hex: "#A07E54", onColor: "#2E2213", finish: "satin",
    chemistry: "Ti · Fe · warm",
    description: "A gentle sand-tan satin. Neutral and food-friendly, and a soft ground for greens and blues layered on top.",
    isStudioGlaze: true, createdAt: "2020-01-01T00:00:00Z",
  },
  {
    id: "g-bone", slug: "bone", name: "Bone", family: "White", cone: 6,
    baseHex: "#E8DFC9", shade2Hex: "#D1C4A8", onColor: "#37301F", finish: "satin",
    chemistry: "Opaque white",
    description: "A creamy bone white, a touch warmer than Satin White. Breaks subtly over relief and plays well under floating glazes.",
    isStudioGlaze: true, createdAt: "2020-01-01T00:00:00Z",
  },
  {
    id: "g-floating-blue", slug: "floating-blue", name: "Floating Blue", family: "Blue", cone: 6,
    baseHex: "#3F5E76", shade2Hex: "#26373F", onColor: "#E9F0F4", finish: "glossy",
    chemistry: "Rutile · Co · floats",
    description: "The classic Cone 6 floating blue — cobalt and rutile break amber-brown over edges and pool deep blue where it runs thick.",
    isStudioGlaze: true, createdAt: "2020-01-01T00:00:00Z",
  },
  {
    id: "g-jr-blue-celadon", slug: "jr-blue-celadon", name: "JR Blue Celadon", family: "Celadon", cone: 6,
    baseHex: "#9BB5BD", shade2Hex: "#78969F", onColor: "#1E2A2E", finish: "glossy",
    chemistry: "Fe · translucent",
    description: "A pale blue-green celadon, glassy and translucent. Pools darker in the lows to show off carved or thrown lines.",
    isStudioGlaze: true, createdAt: "2020-01-01T00:00:00Z",
  },
  {
    id: "g-spearmint", slug: "spearmint", name: "Spearmint", family: "Green", cone: 6,
    baseHex: "#7FA98C", shade2Hex: "#5C8266", onColor: "#17281C", finish: "glossy",
    chemistry: "Cu · mint",
    description: "A bright, cool mint green from copper. Clean and glossy, and one of the more eye-catching caps on the board.",
    isStudioGlaze: true, createdAt: "2020-01-01T00:00:00Z",
  },
  {
    id: "g-oribe-6", slug: "oribe-6", name: "Oribe 6", family: "Copper", cone: 6,
    baseHex: "#436B3F", shade2Hex: "#2C4A2A", onColor: "#EAF1E7", finish: "glossy",
    chemistry: "Cu · deep green",
    description: "A deep, saturated copper green in the Oribe tradition. Glassy and dark, breaking bright where it thins over edges.",
    isStudioGlaze: true, createdAt: "2020-01-01T00:00:00Z",
  },
  {
    id: "g-weathered-bronze", slug: "weathered-bronze", name: "Weathered Bronze", family: "Bronze", cone: 6,
    baseHex: "#4C4A38", shade2Hex: "#2C2A1D", onColor: "#E7E3D4", finish: "metallic",
    chemistry: "Mn · Fe · metallic",
    description: "A dark, metallic bronze-green that crystallizes into a weathered, patinated surface. Dramatic alone and over darks.",
    isStudioGlaze: true, createdAt: "2020-01-01T00:00:00Z",
  },
  {
    id: "g-metallic-black", slug: "metallic-black", name: "Metallic Black", family: "Black", cone: 6,
    baseHex: "#262523", shade2Hex: "#141310", onColor: "#E9E6DE", finish: "metallic",
    chemistry: "Fe · Mn · Co",
    description: "A dense near-black with a metallic sheen where it thickens. The heavyweight for contrast and layering edges.",
    isStudioGlaze: true, createdAt: "2020-01-01T00:00:00Z",
  },
  {
    id: "g-ketchup", slug: "ketchup", name: "Ketchup", family: "Red", cone: 6,
    baseHex: "#8A3324", shade2Hex: "#571B14", onColor: "#F5E3DC", finish: "glossy",
    chemistry: "Fe (sat.) · deep red",
    description: "A deep tomato red-brown from saturated iron. Glossy and warm, leaning darker and glassier where it runs.",
    isStudioGlaze: true, createdAt: "2020-01-01T00:00:00Z",
  },
  {
    id: "g-butterscotch", slug: "butterscotch", name: "Butterscotch", family: "Amber", cone: 6,
    baseHex: "#C1893B", shade2Hex: "#94611E", onColor: "#2E2010", finish: "glossy",
    chemistry: "Fe · Ti · amber",
    description: "A golden amber that breaks toasty over texture. Warm and honeyed on its own; glows under a clear or over a tan.",
    isStudioGlaze: true, createdAt: "2020-01-01T00:00:00Z",
  },
];

const BY_ID = new Map(GLAZES.map((g) => [g.id, g]));
const BY_SLUG = new Map(GLAZES.map((g) => [g.slug, g]));

export function getGlaze(id: string): Glaze | undefined {
  return BY_ID.get(id);
}

export function getGlazeBySlug(slug: string): Glaze | undefined {
  return BY_SLUG.get(slug);
}

export function getGlazes(ids: string[]): Glaze[] {
  return ids.map((id) => BY_ID.get(id)).filter((g): g is Glaze => Boolean(g));
}

/**
 * Material swatch fill used everywhere until real photos land.
 * Diagonal weave over a two-stop glaze gradient. Pass one glaze,
 * or two hexes for a combination (glaze[0].base → glaze[1].shade2).
 */
export function glazeFill(baseHex: string, shade2Hex: string): string {
  return [
    "repeating-linear-gradient(135deg, rgba(255,255,255,.055) 0 9px, rgba(28,18,8,.05) 9px 18px)",
    `linear-gradient(158deg, ${baseHex} 0%, ${shade2Hex} 96%)`,
  ].join(", ");
}

/** Fill for a single glaze swatch. */
export function swatchFill(glaze: Glaze): string {
  return glazeFill(glaze.baseHex, glaze.shade2Hex);
}

/** Fill for a piece: single glaze uses its own stops; a combo blends the
 *  first glaze's base into the last glaze's shade2. */
export function pieceFill(glazes: Glaze[]): string {
  if (glazes.length === 0) return glazeFill("#C4B49A", "#8A7A64");
  if (glazes.length === 1) return swatchFill(glazes[0]);
  return glazeFill(glazes[0].baseHex, glazes[glazes.length - 1].shade2Hex);
}
