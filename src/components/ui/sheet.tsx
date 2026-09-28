import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  children,
  title,
}: {
  className?: string;
  children: ReactNode;
  title: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-bg/80" />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(100%,20rem)] flex-col border-l border-border bg-surface p-5",
          className,
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <DialogPrimitive.Title className="font-display text-base tracking-wide text-gold">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close className="rounded-md p-2 text-muted hover:bg-surface-2 hover:text-fg">
            <X className="size-4" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
