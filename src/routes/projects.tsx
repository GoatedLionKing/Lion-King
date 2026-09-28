import { createFileRoute } from "@tanstack/react-router";
import { CatalogFilters, Pagination, parseCatalogSearch } from "@/components/games/filters";
import { EmptyState } from "@/components/games/empty-state";
import { GameCard } from "@/components/games/game-card";
import { PublicShell } from "@/components/layout/public-shell";
import { getLookups, listGames } from "@/lib/server/catalog";

import { tx } from "@/lib/i18n";
export const Route = createFileRoute("/projects")({
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
          page: deps.page,
        },
      }),
    ]);
    return { lookups, ...result };
  },
  head: () => ({
    meta: [
      { title: "Projects — GOATED LIONKING" },
      { name: "description", content: "Arabic localization, dubbing, translation, mods, patches, fonts, and audio." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { lookups, games, total, page, pageSize } = Route.useLoaderData();
  const search = Route.useSearch();
  return (
    <PublicShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <p className="text-xs tracking-[0.28em] text-gold uppercase">{tx("Work")}</p>
        <h1 className="mt-2 font-display text-4xl text-fg">{tx("Projects")}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Localization, dubbing, translation, mods, patches, fonts, and audio — filtered the way you need them.
        </p>
        <div className="mt-8">
          <CatalogFilters lookups={lookups} value={search} to="/projects" />
        </div>
        <div className="mt-8">
          {games.length === 0 ? (
            <EmptyState title="No projects available yet." body="Published work will appear in this list." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>
        <Pagination page={page} total={total} pageSize={pageSize} to="/projects" search={search} />
      </main>
    </PublicShell>
  );
}
