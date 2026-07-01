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

/** Gradient initials avatar. */
export function Avatar({
  member,
  size = 44,
  className,
}: {
  member: Member;
  size?: number;
  className?: string;
}) {
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
