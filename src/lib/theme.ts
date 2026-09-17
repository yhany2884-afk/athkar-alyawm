export type PatternId = "none" | "paper" | "rules" | "mashrabiya" | "geometry";

export type ArabicFontId =
  | "amiri"
  | "naskh"
  | "scheherazade"
  | "cairo"
  | "plex";

export type UiFontId = "cairo" | "plex" | "amiri";

export type NavStyle = "float" | "dock";

export type PresetId = "paper" | "white" | "night" | "ink" | "custom";

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
  preset: "paper",
  bg: PRESETS[0].bg,
  surface: PRESETS[0].surface,
  elevated: PRESETS[0].elevated,
  fg: PRESETS[0].fg,
  muted: PRESETS[0].muted,
  accent: PRESETS[0].accent,
  accentFg: PRESETS[0].accentFg,
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
  const vars: Record<string, string> = {
    "--color-bg": s.bg,
    "--color-surface": s.surface,
    "--color-elevated": s.elevated,
    "--color-fg": s.fg,
    "--color-muted": s.muted,
    "--color-accent": s.accent,
    "--color-accent-fg": s.accentFg,
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
  };
  for (const [k, v] of Object.entries(vars)) {
    r.style.setProperty(k, v);
  }
  r.dataset.pattern = s.pattern;
  r.dataset.preset = s.preset;
  r.dataset.glass = glass && !s.liteMode ? "1" : "0";
  r.dataset.nav = s.navStyle === "dock" ? "dock" : "float";
}
