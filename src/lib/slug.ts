export function slugify(input: string): string {
  const base = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "game";
}

export function newId(): string {
  return crypto.randomUUID();
}

export function newStorageKey(kind: "cover" | "file" | "logo", extension?: string): string {
  const suffix = extension && /^[a-z0-9]+$/i.test(extension) ? `.${extension.toLowerCase()}` : "";
  return `${kind}_${crypto.randomUUID().replaceAll("-", "")}${suffix}`;
}
