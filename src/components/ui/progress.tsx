import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className)}>
      <div className="h-full bg-gold transition-[width] duration-200" style={{ width: `${pct}%` }} />
    </div>
  );
}
