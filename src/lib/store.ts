import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserDhikr } from "@/lib/adhkar/types";
import {
  DEFAULT_SETTINGS,
  PRESETS,
  isDarkHex,
  type ThemeSettings,
  type PresetId,
} from "@/lib/theme";
import { addDays, localISODate } from "@/lib/utils";
import { qiblaBearing } from "@/lib/qibla";

export type CustomPaperMeta = { id: string; name: string };

export type QiblaFix = {
  lat: number;
  lng: number;
  bearing: number;
  at: number;
  label?: string;
};

export type AppState = {
  settings: ThemeSettings;
  progress: Record<string, number>;
  favorites: string[];
  custom: UserDhikr[];
  notes: Record<string, string>;
  streak: number;
  lastDate: string;
  lastSurah: number;
  lastAyah: number;
  papers: CustomPaperMeta[];
  qibla: QiblaFix | null;
  hasHydrated: boolean;
  ensureToday: () => void;
  tick: (id: string, max: number) => void;
  setCount: (id: string, n: number) => void;
  resetOne: (id: string) => void;
  resetAllProgress: () => void;
  toggleFavorite: (id: string) => void;
  setNote: (id: string, note: string) => void;
  applyPreset: (id: PresetId) => void;
  patchSettings: (p: Partial<ThemeSettings>) => void;
  addCustom: (d: Omit<UserDhikr, "id" | "locked">) => string;
  updateCustom: (id: string, p: Partial<UserDhikr>) => void;
  removeCustom: (id: string) => void;
  addPaper: (p: CustomPaperMeta) => void;
  removePaper: (id: string) => void;
  setQibla: (lat: number, lng: number, label?: string) => void;
  setHydrated: (v: boolean) => void;
  setQuranCursor: (surah: number, ayah: number) => void;
};

