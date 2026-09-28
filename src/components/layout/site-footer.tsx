import { Link } from "@tanstack/react-router";
import { LionMark } from "@/components/brand/lion-mark";

import { tx } from "@/lib/i18n";
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <LionMark className="size-8" />
          <div>
            <p className="font-display text-sm tracking-[0.18em] text-gold uppercase">Goated LionKing</p>
            <p className="text-xs text-muted">{tx("Arabic Game Localization & Modding")}</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          <Link to="/games" className="hover:text-gold">
            Games
          </Link>
          <Link to="/latest" className="hover:text-gold">
            Latest
          </Link>
          <Link to="/search" search={{ q: "" }} className="hover:text-gold">
            Search
          </Link>
        </nav>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-subtle">
        © 2026 Goated LionKing — All Rights Reserved.
      </div>
    </footer>
  );
}
