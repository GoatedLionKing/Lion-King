export const PAGE_SIZE = 15;
export const LATEST_LIMIT = 8;
export const FEATURED_LIMIT = 6;

export const DEFAULT_ALLOWED_TYPES =
  "zip,rar,7z,tar,gz,bz2,xz,zst,iso,cso,pkg,pbp,prx,vpk,w3d,wad,pss,psw,pmf,bin,dat,pak,obb,apk,xapk,ips,ipsw,xdelta,bps,ppf,ups,exe,dll,asi,lua,ttf,otf,woff,woff2,txt,md,pdf,jpg,jpeg,png,webp,gif,mp3,ogg,wav,flac,m4a,mp4,avi,mpeg,mpg,mkv,json,xml,csv,ass,srt";

export const COVER_TYPES = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

export const STATUS_TONE: Record<string, "gold" | "muted" | "success" | "warn"> = {
  completed: "success",
  "in-progress": "gold",
  "coming-soon": "muted",
  updated: "warn",
};
