import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Sign out and return home (via the public host, not the internal proxy addr). */
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const { origin } = new URL(request.url);
  const host = request.headers.get("x-forwarded-host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const base = host ? `${proto}://${host}` : origin;

  return NextResponse.redirect(`${base}/`, { status: 303 });
}
