import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Lookups } from "@/lib/types";

import { tx } from "@/lib/i18n";
export type CatalogSearch = {
  q?: string;
  platform?: string;
  type?: string;
  status?: string;
  letter?: string;
  page?: number;
};

export function CatalogFilters({
  lookups,
  value,
  to,
}: {
  lookups: Lookups;
  value: CatalogSearch;
  to: "/games" | "/projects" | "/admin/games" | "/owner-panel/games";
}) {
  const navigate = useNavigate();

  function patch(next: Partial<CatalogSearch>) {
    const q = next.q ?? value.q ?? "";
    const platform = next.platform ?? value.platform ?? "";
    const type = next.type ?? value.type ?? "";
    const status = next.status ?? value.status ?? "";
    const letter = next.letter ?? value.letter ?? "";
    void navigate({
      to,
      search: {
        ...(q ? { q } : {}),
        ...(platform ? { platform } : {}),
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
        ...(letter ? { letter } : {}),
      },
    });
  }

  const selectClass =
    "h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/30";

  return (
    <div className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="block space-y-1.5">
        <Label>{tx("Search")}</Label>
        <Input
          defaultValue={value.q ?? ""}
          placeholder={tx("Title, platform, type")}
          onKeyDown={(e) => {
            if (e.key === "Enter") patch({ q: (e.target as HTMLInputElement).value });
          }}
          onBlur={(e) => patch({ q: e.target.value })}
        />
      </label>
      <label className="block space-y-1.5">
        <Label>{tx("Platform")}</Label>
        <select
          className={selectClass}
          value={value.platform ?? ""}
          onChange={(e) => patch({ platform: e.target.value })}
        >
          <option value="">{tx("All platforms")}</option>
          {lookups.platforms.map((p) => (
            <option key={p.id} value={p.id}>
              {tx(p.name)}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1.5">
        <Label>{tx("Project type")}</Label>
        <select className={selectClass} value={value.type ?? ""} onChange={(e) => patch({ type: e.target.value })}>
          <option value="">{tx("All types")}</option>
          {lookups.projectTypes.map((p) => (
            <option key={p.id} value={p.id}>
              {tx(p.name)}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1.5">
        <Label>{tx("Status")}</Label>
        <select
          className={selectClass}
          value={value.status ?? ""}
          onChange={(e) => patch({ status: e.target.value })}
        >
          <option value="">{tx("All statuses")}</option>
          {lookups.statuses.map((p) => (
            <option key={p.id} value={p.id}>
              {tx(p.name)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function Pagination({
  page,
  total,
  pageSize,
  to,
  search,
}: {
  page: number;
  total: number;
  pageSize: number;
  to: "/games" | "/projects" | "/search" | "/admin/games" | "/owner-panel/games";
  search: CatalogSearch;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const navigate = useNavigate();
  if (pages <= 1) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        type="button"
        className="h-11 rounded-md border border-border px-4 text-sm text-muted disabled:opacity-40"
        disabled={page <= 1}
        onClick={() =>
          void navigate({
            to,
            search: { ...search, page: page - 1 > 1 ? page - 1 : undefined },
          })
        }
      >
        Previous
      </button>
      <span className="px-3 text-sm tabular-nums text-muted">
        {page} / {pages}
      </span>
      <button
        type="button"
        className="h-11 rounded-md border border-border px-4 text-sm text-muted disabled:opacity-40"
        disabled={page >= pages}
        onClick={() => void navigate({ to, search: { ...search, page: page + 1 } })}
      >
        Next
      </button>
    </div>
  );
}

export function parseCatalogSearch(search: Record<string, unknown>): CatalogSearch {
  const q = typeof search.q === "string" ? search.q : "";
  const platform = typeof search.platform === "string" ? search.platform : "";
  const type = typeof search.type === "string" ? search.type : "";
  const status = typeof search.status === "string" ? search.status : "";
  const letter = typeof search.letter === "string" ? search.letter : "";
  const page = Math.max(1, Number(search.page) || 1);
  return {
    ...(q ? { q } : {}),
    ...(platform ? { platform } : {}),
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
    ...(letter ? { letter } : {}),
    ...(page > 1 ? { page } : {}),
  };
}
