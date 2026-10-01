export type Lookup = { id: string; name: string; sort_order: number };

export type Category = Lookup & { slug: string };

export type SiteSettings = {
  id: number;
  site_name: string;
  site_description: string;
  tagline: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  logo_storage_key: string | null;
  seo_title: string;
  seo_description: string;
  max_upload_bytes: number;
  allowed_file_types: string;
  owner_user_id: string | null;
  featured_heading: string;
  latest_heading: string;
};

export type Game = {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover: string | null;
  youtube_video_url: string | null;
  platform_id: string;
  project_type_id: string;
  status_id: string;
  version: string | null;
  developer: string | null;
  original_release: string | null;
  localization_release: string | null;
  featured: boolean;
  published: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  platform_name?: string;
  project_type_name?: string;
  status_name?: string;
  file_count?: number;
};

export type Version = {
  id: string;
  game_id: string;
  name: string;
  version_number: string;
  description: string;
  release_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type GameFile = {
  id: string;
  game_id: string;
  version_id: string;
  name: string;
  description: string;
  original_filename: string;
  storage_key: string | null;
  external_url: string | null;
  file_size: number;
  mime_type: string;
  download_count: number;
  last_downloaded_at: string | null;
  visible: boolean;
  created_at: string;
  updated_at: string;
  version_name?: string;
  version_number?: string;
};

export type LatestRelease = {
  file_id: string;
  file_name: string;
  file_created_at: string;
  game_id: string;
  game_slug: string;
  game_title: string;
  game_cover: string | null;
  platform_name: string;
  status_name: string;
  status_id: string;
  version_name: string;
};

export type GameDetail = {
  game: Game;
  versions: Array<Version & { files: GameFile[] }>;
};

export type Lookups = {
  platforms: Lookup[];
  projectTypes: Lookup[];
  statuses: Lookup[];
  categories: Category[];
};

export type AdminStats = {
  totalGames: number;
  publishedGames: number;
  totalFiles: number;
  hiddenFiles: number;
  totalDownloads: number;
  totalStorage: number;
  latestGame: Game | null;
  latestFile: GameFile | null;
};
