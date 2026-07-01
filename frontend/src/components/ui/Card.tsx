import { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-white/10 bg-panel p-4 shadow-glass backdrop-blur-xl", className)}
      {...props}
    />
  );
}

