import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function localISODate(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return localISODate(dt);
}

export function hijriLabel(d = new Date()): string {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toLocaleDateString("ar");
  }
}

export function gregorianLabel(d = new Date()): string {
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export type DayPeriod = "morning" | "evening" | "night";

export function dayPeriod(d = new Date()): DayPeriod {
  const h = d.getHours();
  if (h >= 4 && h < 15) return "morning";
  if (h >= 15 && h < 20) return "evening";
  return "night";
}

export function periodGreeting(d = new Date()): { title: string; sub: string } {
  const p = dayPeriod(d);
  if (p === "morning") {
    return { title: "أذكار الصباح", sub: "ابدأ يومك بذكر الله" };
  }
  if (p === "evening") {
    return { title: "أذكار المساء", sub: "اختم نهارك بالحصن" };
  }
  return { title: "أذكار النوم", sub: "نم على وترٍ من الذكر" };
}

export function countLabel(n: number): string {
  if (n === 1) return "مرة واحدة";
  if (n === 2) return "مرتان";
  if (n >= 3 && n <= 10) return `${n} مرات`;
  return `${n} مرة`;
}

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function arNum(n: number | string): string {
  return String(n).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);
}

export function parseArNum(s: string): number | null {
  const t = s
    .trim()
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
