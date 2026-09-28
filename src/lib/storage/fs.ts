import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rename, rm, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { Readable } from "node:stream";
import { env } from "@/lib/env.server";

const ROOT = resolve(env("STORAGE_DIR") ?? "./data/files");

function safeKey(key: string): string {
  const normalized = key.replace(/\\/g, "/").replace(/^\/+/, "");
  const target = resolve(ROOT, normalized);
  if (target !== ROOT && !target.startsWith(`${ROOT}/`)) {
    throw new Error("Invalid storage key");
  }
  return normalized;
}

export function storagePath(key: string): string {
  return join(ROOT, safeKey(key));
}

export async function ensureStorageRoot() {
  await mkdir(ROOT, { recursive: true });
}

export async function putStream(
  key: string,
  body: ReadableStream<Uint8Array>,
  expectedSize: number,
  maxBytes: number,
): Promise<number> {
  if (!Number.isSafeInteger(expectedSize) || expectedSize < 1) {
    throw new Error("Missing or invalid Content-Length");
  }
  if (expectedSize > maxBytes) throw new Error("File exceeds the maximum upload size.");

  const finalPath = storagePath(key);
  const tempPath = `${finalPath}.upload-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await mkdir(dirname(finalPath), { recursive: true });

  const writer = createWriteStream(tempPath, { flags: "wx" });
  const reader = body.getReader();
  let written = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      written += value.byteLength;
      if (written > maxBytes || written > expectedSize) {
        throw new Error("File exceeds the maximum upload size.");
      }
      if (!writer.write(Buffer.from(value))) {
        await new Promise<void>((resolvePromise, reject) => {
          const onDrain = () => { cleanup(); resolvePromise(); };
          const onError = (error: Error) => { cleanup(); reject(error); };
          const cleanup = () => {
            writer.off("drain", onDrain);
            writer.off("error", onError);
          };
          writer.once("drain", onDrain);
          writer.once("error", onError);
        });
      }
    }
    await new Promise<void>((resolvePromise, reject) => {
      writer.once("finish", resolvePromise);
      writer.once("error", reject);
      writer.end();
    });
    if (written !== expectedSize) throw new Error("Uploaded file size does not match Content-Length.");
    await rename(tempPath, finalPath);
    return written;
  } catch (error) {
    try { await reader.cancel(); } catch { /* ignore */ }
    writer.destroy();
    await rm(tempPath, { force: true }).catch(() => undefined);
    throw error;
  }
}

export async function getFileInfo(key: string) {
  try {
    const info = await stat(storagePath(key));
    if (!info.isFile()) return null;
    return { size: info.size, path: storagePath(key) };
  } catch {
    return null;
  }
}

export function createFileWebStream(
  key: string,
  range?: { start: number; end: number },
): ReadableStream<Uint8Array> {
  return Readable.toWeb(createReadStream(storagePath(key), range)) as ReadableStream<Uint8Array>;
}

export async function deleteFile(key: string) {
  await rm(storagePath(key), { force: true });
}
