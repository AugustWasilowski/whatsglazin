import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-md border-[1.5px] border-line-strong bg-bone px-4 text-[15px] text-ink placeholder:text-slip focus:border-terracotta focus:outline-none focus:ring-[3px] focus:ring-terracotta/15";

const inputSizes = {
  md: "h-11",
  lg: "h-12",
} as const;

type InputProps = {
  inputSize?: keyof typeof inputSizes;
} & React.InputHTMLAttributes<HTMLInputElement>;

/** The studio's standard text input. `inputSize` lg = search/hero, md = forms. */
export function Input({ inputSize = "lg", className, ...props }: InputProps) {
  return (
    <input
      className={cn(inputBase, inputSizes[inputSize], className)}
      {...props}
    />
  );
}

/** Same skin for multi-line fields. */
export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(inputBase, "min-h-[96px] py-3", className)}
      {...props}
    />
  );
}
