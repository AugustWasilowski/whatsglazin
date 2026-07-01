import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components / the browser.
 * Reads the anon (publishable) key — access is enforced by RLS, not secrecy.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
