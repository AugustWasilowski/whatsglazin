import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WhatsGlazin — The Fine Line pottery studio",
    short_name: "WhatsGlazin",
    description:
      "A living gallery and glaze library for The Fine Line pottery studio.",
    start_url: "/",
    display: "standalone",
    background_color: "#f1e7d6",
    theme_color: "#f1e7d6",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
