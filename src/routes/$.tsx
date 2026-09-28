import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/public-shell";
import { NotFoundPage } from "@/lib/error-component";

export const Route = createFileRoute("/$")({
  component: CatchAll,
});

function CatchAll() {
  return (
    <PublicShell>
      <NotFoundPage />
    </PublicShell>
  );
}
