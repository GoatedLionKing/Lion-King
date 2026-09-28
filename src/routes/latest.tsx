import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/games/empty-state";
import { StatusBadge } from "@/components/games/status-badge";
import { PublicShell } from "@/components/layout/public-shell";
import { coverSrc, formatDate } from "@/lib/format";
import { getLatestReleases } from "@/lib/server/catalog";

import { tx } from "@/lib/i18n";
export const Route = createFileRoute("/latest")({
  loader: () => getLatestReleases(),
  head: () => ({
    meta: [
      { title: "Latest Releases — GOATED LIONKING" },
      { name: "description", content: "The newest Arabic localization files and project updates." },
    ],
  }),
  component: LatestPage,
});

function LatestPage() {
  const latest = Route.useLoaderData();
  return (
    <PublicShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <p className="text-xs tracking-[0.28em] text-gold uppercase">{tx("Just in")}</p>
        <h1 className="mt-2 font-display text-4xl text-fg">{tx("Latest Releases")}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Recently added files, sorted automatically by newest date.
        </p>
        <div className="mt-8">
          {latest.length === 0 ? (
            <EmptyState title="No releases yet." body="New files will appear here once they are published." />
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
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
      </main>
    </PublicShell>
  );
}
