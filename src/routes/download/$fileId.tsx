import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { coverSrc, formatBytes } from "@/lib/format";
import { getFileForDownload } from "@/lib/server/catalog";

import { tx } from "@/lib/i18n";
export const Route = createFileRoute("/download/$fileId")({
  loader: async ({ params }) => {
    const file = await getFileForDownload({ data: { fileId: params.fileId } });
    if (!file) throw notFound();
    return file;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `Download ${loaderData.name} — ${loaderData.game_title} | Goated LionKing`
          : "Download — GOATED LIONKING",
      },
      {
        name: "description",
        content: loaderData
          ? `Download ${loaderData.name} for ${loaderData.game_title}.`
          : "Download localization files.",
      },
    ],
  }),
  component: DownloadPage,
});

function DownloadPage() {
  const file = Route.useLoaderData();
  const href = `/api/download/${encodeURIComponent(file.id)}`;

  return (
    <PublicShell>
      <main className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <img src={coverSrc(file.game_cover)} alt="" className="mb-6 h-40 w-28 rounded-lg object-cover" />
        <p className="text-xs tracking-[0.28em] text-gold uppercase">{tx("Download")}</p>
        <h1 className="mt-3 font-display text-3xl text-fg">{file.game_title}</h1>
        <p className="mt-2 text-muted">{file.name}</p>
        <p className="mt-1 text-sm text-subtle">
          {file.version_name} · {formatBytes(file.file_size)}
        </p>
        <Button asChild className="mt-8 min-w-48">
          <a href={href}>
            <Download className="size-4" />
            تحميل عبر MediaFire
          </a>
        </Button>
        <Link
          to="/games/$slug"
          params={{ slug: file.game_slug }}
          className="mt-5 inline-flex h-11 items-center text-sm text-muted hover:text-gold"
        >
          Back to game
        </Link>
      </main>
    </PublicShell>
  );
}
