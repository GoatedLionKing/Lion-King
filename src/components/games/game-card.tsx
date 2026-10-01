import { Link } from "@tanstack/react-router";
import { StatusBadge } from "@/components/games/status-badge";
import { coverSrc } from "@/lib/format";
import type { Game } from "@/lib/types";
import { tx } from "@/lib/i18n";

export function GameCard({ game }: { game: Game }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-gold/50 hover:shadow-gold">
      <Link
        to="/games/$slug"
        params={{ slug: game.slug }}
        className="block aspect-[2/3] overflow-hidden bg-surface-2"
      >
        <img
          src={coverSrc(game.cover)}
          alt={game.title}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          loading="lazy"
        />
      </Link>

      <div className="flex min-h-[150px] flex-col p-3">
        <div className="mb-1 flex items-center gap-1.5 overflow-hidden text-[10px] uppercase tracking-wider">
          <span className="shrink-0 text-gold">
            {tx(game.platform_name ?? "")}
          </span>
          <span className="text-subtle">•</span>
          <span className="truncate text-muted">
            {tx(game.project_type_name ?? "")}
          </span>
        </div>

        <h3 className="line-clamp-2 font-display text-base leading-snug text-fg">
          <Link
            to="/games/$slug"
            params={{ slug: game.slug }}
            className="transition-colors hover:text-gold-2"
          >
            {game.title}
          </Link>
        </h3>

        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
          {game.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <StatusBadge
            statusId={game.status_id}
            label={game.status_name ?? game.status_id}
          />

          <Link
            to="/games/$slug"
            params={{ slug: game.slug }}
            className="text-xs font-medium text-gold transition-colors hover:text-gold-2"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

export function GameCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="aspect-[2/3] animate-pulse bg-surface-2" />
      <div className="space-y-2 p-3">
        <div className="h-2.5 w-20 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
        <div className="h-8 w-full animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  );
}
