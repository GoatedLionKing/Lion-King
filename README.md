# GOATED LIONKING

Self-hosted Arabic game localization download platform.

## Production architecture

- React + TanStack Start + Nitro
- Self-hosted Better Auth email/password authentication
- Persistent PGlite database by default; PostgreSQL can be supplied with `DATABASE_URL`
- External file downloads via MediaFire; the site stores metadata and the MediaFire URL instead of game binaries
- Local persistent storage is used only for site assets such as covers
- Admin-only file management with MediaFire URL validation
- No Grok, Lovable, Bolt, OAuth broker, or vendor-specific runtime is required

## Run directly

1. Install Node.js 22+.
2. Copy `.env.example` to `.env` and set `BETTER_AUTH_URL` and a strong `BETTER_AUTH_SECRET`.
3. Run `npm ci`.
4. Run `npm run build`.
5. Run `npm run start`.

The site listens on `0.0.0.0:8080`. Put your domain's DNS record on the server and expose HTTPS using your normal server/TLS setup.

## Docker

```sh
cp .env.example .env
# edit BETTER_AUTH_URL and BETTER_AUTH_SECRET
docker compose up -d --build
```

The database and site assets are stored in Docker volumes. Game/localization binaries are hosted externally on MediaFire, so the application does not need large binary storage.

## First administrator

Open `/login`. If no owner exists, the first account created becomes the site owner. After that, public visitors cannot create accounts.

## Large files

Game files are added from the admin dashboard by entering a MediaFire download URL, filename, and size. Public download requests are tracked by the site and then redirected to the stored MediaFire URL.

## File hosting

Game and localization files are hosted externally on MediaFire. The website stores only the metadata and approved MediaFire URL. `STORAGE_DIR` is still used for local site assets such as covers.

## Interface language

The public and admin interfaces default to Arabic (`ar`) with RTL layout. A language switcher (`ع / EN`) is available in the header and persists the visitor's choice in `localStorage`. Switching to English changes the interface to LTR.
