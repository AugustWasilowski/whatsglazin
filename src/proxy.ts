import { type NextFetchEvent, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Privacy-friendly page-view ping: count one view per real document request —
 * no cookies, no IP, no user agent stored; just (path, day) counters.
 * Fire-and-forget via event.waitUntil so it can never slow a page down.
 */
function logPageView(request: NextRequest, event: NextFetchEvent) {
  if (request.method !== "GET") return;
  // Only full document loads — excludes RSC payload fetches and prefetches.
  if (request.headers.get("sec-fetch-dest") !== "document") return;
  if (request.headers.get("next-router-prefetch") || request.headers.get("purpose") === "prefetch")
    return;

  const path = request.nextUrl.pathname;
  if (path.startsWith("/auth")) return; // auth flow isn't traffic

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;

  event.waitUntil(
    fetch(`${url}/rest/v1/rpc/log_page_view`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ p_path: path }),
    }).catch(() => {}),
  );
}

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  logPageView(request, event);
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Run on everything except Next internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
