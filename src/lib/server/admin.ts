import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { PAGE_SIZE } from "@/lib/constants";
import { newId, slugify } from "@/lib/slug";
import { deleteObject } from "@/lib/storage";
import type { AdminStats, Game, GameFile, Version } from "@/lib/types";
import { assertAdmin } from "./admin-guard";
import { buildGameFilters, GAME_SELECT } from "./catalog";

const gameInput = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().max(120).optional(),
  description: z.string().max(8000).optional(),
  cover: z.string().max(500).optional().nullable(),
  platform_id: z.string().min(1),
  project_type_id: z.string().min(1),
  status_id: z.string().min(1),
  version: z.string().max(80).optional().nullable(),
  developer: z.string().max(160).optional().nullable(),
  original_release: z.string().optional().nullable(),
  localization_release: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

const listInput = z.object({
  q: z.string().optional(),
  platform: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  page: z.number().int().min(1).optional(),
});

async function uniqueSlug(sql: Awaited<ReturnType<typeof getSql>>, base: string, ignoreId?: string) {
  const slug = slugify(base);
  for (let n = 0; n < 50; n += 1) {
    const candidate = n === 0 ? slug : `${slug}-${n + 1}`;
    const rows = ignoreId
      ? await sql.query<{ id: string }>("select id from games where slug = $1 and id <> $2", [
          candidate,
          ignoreId,
        ])
      : await sql.query<{ id: string }>("select id from games where slug = $1", [candidate]);
    if (!rows[0]) return candidate;
  }
  return `${slug}-${Date.now().toString(36)}`;
}

export const listAdminGames = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(listInput)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    const page = data.page ?? 1;
    const offset = (page - 1) * PAGE_SIZE;
    const { where, params } = buildGameFilters(data, false);
    const countRows = await sql.query<{ n: number }>(
      `select count(*)::int as n from games g
       join platforms p on p.id = g.platform_id
       join project_types t on t.id = g.project_type_id
       ${where}`,
      params,
    );
    const games = await sql.query<Game>(
      `select ${GAME_SELECT},
        (select count(*)::int from files f where f.game_id = g.id) as file_count
       from games g
       join platforms p on p.id = g.platform_id
       join project_types t on t.id = g.project_type_id
       join project_statuses s on s.id = g.status_id
       ${where}
       order by g.updated_at desc
       limit ${PAGE_SIZE} offset ${offset}`,
      params,
    );
    return { games, total: Number(countRows[0]?.n ?? 0), page, pageSize: PAGE_SIZE };
  });

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AdminStats> => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    const [games, files, downloads, storage, latestGame, latestFile] = await Promise.all([
      sql.query<{ total: number; published: number }>(
        "select count(*)::int as total, count(*) filter (where published)::int as published from games",
      ),
      sql.query<{ total: number; hidden: number }>(
        "select count(*)::int as total, count(*) filter (where not visible)::int as hidden from files",
      ),
      sql.query<{ n: number }>("select count(*)::int as n from downloads"),
      sql.query<{ n: number }>("select coalesce(sum(file_size),0)::float8 as n from files"),
      sql.query<Game>("select * from games order by created_at desc limit 1"),
      sql.query<GameFile>("select * from files order by created_at desc limit 1"),
    ]);
    return {
      totalGames: Number(games[0]?.total ?? 0),
      publishedGames: Number(games[0]?.published ?? 0),
      totalFiles: Number(files[0]?.total ?? 0),
      hiddenFiles: Number(files[0]?.hidden ?? 0),
      totalDownloads: Number(downloads[0]?.n ?? 0),
      totalStorage: Number(storage[0]?.n ?? 0),
      latestGame: latestGame[0] ?? null,
      latestFile: latestFile[0] ?? null,
    };
  });

