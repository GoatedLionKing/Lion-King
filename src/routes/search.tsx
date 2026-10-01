import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/games/empty-state";
import { GameCard } from "@/components/games/game-card";
import { Pagination } from "@/components/games/filters";
import { PublicShell } from "@/components/layout/public-shell";
import { Input } from "@/components/ui/input";
import { formatBytes } from "@/lib/format";
import { searchCatalog } from "@/lib/server/catalog";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q: string; page?: number } => ({
    q: typeof search.q === "string" ? search.q : "",
    page: search.page === undefined || search.page === "" ? undefined : Math.max(1, Number(search.page) || 1),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => searchCatalog({ data: { q: deps.q, page: deps.page ?? 1 } }),
  head: ({ match }) => ({
    meta: [
      {
        title: match.search.q ? `Search — GOATED LIONKING` : "Search — GOATED LIONKING",
      },
      { name: "description", content: "ابحث عن ألعاب التعريب والملفات والمنصات وأنواع المشاريع." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { games, files, total, page, pageSize } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const empty = search.q.trim().length > 0 && games.length === 0 && files.length === 0;

  return (
    <PublicShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <p className="text-xs tracking-[0.28em] text-gold uppercase">{"الأرشيف"}</p>
        <h1 className="mt-2 font-display text-4xl text-fg">{"البحث"}</h1>
        <form
          className="mt-6 max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            const q = String(new FormData(e.currentTarget).get("q") ?? "");
            void navigate({ to: "/search", search: { q, page: 1 } });
          }}
        >
          <Input name="q" defaultValue={search.q} placeholder={"ابحث في العناوين والملفات والمنصات…"} autoFocus />
        </form>

        {!search.q.trim() ? (
          <div className="mt-10">
            <EmptyState title={"ابدأ بالكتابة للبحث."} body={"ابحث عن الألعاب وأسماء الملفات والمنصات وأنواع المشاريع."} />
          </div>
        ) : empty ? (
          <div className="mt-10">
            <EmptyState title={"لم يتم العثور على نتائج."} body={"جرّب عنوانًا أو منصة أو اسم ملف مختلفًا."} />
          </div>
        ) : (
          <>
            {games.length > 0 ? (
              <section className="mt-10">
                <h2 className="font-display text-2xl text-fg">{"الألعاب"}</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {games.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
                <Pagination
                  page={page}
                  total={total}
                  pageSize={pageSize}
                  to="/search"
                  search={{ q: search.q, page }}
                />
              </section>
            ) : null}
            {files.length > 0 ? (
              <section className="mt-12">
                <h2 className="font-display text-2xl text-fg">{"الملفات"}</h2>
                <ul className="mt-5 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
                  {files.map((file) => (
                    <li key={file.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-fg">{file.name}</p>
                        <p className="text-sm text-muted">
                          {file.version_name} · {formatBytes(file.file_size)}
                        </p>
                      </div>
                      <Link
                        to="/download/$fileId"
                        params={{ fileId: file.id }}
                        className="inline-flex h-11 items-center text-sm font-medium text-gold hover:text-gold-2"
                      >
                        Download
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </main>
    </PublicShell>
  );
}
