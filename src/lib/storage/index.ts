import { env } from "@/lib/env.server";
import { deleteFile, getFileInfo, putStream } from "./fs";

export type StorageDriver = "local";

export function storageDriver(): StorageDriver {
  return "local";
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
  return putStream(key, body, expectedSize, maxBytes);
}

export async function getStoredFile(key: string) {
  return getFileInfo(key);
}

export async function removeObject(key: string) {
  await deleteFile(key);
}

export const deleteObject = removeObject;
