export function formatBytes(bytes: number | null | undefined): string {
  const n = Number(bytes ?? 0);
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  const value = n / 1024 ** i;
  const digits = i === 0 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} ${units[i]}`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const raw = typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);
  const [y, m, d] = raw.split("-").map(Number);
  if (!y || !m || !d) return raw;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${d} ${months[m - 1]} ${y}`;
}

export function coverSrc(cover: string | null | undefined): string {
  if (!cover) return "/covers/placeholder.svg";
  if (cover.startsWith("/") || cover.startsWith("http://") || cover.startsWith("https://")) {
    return cover;
  }
  return `/api/media/${encodeURIComponent(cover)}`;
}

export function contentDisposition(filename: string, kind: "attachment" | "inline" = "attachment") {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
  const encoded = encodeURIComponent(filename);
  return `${kind}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}
