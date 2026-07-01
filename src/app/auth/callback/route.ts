import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * The public origin of the request. Behind Fly's proxy, `new URL(request.url)`
 * yields the internal bind address (0.0.0.0:3000), so prefer the forwarded host.
 */
function publicOrigin(request: Request): string {
  const { origin } = new URL(request.url);
  const host = request.headers.get("x-forwarded-host");
  if (!host) return origin;
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

/**
 * OAuth + magic-link return here with a `code`. Exchange it for a session
 * (sets the auth cookies), then continue to the requested page.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/gallery";
  const base = publicOrigin(request);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${base}${next}`);
    }
  }

  return NextResponse.redirect(`${base}/auth?error=callback`);
}
