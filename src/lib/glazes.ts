import type { Glaze } from "./types";

/**
 * The Fine Line's 10 studio glazes. These are the seed set — real content
 * is confirmed by the studio; descriptions here are illustrative.
 * In Phase 2 this array seeds the Supabase `glazes` table.
 */
export const GLAZES: Glaze[] = [
  {
    id: "g-celadon",
    slug: "studio-celadon",
    name: "Studio Celadon",
    family: "Celadon",
    baseHex: "#8FA98A",
    shade2Hex: "#6E8A6C",
    onColor: "#22301F",
    finish: "satin",
    chemistry: "Fe · reduction",
    description:
      "The house celadon — a soft, jade-leaning green that pools darker where it breaks over throwing lines. Reads calm and translucent over porcelain.",
    isStudioGlaze: true,
    createdAt: "2014-03-01T00:00:00Z",
  },
  {
    id: "g-tenmoku",
    slug: "tenmoku",
    name: "Tenmoku",
    family: "Iron",
    baseHex: "#2E2016",
    shade2Hex: "#5C3A22",
    onColor: "#F0E4D2",
    finish: "glossy",
    chemistry: "Fe (high) · reduction",
    description:
      "A deep iron-saturated brown-black that breaks rust-red on rims and edges. Glassy and dramatic; a studio staple for contrast.",
    isStudioGlaze: true,
    createdAt: "2014-03-01T00:00:00Z",
  },
  {
    id: "g-shino",
    slug: "shino",
    name: "Shino",
    family: "Feldspathic",
    baseHex: "#C98A4E",
    shade2Hex: "#A9662F",
    onColor: "#3A2410",
    finish: "matte",
    chemistry: "Soda feldspar · carbon trap",
    description:
      "A warm, toasty feldspathic glaze with carbon-trapped blushes. Dry-to-satin surface that loves a heavy hand and a reduction cool.",
    isStudioGlaze: true,
    createdAt: "2014-03-01T00:00:00Z",
  },
  {
    id: "g-chun-blue",
    slug: "chun-blue",
    name: "Chun Blue",
    family: "Ash·Blue",
    baseHex: "#55708A",
    shade2Hex: "#3E566E",
    onColor: "#EAF0F5",
    finish: "glossy",
    chemistry: "Ash · Fe · P opalescence",
    description:
      "An opalescent ash-blue that scatters cool where it thickens. Best poured thick so it pools into that milky sky tone.",
    isStudioGlaze: true,
    createdAt: "2014-03-01T00:00:00Z",
  },
  {
    id: "g-iron-red",
    slug: "iron-red",
    name: "Iron Red",
    family: "Iron",
    baseHex: "#A5482B",
    shade2Hex: "#7E3320",
    onColor: "#F5E7E0",
    finish: "satin",
    chemistry: "Fe (sat.) · slow cool",
    description:
      "A saturated iron red with an orange-peel satin surface. Needs a patient cool to bloom its crystalline reds.",
    isStudioGlaze: true,
    createdAt: "2014-03-01T00:00:00Z",
  },
  {
    id: "g-nuka",
    slug: "nuka-oatmeal",
    name: "Nuka Oatmeal",
    family: "Ash",
    baseHex: "#D8C6A2",
    shade2Hex: "#B9A379",
    onColor: "#3A3018",
    finish: "satin",
    chemistry: "Rice-ash · SiO₂",
    description:
      "A creamy rice-ash white with oatmeal speckle. Soft and food-friendly; breaks warm over texture and edges.",
    isStudioGlaze: true,
    createdAt: "2014-03-01T00:00:00Z",
  },
  {
    id: "g-copper-green",
    slug: "copper-green",
    name: "Copper Green",
    family: "Copper",
    baseHex: "#3F7A66",
    shade2Hex: "#2C5B4B",
    onColor: "#E7F1EC",
    finish: "glossy",
    chemistry: "Cu · oxidation",
    description:
      "A clear, glassy copper green that runs toward emerald where it's thick. Bright in oxidation, a little wild near the foot.",
    isStudioGlaze: true,
    createdAt: "2014-03-01T00:00:00Z",
  },
  {
    id: "g-ash-falls",
    slug: "ash-falls",
    name: "Ash Falls",
    family: "Ash",
    baseHex: "#7E8574",
    shade2Hex: "#5E6455",
    onColor: "#EDF0E9",
    finish: "runny",
    chemistry: "Wood-ash · high flux",
    description:
      "A mobile wood-ash glaze that streaks and rivers down the pot. Leave a gap at the foot — it will find it.",
    isStudioGlaze: true,
    createdAt: "2014-03-01T00:00:00Z",
  },
  {
    id: "g-kaki",
    slug: "kaki-persimmon",
    name: "Kaki Persimmon",
    family: "Iron",
    baseHex: "#B4622C",
    shade2Hex: "#8C4A1E",
    onColor: "#F7EBE0",
    finish: "satin",
    chemistry: "Fe (sat.) · matte flux",
    description:
      "A persimmon-orange iron matte with a suede surface. Sister to Iron Red but drier and more opaque.",
    isStudioGlaze: true,
    createdAt: "2014-03-01T00:00:00Z",
  },
  {
    id: "g-bone-matte",
    slug: "bone-matte",
    name: "Bone Matte",
    family: "Liner",
    baseHex: "#E7DDCC",
    shade2Hex: "#CFC3AC",
    onColor: "#3A3018",
    finish: "dry matte",
    chemistry: "Mg matte · liner-safe",
    description:
      "A soft bone-white dry matte, smooth enough to line a cup. The quiet neutral that lets a second glaze do the talking.",
    isStudioGlaze: true,
    createdAt: "2014-03-01T00:00:00Z",
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
