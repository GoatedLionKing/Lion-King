import { getSessionUser } from "@/lib/auth/verify.server";
import { COVER_TYPES } from "@/lib/constants";
import { getSql } from "@/lib/db";
import { newId, newStorageKey } from "@/lib/slug";
import { saveUploadStream, removeObject } from "@/lib/storage";
import { assertAdmin } from "./admin-guard";

function safeFilename(name: string) {
  const base = name.replace(/\\/g, "/").split("/").pop() ?? "file";
  return base.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 180) || "file";
}

function extensionOf(name: string) {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() ?? "" : "";
}

function decodeMetadata(value: string | null) {
  if (!value) throw new Error("Missing upload metadata.");
  try {
    const bytes = Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as {
      kind?: string;
      filename?: string;
      mimeType?: string;
      gameId?: string;
      versionId?: string;
      name?: string;
      description?: string;
      visible?: boolean;
    };
  } catch {
    throw new Error("Invalid upload metadata.");
  }
}

export async function handleUploadRequest(request: Request): Promise<Response> {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await assertAdmin(user.id);
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const fileSize = Number(request.headers.get("content-length"));
  if (!Number.isSafeInteger(fileSize) || fileSize <= 0) {
    return Response.json({ error: "A valid Content-Length is required." }, { status: 411 });
  }
  if (!request.body) return Response.json({ error: "Empty upload body." }, { status: 400 });

  let metadata: ReturnType<typeof decodeMetadata>;
  try {
    metadata = decodeMetadata(request.headers.get("x-upload-metadata"));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Invalid upload metadata." }, { status: 400 });
  }

  const filename = safeFilename(String(metadata.filename || "file"));
  const kind = metadata.kind === "cover" ? "cover" : "file";
  if (kind === "file") {
    return Response.json({ error: "Binary file uploads are disabled. Add a MediaFire link instead." }, { status: 410 });
  }
  const mime = String(metadata.mimeType || request.headers.get("content-type") || "application/octet-stream");
  const ext = extensionOf(filename);
  const sql = await getSql();
  const settings = await sql.query<{ max_upload_bytes: number; allowed_file_types: string }>(
    "select max_upload_bytes, allowed_file_types from site_settings where id = 1",
  );
  const maxBytes = Number(settings[0]?.max_upload_bytes ?? 16106127360);
  if (fileSize > maxBytes) return Response.json({ error: "File exceeds the maximum upload size." }, { status: 413 });

  const allowed = (settings[0]?.allowed_file_types ?? "")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (kind === "cover") {
    if (!COVER_TYPES.has(ext)) return Response.json({ error: "Cover must be a JPG, PNG, WebP, or GIF image." }, { status: 400 });
  } else if (allowed.length && !allowed.includes("*") && !allowed.includes(ext)) {
    return Response.json({ error: "This file type is not allowed." }, { status: 400 });
  }

  const storageKey = newStorageKey(kind, ext);
  let storedKey = storageKey;
  try {
    const storedObject = await saveUploadStream(storageKey, request.body, fileSize, maxBytes);
    storedKey = typeof storedObject === "string" ? storedObject : storageKey;
  } catch (error) {
    await removeObject(storageKey).catch(() => undefined);
    const message = error instanceof Error ? error.message : "Upload failed.";
    return Response.json({ error: message }, { status: message.includes("maximum") ? 413 : 400 });
  }

  if (kind === "cover") {
    return Response.json({ storageKey: storedKey, size: fileSize, mimeType: mime, filename });
  }

  const gameId = String(metadata.gameId || "");
  const versionId = String(metadata.versionId || "");
  if (!gameId || !versionId) {
    await removeObject(storageKey).catch(() => undefined);
    return Response.json({ error: "Game and version are required." }, { status: 400 });
  }
  const version = await sql.query<{ id: string }>("select id from versions where id = $1 and game_id = $2", [versionId, gameId]);
  if (!version[0]) {
    await removeObject(storageKey).catch(() => undefined);
    return Response.json({ error: "Version not found." }, { status: 400 });
  }

  const id = newId();
  const name = String(metadata.name || filename).trim() || filename;
  const description = String(metadata.description || "").trim();
  const visible = metadata.visible !== false;
  try {
    await sql.query(
      `insert into files (id, game_id, version_id, name, description, original_filename, storage_key, file_size, mime_type, visible)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [id, gameId, versionId, name.slice(0, 200), description.slice(0, 4000), filename, storageKey, fileSize, mime, visible],
    );
    await sql.query("update games set updated_at = now() where id = $1", [gameId]);
  } catch (error) {
    await removeObject(storageKey).catch(() => undefined);
    throw error;
  }

  return Response.json({ id, storageKey, size: fileSize, mimeType: mime, filename });
}
