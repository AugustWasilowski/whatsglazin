import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";

// A few warm two-stop gradients, picked deterministically from the id.
const GRADIENTS = [
  "linear-gradient(140deg,#C98A4E,#8C4A1E)",
  "linear-gradient(140deg,#8FA98A,#3E566E)",
  "linear-gradient(140deg,#B0552F,#5C3A22)",
  "linear-gradient(140deg,#55708A,#2C5B4B)",
  "linear-gradient(140deg,#D8C6A2,#7E3320)",
  "linear-gradient(140deg,#5E7E63,#241A12)",
];

function pick(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
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