function todayStamp() {
  return localISODate();
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: { ...DEFAULT_SETTINGS },
      progress: {},
      favorites: [],
      custom: [],
      notes: {},
      streak: 0,
      lastDate: todayStamp(),
      lastSurah: 1,
      lastAyah: 1,
      papers: [],
      qibla: null,
      hasHydrated: false,
      setQuranCursor: (surah, ayah) => set({ lastSurah: surah, lastAyah: ayah }),
      setQibla: (lat, lng, label) =>
        set({
          qibla: {
            lat,
            lng,
            bearing: qiblaBearing(lat, lng),
            at: Date.now(),
            label,
          },
        }),
      addPaper: (p) => set({ papers: [...(get().papers ?? []), p].slice(-8) }),
      removePaper: (id) => {
        const papers = (get().papers ?? []).filter((x) => x.id !== id);
        const wallpaperId =
          get().settings.wallpaperId === `c:${id}`
            ? "none"
            : get().settings.wallpaperId;
        set({
          papers,
          settings: { ...get().settings, wallpaperId },
        });
      },
      setHydrated: (v) => set({ hasHydrated: v }),
      ensureToday: () => {
        const today = todayStamp();
        const { lastDate, progress, streak } = get();
        if (lastDate === today) return;
        const had = Object.values(progress).some((n) => n > 0);
        const yesterday = addDays(today, -1);
        const nextStreak =
          lastDate === yesterday && had ? streak + 1 : had ? 1 : 0;
        set({ lastDate: today, progress: {}, streak: nextStreak });
      },
      tick: (id, max) => {
        get().ensureToday();
        const cur = get().progress[id] ?? 0;
        if (cur >= max) return;
        set({ progress: { ...get().progress, [id]: cur + 1 } });
        if (get().settings.vibrate && !get().settings.liteMode && typeof navigator !== "undefined") {
          try {
            navigator.vibrate?.(cur + 1 >= max ? [12, 40, 12] : 10);
          } catch {
            /* ignore */
          }
        }
      },
      setCount: (id, n) => {
        get().ensureToday();
        set({ progress: { ...get().progress, [id]: Math.max(0, n) } });
      },
      resetOne: (id) => {
        const next = { ...get().progress };
        delete next[id];
        set({ progress: next });
      },
      resetAllProgress: () => set({ progress: {}, streak: 0 }),
      toggleFavorite: (id) => {
        const f = get().favorites;
        set({
          favorites: f.includes(id) ? f.filter((x) => x !== id) : [...f, id],
        });
      },
      setNote: (id, note) => {
        const notes = { ...get().notes };
        if (!note.trim()) delete notes[id];
        else notes[id] = note;
        set({ notes });
      },
      applyPreset: (id) => {
        if (id === "custom") {
          set({ settings: { ...get().settings, preset: "custom" } });
          return;
        }
        const p = PRESETS.find((x) => x.id === id);
        if (!p) return;
        set({
          settings: {
            ...get().settings,
            preset: p.id,
            bg: p.bg,
            surface: p.surface,
            elevated: p.elevated,
            fg: p.fg,
            muted: p.muted,
            accent: p.accent,
            accentFg: p.accentFg,
          },
        });
      },
      patchSettings: (p) => {
        const next = { ...get().settings, ...p };
        const colorKeys = [
          "bg",
          "surface",
          "elevated",
          "fg",
          "muted",
          "accent",
          "accentFg",
        ] as const;
        const touched = colorKeys.some((k) => k in p);
        if (touched) next.preset = "custom";
        set({ settings: next });
      },
      addCustom: (d) => {
        const id = `custom-${Date.now().toString(36)}`;
        const item: UserDhikr = { ...d, id, locked: false };
        set({ custom: [...get().custom, item] });
        return id;
      },
      updateCustom: (id, p) => {
        set({
          custom: get().custom.map((c) =>
            c.id === id ? { ...c, ...p, id: c.id, locked: false } : c,
          ),
        });
      },
      removeCustom: (id) => {
        set({ custom: get().custom.filter((c) => c.id !== id) });
        const progress = { ...get().progress };
        delete progress[id];
        const notes = { ...get().notes };
        delete notes[id];
        set({
          progress,
          notes,
          favorites: get().favorites.filter((x) => x !== id),
        });
      },
    }),
    {
      name: "athkar-yawm-v3",
      partialize: (s) => ({
        settings: s.settings,
        progress: s.progress,
        favorites: s.favorites,
        custom: s.custom,
        notes: s.notes,
        streak: s.streak,
        lastDate: s.lastDate,
        lastSurah: s.lastSurah,
        lastAyah: s.lastAyah,
        papers: s.papers,
        qibla: s.qibla,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.settings = { ...DEFAULT_SETTINGS, ...state.settings };
          if (state.settings.preset === "paper" || state.settings.preset === "white") {
            const p = PRESETS.find((x) => x.id === state.settings.preset);
            if (p) {
              state.settings = {
                ...state.settings,
                bg: p.bg,
                surface: p.surface,
                elevated: p.elevated,
                fg: p.fg,
                muted: p.muted,
                accent: p.accent,
                accentFg: p.accentFg,
              };
            }
          }
          state.papers = state.papers ?? [];
          if (state.qibla) {
            state.qibla = {
              ...state.qibla,
              bearing: qiblaBearing(state.qibla.lat, state.qibla.lng),
            };
          }
          if (isDarkHex(state.settings.bg) && state.settings.preset !== "night" && state.settings.preset !== "ink") {
            state.applyPreset("paper");
            state.patchSettings({ pattern: "none" });
          }
        }
        state?.setHydrated(true);
        state?.ensureToday();
      },
    },
  ),
);

export function progressOf(id: string): number {
  return useAppStore.getState().progress[id] ?? 0;
}

export function isDone(id: string, max: number): boolean {
  return (useAppStore.getState().progress[id] ?? 0) >= max;
}

export function categoryProgress(
  ids: { id: string; count: number }[],
  progress: Record<string, number>,
): { done: number; total: number; pct: number } {
  const total = ids.length;
  const done = ids.filter((d) => (progress[d.id] ?? 0) >= d.count).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}
