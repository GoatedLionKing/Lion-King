import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/games/empty-state";
import { GameCard } from "@/components/games/game-card";
import { StatusBadge } from "@/components/games/status-badge";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { coverSrc, formatDate } from "@/lib/format";
import { getFeaturedGames, getLatestReleases, getSiteSettings } from "@/lib/server/catalog";

import { tx } from "@/lib/i18n";
export const Route = createFileRoute("/")({
  loader: async () => {
    const [settings, featured, latest] = await Promise.all([
      getSiteSettings(),
      getFeaturedGames(),
      getLatestReleases(),
    ]);
    return { settings, featured, latest };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.settings.seo_title ?? "GOATED LIONKING" },
      { name: "description", content: loaderData?.settings.seo_description ?? "" },
    ],
  }),
  component: Home,
});

function Home() {
  const { settings, featured, latest } = Route.useLoaderData();

  return (
    <PublicShell>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgb(212_175_55/0.16)_0,transparent_24%),radial-gradient(circle_at_82%_70%,rgb(212_175_55/0.10)_0,transparent_28%),linear-gradient(135deg,rgb(7_7_8)_0%,rgb(15_13_9)_48%,rgb(7_7_8)_100%)]" />
        <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle,transparent_0,transparent_45%,rgb(212_175_55/0.35)_46%,transparent_47%)] bg-[length:90px_90px]" />
        <div className="relative mx-auto flex min-h-[32rem] max-w-6xl flex-col justify-center px-4 py-20 md:min-h-[36rem]">
          <p className="text-xs tracking-[0.32em] text-gold uppercase">{settings.hero_subtitle}</p>
          <h1 className="mt-4 max-w-xl font-display text-4xl leading-[1.1] text-fg md:text-6xl">
            {settings.hero_title}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted md:text-lg">
            {settings.hero_description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/games">{tx("Browse Games")}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/latest">{tx("Latest Releases")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.28em] text-gold uppercase">{tx("Archive")}</p>
            <h2 className="mt-2 font-display text-3xl text-fg">{settings.featured_heading}</h2>
          </div>
          <Link to="/games" className="hidden items-center gap-1 text-sm text-gold hover:text-gold-2 sm:inline-flex">
            All games <ArrowRight className="size-4" />
          </Link>
        </div>
        {featured.length === 0 ? (
          <EmptyState title="No games available yet." body="Published featured projects will appear here." />
        ) : (
          <div className="grid gap-3 grid-cols-4 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-5">
            {featured.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.28em] text-gold uppercase">{tx("Just in")}</p>
              <h2 className="mt-2 font-display text-3xl text-fg">{settings.latest_heading}</h2>
            </div>
            <Link to="/latest" className="hidden items-center gap-1 text-sm text-gold hover:text-gold-2 sm:inline-flex">
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          {latest.length === 0 ? (
            <EmptyState title="No releases yet." body="New files will show up here as soon as they are published." />
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-bg">
              {latest.map((item) => (
                <li key={item.file_id}>
                  <Link
                    to="/download/$fileId"
                    params={{ fileId: item.file_id }}
                    className="flex gap-4 p-4 transition-colors hover:bg-surface-2"
                  >
                    <img
                      src={coverSrc(item.game_cover)}
                      alt=""
                      className="size-16 shrink-0 rounded-md object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-fg">{item.game_title}</p>
                      <p className="truncate text-sm text-muted">
                        {item.file_name} · {item.version_name} · {item.platform_name}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge statusId={item.status_id} label={item.status_name} />
                        <span className="text-xs text-subtle">{formatDate(item.file_created_at)}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </PublicShell>
  );
}
