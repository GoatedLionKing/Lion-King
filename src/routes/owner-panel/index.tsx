import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatBytes, formatDate } from "@/lib/format";
import { getAdminStats } from "@/lib/server/admin";
import type { AdminStats } from "@/lib/types";

export const Route = createFileRoute("/owner-panel/")({
  component: AdminHome,
});

function AdminHome() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "فشل التحميل"));
  }, []);

  if (error) {
    return <p className="text-sm text-danger">{error}</p>;
  }
  if (!stats) {
    return <div className="h-40 animate-pulse rounded-xl bg-surface" />;
  }

  const cards = [
    { label: "إجمالي الألعاب", value: stats.totalGames },
    { label: "الألعاب المنشورة", value: stats.publishedGames },
    { label: "إجمالي الملفات", value: stats.totalFiles },
    { label: "الملفات المخفية", value: stats.hiddenFiles },
    { label: "إجمالي التنزيلات", value: stats.totalDownloads },
    { label: "إجمالي التخزين", value: formatBytes(stats.totalStorage) },
  ];

  return (
    <div>
      <p className="text-xs tracking-[0.28em] text-gold uppercase">{"لوحة التحكم"}</p>
      <h1 className="mt-2 font-display text-3xl text-fg">{"نظرة عامة"}</h1>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-surface px-5 py-4">
            <p className="text-[11px] tracking-wide text-subtle uppercase">{card.label}</p>
            <p className="mt-2 font-display text-2xl tabular-nums text-fg">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-lg text-fg">{"أحدث لعبة"}</h2>
          {stats.latestGame ? (
            <div className="mt-3">
              <p className="text-fg">{stats.latestGame.title}</p>
              <p className="text-sm text-muted">{"أضيف في"} {formatDate(stats.latestGame.created_at)}</p>
              <Link
                to="/owner-panel/games/$id"
                params={{ id: stats.latestGame.id }}
                className="mt-3 inline-flex h-11 items-center text-sm text-gold"
              >
                Open
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">{"لا توجد ألعاب بعد."}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-lg text-fg">{"أحدث ملف مرفوع"}</h2>
          {stats.latestFile ? (
            <div className="mt-3">
              <p className="text-fg">{stats.latestFile.name}</p>
              <p className="text-sm text-muted">
                {formatBytes(stats.latestFile.file_size)} · {formatDate(stats.latestFile.created_at)}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">{"لا توجد ملفات بعد."}</p>
          )}
        </div>
      </div>
    </div>
  );
}
