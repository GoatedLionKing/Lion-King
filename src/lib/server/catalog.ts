import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { FEATURED_LIMIT, LATEST_LIMIT, PAGE_SIZE } from "@/lib/constants";
import type { Game, GameDetail, GameFile, LatestRelease, Lookups, SiteSettings, Version } from "@/lib/types";

const GAME_SELECT = `g.id, g.slug, g.title, g.description, g.cover, g.platform_id, g.project_type_id, g.status_id,
  g.version, g.developer, g.original_release, g.localization_release, g.featured, g.published,
  g.is_demo, g.created_at, g.updated_at,
  p.name as platform_name, t.name as project_type_name, s.name as status_name`;

export { GAME_SELECT };

export const getLookups = createServerFn({ method: "GET" }).handler(async (): Promise<Lookups> => {
  const sql = await getSql();
  const [platforms, projectTypes, statuses, categories] = await Promise.all([
    sql<{ id: string; name: string; sort_order: number }>`select id, name, sort_order from platforms order by sort_order, name`,
    sql<{ id: string; name: string; sort_order: number }>`select id, name, sort_order from project_types order by sort_order, name`,
    sql<{ id: string; name: string; sort_order: number }>`select id, name, sort_order from project_statuses order by sort_order, name`,
    sql<{ id: string; name: string; slug: string; sort_order: number }>`select id, name, slug, sort_order from categories order by sort_order, name`,
  ]);
  return { platforms, projectTypes, statuses, categories };
});

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async (): Promise<SiteSettings> => {
  const sql = await getSql();
  const rows = await sql<SiteSettings>`select * from site_settings where id = 1`;
  const row = rows[0];
  if (!row) throw new Error("Site settings missing");
  return { ...row, max_upload_bytes: Number(row.max_upload_bytes) };
});

const listInput = z.object({
  q: z.string().optional(),
  platform: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  letter: z.string().regex(/^[A-Za-z]$/).optional(),
  page: z.number().int().min(1).optional(),
});

export function buildGameFilters(data: z.infer<typeof listInput>, publishedOnly: boolean) {
  const q = data.q?.trim() ?? "";
  const clauses: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  if (publishedOnly) clauses.push("g.published = true");
  if (q) {
    clauses.push(
      `(g.title ilike $${i} or g.description ilike $${i} or coalesce(g.developer,'') ilike $${i} or p.name ilike $${i} or t.name ilike $${i})`,
    );
    params.push(`%${q}%`);
    i += 1;
  }
  if (data.platform) {
    clauses.push(`g.platform_id = $${i++}`);
    params.push(data.platform);
  }
  if (data.type) {
    clauses.push(`g.project_type_id = $${i++}`);
    params.push(data.type);
  }
  if (data.status) {
    clauses.push(`g.status_id = $${i++}`);
    params.push(data.status);
  }
  if (data.letter) {
    clauses.push(`lower(left(g.title, 1)) = lower($${i++})`);
    params.push(data.letter);
  }
  return { where: clauses.length ? `where ${clauses.join(" and ")}` : "", params };
}

export const listGames = createServerFn({ method: "GET" })
  .validator(listInput)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const page = data.page ?? 1;
    const offset = (page - 1) * PAGE_SIZE;
    const { where, params } = buildGameFilters(data, true);
    const countRows = await sql.query<{ n: number }>(
      `select count(*)::int as n from games g
       join platforms p on p.id = g.platform_id
       join project_types t on t.id = g.project_type_id
       ${where}`,
      params,
    );
    const total = Number(countRows[0]?.n ?? 0);
    const games = await sql.query<Game>(
      `select ${GAME_SELECT},
        (select count(*)::int from files f where f.game_id = g.id and f.visible = true) as file_count
       from games g
       join platforms p on p.id = g.platform_id
       join project_types t on t.id = g.project_type_id
       join project_statuses s on s.id = g.status_id
       ${where}
       order by lower(g.title) asc, g.id asc
       limit ${PAGE_SIZE} offset ${offset}`,
      params,
    );
    return { games, total, page, pageSize: PAGE_SIZE };
  });

export const getFeaturedGames = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql.query<Game>(
    `select ${GAME_SELECT}
     from games g
     join platforms p on p.id = g.platform_id
     join project_types t on t.id = g.project_type_id
     join project_statuses s on s.id = g.status_id
     where g.published = true and g.featured = true
     order by g.updated_at desc
     limit $1`,
    [FEATURED_LIMIT],
  );
});

