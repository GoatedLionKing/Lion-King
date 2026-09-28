import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Library, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { LionMark } from "@/components/brand/lion-mark";
import { UserButton } from "@/lib/auth/gates";
import { cn } from "@/lib/utils";
import { LanguageSwitcher, tx, useLanguage } from "@/lib/i18n";

const LINKS = [
  { to: "/owner-panel", label: "Overview", icon: LayoutDashboard },
  { to: "/owner-panel/games", label: "Games", icon: Library },
  { to: "/owner-panel/settings", label: "Settings", icon: Settings },
] as const;

export function AdminShell({ children }: { children?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { language } = useLanguage();
  return (
    <div key={language} className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <LionMark className="size-7" />
            <span className="font-display text-xs tracking-[0.18em] text-gold uppercase">{tx("Admin")}</span>
          </Link>
          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
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
                  {tx(item.label)}
                </Link>
              );
            })}
          </nav>
          <LanguageSwitcher />
          <UserButton />
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">{children ?? <Outlet />}</div>
    </div>
  );
}
