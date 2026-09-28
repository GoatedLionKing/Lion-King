# GOATED LIONKING development notes

This is a standalone, self-hosted application. It must not depend on Lovable, Bolt, Grok, an OAuth broker, or a platform-specific runtime.

## Runtime

- Node.js 22+
- TanStack Start + Vite + Nitro node-server
- Better Auth email/password
- Persistent PGlite by default, or PostgreSQL through `DATABASE_URL`
- Persistent local file storage through `STORAGE_DIR`
- `NITRO_HOST=0.0.0.0` and `NITRO_PORT=8080` for production containers

## Large files

The maximum size is 15 GiB per file. Never use `arrayBuffer()`, `formData()`, or another whole-file buffering API for game uploads/downloads. Uploads and downloads must remain streaming.

## Security

Only the first authenticated account may claim `site_settings.owner_user_id`. All Admin server functions must verify the authenticated session and owner id server-side. Public visitors do not need accounts.

## Storage

Game files belong on persistent storage, not in PostgreSQL. The local storage implementation writes to a temporary file, validates the byte count, then atomically renames it. Downloads stream from disk and support HTTP byte ranges.
