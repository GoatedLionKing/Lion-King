import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { checkIsAdmin } from "@/lib/server/admin-guard";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isPending } = useCurrentUserState();
  const [gate, setGate] = useState<"wait" | "ok" | "no">("wait");

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      setGate("wait");
      return;
    }
    let live = true;
    checkIsAdmin()
      .then((res) => {
        if (live) setGate(res.isAdmin || res.isClaimable ? "ok" : "no");
      })
      .catch(() => {
        if (live) setGate("no");
      });
    return () => {
      live = false;
    };
  }, [user, isPending]);

  if (isPending || (user && gate === "wait")) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg text-muted">
        <p className="text-sm">{"جارٍ تحميل لوحة التحكم…"}</p>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (gate === "no") {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
        <div>
          <p className="text-xs tracking-[0.28em] text-gold uppercase">403</p>
          <h1 className="mt-3 font-display text-2xl text-fg">{"وصول غير مصرح إلى لوحة الإدارة"}</h1>
          <p className="mt-2 max-w-md text-sm text-muted">
            This dashboard is reserved for the site owner.
          </p>
        </div>
      </main>
    );
  }
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
