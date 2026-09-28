import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

const FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-fg">
      <span className="text-gold" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={1.5} />
      </span>
      <p className="font-display text-xs tracking-[0.28em] text-gold uppercase">500</p>
      <h1 className="font-display text-2xl font-medium text-fg">Something went wrong</h1>
      <p className="max-w-md text-sm leading-relaxed break-words text-muted">{errorMessage(error)}</p>
      <Link
        to="/"
        className="mt-2 inline-flex h-11 items-center rounded-md bg-gold px-5 text-sm font-medium text-bg"
      >
        Return home
      </Link>
    </main>
  );
}

export function NotFoundPage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-xs tracking-[0.28em] text-gold uppercase">404</p>
      <h1 className="font-display text-3xl font-medium text-fg">Page not found</h1>
      <p className="max-w-md text-sm leading-relaxed text-muted">
        This page does not exist, or the project is no longer published.
      </p>
      <Link
        to="/"
        className="mt-2 inline-flex h-11 items-center rounded-md bg-gold px-5 text-sm font-medium text-bg"
      >
        Return home
      </Link>
    </main>
  );
}
