import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const NAV = [
  { to: "/", label: "الرئيسية", icon: "home" },
  { to: "/quran", label: "القرآن", icon: "book" },
  { to: "/adhkar", label: "الأذكار", icon: "moon" },
  { to: "/qibla", label: "القبلة", icon: "compass" },
  { to: "/library", label: "المزيد", icon: "grid" },
] as const;

export function AppShell({
  children,
  title,
  action,
  wordmark,
}: {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
  wordmark?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const liquid = useAppStore((s) => s.settings.liquidGlass !== false);
  const dock = useAppStore((s) => s.settings.navStyle === "dock");
  const preset = useAppStore((s) => s.settings.preset);
  const applyPreset = useAppStore((s) => s.applyPreset);
  const night = preset === "night" || preset === "ink";

  return (
    <div className="app-shell flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 bg-bg/88 px-3 py-2 backdrop-blur-md">
        <div className="flex items-center gap-1" dir="ltr">
          <button
            type="button"
            aria-label={night ? "الوضع النهاري" : "الوضع الليلي"}
            className="grid size-11 place-items-center text-fg tap"
            onClick={() => applyPreset(night ? "day" : "night")}
          >
            <MoonIcon />
          </button>
          <h1
            className={cn(
              "min-w-0 flex-1 text-center leading-none",
              wordmark ? "wordmark" : "font-arabic text-xl font-normal",
            )}
          >
            {wordmark ? "أذكار اليوم" : (title ?? "أذكار اليوم")}
          </h1>
          {action}
          {wordmark ? null : (
            <Link to="/search" className="grid size-11 place-items-center text-muted tap" aria-label="بحث">
              <SearchIcon />
            </Link>
          )}
          <Link
            to="/settings"
            aria-label="تخصيص المظهر"
            title="تخصيص"
            className={cn(
              "grid size-11 place-items-center tap",
              pathname.startsWith("/settings") ? "text-accent" : "text-fg",
            )}
          >
            <MenuIcon />
          </Link>
        </div>
      </header>
      <div key={pathname} className="page-enter flex-1 pb-28">
        {children}
      </div>
      <nav className={cn("nav-glass z-30", liquid && "is-liquid", dock ? "is-dock" : "is-float")}>
        <ul className="grid grid-cols-5 items-end px-1">
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <li key={item.to}>
                <Link to={item.to} className={cn("nav-tab", active && "is-on", item.icon === "home" && "is-home")}>
                  <span className="nav-ico" aria-hidden="true">
                    <NavIcon name={item.icon} />
                  </span>
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

function NavIcon({ name }: { name: string }) {
  const p = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true as const };
  if (name === "home") {
    return (
      <svg {...p}>
        <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5z" fill="currentColor" />
      </svg>
    );
  }
  if (name === "book") {
    return (
      <svg {...p}>
        <path d="M5 5h6a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3V5zM19 5h-6a3 3 0 0 0-3 3v12h6a3 3 0 0 0 3-3V5z" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (name === "moon") {
    return (
      <svg {...p}>
        <path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z" fill="currentColor" />
      </svg>
    );
  }
  if (name === "compass") {
    return (
      <svg {...p}>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
        <path d="m14.5 9.5-1.2 4.8-4.8 1.2 1.2-4.8 4.8-1.2z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg {...p}>
      <path d="M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z" fill="currentColor" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16 16.5 20 20.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
