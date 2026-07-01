import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// A simple branded home-screen icon: terracotta field, wordmark "W?".
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#b0552f",
          color: "#f7efe2",
          fontSize: 108,
          fontWeight: 700,
          fontFamily: "serif",
        }}
      >
        W?
      </div>
    ),
    { ...size },
  );
}
