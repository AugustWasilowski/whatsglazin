import Image from "next/image";
import { cn } from "@/lib/utils";
import { GLAZES, glazeFill } from "@/lib/glazes";
import type { Member } from "@/lib/types";

// Member identity drawn from the studio's own materials: hash the id into
// one of the real glaze fills. Bone initials sit on top, so only glazes dark
// enough to carry them qualify.
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 0xff) + 0.114 * (n & 0xff)) / 255;
}
const AVATAR_GLAZES = GLAZES.filter((g) => luminance(g.baseHex) < 0.55);

function pick(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const g = AVATAR_GLAZES[h % AVATAR_GLAZES.length];
  return glazeFill(g.baseHex, g.shade2Hex);
}

/** `avatar` holding an uploaded image URL vs. a short initials string. */
function isPhoto(avatar?: string): avatar is string {
  return typeof avatar === "string" && /^https?:\/\//.test(avatar);
}

/** Member avatar — uploaded photo when present, otherwise gradient initials. */
export function Avatar({
  member,
  size = 44,
  className,
}: {
  member: Member;
  size?: number;
  className?: string;
}) {
  if (isPhoto(member.avatar)) {
    return (
      <span
        className={cn("relative block shrink-0 overflow-hidden rounded-full", className)}
        style={{ width: size, height: size }}
      >
        <Image
          src={member.avatar}
          alt={member.name}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      </span>
    );
  }

  const initials =
    member.avatar ??
    member.name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("");
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-display text-bone",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: pick(member.id),
        fontSize: size * 0.38,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
