import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const NAV = [
  { to: "/", label: "الرئيسية" },
  { to: "/quran", label: "المصحف" },
  { to: "/library", label: "المكتبة" },
  { to: "/adhkar", label: "الأذكار" },
  { to: "/qibla", label: "القبلة" },
] as const;

export function AppShell({
  children,
  title,
  action,
}: {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const liquid = useAppStore((s) => s.settings.liquidGlass !== false);
  const dock = useAppStore((s) => s.settings.navStyle === "dock");

  return (
    <div className="app-shell flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-fg/10 bg-bg/80 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Link
            to="/search"
            className="min-h-11 min-w-11 px-1 text-sm text-muted tap"
          >
            بحث
          </Link>
          <h1 className="flex-1 text-center font-arabic text-xl font-normal leading-none">
            {title ?? "أذكار اليوم"}
          </h1>
          {action}
          <Link
            to="/settings"
            aria-label="تخصيص المظهر"
            title="تخصيص"
            className={cn(
              "grid size-11 place-items-center tap",
              pathname.startsWith("/settings") ? "text-accent" : "text-muted",
            )}
          >
            <CustomizeMark />
          </Link>
        </div>
      </header>
      <div key={pathname} className="page-enter flex-1 pb-24">
        {children}
      </div>
      <nav
        className={cn(
          "nav-glass z-30",
          liquid && "is-liquid",
          dock ? "is-dock" : "is-float",
        )}
      >
        <ul className="grid grid-cols-5 px-1">
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn("nav-tab", active && "is-on")}
                >
                  <span className="nav-pill" aria-hidden="true" />
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function CustomizeMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7.5h10M18 7.5h2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
      <circle cx="16" cy="7.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4 16.5h2M10 16.5h10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
      <circle cx="8" cy="16.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