export const getLatestReleases = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql.query<LatestRelease>(
    `select
        f.id as file_id,
        f.name as file_name,
        f.created_at as file_created_at,
        g.id as game_id,
        g.slug as game_slug,
        g.title as game_title,
        g.cover as game_cover,
        p.name as platform_name,
        s.name as status_name,
        s.id as status_id,
        v.name as version_name
     from files f
     join games g on g.id = f.game_id
     join versions v on v.id = f.version_id
     join platforms p on p.id = g.platform_id
     join project_statuses s on s.id = g.status_id
     where g.published = true and f.visible = true
     order by f.created_at desc
     limit $1`,
    [LATEST_LIMIT],
  );
});

export const getGameBySlug = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }): Promise<GameDetail | null> => {
    const sql = await getSql();
    const games = await sql.query<Game>(
      `select ${GAME_SELECT}
       from games g
       join platforms p on p.id = g.platform_id
       join project_types t on t.id = g.project_type_id
       join project_statuses s on s.id = g.status_id
       where g.slug = $1 and g.published = true`,
      [data.slug],
    );
    const game = games[0];
    if (!game) return null;
    const versions = await sql.query<Version>(
      `select * from versions where game_id = $1 order by sort_order, created_at`,
      [game.id],
    );
    const files = await sql.query<GameFile>(
      `select * from files where game_id = $1 and visible = true order by created_at`,
      [game.id],
    );
    const byVersion = new Map<string, GameFile[]>();
    for (const file of files) {
      const list = byVersion.get(file.version_id) ?? [];
      list.push(file);
      byVersion.set(file.version_id, list);
    }
    return {
      game,
      versions: versions.map((version) => ({ ...version, files: byVersion.get(version.id) ?? [] })),
    };
  });

export const getFileForDownload = createServerFn({ method: "GET" })
  .validator(z.object({ fileId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql.query<
      GameFile & { game_title: string; game_slug: string; game_cover: string | null; version_name: string }
    >(
      `select f.*, g.title as game_title, g.slug as game_slug, g.cover as game_cover, v.name as version_name
       from files f
       join games g on g.id = f.game_id
       join versions v on v.id = f.version_id
       where f.id = $1 and f.visible = true and g.published = true`,
      [data.fileId],
    );
    return rows[0] ?? null;
  });

export const searchCatalog = createServerFn({ method: "GET" })
  .validator(z.object({ q: z.string(), page: z.number().int().min(1).optional() }))
  .handler(async ({ data }) => {
    const q = data.q.trim();
    if (!q) return { games: [] as Game[], files: [] as GameFile[], total: 0, page: 1, pageSize: PAGE_SIZE };
    const sql = await getSql();
    const page = data.page ?? 1;
    const offset = (page - 1) * PAGE_SIZE;
    const like = `%${q}%`;
    const games = await sql.query<Game>(
      `select ${GAME_SELECT}
       from games g
       join platforms p on p.id = g.platform_id
       join project_types t on t.id = g.project_type_id
       join project_statuses s on s.id = g.status_id
       where g.published = true
         and (g.title ilike $1 or g.description ilike $1 or coalesce(g.developer,'') ilike $1 or p.name ilike $1 or t.name ilike $1)
       order by g.updated_at desc
       limit $2 offset $3`,
      [like, PAGE_SIZE, offset],
    );
    const files = await sql.query<GameFile>(
      `select f.*, v.name as version_name, v.version_number
       from files f
       join games g on g.id = f.game_id
       join versions v on v.id = f.version_id
       where g.published = true and f.visible = true
         and (f.name ilike $1 or f.original_filename ilike $1 or f.description ilike $1)
       order by f.created_at desc
       limit 12`,
      [like],
    );
    const countRows = await sql.query<{ n: number }>(
      `select count(*)::int as n from games g
       join platforms p on p.id = g.platform_id
       join project_types t on t.id = g.project_type_id
       where g.published = true
         and (g.title ilike $1 or g.description ilike $1 or coalesce(g.developer,'') ilike $1 or p.name ilike $1 or t.name ilike $1)`,
      [like],
    );
    return { games, files, total: Number(countRows[0]?.n ?? 0), page, pageSize: PAGE_SIZE };
  });
