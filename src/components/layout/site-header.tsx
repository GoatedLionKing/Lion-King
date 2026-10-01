import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, Search } from "lucide-react";
import { useState } from "react";
import { LionMark } from "@/components/brand/lion-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { checkIsAdmin } from "@/lib/server/admin-guard";
import { useEffect } from "react";

const NAV = [
  { to: "/", label: "الرئيسية" },
  { to: "/games", label: "الألعاب" },
  { to: "/projects", label: "المشاريع" },
  { to: "/latest", label: "الأحدث" },
  { to: "/search", label: "البحث" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const [admin, setAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setAdmin(false);
      return;
    }
    let live = true;
    checkIsAdmin()
      .then((res) => {
        if (live) setAdmin(res.isAdmin || res.isClaimable);
      })
      .catch(() => {
        if (live) setAdmin(false);
      });
    return () => {
      live = false;
    };
  }, [user]);

  function onSearch(form: HTMLFormElement) {
    const q = new FormData(form).get("q");
    const value = typeof q === "string" ? q.trim() : "";
    void navigate({ to: "/search", search: { q: value } });
    setOpen(false);
  }

  const links = (
    <nav className="flex flex-col gap-1 md:flex-row md:items-center md:gap-1">
      {NAV.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            search={item.to === "/search" ? { q: "" } : undefined}
            onClick={() => setOpen(false)}
            className={`inline-flex h-11 items-center px-3 text-sm tracking-wide ${
              active ? "text-gold" : "text-muted hover:text-fg"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <LionMark className="size-8 shrink-0" />
          <span className="truncate font-display text-sm tracking-[0.18em] text-gold uppercase">
            Goated LionKing
          </span>
        </Link>
        <div className="hidden flex-1 md:flex md:justify-center">{links}</div>
        <form
          className="hidden min-w-0 flex-1 max-w-xs lg:block"
          onSubmit={(e) => {
            e.preventDefault();
            onSearch(e.currentTarget);
          }}
        >
          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
            <Input name="q" placeholder={"ابحث عن لعبة"} className="h-10 pl-9" />
          </label>
        </form>
        <div className="ml-auto flex items-center gap-2">
          {isPending ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-surface-2" />
          ) : (
            <>

              <SignedIn>
                {admin ? (
                  <Button asChild size="sm">
                    <Link to="/owner-panel">{"لوحة التحكم"}</Link>
                  </Button>
                ) : null}
                <div className="hidden sm:block">
                  <UserButton />
                </div>
              </SignedIn>
            </>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label={"القائمة"}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent title={"القائمة"}>
              {links}
              <form
                className="mt-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  onSearch(e.currentTarget);
                }}
              >
                <Input name="q" placeholder={"ابحث عن لعبة"} />
                <Button type="submit" className="mt-3 w-full">
                  {"البحث"}
                </Button>
              </form>
              <div className="mt-auto pt-8 sm:hidden">
                <UserButton />
              </div>
              <SheetClose asChild>
                <span className="sr-only">{"إغلاق"}</span>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
