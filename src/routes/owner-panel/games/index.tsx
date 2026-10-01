import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CatalogFilters, Pagination, parseCatalogSearch } from "@/components/games/filters";
import { StatusBadge } from "@/components/games/status-badge";
import { Button } from "@/components/ui/button";
import { deleteGame, listAdminGames, setGameFlag } from "@/lib/server/admin";
import { getLookups } from "@/lib/server/catalog";
import type { Game, Lookups } from "@/lib/types";

export const Route = createFileRoute("/owner-panel/games/")({
  validateSearch: parseCatalogSearch,
  component: AdminGamesPage,
});

function AdminGamesPage() {
  const search = Route.useSearch();
  const [lookups, setLookups] = useState<Lookups | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [lu, result] = await Promise.all([
        lookups ? Promise.resolve(lookups) : getLookups(),
        listAdminGames({
          data: {
            q: search.q || undefined,
            platform: search.platform || undefined,
            type: search.type || undefined,
            status: search.status || undefined,
            page: search.page,
          },
        }),
      ]);
      setLookups(lu);
      setGames(result.games);
      setTotal(result.total);
      setPage(result.page);
      setPageSize(result.pageSize);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل تحميل الألعاب");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.q, search.platform, search.type, search.status, search.page]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.28em] text-gold uppercase">{"المكتبة"}</p>
          <h1 className="mt-2 font-display text-3xl text-fg">{"الألعاب"}</h1>
        </div>
        <Button asChild>
          <Link to="/owner-panel/games/new">{"إضافة لعبة"}</Link>
        </Button>
      </div>
      <div className="mt-6">
        {lookups ? <CatalogFilters lookups={lookups} value={search} to="/owner-panel/games" /> : null}
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-border text-xs tracking-wide text-subtle uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">{"العنوان"}</th>
              <th className="px-4 py-3 font-medium">{"المنصة"}</th>
              <th className="px-4 py-3 font-medium">{"الحالة"}</th>
              <th className="px-4 py-3 font-medium">{"العلامات"}</th>
              <th className="px-4 py-3 font-medium">{"الإجراءات"}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  Loading…
                </td>
              </tr>
            ) : games.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  No games yet.
                </td>
              </tr>
            ) : (
              games.map((game) => (
                <tr key={game.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link to="/owner-panel/games/$id" params={{ id: game.id }} className="font-medium text-fg hover:text-gold">
                      {game.title}
                    </Link>
                    {game.is_demo ? <span className="ml-2 text-[11px] text-subtle">{"عينة"}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-muted">{game.platform_name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge statusId={game.status_id} label={game.status_name ?? game.status_id} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {game.published ? "منشور" : "مخفي"}
                    {game.featured ? " · Featured" : ""}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="h-11 text-xs text-gold hover:text-gold-2"
                        onClick={async () => {
                          await setGameFlag({ data: { id: game.id, field: "published", value: !game.published } });
                          void load();
                        }}
                      >
                        {game.published ? "إلغاء النشر" : "نشر"}
                      </button>
                      <button
                        type="button"
                        className="h-11 text-xs text-gold hover:text-gold-2"
                        onClick={async () => {
                          await setGameFlag({ data: { id: game.id, field: "featured", value: !game.featured } });
                          void load();
                        }}
                      >
                        {game.featured ? "إلغاء التمييز" : "تمييز"}
                      </button>
                      <button
                        type="button"
                        className="h-11 text-xs text-danger"
                        onClick={async () => {
                          if (!confirm(`Delete “${game.title}”? This cannot be undone.`)) return;
                          await deleteGame({ data: { id: game.id } });
                          toast.success("تم حذف اللعبة");
                          void load();
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={total} pageSize={pageSize} to="/owner-panel/games" search={search} />
    </div>
  );
}
