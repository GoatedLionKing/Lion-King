-- Goated LionKing catalog schema. Metadata only — binary payloads live in
-- file_blobs (preview / default) or object storage (S3/R2 when configured).

create table if not exists platforms (
  id text primary key,
  name text not null,
  sort_order int not null default 0
);

create table if not exists project_types (
  id text primary key,
  name text not null,
  sort_order int not null default 0
);

create table if not exists project_statuses (
  id text primary key,
  name text not null,
  sort_order int not null default 0
);

create table if not exists categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  sort_order int not null default 0
);

create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'GOATED LIONKING',
  site_description text not null default 'A professional platform for Arabic game localization projects, patches, mods, fonts, translations, dubbing, and related files.',
  tagline text not null default 'Arabic Game Localization & Modding',
  hero_title text not null default 'GOATED LIONKING',
  hero_subtitle text not null default 'Arabic Game Localization & Modding',
  hero_description text not null default 'A professional platform for Arabic game localization projects, patches, mods, fonts, translations, dubbing, and related files.',
  logo_storage_key text,
  seo_title text not null default 'GOATED LIONKING — Arabic Game Localization & Modding',
  seo_description text not null default 'Official download platform for Arabic game localization projects, patches, mods, fonts, translations, and dubbed audio.',
  max_upload_bytes bigint not null default 16106127360,
  allowed_file_types text not null default 'zip,rar,7z,tar,gz,bz2,xz,zst,iso,cso,pkg,pbp,prx,vpk,w3d,wad,pss,psw,pmf,bin,dat,pak,obb,apk,xapk,ips,ipsw,xdelta,bps,ppf,ups,exe,dll,asi,lua,ttf,otf,woff,woff2,txt,md,pdf,jpg,jpeg,png,webp,gif,mp3,ogg,wav,flac,m4a,mp4,avi,mpeg,mpg,mkv,json,xml,csv,ass,srt',
  owner_user_id text,
  featured_heading text not null default 'Featured Games',
  latest_heading text not null default 'Latest Releases',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists games (
  id text primary key,
  slug text not null unique,
  title text not null,
  description text not null default '',
  cover text,
  platform_id text not null references platforms(id),
  project_type_id text not null references project_types(id),
  status_id text not null references project_statuses(id),
  version text,
  developer text,
  original_release date,
  localization_release date,
  featured boolean not null default false,
  published boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists game_categories (
  game_id text not null references games(id) on delete cascade,
  category_id text not null references categories(id) on delete cascade,
  primary key (game_id, category_id)
);

create table if not exists versions (
  id text primary key,
  game_id text not null references games(id) on delete cascade,
  name text not null,
  version_number text not null,
  description text not null default '',
  release_date date,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists files (
  id text primary key,
  game_id text not null references games(id) on delete cascade,
  version_id text not null references versions(id) on delete cascade,
  name text not null,
  description text not null default '',
  original_filename text not null,
  storage_key text,
  external_url text,
  file_size bigint not null default 0,
  mime_type text not null default 'application/octet-stream',
  download_count int not null default 0,
  last_downloaded_at timestamptz,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists downloads (
  id text primary key,
  file_id text not null references files(id) on delete cascade,
  game_id text not null references games(id) on delete cascade,
  downloaded_at timestamptz not null default now()
);

create index if not exists games_slug_idx on games (slug);
create index if not exists games_title_idx on games (title);
create index if not exists games_published_idx on games (published);
create index if not exists games_featured_idx on games (featured);
create index if not exists games_platform_idx on games (platform_id);
create index if not exists games_created_idx on games (created_at desc);
create index if not exists games_updated_idx on games (updated_at desc);
create index if not exists files_game_id_idx on files (game_id);
create index if not exists files_version_id_idx on files (version_id);
create index if not exists files_visible_idx on files (visible);
create index if not exists versions_game_id_idx on versions (game_id);
create index if not exists downloads_file_id_idx on downloads (file_id);
create index if not exists downloads_game_id_idx on downloads (game_id);
create index if not exists downloads_at_idx on downloads (downloaded_at desc);

insert into platforms (id, name, sort_order) values
  ('android', 'Android', 10),
  ('psp', 'PSP', 20),
  ('ps2', 'PS2', 30),
  ('pc', 'PC', 40),
  ('other', 'Other', 90)
on conflict (id) do nothing;

insert into project_types (id, name, sort_order) values
  ('arabic-localization', 'Arabic Localization', 10),
  ('arabic-dubbing', 'Arabic Dubbing', 20),
  ('translation', 'Translation', 30),
  ('mod', 'Mod', 40),
  ('patch', 'Patch', 50),
  ('font', 'Font', 60),
  ('audio', 'Audio', 70),
  ('other', 'Other', 90)
on conflict (id) do nothing;

insert into project_statuses (id, name, sort_order) values
  ('completed', 'Completed', 10),
  ('in-progress', 'In Progress', 20),
  ('coming-soon', 'Coming Soon', 30),
  ('updated', 'Updated', 40)
on conflict (id) do nothing;

insert into categories (id, name, slug, sort_order) values
  ('action', 'Action', 'action', 10),
  ('adventure', 'Adventure', 'adventure', 20),
  ('horror', 'Horror', 'horror', 30),
  ('rpg', 'RPG', 'rpg', 40),
  ('handheld', 'Handheld', 'handheld', 50)
on conflict (id) do nothing;

insert into site_settings (id) values (1)
on conflict (id) do nothing;
