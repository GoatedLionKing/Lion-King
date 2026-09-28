import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg placeholder:text-subtle outline-none transition-[border-color,box-shadow] duration-150 focus:border-gold/50 focus:ring-2 focus:ring-gold/30",
          className,
        )}
        {...props}
      />
    );
  },
);
