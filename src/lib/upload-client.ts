import { getBearerToken } from "@/lib/auth/client";

export type UploadResult = {
  id?: string;
  storageKey: string;
  size: number;
  mimeType: string;
  filename: string;
};

type UploadMetadata = {
  kind: "cover" | "file";
  filename: string;
  mimeType: string;
  gameId?: string;
  versionId?: string;
  name?: string;
  description?: string;
  visible?: boolean;
};

function encodeMetadata(value: UploadMetadata) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function uploadWithProgress(
  file: File,
  metadata: UploadMetadata,
  onProgress: (pct: number) => void,
  signal?: AbortSignal,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.withCredentials = true;
    const token = getBearerToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Content-Type", metadata.mimeType || "application/octet-stream");
    xhr.setRequestHeader("X-Upload-Metadata", encodeMetadata(metadata));
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText) as UploadResult & { error?: string };
        if (xhr.status >= 200 && xhr.status < 300) resolve(json);
        else reject(new Error(json.error || "Upload failed"));
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Network failure during upload."));
    xhr.onabort = () => reject(new Error("Upload cancelled"));
    const onAbort = () => xhr.abort();
    signal?.addEventListener("abort", onAbort, { once: true });
    xhr.send(file);
  });
}
