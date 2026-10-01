import { Link } from "@tanstack/react-router";
import { LionMark } from "@/components/brand/lion-mark";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <LionMark className="size-8" />
          <div>
            <p className="font-display text-sm tracking-[0.18em] text-gold uppercase">Goated LionKing</p>
            <p className="text-xs text-muted">{"تعريب الألعاب والتعديل عليها"}</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          <Link to="/games" className="hover:text-gold">
            Games
          </Link>
          <Link to="/latest" className="hover:text-gold">
            Latest
          </Link>
          <Link to="/search" search={{ q: "" }} className="hover:text-gold">
            Search
          </Link>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-7 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <p className="text-xs tracking-wider text-muted">
              اشترك في قناتي على:
            </p>
            <a
              href="https://www.youtube.com/@Goated_LionKing"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-display text-base text-gold transition-colors hover:text-gold-2"
            >
              YouTube
            </a>
          </div>

          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <p className="text-xs tracking-wider text-muted">
              وتابع صفحتي على:
            </p>
            <a
              href="https://www.instagram.com/goated_lionking?stkn=Nzl1eWRucjQ0N2Fi"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-display text-base text-gold transition-colors hover:text-gold-2"
            >
              Instagram
            </a>
          </div>

          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <p className="text-xs tracking-wider text-muted">
              تحميل التطبيق الرسمي:
            </p>
            <a
              href="https://www.mediafire.com/file/stbpxjcbyrh1oec/Goated.apk/file"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-display text-base text-gold transition-colors hover:text-gold-2"
            >
              Goated
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-subtle">
        © 2026 Goated LionKing — All Rights Reserved.
      </div>
    </footer>
  );
}
