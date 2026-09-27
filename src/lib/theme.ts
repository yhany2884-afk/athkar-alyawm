export type PatternId = "none" | "paper" | "rules" | "mashrabiya" | "geometry";

export type ArabicFontId =
  | "amiri"
  | "naskh"
  | "scheherazade"
  | "cairo"
  | "plex";

export type UiFontId = "cairo" | "plex" | "amiri";

export type NavStyle = "float" | "dock";

export type PresetId =
  | "day"
  | "paper"
  | "white"
  | "night"
  | "ink"
  | "garden"
  | "gold"
  | "sea"
  | "rose"
  | "olive"
  | "custom";

export type ThemeSettings = {
  preset: PresetId;
  bg: string;
  surface: string;
  elevated: string;
  fg: string;
  muted: string;
  accent: string;
  accentFg: string;
  pattern: PatternId;
  patternStrength: number;
  arabicFont: ArabicFontId;
  uiFont: UiFontId;
  dhikrSize: number;
  lineHeight: number;
  showMeaning: boolean;
  showFadl: boolean;
  vibrate: boolean;
  wallpaperId: string;
  wallpaperTint: string;
  wallpaperTintStrength: number;
  wallpaperBrightness: number;
  wallpaperContrast: number;
  wallpaperVeil: number;
  liteMode: boolean;
  liquidGlass: boolean;
  navStyle: NavStyle;
  navDim: number;
  navBlur: number;
  navSpecular: number;
  prayerMethod: "egypt" | "mwl" | "umm" | "karachi";
  cardRound: number;
  uiGen: number;
  clockStyle: "ampm" | "ar";
  homeAdhkar: boolean;
  homeProgress: boolean;
  homeContinue: boolean;
  prayerSky: boolean;
  mark: string;
  animSpeed: number;
};

export type ThemePreset = {
  id: Exclude<PresetId, "custom">;
  name: string;
  bg: string;
  surface: string;
  elevated: string;
  fg: string;
  muted: string;
  accent: string;
  accentFg: string;
};

export const PRESETS: ThemePreset[] = [
  {
    id: "day",
    name: "نهار",
    bg: "#F5F7FB",
    surface: "#E7EEF6",
    elevated: "#FFFFFF",
    fg: "#1C2430",
    muted: "#6C7786",
    accent: "#163A5F",
    accentFg: "#FFFFFF",
  },
  {
    id: "paper",
    name: "ورق",
    bg: "#F6F0E4",
    surface: "#EDE4D4",
    elevated: "#FFF9F0",
    fg: "#2C261E",
    muted: "#7A7164",
    accent: "#9A6B3A",
    accentFg: "#FFF9F0",
  },
  {
    id: "white",
    name: "أبيض",
    bg: "#FBF8F2",
    surface: "#F1EBE1",
    elevated: "#FFFFFF",
    fg: "#2A2620",
    muted: "#7C756A",
    accent: "#5E7A62",
    accentFg: "#FBF8F2",
  },
  {
    id: "night",
    name: "ليلي",
    bg: "#141311",
    surface: "#1C1A17",
    elevated: "#26231E",
    fg: "#EDE6D6",
    muted: "#8E877A",
    accent: "#D7C4A3",
    accentFg: "#141311",
  },
  {
    id: "ink",
    name: "حبر",
    bg: "#111416",
    surface: "#181C20",
    elevated: "#22282E",
    fg: "#E6E8EA",
    muted: "#8B939C",
    accent: "#5B8FA8",
    accentFg: "#111416",
  },
  {
    id: "garden",
    name: "حديقة",
    bg: "#F3F7F2",
    surface: "#E4EEE3",
    elevated: "#FFFFFF",
    fg: "#1C2A22",
    muted: "#6A7A70",
    accent: "#1F6B4A",
    accentFg: "#FFFFFF",
  },
  {
    id: "gold",
    name: "ذهب",
    bg: "#FBF6EA",
    surface: "#F3E8CC",
    elevated: "#FFFCF4",
    fg: "#2C2416",
    muted: "#7A6E58",
    accent: "#8C6239",
    accentFg: "#FFFCF4",
  },
  {
    id: "sea",
    name: "بحر",
    bg: "#F2F7F8",
    surface: "#E1EEEF",
    elevated: "#FFFFFF",
    fg: "#1A2A30",
    muted: "#667880",
    accent: "#0E7490",
    accentFg: "#FFFFFF",
  },
  {
    id: "rose",
    name: "ورد",
    bg: "#FBF4F4",
    surface: "#F3E4E4",
    elevated: "#FFFFFF",
    fg: "#2C1E22",
    muted: "#7C6A70",
    accent: "#8E4B5B",
    accentFg: "#FFFFFF",
  },
  {
    id: "olive",
    name: "زيتون",
    bg: "#F6F5EE",
    surface: "#E8E6D6",
    elevated: "#FFFDF6",
    fg: "#24261C",
    muted: "#6E7264",
    accent: "#5C6B3A",
    accentFg: "#FFFDF6",
  },
];

export const ARABIC_FONTS: { id: ArabicFontId; name: string; stack: string }[] = [
  { id: "amiri", name: "أميري", stack: '"Amiri", "Noto Naskh Arabic", serif' },
  {
    id: "naskh",
    name: "نسخ",
    stack: '"Noto Naskh Arabic", "Amiri", serif',
  },
  {
    id: "scheherazade",
    name: "شهرزاد",
    stack: '"Scheherazade New", "Amiri", serif',
  },
  { id: "cairo", name: "القاهرة", stack: '"Cairo", "IBM Plex Sans Arabic", sans-serif' },
  {
    id: "plex",
    name: "بليكس",
    stack: '"IBM Plex Sans Arabic", "Cairo", sans-serif',
  },
];

