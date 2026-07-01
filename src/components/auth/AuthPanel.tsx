"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/** Auth panel — Google SSO + passwordless email (6-digit code). */
export function AuthPanel() {
  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"form" | "code">("form");
  const [busy, setBusy] = useState<null | "google" | "email" | "verify">(null);
  const [error, setError] = useState<string | null>(null);

  function nextPath() {
    return new URLSearchParams(window.location.search).get("next") || "/gallery";
  }

  async function signInWithGoogle() {
    setBusy("google");
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath())}`,
      },
    });
    if (error) {
      setError(error.message);
      setBusy(null);
    }
    // On success the browser redirects to Google.
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy("email");
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setBusy(null);
    if (error) setError(error.message);
    else setStage("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length < 6) return;
    setBusy("verify");
    setError(null);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });
    if (error) {
      setError(error.message);
      setBusy(null);
    } else {
      // Full navigation so the server picks up the new session cookie.
      window.location.href = nextPath();
    }
  }

  // ---------- CODE ENTRY ----------
  if (stage === "code") {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto grid h-[78px] w-[78px] place-items-center rounded-lg bg-clay-deep text-terracotta animate-[wg-pop_0.5s_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:animate-none">
          <Mail size={34} />
        </div>
        <h1 className="mt-6 font-display text-3xl text-ink">Enter your code</h1>
        <p className="mt-2 text-ink-2">
          We emailed a sign-in code to <strong>{email}</strong>. It&rsquo;s good for
          a few minutes.
        </p>

        {error && (
          <p className="mt-5 rounded-md border border-error-line bg-error-bg px-4 py-2.5 text-sm text-error">
            {error}
          </p>
        )}

        <form onSubmit={verifyCode} className="mt-6 flex flex-col gap-3">
          <label htmlFor="code" className="sr-only">
            6-digit code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={10}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="Code from email"
            className="h-14 w-full rounded-md border-[1.5px] border-line-strong bg-bone px-4 text-center font-mono text-xl tracking-[0.3em] text-ink placeholder:tracking-normal placeholder:text-base placeholder:text-slip focus:border-terracotta focus:outline-none focus:ring-[3px] focus:ring-terracotta/15"
          />
          <button
            type="submit"
            disabled={busy !== null || code.length < 6}
            className="inline-flex min-h-[48px] items-center justify-center rounded-md bg-terracotta px-5 font-semibold text-on-terracotta shadow-[var(--shadow-glow)] transition-colors hover:bg-terracotta-hover disabled:opacity-60"
          >
            {busy === "verify" ? "Verifying…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slip">
          Didn&rsquo;t get it?{" "}
          <button
            onClick={() => {
              setStage("form");
              setCode("");
              setError(null);
            }}
            className="font-medium text-celadon hover:text-ink"
          >
            Use a different email
          </button>
        </p>
      </div>
    );
  }

  // ---------- SIGN IN ----------
  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center text-center">
        <span
          className="grid h-[66px] w-[66px] place-items-center overflow-hidden rounded-lg"
          style={{
            background:
              "conic-gradient(from 210deg, #8FA98A, #55708A, #B0552F, #C98A4E, #3F7A66, #8FA98A)",
          }}
          aria-hidden
        >
          <span
            className="h-full w-full"
            style={{
              background:
                "repeating-linear-gradient(135deg, rgba(255,255,255,.14) 0 8px, rgba(28,18,8,.10) 8px 16px)",
            }}
          />
        </span>
        <h1 className="mt-4 font-display text-[32px] leading-none text-ink">
          What&rsquo;sGlazin<span className="text-terracotta">?</span>
        </h1>
        <p className="mt-2 text-ink-2">
          Sign in to log your pieces and browse the studio.
        </p>
      </div>

      {error && (
        <p className="mt-5 rounded-md border border-error-line bg-error-bg px-4 py-2.5 text-sm text-error">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={busy !== null}
          className="inline-flex min-h-[48px] items-center justify-center gap-3 rounded-md border border-line-strong bg-bone px-5 font-semibold text-ink transition-colors hover:bg-clay/40 disabled:opacity-60"
        >
          <GoogleG />
          {busy === "google" ? "Redirecting…" : "Continue with Google"}
        </button>
      </div>

      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-slip">
        <span className="h-px flex-1 bg-line-strong" />
        or with email
        <span className="h-px flex-1 bg-line-strong" />
      </div>

      <form onSubmit={sendCode} className="flex flex-col gap-3">
        <label htmlFor="email" className="sr-only">
          Email address
        </label>
        <div className="relative">
          <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slip" />
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@thefineline.studio"
            className="h-12 w-full rounded-md border-[1.5px] border-line-strong bg-bone pl-11 pr-4 text-[15px] text-ink placeholder:text-slip focus:border-terracotta focus:outline-none focus:ring-[3px] focus:ring-terracotta/15"
          />
        </div>
        <button
          type="submit"
          disabled={busy !== null}
          className="inline-flex min-h-[48px] items-center justify-center rounded-md bg-terracotta px-5 font-semibold text-on-terracotta shadow-[var(--shadow-glow)] transition-colors hover:bg-terracotta-hover disabled:opacity-60"
        >
          {busy === "email" ? "Sending…" : "Email me a code"}
        </button>
      </form>
    </div>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path fill="#4285F4" d="M23.06 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.38Z" />
      <path fill="#34A853" d="M12 24c3.1 0 5.7-1.03 7.6-2.78l-3.72-2.89c-1.03.69-2.35 1.1-3.88 1.1-2.98 0-5.5-2.01-6.4-4.72H1.76v2.98A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.6 14.71a7.2 7.2 0 0 1 0-4.42V7.31H1.76a12 12 0 0 0 0 10.38l3.84-2.98Z" />
      <path fill="#EA4335" d="M12 4.75c1.68 0 3.19.58 4.38 1.72l3.28-3.28C17.7 1.2 15.1 0 12 0A12 12 0 0 0 1.76 7.31l3.84 2.98C6.5 6.76 9.02 4.75 12 4.75Z" />
    </svg>
  );
}
