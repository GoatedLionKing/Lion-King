import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Library, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { LionMark } from "@/components/brand/lion-mark";
import { UserButton } from "@/lib/auth/gates";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/owner-panel", label: "نظرة عامة", icon: LayoutDashboard },
  { to: "/owner-panel/games", label: "الألعاب", icon: Library },
  { to: "/owner-panel/settings", label: "الإعدادات", icon: Settings },
] as const;

export function AdminShell({ children }: { children?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center gap-3 px-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link to="/" className="flex shrink-0 items-center gap-2">
              <LionMark className="size-7" />
              <span className="font-display text-xs tracking-[0.18em] text-gold uppercase">{"الإدارة"}</span>
            </Link>
            <div className="hidden md:block">
              <nav className="flex items-center gap-1">
                {LINKS.map((item) => {
                  const active = item.to === "/owner-panel" ? pathname === "/owner-panel" : pathname.startsWith(item.to);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "inline-flex h-11 shrink-0 items-center gap-2 px-3 text-sm",
                        active ? "text-gold" : "text-muted hover:text-fg",
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
          <UserButton />
          <nav className="order-3 -mx-1 flex w-[calc(100%+0.5rem)] items-center gap-1 overflow-x-auto border-t border-border/60 py-1 md:hidden">
            {LINKS.map((item) => {
              const active = item.to === "/owner-panel" ? pathname === "/owner-panel" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm",
                    active ? "bg-surface-2 text-gold" : "text-muted hover:text-fg",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">{children ?? <Outlet />}</div>
    </div>
  );
}
