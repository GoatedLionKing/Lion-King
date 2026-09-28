import { del, put } from "@vercel/blob";
import { env } from "@/lib/env.server";
import { deleteFile, getFileInfo, putStream } from "./fs";

export type StorageDriver = "blob" | "local";

export function storageDriver(): StorageDriver {
  return env("BLOB_READ_WRITE_TOKEN") ? "blob" : "local";
}

export function storageRoot(): string {
  return env("STORAGE_DIR") ?? "./data/files";
}

export async function saveUploadStream(
  key: string,
  body: ReadableStream<Uint8Array>,
  expectedSize: number,
  maxBytes: number,
) {
  if (storageDriver() === "blob") {
    if (!Number.isSafeInteger(expectedSize) || expectedSize < 1) {
      throw new Error("Missing or invalid Content-Length");
    }
    if (expectedSize > maxBytes) {
      throw new Error("File exceeds the maximum upload size.");
    }

    const blob = await put(key, body, {
      access: "public",
      addRandomSuffix: false,
      storeId: env("BLOB_READ_WRITE_TOKEN_STORE_ID"),
    });

    return blob.url;
  }

  return putStream(key, body, expectedSize, maxBytes);
}

export async function getStoredFile(key: string) {
  if (storageDriver() === "blob" && /^https?:\/\//i.test(key)) {
    return { size: 0, path: key };
  }

  return getFileInfo(key);
}

export async function removeObject(key: string) {
  if (/^https?:\/\//i.test(key)) {
    await del(key);
    return;
  }

  await deleteFile(key);
}

export const deleteObject = removeObject;
