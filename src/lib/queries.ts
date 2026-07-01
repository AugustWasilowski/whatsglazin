import { PIECES } from "./data";
import { getGlaze } from "./glazes";
import type { Glaze } from "./types";

/**
 * Glazes that most often appear alongside a given glaze on the same piece.
 * Powers the "common combinations" section on a glaze detail page.
 */
export function coOccurringGlazes(
  glazeId: string,
): { glaze: Glaze; count: number }[] {
  const counts = new Map<string, number>();
  for (const piece of PIECES) {
    if (!piece.glazeIds.includes(glazeId)) continue;
    for (const other of piece.glazeIds) {
      if (other === glazeId) continue;
      counts.set(other, (counts.get(other) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([id, count]) => ({ glaze: getGlaze(id), count }))
    .filter((x): x is { glaze: Glaze; count: number } => Boolean(x.glaze))
    .sort((a, b) => b.count - a.count);
}
