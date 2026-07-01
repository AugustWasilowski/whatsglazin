import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-colors select-none disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  // ≥48px tall, warm glow.
  primary:
    "bg-terracotta text-on-terracotta hover:bg-terracotta-hover shadow-[var(--shadow-glow)]",
  secondary:
    "bg-clay-deep/70 text-ink border border-line-strong hover:bg-clay-deep",
  ghost: "text-celadon hover:text-ink bg-transparent",
};

const sizes: Record<Size, string> = {
  md: "min-h-[48px] px-5 text-[15px]",
  lg: "min-h-[52px] px-6 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
  ...props
}: CommonProps &
  { href: string } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
  >) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}