export const UI_FONTS: { id: UiFontId; name: string; stack: string }[] = [
  { id: "cairo", name: "القاهرة", stack: '"Cairo", "IBM Plex Sans Arabic", sans-serif' },
  {
    id: "plex",
    name: "بليكس",
    stack: '"IBM Plex Sans Arabic", "Cairo", sans-serif',
  },
  { id: "amiri", name: "أميري", stack: '"Amiri", serif' },
];

export const PATTERNS: { id: PatternId; name: string }[] = [
  { id: "none", name: "سادة" },
  { id: "paper", name: "حبوب ورق" },
  { id: "rules", name: "أسطر" },
  { id: "mashrabiya", name: "مشربية" },
  { id: "geometry", name: "نجمة" },
];

export const DEFAULT_SETTINGS: ThemeSettings = {
  preset: "day",
  bg: "#F5F7FB",
  surface: "#E7EEF6",
  elevated: "#FFFFFF",
  fg: "#1C2430",
  muted: "#6C7786",
  accent: "#163A5F",
  accentFg: "#FFFFFF",
  pattern: "none",
  patternStrength: 8,
  arabicFont: "amiri",
  uiFont: "cairo",
  dhikrSize: 3,
  lineHeight: 2,
  showMeaning: true,
  showFadl: true,
  vibrate: true,
  wallpaperId: "none",
  wallpaperTint: "#9A6B3A",
  wallpaperTintStrength: 16,
  wallpaperBrightness: 100,
  wallpaperContrast: 100,
  wallpaperVeil: 74,
  liteMode: false,
  liquidGlass: true,
  navStyle: "float",
  navDim: 26,
  navBlur: 64,
  navSpecular: 58,
  prayerMethod: "egypt",
  cardRound: 24,
  uiGen: 2,
  clockStyle: "ampm",
  homeAdhkar: true,
  homeProgress: true,
  homeContinue: true,
  prayerSky: true,
  mark: "#1F6B4A",
  animSpeed: 3,
};

export function fontStack(
  id: ArabicFontId | UiFontId,
  kind: "arabic" | "ui",
): string {
  if (kind === "arabic") {
    return ARABIC_FONTS.find((f) => f.id === id)?.stack ?? ARABIC_FONTS[0].stack;
  }
  return UI_FONTS.find((f) => f.id === id)?.stack ?? UI_FONTS[0].stack;
}

export function dhikrFontSize(step: number): string {
  const map = ["1.35rem", "1.6rem", "1.85rem", "2.15rem", "2.5rem"];
  return map[Math.max(0, Math.min(4, step - 1))] ?? map[2];
}

export function isDarkHex(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length < 6) return false;
  const r = Number.parseInt(h.slice(0, 2), 16) / 255;
  const g = Number.parseInt(h.slice(2, 4), 16) / 255;
  const b = Number.parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5;
}

export function applyThemeToDocument(s: ThemeSettings) {
  if (typeof document === "undefined") return;
  const r = document.documentElement;
  r.dir = "rtl";
  r.lang = "ar";
  const dim = s.navDim ?? 26;
  const blur = s.navBlur ?? 64;
  const spec = s.navSpecular ?? 58;
  const glass = s.liquidGlass !== false;
  const motion = [1.7, 1.3, 1, 0.72, 0.45][Math.max(0, Math.min(4, (s.animSpeed ?? 3) - 1))] ?? 1;
  const vars: Record<string, string> = {
    "--color-bg": s.bg,
    "--color-surface": s.surface,
    "--color-elevated": s.elevated,
    "--color-fg": s.fg,
    "--color-muted": s.muted,
    "--color-accent": s.accent,
    "--color-accent-fg": s.accentFg,
    "--color-mark": s.mark || "#1F6B4A",
    "--font-arabic": fontStack(s.arabicFont, "arabic"),
    "--font-ui": fontStack(s.uiFont, "ui"),
    "--dhikr-size": dhikrFontSize(s.dhikrSize),
    "--dhikr-leading": String(s.lineHeight),
    "--pattern-strength": String(s.patternStrength / 100),
    "--wp-b": String(s.wallpaperBrightness / 100),
    "--wp-c": String(s.wallpaperContrast / 100),
    "--wp-tint": s.wallpaperTint,
    "--wp-tint-s": `${s.wallpaperTintStrength}%`,
    "--wp-veil": `${s.liteMode ? 100 : s.wallpaperVeil}%`,
    "--shell-mix":
      s.liteMode || s.wallpaperId === "none"
        ? "100%"
        : `${Math.min(96, s.wallpaperVeil + 8)}%`,
    "--nav-mix": `${Math.round(18 + dim * 0.58)}%`,
    "--nav-shade": `${Math.round(dim * 0.28)}%`,
    "--nav-lift": `${Math.round((100 - dim) * 0.28)}%`,
    "--nav-blur": `${Math.round(12 + blur * 0.36)}px`,
    "--nav-sat": String(1.05 + spec * 0.007),
    "--nav-spec": `${Math.round(18 + spec * 0.55)}%`,
    "--radius-card": `${s.cardRound ?? 24}px`,
    "--motion": String(motion),
  };
  for (const [k, v] of Object.entries(vars)) {
    r.style.setProperty(k, v);
  }
  r.dataset.pattern = s.pattern;
  r.dataset.preset = s.preset;
  r.dataset.glass = glass && !s.liteMode ? "1" : "0";
  r.dataset.nav = s.navStyle === "dock" ? "dock" : "float";
}
