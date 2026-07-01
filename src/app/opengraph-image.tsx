import { ImageResponse } from "next/og";

export const alt = "WhatsGlazin — a living gallery and glaze library for The Fine Line";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #f1e7d6, #e4d3ba)",
          color: "#2a1c0e",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 4, color: "#b0552f", textTransform: "uppercase" }}>
          The Fine Line
        </div>
        <div style={{ fontSize: 92, fontWeight: 700, marginTop: 16 }}>WhatsGlazin?</div>
        <div style={{ fontSize: 40, marginTop: 24, color: "#5a4a34", maxWidth: 900 }}>
          Snap a piece off the kiln shelf, log the glaze, and it joins a gallery the whole studio can
          search.
        </div>
      </div>
    ),
    { ...size },
  );
}
