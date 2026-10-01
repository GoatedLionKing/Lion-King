import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Download, HardDrive } from "lucide-react";
import { EmptyState } from "@/components/games/empty-state";
import { StatusBadge } from "@/components/games/status-badge";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { coverSrc, formatBytes, formatDate } from "@/lib/format";
import { getGameBySlug } from "@/lib/server/catalog";

export const Route = createFileRoute("/games/$slug")({
  loader: async ({ params }) => {
    const detail = await getGameBySlug({ data: { slug: params.slug } });
    if (!detail) throw notFound();
    return detail;
  },
  head: ({ loaderData }) => {
    const game = loaderData?.game;
    if (!game) return { meta: [{ title: "اللعبة — GOATED LIONKING" }] };
    const title = `${game.title} — Arabic Localization | Goated LionKing`;
    const description = `Arabic localization files and related downloads for ${game.title}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
      links: [{ rel: "canonical", href: `/games/${game.slug}` }],
    };
  },
  component: GameDetailPage,
});

function GameDetailPage() {
  const { game, versions } = Route.useLoaderData();
  const visibleVersions = versions.filter((v) => v.files.length > 0);
  const hasFiles = visibleVersions.length > 0;

  return (
    <PublicShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,18rem)_1fr]">
          <div>
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <img src={coverSrc(game.cover)} alt="" className="aspect-[2/3] w-full object-cover" />
            </div>
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs tracking-[0.22em] text-gold uppercase">{game.platform_name ?? ""}</span>
              <span className="text-subtle">·</span>
              <span className="text-xs tracking-wide text-muted uppercase">{game.project_type_name ?? ""}</span>
            </div>
            <h1 className="mt-3 font-display text-4xl leading-tight text-fg">{game.title}</h1>
            <div className="mt-4">
              <StatusBadge statusId={game.status_id} label={game.status_name ?? game.status_id} />
            </div>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">{game.description}</p>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              <Info label="Developer" value={game.developer} />
              <Info label="Current version" value={game.version} />
              <Info label="Original release" value={formatDate(game.original_release)} />
              <Info label="Localization release" value={formatDate(game.localization_release)} />
            </dl>
          </div>
        </div>

        <section className="mt-14">
          <p className="text-xs tracking-[0.28em] text-gold uppercase">{"الأرشيف"}</p>
          <h2 className="mt-2 font-display text-3xl text-fg">{"التنزيلات"}</h2>
          {!hasFiles ? (
            <div className="mt-6">
              <EmptyState
                title={"لم يتم نشر ملفات قابلة للتنزيل لهذه اللعبة بعد."}
                body={"تحقق مجددًا عند إصدار النسخة التالية."}
              />
            </div>
          ) : (
            <div className="mt-6 space-y-8">
              {visibleVersions.map((version) => (
                <div key={version.id} className="overflow-hidden rounded-xl border border-border bg-surface">
                  <div className="border-b border-border px-5 py-4">
                    <h3 className="font-display text-xl text-fg">{version.name}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {version.version_number}
                      {version.release_date ? ` · ${formatDate(version.release_date)}` : ""}
                    </p>
                    {version.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-muted">{version.description}</p>
                    ) : null}
                  </div>
                  <ul className="divide-y divide-border">
                    {version.files.map((file) => (
                      <li key={file.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-fg">{file.name}</p>
                          {file.description ? <p className="mt-1 text-sm text-muted">{file.description}</p> : null}
                          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-subtle">
                            <span className="inline-flex items-center gap-1">
                              <HardDrive className="size-3.5" /> {formatBytes(file.file_size)}
                            </span>
                            <span>{file.download_count.toLocaleString()} downloads</span>
                            <span>{"أضيف في"} {formatDate(file.created_at)}</span>
                          </p>
                        </div>
                        <Button asChild>
                          <Link to="/download/$fileId" params={{ fileId: file.id }}>
                            <Download className="size-4" />
                            Download
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </PublicShell>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <dt className="text-[11px] tracking-wide text-subtle uppercase">{label}</dt>
      <dd className="mt-1 text-sm text-fg">{value || "—"}</dd>
    </div>
  );
}
