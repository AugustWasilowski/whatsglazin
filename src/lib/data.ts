import type { Member, Piece } from "./types";

/**
 * Demo members/pieces used to live here so screens rendered before real uploads
 * existed. They've been removed — real members and pieces now come entirely from
 * the app (Supabase). These arrays are the seed source for `npm run seed:gen`,
 * which now seeds only the studio glazes (see src/lib/glazes.ts).
 */
export const MEMBERS: Member[] = [];
export const PIECES: Piece[] = [];
