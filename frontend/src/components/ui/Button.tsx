import { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/12 bg-white/10 px-4 text-sm font-medium text-ink transition hover:bg-white/16 focus:outline-none focus:ring-2 focus:ring-teal disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

