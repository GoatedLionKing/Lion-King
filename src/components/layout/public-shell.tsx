import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export function PublicShell({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  return (
    <div key={language} className="flex min-h-dvh flex-col bg-bg text-fg">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