export const createGame = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(gameInput)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    const id = newId();
    const slug = await uniqueSlug(sql, data.slug || data.title);
    await sql.query(
      `insert into games (
        id, slug, title, description, cover, platform_id, project_type_id, status_id,
        version, developer, original_release, localization_release, featured, published
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        id,
        slug,
        data.title.trim(),
        data.description?.trim() ?? "",
        data.cover ?? null,
        data.platform_id,
        data.project_type_id,
        data.status_id,
        data.version ?? null,
        data.developer ?? null,
        data.original_release || null,
        data.localization_release || null,
        data.featured ?? false,
        data.published ?? false,
      ],
    );
    return { id, slug };
  });

export const updateGame = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(gameInput.extend({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    const slug = await uniqueSlug(sql, data.slug || data.title, data.id);
    await sql.query(
      `update games set
        slug = $2, title = $3, description = $4, cover = $5, platform_id = $6,
        project_type_id = $7, status_id = $8, version = $9, developer = $10,
        original_release = $11, localization_release = $12, featured = $13,
        published = $14, updated_at = now()
       where id = $1`,
      [
        data.id,
        slug,
        data.title.trim(),
        data.description?.trim() ?? "",
        data.cover ?? null,
        data.platform_id,
        data.project_type_id,
        data.status_id,
        data.version ?? null,
        data.developer ?? null,
        data.original_release || null,
        data.localization_release || null,
        data.featured ?? false,
        data.published ?? false,
      ],
    );
    return { id: data.id, slug };
  });

export const deleteGame = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    const game = await sql.query<{ cover: string | null }>("select cover from games where id = $1", [data.id]);
    await sql.query("delete from games where id = $1", [data.id]);
    const cover = game[0]?.cover;
    if (cover && !cover.startsWith("/")) {
      try {
        await deleteObject(cover);
      } catch {
        /* best-effort */
      }
    }
    return { ok: true };
  });

export const setGameFlag = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string().min(1),
      field: z.enum(["featured", "published"]),
      value: z.boolean(),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    const column = data.field === "featured" ? "featured" : "published";
    await sql.query(`update games set ${column} = $2, updated_at = now() where id = $1`, [data.id, data.value]);
    return { ok: true };
  });

export const createVersion = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      game_id: z.string().min(1),
      name: z.string().min(1).max(160),
      version_number: z.string().min(1).max(80),
      description: z.string().max(4000).optional(),
      release_date: z.string().optional().nullable(),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    const id = newId();
    const orderRows = await sql.query<{ n: number }>(
      "select coalesce(max(sort_order),0)::int as n from versions where game_id = $1",
      [data.game_id],
    );
    await sql.query(
      `insert into versions (id, game_id, name, version_number, description, release_date, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [
        id,
        data.game_id,
        data.name.trim(),
        data.version_number.trim(),
        data.description?.trim() ?? "",
        data.release_date || null,
        Number(orderRows[0]?.n ?? 0) + 10,
      ],
    );
    await sql.query("update games set updated_at = now() where id = $1", [data.game_id]);
    return { id };
  });

export const updateVersion = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1).max(160),
      version_number: z.string().min(1).max(80),
      description: z.string().max(4000).optional(),
      release_date: z.string().optional().nullable(),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    await sql.query(
      `update versions set name = $2, version_number = $3, description = $4, release_date = $5, updated_at = now()
       where id = $1`,
      [data.id, data.name.trim(), data.version_number.trim(), data.description?.trim() ?? "", data.release_date || null],
    );
    return { ok: true };
  });

export const deleteVersion = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    await sql.query("delete from versions where id = $1", [data.id]);
    return { ok: true };
  });

