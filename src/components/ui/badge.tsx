import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "gold",
  children,
}: {
  className?: string;
  tone?: "gold" | "muted" | "success" | "warn";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        tone === "gold" && "border-gold/35 bg-gold/10 text-gold-2",
        tone === "muted" && "border-border bg-surface-2 text-muted",
        tone === "success" && "border-success/35 bg-success/10 text-success",
        tone === "warn" && "border-warn/35 bg-warn/10 text-warn",
        className,
      )}
    >
      {children}
    </span>
  );
}
