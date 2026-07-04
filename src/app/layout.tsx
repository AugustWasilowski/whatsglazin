import type { Metadata, Viewport } from "next";
import { Young_Serif, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { GlazeCursor } from "@/components/motion/GlazeCursor";
import "./globals.css";

// Display face — headlines, glaze names, numerals. Weight 400 only.
const youngSerif = Young_Serif({
  variable: "--font-young-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// UI / body — all interface text.
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Lab face — spec labels, chemistry notation, firing tags.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://whatsglazin.com"),
  title: {
    default: "WhatsGlazin — The Fine Line pottery studio",
    template: "%s · WhatsGlazin",
  },
  description:
    "A gallery of finished pottery, each piece tagged with the exact glazes on it — see how every glaze actually fires, searchable by glaze, combination, and maker.",
  applicationName: "WhatsGlazin",
  appleWebApp: { capable: true, title: "WhatsGlazin", statusBarStyle: "default" },
  openGraph: {
    title: "WhatsGlazin",
    description: "A living gallery and glaze library for The Fine Line pottery studio.",
    url: "https://whatsglazin.com",
    siteName: "WhatsGlazin",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f1e7d6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${youngSerif.variable} ${hanken.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        {children}
        <GlazeCursor />
      </body>
    </html>
  );
}
