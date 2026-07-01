import type { Metadata } from "next";
import { AuthPanel } from "@/components/auth/AuthPanel";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to WhatsGlazin.",
};

export default function AuthPage() {
  return (
    <main
      className="grid min-h-screen place-items-center px-6 py-12"
      style={{
        background: "radial-gradient(120% 70% at 50% 0%, #F1E7D6, #E7DDC9)",
      }}
    >
      <AuthPanel />
    </main>
  );
}
