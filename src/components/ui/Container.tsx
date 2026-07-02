import { cn } from "@/lib/utils";

const widths = {
  default: "max-w-[1180px]",
  wall: "max-w-[1400px]", // immersive bands: landing, gallery
  reading: "max-w-[760px]", // piece detail body, editorial copy
  form: "max-w-[560px]", // add flow, profile, auth-adjacent forms
} as const;

/** Standard page gutter + measured width. */
export function Container({
  size = "default",
  className,
  children,
}: {
  size?: keyof typeof widths;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full px-5 sm:px-10", widths[size], className)}>
      {children}
    </div>
  );
}
