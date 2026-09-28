import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { NotFoundPage } from "@/lib/error-component";
import { AuthProvider } from "@/lib/auth/provider";
import { LanguageProvider } from "@/lib/i18n";
import appCss from "../styles.css?url";

const APP_NAME = "GOATED LIONKING";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#070708" },
      {
        name: "description",
        content:
          "Official download platform for Arabic game localization projects, patches, mods, fonts, translations, and dubbed audio.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Outfit:wght@400;500;600&family=Tajawal:wght@400;500;700&display=swap",
      },
    ],
  }),
  notFoundComponent: NotFoundPage,
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="ar" dir="rtl" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-bg text-fg">
        <LanguageProvider>
          <AuthProvider>
            <Outlet />
            <Toaster theme="dark" position="bottom-right" richColors={false} />
          </AuthProvider>
        </LanguageProvider>
        <Scripts />
      </body>
    </html>
  );
}
