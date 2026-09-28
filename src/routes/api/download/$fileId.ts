import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { newId } from "@/lib/slug";

export const Route = createFileRoute("/api/download/$fileId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        if (!rateLimit(`dl:${clientKey(request)}`, 40, 60_000)) {
          return Response.json({ error: "Too many download requests. Try again shortly." }, { status: 429 });
        }
        const fileId = params.fileId;
        if (!fileId || fileId.length > 80) return Response.json({ error: "File not found." }, { status: 404 });
        const sql = await getSql();
        const rows = await sql.query<{
          id: string;
          game_id: string;
          external_url: string | null;
          visible: boolean;
          published: boolean;
        }>(
          `select f.id, f.game_id, f.external_url, f.visible, g.published
           from files f join games g on g.id = f.game_id where f.id = $1`,
          [fileId],
        );
        const file = rows[0];
        if (!file || !file.visible || !file.published || !file.external_url) {
          return Response.json({ error: "This file is unavailable." }, { status: 404 });
        }

        await sql.query("update files set download_count = download_count + 1, last_downloaded_at = now() where id = $1", [file.id]);
        await sql.query("insert into downloads (id, file_id, game_id) values ($1,$2,$3)", [newId(), file.id, file.game_id]);

        return Response.redirect(file.external_url, 302);
      },
    },
  },
});
