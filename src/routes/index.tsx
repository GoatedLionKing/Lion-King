import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/games/empty-state";
import { StatusBadge } from "@/components/games/status-badge";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { coverSrc, formatDate } from "@/lib/format";
import { getFeaturedGames, getLatestReleases, getSiteSettings } from "@/lib/server/catalog";
import { tx } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [settings, featured, latest] = await Promise.all([
      getSiteSettings(),
      getFeaturedGames(),
      getLatestReleases(),
    ]);
    return { settings, featured, latest };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.settings.seo_title ?? "GOATED LIONKING" },
      { name: "description", content: loaderData?.settings.seo_description ?? "" },
    ],
  }),
  component: Home,
});

function Home() {
  const { settings, featured, latest } = Route.useLoaderData();

  return (
    <PublicShell>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgb(212_175_55/0.16)_0,transparent_24%),radial-gradient(circle_at_82%_70%,rgb(212_175_55/0.10)_0,transparent_28%),linear-gradient(135deg,rgb(7_7_8)_0%,rgb(15_13_9)_48%,rgb(7_7_8)_100%)]" />
        <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle,transparent_0,transparent_45%,rgb(212_175_55/0.35)_46%,transparent_47%)] bg-[length:90px_90px]" />

        <div className="relative mx-auto flex min-h-[32rem] max-w-6xl flex-col justify-center px-4 py-20 md:min-h-[36rem]">
          <p className="text-xs tracking-[0.32em] text-gold uppercase">
            {settings.hero_subtitle}
          </p>

          <h1 className="mt-4 max-w-xl font-display text-4xl leading-[1.1] text-fg md:text-6xl">
            {settings.hero_title}
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted md:text-lg">
            {settings.hero_description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/games">{tx("Browse Games")}</Link>
            </Button>

            <Button asChild variant="secondary">
              <Link to="/latest">{tx("Latest Releases")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-bg py-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.28em] text-gold uppercase">
                {tx("Archive")}
              </p>

              <h2 className="mt-2 font-display text-3xl text-fg">
                {settings.featured_heading}
              </h2>
            </div>

            <Link
              to="/games"
              className="hidden items-center gap-1 text-sm text-gold hover:text-gold-2 sm:inline-flex"
            >
              All games
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {featured.length === 0 ? (
            <EmptyState
              title="No games available yet."
              body="Published featured projects will appear here."
            />
          ) : (
            <FeaturedCarousel games={featured} />
          )}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.28em] text-gold uppercase">
                {tx("Just in")}
              </p>

              <h2 className="mt-2 font-display text-3xl text-fg">
                {settings.latest_heading}
              </h2>
            </div>

            <Link
              to="/latest"
              className="hidden items-center gap-1 text-sm text-gold hover:text-gold-2 sm:inline-flex"
            >
              View all
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {latest.length === 0 ? (
            <EmptyState
              title="No releases yet."
              body="New files will show up here as soon as they are published."
            />
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-bg">
              {latest.map((item) => (
                <li key={item.file_id}>
                  <Link
                    to="/download/$fileId"
                    params={{ fileId: item.file_id }}
                    className="flex gap-4 p-4 transition-colors hover:bg-surface-2"
                  >
                    <img
                      src={coverSrc(item.game_cover)}
                      alt=""
                      className="size-16 shrink-0 rounded-md object-cover"
                      loading="lazy"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-fg">
                        {item.game_title}
                      </p>

                      <p className="truncate text-sm text-muted">
                        {item.file_name} · {item.version_name} · {item.platform_name}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge
                          statusId={item.status_id}
                          label={item.status_name}
                        />

                        <span className="text-xs text-subtle">
                          {formatDate(item.file_created_at)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </PublicShell>
  );
}

function FeaturedCarousel({
  games,
}: {
  games: Awaited<ReturnType<typeof getFeaturedGames>>;
}) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [dragStart, setDragStart] = useState<number | null>(null);

  const count = games.length;

  useEffect(() => {
    setActive((current) => (count === 0 ? 0 : current % count));
  }, [count]);

  if (count === 0) {
    return null;
  }

  const move = (step: 1 | -1) => {
    setDirection(step);
    setActive((current) => (current + step + count) % count);
  };

  const getOffset = (index: number) => {
    let offset = index - active;

    if (offset > count / 2) {
      offset -= count;
    }

    if (offset < -count / 2) {
      offset += count;
    }

    return offset;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setDragStart(event.clientX);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart === null) {
      return;
    }

    const distance = event.clientX - dragStart;
    setDragStart(null);

    if (Math.abs(distance) < 45) {
      return;
    }

    move(distance < 0 ? 1 : -1);
  };

  return (
    <div className="relative">
      <div
        className="relative mx-auto h-[390px] w-full select-none touch-pan-y sm:h-[470px] md:h-[520px]"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setDragStart(null)}
      >
        <div className="absolute inset-x-0 top-0 h-full overflow-hidden">
          {games.map((game, index) => {
            const offset = getOffset(index);
            const isActive = offset === 0;

            if (Math.abs(offset) > 2) {
              return null;
            }

            const x =
              offset === 0
                ? "0%"
                : offset === -1
                  ? "-54%"
                  : offset === 1
                    ? "54%"
                    : offset === -2
                      ? "-88%"
                      : "88%";

            const scale =
              offset === 0
                ? 1
                : Math.abs(offset) === 1
                  ? 0.78
                  : 0.62;

            const opacity =
              offset === 0
                ? 1
                : Math.abs(offset) === 1
                  ? 0.55
                  : 0.28;

            const zIndex = 20 - Math.abs(offset);

            return (
              <div
                key={game.id}
                className="absolute left-1/2 top-0 h-[310px] w-[207px] sm:h-[390px] sm:w-[260px] md:h-[430px] md:w-[287px]"
                style={{
                  transform: `translateX(calc(-50% + ${x})) scale(${scale})`,
                  opacity,
                  zIndex,
                  transition:
                    "transform 500ms cubic-bezier(0.22, 1, 0.36, 1), opacity 400ms ease",
                }}
              >
                <Link
                  to="/games/$slug"
                  params={{ slug: game.slug }}
                  aria-label={game.title}
                  className={`group block h-full w-full ${
                    isActive ? "cursor-pointer" : "cursor-pointer"
                  }`}
                  onClick={(event) => {
                    if (!isActive) {
                      event.preventDefault();
                      move(offset > 0 ? 1 : -1);
                    }
                  }}
                >
                  <div
                    className={`relative h-full w-full overflow-hidden rounded-xl border bg-surface-2 shadow-2xl ${
                      isActive
                        ? "border-gold/70 shadow-gold"
                        : "border-border/60"
                    }`}
                  >
                    <img
                      src={coverSrc(game.cover)}
                      alt={game.title}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                      loading={index === active ? "eager" : "lazy"}
                      draggable={false}
                    />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/75 to-transparent" />

                    <div className="pointer-events-none absolute -bottom-4 left-1/2 h-8 w-[75%] -translate-x-1/2 rounded-full bg-black/60 blur-xl" />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex flex-col items-center">
        <Link
          to="/games/$slug"
          params={{ slug: games[active].slug }}
          className="max-w-[90%] truncate text-center font-display text-xl text-fg transition-colors hover:text-gold-2"
        >
          {games[active].title}
        </Link>

        <div className="mt-1 text-sm text-muted">
          {active + 1} / {count}
        </div>

        <div className="mt-5 flex items-center gap-5">
          <button
            type="button"
            aria-label="Previous featured game"
            onClick={() => move(-1)}
            className="flex size-11 items-center justify-center rounded-full border border-border bg-surface text-fg transition-all hover:border-gold/60 hover:bg-surface-2 hover:text-gold active:scale-95"
          >
            <ArrowLeft className="size-5" />
          </button>

          <div className="flex items-center gap-1.5">
            {games.map((game, index) => (
              <button
                key={game.id}
                type="button"
                aria-label={`Go to ${game.title}`}
                onClick={() => {
                  setDirection(index > active ? 1 : -1);
                  setActive(index);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === active
                    ? "w-6 bg-gold"
                    : "w-1.5 bg-border hover:bg-muted"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Next featured game"
            onClick={() => move(1)}
            className="flex size-11 items-center justify-center rounded-full border border-border bg-surface text-fg transition-all hover:border-gold/60 hover:bg-surface-2 hover:text-gold active:scale-95"
          >
            <ArrowRight className="size-5" />
          </button>
        </div>

        <div className="mt-3 text-[10px] uppercase tracking-[0.25em] text-subtle">
          Featured
        </div>
      </div>
    </div>
  );
}
