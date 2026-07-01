import { redirect } from "next/navigation";

/**
 * "You" tab. Until auth is wired (Phase 3), this bounces to sign-in.
 * Once sessions exist it will render the current member's own profile.
 */
export default function YouPage() {
  redirect("/auth");
}
