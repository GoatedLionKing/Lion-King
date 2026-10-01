import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LionMark } from "@/components/brand/lion-mark";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, authEnabled } from "@/lib/auth/client";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { hasOwner } from "@/lib/server/admin-guard";

export const Route = createFileRoute("/login")({
  loader: () => hasOwner(),
  component: LoginPage,
  head: () => ({
    meta: [{ title: "دخول الإدارة — GOATED LIONKING" }, { name: "robots", content: "noindex" }],
  }),
});

function LoginPage() {
  const { hasOwner: ownerExists } = Route.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  if (user) {
    return <RedirectToSignIn to="/owner-panel" />;
  }
  return (
    <PublicShell>
      <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-16">
        <div className="rounded-xl border border-border bg-surface p-6">
          <LionMark className="size-10" />
          <h1 className="mt-4 font-display text-2xl text-fg">{"دخول الإدارة"}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {"وصول خاص بمالك الموقع. لا يحتاج الزوار إلى حساب."}
          </p>
          {authEnabled ? (
            <div className="mt-6">
              <EmailForm allowSignUp={!ownerExists} />
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted">{"تسجيل الدخول معطل."}</p>
          )}
          {isPending ? <p className="mt-4 text-xs text-subtle">{"جارٍ التحقق من الجلسة…"}</p> : null}
        </div>
      </main>
    </PublicShell>
  );
}

function EmailForm({ allowSignUp }: { allowSignUp: boolean }) {
  const [mode, setMode] = useState<"in" | "up">(allowSignUp ? "up" : "in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: name || "Owner",
          callbackURL: "/owner-panel",
        });
        if (err) throw new Error(err.message ?? "Sign-up failed");
      } else {
        const { error: err } = await authClient.signIn.email({ email, password, callbackURL: "/owner-panel" });
        if (err) throw new Error(err.message ?? "Sign-in failed");
      }
      window.location.href = "/owner-panel";
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ ما");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {mode === "up" ? (
        <label className="block space-y-1.5">
          <Label>{"الاسم"}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
      ) : null}
      <label className="block space-y-1.5">
        <Label>{"البريد الإلكتروني"}</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </label>
      <label className="block space-y-1.5">
        <Label>{"كلمة المرور"}</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete={mode === "up" ? "new-password" : "current-password"}
        />
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "يرجى الانتظار…" : mode === "up" ? "إنشاء حساب المالك" : "تسجيل الدخول"}
      </Button>
      {allowSignUp ? (
        <button
          type="button"
          className="w-full text-center text-xs text-muted hover:text-gold"
          onClick={() => setMode(mode === "up" ? "in" : "up")}
        >
          {mode === "up" ? "لديك حساب بالفعل؟ تسجيل الدخول" : "هل تحتاج إلى إنشاء حساب المالك الأول؟ أنشئه الآن"}
        </button>
      ) : null}
    </form>
  );
}
