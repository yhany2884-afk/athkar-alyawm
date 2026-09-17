import { useEffect, type ReactNode } from "react";
import { applyThemeToDocument } from "@/lib/theme";
import { useAppStore } from "@/lib/store";
import { PatternBg } from "./pattern-bg";
import { WallpaperLayer } from "./wallpaper-layer";
import { PwaRegister } from "./pwa-register";
import { Splash } from "./splash";

export function ThemeRoot({ children }: { children: ReactNode }) {
  const settings = useAppStore((s) => s.settings);
  const ensureToday = useAppStore((s) => s.ensureToday);
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const setHydrated = useAppStore((s) => s.setHydrated);

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => {
      setHydrated(true);
      useAppStore.getState().ensureToday();
    });
    if (useAppStore.persist.hasHydrated()) {
      setHydrated(true);
      ensureToday();
    }
    return unsub;
  }, [ensureToday, setHydrated]);

  useEffect(() => {
    applyThemeToDocument(settings);
  }, [settings]);

  return (
    <div
      className="relative min-h-dvh"
      data-hydrated={hasHydrated ? "1" : "0"}
      data-lite={settings.liteMode ? "1" : "0"}
    >
      <WallpaperLayer />
      <PatternBg />
      <PwaRegister />
      <Splash />
      <div className="relative z-10 flex w-full justify-center">{children}</div>
    </div>
  );
}