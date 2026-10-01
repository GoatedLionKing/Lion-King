import { createFileRoute } from "@tanstack/react-router";
import { CatalogFilters, Pagination, parseCatalogSearch } from "@/components/games/filters";
import { EmptyState } from "@/components/games/empty-state";
import { GameCard } from "@/components/games/game-card";
import { PublicShell } from "@/components/layout/public-shell";
import { getLookups, listGames } from "@/lib/server/catalog";

import { tx } from "@/lib/i18n";
export const Route = createFileRoute("/games/")({
  validateSearch: parseCatalogSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [lookups, result] = await Promise.all([
      getLookups(),
      listGames({
        data: {
          q: deps.q || undefined,
          platform: deps.platform || undefined,
          type: deps.type || undefined,
          status: deps.status || undefined,
          letter: deps.letter || undefined,
          page: deps.page,
        },
      }),
    ]);
    return { lookups, ...result };
  },
  head: () => ({
    meta: [
      { title: "Games — GOATED LIONKING" },
      { name: "description", content: "Browse Arabic localization projects, patches, mods, fonts, and dubbed audio." },
    ],
  }),
  component: GamesPage,
});

function GamesPage() {
  const { lookups, games, total, page, pageSize } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <PublicShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <p className="text-xs tracking-[0.28em] text-gold uppercase">{tx("Catalog")}</p>
        <h1 className="mt-2 font-display text-4xl text-fg">{tx("Games")}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Every published localization project, patch, font, and audio pack in the archive.
        </p>
        <div className="mt-8">
          <CatalogFilters lookups={lookups} value={search} to="/games" />
        </div>
        <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-surface p-2">
          <div className="flex min-w-max items-center gap-1">
            <button
              type="button"
              className={`flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-xs font-semibold transition-colors ${
                !search.letter
                  ? "bg-gold text-bg"
                  : "text-muted hover:bg-surface-2 hover:text-gold-2"
              }`}
              onClick={() =>
                void navigate({
                  search: { ...search, letter: undefined, page: undefined },
                })
              }
            >
              ALL
            </button>

            {letters.map((letter) => (
              <button
                key={letter}
                type="button"
                className={`flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-xs font-semibold transition-colors ${
                  search.letter?.toUpperCase() === letter
                    ? "bg-gold text-bg"
                    : "text-muted hover:bg-surface-2 hover:text-gold-2"
                }`}
                onClick={() =>
                  void navigate({
                    search: {
                      ...search,
                      letter,
                      page: undefined,
                    },
                  })
                }
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {games.length === 0 ? (
            <EmptyState title="No games available yet." body="No published projects match these filters." />
          ) : (
            <div className="grid gap-4 grid-cols-1">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>
        <Pagination page={page} total={total} pageSize={pageSize} to="/games" search={search} />
      </main>
    </PublicShell>
  );
}