export const addExternalFile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      game_id: z.string().min(1),
      version_id: z.string().min(1),
      name: z.string().min(1).max(200),
      description: z.string().max(4000).optional(),
      original_filename: z.string().min(1).max(255),
      external_url: z.string().url().max(2000),
      file_size: z.number().int().min(0).max(16106127360),
      mime_type: z.string().max(200).default("application/octet-stream"),
      visible: z.boolean().default(true),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const parsed = new URL(data.external_url);
    const host = parsed.hostname.toLowerCase();
    if (!(host === "mediafire.com" || host.endsWith(".mediafire.com") || host === "mediafireusercontent.com" || host.endsWith(".mediafireusercontent.com"))) {
      throw new Error("رابط التحميل يجب أن يكون من MediaFire.");
    }
    const sql = await getSql();
    const version = await sql.query<{ id: string }>("select id from versions where id = $1 and game_id = $2", [data.version_id, data.game_id]);
    if (!version[0]) throw new Error("Version not found.");
    const id = newId();
    await sql.query(
      `insert into files (id, game_id, version_id, name, description, original_filename, external_url, file_size, mime_type, visible)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [id, data.game_id, data.version_id, data.name.trim(), data.description?.trim() ?? "", data.original_filename.trim(), data.external_url, data.file_size, data.mime_type, data.visible],
    );
    await sql.query("update games set updated_at = now() where id = $1", [data.game_id]);
    return { id };
  });

export const updateFileMeta = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1).max(200),
      description: z.string().max(4000).optional(),
      version_id: z.string().min(1).optional(),
      visible: z.boolean().optional(),
      external_url: z.string().url().max(2000),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const parsed = new URL(data.external_url);
    const host = parsed.hostname.toLowerCase();
    if (!(host === "mediafire.com" || host.endsWith(".mediafire.com") || host === "mediafireusercontent.com" || host.endsWith(".mediafireusercontent.com"))) {
      throw new Error("رابط التحميل يجب أن يكون من MediaFire.");
    }
    const sql = await getSql();
    if (data.version_id) {
      await sql.query(
        `update files set name = $2, description = $3, version_id = $4, visible = coalesce($5, visible), external_url = $6, updated_at = now()
         where id = $1`,
        [data.id, data.name.trim(), data.description?.trim() ?? "", data.version_id, data.visible ?? null, data.external_url],
      );
    } else {
      await sql.query(
        `update files set name = $2, description = $3, visible = coalesce($4, visible), external_url = $5, updated_at = now()
         where id = $1`,
        [data.id, data.name.trim(), data.description?.trim() ?? "", data.visible ?? null, data.external_url],
      );
    }
    return { ok: true };
  });

export const setFileVisible = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(1), visible: z.boolean() }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    await sql.query("update files set visible = $2, updated_at = now() where id = $1", [data.id, data.visible]);
    return { ok: true };
  });

export const deleteFile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    await sql.query("delete from files where id = $1", [data.id]);
    return { ok: true };
  });

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      site_name: z.string().min(1).max(120),
      site_description: z.string().max(500),
      tagline: z.string().max(160),
      hero_title: z.string().max(120),
      hero_subtitle: z.string().max(160),
      hero_description: z.string().max(800),
      seo_title: z.string().max(160),
      seo_description: z.string().max(300),
      featured_heading: z.string().max(80),
      latest_heading: z.string().max(80),
      max_upload_bytes: z.number().int().min(1024).max(16_106_127_360),
      allowed_file_types: z.string().max(500),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    await sql.query(
      `update site_settings set
        site_name = $1, site_description = $2, tagline = $3, hero_title = $4, hero_subtitle = $5,
        hero_description = $6, seo_title = $7, seo_description = $8, featured_heading = $9,
        latest_heading = $10, max_upload_bytes = $11, allowed_file_types = $12, updated_at = now()
       where id = 1`,
      [
        data.site_name.trim(),
        data.site_description.trim(),
        data.tagline.trim(),
        data.hero_title.trim(),
        data.hero_subtitle.trim(),
        data.hero_description.trim(),
        data.seo_title.trim(),
        data.seo_description.trim(),
        data.featured_heading.trim(),
        data.latest_heading.trim(),
        data.max_upload_bytes,
        data.allowed_file_types.trim(),
      ],
    );
    return { ok: true };
  });

export const upsertLookup = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      table: z.enum(["platforms", "project_types", "project_statuses", "categories"]),
      id: z.string().min(1).max(80),
      name: z.string().min(1).max(80),
      slug: z.string().max(80).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    const id = slugify(data.id);
    if (data.table === "categories") {
      await sql.query(
        `insert into categories (id, name, slug, sort_order)
         values ($1,$2,$3,100)
         on conflict (id) do update set name = excluded.name, slug = excluded.slug`,
        [id, data.name.trim(), slugify(data.slug || data.name)],
      );
    } else if (data.table === "platforms") {
      await sql.query(
        `insert into platforms (id, name, sort_order) values ($1,$2,100)
         on conflict (id) do update set name = excluded.name`,
        [id, data.name.trim()],
      );
    } else if (data.table === "project_types") {
      await sql.query(
        `insert into project_types (id, name, sort_order) values ($1,$2,100)
         on conflict (id) do update set name = excluded.name`,
        [id, data.name.trim()],
      );
    } else {
      await sql.query(
        `insert into project_statuses (id, name, sort_order) values ($1,$2,100)
         on conflict (id) do update set name = excluded.name`,
        [id, data.name.trim()],
      );
    }
    return { ok: true, id };
  });

export const deleteLookup = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      table: z.enum(["platforms", "project_types", "project_statuses", "categories"]),
      id: z.string().min(1),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    if (data.table === "platforms") {
      const used = await sql.query<{ n: number }>("select count(*)::int as n from games where platform_id = $1", [
        data.id,
      ]);
      if (Number(used[0]?.n) > 0) throw new Error("This platform is still used by a game.");
      await sql.query("delete from platforms where id = $1", [data.id]);
    } else if (data.table === "project_types") {
      const used = await sql.query<{ n: number }>(
        "select count(*)::int as n from games where project_type_id = $1",
        [data.id],
      );
      if (Number(used[0]?.n) > 0) throw new Error("This project type is still used by a game.");
      await sql.query("delete from project_types where id = $1", [data.id]);
    } else if (data.table === "project_statuses") {
      const used = await sql.query<{ n: number }>("select count(*)::int as n from games where status_id = $1", [
        data.id,
      ]);
      if (Number(used[0]?.n) > 0) throw new Error("This status is still used by a game.");
      await sql.query("delete from project_statuses where id = $1", [data.id]);
    } else {
      await sql.query("delete from categories where id = $1", [data.id]);
    }
    return { ok: true };
  });

export const getStorageInfo = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { storageDriver } = await import("@/lib/storage");
    return { driver: storageDriver() };
  });

export const getAdminGame = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    const games = await sql.query<Game>(
      `select g.*, p.name as platform_name, t.name as project_type_name, s.name as status_name
       from games g
       join platforms p on p.id = g.platform_id
       join project_types t on t.id = g.project_type_id
       join project_statuses s on s.id = g.status_id
       where g.id = $1`,
      [data.id],
    );
    const game = games[0];
    if (!game) return null;
    const versions = await sql.query<Version>(
      "select * from versions where game_id = $1 order by sort_order, created_at",
      [game.id],
    );
    const files = await sql.query<GameFile>(
      `select f.*, v.name as version_name, v.version_number
       from files f join versions v on v.id = f.version_id
       where f.game_id = $1
       order by v.sort_order, f.created_at`,
      [game.id],
    );
    return { game, versions, files };
  });
