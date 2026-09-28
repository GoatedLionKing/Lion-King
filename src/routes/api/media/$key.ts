import { createFileRoute } from "@tanstack/react-router";
import { getStoredFile } from "@/lib/storage";
import { createFileWebStream } from "@/lib/storage/fs";

export const Route = createFileRoute("/api/media/$key")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = params.key;
        if (!key || !key.startsWith("cover_") || !/^[A-Za-z0-9_.-]+$/.test(key)) return new Response("Not found", { status: 404 });
        const object = await getStoredFile(key);
        if (!object) return new Response("Not found", { status: 404 });
        const ext = key.split(".").pop()?.toLowerCase();
        const contentType = ext === "jpg" || ext === "jpeg" ? "image/jpeg"
          : ext === "png" ? "image/png"
          : ext === "webp" ? "image/webp"
          : ext === "gif" ? "image/gif"
          : "application/octet-stream";
        return new Response(createFileWebStream(key), {
          headers: {
            "Content-Type": contentType,
            "Content-Length": String(object.size),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
