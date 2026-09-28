import { Link } from "@tanstack/react-router";
import { StatusBadge } from "@/components/games/status-badge";
import { coverSrc } from "@/lib/format";
import type { Game } from "@/lib/types";
import { tx } from "@/lib/i18n";

export function GameCard({ game }: { game: Game }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-[border-color,transform] duration-200 hover:border-gold/40">
      <Link to="/games/$slug" params={{ slug: game.slug }} className="block aspect-[2/3] overflow-hidden bg-surface-2">
        <img
          src={coverSrc(game.cover)}
          alt=""
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] tracking-wide text-gold uppercase">{tx(game.platform_name ?? "")}</span>
          <span className="text-subtle">·</span>
          <span className="text-[11px] tracking-wide text-muted uppercase">{tx(game.project_type_name ?? "")}</span>
        </div>
        <h3 className="font-display text-lg leading-snug text-fg">
          <Link to="/games/$slug" params={{ slug: game.slug }} className="hover:text-gold-2">
            {game.title}
          </Link>
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{game.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <StatusBadge statusId={game.status_id} label={game.status_name ?? game.status_id} />
          <Link
            to="/games/$slug"
            params={{ slug: game.slug }}
            className="inline-flex h-11 items-center text-sm font-medium text-gold hover:text-gold-2"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

export function GameCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="aspect-[2/3] animate-pulse bg-surface-2" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-24 animate-pulse rounded bg-surface-2" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-surface-2" />
        <div className="h-12 w-full animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  );
}
