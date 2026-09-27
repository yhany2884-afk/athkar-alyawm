import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { ThemeRoot } from "@/components/theme-root";
import appCss from "../styles.css?url";

const APP_NAME = "أذكار اليوم";
const APP_DESC =
  "مصحف حفص كامل، أذكار الصباح والمساء والصلاة والنوم، كتب البخاري ومسلم والسنن، وبوصلة القبلة. تطبيق مجاني يعمل دون إنترنت على أندرويد وآيفون وويندوز وماك.";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: APP_NAME,
  inLanguage: "ar",
  description: APP_DESC,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Android, iOS, Windows, macOS",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "مصحف حفص",
    "أذكار الصباح والمساء",
    "كتب الحديث",
    "تحديد القبلة",
  ],
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "أذكار اليوم | مصحف وأذكار وقبلة" },
      { name: "description", content: APP_DESC },
      {
        name: "keywords",
        content:
          "أذكار, أذكار الصباح, أذكار المساء, مصحف, قرآن حفص, قبلة, صحيح البخاري, صحيح مسلم, تطبيق إسلامي, أذكار اليوم",
      },
      { name: "theme-color", content: "#F5F7FB" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "msapplication-TileColor", content: "#F6F0E4" },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(JSON_LD),
      },
    ],
  }),
  component: () => (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <ThemeRoot>
            <Outlet />
          </ThemeRoot>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
