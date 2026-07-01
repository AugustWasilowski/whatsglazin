import { createClient } from "@/lib/supabase/server";
import type { Member } from "./types";

/** Raw DB member row → app Member shape. */
function toMember(row: Record<string, unknown>): Member {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    avatar: (row.avatar as string) ?? undefined,
    memberSince: (row.member_since as number) ?? new Date().getFullYear(),
    disciplines: (row.disciplines as string[]) ?? [],
  };
}

/**
 * The current auth user plus their studio member row (created by the DB
 * trigger on first sign-in). Both null when signed out.
 */
export async function getSessionMember(): Promise<{
  user: { id: string; email?: string } | null;
  member: Member | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, member: null };

  const { data } = await supabase
    .from("members")
    .select("*")
    .eq("auth_id", user.id)
    .maybeSingle();

  return {
    user: { id: user.id, email: user.email },
    member: data ? toMember(data) : null,
  };
}
